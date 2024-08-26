package com.qrancae.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.qrancae.model.Log;

@Repository
public interface LogRepository extends JpaRepository<Log, Integer> {

   @Query("SELECT l FROM Log l JOIN FETCH l.user u JOIN FETCH l.cable c")
   List<Log> findAllWithUserAndCable();
}
