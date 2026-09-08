package com.travelpay.travel.pay.service;

import com.travelpay.travel.pay.entity.CurrencyConversionRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class CurrencyConversionService {

    private final RestClient restClient;

    public CurrencyConversionService() {
        this.restClient = RestClient.create();
    }

    public double convert(CurrencyConversionRequest request) {

        String from = request.getFrom().toUpperCase();
        String to = request.getTo().toUpperCase();

        double amount = request.getAmount();

        String url = "https://api.frankfurter.dev/v2/rate/"
                + from + "/" + to;

        Map<String, Object> response = restClient.get()
                .uri(url)
                .retrieve()
                .body(Map.class);

        double rate = ((Number) response.get("rate")).doubleValue();

        return amount * rate;
    }
}