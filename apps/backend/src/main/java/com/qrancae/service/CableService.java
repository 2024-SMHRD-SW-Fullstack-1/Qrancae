package com.qrancae.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.qrancae.model.Cable;
import com.qrancae.repository.CableRepository;
import com.qrancae.repository.QrRepository;

import jakarta.transaction.Transactional;

@Service
public class CableService {
	@Autowired
	private CableRepository cableRepository;
	
	@Autowired
	private QrRepository qrRepository;
	
	// 모든 케이블 정보
	public List<Cable> findAll() {
        return cableRepository.findAll();
    }
	
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
	
	// 랙 번호당 케이블의 수
	public Map<String, Integer> countCablesByRackNumber() {
	    Map<String, Integer> cableCounts = new HashMap<>();

	    // Source Rack Number의 케이블 수 가져오기
	    List<Object[]> sourceCables = cableRepository.countCablesBySourceRackNumber();
	    for (Object[] record : sourceCables) {
	        String rackNumber = (String) record[0];
	        Integer cableCount = ((Long) record[1]).intValue();
	        cableCounts.put(rackNumber, cableCounts.getOrDefault(rackNumber, 0) + cableCount);
	    }

	    // Destination Rack Number의 케이블 수 가져오기
	    List<Object[]> destinationCables = cableRepository.countCablesByDestinationRackNumber();
	    for (Object[] record : destinationCables) {
	        String rackNumber = (String) record[0];
	        Integer cableCount = ((Long) record[1]).intValue();
	        cableCounts.put(rackNumber, cableCounts.getOrDefault(rackNumber, 0) + cableCount);
	    }

	    return cableCounts;
	}
	
	// 해당 케이블의 케이블 정보와 qr 정보 삭제
	@Transactional
	public void deleteCables(List<Integer> cableIdxList) {
		cableRepository.deleteByCableIdxIn(cableIdxList);
	}
	
	// 전체 케이블의 수
	public int count() {
		return (int) cableRepository.count();
	}
	
}
