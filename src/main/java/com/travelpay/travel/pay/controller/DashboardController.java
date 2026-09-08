package com.travelpay.travel.pay.controller;

import com.travelpay.travel.pay.dto.DashboardResponse;
import com.travelpay.travel.pay.entity.Budget;
import com.travelpay.travel.pay.entity.User;
import com.travelpay.travel.pay.entity.Wallet;
import com.travelpay.travel.pay.repository.BudgetRepository;
import com.travelpay.travel.pay.repository.ExpenseRepository;
import com.travelpay.travel.pay.repository.TransactionRepository;
import com.travelpay.travel.pay.repository.UserRepository;
import com.travelpay.travel.pay.repository.WalletRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;
    private final TransactionRepository transactionRepository;

    public DashboardController(
            UserRepository userRepository,
            WalletRepository walletRepository,
            BudgetRepository budgetRepository,
            ExpenseRepository expenseRepository,
            TransactionRepository transactionRepository) {

        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.budgetRepository = budgetRepository;
        this.expenseRepository = expenseRepository;
        this.transactionRepository = transactionRepository;
    }

    @GetMapping("/{userId}")
    public DashboardResponse getDashboard(
            @PathVariable Long userId) {

        // Check user
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Get wallet
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new RuntimeException("Wallet not found"));

        // Get budget
        Budget budget = budgetRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new RuntimeException("Budget not found"));

        // Get total expenses
        double totalExpenses =
                expenseRepository.getTotalExpensesByUserId(userId);

        // Calculate remaining budget
        double remainingBudget =
                budget.getAmount() - totalExpenses;

        // Get transactions
        double totalDeposits = transactionRepository
                .findByUserId(userId)
                .stream()
                .filter(transaction ->
                        "DEPOSIT".equalsIgnoreCase(transaction.getType()))
                .mapToDouble(transaction ->
                        transaction.getAmount())
                .sum();

        double totalTransactionExpenses = transactionRepository
                .findByUserId(userId)
                .stream()
                .filter(transaction ->
                        "EXPENSE".equalsIgnoreCase(transaction.getType()))
                .mapToDouble(transaction ->
                        transaction.getAmount())
                .sum();

        // Create dashboard response
        DashboardResponse response =
                new DashboardResponse();

        response.setWalletBalance(wallet.getBalance());
        response.setTotalBudget(budget.getAmount());
        response.setTotalSpent(totalExpenses);
        response.setRemainingBudget(remainingBudget);
        response.setTotalDeposits(totalDeposits);
        response.setTotalExpenses(totalTransactionExpenses);

        return response;
    }
}
