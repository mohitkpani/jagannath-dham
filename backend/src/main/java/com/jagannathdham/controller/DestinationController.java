
package com.jagannathdham.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jagannathdham.dto.DestinationRequest;
import com.jagannathdham.dto.DestinationResponse;
import com.jagannathdham.entity.Destination;
import com.jagannathdham.service.DestinationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/destinations")
public class DestinationController {

    private final DestinationService destinationService;

    public DestinationController(DestinationService destinationService) {
        this.destinationService = destinationService;
    }

    @PostMapping
    public ResponseEntity<DestinationResponse> createDestination(
            @Valid @RequestBody DestinationRequest request) {

        Destination destination = mapToEntity(request);

        Destination saved = destinationService.createDestination(destination);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mapToResponse(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DestinationResponse> updateDestination(
            @PathVariable Long id,
            @Valid @RequestBody DestinationRequest request) {

        Destination destination = mapToEntity(request);

        Destination updated = destinationService.updateDestination(id, destination);

        return ResponseEntity.ok(mapToResponse(updated));
    }
    
    @PatchMapping("/{id}")
    public ResponseEntity<DestinationResponse> patchDestination(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates) {

        Destination updated =
                destinationService.patchDestination(id, updates);

        return ResponseEntity.ok(mapToResponse(updated));
    }

    @GetMapping
    public ResponseEntity<List<DestinationResponse>> getAllDestinations() {

        List<DestinationResponse> destinations =
                destinationService.getAllDestinations()
                        .stream()
                        .map(this::mapToResponse)
                        .toList();

        return ResponseEntity.ok(destinations);
    }

    @GetMapping("/published")
    public ResponseEntity<List<DestinationResponse>> getPublishedDestinations() {

        List<DestinationResponse> destinations =
                destinationService.getPublishedDestinations()
                        .stream()
                        .map(this::mapToResponse)
                        .toList();

        return ResponseEntity.ok(destinations);
    }
    

@GetMapping("/{id}")
public ResponseEntity<DestinationResponse> getDestinationById(
        @PathVariable Long id) {

    Destination destination = destinationService.getDestinationById(id);

    return ResponseEntity.ok(mapToResponse(destination));
}


    @GetMapping("/slug/{slug}")
    public ResponseEntity<DestinationResponse> getDestinationBySlug(
            @PathVariable String slug) {

        Destination destination = destinationService.getDestinationBySlug(slug);

        return ResponseEntity.ok(mapToResponse(destination));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDestination(@PathVariable Long id) {

        destinationService.deleteDestination(id);

        return ResponseEntity.noContent().build();
    }

    private Destination mapToEntity(DestinationRequest request) {

        Destination destination = new Destination();

        destination.setName(request.name());
        destination.setSlug(request.slug());
        destination.setDistrict(request.district());
        destination.setShortDescription(request.shortDescription());
        destination.setFullDescription(request.fullDescription());
        destination.setFamousFor(request.famousFor());
        destination.setBestSeason(request.bestSeason());
        destination.setImageUrl(request.imageUrl());
        destination.setPublished(
                request.published() != null ? request.published() : false
        );

        return destination;
    }

    private DestinationResponse mapToResponse(Destination destination) {

        return new DestinationResponse(
                destination.getId(),
                destination.getName(),
                destination.getSlug(),
                destination.getDistrict(),
                destination.getShortDescription(),
                destination.getFullDescription(),
                destination.getFamousFor(),
                destination.getBestSeason(),
                destination.getImageUrl(),
                destination.getPublished(),
                destination.getCreatedAt(),
                destination.getUpdatedAt()
        );
    }
}
