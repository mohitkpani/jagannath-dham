package com.jagannathdham.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;

import com.jagannathdham.dto.CategoryRequest;
import com.jagannathdham.dto.CategoryResponse;
import com.jagannathdham.entity.Category;
import com.jagannathdham.service.CategoryService;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // Create a category
    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(
            @Valid @RequestBody CategoryRequest request) {

        Category category = new Category();
        category.setType(request.type());
        category.setDescription(request.description());
        category.setFee(request.fee());

        Category savedCategory = categoryService.saveCategory(category);

        CategoryResponse response = mapToResponse(savedCategory);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Get all categories
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {

        List<CategoryResponse> categories = categoryService.getAllCategories()
                .stream()
                .map(this::mapToResponse)
                .toList();

        return ResponseEntity.ok(categories);
    }

    // Get category by ID
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(
            @PathVariable Long id) {

        Category category = categoryService.getCategoryById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Category not found"));

        return ResponseEntity.ok(mapToResponse(category));
    }
    
 // Update a category
    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {

        Category category = new Category();
        category.setType(request.type());
        category.setDescription(request.description());
        category.setFee(request.fee());

        Category updatedCategory = categoryService.updateCategory(id, category);

        return ResponseEntity.ok(mapToResponse(updatedCategory));
    }
    
 // Deactivate a category
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<CategoryResponse> deactivateCategory(
            @PathVariable Long id) {

        Category category = categoryService.deactivateCategory(id);

        return ResponseEntity.ok(mapToResponse(category));
    }
    
 // Activate a category
    @PatchMapping("/{id}/activate")
    public ResponseEntity<CategoryResponse> activateCategory(
            @PathVariable Long id) {

        Category category = categoryService.activateCategory(id);

        return ResponseEntity.ok(mapToResponse(category));
    }

    // Convert Category entity to CategoryResponse
    private CategoryResponse mapToResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getType(),
                category.getDescription(),
                category.getFee(),
                category.getActive(),
                category.getCreatedAt()
        );
    }
}