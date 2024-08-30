package com.qrancae.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.qrancae.model.Cable;
import com.qrancae.repository.CableRepository;

@Service
public class CableService {
	@Autowired
	private CableRepository cableRepository;
	
	// 등록된 cable 리스트
	public List<Cable> cablelist() {
		return cableRepository.findAllWithQr();
	}
	
	// cable 테이블에 존재하는 가장 큰 cable_idx
	public Integer getCableIdx() {
		Integer maxIdx = cableRepository.findMaxCableIdx();
		return (maxIdx != null) ? maxIdx : 0;
	}
	
	// 해당 cable 등록
	public void insertCable(Cable cable) {
		cableRepository.save(cable);
	}
	
	// 해당 케이블 리스트
	public Cable getCableByIdx(Integer calbeIdx) {
		Cable cable = cableRepository.findByCableIdx(calbeIdx);
		return cable;
	}
	
}
