package com.jagannathdham.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

public interface CloudinaryService {

    Map<String, String> uploadProfileImage(MultipartFile file);

    void deleteProfileImage(String publicId);
}