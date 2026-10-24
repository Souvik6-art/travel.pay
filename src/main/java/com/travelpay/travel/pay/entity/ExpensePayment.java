
package com.travelpay.travel.pay.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "expense_payments")
public class ExpensePayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expense_id", nullable = false)
    private Expense expense;

    // Null means the trip owner paid.
    // Otherwise, this identifies the companion who paid.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "companion_id")
    private TripCompanion companion;

    @Column(name = "amount_paid", nullable = false)
    private double amountPaid;

    public ExpensePayment() {
    }

    public Long getId() {
        return id;
    }

    public Expense getExpense() {
        return expense;
    }

    public void setExpense(Expense expense) {
        this.expense = expense;
    }

    public TripCompanion getCompanion() {
        return companion;
    }

    public void setCompanion(TripCompanion companion) {
        this.companion = companion;
    }

    public double getAmountPaid() {
        return amountPaid;
    }

    public void setAmountPaid(double amountPaid) {
        this.amountPaid = amountPaid;
    }
}
