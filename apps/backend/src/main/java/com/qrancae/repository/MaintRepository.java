package com.qrancae.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.RequestParam;

import com.qrancae.model.Cable;
import com.qrancae.model.Maint;
import com.qrancae.model.User;

import jakarta.transaction.Transactional;

@Repository
public interface MaintRepository extends JpaRepository<Maint, Integer> {

	@Query("SELECT m FROM Maint m JOIN FETCH m.user u ORDER BY m.maint_date DESC")
	List<Maint> findAllWithUser();

	@Query("SELECT u FROM User u WHERE u.user_type = 'U'")
	List<User> findAllUsers();
	
	// 불량인 보수 내역
	@Query("SELECT m FROM Maint m JOIN FETCH m.user u WHERE m.maint_qr = '불량' OR m.maint_cable = '불량' OR m.maint_power = '불량' ORDER BY m.maint_date DESC")
	List<Maint> findAllWithUserAndFaults();

	// 신규 알림 내역
	@Query("SELECT m FROM Maint m WHERE DATE(m.maint_date) = CURRENT_DATE AND m.maintUser IS NULL")
	List<Maint> findByMaintDateAndMaintUserIsNull();

	// 유지보수에 처리 작업자 추가하기
	@Modifying
	@Transactional
	@Query("UPDATE Maint m SET m.maintUser.user_id = :userId, m.maint_status = '진행중' WHERE m.maint_idx = :maintIdx")
	int updateMaintUser(@Param("maintIdx") int maintIdx, @Param("userId") String userId);

	/* 오늘의 점검 */
	// - 이번주 전체 점검 내역
	@Query("SELECT m FROM Maint m WHERE FUNCTION('DATE', m.maint_date) = FUNCTION('DATE', CURRENT_DATE)")
	List<Maint> findMaintsForToday();

	// - 신규 내역
	@Query("SELECT COUNT(m) FROM Maint m WHERE DATE(m.maint_date) = CURRENT_DATE AND m.maint_status = '신규접수'")
	int countByMaintDateAndMaintUserIsNull();

	// - 진행 중
	@Query("SELECT COUNT(m) FROM Maint m WHERE DATE(m.maint_date) = CURRENT_DATE AND m.maintUser IS NOT NULL AND m.maint_status = '점검중'")
	int countByMaintUserIsNotNullAndMaintUpdateIsNull();

	// - 보수 완료
	@Query("SELECT COUNT(m) FROM Maint m WHERE DATE(m.maint_date) = CURRENT_DATE AND m.maintUser IS NOT NULL AND m.maint_status = '보수완료' AND m.maint_update IS NOT NULL")
	int countByMaintUserIsNotNullAndMaintUpdateIsNotNull();

	// - 보수 완료한 작업자의 수
	@Query("SELECT COUNT(DISTINCT m.maintUser.user_id) FROM Maint m WHERE DATE(m.maint_date) = CURRENT_DATE AND m.maint_status = '보수완료' AND m.maintUser IS NOT NULL")
	int countDistinctMaintUserIdsForCompletedMaintenance();

	/* 이번주 점검 */
	// - QR 불량
	@Query("SELECT COUNT(m) FROM Maint m " + "WHERE FUNCTION('YEAR', m.maint_date) = FUNCTION('YEAR', CURRENT_DATE) "
			+ "AND FUNCTION('WEEK', m.maint_date) = FUNCTION('WEEK', CURRENT_DATE) " + "AND m.maint_qr = '불량'")
	int countDefectiveQrThisWeek();

	// - 케이블 불량
	@Query("SELECT COUNT(m) FROM Maint m " + "WHERE FUNCTION('YEAR', m.maint_date) = FUNCTION('YEAR', CURRENT_DATE) "
			+ "AND FUNCTION('WEEK', m.maint_date) = FUNCTION('WEEK', CURRENT_DATE) " + "AND m.maint_cable = '불량'")
	int countDefectiveCableThisWeek();

	// - 전력 공급 불량
	@Query("SELECT COUNT(m) FROM Maint m " + "WHERE FUNCTION('YEAR', m.maint_date) = FUNCTION('YEAR', CURRENT_DATE) "
			+ "AND FUNCTION('WEEK', m.maint_date) = FUNCTION('WEEK', CURRENT_DATE) " + "AND m.maint_power = '불량'")
	int countDefectivePowerThisWeek();

	/* 이달의 케이블 점검 */
	// - 이달의 전체 유지보수 내역
	@Query("SELECT COUNT(DISTINCT m.cable) FROM Maint m "
			+ "WHERE FUNCTION('MONTH', m.maint_date) = FUNCTION('MONTH', CURRENT_DATE) "
			+ "AND FUNCTION('YEAR', m.maint_date) = FUNCTION('YEAR', CURRENT_DATE)")
	int countDistinctCablesThisMonth();

