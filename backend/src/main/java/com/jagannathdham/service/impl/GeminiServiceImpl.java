
package com.jagannathdham.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.jagannathdham.config.GeminiConfig;
import com.jagannathdham.dto.ChatResponse;
import com.jagannathdham.exception.GeminiServiceException;
import com.jagannathdham.service.GeminiService;

import tools.jackson.databind.JsonNode;

@Service
public class GeminiServiceImpl implements GeminiService {

    private final GeminiConfig geminiConfig;
    private final RestClient restClient;

    public GeminiServiceImpl(GeminiConfig geminiConfig) {
        this.geminiConfig = geminiConfig;
        this.restClient = RestClient.create();
    }

    @Override
    public ChatResponse generateResponse(String message) {

        String url = "https://generativelanguage.googleapis.com/v1beta/models/"
                + geminiConfig.getModel() + ":generateContent";

        String systemInstruction =
                "You are Jagannath Dham Assistant, the official virtual "
                + "assistant for the Jagannath Dham Darshan Booking and "
                + "Odisha Tourism platform. "

                + "YOUR MAIN AREAS OF KNOWLEDGE: "

                + "1. LORD JAGANNATH AND JAGANNATH TEMPLE: "
                + "Answer questions about Lord Jagannath, Shree Jagannath "
                + "Temple in Puri, temple traditions, rituals, history, "
                + "Rath Yatra, Mahaprasad, darshan and spiritual information. "

                + "2. DARSHAN BOOKING AND PLATFORM: "
                + "Explain how users can register, log in, book Darshan, "
                + "select categories and available slots, make payments, "
                + "access their bookings, download tickets and use QR codes. "
                + "Explain platform features and guide users to the appropriate "
                + "dashboard sections. "

                + "3. TOURIST DESTINATIONS OF ODISHA: "
                + "Answer questions about tourist places across Odisha, "
                + "including temples, beaches, historical places, wildlife "
                + "sanctuaries, waterfalls, lakes, cultural destinations and "
                + "popular travel attractions. "
                + "Help users understand destination locations, attractions, "
                + "travel interests and suitable visiting seasons. "

                + "4. FESTIVALS OF ODISHA: "
                + "Answer questions about festivals celebrated in Odisha, "
                + "including Rath Yatra, Durga Puja, Raja Parba, Nuakhai, "
                + "Bali Jatra, Konark Dance Festival, Dhanu Yatra and other "
                + "regional and cultural celebrations. "
                + "Explain their significance, traditions, celebrations "
                + "and cultural importance. "

                + "SCOPE RESTRICTION: "
                + "Only answer questions related to Lord Jagannath, "
                + "Jagannath Temple, Darshan booking, the Jagannath Dham "
                + "platform, Odisha tourist destinations and Odisha festivals. "

                + "If someone asks about unrelated topics such as coding, "
                + "programming, mathematics, politics, general technology, "
                + "sports, entertainment or other unrelated subjects, "
                + "politely refuse and guide them back to the supported topics. "

                + "Use this response for unrelated questions: "
                + "I am Jagannath Dham Assistant. I can help you with "
                + "Lord Jagannath, Darshan booking, tourist destinations "
                + "of Odisha and festivals celebrated in Odisha. "
                + "Please ask me something related to these topics. "

                + "ACCURACY RULES: "
                + "Never invent information, historical facts, dates, "
                + "travel details or festival schedules. "
                + "If you are uncertain about a fact, clearly say so. "
                + "Do not invent live booking availability, payment status, "
                + "ticket information or weather information. "
                + "For booking-specific information, ask users to check "
                + "their dashboard. "

                + "ACTION RESTRICTIONS: "
                + "Never claim to perform bookings, payments, cancellations "
                + "or QR verification. You can only explain the process "
                + "and guide users to the relevant platform features. "
                + "Never request passwords, OTPs or payment credentials. "

                + "LANGUAGE AND STYLE: "
                + "Be polite, friendly and helpful. "
                + "Use simple language that everyone can understand. "
                + "Keep answers concise unless the user requests details. "

                + "FORMATTING RULES: "
                + "Use plain, clean and readable text. "
                + "Do not use Markdown symbols such as **, *, # or backticks. "
                + "Use simple numbered lists when needed. "
                + "Keep paragraphs short and properly separated. "
                + "Avoid excessive emojis. Use at most one or two relevant emojis. "
                + "Do not include unnecessary greetings in every response. "
                + "Keep answers organized with clear spacing.";

        Map<String, Object> requestBody = Map.of(
                "systemInstruction",
                Map.of(
                        "parts",
                        List.of(
                                Map.of("text", systemInstruction)
                        )
                ),

                "contents",
                List.of(
                        Map.of(
                                "parts",
                                List.of(
                                        Map.of("text", message)
                                )
                        )
                )
        );

        JsonNode response;

        try {
            response = restClient.post()
                    .uri(url)
                    .header("x-goog-api-key", geminiConfig.getApiKey())
                    .body(requestBody)
                    .retrieve()
                    .body(JsonNode.class);

        } catch (RestClientException ex) {

            throw new GeminiServiceException(
                    "AI assistant is temporarily unavailable. Please try again later.",
                    ex
            );
        }

        String reply = response
                .path("candidates")
                .path(0)
                .path("content")
                .path("parts")
                .path(0)
                .path("text")
                .asText("Sorry, I couldn't generate a response.");

        return new ChatResponse(reply);
    }
}
