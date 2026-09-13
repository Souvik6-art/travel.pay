package com.travelpay.travel.pay.controller;

import com.travelpay.travel.pay.entity.Budget;
import com.travelpay.travel.pay.entity.User;
import com.travelpay.travel.pay.entity.Trip;

import com.travelpay.travel.pay.repository.BudgetRepository;
import com.travelpay.travel.pay.repository.UserRepository;
import com.travelpay.travel.pay.repository.TripRepository;
import com.travelpay.travel.pay.repository.ExpenseRepository;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final TripRepository tripRepository;
    private final ExpenseRepository expenseRepository;


    public BudgetController(
            BudgetRepository budgetRepository,
            UserRepository userRepository,
            TripRepository tripRepository,
            ExpenseRepository expenseRepository) {

        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
        this.tripRepository = tripRepository;
        this.expenseRepository = expenseRepository;
    }


    // Create budget for a specific trip
    @PostMapping("/{userId}/{tripId}")
    @ResponseStatus(HttpStatus.CREATED)
    public Budget createBudget(
            @PathVariable Long userId,
            @PathVariable Long tripId,
            @RequestBody Budget budget) {

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


        if (budget.getAmount() <= 0) {
            throw new RuntimeException(
                    "Budget amount must be greater than zero");
        }


        if (budgetRepository.findByTripId(tripId).isPresent()) {
            throw new RuntimeException(
                    "Budget already exists for this trip");
        }


        budget.setUser(user);
        budget.setTrip(trip);


        return budgetRepository.save(budget);
    }


    // Update budget of a specific trip
    @PutMapping("/{userId}/{tripId}")
    public Budget updateBudget(
            @PathVariable Long userId,
            @PathVariable Long tripId,
            @RequestBody Budget budget) {

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new RuntimeException("Trip not found"));


        if (!trip.getUser().getId().equals(userId)) {
            throw new RuntimeException(
                    "Trip does not belong to this user");
        }


        Budget existingBudget =
                budgetRepository.findByTripId(tripId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Budget not found"));


        if (budget.getAmount() <= 0) {
            throw new RuntimeException(
                    "Budget amount must be greater than zero");
        }


        existingBudget.setAmount(budget.getAmount());

        return budgetRepository.save(existingBudget);
    }


    // Get budget of a specific trip
    @GetMapping("/user/{userId}/trip/{tripId}")
    public Budget getBudget(
            @PathVariable Long userId,
            @PathVariable Long tripId) {

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new RuntimeException("Trip not found"));


        if (!trip.getUser().getId().equals(userId)) {
            throw new RuntimeException(
                    "Trip does not belong to this user");
        }


        return budgetRepository.findByTripId(tripId)
                .orElseThrow(() ->
                        new RuntimeException("Budget not found"));
    }


    // Budget summary for a specific trip
    @GetMapping("/user/{userId}/trip/{tripId}/summary")
    public Map<String, Object> getBudgetSummary(
            @PathVariable Long userId,
            @PathVariable Long tripId) {

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new RuntimeException("Trip not found"));


        if (!trip.getUser().getId().equals(userId)) {
            throw new RuntimeException(
                    "Trip does not belong to this user");
        }


        Budget budget =
                budgetRepository.findByTripId(tripId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Budget not found"));


        double totalSpent =
                expenseRepository.getTotalExpensesByTripId(tripId);


        double remainingBudget =
                budget.getAmount() - totalSpent;


        Map<String, Object> summary = new HashMap<>();

        summary.put("totalBudget", budget.getAmount());
        summary.put("totalSpent", totalSpent);
        summary.put("remainingBudget", remainingBudget);


        return summary;
    }
}