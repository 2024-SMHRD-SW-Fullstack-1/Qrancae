package com.qrancae.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.qrancae.model.Calendar;
import com.qrancae.repository.CalendarRepository;

@Service
public class CalendarService {
	@Autowired
	private CalendarRepository calendarRepository;
	
	public List<Calendar> getCalendarList(String user_id) {
		List<Calendar> calList = calendarRepository.findAllByUserIdOrderByCalendarIdxDesc(user_id);
		return calList;
	}
	
	// 캘린더 추가하기
	public Calendar saveCalendar(Calendar calendar) {
        return calendarRepository.save(calendar);
    }
}
