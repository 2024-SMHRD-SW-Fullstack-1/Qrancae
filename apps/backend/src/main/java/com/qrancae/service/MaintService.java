package com.qrancae.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.qrancae.model.Maint;
import com.qrancae.model.User;
import com.qrancae.repository.MaintRepository;

@Service
public class MaintService {
   
   @Autowired
   MaintRepository maintRepository;
   
   // 유지보수 내역 불러오기
   public List<Maint> getMaint(){
      List<Maint> result = maintRepository.findAllWithUser();
      //System.out.println("유지보수 result :" +result.toString());
      
      return result;
   }
   // 사용자 목록 가져오기
   public List<User> getAllUsers() {
       return maintRepository.findAllUsers();
   }

   
   // 확인 클릭 시 현재 날짜로 업데이트
   public void updateMaint(int maintIdx, String userId) {
      
      LocalDateTime now = LocalDateTime.now();
      
      maintRepository.updateMaint(maintIdx,userId,now);
   }
}
