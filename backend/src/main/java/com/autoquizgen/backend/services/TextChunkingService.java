package com.autoquizgen.backend.services;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class TextChunkingService {

    private static final int CHUNK_SIZE = 3000; // Characters, approx 700 tokens
    private static final int OVERLAP = 200;

    public List<String> chunkText(String text) {
        if (text == null || text.trim().isEmpty()) {
            return new ArrayList<>();
        }

        List<String> chunks = new ArrayList<>();
        int length = text.length();
        int i = 0;

        while (i < length) {
            int end = Math.min(length, i + CHUNK_SIZE);
            chunks.add(text.substring(i, end));
            i += (CHUNK_SIZE - OVERLAP);
        }

        return chunks;
    }
}
