
package com.jagannathdham.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.jagannathdham.entity.Destination;
import com.jagannathdham.repository.DestinationRepository;
import com.jagannathdham.service.DestinationService;

@Service
public class DestinationServiceImpl implements DestinationService {

    private final DestinationRepository destinationRepository;

    public DestinationServiceImpl(DestinationRepository destinationRepository) {
        this.destinationRepository = destinationRepository;
    }

    @Override
    public Destination createDestination(Destination destination) {

        if (destinationRepository.existsBySlug(destination.getSlug())) {
            throw new IllegalArgumentException("Destination slug already exists");
        }

        return destinationRepository.save(destination);
    }

    @Override
    public Destination updateDestination(Long id, Destination destination) {

        Destination existing = getDestinationById(id);

        if (destinationRepository.existsBySlugAndIdNot(
                destination.getSlug(), id)) {
            throw new IllegalArgumentException("Destination slug already exists");
        }

        existing.setName(destination.getName());
        existing.setSlug(destination.getSlug());
        existing.setDistrict(destination.getDistrict());
        existing.setShortDescription(destination.getShortDescription());
        existing.setFullDescription(destination.getFullDescription());
        existing.setFamousFor(destination.getFamousFor());
        existing.setBestSeason(destination.getBestSeason());
        existing.setImageUrl(destination.getImageUrl());
        existing.setPublished(destination.getPublished());

        return destinationRepository.save(existing);
    }
    

@Override
public Destination patchDestination(Long id, Map<String, Object> updates) {

    Destination existing = getDestinationById(id);

    if (updates == null || updates.isEmpty()) {
        throw new IllegalArgumentException("No fields provided for update");
    }

    for (Map.Entry<String, Object> entry : updates.entrySet()) {

        String field = entry.getKey();
        Object value = entry.getValue();

        switch (field) {

            case "name" -> {
                String name = requireText(value, field);
                existing.setName(name);
            }

            case "slug" -> {
                String slug = requireText(value, field);

                if (destinationRepository.existsBySlugAndIdNot(slug, id)) {
                    throw new IllegalArgumentException(
                            "Destination slug already exists");
                }

                existing.setSlug(slug);
            }

            case "district" ->
                existing.setDistrict(requireText(value, field));

            case "shortDescription" ->
                existing.setShortDescription(requireText(value, field));

            case "fullDescription" ->
                existing.setFullDescription(optionalText(value, field));

            case "famousFor" ->
                existing.setFamousFor(optionalText(value, field));

            case "bestSeason" ->
                existing.setBestSeason(optionalText(value, field));

            case "imageUrl" ->
                existing.setImageUrl(requireText(value, field));

            case "published" -> {
                if (!(value instanceof Boolean)) {
                    throw new IllegalArgumentException(
                            "Published must be true or false");
                }
                existing.setPublished((Boolean) value);
            }

            default -> throw new IllegalArgumentException(
                    "Invalid destination field: " + field);
        }
    }

    return destinationRepository.save(existing);
}

private String requireText(Object value, String field) {

    if (!(value instanceof String text) || text.isBlank()) {
        throw new IllegalArgumentException(
                field + " cannot be empty");
    }

    return text.trim();
}

private String optionalText(Object value, String field) {

    if (value == null) {
        return null;
    }

    if (!(value instanceof String text)) {
        throw new IllegalArgumentException(
                field + " must be text");
    }

    return text.trim();
}


    @Override
    public Destination getDestinationById(Long id) {
        return destinationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Destination not found"));
    }

    @Override
    public Destination getDestinationBySlug(String slug) {
        return destinationRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Destination not found"));
    }

    @Override
    public List<Destination> getAllDestinations() {
        return destinationRepository.findAll();
    }

    @Override
    public List<Destination> getPublishedDestinations() {
        return destinationRepository.findByPublishedTrue();
    }

    @Override
    public void deleteDestination(Long id) {
        Destination destination = getDestinationById(id);
        destinationRepository.delete(destination);
    }
}
