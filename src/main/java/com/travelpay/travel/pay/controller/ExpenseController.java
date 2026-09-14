package com.travelpay.travel.pay.controller;

import java.time.LocalDateTime;
import java.util.List;

import com.travelpay.travel.pay.entity.Expense;
import com.travelpay.travel.pay.entity.User;
import com.travelpay.travel.pay.entity.Transaction;
import com.travelpay.travel.pay.entity.Trip;

import com.travelpay.travel.pay.repository.ExpenseRepository;
import com.travelpay.travel.pay.repository.UserRepository;
import com.travelpay.travel.pay.repository.TransactionRepository;
import com.travelpay.travel.pay.repository.TripRepository;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final TripRepository tripRepository;

    public ExpenseController(
            ExpenseRepository expenseRepository,
            UserRepository userRepository,
            TransactionRepository transactionRepository,
            TripRepository tripRepository) {

        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
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

        expense.setUser(user);
        expense.setTrip(trip);
        expense.setExpenseDate(LocalDateTime.now());

        Expense savedExpense =
                expenseRepository.save(expense);

        Transaction transaction = new Transaction();

        transaction.setType("EXPENSE");
        transaction.setAmount(savedExpense.getAmount());
        transaction.setDescription(savedExpense.getTitle());
        transaction.setTransactionDate(savedExpense.getExpenseDate());
        transaction.setUser(user);
        transaction.setTrip(trip);

// Connect transaction to this expense
        transaction.setExpense(savedExpense);

        transactionRepository.save(transaction);

        return savedExpense;
    }

    @PutMapping("/{userId}/{tripId}/{expenseId}")
    public Expense updateExpense(
            @PathVariable Long userId,
            @PathVariable Long tripId,
            @PathVariable Long expenseId,
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

        // Find expense
        Expense existingExpense =
                expenseRepository.findById(expenseId)
                        .orElseThrow(() ->
                                new RuntimeException("Expense not found"));

        // Make sure expense belongs to this user
        if (!existingExpense.getUser().getId().equals(userId)) {
            throw new RuntimeException(
                    "Expense does not belong to this user");
        }

        // Make sure expense belongs to this trip
        if (!existingExpense.getTrip().getId().equals(tripId)) {
            throw new RuntimeException(
                    "Expense does not belong to this trip");
        }

        // Validate amount
        if (expense.getAmount() <= 0) {
            throw new RuntimeException(
                    "Expense amount must be greater than zero");
        }
//*************************************************************************
        existingExpense.setTitle(expense.getTitle());
        existingExpense.setCategory(expense.getCategory());
        existingExpense.setAmount(expense.getAmount());

        Expense updatedExpense =
                expenseRepository.save(existingExpense);

// Find the transaction linked to this expense
        Transaction transaction =
                transactionRepository.findByExpenseId(
                        updatedExpense.getId()
                ).orElse(null);

// Update the transaction
        if (transaction != null) {

            transaction.setAmount(
                    updatedExpense.getAmount()
            );

            transaction.setDescription(
                    updatedExpense.getTitle()
            );

            transactionRepository.save(transaction);
        }

        return updatedExpense;



        //**************************************************
    }


    // update er por delete
    @DeleteMapping("/{userId}/{tripId}/{expenseId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteExpense(
            @PathVariable Long userId,
            @PathVariable Long tripId,
            @PathVariable Long expenseId) {

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

        // Find expense
        Expense existingExpense =
                expenseRepository.findById(expenseId)
                        .orElseThrow(() ->
                                new RuntimeException("Expense not found"));

        // Make sure expense belongs to this user
        if (!existingExpense.getUser().getId().equals(userId)) {
            throw new RuntimeException(
                    "Expense does not belong to this user");
        }

        // Make sure expense belongs to this trip
        if (!existingExpense.getTrip().getId().equals(tripId)) {
            throw new RuntimeException(
                    "Expense does not belong to this trip");
        }

        // Delete expense
        Transaction transaction =
                transactionRepository.findByExpenseId(
                        existingExpense.getId()
                ).orElse(null);

        if (transaction != null) {
            transactionRepository.delete(transaction);
        }

        expenseRepository.delete(existingExpense);
    }


    // Get all expenses of a user
    @GetMapping("/user/{userId}")
    public List<Expense> getUserExpenses(
            @PathVariable Long userId) {

        return expenseRepository.findByUserId(userId);
    }

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
                userId,
                tripId
        );
    }


}