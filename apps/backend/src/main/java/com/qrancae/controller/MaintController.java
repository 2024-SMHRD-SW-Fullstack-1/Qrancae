package com.qrancae.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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
   @GetMapping("/getusers")
   public List<User> getUsers(){
      return maintService.getAllUsers();
   }
   
   // 확인하기 클릭 시 오늘 날짜로 업데이트
   @PostMapping("/updatemaint")
   public ResponseEntity<Void> updateMaint(@RequestParam int maintIdx, @RequestParam String userId) {
      System.out.println("유지보수 번호:"+maintIdx);
      maintService.updateMaint(maintIdx,userId);
      
      return ResponseEntity.ok().build();
   }
   

}