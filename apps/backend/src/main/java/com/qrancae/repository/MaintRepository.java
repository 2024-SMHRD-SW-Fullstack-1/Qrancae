package com.qrancae.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.qrancae.model.Maint;

@Repository
public interface MaintRepository extends JpaRepository<Maint, Integer> {
   
   @Query("SELECT m FROM Maint m JOIN FETCH m.user u")
   List<Maint> findAllWithUser();
}