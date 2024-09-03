package com.qrancae.app.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.qrancae.app.model.CableApp;
import com.qrancae.app.model.MaintApp;
import com.qrancae.app.model.MaintenanceData;
import com.qrancae.app.model.MaintenanceTask;
import com.qrancae.app.repository.MaintenanceRepository;
import com.qrancae.app.repository.AlarmRepositoryApp;
import com.qrancae.app.repository.CableRepositoryApp;

@Service
public class MaintenanceService {

    @Autowired
    private MaintenanceRepository maintenanceRepository;

    @Autowired
    private AlarmRepositoryApp alarmRepository;

    @Autowired
    private CableRepositoryApp cableRepository;

    public String getAlarmMessage(Integer maintIdx, String userId) {
        Optional<MaintApp> optionalMaintApp = maintenanceRepository.findById(maintIdx);

        if (optionalMaintApp.isPresent()) {
            MaintApp maintApp = optionalMaintApp.get();

            if ("진행중".equals(maintApp.getMaintStatus())) {
                return "점검 중인 케이블입니다.";
            } else if (userId.equals(maintApp.getUserId())) {
                return maintApp.getMaintMsg() != null ? maintApp.getMaintMsg() : "전달 사항이 없습니다.";
            } else {
                return "지시사항";
            }
        } else {
            return "전달 사항이 없습니다.";
        }
    }

    public void saveMaintenance(MaintenanceData maintenanceData) {
        Optional<MaintApp> existingMaintApp = maintenanceRepository.findFirstByCableIdxOrderByMaintDateDesc(maintenanceData.getCableIdx());

        if (existingMaintApp.isPresent()) {
            MaintApp existingMaint = existingMaintApp.get();

            if ("보수완료".equals(existingMaint.getMaintStatus())) {
                MaintApp newMaintApp = convertToMaintApp(maintenanceData);
                maintenanceRepository.save(newMaintApp);
            } else if (maintenanceData.getUserId().equals(existingMaint.getMaintUserId())) {
                updateExistingMaintenance(existingMaint, maintenanceData);
            } else {
                MaintApp newMaintApp = convertToMaintApp(maintenanceData);
                maintenanceRepository.save(newMaintApp);
            }
        } else {
            MaintApp newMaintApp = convertToMaintApp(maintenanceData);
            maintenanceRepository.save(newMaintApp);
        }
    }

    private void updateExistingMaintenance(MaintApp existingMaint, MaintenanceData maintenanceData) {
        if ("보수완료".equals(maintenanceData.getMaintStatus())) {
            existingMaint.setMaintStatus("보수완료");
            existingMaint.setMaintUpdate(LocalDateTime.now());
        } else {
            if (maintenanceData.getMaintCable() != null) {
                existingMaint.setMaintCable(maintenanceData.getMaintCable());
            }
            if (maintenanceData.getMaintPower() != null) {
                existingMaint.setMaintPower(maintenanceData.getMaintPower());
            }
            if (maintenanceData.getMaintQr() != null) {
                existingMaint.setMaintQr(maintenanceData.getMaintQr());
            }
            existingMaint.setMaintMsg(maintenanceData.getMaintMsg());
            existingMaint.setMaintStatus(maintenanceData.getMaintStatus());
            existingMaint.setMaintUpdate(LocalDateTime.now());
        }
        maintenanceRepository.save(existingMaint);
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
    
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public List<MaintenanceTask> getMaintenanceTasks(String userId, String status, String sortBy) {
        List<MaintApp> maintApps;

        if (status.equals("전체")) {
            // 우선순위를 고려한 정렬 처리
            if (sortBy.equals("new")) {
                maintApps = maintenanceRepository.findAllByUserWithPriorityDesc(userId);
            } else {
                maintApps = maintenanceRepository.findAllByUserWithPriorityAsc(userId);
            }
        } else if (status.equals("신규접수")) {
            maintApps = (sortBy.equals("new")) ?
                    maintenanceRepository.findByUserIdAndMaintStatusOrderByMaintDateDesc(userId, status) :
                    maintenanceRepository.findByUserIdAndMaintStatusOrderByMaintDateAsc(userId, status);
        } else {
            // "진행중" 및 "보수 완료" 상태 처리
            maintApps = (sortBy.equals("new")) ?
                    maintenanceRepository.findByMaintUserIdAndMaintStatusOrderByMaintDateDesc(userId, status) :
                    maintenanceRepository.findByMaintUserIdAndMaintStatusOrderByMaintDateAsc(userId, status);
        }

        return maintApps.stream().map(maintApp -> {
            String alarmMsg = alarmRepository.findAlarmMsgByMaintIdx(maintApp.getMaintIdx());
            LocalDateTime alarmDate = alarmRepository.findAlarmDateByMaintIdx(maintApp.getMaintIdx());
            CableApp cableApp = cableRepository.findById(maintApp.getCableIdx()).orElse(null);

            MaintenanceTask task = new MaintenanceTask();
            task.setMaintCable(maintApp.getMaintCable());
            task.setMaintQr(maintApp.getMaintQr());
            task.setMaintPower(maintApp.getMaintPower());
            task.setStatus(maintApp.getMaintStatus());

            // LocalDateTime을 String으로 변환
            task.setMaintDate(maintApp.getMaintDate().format(formatter));
            task.setAlarmDate(alarmDate != null ? alarmDate.format(formatter) : null);

            task.setAlarmMsg(alarmMsg);
            if (cableApp != null) {
                task.setSRackNumber(cableApp.getSRackNumber());
                task.setSRackLocation(cableApp.getSRackLocation());
            }
            task.setCableIdx(maintApp.getCableIdx().toString());

            return task;
        }).collect(Collectors.toList());
    }
}
