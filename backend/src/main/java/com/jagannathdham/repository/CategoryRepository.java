
package com.jagannathdham.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jagannathdham.entity.Category;
import com.jagannathdham.enums.CategoryType;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByType(CategoryType type);

    boolean existsByType(CategoryType type);
}
