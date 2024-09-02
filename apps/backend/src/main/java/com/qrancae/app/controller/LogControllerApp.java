package com.qrancae.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.qrancae.app.model.LogApp;
import com.qrancae.app.service.LogServiceApp;

@RestController
@RequestMapping("/app/api")
public class LogControllerApp {

	@Autowired
	private LogServiceApp logService;

	@PostMapping("/logs")
	public ResponseEntity<Void> saveLog(@RequestBody LogApp log) {
		logService.saveLog(log);
		return ResponseEntity.ok().build();
	}
}
