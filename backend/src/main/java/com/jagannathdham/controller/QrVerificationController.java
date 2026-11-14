
package com.jagannathdham.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jagannathdham.dto.QrScanRequest;
import com.jagannathdham.dto.QrScanResponse;
import com.jagannathdham.service.QrVerificationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/qr")
public class QrVerificationController {

    private final QrVerificationService qrVerificationService;

    public QrVerificationController(QrVerificationService qrVerificationService) {
        this.qrVerificationService = qrVerificationService;
    }

    @PostMapping("/scan")
    public ResponseEntity<QrScanResponse> scanQr(
            @Valid @RequestBody QrScanRequest request,
            Authentication authentication) {

        QrScanResponse response = qrVerificationService.verifyQrTicket(
                request,
                authentication.getName()
        );

        return ResponseEntity.ok(response);
    }
}
