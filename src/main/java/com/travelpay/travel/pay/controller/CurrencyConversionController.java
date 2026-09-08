/*package com.travelpay.travel.pay.controller;

import com.travelpay.travel.pay.entity.CurrencyConversionRequest;
import com.travelpay.travel.pay.service.CurrencyConversionService;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/currency")
public class CurrencyConversionController {

    private final CurrencyConversionService currencyConversionService;

    public CurrencyConversionController(
            CurrencyConversionService currencyConversionService) {

        this.currencyConversionService = currencyConversionService;
    }

    @PostMapping("/convert")
    public Map<String, Object> convertCurrency(
            @Valid @RequestBody CurrencyConversionRequest request) {

        double convertedAmount =
                currencyConversionService.convert(request);

        return Map.of(
                "amount", request.getAmount(),
                "from", request.getFrom().toUpperCase(),
                "to", request.getTo().toUpperCase(),
                "convertedAmount", convertedAmount
        );
    }
}*/



package com.travelpay.travel.pay.controller;

import com.travelpay.travel.pay.entity.CurrencyConversionRequest;
import com.travelpay.travel.pay.entity.CurrencyConversionResponse;
import com.travelpay.travel.pay.service.CurrencyConversionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/currency")
public class CurrencyConversionController {

    private final CurrencyConversionService currencyConversionService;

    public CurrencyConversionController(
            CurrencyConversionService currencyConversionService) {

        this.currencyConversionService = currencyConversionService;
    }

    @PostMapping("/convert")
    public CurrencyConversionResponse convertCurrency(
            @Valid @RequestBody CurrencyConversionRequest request) {

        double convertedAmount =
                currencyConversionService.convert(request);

        return new CurrencyConversionResponse(
                request.getAmount(),
                request.getFrom().toUpperCase(),
                request.getTo().toUpperCase(),
                convertedAmount
        );
    }
}
