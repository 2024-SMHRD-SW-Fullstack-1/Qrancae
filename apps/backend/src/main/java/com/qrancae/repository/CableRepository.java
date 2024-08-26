package com.qrancae.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.qrancae.model.Cable;

@Repository
public interface CableRepository extends JpaRepository<Cable, Integer>{
	
	@Query("SELECT MAX(c.cable_idx) FROM Cable c")
	Integer findMaxCableIdx();
	
	@Query("SELECT c FROM Cable c LEFT JOIN FETCH c.qr")
	List<Cable> findAllWithQr();
	
}
