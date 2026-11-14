package com.jagannathdham.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jagannathdham.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);
    
    boolean existsByPhoneAndIdNot(String phone, Long id);
    
    long countByRole(String role);

    long countByRoleAndActiveTrue(String role);

    long countByActiveTrue();
}