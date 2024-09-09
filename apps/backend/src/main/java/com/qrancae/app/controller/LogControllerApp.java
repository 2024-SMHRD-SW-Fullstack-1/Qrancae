package com.qrancae.app.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
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

	private static final Logger logger = LoggerFactory.getLogger(LogControllerApp.class);

    @PostMapping("/logs")
    public ResponseEntity<Void> saveLog(@RequestBody LogApp log) {
        logger.info("Received log save request: userId = {}, cableIdx = {}", log.getUserId(), log.getCableIdx());
        try {
            logService.saveLog(log);
            logger.info("Log saved successfully for cableIdx = {}", log.getCableIdx());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error saving log: ", e);
            return ResponseEntity.status(500).build();
        }
    }
}
