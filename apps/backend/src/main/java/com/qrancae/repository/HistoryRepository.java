package com.qrancae.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.qrancae.model.History;

@Repository
public interface HistoryRepository extends JpaRepository<History, Integer> {

	// 올해의 케이블 포설 히스토리 개수
	@Query("SELECT COUNT(h) FROM History h WHERE FUNCTION('YEAR', h.connect_date) = FUNCTION('YEAR', CURRENT_DATE)")
	int countConnectDateThisYear();

	// 올해의 케이블 제거 히스토리 개수
	@Query("SELECT COUNT(h) FROM History h WHERE FUNCTION('YEAR', h.remove_date) = FUNCTION('YEAR', CURRENT_DATE)")
	int countRemoveDateThisYear();

	// 이번달 케이블 포설 및 제거 히스토리
	@Query("SELECT h FROM History h WHERE "
			+ "(FUNCTION('MONTH', h.connect_date) = FUNCTION('MONTH', CURRENT_DATE) AND FUNCTION('YEAR', h.connect_date) = FUNCTION('YEAR', CURRENT_DATE)) "
			+ "OR (FUNCTION('MONTH', h.remove_date) = FUNCTION('MONTH', CURRENT_DATE) AND FUNCTION('YEAR', h.remove_date) = FUNCTION('YEAR', CURRENT_DATE)) "
			+ "ORDER BY h.cable_idx ASC")
	List<History> findAllByCurrentMonth();
}
