package com.travelpay.travel.pay.controller;

import com.travelpay.travel.pay.entity.Trip;
import com.travelpay.travel.pay.entity.User;
import com.travelpay.travel.pay.repository.TripRepository;
import com.travelpay.travel.pay.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    public TripController(TripRepository tripRepository,
                          UserRepository userRepository) {

        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
    }


    // Create a new trip
    @PostMapping("/{userId}")
    @ResponseStatus(HttpStatus.CREATED)
    public Trip createTrip(
            @PathVariable Long userId,
            @RequestBody Trip trip) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (trip.getTripName() == null ||
                trip.getTripName().isBlank()) {

            throw new RuntimeException(
                    "Trip name is required");
        }

        if (trip.getDestination() == null ||
                trip.getDestination().isBlank()) {

            throw new RuntimeException(
                    "Destination is required");
        }

        if (trip.getStartDate() == null ||
                trip.getEndDate() == null) {

            throw new RuntimeException(
                    "Start date and end date are required");
        }

        if (trip.getEndDate().isBefore(trip.getStartDate())) {

            throw new RuntimeException(
                    "End date cannot be before start date");
        }

        trip.setUser(user);

        trip.setStatus("PLANNED");

        return tripRepository.save(trip);
    }


    // Get all trips of a user
    @GetMapping("/user/{userId}")
    public List<Trip> getUserTrips(
            @PathVariable Long userId) {

        userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return tripRepository.findByUserId(userId);
    }


    // Get one trip
    @GetMapping("/{tripId}")
    public Trip getTrip(
            @PathVariable Long tripId) {

        return tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new RuntimeException("Trip not found"));
    }
}