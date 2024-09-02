package com.qrancae.app.service;

import java.time.LocalDateTime;

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
	
	@Autowired
	private CableRepositoryApp cableRepository;
	
	public void saveLog(LogApp log) {
		
		//로그 테이블에서 calbe_idx 존재 여부 확인 
		boolean logExists = logRepository.existsByCableIdx(log.getCableIdx());
		
		// 로그가 없을 경우, 설치일자 추가
		if (!logExists) {
			CableApp cable = cableRepository.findById(log.getCableIdx())
					.orElseThrow(() -> new RuntimeException("Calbe not found"));
				cable.setCableDate(LocalDateTime.now());
				cableRepository.save(cable);
		}
		
		// 로그 저장
		logRepository.save(log);
	}
}
