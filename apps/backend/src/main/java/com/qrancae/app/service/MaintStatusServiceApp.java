package com.qrancae.app.service;

import com.qrancae.app.model.MaintStatusResponse;
import com.qrancae.app.repository.MaintRepositoryApp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MaintStatusServiceApp {

    @Autowired
    private MaintRepositoryApp maintRepository;

    public MaintStatusResponse calculateMaintStatus(String userId) {
        long newEntryCount = maintRepository.countByUserIdAndMaintStatus(userId, "신규접수");
        long inProgressCount = maintRepository.countByUserIdAndMaintStatus(userId, "진행중");
        long completedCount = maintRepository.countByMaintUserIdAndMaintStatus(userId, "보수완료"); // 이 부분 수정

        return new MaintStatusResponse(newEntryCount, inProgressCount, completedCount);
    }
}
