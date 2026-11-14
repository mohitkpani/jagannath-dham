
package com.jagannathdham.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.jagannathdham.dto.ChatRequest;
import com.jagannathdham.dto.ChatResponse;
import com.jagannathdham.service.GeminiService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final GeminiService geminiService;

    public ChatController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(
            @Valid @RequestBody ChatRequest request) {

        ChatResponse response =
                geminiService.generateResponse(request.message());

        return ResponseEntity.ok(response);
    }
}
