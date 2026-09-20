        package com.travelpay.travel.pay.controller;

import com.travelpay.travel.pay.entity.User;
import com.travelpay.travel.pay.entity.Transaction;
import com.travelpay.travel.pay.entity.Wallet;

import com.travelpay.travel.pay.repository.ExpenseRepository;
import com.travelpay.travel.pay.repository.UserRepository;
import com.travelpay.travel.pay.repository.TransactionRepository;
import com.travelpay.travel.pay.repository.WalletRepository;
import com.travelpay.travel.pay.repository.BudgetRepository;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final BudgetRepository budgetRepository;
    public ReportController(
            ExpenseRepository expenseRepository,
            UserRepository userRepository,
            TransactionRepository transactionRepository,
            WalletRepository walletRepository,BudgetRepository budgetRepository) {

        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.walletRepository = walletRepository;
        this.budgetRepository =budgetRepository;
    }

    // User-wide category spending
    @GetMapping("/user/{userId}/category")
    public Map<String, Double> getSpendingByCategory(
            @PathVariable Long userId) {

        userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        List<Object[]> results =
                expenseRepository.getSpendingByCategory(userId);

        Map<String, Double> spendingByCategory =
                new LinkedHashMap<>();

        for (Object[] result : results) {

            String category = (String) result[0];
            Double amount = ((Number) result[1]).doubleValue();

            spendingByCategory.put(category, amount);
        }

        return spendingByCategory;
    }

    // Trip-specific category spending
    @GetMapping("/user/{userId}/trip/{tripId}/category")
    public Map<String, Double> getTripSpendingByCategory(
            @PathVariable Long userId,
            @PathVariable Long tripId) {

        userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        List<Object[]> results =
                expenseRepository.getSpendingByCategoryForTrip(tripId);

        Map<String, Double> spendingByCategory =
                new LinkedHashMap<>();

        for (Object[] result : results) {

            String category = (String) result[0];
            Double amount = ((Number) result[1]).doubleValue();

            spendingByCategory.put(category, amount);
        }

        return spendingByCategory;
    }

    // User-wide monthly spending
    @GetMapping("/user/{userId}/monthly")
    public Map<Integer, Double> getMonthlySpending(
            @PathVariable Long userId) {

        System.out.println("MONTHLY ENDPOINT HIT: " + userId);

        userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        List<Object[]> results =
                expenseRepository.getMonthlySpending(userId);

        Map<Integer, Double> monthlySpending =
                new LinkedHashMap<>();

        for (Object[] result : results) {

            Integer month = ((Number) result[0]).intValue();
            Double amount = ((Number) result[1]).doubleValue();

            monthlySpending.put(month, amount);
        }

        return monthlySpending;
    }

    @GetMapping("/user/{userId}/trip/{tripId}/summary")
    public Map<String, Double> getTripFinancialSummary(
            @PathVariable Long userId,
            @PathVariable Long tripId) {

        userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        double totalBudget =
                budgetRepository.findByTripId(tripId)
                        .orElseThrow(() ->
                                new RuntimeException("Budget not found"))
                        .getAmount();

        double totalSpent =
                expenseRepository.getTotalExpensesByTripId(tripId);

        double remainingBudget =
                totalBudget - totalSpent;

        Map<String, Double> summary = new LinkedHashMap<>();

        summary.put("totalBudget", totalBudget);
        summary.put("totalSpent", totalSpent);
        summary.put("remainingBudget", remainingBudget);

        return summary;
    }


    @GetMapping("/user/{userId}/trip/{tripId}/monthly")
    public Map<Integer, Double> getTripMonthlySpending(
            @PathVariable Long userId,
            @PathVariable Long tripId) {

        userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        List<Object[]> results =
                expenseRepository.getMonthlySpendingForTrip(tripId);

        Map<Integer, Double> monthlySpending =
                new LinkedHashMap<>();

        for (Object[] result : results) {

            Integer month = ((Number) result[0]).intValue();
            Double amount = ((Number) result[1]).doubleValue();

            monthlySpending.put(month, amount);
        }

        return monthlySpending;
    }

    // User-wide financial summary
    @GetMapping("/user/{userId}/summary")
    public Map<String, Double> getFinancialSummary(
            @PathVariable Long userId) {

        userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new RuntimeException("Wallet not found"));

        List<Transaction> transactions =
                transactionRepository.findByUserId(userId);

        double totalDeposits = transactions.stream()
                .filter(transaction ->
                        "DEPOSIT".equalsIgnoreCase(transaction.getType()))
                .mapToDouble(Transaction::getAmount)
                .sum();

        double totalExpenses = transactions.stream()
                .filter(transaction ->
                        "EXPENSE".equalsIgnoreCase(transaction.getType()))
                .mapToDouble(Transaction::getAmount)
                .sum();

        double netCashFlow = totalDeposits - totalExpenses;

        Map<String, Double> summary = new LinkedHashMap<>();

        summary.put("totalDeposits", totalDeposits);
        summary.put("totalExpenses", totalExpenses);
        summary.put("netCashFlow", netCashFlow);
        summary.put("walletBalance", wallet.getBalance());

        return summary;
    }


    @GetMapping("/user/{userId}/trip-totals")
    public Map<String, Double> getTripWiseExpenses(
            @PathVariable Long userId) {

        userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        List<Object[]> results =
                expenseRepository.getTotalExpensesByTrip(userId);

        Map<String, Double> tripTotals =
                new LinkedHashMap<>();

        for (Object[] row : results) {

            String tripName = (String) row[1];
            Double total = ((Number) row[2]).doubleValue();

            tripTotals.put(tripName, total);
        }

        return tripTotals;
    }

}

