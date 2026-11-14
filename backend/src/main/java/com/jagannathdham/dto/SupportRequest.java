package com.jagannathdham.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SupportRequest(

        @NotBlank(message = "Please describe your issue")
        @Size(max = 3000, message = "Issue cannot exceed 3000 characters")
        String issue

) {
}