package com.qrancae.controller;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.qrancae.model.Calendar;
import com.qrancae.service.CableService;
import com.qrancae.service.CalendarService;

@RestController
public class MainController {
	
	@Autowired
	private CalendarService calendarService;
	
	@PostMapping("/calendar")
	public List<Calendar> calendar(@RequestBody String user_id) {
		if (user_id.endsWith("=")) {
			user_id = user_id.substring(0, user_id.length() - 1);
        }
		
		List<Calendar> calendarList = calendarService.getCalendarList(user_id);

		return calendarList;
	}
	
	@PostMapping("/addCalendar")
	public String addCalendar(@RequestBody Calendar calendar) {
		calendarService.saveCalendar(calendar);
		return "캘린더 추가 완료";
	}
	
	@GetMapping("/findCalendar/{calendar_idx}")
	public Calendar findCalendar(@PathVariable Integer calendar_idx) {
		System.out.println("찾고싶은 calnedar_idx : " + calendar_idx);
		Calendar calendar = calendarService.findCalendar(calendar_idx);
		
		return calendar;
	}
	
	@PostMapping("/updateCalendar")
	public void updateCalendar(@RequestBody Calendar calendar) {
		calendarService.updateCalendar(calendar);
	}
	
	@GetMapping("/deleteCalendar/{calendar_idx}")
	public String deleteCalendar(@PathVariable Integer calendar_idx) {
		System.out.println("삭제할 calendar_idx : " + calendar_idx);
		calendarService.deleteCalendar(calendar_idx);
		
		return "캘린더 삭제 완료";
	}

}
