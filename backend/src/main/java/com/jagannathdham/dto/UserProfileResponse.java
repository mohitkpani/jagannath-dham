package com.jagannathdham.dto;

import java.time.LocalDateTime;

public record UserProfileResponse(

    Long id,

    String fullName,

    String email,

    String phone,

    String role,

    LocalDateTime createdAt,

    String profileImageUrl

) {}