package com.qrancae.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.qrancae.model.Member;
import com.qrancae.model.User;
import com.qrancae.repository.MemberRepository;
import com.qrancae.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MemberService {

	@Autowired
	private MemberRepository memberRepository;
	
	@Autowired
	private UserRepository userRepository;

	// 로그인 기능
	public Member login(String userId, String userPw) {
		return memberRepository.findByUserIdAndUserPw(userId, userPw);
	}

	// 회원 가입(User) 관리자는 회원가입X
	public Member signUp(Member member) {
		member.setUserType('U');
		member.setJoinedAt(LocalDateTime.now());
		return memberRepository.save(member);
	}

	// 회운 아이디 존재여부
	public boolean isUserExist(String userId) {
		return memberRepository.existsByUserId(userId);
	}

	// 회원 타입
	public List<Member> getUsersByType(char userType) {
		return memberRepository.findAllByUserType(userType);
	}

	// 사용자 조회 메소드
	public Member findByUserId(String userId) {
		return memberRepository.findById(userId).orElse(null);
	}

	// 사용자 정보 수정
	public Member updateUser(Member member) {
		return memberRepository.save(member); // save 메소드는 존재하는 엔티티를 업데이트합니다.
	}

	// 사용자 삭제 메소드
	public void deleteUser(String userId) {
		memberRepository.deleteById(userId);
	}
	
	// 작업자 리스트
	public List<User> getUserTypeU() {
		return userRepository.findUsersByUserType("U");
	}

}
