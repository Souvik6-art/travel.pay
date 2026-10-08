package com.travelpay.travel.pay.controller;

import com.travelpay.travel.pay.entity.Trip;
import com.travelpay.travel.pay.entity.TripPhoto;
import com.travelpay.travel.pay.repository.TripPhotoRepository;
import com.travelpay.travel.pay.repository.TripRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/trip-photos")
@CrossOrigin
public class TripPhotoController {

    private final TripPhotoRepository tripPhotoRepository;
    private final TripRepository tripRepository;

    private final Path uploadDirectory =
            Paths.get("uploads/trips");

    public TripPhotoController(
            TripPhotoRepository tripPhotoRepository,
            TripRepository tripRepository) {

        this.tripPhotoRepository = tripPhotoRepository;
        this.tripRepository = tripRepository;
    }

    /* =========================================
       GET PHOTOS FOR A TRIP
       ========================================= */

    @GetMapping("/trip/{tripId}")
    public List<TripPhoto> getPhotosByTrip(
            @PathVariable Long tripId) {

        return tripPhotoRepository.findByTripId(tripId);
    }


    /* =========================================
       UPLOAD PHOTO
       ========================================= */

    @PostMapping("/upload/{tripId}")
    public ResponseEntity<?> uploadPhoto(
            @PathVariable Long tripId,
            @RequestParam("file") MultipartFile file) {

        try {

            // Check trip
            Trip trip = tripRepository.findById(tripId)
                    .orElseThrow(() ->
                            new RuntimeException("Trip not found")
                    );

            // Check file
            if (file.isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body("Please select a photo.");
            }

            // Create upload directory
            Files.createDirectories(uploadDirectory);

            // Generate unique filename
            String originalFileName =
                    file.getOriginalFilename();

            String fileExtension = "";

            if (originalFileName != null &&
                    originalFileName.contains(".")) {

                fileExtension =
                        originalFileName.substring(
                                originalFileName.lastIndexOf(".")
                        );
            }

            String storedFileName =
                    UUID.randomUUID() + fileExtension;

            // Save physical file
            Path filePath =
                    uploadDirectory.resolve(storedFileName);

            Files.copy(
                    file.getInputStream(),
                    filePath
            );

            // Save database information
            TripPhoto tripPhoto =
                    new TripPhoto();

            tripPhoto.setFileName(originalFileName);
            tripPhoto.setFilePath(
                    "/uploads/trips/" + storedFileName
            );
            tripPhoto.setTrip(trip);

            TripPhoto savedPhoto =
                    tripPhotoRepository.save(tripPhoto);

            return ResponseEntity.ok(savedPhoto);

        } catch (IOException e) {

            return ResponseEntity
                    .internalServerError()
                    .body("Failed to upload photo.");

        }
    }
}