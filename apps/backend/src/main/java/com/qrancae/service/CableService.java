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
	
	// 랙 위치당 케이블의 수
	public Map<String, Integer> countCablesByRackLocation() {
	    Map<String, Integer> cableCounts = new HashMap<String, Integer>();

	    // Source Rack Location의 케이블 수 가져오기
	    List<Object[]> sourceCables = cableRepository.countCablesBySourceRackLocation();
	    for (Object[] record : sourceCables) {
	        String rackLocation = (String) record[0];
	        Integer cableCount = ((Long) record[1]).intValue();
	        cableCounts.put(rackLocation, cableCounts.getOrDefault(rackLocation, 0) + cableCount);
	    }

	    // Destination Rack Location의 케이블 수 가져오기
	    List<Object[]> destinationCables = cableRepository.countCablesByDestinationRackLocation();
	    for (Object[] record : destinationCables) {
	        String rackLocation = (String) record[0];
	        Integer cableCount = ((Long) record[1]).intValue();
	        cableCounts.put(rackLocation, cableCounts.getOrDefault(rackLocation, 0) + cableCount);
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
