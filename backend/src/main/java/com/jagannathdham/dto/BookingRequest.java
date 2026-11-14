
package com.jagannathdham.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record BookingRequest(

    @NotNull(message = "Darshan slot ID is required")
    Long darshanSlotId,

    @NotNull(message = "Visitor count is required")
    @Positive(message = "Visitor count must be greater than zero")
    Integer visitorCount

) {}
