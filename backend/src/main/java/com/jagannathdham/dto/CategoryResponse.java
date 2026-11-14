package com.jagannathdham.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.jagannathdham.enums.CategoryType;

public record CategoryResponse(
    Long id,
    CategoryType type,
    String description,
    BigDecimal fee,
    Boolean active,
    LocalDateTime createdAt
) {}