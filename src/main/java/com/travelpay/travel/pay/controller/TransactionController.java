package com.travelpay.travel.pay.controller;

import com.travelpay.travel.pay.entity.Transaction;
import com.travelpay.travel.pay.entity.User;
import com.travelpay.travel.pay.repository.TransactionRepository;
import com.travelpay.travel.pay.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public TransactionController(TransactionRepository transactionRepository,
                                 UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/{userId}")
    @ResponseStatus(HttpStatus.CREATED)
    public Transaction createTransaction(
            @PathVariable Long userId,
            @RequestBody Transaction transaction) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        transaction.setUser(user);
        transaction.setTransactionDate(LocalDateTime.now());

        return transactionRepository.save(transaction);
    }

    @GetMapping("/user/{userId}")
    public List<Transaction> getUserTransactions(
            @PathVariable Long userId) {

        return transactionRepository.findByUserId(userId);
    }
}