	// - 보수 완료
	@Query("SELECT COUNT(DISTINCT m.cable) FROM Maint m " + "WHERE m.maint_status = '보수완료' "
			+ "AND FUNCTION('MONTH', m.maint_date) = FUNCTION('MONTH', CURRENT_DATE) "
			+ "AND FUNCTION('YEAR', m.maint_date) = FUNCTION('YEAR', CURRENT_DATE)")
	int countDistinctCablesCompletedThisMonth();

	// - 보수 완료한 작업자의 수
	@Query("SELECT COUNT(DISTINCT m.maintUser.user_id) " + "FROM Maint m " + "WHERE m.maint_status = '보수완료' "
			+ "AND m.maintUser IS NOT NULL " + "AND FUNCTION('MONTH', m.maint_date) = FUNCTION('MONTH', CURRENT_DATE) "
			+ "AND FUNCTION('YEAR', m.maint_date) = FUNCTION('YEAR', CURRENT_DATE)")
	int countDistinctMaintUserIdsForCompletedMaintenanceMonth();

	/* 케이블 불량률 */
	// 케이블을 하나로 카운트하여 s_rack_number의 불량 수 체크
	@Query("SELECT c.s_rack_number AS rackNumber, COUNT(DISTINCT m.cable.cable_idx) AS defectCount "
	        + "FROM Maint m JOIN m.cable c "
	        + "WHERE (m.maint_qr = '불량' OR m.maint_cable = '불량' OR m.maint_power = '불량') "
	        + "AND YEAR(m.maint_date) = :year " + "AND MONTH(m.maint_date) = :month " + "GROUP BY c.s_rack_number")
	List<Object[]> countDefectsBySourceRackNumber(@Param("year") Integer year, @Param("month") Integer month);

	// d_rack_number 불량 수
	@Query("SELECT c.d_rack_number AS rackNumber, COUNT(DISTINCT m.cable.cable_idx) AS defectCount "
	        + "FROM Maint m JOIN m.cable c "
	        + "WHERE (m.maint_qr = '불량' OR m.maint_cable = '불량' OR m.maint_power = '불량') "
	        + "AND YEAR(m.maint_date) = :year " + "AND MONTH(m.maint_date) = :month " + "GROUP BY c.d_rack_number")
	List<Object[]> countDefectsByDestinationRackNumber(@Param("year") Integer year, @Param("month") Integer month);

	@Query("SELECT m FROM Maint m WHERE m.cable = :cable")
	Maint findByCable(@Param("cable") Cable cable);

	/* 작업자별 점검 현황 */
	@Query("SELECT m FROM Maint m " + "WHERE m.user.user_id = :user_id "
			+ "AND FUNCTION('MONTH', m.maint_date) = FUNCTION('MONTH', CURRENT_DATE) "
			+ "AND FUNCTION('YEAR', m.maint_date) = FUNCTION('YEAR', CURRENT_DATE)")
	List<Maint> countRepairThisMonthForUser(@Param("user_id") String userId);

	// 5초마다 한번씩 maint에 새로운게 올라왔는지 확인
	@Query("SELECT m FROM Maint m WHERE m.maint_date > :lastCheckTime "
			+ "AND (m.maint_qr = '불량' OR m.maint_cable = '불량' OR m.maint_power = '불량')")
	List<Maint> findByMaintUpdateAfter(LocalDateTime lastCheckTime);

	// 보수 완료된 작업 내역을 해당 작업자의 user_id로 카운트
	@Query("SELECT COUNT(m) FROM Maint m WHERE m.maintUser.user_id = :userId AND m.maint_status = '보수완료'")
	int countCompletedMaintenanceByUser(@Param("userId") String userId);

	@Query("SELECT COUNT(m) FROM Maint m " + "WHERE m.maintUser.user_id = :userId " + "AND m.maint_status = '보수완료' "
			+ "AND (m.maint_qr = '불량' OR m.maint_cable = '불량' OR m.maint_power = '불량')")
	int countCompletedMaintenanceByUserWithDefectiveItems(@Param("userId") String userId);
	
	// maintIdxs로 해당 cable_idx 가져오기
	@Query("SELECT DISTINCT m.cable.cable_idx FROM Maint m WHERE m.maint_idx IN :maintIdxs")
    List<Integer> findCableIdxsByMaintIdxs(@Param("maintIdxs") List<Integer> maintIdxs);
	
	// 날짜 범위에 맞는 유지보수 내역
	@Query("SELECT m FROM Maint m JOIN FETCH m.user u WHERE m.maint_date BETWEEN :startDate AND :endDate ORDER BY m.maint_date DESC")
	List<Maint> findAllWithUserAndDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

}