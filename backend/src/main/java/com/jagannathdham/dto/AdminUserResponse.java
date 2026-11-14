
package com.jagannathdham.dto;

import java.time.LocalDateTime;

public record AdminUserResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        String role,
        Boolean active,
        LocalDateTime createdAt,
        String profileImageUrl
) {
}
