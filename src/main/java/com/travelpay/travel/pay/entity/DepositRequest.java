package com.travelpay.travel.pay.entity;

public class DepositRequest {

    private double amount;

    private String description;

    public DepositRequest() {
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}