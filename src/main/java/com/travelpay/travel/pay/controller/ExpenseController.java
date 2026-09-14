package com.travelpay.travel.pay.controller;

import java.time.LocalDateTime;
import java.util.List;

import com.travelpay.travel.pay.entity.Expense;
import com.travelpay.travel.pay.entity.User;
import com.travelpay.travel.pay.entity.Wallet;
import com.travelpay.travel.pay.entity.Transaction;
import com.travelpay.travel.pay.entity.Trip;

import com.travelpay.travel.pay.repository.ExpenseRepository;
import com.travelpay.travel.pay.repository.UserRepository;
import com.travelpay.travel.pay.repository.WalletRepository;
import com.travelpay.travel.pay.repository.TransactionRepository;
import com.travelpay.travel.pay.repository.TripRepository;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final TripRepository tripRepository;


    public ExpenseController(
            ExpenseRepository expenseRepository,
            UserRepository userRepository,
            WalletRepository walletRepository,
            TransactionRepository transactionRepository,
            TripRepository tripRepository) {

        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.tripRepository = tripRepository;
    }


    // Add expense to a specific trip
    @PostMapping("/{userId}/{tripId}")
    @ResponseStatus(HttpStatus.CREATED)
    public Expense addExpense(
            @PathVariable Long userId,
            @PathVariable Long tripId,
            @RequestBody Expense expense) {

        // Find user
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));


        // Find trip
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new RuntimeException("Trip not found"));


        // Make sure trip belongs to this user
        if (!trip.getUser().getId().equals(userId)) {

            throw new RuntimeException(
                    "Trip does not belong to this user");
        }


        // Validate expense amount
        if (expense.getAmount() <= 0) {

            throw new RuntimeException(
                    "Expense amount must be greater than zero");
        }


        // Get user's ONE wallet
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new RuntimeException("Wallet not found"));


        // Check wallet balance
        if (wallet.getBalance() < expense.getAmount()) {

            throw new RuntimeException(
                    "Insufficient wallet balance");
        }


        // Deduct expense from user's wallet
        wallet.setBalance(
                wallet.getBalance() - expense.getAmount());

        walletRepository.save(wallet);


        // Create transaction
        Transaction transaction = new Transaction();

        transaction.setType("EXPENSE");
        transaction.setAmount(expense.getAmount());
        transaction.setDescription(expense.getTitle());
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setUser(user);
        transaction.setTrip(trip);
        transactionRepository.save(transaction);


        // Connect expense with user and trip
        expense.setUser(user);
        expense.setTrip(trip);
        expense.setExpenseDate(LocalDateTime.now());


        // Save expense
        return expenseRepository.save(expense);
    }


    // Get all expenses of a user
    @GetMapping("/user/{userId}")
    public List<Expense> getUserExpenses(
            @PathVariable Long userId) {

        return expenseRepository.findByUserId(userId);
    }
}