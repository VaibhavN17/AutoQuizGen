package com.autoquizgen.backend.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class LlamaService {

    @Value("${llama.api.url:http://127.0.0.1:8081/v1/chat/completions}")
    private String llamaApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String generateQuizFromChunk(String chunk, int targetCount, String difficulty) {
        String systemPrompt = "You are an expert quiz generator. Your ONLY task is to read the provided text and strictly output valid JSON containing " + targetCount + " MCQs (Multiple Choice Questions) based on the text at " + difficulty + " difficulty. Do not provide explanations, conversational text, or any formatting other than the raw JSON array. The JSON must follow this exact format: [{\"questionText\": \"What is X?\",\"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"],\"correctAnswerIndex\": 1,\"category\": \"General\"}]";

        Map<String, Object> requestBody = Map.of(
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", "Generate a quiz from this text:\n" + chunk)
                ),
                "temperature", 0.3,
                "max_tokens", Math.max(800, targetCount * 250),
                // Setting JSON mode if supported by the local OpenAI emulation layer
                "response_format", Map.of("type", "json_object")
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            Map<String, Object> response = restTemplate.postForObject(llamaApiUrl, entity, Map.class);
            if (response != null && response.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    return (String) message.get("content");
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to contact LLaMA instance at " + llamaApiUrl + ": " + e.getMessage());
            // Normally throw or handle gracefully
        }
        return "[]";
    }
}
