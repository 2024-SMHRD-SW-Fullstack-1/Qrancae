package com.qrancae.service;

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

}
