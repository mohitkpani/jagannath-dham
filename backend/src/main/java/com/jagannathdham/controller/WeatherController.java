package com.jagannathdham.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jagannathdham.dto.WeatherResponse;
import com.jagannathdham.service.WeatherService;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @GetMapping("/destination/{destinationId}")
    public ResponseEntity<WeatherResponse> getDestinationWeather(
            @PathVariable Long destinationId) {

        WeatherResponse response = weatherService.getWeather(destinationId);

        return ResponseEntity.ok(response);
    }
    

@GetMapping("/puri")
public ResponseEntity<WeatherResponse> getPuriWeather() {

    WeatherResponse response = weatherService.getPuriWeather();

    return ResponseEntity.ok(response);
}

}