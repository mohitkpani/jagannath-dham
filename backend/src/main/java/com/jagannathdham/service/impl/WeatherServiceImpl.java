package com.jagannathdham.service.impl;

import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.jagannathdham.config.WeatherConfig;
import com.jagannathdham.dto.WeatherResponse;
import com.jagannathdham.entity.Destination;
import com.jagannathdham.exception.WeatherServiceException;
import com.jagannathdham.repository.DestinationRepository;
import com.jagannathdham.service.WeatherService;
import com.jagannathdham.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;

@Service
public class WeatherServiceImpl implements WeatherService {

    private final WeatherConfig weatherConfig;
    private final DestinationRepository destinationRepository;
    private final RestClient restClient;

    public WeatherServiceImpl(
            WeatherConfig weatherConfig,
            DestinationRepository destinationRepository) {

        this.weatherConfig = weatherConfig;
        this.destinationRepository = destinationRepository;
        this.restClient = RestClient.create();
    }
    
    @Override
    public WeatherResponse getWeather(Long destinationId) {

        Destination destination = destinationRepository.findById(destinationId)
        		.orElseThrow(() -> new ResourceNotFoundException("Destination not found"));

        Map response;

        try {
            response = restClient.get()
                    .uri(
                            weatherConfig.getApiUrl()
                                    + "?q={location}&appid={apiKey}&units=metric",
                            destination.getDistrict() + ",IN",
                            weatherConfig.getApiKey()
                    )
                    .retrieve()
                    .body(Map.class);

        } catch (HttpStatusCodeException ex) {

        	if (ex.getStatusCode().value() == 404) {
        	    throw new WeatherServiceException(
        	            "Weather information not found for this destination.",
        	            HttpStatus.NOT_FOUND
        	    );
        	}

            throw new WeatherServiceException(
                    "Weather service returned an error. Please try again later.", ex
            );

        } catch (RestClientException ex) {

            throw new WeatherServiceException(
                    "Unable to connect to the weather service. Please try again later.", ex
            );
        }

        Map weather = (Map) ((java.util.List) response.get("weather")).get(0);
        Map main = (Map) response.get("main");
        Map wind = (Map) response.get("wind");

        return new WeatherResponse(
                destination.getName(),
                destination.getDistrict(),
                (String) weather.get("main"),
                (String) weather.get("description"),
                ((Number) main.get("temp")).doubleValue(),
                ((Number) main.get("feels_like")).doubleValue(),
                ((Number) main.get("humidity")).intValue(),
                ((Number) wind.get("speed")).doubleValue()
        );
    }
    

@Override
public WeatherResponse getPuriWeather() {

    Map response;

    try {
        response = restClient.get()
                .uri(
                    weatherConfig.getApiUrl()
                        + "?q={location}&appid={apiKey}&units=metric",
                    "Puri,IN",
                    weatherConfig.getApiKey()
                )
                .retrieve()
                .body(Map.class);

    } catch (HttpStatusCodeException ex) {

        if (ex.getStatusCode().value() == 404) {
            throw new WeatherServiceException(
                "Weather information not found for Puri.",
                HttpStatus.NOT_FOUND
            );
        }

        throw new WeatherServiceException(
            "Weather service returned an error. Please try again later.", ex
        );

    } catch (RestClientException ex) {

        throw new WeatherServiceException(
            "Unable to connect to the weather service. Please try again later.", ex
        );
    }

    Map weather = (Map) ((java.util.List) response.get("weather")).get(0);
    Map main = (Map) response.get("main");
    Map wind = (Map) response.get("wind");

    return new WeatherResponse(
        "Shree Jagannath Temple",
        "Puri",
        (String) weather.get("main"),
        (String) weather.get("description"),
        ((Number) main.get("temp")).doubleValue(),
        ((Number) main.get("feels_like")).doubleValue(),
        ((Number) main.get("humidity")).intValue(),
        ((Number) wind.get("speed")).doubleValue()
    );
}


}