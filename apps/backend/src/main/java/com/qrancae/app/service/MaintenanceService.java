package com.qrancae.app.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.qrancae.app.model.AlarmData;
import com.qrancae.app.model.CableApp;
import com.qrancae.app.model.MaintApp;
import com.qrancae.app.model.MaintenanceData;
import com.qrancae.app.model.MaintenanceTask;
import com.qrancae.app.repository.AlarmRepositoryApp;
import com.qrancae.app.repository.CableRepositoryApp;
import com.qrancae.app.repository.MaintenanceRepository;

@Service
public class MaintenanceService {

    @Autowired
    private MaintenanceRepository maintenanceRepository;
    
    @Autowired
    private AlarmRepositoryApp alarmrepository;

    @Autowired
    private CableRepositoryApp cableRepository; // 케이블 관련 데이터 가져오기 위한 레포지토리
    
    public boolean isCableInProgressOrNew(Integer cableIdx) {
        Optional<MaintApp> optionalMaintApp = maintenanceRepository.findFirstByCableIdxOrderByMaintDateDesc(cableIdx);
        if (optionalMaintApp.isPresent()) {
            MaintApp maintApp = optionalMaintApp.get();
            return "신규접수".equals(maintApp.getMaintStatus()) || "점검중".equals(maintApp.getMaintStatus());
        }
        return false;
    }

    public void saveMaintenance(MaintenanceData maintenanceData) {
        Optional<MaintApp> existingMaintApp = maintenanceRepository.findFirstByCableIdxOrderByMaintDateDesc(maintenanceData.getCableIdx());

        if ("신규접수".equals(maintenanceData.getMaintStatus())) {
            MaintApp newMaintApp = convertToMaintApp(maintenanceData);
            maintenanceRepository.save(newMaintApp);
        } else if ("보수완료".equals(maintenanceData.getMaintStatus())) {
            if (existingMaintApp.isPresent()) {
                MaintApp existingMaint = existingMaintApp.get();
                if ("점검중".equals(existingMaint.getMaintStatus())) {
                    updateExistingMaintenance(existingMaint, maintenanceData);
                } else {
                    throw new IllegalStateException("보수완료로 설정할 수 없습니다.");
                }
            } else {
                throw new IllegalStateException("진행 중인 작업이 없습니다.");
            }
        } else {
            throw new IllegalStateException("올바르지 않은 상태입니다.");
        }
    }

    private void updateExistingMaintenance(MaintApp existingMaint, MaintenanceData maintenanceData) {
        existingMaint.setMaintStatus("보수완료");
        existingMaint.setMaintUpdate(LocalDateTime.now());
        maintenanceRepository.save(existingMaint);
    }

    public void updateStatusToInProgress(Integer maintIdx, String maintUserId) {
        Optional<MaintApp> optionalMaintApp = maintenanceRepository.findById(maintIdx);
        if (optionalMaintApp.isPresent()) {
            MaintApp maintApp = optionalMaintApp.get();
            if ("신규접수".equals(maintApp.getMaintStatus())) {
                maintApp.setMaintStatus("점검중");
                maintApp.setMaintUserId(maintUserId);
                maintApp.setMaintUpdate(LocalDateTime.now());
                maintenanceRepository.save(maintApp);
            } else {
                throw new IllegalStateException("신규접수 상태에서만 진행중으로 변경 가능합니다.");
            }
        } else {
            throw new IllegalStateException("유효하지 않은 유지보수 항목입니다.");
        }
    }

    private MaintApp convertToMaintApp(MaintenanceData maintenanceData) {
        MaintApp maintApp = new MaintApp();
        maintApp.setUserId(maintenanceData.getUserId());
        maintApp.setCableIdx(maintenanceData.getCableIdx());
        maintApp.setMaintStatus(maintenanceData.getMaintStatus());
        maintApp.setMaintDate(LocalDateTime.now());
        maintApp.setMaintCable(maintenanceData.getMaintCable());
        maintApp.setMaintPower(maintenanceData.getMaintPower());
        maintApp.setMaintQr(maintenanceData.getMaintQr());
        maintApp.setMaintMsg(maintenanceData.getMaintMsg());
        return maintApp;
    }
    
