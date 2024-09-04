package com.qrancae.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.qrancae.model.Calendar;
import com.qrancae.repository.CalendarRepository;

@Service
public class CalendarService {
	@Autowired
	private CalendarRepository calendarRepository;
	
	// 캘린더 리스트
	public List<Calendar> getCalendarList() {
	    List<Calendar> calList = calendarRepository.findAllOrderByCalendarIdxDesc();
	    return calList;
	}
	
	// 해당 idx의 캘린더 내용 찾기
	public Calendar findCalendar(Integer calendar_idx) {
		Optional<Calendar> calendar = calendarRepository.findById(calendar_idx);
		
		if (calendar.isPresent()) {
			return calendar.get();
		}else {
			throw new RuntimeException(calendar_idx + "의 캘린더를 찾을 수 없습니다.");
		}
	}
	
	// 캘린더 추가하기
	public Calendar saveCalendar(Calendar calendar) {
        return calendarRepository.save(calendar);
    }
	
	// 캘린더 업데이트 (수정)
	public void updateCalendar(Calendar calendar) {
		calendarRepository.save(calendar);
	}

	public void deleteCalendar(Integer calendar_idx) {
		calendarRepository.deleteById(calendar_idx);
	}
	
}
