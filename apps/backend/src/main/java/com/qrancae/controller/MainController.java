package com.qrancae.controller;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
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
		System.out.println(user_id);
		
		List<Calendar> calendarList = calendarService.getCalendarList(user_id);

		return calendarList;
	}
	
	@PostMapping("/addCalendar")
	public String addCalendar(@RequestBody Calendar calendar) {
		System.out.println("캘린더 추가하기");
	    System.out.println(calendar.getCalendar_start());
		calendarService.saveCalendar(calendar);
		return "캘린더 추가 완료";
	}

}
