package com.qrancae.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.qrancae.model.History;
import com.qrancae.repository.HistoryRepository;

@Service
public class HistoryService {
	
	@Autowired
	private HistoryRepository historyRepository;
	
	// 올해의 케이블 포설 히스토리 개수
	public int cntYearConnectHistory() {
		return historyRepository.countConnectDateThisYear();
	}
	
	// 올해의 케이블 제거 히스토리 개수
	public int cntYearRemoveHistory() {
		return historyRepository.countRemoveDateThisYear();
	}
	
	// 이번달 케이블 포설 및 제거 히스토리
	public List<History> historyListThisMonth() {
		return historyRepository.findAllByCurrentMonth();
	}
}
