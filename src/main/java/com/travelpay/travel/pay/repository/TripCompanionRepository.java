
package com.travelpay.travel.pay.repository;

import com.travelpay.travel.pay.entity.TripCompanion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TripCompanionRepository
        extends JpaRepository<TripCompanion, Long> {

    List<TripCompanion> findByTripId(Long tripId);
}
