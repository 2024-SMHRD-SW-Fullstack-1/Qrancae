package com.qrancae.app.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.qrancae.app.model.MaintApp;
import com.qrancae.app.model.MaintenanceData;
import com.qrancae.app.repository.MaintenanceRepository;
import com.qrancae.app.service.MaintenanceService;

@RestController
@RequestMapping("/app/api/maintenance")
public class MaintenanceController {

	@Autowired
	private MaintenanceRepository maintenanceRepository;

	@Autowired
	private MaintenanceService maintenanceService;

	@PostMapping("/submit")
	public ResponseEntity<String> submitMaintenance(@RequestBody MaintenanceData maintenanceData) {
		try {
			maintenanceService.saveMaintenance(maintenanceData);
			return new ResponseEntity<>("Maintenance submitted successfully", HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>("Failed to submit maintenance", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@PostMapping("/updateToInProgress")
	public ResponseEntity<String> updateMaintStatusToInProgress(@RequestParam Integer maintIdx,
			@RequestParam String maintUserId) {
		try {
			maintenanceService.updateStatusToInProgress(maintIdx, maintUserId);
			return new ResponseEntity<>("Maint status updated to '점검중'", HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>("Failed to update maint status to '점검중'", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@GetMapping("/checkMaintenanceStatus")
	public ResponseEntity<Map<String, String>> checkMaintenanceStatus(@RequestParam Integer cableIdx) {
		try {
			Map<String, String> response = new HashMap<>();
			Optional<MaintApp> optionalMaintApp = maintenanceRepository
					.findFirstByCableIdxOrderByMaintDateDesc(cableIdx);

			if (optionalMaintApp.isPresent()) {
				MaintApp maintApp = optionalMaintApp.get();
				if ("신규접수".equals(maintApp.getMaintStatus()) || "점검중".equals(maintApp.getMaintStatus())) {
					response.put("status", "점검중");
					response.put("maintUserId", maintApp.getMaintUserId()); // 작업자 ID 추가
				} else {
					response.put("status", "접수 가능");
				}
			} else {
				response.put("status", "접수 가능");
			}
			return new ResponseEntity<>(response, HttpStatus.OK);
		} catch (Exception e) {
			Map<String, String> errorResponse = new HashMap<>();
			errorResponse.put("status", "Failed to check maintenance status");
			return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

}
