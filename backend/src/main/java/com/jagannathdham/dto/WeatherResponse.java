package com.jagannathdham.dto;

public record WeatherResponse(
        String destination,
        String district,
        String weatherCondition,
        String weatherDescription,
        double temperature,
        double feelsLike,
        int humidity,
        double windSpeed
) {
}