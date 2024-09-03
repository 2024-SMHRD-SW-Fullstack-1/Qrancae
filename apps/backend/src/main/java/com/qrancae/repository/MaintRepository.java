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

	// 처리 작업자, 날짜 업데이트
//   @Modifying
//   @Transactional
//   @Query("UPDATE Maint m SET m.maintUser.user_id = :userId, m.maint_update = :maintUpdate "
//         + "WHERE m.maint_idx = :maintIdx")
//   int updateMaint(@Param("maintIdx") int maintIdx, 
//                  @Param("userId") String userId, 
//                  @Param("maintUpdate") LocalDateTime maintUpdate);

	// 유지보수에 처리 작업자 추가하기
	@Modifying
	@Transactional
	@Query("UPDATE Maint m SET m.maintUser.user_id = :userId WHERE m.maint_idx = :maintIdx")
	int updateMaintUser(@Param("maintIdx") int maintIdx, @Param("userId") String userId);

	/* 오늘의 점검 */
	// - 신규 내역
	@Query("SELECT COUNT(m) FROM Maint m WHERE DATE(m.maint_date) = CURRENT_DATE AND m.maintUser IS NULL")
	int countByMaintDateAndMaintUserIsNull();

	// - 진행 중
	@Query("SELECT COUNT(m) FROM Maint m WHERE DATE(m.maint_date) = CURRENT_DATE AND m.maintUser IS NOT NULL AND m.maint_update IS NULL")
	int countByMaintUserIsNotNullAndMaintUpdateIsNull();

	// - 보수 완료
	@Query("SELECT COUNT(m) FROM Maint m WHERE DATE(m.maint_date) = CURRENT_DATE AND m.maintUser IS NOT NULL AND m.maint_update IS NOT NULL")
	int countByMaintUserIsNotNullAndMaintUpdateIsNotNull();

	// - 보수 완료한 작업자의 수
	@Query("SELECT COUNT(DISTINCT m.maintUser.user_id) FROM Maint m WHERE DATE(m.maint_date) = CURRENT_DATE AND m.maint_status = '보수완료' AND m.maintUser IS NOT NULL")
	int countDistinctMaintUserIdsForCompletedMaintenance();

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
	// s_rack_location 불량 수
	@Query("SELECT c.s_rack_location AS rackLocation, COUNT(m) AS defectCount " + "FROM Maint m JOIN m.cable c "
			+ "WHERE m.maint_qr = '불량' " + "AND YEAR(m.maint_date) = :year " + "AND MONTH(m.maint_date) = :month "
			+ "GROUP BY c.s_rack_location")
	List<Object[]> countDefectsBySourceRackLocation(@Param("year") Integer year, @Param("month") Integer month);

	// d_rack_location 불량 수
	@Query("SELECT c.d_rack_location AS rackLocation, COUNT(m) AS defectCount " + "FROM Maint m JOIN m.cable c "
			+ "WHERE m.maint_qr = '불량' " + "AND YEAR(m.maint_date) = :year " + "AND MONTH(m.maint_date) = :month "
			+ "GROUP BY c.d_rack_location")
	List<Object[]> countDefectsByDestinationRackLocation(@Param("year") Integer year, @Param("month") Integer month);

	@Query("SELECT m FROM Maint m WHERE m.cable = :cable")
	Maint findByCable(@Param("cable") Cable cable);

	/* 작업자별 점검 현황 */
	@Query("SELECT m FROM Maint m " +
		       "WHERE m.user.user_id = :user_id " +
		       "AND FUNCTION('MONTH', m.maint_date) = FUNCTION('MONTH', CURRENT_DATE) " +
		       "AND FUNCTION('YEAR', m.maint_date) = FUNCTION('YEAR', CURRENT_DATE)")
	List<Maint> countRepairThisMonthForUser(@Param("user_id") String userId);

}