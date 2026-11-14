package com.jagannathdham.dto;

public record UserLoginResponse(
    String token,
    String tokenType,
    Long userId,
    String fullName,
    String email,
    String role
) {}