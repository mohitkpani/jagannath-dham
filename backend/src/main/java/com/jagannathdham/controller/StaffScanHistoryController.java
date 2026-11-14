
package com.jagannathdham.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jagannathdham.dto.QrScanResponse;
import com.jagannathdham.service.StaffDashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/staff/scan-history")
@RequiredArgsConstructor
public class StaffScanHistoryController {

    private final StaffDashboardService staffDashboardService;

    @GetMapping
    public ResponseEntity<List<QrScanResponse>> getScanHistory(
            Authentication authentication) {

        return ResponseEntity.ok(
                staffDashboardService.getStaffScanHistory(
                        authentication.getName()
                )
        );
    }
}
