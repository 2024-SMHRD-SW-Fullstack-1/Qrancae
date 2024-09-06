package com.qrancae.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.qrancae.model.Cable;

import jakarta.transaction.Transactional;

@Repository
public interface CableRepository extends JpaRepository<Cable, Integer> {

	@Query("SELECT MAX(c.cable_idx) FROM Cable c")
	Integer findMaxCableIdx();

	@Query("SELECT c FROM Cable c LEFT JOIN FETCH c.qr q ORDER BY "
			+ "CASE WHEN q.qr_status = 'X' THEN 0 ELSE 1 END, c.id DESC")
	List<Cable> findAllWithQr();

	@Query("SELECT c FROM Cable c WHERE c.cable_idx = :cableIdx")
	Cable findByCableIdx(@Param("cableIdx") Integer cableIdx);

	/* 랙 위치당 케이블의 수 */
	// - source rack location
	@Query("SELECT c.s_rack_location AS rackLocation, COUNT(c) AS cableCount " + "FROM Cable c "
			+ "GROUP BY c.s_rack_location")
	List<Object[]> countCablesBySourceRackLocation();

	// - destination rack location
	@Query("SELECT c.d_rack_location AS rackLocation, COUNT(c) AS cableCount " + "FROM Cable c "
			+ "GROUP BY c.d_rack_location")
	List<Object[]> countCablesByDestinationRackLocation();

	// 해당 idx의 케이블 삭제
	@Modifying
	@Transactional
	@Query("DELETE FROM Cable c WHERE c.cable_idx IN :cableIdxList")
	void deleteByCableIdxIn(List<Integer> cableIdxList);
}
