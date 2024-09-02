package com.qrancae.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.qrancae.app.model.CableApp;

public interface CableRepositoryApp extends JpaRepository<CableApp, Integer>{
	
	// 케이블 인덱스로 케이블 정보를 조회하는 메서드
	CableApp findByCableIdx(Integer cableIdx);
}
