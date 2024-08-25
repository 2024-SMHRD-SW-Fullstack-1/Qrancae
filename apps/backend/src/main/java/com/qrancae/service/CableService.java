package com.qrancae.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.qrancae.repository.CableRepository;

@Service
public class CableService {
	@Autowired
	private CableRepository cableRepository;
	
	// cable 테이블에 존재하는 가장 큰 cable_idx
	public Integer getCableIdx() {
		Integer maxIdx = cableRepository.findMaxCableIdx();
		return (maxIdx != null) ? maxIdx : 0;
	}
}
