
package com.jagannathdham.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jagannathdham.entity.Destination;

public interface DestinationRepository extends JpaRepository<Destination, Long> {

    Optional<Destination> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<Destination> findByPublishedTrue();

    boolean existsBySlugAndIdNot(String slug, Long id);
}
