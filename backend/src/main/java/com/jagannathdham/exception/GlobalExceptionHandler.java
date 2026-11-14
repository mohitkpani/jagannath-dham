package com.jagannathdham.exception;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.MethodArgumentNotValidException;
import java.util.HashMap;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<Map<String, String>> handleNotFoundException(
	        ResourceNotFoundException ex) {

	    Map<String, String> response = Map.of(
	            "message", ex.getMessage()
	    );

	    return ResponseEntity
	            .status(HttpStatus.NOT_FOUND)
	            .body(response);
	}
	
	@ExceptionHandler(BadRequestException.class)
	public ResponseEntity<Map<String, String>> handleBadRequestException(
	        BadRequestException ex) {

	    Map<String, String> response = Map.of(
	            "message", ex.getMessage()
	    );

	    return ResponseEntity
	            .status(HttpStatus.BAD_REQUEST)
	            .body(response);
	}
	
	@ExceptionHandler(QrVerificationException.class)
	public ResponseEntity<Map<String, String>> handleQrVerificationException(
	        QrVerificationException ex) {

	    Map<String, String> response = Map.of(
	            "message", ex.getMessage()
	    );

	    return ResponseEntity
	            .status(HttpStatus.BAD_REQUEST)
	            .body(response);
	}
	
	@ExceptionHandler(WeatherServiceException.class)
	public ResponseEntity<Map<String, String>> handleWeatherServiceException(
	        WeatherServiceException ex) {

	    Map<String, String> response = Map.of(
	            "message", ex.getMessage()
	    );

	    return ResponseEntity
	            .status(ex.getStatus())
	            .body(response);
	}
	
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<Map<String, String>> handleValidationException(
	        MethodArgumentNotValidException ex) {

	    Map<String, String> errors = new HashMap<>();

	    ex.getBindingResult().getFieldErrors().forEach(error ->
	            errors.put(error.getField(), error.getDefaultMessage())
	    );

	    return ResponseEntity
	            .status(HttpStatus.BAD_REQUEST)
	            .body(errors);
	}
	
	@ExceptionHandler(Exception.class)
	public ResponseEntity<Map<String, String>> handleGeneralException(
	        Exception ex) {

	    Map<String, String> response = Map.of(
	            "message", "An unexpected error occurred. Please try again later."
	    );

	    return ResponseEntity
	            .status(HttpStatus.INTERNAL_SERVER_ERROR)
	            .body(response);
	}
	

@ExceptionHandler(GeminiServiceException.class)
public ResponseEntity<Map<String, String>> handleGeminiServiceException(
        GeminiServiceException ex) {

    Map<String, String> response = Map.of(
            "message", ex.getMessage()
    );

    return ResponseEntity
            .status(HttpStatus.SERVICE_UNAVAILABLE)
            .body(response);
}

}