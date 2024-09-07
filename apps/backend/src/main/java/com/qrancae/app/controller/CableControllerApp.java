package com.qrancae.app.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.qrancae.app.model.CableApp;
import com.qrancae.app.model.CableHistoryResponse;
import com.qrancae.app.service.CableServiceApp;

@RestController
@RequestMapping("/app/api")
public class CableControllerApp {

	@Autowired
	private CableServiceApp cableService;

	// 케이블 인덱스로 설치일자를 반환하는 API 엔드포인트 
    @GetMapping("/cables/{cableIdx}")
    public ResponseEntity<CableApp> getCableDate(@PathVariable Integer cableIdx) {
        CableApp cable = cableService.getCableWithInstallDate(cableIdx);
        if (cable != null) {
            return ResponseEntity.ok(cable);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

	// 케이블 포설 날짜 기록 로직 
	@PostMapping("/cable-history/connect")
	public ResponseEntity<String> connectCable(@RequestParam Integer cableIdx, @RequestParam String userId) {

		boolean result = cableService.connectCable(cableIdx, userId);
		if (result) {
			return ResponseEntity.ok("Cable connected successfully.");
		} else {
			return ResponseEntity.status(HttpStatus.CONFLICT).body("Cable is already connected.");
		}
	}
		
	// 케이블 제거 로직
	@PostMapping("/cables/remove")
    public ResponseEntity<Void> removeCable(@RequestParam Integer cableIdx, @RequestParam String userId) {
        boolean success = cableService.removeCable(cableIdx, userId);
        if (success) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
	
	// 케이블 유지보수 내역 조회 로직 
    @GetMapping("/cable-history/{cableIdx}")
    public ResponseEntity<List<CableHistoryResponse>> getCableHistory(@PathVariable Integer cableIdx) {
        List<CableHistoryResponse> historyList = cableService.getCableHistoryWithUserNames(cableIdx);
        return ResponseEntity.ok(historyList);
    }
}
