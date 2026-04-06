package com.autoquizgen.backend.services;

import com.autoquizgen.backend.models.Question;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ResponseParserService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<Question> parseQuestions(String rawJsonResponse) {
        if (rawJsonResponse == null || rawJsonResponse.trim().isEmpty()) {
            return new ArrayList<>();
        }

        // Clean up the string incase the LLM wrapped it in markdown e.g. ```json [...] ```
        String cleanedJson = rawJsonResponse.trim();
        int startIndex = cleanedJson.indexOf('[');
        int endIndex = cleanedJson.lastIndexOf(']');
        
        if (startIndex != -1 && endIndex != -1 && startIndex < endIndex) {
            cleanedJson = cleanedJson.substring(startIndex, endIndex + 1);
        } else {
            System.err.println("Could not find JSON array bounds in LLM response.");
            return new ArrayList<>();
        }

        try {
            return objectMapper.readValue(cleanedJson, new TypeReference<List<Question>>(){});
        } catch (Exception e) {
            System.err.println("Failed to parse JSON into Question list: " + e.getMessage());
            return new ArrayList<>();
        }
    }
}
