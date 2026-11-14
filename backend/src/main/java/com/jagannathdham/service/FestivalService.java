
package com.jagannathdham.service;

import java.util.List;
import java.util.Map;

import com.jagannathdham.entity.Festival;

public interface FestivalService {

    Festival createFestival(Festival festival);

    List<Festival> getAllFestivals();

    Festival getFestivalById(Long id);

    Festival updateFestival(Long id, Festival festival);

    void deleteFestival(Long id);
    
    Festival patchFestival(Long id, Map<String, Object> updates);
}
