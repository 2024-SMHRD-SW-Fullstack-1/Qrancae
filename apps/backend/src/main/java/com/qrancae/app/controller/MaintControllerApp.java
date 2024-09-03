package com.qrancae.app.controller;

import com.qrancae.app.model.MaintApp;
import com.qrancae.app.model.MaintStatusResponse;
import com.qrancae.app.model.MaintenanceTask;
import com.qrancae.app.service.MaintStatusServiceApp;
import com.qrancae.app.service.MaintenanceService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/app/api")
public class MaintControllerApp {

    @Autowired
    private MaintStatusServiceApp maintStatusService;

    @Autowired
    private MaintenanceService maintenanceService;

    @GetMapping("/maint-status/{userId}")
    public ResponseEntity<MaintStatusResponse> getMaintenanceStatus(@PathVariable String userId) {
        MaintStatusResponse statusResponse = maintStatusService.calculateMaintStatus(userId);
        return ResponseEntity.ok(statusResponse);
    }
    
    @GetMapping("/alarm/message")
    public ResponseEntity<Map<String, String>> getAlarmByMaintIdx(
        @RequestParam Integer maintIdx,
        @RequestParam String userId
    ) {
        String message = maintenanceService.getAlarmMessage(maintIdx, userId);
        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/maint-idx")
    public ResponseEntity<Integer> getMaintIdx(@RequestParam String userId, @RequestParam Integer cableIdx, @RequestParam boolean forceCreate) {
        Integer maintIdx = maintenanceService.getOrCreateMaintIdx(userId, cableIdx, forceCreate);
        return ResponseEntity.ok(maintIdx);
    }
    
    @GetMapping("/maintenance/tasks")
    public ResponseEntity<List<MaintenanceTask>> getMaintenanceTasks(
        @RequestParam String userId,
        @RequestParam String status,
        @RequestParam String sortBy) {
        
        List<MaintenanceTask> tasks = maintenanceService.getMaintenanceTasks(userId, status, sortBy);
        return ResponseEntity.ok(tasks);
    }
}
