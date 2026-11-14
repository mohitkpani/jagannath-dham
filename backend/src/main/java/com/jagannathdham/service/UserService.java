package com.jagannathdham.service;

import java.util.List;
import java.util.Optional;

import org.springframework.web.multipart.MultipartFile;

import com.jagannathdham.dto.AdminUserCreateRequest;
import com.jagannathdham.dto.UserRegistrationResponse;
import com.jagannathdham.entity.User;

public interface UserService {

    User saveUser(User user);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);
    
    User registerUser(User user);
    
    User authenticateUser(String email, String password);
    
    User updateProfile(String email, String fullName, String phone);
    
    User changePassword(String email, String currentPassword,
            String newPassword, String confirmPassword);
    
    UserRegistrationResponse createStaffUser(AdminUserCreateRequest request);
    
    User uploadProfileImage(String email, MultipartFile file);

    User removeProfileImage(String email);
    
    List<User> getAllUsers();
}