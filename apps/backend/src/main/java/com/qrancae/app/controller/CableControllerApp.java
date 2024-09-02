package com.qrancae.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.qrancae.app.model.CableApp;
import com.qrancae.app.service.CableServiceApp;

@RestController
@RequestMapping("/app/api")
public class CableControllerApp {
	
	@Autowired
	private CableServiceApp cableService;
	
	// 케이블 인덱스로 설치일자를 반환하는 API 엔드포인트 
	@GetMapping("/cables/{cableIdx}")
	public ResponseEntity<CableApp> getCableDate(@PathVariable Integer cableIdx) {
		CableApp cable = cableService.getCalbeIdx(cableIdx);
		if (cable != null) {
			return ResponseEntity.ok(cable);
		} else {
			return ResponseEntity.notFound().build();
		}
	}
}	
