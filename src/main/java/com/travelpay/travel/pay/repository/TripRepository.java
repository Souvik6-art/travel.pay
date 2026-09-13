package com.travelpay.travel.pay.repository;

import com.travelpay.travel.pay.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TripRepository extends JpaRepository<Trip, Long> {

    List<Trip> findByUserId(Long userId);

}