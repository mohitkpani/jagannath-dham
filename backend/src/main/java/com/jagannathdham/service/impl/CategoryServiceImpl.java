
package com.jagannathdham.service.impl;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.jagannathdham.entity.Category;
import com.jagannathdham.repository.CategoryRepository;
import com.jagannathdham.service.CategoryService;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public Category saveCategory(Category category) {
        return categoryRepository.save(category);
    }

    @Override
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Override
    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }
    
    @Override
    public Category updateCategory(Long id, Category updatedCategory) {

        Category existingCategory = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        existingCategory.setType(updatedCategory.getType());
        existingCategory.setDescription(updatedCategory.getDescription());
        existingCategory.setFee(updatedCategory.getFee());
        existingCategory.setActive(updatedCategory.getActive());

        return categoryRepository.save(existingCategory);
    }
    
    @Override
    public Category deactivateCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        category.setActive(false);

        return categoryRepository.save(category);
    }
    
    @Override
    public Category activateCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        category.setActive(true);

        return categoryRepository.save(category);
    }
}
