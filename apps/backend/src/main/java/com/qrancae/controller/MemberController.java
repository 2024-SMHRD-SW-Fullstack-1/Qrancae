package com.qrancae.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.qrancae.model.Member;
import com.qrancae.service.MemberService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://3.37.10.193")  // 배포된 React 서버 주소
public class MemberController {

    @Autowired
    private MemberService memberService;
    
    //로그인
    @PostMapping("/login")
    public String login(@RequestBody Member member, HttpSession session) {
        Member loginUser = memberService.login(member.getUserId(), member.getUserPw());
        if (loginUser != null && loginUser.getUserType() == 'A') {
            session.setAttribute("user", loginUser);
            return "로그인 성공";
        } else {
            return "로그인 실패";
        }
    }
    
    //회원가입
    @PostMapping("/signup")
    public String signUp(@RequestBody Member member) {
        if (memberService.isUserExist(member.getUserId())) {
            return "이미 존재하는 사용자입니다.";
        }
        memberService.signUp(member);
        return "회원가입 성공";
    }
    //로그아웃
    @PostMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "로그아웃 성공";
    }
    //U(user)타입 회원 가져오기
    @GetMapping("/users")
    public List<Member> getUsers() {
        return memberService.getUsersByType('U');
    }
    
    // 사용자 정보 가져오기 (GET)
    @GetMapping("/users/{userId}")
    public ResponseEntity<Member> getUserById(@PathVariable String userId) {
        Member member = memberService.findByUserId(userId);
        if (member != null) {
            return ResponseEntity.ok(member);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // 사용자 정보 수정 (PUT)
    @PutMapping("/users/{userId}")
    public ResponseEntity<String> updateUser(@PathVariable String userId, @RequestBody Member updatedMember) {
        Member existingMember = memberService.findByUserId(userId);
        if (existingMember != null) {
            existingMember.setUserPw(updatedMember.getUserPw());
            existingMember.setUserName(updatedMember.getUserName());
            existingMember.setUserEmail(updatedMember.getUserEmail());
            memberService.updateUser(existingMember);  // updateUser는 기존 save 메소드를 사용할 수 있습니다.
            return ResponseEntity.ok("사용자 정보가 수정되었습니다.");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // 사용자 정보 삭제 (DELETE)
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable String userId) {
        Member existingMember = memberService.findByUserId(userId);
        if (existingMember != null) {
            memberService.deleteUser(userId);  // deleteUser는 해당 userId로 삭제를 수행합니다.
            return ResponseEntity.ok("사용자 정보가 삭제되었습니다.");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    
    
    
}