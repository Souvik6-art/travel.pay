package com.travelpay.travel.pay.controller;
import java.time.LocalDateTime;
import com.travelpay.travel.pay.entity.Expense;
import com.travelpay.travel.pay.entity.User;
import com.travelpay.travel.pay.entity.Wallet;
import com.travelpay.travel.pay.repository.ExpenseRepository;
import com.travelpay.travel.pay.repository.UserRepository;
import com.travelpay.travel.pay.repository.WalletRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import com.travelpay.travel.pay.entity.Transaction;
import com.travelpay.travel.pay.repository.TransactionRepository;


import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    public ExpenseController(ExpenseRepository expenseRepository,
                             UserRepository userRepository, WalletRepository walletRepository,TransactionRepository transactionRepository) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
        this.walletRepository =walletRepository ;
        this.transactionRepository = transactionRepository;

    }

    @PostMapping("/{userId}")
    @ResponseStatus(HttpStatus.CREATED)
    public Expense addExpense(
            @PathVariable Long userId,
            @RequestBody Expense expense) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (expense.getAmount() <= 0) {
            throw new RuntimeException("Expense amount must be greater than zero");
        }
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new RuntimeException("Wallet not found"));

        if (wallet.getBalance() < expense.getAmount()) {
            throw new RuntimeException( "Insufficient wallet balance"); }


        // wallet theke expense amount deduct kora holo ...
        wallet.setBalance(
                wallet.getBalance() - expense.getAmount() );
        walletRepository.save(wallet);

        Transaction transaction = new Transaction();
        transaction.setType("EXPENSE");
        transaction.setAmount(expense.getAmount());
        transaction.setDescription(expense.getTitle());
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setUser(user);
        transactionRepository.save(transaction);


        expense.setUser(user);
             expense.setExpenseDate(LocalDateTime.now());
        return expenseRepository.save(expense);
    }

    @GetMapping("/user/{userId}")
    public List<Expense> getUserExpenses(@PathVariable Long userId) {

        return expenseRepository.findByUserId(userId);
    }
}
























