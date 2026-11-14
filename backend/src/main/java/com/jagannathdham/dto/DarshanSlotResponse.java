
package com.jagannathdham.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record DarshanSlotResponse(

    Long id,
    Long categoryId,
    String categoryType,
    LocalDate slotDate,
    Integer totalCapacity,
    Integer bookedCount,
    Integer availableCapacity,
    Boolean active,
    LocalDateTime createdAt

) {}
