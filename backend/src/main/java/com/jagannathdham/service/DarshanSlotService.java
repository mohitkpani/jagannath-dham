package com.jagannathdham.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import com.jagannathdham.entity.DarshanSlot;

public interface DarshanSlotService {

    DarshanSlot saveSlot(DarshanSlot slot);

    List<DarshanSlot> getAllSlots();

    Optional<DarshanSlot> getSlotById(Long id);

    List<DarshanSlot> getSlotsByDate(LocalDate date);

    List<DarshanSlot> getActiveSlotsByDate(LocalDate date);

    List<DarshanSlot> getSlotsByCategory(Long categoryId);

    DarshanSlot updateSlot(Long id, DarshanSlot updatedSlot);

    DarshanSlot deactivateSlot(Long id);

    DarshanSlot activateSlot(Long id);
}