package com.qrancae.app.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.qrancae.app.model.CableApp;
import com.qrancae.app.repository.CableRepositoryApp;

@Service
public class CableServiceApp {
	
	@Autowired
	private CableRepositoryApp cableRepository;
	
	// 케이블 인덱스로 케이블 정보를 가져오는 메서드
	public CableApp getCalbeIdx(Integer cableIdx) {
	    CableApp cableApp = cableRepository.findByCableIdx(cableIdx);
	    System.out.println("Retrieved CableApp: " + cableApp);
	    return cableApp;
	}
}
