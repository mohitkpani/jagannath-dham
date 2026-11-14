
package com.jagannathdham.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.jagannathdham.dto.DarshanSlotRequest;
import com.jagannathdham.dto.DarshanSlotResponse;
import com.jagannathdham.entity.Category;
import com.jagannathdham.entity.DarshanSlot;
import com.jagannathdham.exception.BadRequestException;
import com.jagannathdham.exception.ResourceNotFoundException;
import com.jagannathdham.repository.CategoryRepository;
import com.jagannathdham.service.DarshanSlotService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/darshan-slots")
public class DarshanSlotController {

    private final DarshanSlotService darshanSlotService;
    private final CategoryRepository categoryRepository;

    public DarshanSlotController(
            DarshanSlotService darshanSlotService,
            CategoryRepository categoryRepository) {

        this.darshanSlotService = darshanSlotService;
        this.categoryRepository = categoryRepository;
    }

    // Create Daily Darshan Capacity
    @PostMapping
    public ResponseEntity<DarshanSlotResponse> createSlot(
            @Valid @RequestBody DarshanSlotRequest request) {

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category not found"));

        if (!Boolean.TRUE.equals(category.getActive())) {
            throw new BadRequestException(
                    "Cannot create slot for an inactive category");
        }

        DarshanSlot slot = new DarshanSlot();

        slot.setCategory(category);
        slot.setSlotDate(request.slotDate());
        slot.setTotalCapacity(request.totalCapacity());
        slot.setBookedCount(0);
        slot.setActive(true);

        DarshanSlot savedSlot = darshanSlotService.saveSlot(slot);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(mapToResponse(savedSlot));
    }

    // Get All Daily Darshan Capacities
    @GetMapping
    public ResponseEntity<List<DarshanSlotResponse>> getAllSlots() {

        List<DarshanSlotResponse> response =
                darshanSlotService.getAllSlots()
                        .stream()
                        .map(this::mapToResponse)
                        .toList();

        return ResponseEntity.ok(response);
    }

    // Get Daily Capacity by Date
    @GetMapping("/date")
    public ResponseEntity<List<DarshanSlotResponse>> getSlotsByDate(
            @RequestParam LocalDate date) {

        List<DarshanSlotResponse> response =
                darshanSlotService.getActiveSlotsByDate(date)
                        .stream()
                        .map(this::mapToResponse)
                        .toList();

        return ResponseEntity.ok(response);
    }

    // Convert Entity to Response DTO
    private DarshanSlotResponse mapToResponse(DarshanSlot slot) {

        return new DarshanSlotResponse(
                slot.getId(),
                slot.getCategory().getId(),
                slot.getCategory().getType().name(),
                slot.getSlotDate(),
                slot.getTotalCapacity(),
                slot.getBookedCount(),
                slot.getTotalCapacity() - slot.getBookedCount(),
                slot.getActive(),
                slot.getCreatedAt()
        );
    }
}
