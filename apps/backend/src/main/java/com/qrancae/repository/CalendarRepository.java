package com.qrancae.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.qrancae.model.Cable;
import com.qrancae.model.Calendar;

@Repository
public interface CalendarRepository extends JpaRepository<Calendar, Integer> {
	
	@Query("SELECT c FROM Calendar c ORDER BY c.calendar_idx DESC")
	List<Calendar> findAllOrderByCalendarIdxDesc();

}
