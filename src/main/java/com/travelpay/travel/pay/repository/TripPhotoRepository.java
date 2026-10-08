package com.travelpay.travel.pay.repository;

import com.travelpay.travel.pay.entity.TripPhoto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TripPhotoRepository
        extends JpaRepository<TripPhoto, Long> {

    List<TripPhoto> findByTripId(Long tripId);
}
