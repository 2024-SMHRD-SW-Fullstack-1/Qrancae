package com.qrancae.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.qrancae.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, String>{

}
