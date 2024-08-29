package com.qrancae.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.qrancae.model.Member;

public interface MemberRepository extends JpaRepository<Member, String> {
    //회원 아이디 비번
	Member findByUserIdAndUserPw(String userId, String userPw);
    boolean existsByUserId(String userId);
    //회원 타입
    List<Member> findAllByUserType(char userType);
}