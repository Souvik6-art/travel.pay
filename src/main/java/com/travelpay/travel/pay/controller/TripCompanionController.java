
package com.travelpay.travel.pay.controller;

import com.travelpay.travel.pay.entity.Trip;
import com.travelpay.travel.pay.entity.TripCompanion;
import com.travelpay.travel.pay.repository.TripCompanionRepository;
import com.travelpay.travel.pay.repository.TripRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trip-companions")
public class TripCompanionController {

    private final TripCompanionRepository companionRepository;
    private final TripRepository tripRepository;

    public TripCompanionController(
            TripCompanionRepository companionRepository,
            TripRepository tripRepository) {
        this.companionRepository = companionRepository;
        this.tripRepository = tripRepository;
    }

    @PostMapping("/{tripId}")
    @ResponseStatus(HttpStatus.CREATED)
    public TripCompanion addCompanion(
            @PathVariable Long tripId,
            @RequestBody TripCompanion companion) {

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new RuntimeException("Trip not found"));

        if (companion.getName() == null ||
                companion.getName().isBlank()) {
            throw new RuntimeException(
                    "Companion name is required");
        }

        companion.setName(companion.getName().trim());
        companion.setTrip(trip);

        return companionRepository.save(companion);
    }

    @GetMapping("/trip/{tripId}")
    public List<TripCompanion> getTripCompanions(
            @PathVariable Long tripId) {

        tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new RuntimeException("Trip not found"));

        return companionRepository.findByTripId(tripId);
    }
}
