package com.travelpay.travel.pay.entity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public class CurrencyConversionRequest {

    @Positive(message = "Amount must be greater than zero")
    private double amount;

    @NotBlank(message = "From currency is required")
    private String from;

    @NotBlank(message = "To currency is required")
    private String to;

    public CurrencyConversionRequest() {
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }
}