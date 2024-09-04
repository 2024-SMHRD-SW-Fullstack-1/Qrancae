package com.qrancae.service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.qrancae.model.Cable;
import com.qrancae.model.Log;
import com.qrancae.model.User;
import com.qrancae.repository.LogRepository;

@Service
public class LogService {
   
   @Autowired
   LogRepository logRepository;
   
   // 해당 케이블의 모든 로그 정보
   public Log findByCable(Cable cable) {
       return logRepository.findByCable(cable);
   }
   
   public List<Log> getLogResult(){
      List<Log> results = logRepository.findAllWithUserAndCable();
      
      return results;
   }
   
   public Map<String, Integer> getMonthLogCnt(Integer year) {
	   List<Object[]> results = logRepository.findMonthlyLogCountsByYear(year);
	   Map<String, Integer> monthCnt = new HashMap<String, Integer>();
	   
       monthCnt.put("Jan", 0);
       monthCnt.put("Feb", 0);
       monthCnt.put("Mar", 0);
       monthCnt.put("Apr", 0);
       monthCnt.put("May", 0);
       monthCnt.put("Jun", 0);
       monthCnt.put("Jul", 0);
       monthCnt.put("Aug", 0);
       monthCnt.put("Sep", 0);
       monthCnt.put("Oct", 0);
       monthCnt.put("Nov", 0);
       monthCnt.put("Dec", 0);
	   
	   for(Object[] result: results) {
		   Integer month = (Integer) result[0];
           Long count = (Long) result[1];
           String monthName = getMonthName(month);
           monthCnt.put(monthName, count.intValue());
	   }
	   return monthCnt;
   }
   
   private String getMonthName(Integer month) {
       switch (month) {
           case 1: return "Jan";
           case 2: return "Feb";
           case 3: return "Mar";
           case 4: return "Apr";
           case 5: return "May";
           case 6: return "Jun";
           case 7: return "Jul";
           case 8: return "Aug";
           case 9: return "Sep";
           case 10: return "Oct";
           case 11: return "Nov";
           case 12: return "Dec";
           default: return "Unknown";
       }
   }
   
   public int countLogsByUser(User user) {
	   return logRepository.countLogsByUser(user);
   }
   
}
