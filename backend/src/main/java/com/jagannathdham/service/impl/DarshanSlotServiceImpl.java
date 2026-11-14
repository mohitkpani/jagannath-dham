
package com.jagannathdham.service.impl;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.jagannathdham.entity.DarshanSlot;
import com.jagannathdham.repository.DarshanSlotRepository;
import com.jagannathdham.service.DarshanSlotService;

@Service
public class DarshanSlotServiceImpl implements DarshanSlotService {

    private final DarshanSlotRepository darshanSlotRepository;

    public DarshanSlotServiceImpl(
            DarshanSlotRepository darshanSlotRepository) {
        this.darshanSlotRepository = darshanSlotRepository;
    }

    @Override
    public DarshanSlot saveSlot(DarshanSlot slot) {

        boolean alreadyExists =
                darshanSlotRepository.existsByCategoryIdAndSlotDate(
                        slot.getCategory().getId(),
                        slot.getSlotDate()
                );

        if (alreadyExists) {
            throw new RuntimeException(
                    slot.getCategory().getType()
                    + " capacity already exists for this date"
            );
        }

        return darshanSlotRepository.save(slot);
    }

    @Override
    public List<DarshanSlot> getAllSlots() {
        return darshanSlotRepository.findAll();
    }

    @Override
    public Optional<DarshanSlot> getSlotById(Long id) {
        return darshanSlotRepository.findById(id);
    }

    @Override
    public List<DarshanSlot> getSlotsByDate(LocalDate date) {
        return darshanSlotRepository.findBySlotDate(date);
    }

    @Override
    public List<DarshanSlot> getActiveSlotsByDate(LocalDate date) {
        return darshanSlotRepository.findBySlotDateAndActiveTrue(date);
    }

    @Override
    public List<DarshanSlot> getSlotsByCategory(Long categoryId) {
        return darshanSlotRepository.findByCategoryId(categoryId);
    }

    @Override
    public DarshanSlot updateSlot(Long id, DarshanSlot updatedSlot) {

        DarshanSlot existingSlot = darshanSlotRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Darshan slot not found"));

        if (updatedSlot.getTotalCapacity() < existingSlot.getBookedCount()) {
            throw new RuntimeException(
                    "Capacity cannot be less than already booked visitors");
        }

        existingSlot.setCategory(updatedSlot.getCategory());
        existingSlot.setSlotDate(updatedSlot.getSlotDate());
        existingSlot.setTotalCapacity(updatedSlot.getTotalCapacity());
        existingSlot.setActive(updatedSlot.getActive());

        return darshanSlotRepository.save(existingSlot);
    }

    @Override
    public DarshanSlot deactivateSlot(Long id) {

        DarshanSlot slot = darshanSlotRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Darshan slot not found"));

        slot.setActive(false);

        return darshanSlotRepository.save(slot);
    }

    @Override
    public DarshanSlot activateSlot(Long id) {

        DarshanSlot slot = darshanSlotRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Darshan slot not found"));

        slot.setActive(true);

        return darshanSlotRepository.save(slot);
    }
}
