package com.qrancae.service;

<<<<<<< HEAD
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.qrancae.model.Log;
import com.qrancae.repository.LogRepository;

@Service
public class LogService {
   
   @Autowired
   LogRepository logRepository;
   
   public List<Log> getLogResult(){
      List<Log> results = logRepository.findAllWithUserAndCable();
      System.out.println("로그result"+results.toString());
      
      return results;
   }
=======
import org.springframework.stereotype.Service;

@Service
public class LogService {
>>>>>>> 5618cc1f3cef0b6bd4ec0bd39fea2dc648c97072

}
