
package com.jagannathdham.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record QrScanRequest(

        @NotBlank(message = "QR token is required")
        String qrToken,

        @NotBlank(message = "Gate code is required")
        @Size(max = 50, message = "Gate code cannot exceed 50 characters")
        String gateCode

) {
}
