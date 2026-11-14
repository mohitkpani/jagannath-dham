
package com.jagannathdham.service;

import java.util.List;

import com.jagannathdham.dto.QrScanResponse;
import com.jagannathdham.dto.StaffDashboardResponse;

public interface StaffDashboardService {

    StaffDashboardResponse getStaffDashboard(String staffEmail);

    List<QrScanResponse> getStaffScanHistory(String staffEmail);
}
