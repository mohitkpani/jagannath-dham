package com.jagannathdham.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.jagannathdham.dto.SupportRequest;
import com.jagannathdham.service.EmailService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/support")
public class SupportController {

    private final EmailService emailService;

    public SupportController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping
    public ResponseEntity<String> submitIssue(
            @Valid @RequestBody SupportRequest request,
            Authentication authentication) {

        String userEmail = authentication.getName();

        emailService.sendSupportIssue(
                userEmail,
                request.issue()
        );

        return ResponseEntity.ok("Your issue has been sent successfully.");
    }
}