package com.travelpay.travel.pay.controller;
import com.travelpay.travel.pay.entity.DepositRequest;
import com.travelpay.travel.pay.entity.DepositRequest;
import com.travelpay.travel.pay.entity.User;
import com.travelpay.travel.pay.entity.Wallet;
import com.travelpay.travel.pay.repository.UserRepository;
import com.travelpay.travel.pay.repository.WalletRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import com.travelpay.travel.pay.entity.Transaction;
import com.travelpay.travel.pay.repository.TransactionRepository;

@RestController
@RequestMapping("/api/wallets")
public class WalletController {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    public WalletController(WalletRepository walletRepository,
                            UserRepository userRepository,
                            TransactionRepository transactionRepository) {
        this.walletRepository = walletRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }

    @PostMapping("/{userId}")
    @ResponseStatus(HttpStatus.CREATED)
    public Wallet createWallet(@PathVariable Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (walletRepository.findByUserId(userId).isPresent()) {
            throw new RuntimeException("Wallet already exists for this user");
        }

        Wallet wallet = new Wallet();
        wallet.setUser(user);
        wallet.setBalance(0);

        return walletRepository.save(wallet);
    }



    // Deposit Money

    @PostMapping("/{walletId}/deposit")
    public Wallet depositMoney(
            @PathVariable Long walletId,
            @RequestBody DepositRequest request) {

        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() ->
                        new RuntimeException("Wallet not found"));

        if (request.getAmount() <= 0) {
            throw new RuntimeException("Deposit amount must be greater than zero");
        }

        wallet.setBalance(wallet.getBalance() + request.getAmount());

        walletRepository.save(wallet);

        Transaction transaction = new Transaction();

        transaction.setType("DEPOSIT");
        transaction.setAmount(request.getAmount());
        transaction.setDescription("Wallet deposit");
        transaction.setTransactionDate(java.time.LocalDateTime.now());
        transaction.setUser(wallet.getUser());

        transactionRepository.save(transaction);

        return wallet;


    }
  //*************************************////

    @GetMapping("/{walletId}")
    public Wallet getWallet(@PathVariable Long walletId) {

        return walletRepository.findById(walletId)
                .orElseThrow(() ->
                        new RuntimeException("Wallet not found"));
    }
}
