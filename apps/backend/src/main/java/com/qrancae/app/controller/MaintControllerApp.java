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

    // 메인페이지에서 진행현황을 가져오기 위한 기능
    @GetMapping("/maint-status/{userId}")
    public ResponseEntity<MaintStatusResponse> getMaintenanceStatus(@PathVariable String userId) {
        MaintStatusResponse statusResponse = maintStatusService.calculateMaintStatus(userId);
        return ResponseEntity.ok(statusResponse);
    }
    
    @GetMapping("/alarm/message")
    public ResponseEntity<Map<String, String>> getAlarmByMaintIdx(
        @RequestParam Long maintIdx,
        @RequestParam String userId
    ) {
        String message = maintenanceService.getAlarmMessage(maintIdx, userId);
        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/maint-idx")
    public ResponseEntity<Map<String, Integer>> getMaintIdx(@RequestParam String userId, @RequestParam Integer cableIdx, @RequestParam boolean forceCreate) {
        Integer maintIdx = maintenanceService.getOrCreateMaintIdx(userId, cableIdx, forceCreate);
        Map<String, Integer> response = new HashMap<>();
        response.put("maintIdx", maintIdx);
        return ResponseEntity.ok(response);
    }

    
    // 진행현황페이지에서 분류하기 위한 기능
    @GetMapping("/maintenance/tasks")
    public ResponseEntity<List<MaintenanceTask>> getMaintenanceTasks(
        @RequestParam String userId,
        @RequestParam String status,
        @RequestParam String sortBy,
        @RequestParam(defaultValue = "0") int page,   // 기본값 0
        @RequestParam(defaultValue = "20") int size   // 기본값 10
    ) {
        List<MaintenanceTask> tasks = maintenanceService.getMaintenanceTasks(userId, status, sortBy, page, size);
        return ResponseEntity.ok(tasks);
    }
}
