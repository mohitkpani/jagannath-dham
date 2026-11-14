package com.jagannathdham.exception;

import org.springframework.http.HttpStatus;

public class WeatherServiceException extends RuntimeException {

    private final HttpStatus status;

    public WeatherServiceException(String message) {
        super(message);
        this.status = HttpStatus.SERVICE_UNAVAILABLE;
    }

    public WeatherServiceException(String message, Throwable cause) {
        super(message, cause);
        this.status = HttpStatus.SERVICE_UNAVAILABLE;
    }

    public WeatherServiceException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}