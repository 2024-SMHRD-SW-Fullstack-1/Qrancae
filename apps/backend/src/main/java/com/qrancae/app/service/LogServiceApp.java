package com.qrancae.app.service;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.qrancae.app.model.CableApp;
import com.qrancae.app.model.LogApp;
import com.qrancae.app.repository.CableRepositoryApp;
import com.qrancae.app.repository.LogRepositoryApp;

@Service
public class LogServiceApp {

    @Autowired
    private LogRepositoryApp logRepository;

    private static final Logger logger = LoggerFactory.getLogger(LogServiceApp.class);

    public void saveLog(LogApp log) {
        logger.info("Saving log: userId = {}, cableIdx = {}", log.getUserId(), log.getCableIdx());
        try {
            logRepository.save(log);
            logger.info("Log successfully saved for cableIdx = {}", log.getCableIdx());
        } catch (Exception e) {
            logger.error("Error occurred while saving log: ", e);
        }
    }
}
