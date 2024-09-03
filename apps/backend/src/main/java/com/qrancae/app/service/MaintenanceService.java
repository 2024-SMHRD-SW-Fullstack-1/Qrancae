package com.qrancae.app.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.qrancae.app.model.MaintApp;
import com.qrancae.app.model.MaintenanceData;
import com.qrancae.app.repository.MaintenanceRepository;

@Service
public class MaintenanceService {

    @Autowired
    private MaintenanceRepository maintenanceRepository;

    public void saveMaintenance(MaintenanceData maintenanceData) {
        Optional<MaintApp> existingMaintApp = maintenanceRepository.findFirstByCableIdxOrderByMaintDateDesc(maintenanceData.getCableIdx());

        if (existingMaintApp.isPresent()) {
            // 기존 maint_user_id와 새로 들어온 user_id가 같은 경우 업데이트
            MaintApp existingMaint = existingMaintApp.get();
            if (existingMaint.getUserId().equals(maintenanceData.getUserId()) && 
                "보수완료".equals(maintenanceData.getMaintStatus())) {
                
                // 기존 항목을 업데이트
                existingMaint.setMaintCable(maintenanceData.getMaintCable());
                existingMaint.setMaintPower(maintenanceData.getMaintPower());
                existingMaint.setMaintQr(maintenanceData.getMaintQr());
                existingMaint.setMaintMsg(maintenanceData.getMaintMsg());
                existingMaint.setMaintStatus(maintenanceData.getMaintStatus());
                existingMaint.setMaintUpdate(LocalDateTime.now());

                maintenanceRepository.save(existingMaint);
            } else {
                // 기존 데이터가 없거나 다른 사용자로 인해 새 항목 생성
                MaintApp maintApp = convertToMaintApp(maintenanceData);
                maintenanceRepository.save(maintApp);
            }
        } else {
            // 유지보수 항목이 없으면 새로 생성
            MaintApp maintApp = convertToMaintApp(maintenanceData);
            maintenanceRepository.save(maintApp);
        }
    }

    public Integer getOrCreateMaintIdx(String userId, Integer cableIdx, boolean forceCreate) {
        Optional<MaintApp> optionalMaintApp = maintenanceRepository.findFirstByCableIdxOrderByMaintDateDesc(cableIdx);

        if (optionalMaintApp.isPresent() && !forceCreate) {
            return optionalMaintApp.get().getMaintIdx();
        } else {
            MaintApp maintApp = new MaintApp();
            maintApp.setUserId(userId);
            maintApp.setCableIdx(cableIdx);
            maintApp.setMaintStatus("신규접수");
            maintApp.setMaintDate(LocalDateTime.now());

            maintenanceRepository.save(maintApp);
            return maintApp.getMaintIdx();
        }
    }

    public void updateMaintUserId(Integer cableIdx, String userId) {
        Optional<MaintApp> optionalMaintApp = maintenanceRepository.findFirstByCableIdxOrderByMaintDateDesc(cableIdx);
        if (optionalMaintApp.isPresent()) {
            MaintApp maintApp = optionalMaintApp.get();
            if (userId.equals(maintApp.getMaintUserId())) {
                maintApp.setMaintUpdate(LocalDateTime.now());
            } else {
                maintApp.setMaintUserId(userId);
                maintApp.setMaintStatus("보수완료");
                maintApp.setMaintUpdate(LocalDateTime.now());
            }
            maintenanceRepository.save(maintApp);
        }
    }

    private MaintApp convertToMaintApp(MaintenanceData maintenanceData) {
        MaintApp maintApp = new MaintApp();

        maintApp.setUserId(maintenanceData.getUserId());
        maintApp.setCableIdx(maintenanceData.getCableIdx());
        maintApp.setMaintStatus(maintenanceData.getMaintStatus());
        maintApp.setMaintDate(maintenanceData.getMaintDate());
        maintApp.setMaintCable(maintenanceData.getMaintCable());
        maintApp.setMaintPower(maintenanceData.getMaintPower());
        maintApp.setMaintQr(maintenanceData.getMaintQr());
        maintApp.setMaintMsg(maintenanceData.getMaintMsg());

        return maintApp;
    }
}
