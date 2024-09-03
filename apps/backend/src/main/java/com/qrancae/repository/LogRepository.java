package com.qrancae.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.qrancae.model.Cable;
import com.qrancae.model.Log;

@Repository
public interface LogRepository extends JpaRepository<Log, Integer> {

   @Query("SELECT l FROM Log l JOIN FETCH l.user u JOIN FETCH l.cable c")
   List<Log> findAllWithUserAndCable();
   
   @Query("SELECT MONTH(l.log_date) AS month, COUNT(l) AS count " +
           "FROM Log l WHERE YEAR(l.log_date) = :year " +
           "GROUP BY MONTH(l.log_date) ORDER BY MONTH(l.log_date)")
   List<Object[]> findMonthlyLogCountsByYear(@Param("year") Integer year);
   
   @Query("SELECT l FROM Log l WHERE l.cable = :cable")
   Log findByCable(@Param("cable") Cable cable);
}
