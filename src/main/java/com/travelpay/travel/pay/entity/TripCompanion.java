
package com.travelpay.travel.pay.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "trip_companions")
public class TripCompanion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private boolean contributor;

    @ManyToOne
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    public TripCompanion() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isContributor() {
        return contributor;
    }

    public void setContributor(boolean contributor) {
        this.contributor = contributor;
    }

    public Trip getTrip() {
        return trip;
    }

    public void setTrip(Trip trip) {
        this.trip = trip;
    }
}
