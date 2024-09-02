package com.qrancae.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.qrancae.repository.MaintRepository;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;  // 추가된 import 문
import java.util.List;
import java.util.Map;  // 추가된 import 문

@Service
public class MaintenanceAdvisorService {

    @Autowired
    private MaintRepository maintRepository;

    public List<Map<String, String>> getMaintenanceAdvice() {
        List<Map<String, String>> results = new ArrayList<>();
        try {
            // Python 스크립트를 실행하고 결과를 처리하는 로직
            ProcessBuilder pb = new ProcessBuilder("python3", "path/to/ai_model/maintenance_advisor.py");
            Process process = pb.start();

            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                // 각 줄마다 cable_idx, maint_advice 정보가 온다고 가정
                String[] parts = line.split(",");
                Map<String, String> result = new HashMap<>();
                result.put("cable_idx", parts[0].trim());
                result.put("maint_advice", parts[1].trim());
                results.add(result);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return results;
    }
}