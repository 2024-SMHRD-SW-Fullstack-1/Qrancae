package com.qrancae.app.service;

import com.qrancae.app.model.MaintStatusResponse;
import com.qrancae.app.repository.MaintenanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MaintStatusServiceApp {

    @Autowired
    private MaintenanceRepository maintenanceRepository;

    public MaintStatusResponse calculateMaintStatus(String userId) {
        long newEntryCount = maintenanceRepository.countByUserIdAndMaintStatus(userId, "신규접수");
        long inProgressCount = maintenanceRepository.countByMaintUserIdAndMaintStatus(userId, "점검중"); // 수정
        long completedCount = maintenanceRepository.countByUserIdOrMaintUserIdAndMaintStatus(userId);

        return new MaintStatusResponse(newEntryCount, inProgressCount, completedCount);
    }
}
