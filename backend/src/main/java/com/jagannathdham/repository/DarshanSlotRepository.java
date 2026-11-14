package com.jagannathdham.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.jagannathdham.entity.DarshanSlot;

import jakarta.persistence.LockModeType;

public interface DarshanSlotRepository extends JpaRepository<DarshanSlot, Long> {

    List<DarshanSlot> findBySlotDate(LocalDate slotDate);

    List<DarshanSlot> findBySlotDateAndActiveTrue(LocalDate slotDate);

    List<DarshanSlot> findByCategoryId(Long categoryId);

    boolean existsByCategoryIdAndSlotDate(Long categoryId, LocalDate slotDate);
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM DarshanSlot s WHERE s.id = :id")
    Optional<DarshanSlot> findByIdForUpdate(@Param("id") Long id);
}