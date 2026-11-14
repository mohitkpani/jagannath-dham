
package com.jagannathdham.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.jagannathdham.entity.Festival;
import com.jagannathdham.repository.FestivalRepository;
import com.jagannathdham.service.FestivalService;

@Service
public class FestivalServiceImpl implements FestivalService {

    private final FestivalRepository festivalRepository;

    public FestivalServiceImpl(FestivalRepository festivalRepository) {
        this.festivalRepository = festivalRepository;
    }

    @Override
    public Festival createFestival(Festival festival) {
        return festivalRepository.save(festival);
    }

    @Override
    public List<Festival> getAllFestivals() {
        return festivalRepository.findAll();
    }

    @Override
    public Festival getFestivalById(Long id) {
        return festivalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Festival not found with ID: " + id));
    }

    @Override
    public Festival updateFestival(Long id, Festival festival) {
        Festival existingFestival = getFestivalById(id);

        existingFestival.setName(festival.getName());
        existingFestival.setMonth(festival.getMonth());
        existingFestival.setLocation(festival.getLocation());
        existingFestival.setDescription(festival.getDescription());
        existingFestival.setSignificance(festival.getSignificance());
        existingFestival.setImageUrl(festival.getImageUrl());

        return festivalRepository.save(existingFestival);
    }

    @Override
    public void deleteFestival(Long id) {
        Festival festival = getFestivalById(id);
        festivalRepository.delete(festival);
    }
    

@Override
public Festival patchFestival(Long id, Map<String, Object> updates) {

    Festival existing = getFestivalById(id);

    if (updates == null || updates.isEmpty()) {
        throw new IllegalArgumentException("No fields provided for update");
    }

    for (Map.Entry<String, Object> entry : updates.entrySet()) {

        String field = entry.getKey();
        Object value = entry.getValue();

        switch (field) {

            case "name" ->
                existing.setName(requireText(value, field));

            case "month" ->
                existing.setMonth(requireText(value, field));

            case "location" ->
                existing.setLocation(requireText(value, field));

            case "description" ->
                existing.setDescription(optionalText(value, field));

            case "significance" ->
                existing.setSignificance(optionalText(value, field));

            case "imageUrl" ->
                existing.setImageUrl(optionalText(value, field));

            default -> throw new IllegalArgumentException(
                    "Invalid festival field: " + field);
        }
    }

    return festivalRepository.save(existing);
}

private String requireText(Object value, String field) {

    if (!(value instanceof String text) || text.isBlank()) {
        throw new IllegalArgumentException(field + " cannot be empty");
    }

    return text.trim();
}

private String optionalText(Object value, String field) {

    if (value == null) {
        return null;
    }

    if (!(value instanceof String text)) {
        throw new IllegalArgumentException(field + " must be text");
    }

    return text.trim();
}

}
