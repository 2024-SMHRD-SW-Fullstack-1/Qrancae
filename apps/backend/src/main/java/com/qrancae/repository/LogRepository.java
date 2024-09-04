package com.qrancae.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.qrancae.model.Cable;
import com.qrancae.model.Log;
import com.qrancae.model.User;

@Repository
public interface LogRepository extends JpaRepository<Log, Integer> {

	@Query("SELECT l FROM Log l JOIN FETCH l.user u JOIN FETCH l.cable c ORDER BY l.log_date DESC")
	List<Log> findAllWithUserAndCable();

	@Query("SELECT MONTH(l.log_date) AS month, COUNT(l) AS count " + "FROM Log l WHERE YEAR(l.log_date) = :year "
			+ "GROUP BY MONTH(l.log_date) ORDER BY MONTH(l.log_date)")
	List<Object[]> findMonthlyLogCountsByYear(@Param("year") Integer year);

	@Query("SELECT l FROM Log l WHERE l.cable = :cable")
	Log findByCable(@Param("cable") Cable cable);

	// 오늘의 로그 내역
	@Query("SELECT COUNT(l) FROM Log l WHERE FUNCTION('DATE', l.log_date) = FUNCTION('DATE', CURRENT_DATE)")
	int countLogsToday();

	// 이번주 로그 내역
	@Query("SELECT COUNT(l) FROM Log l WHERE FUNCTION('WEEK', l.log_date) = FUNCTION('WEEK', CURRENT_DATE)"
			+ "AND FUNCTION('YEAR', l.log_date) = FUNCTION('YEAR', CURRENT_DATE)")
	int countLogsThisWeek();

	// 이번달 로그 내역
	@Query("SELECT COUNT(l) FROM Log l WHERE FUNCTION('MONTH', l.log_date) = FUNCTION('MONTH', CURRENT_DATE)"
			+ "AND FUNCTION('YEAR', l.log_date) = FUNCTION('YEAR', CURRENT_DATE)")
	int countLogsThisMonth();

	// 해당 작업자의 이번달 로그 횟수
	@Query("SELECT COUNT(l) FROM Log l WHERE l.user.user_id = :userId "
			+ "AND FUNCTION('MONTH', l.log_date) = FUNCTION('MONTH', CURRENT_DATE) "
			+ "AND FUNCTION('YEAR', l.log_date) = FUNCTION('YEAR', CURRENT_DATE)")
	int countLogsForUserThisMonth(@Param("userId") String userId);

	// 오늘의 총 로그 내역
	@Query("SELECT l FROM Log l WHERE FUNCTION('DATE', l.log_date) = FUNCTION('DATE', CURRENT_DATE)")
	List<Log> findAllLogsToday();

	// 사용자 객체로 로그 수를 계산하는 쿼리
	   @Query("SELECT COUNT(l) FROM Log l WHERE l.user = :user")
	   int countLogsByUser(@Param("user") User user);
}
