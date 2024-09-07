package com.qrancae.app.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.qrancae.app.model.CableApp;
import com.qrancae.app.model.CableHistoryApp;
import com.qrancae.app.model.CableHistoryResponse;
import com.qrancae.app.model.UserApp;
import com.qrancae.app.repository.CableHistoryRepositoryApp;
import com.qrancae.app.repository.CableRepositoryApp;
import com.qrancae.app.repository.UserRepositoryApp;

@Service
public class CableServiceApp {

	@Autowired
	private CableRepositoryApp cableRepository;

	@Autowired
	private CableHistoryRepositoryApp cableHistoryRepository;

	@Autowired
	private UserRepositoryApp userRepository;

	// 케이블 인덱스로 케이블 정보를 가져오는 메서드
	public CableApp getCableWithInstallDate(Integer cableIdx) {
		CableApp cableApp = cableRepository.findByCableIdx(cableIdx);

		if (cableApp != null) {
			// 케이블의 최초 설치일자 조회
			Optional<CableHistoryApp> firstHistory = cableHistoryRepository
					.findFirstByCableIdxOrderByConnectDateAsc(cableIdx);

			if (firstHistory.isPresent()) {
				cableApp.setInstallDate(firstHistory.get().getConnectDate());
			}
		}

		return cableApp;
	}

	// 케이블 연결 기록
	public boolean connectCable(Integer cableIdx, String userId) {
		// 해당 cableIdx에 대해 remove_date가 null인 기록 조회 (이미 연결된 케이블)
		Optional<CableHistoryApp> existingConnection = cableHistoryRepository
				.findFirstByCableIdxAndRemoveDateIsNullOrderByConnectDateDesc(cableIdx);

		if (existingConnection.isPresent()) {
			// 이미 연결된 케이블이므로, 중복 설치 기록을 하지 않음
			return false; // 이미 연결된 상태이므로 새로운 기록을 생성하지 않음
		}

		// 해당 cableIdx에 대해 connect_date가 없는 기록 조회 (기존에 제거된 기록)
		Optional<CableHistoryApp> existingHistory = cableHistoryRepository
				.findFirstByCableIdxAndConnectDateIsNull(cableIdx);

		if (existingHistory.isPresent()) {
			// connect_date가 없는 기록이 있으면 연결 기록 업데이트
			CableHistoryApp history = existingHistory.get();
			history.setConnectUserId(userId);
			history.setConnectDate(LocalDateTime.now());
			cableHistoryRepository.save(history);
			return true;
		} else {
			// connect_date가 없는 기록이 없으면 새로운 연결 기록 생성
			CableHistoryApp newHistory = new CableHistoryApp();
			newHistory.setCableIdx(cableIdx);
			newHistory.setConnectUserId(userId);
			newHistory.setConnectDate(LocalDateTime.now());
			cableHistoryRepository.save(newHistory);
			return true;
		}
	}

	public boolean removeCable(Integer cableIdx, String userId) {
		Optional<CableHistoryApp> historyOptional = cableHistoryRepository
				.findFirstByCableIdxAndRemoveDateIsNullOrderByConnectDateDesc(cableIdx);

		if (historyOptional.isPresent()) {
			CableHistoryApp history = historyOptional.get();
			history.setRemoveUserId(userId);
			history.setRemoveDate(LocalDateTime.now());
			cableHistoryRepository.save(history);
			return true;
		} else {
			return false; // 제거할 기록이 없으면 실패
		}
	}

	// 케이블 히스토리와 사용자 이름을 함께 가져오는 메서드
	public List<CableHistoryResponse> getCableHistoryWithUserNames(Integer cableIdx) {
	    List<CableHistoryApp> historyList = cableHistoryRepository.findByCableIdxOrderByConnectDateDesc(cableIdx);
	    List<CableHistoryResponse> responseList = new ArrayList<>();

	    for (CableHistoryApp history : historyList) {
	        String connectUserName = history.getConnectUserId() != null
	                ? maskUserName(userRepository.findById(history.getConnectUserId()).orElse(null))
	                : "N/A";
	                
	        String removeUserName = history.getRemoveUserId() != null
	                ? maskUserName(userRepository.findById(history.getRemoveUserId()).orElse(null))
	                : "N/A";

	        CableHistoryResponse response = new CableHistoryResponse(
	            connectUserName,
	            removeUserName,
	            history.getConnectDate(),
	            history.getRemoveDate() // 여기서 removeDate가 제대로 받아오는지 확인
	        );
	        responseList.add(response);
	    }
	    return responseList;
	}

	// 사용자 이름의 일부를 마스킹하는 메서드
	private String maskUserName(UserApp user) {
		if (user == null || user.getUserName() == null) {
			return "N/A";
		}
		String name = user.getUserName();
		return name.charAt(0) + "*" + name.substring(2);
	}

}
