package com.travelpay.travel.pay.repository;



import com.travelpay.travel.pay.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

}


