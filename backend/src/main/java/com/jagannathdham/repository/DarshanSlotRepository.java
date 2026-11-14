
package com.jagannathdham.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.jagannathdham.entity.DarshanSlot;

public interface DarshanSlotRepository extends JpaRepository<DarshanSlot, Long> {

    List<DarshanSlot> findBySlotDate(LocalDate slotDate);

    List<DarshanSlot> findBySlotDateAndActiveTrue(LocalDate slotDate);

    List<DarshanSlot> findByCategoryId(Long categoryId);

    boolean existsByCategoryIdAndSlotDate(Long categoryId, LocalDate slotDate);

    @Query(value = "SELECT * FROM darshan_slots WHERE id = :id FOR UPDATE", nativeQuery = true)
    Optional<DarshanSlot> findByIdForUpdate(@Param("id") Long id);
}
