package com.travelpay.travel.pay.entity;

public class CurrencyConversionResponse {

    private double amount;
    private String from;
    private String to;
    private double convertedAmount;

    public CurrencyConversionResponse() {
    }

    public CurrencyConversionResponse(
            double amount,
            String from,
            String to,
            double convertedAmount) {

        this.amount = amount;
        this.from = from;
        this.to = to;
        this.convertedAmount = convertedAmount;
    }

    public double getAmount() {
        return amount;
    }

    public String getFrom() {
        return from;
    }

    public String getTo() {
        return to;
    }

    public double getConvertedAmount() {
        return convertedAmount;
    }
}
