package com.qrancae.app.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.qrancae.app.model.UserApp;

@Repository
public interface UserRepositoryApp extends JpaRepository<UserApp, String> {
    UserApp findByUserIdAndUserPw(String userId, String userPw);
    boolean existsByUserId(String userId);
    List<UserApp> findAllByUserType(char userType);
}
