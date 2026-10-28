
package com.travelpay.travel.pay.controller;

import com.travelpay.travel.pay.entity.Expense;
import com.travelpay.travel.pay.entity.ExpensePayment;
import com.travelpay.travel.pay.entity.Trip;
import com.travelpay.travel.pay.entity.TripCompanion;
import com.travelpay.travel.pay.repository.ExpensePaymentRepository;
import com.travelpay.travel.pay.repository.ExpenseRepository;
import com.travelpay.travel.pay.repository.TripCompanionRepository;
import com.travelpay.travel.pay.repository.TripRepository;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@RestController
@RequestMapping("/api/trips")
public class SettlementController {

    private final TripRepository tripRepository;
    private final ExpenseRepository expenseRepository;
    private final TripCompanionRepository companionRepository;
    private final ExpensePaymentRepository paymentRepository;

    public SettlementController(
            TripRepository tripRepository,
            ExpenseRepository expenseRepository,
            TripCompanionRepository companionRepository,
            ExpensePaymentRepository paymentRepository) {
        this.tripRepository = tripRepository;
        this.expenseRepository = expenseRepository;
        this.companionRepository = companionRepository;
        this.paymentRepository = paymentRepository;
    }

    @GetMapping("/{tripId}/settlement")
    public Map<String, Object> getSettlement(@PathVariable Long tripId) {

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Trip not found"));

        // Owner is always a participant.
        List<Participant> participants = new ArrayList<>();
        participants.add(new Participant(
                0L, trip.getUser().getId(),
                trip.getUser().getName()));

        // Only companions marked as contributors participate.
        for (TripCompanion companion :
                companionRepository.findByTripId(tripId)) {

            if (companion.isContributor()) {
                participants.add(new Participant(
                        companion.getId(),
                        companion.getId(),
                        companion.getName()));
            }
        }

        List<Expense> expenses = expenseRepository.findByTripId(tripId);

        if (participants.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "No participants found");
        }

        long totalCents = 0L;

        for (Expense expense : expenses) {
            totalCents += toCents(expense.getAmount());
        }

        // Split total expense fairly, including any leftover cents.
        long baseShare = totalCents / participants.size();
        long extraCents = totalCents % participants.size();

        for (int i = 0; i < participants.size(); i++) {
            Participant p = participants.get(i);
            p.shareCents = baseShare + (i < extraCents ? 1 : 0);
        }

        // Calculate actual payments from ExpensePayment records.
        for (Expense expense : expenses) {
            List<ExpensePayment> payments =
                    paymentRepository.findByExpenseId(expense.getId());

            if (!payments.isEmpty()) {
                for (ExpensePayment payment : payments) {
                    long paid = toCents(payment.getAmountPaid());

                    if (payment.getCompanion() == null) {
                        participants.get(0).paidCents += paid;
                    } else {
                        Long companionId = payment.getCompanion().getId();

                        participants.stream()
                                .filter(p -> p.companionId != null
                                        && p.companionId.equals(companionId))
                                .findFirst()
                                .ifPresent(p -> p.paidCents += paid);
                    }
                }
            } else {
                // Fallback for older expenses without payment records.
                String mode = expense.getPaymentMode();

                if ("COMPANION".equalsIgnoreCase(mode)
                        && expense.getContributorCompanionId() != null) {

                    Long payerId = expense.getContributorCompanionId();

                    participants.stream()
                            .filter(p -> p.companionId != null
                                    && p.companionId.equals(payerId))
                            .findFirst()
                            .ifPresent(p ->
                                    p.paidCents += toCents(expense.getAmount()));

                } else if ("ALL_EQUAL".equalsIgnoreCase(mode)) {

                    long amount = toCents(expense.getAmount());
                    long share = amount / participants.size();
                    long remainder = amount % participants.size();

                    for (int i = 0; i < participants.size(); i++) {
                        participants.get(i).paidCents +=
                                share + (i < remainder ? 1 : 0);
                    }

                } else {
                    participants.get(0).paidCents +=
                            toCents(expense.getAmount());
                }
            }
        }

        // Positive balance = gets money back.
        // Negative balance = needs to pay.
        for (Participant p : participants) {
            p.balanceCents = p.paidCents - p.shareCents;
        }

        List<Map<String, Object>> participantResults = new ArrayList<>();

        for (Participant p : participants) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("name", p.name);
            row.put("totalPaid", money(p.paidCents));
            row.put("equalShare", money(p.shareCents));
            row.put("netBalance", money(p.balanceCents));
            row.put("status", p.balanceCents > 0 ? "GETS_BACK"
                    : p.balanceCents < 0 ? "OWES" : "SETTLED");

            participantResults.add(row);
        }

        // Match people who owe money with people who should receive it.
        List<Participant> debtors = new ArrayList<>();
        List<Participant> creditors = new ArrayList<>();

        for (Participant p : participants) {
            if (p.balanceCents < 0) debtors.add(p);
            if (p.balanceCents > 0) creditors.add(p);
        }

        List<Map<String, Object>> settlements = new ArrayList<>();
        int debtorIndex = 0;
        int creditorIndex = 0;

        while (debtorIndex < debtors.size()
                && creditorIndex < creditors.size()) {

            Participant debtor = debtors.get(debtorIndex);
            Participant creditor = creditors.get(creditorIndex);

            long amount = Math.min(
                    -debtor.balanceCents,
                    creditor.balanceCents);

            if (amount > 0) {
                Map<String, Object> transfer = new LinkedHashMap<>();
                transfer.put("from", debtor.name);
                transfer.put("to", creditor.name);
                transfer.put("amount", money(amount));
                settlements.add(transfer);
            }

            debtor.balanceCents += amount;
            creditor.balanceCents -= amount;

            if (debtor.balanceCents == 0) debtorIndex++;
            if (creditor.balanceCents == 0) creditorIndex++;
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("tripId", tripId);
        response.put("totalExpense", money(totalCents));
        response.put("participants", participantResults);
        response.put("settlements", settlements);

        return response;
    }

    private long toCents(double amount) {
        return BigDecimal.valueOf(amount)
                .setScale(2, RoundingMode.HALF_UP)
                .movePointRight(2)
                .longValueExact();
    }

    private BigDecimal money(long cents) {
        return BigDecimal.valueOf(cents, 2);
    }

    private static class Participant {
        private final Long companionId;
        private final Long userId;
        private final String name;

        private long paidCents;
        private long shareCents;
        private long balanceCents;

        private Participant(Long companionId, Long userId, String name) {
            this.companionId = companionId;
            this.userId = userId;
            this.name = name;
        }
    }
}
