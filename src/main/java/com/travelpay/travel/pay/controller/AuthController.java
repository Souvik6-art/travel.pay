package com.travelpay.travel.pay.controller;

import com.travelpay.travel.pay.entity.LoginRequest;
import com.travelpay.travel.pay.entity.User;
import com.travelpay.travel.pay.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    public Map<String, Object> login(
            @RequestBody LoginRequest loginRequest) {

        User user = userRepository
                .findByEmail(loginRequest.getEmail())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "Invalid email or password"
                        ));

        String submittedPassword = loginRequest.getPassword();
        String storedPassword = user.getPassword();

        boolean passwordMatches =
                passwordEncoder.matches(submittedPassword, storedPassword);

        // Gradually migrate old plain-text passwords.
        if (!passwordMatches && storedPassword.equals(submittedPassword)) {

            user.setPassword(passwordEncoder.encode(submittedPassword));
            userRepository.save(user);

            passwordMatches = true;
        }

        if (!passwordMatches) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password"
            );
        }

        Map<String, Object> response = new HashMap<>();

        response.put("message", "Login successful");
        response.put("userId", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());

        return response;
    }
}