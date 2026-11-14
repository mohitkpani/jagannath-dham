package com.jagannathdham.service;

import com.jagannathdham.dto.QrScanRequest;
import com.jagannathdham.dto.QrScanResponse;

public interface QrVerificationService {

    QrScanResponse verifyQrTicket(
            QrScanRequest request,
            String staffEmail
    );
}