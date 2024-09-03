package com.qrancae.app.repository;

import com.qrancae.app.model.MaintApp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceRepository extends JpaRepository<MaintApp, Integer> {

    long countByUserIdAndMaintStatus(String userId, String maintStatus);

    long countByMaintUserIdAndMaintStatus(String maintUserId, String maintStatus);

    // cableIdx로 가장 최근의 유지보수 데이터를 가져오는 메서드
    Optional<MaintApp> findFirstByCableIdxOrderByMaintDateDesc(Integer cableIdx);
    
    // userId와 maintStatus를 기준으로 유지보수 데이터를 정렬하여 가져오는 메서드 (최신순)
    List<MaintApp> findByUserIdAndMaintStatusOrderByMaintDateDesc(String userId, String maintStatus);

    // userId와 maintStatus를 기준으로 유지보수 데이터를 정렬하여 가져오는 메서드 (오래된 순)
    List<MaintApp> findByUserIdAndMaintStatusOrderByMaintDateAsc(String userId, String maintStatus);

    @Query("SELECT m FROM MaintApp m WHERE m.userId = :userId OR m.maintUserId = :userId " +
            "ORDER BY CASE m.maintStatus " +
            "WHEN '진행중' THEN 1 " +
            "WHEN '신규접수' THEN 2 " +
            "WHEN '보수완료' THEN 3 " +
            "ELSE 4 END, " +
            "m.maintDate DESC")
     List<MaintApp> findAllByUserWithPriorityDesc(String userId);

     @Query("SELECT m FROM MaintApp m WHERE m.userId = :userId OR m.maintUserId = :userId " +
            "ORDER BY CASE m.maintStatus " +
            "WHEN '진행중' THEN 1 " +
            "WHEN '신규접수' THEN 2 " +
            "WHEN '보수완료' THEN 3 " +
            "ELSE 4 END, " +
            "m.maintDate ASC")
     List<MaintApp> findAllByUserWithPriorityAsc(String userId);

    // maintUserId와 maintStatus를 기준으로 유지보수 데이터를 정렬하여 가져오는 메서드 (최신순)
    List<MaintApp> findByMaintUserIdAndMaintStatusOrderByMaintDateDesc(String maintUserId, String maintStatus);

    // maintUserId와 maintStatus를 기준으로 유지보수 데이터를 정렬하여 가져오는 메서드 (오래된 순)
    List<MaintApp> findByMaintUserIdAndMaintStatusOrderByMaintDateAsc(String maintUserId, String maintStatus);

    // userId 또는 maintUserId로 필터링하여 유지보수 데이터를 정렬하여 가져오는 메서드 (최신순)
    List<MaintApp> findByUserIdOrMaintUserIdOrderByMaintDateDesc(String userId, String maintUserId);

    // userId 또는 maintUserId로 필터링하여 유지보수 데이터를 정렬하여 가져오는 메서드 (오래된 순)
    List<MaintApp> findByUserIdOrMaintUserIdOrderByMaintDateAsc(String userId, String maintUserId);
}
