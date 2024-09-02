package com.qrancae.controller;

import com.qrancae.service.MaintenanceAdvisorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class AIController {

    @Autowired
    private MaintenanceAdvisorService maintenanceAdvisorService;

    @GetMapping("/getMaintenanceAdvice")
    public List<Map<String, String>> getMaintenanceAdvice() {
        return maintenanceAdvisorService.getMaintenanceAdvice();
    }
}