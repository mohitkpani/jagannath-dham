package com.jagannathdham.service;

import com.jagannathdham.dto.WeatherResponse;

public interface WeatherService {

    WeatherResponse getWeather(Long destinationId);
    
    WeatherResponse getPuriWeather();

}