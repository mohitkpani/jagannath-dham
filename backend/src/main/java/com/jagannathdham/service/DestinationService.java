
package com.jagannathdham.service;

import java.util.List;
import java.util.Map;

import com.jagannathdham.entity.Destination;

public interface DestinationService {

    Destination createDestination(Destination destination);

    Destination updateDestination(Long id, Destination destination);

    Destination patchDestination(Long id, Map<String, Object> updates);

    Destination getDestinationById(Long id);

    Destination getDestinationBySlug(String slug);

    List<Destination> getAllDestinations();

    List<Destination> getPublishedDestinations();

    void deleteDestination(Long id);
}
