
package com.jagannathdham.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jagannathdham.entity.QrScanLog;

public interface QrScanLogRepository
        extends JpaRepository<QrScanLog, Long> {

    List<QrScanLog> findByQrTicketId(Long qrTicketId);

    List<QrScanLog> findByScannedById(Long staffId);

    // All scans of a staff member, newest first
    List<QrScanLog> findByScannedByIdOrderByScannedAtDesc(Long staffId);

    List<QrScanLog> findByGateCode(String gateCode);

    List<QrScanLog> findByScannedAtBetween(
            LocalDateTime start,
            LocalDateTime end
    );

    long countByScanResult(String scanResult);

    long countByScannedById(Long staffId);

    long countByScannedByIdAndScanResult(
            Long staffId,
            String scanResult
    );

    List<QrScanLog> findTop10ByScannedByIdOrderByScannedAtDesc(Long staffId);

    List<QrScanLog> findTop10ByOrderByScannedAtDesc();
}
