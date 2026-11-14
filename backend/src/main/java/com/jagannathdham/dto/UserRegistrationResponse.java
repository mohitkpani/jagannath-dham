package com.jagannathdham.dto;

public record UserRegistrationResponse(
    Long id,
    String fullName,
    String email,
    String phone,
    String role
) {}