package com.travelpay.travel.pay.repository;

import com.travelpay.travel.pay.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUserId(Long userId);
    List<Expense> findByUserIdAndTripId(Long userId, Long tripId);
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user.id = :userId")
    double getTotalExpensesByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.trip.id = :tripId")
    double getTotalExpensesByTripId(@Param("tripId") Long tripId);

    @Query("""
        SELECT e.category, COALESCE(SUM(e.amount), 0)
        FROM Expense e
        WHERE e.user.id = :userId
        GROUP BY e.category
        """)
    List<Object[]> getSpendingByCategory(@Param("userId") Long userId);

    @Query("""
        SELECT e.category, COALESCE(SUM(e.amount), 0)
        FROM Expense e
        WHERE e.trip.id = :tripId
        GROUP BY e.category
        """)
    List<Object[]> getSpendingByCategoryForTrip(@Param("tripId") Long tripId);

    @Query("""
        SELECT MONTH(e.expenseDate),
               COALESCE(SUM(e.amount), 0)
        FROM Expense e
        WHERE e.user.id = :userId
          AND e.expenseDate IS NOT NULL
        GROUP BY MONTH(e.expenseDate)
        ORDER BY MONTH(e.expenseDate)
        """)
    List<Object[]> getMonthlySpending(@Param("userId") Long userId);

    @Query("""
    SELECT MONTH(e.expenseDate),
           COALESCE(SUM(e.amount), 0)
    FROM Expense e
    WHERE e.trip.id = :tripId
      AND e.expenseDate IS NOT NULL
    GROUP BY MONTH(e.expenseDate)
    ORDER BY MONTH(e.expenseDate)
    """)
    List<Object[]> getMonthlySpendingForTrip(@Param("tripId") Long tripId);
}