
package com.travelpay.travel.pay.repository;

import com.travelpay.travel.pay.entity.ExpensePayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpensePaymentRepository
        extends JpaRepository<ExpensePayment, Long> {

    // Get all payment records for a specific expense
    List<ExpensePayment> findByExpenseId(Long expenseId);

    // Delete all payment records linked to a specific expense
    void deleteByExpenseId(Long expenseId);
}
