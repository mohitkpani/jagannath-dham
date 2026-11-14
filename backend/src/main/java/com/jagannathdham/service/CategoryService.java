package com.jagannathdham.service;

import java.util.List;
import java.util.Optional;

import com.jagannathdham.entity.Category;

public interface CategoryService {

    Category saveCategory(Category category);

    List<Category> getAllCategories();

    Optional<Category> getCategoryById(Long id);

    Category updateCategory(Long id, Category updatedCategory);
    
    Category deactivateCategory(Long id);
    
    Category activateCategory(Long id);
}