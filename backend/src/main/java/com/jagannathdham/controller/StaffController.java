
package com.jagannathdham.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jagannathdham.dto.StaffDashboardResponse;
import com.jagannathdham.service.StaffDashboardService;

@RestController
@RequestMapping("/api/staff")
public class StaffController {

    private final StaffDashboardService staffDashboardService;

    public StaffController(StaffDashboardService staffDashboardService) {
        this.staffDashboardService = staffDashboardService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<StaffDashboardResponse> getDashboard(
            Authentication authentication) {

        StaffDashboardResponse response =
                staffDashboardService.getStaffDashboard(
                        authentication.getName());

        return ResponseEntity.ok(response);
    }
}
