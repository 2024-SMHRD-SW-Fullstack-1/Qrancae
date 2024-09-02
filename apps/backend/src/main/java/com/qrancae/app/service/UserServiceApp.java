package com.qrancae.app.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.qrancae.app.model.UserApp;
import com.qrancae.app.repository.UserRepositoryApp;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserServiceApp {

    @Autowired
    private UserRepositoryApp memberRepository;

    public UserApp login(String userId, String userPw) {
        return memberRepository.findByUserIdAndUserPw(userId, userPw);
    }

    public UserApp signUp(UserApp user) {
        user.setUserType('U');
        user.setJoinedAt(LocalDateTime.now());
        return memberRepository.save(user);
    }

    public boolean isUserExist(String userId) {
        return memberRepository.existsByUserId(userId);
    }

    public List<UserApp> getUsersByType(char userType) {
        return memberRepository.findAllByUserType(userType);
    }
    
    public UserApp findByUserId(String userId) {
        return memberRepository.findById(userId).orElse(null);
    }

    public UserApp updateUser(UserApp user) {
        return memberRepository.save(user);
    }

    public void deleteUser(String userId) {
        memberRepository.deleteById(userId);
    }
}
