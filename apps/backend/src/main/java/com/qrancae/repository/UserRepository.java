package com.qrancae.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.qrancae.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, String>{
	
	// 타입으로 구분해서 사용자 리스트 가져오기
	@Query("SELECT u FROM User u WHERE u.user_type = :user_type")
    List<User> findUsersByUserType(@Param("user_type") String user_type);
}
