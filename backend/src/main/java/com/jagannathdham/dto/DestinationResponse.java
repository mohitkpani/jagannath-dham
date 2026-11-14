
package com.jagannathdham.dto;

import java.time.LocalDateTime;

public record DestinationResponse(

        Long id,
        String name,
        String slug,
        String district,
        String shortDescription,
        String fullDescription,
        String famousFor,
        String bestSeason,
        String imageUrl,
        Boolean published,
        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {
}
