package com.qrancae.repository;

<<<<<<< HEAD
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.qrancae.model.Log;

@Repository
public interface LogRepository extends JpaRepository<Log, Integer> {

   @Query("SELECT l FROM Log l JOIN FETCH l.user u JOIN FETCH l.cable c")
   List<Log> findAllWithUserAndCable();
=======
import org.springframework.stereotype.Repository;

@Repository
public interface LogRepository {
	
>>>>>>> 5618cc1f3cef0b6bd4ec0bd39fea2dc648c97072
}
