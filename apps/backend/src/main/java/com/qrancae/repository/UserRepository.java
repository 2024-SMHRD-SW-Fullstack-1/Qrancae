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
	
	// 해당 관리자의 이름 가져오기
	@Query("SELECT u.user_name FROM User u WHERE u.user_id = :adminId")
    String findUserNameByAdminId(@Param("adminId") String adminId);
	
	// 해당 작업자의 이메일 가져오기
	@Query("SELECT u.user_email FROM User u WHERE u.user_id = :userId")
    String findUserEmailByUserId(@Param("userId") String userId);
}
