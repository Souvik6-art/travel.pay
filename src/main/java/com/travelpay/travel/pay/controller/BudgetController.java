package com.travelpay.travel.pay.controller;

import com.travelpay.travel.pay.entity.Budget;
import com.travelpay.travel.pay.entity.User;
import com.travelpay.travel.pay.repository.BudgetRepository;
import com.travelpay.travel.pay.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import com.travelpay.travel.pay.repository.ExpenseRepository;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;

    public BudgetController(BudgetRepository budgetRepository,
                            UserRepository userRepository,ExpenseRepository expenseRepository) {

        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
        this.expenseRepository = expenseRepository;

    }

    @PostMapping("/{userId}")
    @ResponseStatus(HttpStatus.CREATED)
    public Budget createBudget(
            @PathVariable Long userId,
            @RequestBody Budget budget) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (budget.getAmount() <= 0) {
            throw new RuntimeException(
                    "Budget amount must be greater than zero");
        }

        if (budgetRepository.findByUserId(userId).isPresent()) {
            throw new RuntimeException(
                    "Budget already exists for this user");
        }

        budget.setUser(user);

        return budgetRepository.save(budget);
    }

    @GetMapping("/user/{userId}")
    public Budget getBudget(@PathVariable Long userId) {

        return budgetRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new RuntimeException("Budget not found"));
    }



    // adding method inside controller
    @GetMapping("/user/{userId}/summary")
    public Map<String, Object> getBudgetSummary(@PathVariable Long userId) {

        Budget budget = budgetRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new RuntimeException("Budget not found"));

        double totalSpent =
                expenseRepository.getTotalExpensesByUserId(userId);

        double remainingBudget =
                budget.getAmount() - totalSpent;

        Map<String, Object> summary = new HashMap<>();

        summary.put("totalBudget", budget.getAmount());
        summary.put("totalSpent", totalSpent);
        summary.put("remainingBudget", remainingBudget);

        return summary;
    }

}