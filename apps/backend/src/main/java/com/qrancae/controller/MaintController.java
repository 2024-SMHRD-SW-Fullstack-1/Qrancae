package com.qrancae.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.qrancae.model.Maint;
import com.qrancae.service.MaintService;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class MaintController {
   
   @Autowired
   private MaintService maintService;
   
   @GetMapping("/getmaint")
   public List<Maint> getMaint() {
      List<Maint> maints = maintService.getMaint();
      
      return maints;
   }

}