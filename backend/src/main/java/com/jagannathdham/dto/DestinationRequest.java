
package com.jagannathdham.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DestinationRequest(

        @NotBlank(message = "Destination name is required")
        @Size(max = 150)
        String name,

        @NotBlank(message = "Destination slug is required")
        @Size(max = 180)
        String slug,

        @NotBlank(message = "District is required")
        @Size(max = 100)
        String district,

        @NotBlank(message = "Short description is required")
        @Size(max = 500)
        String shortDescription,

        String fullDescription,

        @Size(max = 500)
        String famousFor,

        @Size(max = 100)
        String bestSeason,

        @NotBlank(message = "Image URL is required")
        @jakarta.validation.constraints.Pattern(
        	    regexp = "^https?://.+",
        	    message = "Enter a valid HTTP or HTTPS image URL"
        	)
        @Size(max = 1000)
        String imageUrl,

        Boolean published
) {
}
