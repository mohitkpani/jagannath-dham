
package com.jagannathdham.dto;

import jakarta.validation.constraints.NotBlank;

public record PaymentVerificationRequest(

        @NotBlank
        String orderId,

        @NotBlank
        String paymentId,

        @NotBlank
        String signature

) {
}
