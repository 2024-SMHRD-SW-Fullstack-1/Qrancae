package com.qrancae.app.repository;

import com.qrancae.app.model.MaintApp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MaintenanceRepository extends JpaRepository<MaintApp, Integer> {

    long countByUserIdAndMaintStatus(String userId, String maintStatus);

    long countByMaintUserIdAndMaintStatus(String maintUserId, String maintStatus);

    // cableIdx로 가장 최근의 유지보수 데이터를 가져오는 메서드
    Optional<MaintApp> findFirstByCableIdxOrderByMaintDateDesc(Integer cableIdx);
}