    public List<MaintenanceTask> getMaintenanceTasks(String userId, String status, String sortBy, int page, int size) {
        // Sort.Direction을 동적으로 설정
        Sort.Direction direction = "오래된순".equals(sortBy) ? Sort.Direction.ASC : Sort.Direction.DESC;
        
        // 정렬 방향을 pageable에 반영
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, "maintDate"));
        Page<Object[]> resultPage;

        switch (status) {
            case "전체":
                resultPage = maintenanceRepository.findAllWithCableInfoByUserWithPriority(userId, pageable);
                break;
            case "점검중":
                resultPage = maintenanceRepository.findByMaintUserIdAndStatus(userId, "점검중", pageable);
                break;
            case "보수완료":
                resultPage = maintenanceRepository.findCompletedMaintenanceTasks(userId, pageable);
                break;
            case "신규접수":
                resultPage = maintenanceRepository.findByUserIdAndStatus(userId, "신규접수", pageable);
                break;
            default:
                throw new IllegalArgumentException("Invalid status: " + status);
        }

        return resultPage.getContent().stream().map(result -> {
            MaintApp maintApp = (MaintApp) result[0];
            CableApp cableApp = (CableApp) result[1];

            MaintenanceTask task = new MaintenanceTask();
            task.setMaintCable(maintApp.getMaintCable());
            task.setMaintQr(maintApp.getMaintQr());
            task.setMaintPower(maintApp.getMaintPower());
            task.setStatus(maintApp.getMaintStatus());
            task.setCableIdx(maintApp.getCableIdx().toString());
            task.setMaintMsg(maintApp.getMaintMsg()); 
            
            if (cableApp != null) {
                task.setSRackNumber(cableApp.getSRackNumber());
                task.setSRackLocation(cableApp.getSRackLocation());
            } else {
                task.setSRackNumber("N/A");
                task.setSRackLocation("N/A");
            }
            
            AlarmData alarmData = alarmrepository.findByMaintIdxAndUserId(maintApp.getMaintIdx().longValue(), userId);
            if (alarmData != null) {
                task.setAlarmDate(alarmData.getAlarmDate().toString()); // LocalDateTime을 String으로 변환
                task.setAlarmMsg(alarmData.getAlarmMsg());
            } else {
                task.setAlarmDate(null);
                task.setAlarmMsg(null);
            }
            
         // 날짜 로직 추가
            if ("보수완료".equals(maintApp.getMaintStatus())) {
                if (maintApp.getMaintUserId() != null) {
                    task.setMaintDate(maintApp.getMaintUpdate().toString());  // maint_update를 사용
                } else {
                    task.setMaintDate(maintApp.getMaintDate().toString());    // maint_date를 사용
                }
            } else {
                task.setMaintDate(maintApp.getMaintDate().toString());  // 다른 상태의 경우 기본 날짜 사용
            }


            return task;
        }).collect(Collectors.toList());
    }


    public String getAlarmMessage(Long maintIdx, String userId) {
        AlarmData alarmData = alarmrepository.findByMaintIdxAndUserId(maintIdx, userId);
        if (alarmData != null) {
            return alarmData.getAlarmMsg();
        } else {
            return "알람이 없습니다.";
        }
    }

    
    public Integer getOrCreateMaintIdx(String userId, Integer cableIdx, boolean forceCreate) {
        // 먼저, 점검중인 유지보수 항목을 확인
        Optional<MaintApp> inProgressMaintApp = maintenanceRepository.findFirstByCableIdxAndMaintStatusOrderByMaintDateDesc(cableIdx, "점검중");

        if (inProgressMaintApp.isPresent()) {
            return inProgressMaintApp.get().getMaintIdx();
        }

        // 점검중인 항목이 없을 때만 기존 항목을 조회하거나 새 항목을 생성
        Optional<MaintApp> existingMaintApp = maintenanceRepository.findFirstByUserIdAndCableIdxOrderByMaintDateDesc(userId, cableIdx);

        if (existingMaintApp.isPresent() && !forceCreate) {
            return existingMaintApp.get().getMaintIdx();
        } else {
            // 새로운 유지보수 항목 생성
            MaintApp newMaintApp = new MaintApp();
            newMaintApp.setUserId(userId);
            newMaintApp.setCableIdx(cableIdx);
            newMaintApp.setMaintStatus("신규접수");
            maintenanceRepository.save(newMaintApp);
            return newMaintApp.getMaintIdx();
        }
    }

}
