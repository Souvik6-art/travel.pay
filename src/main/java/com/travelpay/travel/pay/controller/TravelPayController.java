package com.travelpay.travel.pay.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController

public class TravelPayController {
    @GetMapping("/api/hello")
    public String hello() {
        return "Welcome to TravelPay!";
    }

}
