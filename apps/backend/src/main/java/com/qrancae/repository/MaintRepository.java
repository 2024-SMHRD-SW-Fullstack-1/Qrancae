package com.qrancae.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.qrancae.model.Maint;
import com.qrancae.model.User;

import jakarta.transaction.Transactional;

@Repository
public interface MaintRepository extends JpaRepository<Maint, Integer> {
   
   @Query("SELECT m FROM Maint m JOIN FETCH m.user u ORDER BY m.maint_date DESC")
   List<Maint> findAllWithUser();
   
   @Query("SELECT u FROM User u WHERE u.user_type = 'U'")
   List<User> findAllUsers();
   
   // 처리 작업자, 날짜 업데이트
   @Modifying
   @Transactional
   @Query("UPDATE Maint m SET m.maintUser.user_id = :userId, m.maint_update = :maintUpdate "
         + "WHERE m.maint_idx = :maintIdx")
   int updateMaint(@Param("maintIdx") int maintIdx, 
                  @Param("userId") String userId, 
                  @Param("maintUpdate") LocalDateTime maintUpdate);
   
   // '추천'인 경우 maint_advice 필드를 업데이트하는 메소드
   @Modifying
   @Transactional
   @Query("UPDATE Maint m SET m.maintAdvice = '비추천' "
           + "WHERE m.maintAdvice = '추천' AND m.cable.cable_idx = :cableIdx")
   int updateMaintAdviceToNotRecommended(@Param("cableIdx") int cableIdx);
}