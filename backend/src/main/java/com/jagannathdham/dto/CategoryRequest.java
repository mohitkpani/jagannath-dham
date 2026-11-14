package com.jagannathdham.dto;

import java.math.BigDecimal;

import com.jagannathdham.enums.CategoryType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CategoryRequest(

    @NotNull(message = "Category type is required")
    CategoryType type,

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    String description,

    @NotNull(message = "Fee is required")
    @DecimalMin(value = "0.00", message = "Fee cannot be negative")
    BigDecimal fee

) {}