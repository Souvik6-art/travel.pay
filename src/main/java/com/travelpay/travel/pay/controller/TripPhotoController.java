package com.travelpay.travel.pay.controller;

import org.springframework.http.HttpStatus;
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


    // RENAME PHOTO
    @PutMapping("/{photoId}/rename")
    public ResponseEntity<?> renamePhoto(
            @PathVariable Long photoId,
            @RequestParam("fileName") String fileName) {

        TripPhoto photo = tripPhotoRepository.findById(photoId)
                .orElseThrow(() ->
                        new RuntimeException("Photo not found"));

        if (fileName == null || fileName.isBlank()) {
            return ResponseEntity.badRequest()
                    .body("Photo name cannot be empty.");
        }

        String newName = fileName.trim();

        if (newName.length() > 255) {
            return ResponseEntity.badRequest()
                    .body("Photo name must be 255 characters or fewer.");
        }

        photo.setFileName(newName);

        TripPhoto updatedPhoto =
                tripPhotoRepository.save(photo);

        return ResponseEntity.ok(updatedPhoto);
    }


    // DELETE PHOTO
    @DeleteMapping("/{photoId}")
    public ResponseEntity<?> deletePhoto(
            @PathVariable Long photoId) {

        TripPhoto photo = tripPhotoRepository.findById(photoId)
                .orElseThrow(() ->
                        new RuntimeException("Photo not found"));

        try {
            // Resolve only the stored filename, not an arbitrary path.
            Path uploadRoot = uploadDirectory
                    .toAbsolutePath()
                    .normalize();

            String storedFileName =
                    Paths.get(photo.getFilePath())
                            .getFileName()
                            .toString();

            Path imagePath = uploadRoot
                    .resolve(storedFileName)
                    .normalize();

            // Prevent deletion outside the upload directory.
            if (!imagePath.startsWith(uploadRoot)) {
                return ResponseEntity.badRequest()
                        .body("Invalid photo path.");
            }

            // Delete the physical image, then its database record.
            Files.deleteIfExists(imagePath);
            tripPhotoRepository.delete(photo);

            return ResponseEntity.noContent().build();

        } catch (IOException e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Could not delete the photo file.");
        }
    }

}