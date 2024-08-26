package com.qrancae.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.qrancae.model.Maint;
import com.qrancae.repository.MaintRepository;

@Service
public class MaintService {
   
   @Autowired
   MaintRepository maintRepository;
   
   public List<Maint> getMaint(){
      List<Maint> result = maintRepository.findAllWithUser();
      System.out.println("유지보수 result :" +result.toString());
      
      return result;
   }

}
