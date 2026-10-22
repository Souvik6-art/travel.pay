
package com.travelpay.travel.pay.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

import com.travelpay.travel.pay.entity.Expense;
import com.travelpay.travel.pay.entity.ExpensePayment;
import com.travelpay.travel.pay.entity.Trip;
import com.travelpay.travel.pay.entity.TripCompanion;
import com.travelpay.travel.pay.entity.Transaction;
import com.travelpay.travel.pay.entity.User;

import com.travelpay.travel.pay.repository.ExpensePaymentRepository;
import com.travelpay.travel.pay.repository.ExpenseRepository;
import com.travelpay.travel.pay.repository.TransactionRepository;
import com.travelpay.travel.pay.repository.TripCompanionRepository;
import com.travelpay.travel.pay.repository.TripRepository;
import com.travelpay.travel.pay.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final TripRepository tripRepository;
    private final TripCompanionRepository companionRepository;
    private final ExpensePaymentRepository paymentRepository;

    public ExpenseController(
            ExpenseRepository expenseRepository,
            UserRepository userRepository,
            TransactionRepository transactionRepository,
            TripRepository tripRepository,
            TripCompanionRepository companionRepository,
            ExpensePaymentRepository paymentRepository) {

        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.tripRepository = tripRepository;
        this.companionRepository = companionRepository;
        this.paymentRepository = paymentRepository;
    }

    // Add expense
    @PostMapping("/{userId}/{tripId}")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public Expense addExpense(
            @PathVariable Long userId,
            @PathVariable Long tripId,
            @RequestBody Expense expense) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new RuntimeException("Trip not found"));

        if (!trip.getUser().getId().equals(userId)) {
            throw new RuntimeException(
                    "Trip does not belong to this user");
        }

        if (expense.getAmount() <= 0) {
            throw new RuntimeException(
                    "Expense amount must be greater than zero");
        }

        String mode = normalizePaymentMode(expense.getPaymentMode());
        expense.setPaymentMode(mode);

        if ("COMPANION".equals(mode)) {
            Long companionId = validateContributorCompanion(
                    expense.getContributorCompanionId(),
                    tripId);

            expense.setContributorCompanionId(companionId);
        } else {
            expense.setContributorCompanionId(null);
        }

        expense.setUser(user);
        expense.setTrip(trip);
        expense.setExpenseDate(LocalDateTime.now());

        Expense savedExpense = expenseRepository.save(expense);

        savePaymentRecords(savedExpense, trip);

        Transaction transaction = new Transaction();
        transaction.setType("EXPENSE");
        transaction.setAmount(savedExpense.getAmount());
        transaction.setDescription(savedExpense.getTitle());
        transaction.setTransactionDate(savedExpense.getExpenseDate());
        transaction.setUser(user);
        transaction.setTrip(trip);
        transaction.setExpense(savedExpense);

        transactionRepository.save(transaction);

        return savedExpense;
    }

    // Update expense
    @PutMapping("/{userId}/{tripId}/{expenseId}")
    @Transactional
    public Expense updateExpense(
            @PathVariable Long userId,
            @PathVariable Long tripId,
            @PathVariable Long expenseId,
            @RequestBody Expense expense) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new RuntimeException("Trip not found"));

        if (!trip.getUser().getId().equals(userId)) {
            throw new RuntimeException(
                    "Trip does not belong to this user");
        }

        Expense existingExpense = expenseRepository.findById(expenseId)
                .orElseThrow(() ->
                        new RuntimeException("Expense not found"));

        if (!existingExpense.getUser().getId().equals(userId)) {
            throw new RuntimeException(
                    "Expense does not belong to this user");
        }

        if (!existingExpense.getTrip().getId().equals(tripId)) {
            throw new RuntimeException(
                    "Expense does not belong to this trip");
        }

        if (expense.getAmount() <= 0) {
            throw new RuntimeException(
                    "Expense amount must be greater than zero");
        }

        String mode = normalizePaymentMode(expense.getPaymentMode());

        if ("COMPANION".equals(mode)) {
            existingExpense.setContributorCompanionId(
                    validateContributorCompanion(
                            expense.getContributorCompanionId(),
                            tripId));
        } else {
            existingExpense.setContributorCompanionId(null);
        }

        existingExpense.setPaymentMode(mode);
        existingExpense.setTitle(expense.getTitle());
        existingExpense.setCategory(expense.getCategory());
        existingExpense.setAmount(expense.getAmount());

        Expense updatedExpense =
                expenseRepository.save(existingExpense);

        // Replace the payment records using the updated amount and mode.
        savePaymentRecords(updatedExpense, trip);

        Transaction transaction =
                transactionRepository.findByExpenseId(
                        updatedExpense.getId()).orElse(null);

        if (transaction != null) {
            transaction.setAmount(updatedExpense.getAmount());
            transaction.setDescription(updatedExpense.getTitle());
            transactionRepository.save(transaction);
        }

        return updatedExpense;
    }

    // Delete expense
    @DeleteMapping("/{userId}/{tripId}/{expenseId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void deleteExpense(
            @PathVariable Long userId,
            @PathVariable Long tripId,
            @PathVariable Long expenseId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new RuntimeException("Trip not found"));

        if (!trip.getUser().getId().equals(userId)) {
            throw new RuntimeException(
                    "Trip does not belong to this user");
        }

        Expense existingExpense = expenseRepository.findById(expenseId)
                .orElseThrow(() ->
                        new RuntimeException("Expense not found"));

        if (!existingExpense.getUser().getId().equals(userId)) {
            throw new RuntimeException(
                    "Expense does not belong to this user");
        }

        if (!existingExpense.getTrip().getId().equals(tripId)) {
            throw new RuntimeException(
                    "Expense does not belong to this trip");
        }

        // Delete payment records first.
        paymentRepository.deleteByExpenseId(existingExpense.getId());

        Transaction transaction =
                transactionRepository.findByExpenseId(
                        existingExpense.getId()).orElse(null);

        if (transaction != null) {
            transactionRepository.delete(transaction);
        }

        expenseRepository.delete(existingExpense);
    }

    // Get all expenses for a user
    @GetMapping("/user/{userId}")
    public List<Expense> getUserExpenses(
            @PathVariable Long userId) {

        return expenseRepository.findByUserId(userId);
    }

    // Get expenses for a particular trip
    @GetMapping("/user/{userId}/trip/{tripId}")
    public List<Expense> getTripExpenses(
            @PathVariable Long userId,
            @PathVariable Long tripId) {

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new RuntimeException("Trip not found"));

        if (!trip.getUser().getId().equals(userId)) {
            throw new RuntimeException(
                    "Trip does not belong to this user");
        }

        return expenseRepository.findByUserIdAndTripId(
                userId, tripId);
    }

    // Validate the payment mode
    private String normalizePaymentMode(String paymentMode) {

        if (paymentMode == null || paymentMode.isBlank()) {
            return "OWNER";
        }

        String mode = paymentMode.toUpperCase(Locale.ROOT);

        if (!List.of("OWNER", "COMPANION", "ALL_EQUAL")
                .contains(mode)) {
            throw new RuntimeException("Invalid payment mode");
        }

        return mode;
    }

    // Validate that a selected companion belongs to this trip
    // and is marked as a contributor.
    private Long validateContributorCompanion(
            Long companionId,
            Long tripId) {

        if (companionId == null) {
            throw new RuntimeException(
                    "Select a contributor for this expense");
        }

        TripCompanion companion =
                companionRepository.findById(companionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Contributor not found"));

        if (companion.getTrip() == null
                || !companion.getTrip().getId().equals(tripId)) {
            throw new RuntimeException(
                    "Contributor does not belong to this trip");
        }

        if (!companion.isContributor()) {
            throw new RuntimeException(
                    "This companion is not marked as a contributor");
        }

        return companion.getId();
    }

    // Save individual payment records for an expense
    private void savePaymentRecords(Expense expense, Trip trip) {

        paymentRepository.deleteByExpenseId(expense.getId());

        String mode = normalizePaymentMode(expense.getPaymentMode());

        if ("OWNER".equals(mode)) {

            ExpensePayment payment = new ExpensePayment();
            payment.setExpense(expense);
            payment.setCompanion(null);
            payment.setAmountPaid(expense.getAmount());

            paymentRepository.save(payment);

        } else if ("COMPANION".equals(mode)) {

            Long companionId = validateContributorCompanion(
                    expense.getContributorCompanionId(),
                    trip.getId());

            TripCompanion companion =
                    companionRepository.findById(companionId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Contributor not found"));

            ExpensePayment payment = new ExpensePayment();
            payment.setExpense(expense);
            payment.setCompanion(companion);
            payment.setAmountPaid(expense.getAmount());

            paymentRepository.save(payment);

        } else if ("ALL_EQUAL".equals(mode)) {

            List<TripCompanion> contributors =
                    companionRepository.findByTripId(trip.getId())
                            .stream()
                            .filter(TripCompanion::isContributor)
                            .toList();

            int participantCount = contributors.size() + 1;

            // Round each share to cents.
            long totalCents = Math.round(expense.getAmount() * 100);
            long baseCents = totalCents / participantCount;
            long remainderCents = totalCents % participantCount;

            // Owner's payment record.
            ExpensePayment ownerPayment = new ExpensePayment();
            ownerPayment.setExpense(expense);
            ownerPayment.setCompanion(null);
            ownerPayment.setAmountPaid(
                    (baseCents + remainderCents) / 100.0);

            paymentRepository.save(ownerPayment);

            // Each contributor pays an equal base amount.
            // Any leftover cents are assigned to the owner.
            for (TripCompanion companion : contributors) {
                ExpensePayment payment = new ExpensePayment();
                payment.setExpense(expense);
                payment.setCompanion(companion);
                payment.setAmountPaid(baseCents / 100.0);

                paymentRepository.save(payment);
            }
        }
    }
}
