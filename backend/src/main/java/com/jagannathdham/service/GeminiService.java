
package com.jagannathdham.service;

import com.jagannathdham.dto.ChatResponse;

public interface GeminiService {

    ChatResponse generateResponse(String message);

}
