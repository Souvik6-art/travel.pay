/*package com.travelpay.travel.pay.repository;

import com.travelpay.travel.pay.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserId(Long userId);

    List<Transaction> findByUserIdAndTripId(Long userId, Long tripId);

    Optional<Transaction> findByExpenseId(Long expenseId);
}*/
package com.travelpay.travel.pay.repository;

import com.travelpay.travel.pay.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository
        extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserId(Long userId);

    List<Transaction> findByUserIdAndTripId(
            Long userId,
            Long tripId
    );

    Optional<Transaction> findByExpenseId(Long expenseId);

    List<Transaction> findByUserIdAndExpenseIsNull(
            Long userId
    );
}