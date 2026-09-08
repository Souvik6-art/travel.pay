package com.travelpay.travel.pay.controller;

import com.travelpay.travel.pay.entity.User;
import com.travelpay.travel.pay.repository.ExpenseRepository;
import com.travelpay.travel.pay.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.travelpay.travel.pay.entity.Transaction;
import com.travelpay.travel.pay.entity.Wallet;
import com.travelpay.travel.pay.repository.TransactionRepository;
import com.travelpay.travel.pay.repository.WalletRepository;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    //recent add kora holo..
    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;

    public ReportController(ExpenseRepository expenseRepository,
                            UserRepository userRepository , TransactionRepository transactionRepository,
                            WalletRepository walletRepository) {

        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;

        this.transactionRepository = transactionRepository;
        this.walletRepository = walletRepository;
    }

    @GetMapping("/user/{userId}/category")
    public Map<String, Double> getSpendingByCategory(
            @PathVariable Long userId) {

        User user = userRepository.findById(userId)
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

    // monthly expense pawa jabe...

    @GetMapping("/user/{userId}/monthly")
    public Map<Integer, Double> getMonthlySpending(
            @PathVariable Long userId) {

        System.out.println("MONTHLY ENDPOINT HIT: " + userId);

        User user = userRepository.findById(userId)
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

    // Summary dewa jabe ekhan theke

    @GetMapping("/user/{userId}/summary")
    public Map<String, Double> getFinancialSummary(
            @PathVariable Long userId) {

        User user = userRepository.findById(userId)
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



}