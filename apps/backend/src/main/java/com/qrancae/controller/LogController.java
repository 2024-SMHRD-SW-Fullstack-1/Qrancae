package com.qrancae.controller;

<<<<<<< HEAD
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.qrancae.model.Log;
import com.qrancae.service.LogService;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class LogController {
   
   @Autowired
   private LogService logService;
   
   @GetMapping("/getlog")
   public List<Log> getLog() {
      
      List<Log> logs = logService.getLogResult();
      //System.out.println("로그데이터"+logs.toString());
      
      return logs;
   }

}
=======
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class LogController {

}
>>>>>>> 5618cc1f3cef0b6bd4ec0bd39fea2dc648c97072
