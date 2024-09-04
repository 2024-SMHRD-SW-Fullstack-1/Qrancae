package com.qrancae.controller;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.qrancae.model.Maint;
import com.qrancae.model.User;
import com.qrancae.service.MaintService;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class MaintController {
   
   @Autowired
   private MaintService maintService;
   
   // 목록 가져오기
   @GetMapping("/getmaint")
   public List<Maint> getMaint() {
      List<Maint> maints = maintService.getMaint();
      
      return maints;
   }
   // 작업자 가져오기
   @GetMapping("/maint/getusers")
   public List<User> getUsers(){
      return maintService.getAllUsers();
   }
   
   // 확인하기 클릭 시 오늘 날짜로 업데이트
   @PostMapping("/updatemaint")
   public ResponseEntity<Void> updateMaint(@RequestParam int maintIdx, @RequestParam String userId) {
      System.out.println("유지보수 번호:"+maintIdx);
      //maintService.updateMaint(maintIdx,userId);
      
      return ResponseEntity.ok().build();
   }
   // 요청한 작업자와 추가 메세지 전달하기
   @PostMapping("/maint/updateuser")
   public ResponseEntity<String> updateMaintUser(@RequestBody Map<String, Object> request) {
      
      List<Integer> selectedMaints = (List<Integer>) request.get("maintIdxs");
       String selectedUser = (String) request.get("userId");
       String alarmMsg = (String) request.get("alarmMsg");
       
      if (selectedMaints == null || selectedMaints.isEmpty()) {
       return ResponseEntity.status(400).body("유효하지 않은 maintIdxs 파라미터");
      }
      
      if (selectedUser == null || selectedUser.isEmpty()) {
           return ResponseEntity.status(400).body("유효하지 않은 userId 파라미터");
       }
      
      System.out.println("추가 메세지 : " + alarmMsg);
       try {
           maintService.updateMaintUser(selectedMaints, selectedUser,alarmMsg);
           return ResponseEntity.ok("작업자 할당 성공");
       } catch (Exception e) {
          return ResponseEntity.status(500).body("작업자 할당 오류: " + e.getMessage());
       }
   }
   
// 특정 사용자(user_id)의 보수 완료 내역 수를 반환하는 API
   @GetMapping("/api/maint/count/{userId}")
   public ResponseEntity<Integer> getCompletedMaintenanceCountByUser(@PathVariable String userId) {
       int completedCount = maintService.countCompletedMaintenanceByUser(userId);
       return ResponseEntity.ok(completedCount);
   }
}