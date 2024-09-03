//package com.qrancae.app.repository;
//
//import com.qrancae.app.model.MaintApp;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.stereotype.Repository;
//
//@Repository
//public interface MaintRepositoryApp extends JpaRepository<MaintApp, Long> {
//    
//    long countByUserIdAndMaintStatus(String userId, String maintStatus);
//    long countByMaintUserIdAndMaintStatus(String maintUserId, String maintStatus);
//    
//    MaintApp findFirstByUserIdAndCableIdxOrderByMaintDateDesc(String userId, Integer cableIdx);
//}
