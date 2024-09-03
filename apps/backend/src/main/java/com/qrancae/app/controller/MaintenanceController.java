package com.qrancae.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.qrancae.app.model.MaintenanceData;
import com.qrancae.app.service.MaintenanceService;

@RestController
@RequestMapping("/app/api/maintenance")
public class MaintenanceController {

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

    @PostMapping("/updateUserId")
    public ResponseEntity<String> updateMaintUserId(@RequestParam Integer cableIdx, @RequestParam String userId) {
        try {
            maintenanceService.updateMaintUserId(cableIdx, userId);
            return new ResponseEntity<>("Maint user ID updated successfully", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to update maint user ID", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
