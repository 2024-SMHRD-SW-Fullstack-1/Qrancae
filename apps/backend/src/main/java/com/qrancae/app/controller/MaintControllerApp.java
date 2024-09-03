package com.qrancae.app.controller;

import com.qrancae.app.model.MaintStatusResponse;
import com.qrancae.app.service.MaintStatusServiceApp;
import com.qrancae.app.service.MaintenanceService;
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

    @GetMapping("/maint-idx")
    public ResponseEntity<Integer> getMaintIdx(@RequestParam String userId, @RequestParam Integer cableIdx, @RequestParam boolean forceCreate) {
        Integer maintIdx = maintenanceService.getOrCreateMaintIdx(userId, cableIdx, forceCreate);
        return ResponseEntity.ok(maintIdx);
    }
}
