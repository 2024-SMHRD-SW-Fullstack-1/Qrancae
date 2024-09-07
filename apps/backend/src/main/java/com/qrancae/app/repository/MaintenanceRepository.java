package com.qrancae.app.repository;

import com.qrancae.app.model.MaintApp;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceRepository extends JpaRepository<MaintApp, Integer> {

	// 특정 userId와 유지보수 상태(maintStatus)로 유지보수 항목의 개수를 카운트하는 메서드
	long countByUserIdAndMaintStatus(String userId, String maintStatus);

	// maintUserId(작업자 ID)와 maintStatus(유지보수 상태)를 기준으로 유지보수 항목의 개수를 카운트하는 메서드
	long countByMaintUserIdAndMaintStatus(String maintUserId, String maintStatus);

	// userId 또는 maintUserId를 고려하여 보수완료 상태의 항목 개수를 카운트하는 메서드
	@Query("SELECT COUNT(m) FROM MaintApp m "
			+ "WHERE (m.maintUserId = :userId OR (m.maintUserId IS NULL AND m.userId = :userId)) "
			+ "AND m.maintStatus = '보수완료'")
	long countByUserIdOrMaintUserIdAndMaintStatus(String userId);

	// 특정 cableIdx(케이블 ID)를 기준으로 가장 최근에 유지보수된 항목을 가져오는 메서드
	Optional<MaintApp> findFirstByCableIdxOrderByMaintDateDesc(Integer cableIdx);
	
	Optional<MaintApp> findFirstByCableIdxAndMaintStatusOrderByMaintDateDesc(Integer cableIdx, String maintStatus);


//	// userId와 maintStatus를 기준으로 최신순으로 유지보수 항목을 정렬하여 가져오는 메서드
//	List<MaintApp> findByUserIdAndMaintStatusOrderByMaintDateDesc(String userId, String maintStatus);
//
//	// userId와 maintStatus를 기준으로 오래된 순으로 유지보수 항목을 정렬하여 가져오는 메서드
//	List<MaintApp> findByUserIdAndMaintStatusOrderByMaintDateAsc(String userId, String maintStatus);

//	// userId와 maintStatus를 기준으로 유지보수 항목을 최신순으로 가져오는 메서드 (케이블 정보 포함)
//	@Query("SELECT m, c FROM MaintApp m LEFT JOIN CableApp c ON m.cableIdx = c.cableIdx "
//			+ "WHERE m.userId = :userId AND m.maintStatus = :maintStatus " + "ORDER BY m.maintDate DESC")
//	Page<Object[]> findByUserIdAndMaintStatusOrderByMaintDateDesc(String userId, String maintStatus, Pageable pageable);

	// 특정 userId와 cableIdx를 기준으로 가장 최근의 유지보수 항목을 가져오는 메서드
	Optional<MaintApp> findFirstByUserIdAndCableIdxOrderByMaintDateDesc(String userId, Integer cableIdx);

//	// userId 또는 maintUserId를 기준으로 유지보수 항목을 상태별 우선순위로 정렬하여 최신순으로 가져오는 메서드 (케이블 정보
//	// 포함)
//	@Query("SELECT m, c FROM MaintApp m LEFT JOIN CableApp c ON m.cableIdx = c.cableIdx "
//			+ "WHERE m.userId = :userId OR m.maintUserId = :userId " + "ORDER BY CASE m.maintStatus "
//			+ "WHEN '점검중' THEN 1 " + "WHEN '신규접수' THEN 2 " + "WHEN '보수완료' THEN 3 " + "ELSE 4 END, "
//			+ "m.maintDate DESC")
//	Page<Object[]> findAllWithCableInfoByUserWithPriorityDesc(String userId, Pageable pageable);
//
//	// userId 또는 maintUserId를 기준으로 유지보수 항목을 상태별 우선순위로 정렬하여 최신순으로 가져오는 메서드 (케이블 정보
//	// 포함)
//	@Query("SELECT m, c FROM MaintApp m LEFT JOIN CableApp c ON m.cableIdx = c.cableIdx "
//			+ "WHERE m.userId = :userId OR m.maintUserId = :userId " + "ORDER BY CASE m.maintStatus "
//			+ "WHEN '점검중' THEN 1 " + "WHEN '신규접수' THEN 2 " + "WHEN '보수완료' THEN 3 " + "ELSE 4 END, "
//			+ "m.maintDate DESC")
//	Page<Object[]> findAllByUserWithPriorityDesc(@Param("userId") String userId, Pageable pageable);

	// 전체 항목탭 로직
	@Query("SELECT m, c FROM MaintApp m LEFT JOIN CableApp c ON m.cableIdx = c.cableIdx "
			+ "WHERE (m.userId = :userId OR m.maintUserId = :userId) " + "AND (m.maintStatus != '보수완료' OR "
			+ "(m.maintStatus = '보수완료' AND (m.maintUserId IS NULL AND m.userId = :userId) OR m.maintUserId = :userId)) "
			+ "AND (m.maintStatus != '점검중' OR (m.maintStatus = '점검중' AND m.maintUserId = :userId)) " // 점검 중 필터 추가
			+ "ORDER BY CASE m.maintStatus WHEN '점검중' THEN 1 WHEN '신규접수' THEN 2 WHEN '보수완료' THEN 3 ELSE 4 END, m.maintDate DESC")
	Page<Object[]> findAllWithCableInfoByUserWithPriority(@Param("userId") String userId, Pageable pageable);

	// 신규접수 탭 로직
	@Query("SELECT m, c FROM MaintApp m LEFT JOIN CableApp c ON m.cableIdx = c.cableIdx "
			+ "WHERE m.userId = :userId AND m.maintStatus = :status ORDER BY m.maintDate ASC")
	Page<Object[]> findByUserIdAndStatus(@Param("userId") String userId, @Param("status") String status,
			Pageable pageable);

	// 점검 탭 로직
	@Query("SELECT m, c FROM MaintApp m LEFT JOIN CableApp c ON m.cableIdx = c.cableIdx "
			+ "WHERE m.maintUserId = :userId AND m.maintStatus = :status")
	Page<Object[]> findByMaintUserIdAndStatus(@Param("userId") String userId, @Param("status") String status,
			Pageable pageable);

	// 보수완료 탭 로직
	@Query("SELECT m, c FROM MaintApp m LEFT JOIN CableApp c ON m.cableIdx = c.cableIdx "
			+ "WHERE (m.maintUserId = :userId OR (m.maintUserId IS NULL AND m.userId = :userId)) "
			+ "AND m.maintStatus = '보수완료' " + "ORDER BY m.maintDate DESC")
	Page<Object[]> findCompletedMaintenanceTasks(@Param("userId") String userId, Pageable pageable);
}
