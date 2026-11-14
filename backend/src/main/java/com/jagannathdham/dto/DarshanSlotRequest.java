
package com.jagannathdham.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record DarshanSlotRequest(

    @NotNull(message = "Category ID is required")
    Long categoryId,

    @NotNull(message = "Slot date is required")
    @FutureOrPresent(message = "Slot date cannot be in the past")
    LocalDate slotDate,

    @NotNull(message = "Total capacity is required")
    @Positive(message = "Capacity must be greater than zero")
    Integer totalCapacity

) {}
