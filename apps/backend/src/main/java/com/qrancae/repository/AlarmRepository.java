package com.qrancae.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.qrancae.model.Alarm;

@Repository
public interface AlarmRepository extends JpaRepository<Alarm, Integer>{

}
