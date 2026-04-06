package com.autoquizgen.backend.services;

import com.autoquizgen.backend.models.Question;
import com.autoquizgen.backend.models.Quiz;
import com.autoquizgen.backend.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.scheduling.annotation.Async;
import java.util.ArrayList;
import java.util.List;

@Service
public class QuizService {

    private final FileExtractionService fileExtractionService;
    private final TextChunkingService textChunkingService;
    private final LlamaService llamaService;
    private final ResponseParserService responseParserService;
    private final QuizRepository quizRepository;

    @Autowired
    public QuizService(FileExtractionService fileExtractionService,
                       TextChunkingService textChunkingService,
                       LlamaService llamaService,
                       ResponseParserService responseParserService,
                       QuizRepository quizRepository) {
        this.fileExtractionService = fileExtractionService;
        this.textChunkingService = textChunkingService;
        this.llamaService = llamaService;
        this.responseParserService = responseParserService;
        this.quizRepository = quizRepository;
    }

    public Quiz initiateQuizGeneration(MultipartFile file, String title, Integer requestedQuestionCount, String difficulty) {
        Quiz quiz = new Quiz(title != null && !title.isEmpty() ? title : file.getOriginalFilename());
        quiz.setStatus("GENERATING");
        quiz.setRequestedQuestionCount(requestedQuestionCount);
        quiz.setDifficulty(difficulty);
        return quizRepository.save(quiz);
    }

    public Quiz generateQuizFromFile(MultipartFile file, String title, Integer numQuestions, String difficulty) {
        int safeQuestionCount = numQuestions == null ? 10 : Math.min(50, Math.max(1, numQuestions));
        String safeDifficulty = difficulty == null ? "medium" : difficulty.trim().toLowerCase();
        if (!List.of("easy", "medium", "hard").contains(safeDifficulty)) {
            safeDifficulty = "medium";
        }

        String extractedText = fileExtractionService.extractText(file);
        Quiz createdQuiz = initiateQuizGeneration(file, title, safeQuestionCount, safeDifficulty);
        compileQuizBackground(createdQuiz, extractedText, safeQuestionCount, safeDifficulty);
        return createdQuiz;
    }

    @Async
    public void compileQuizBackground(Quiz quiz, String text, int numQuestions, String difficulty) {
        try {
            List<String> chunks = textChunkingService.chunkText(text);
            int chunksToProcess = Math.min(chunks.size(), 3);
            
            // Distribute questions roughly across chunks
            int questionsPerChunk = Math.max(1, (int) Math.ceil((double) numQuestions / chunksToProcess));

            List<Question> allGeneratedQuestions = new ArrayList<>();

            for (int i = 0; i < chunksToProcess; i++) {
                String rawJsonResponse = llamaService.generateQuizFromChunk(chunks.get(i), questionsPerChunk, difficulty);
                List<Question> parsedQuestions = responseParserService.parseQuestions(rawJsonResponse);
                allGeneratedQuestions.addAll(parsedQuestions);
            }

            // In case it generated more than requested, trim it
            if (allGeneratedQuestions.size() > numQuestions) {
                allGeneratedQuestions = allGeneratedQuestions.subList(0, numQuestions);
            }

            for (Question q : allGeneratedQuestions) {
                quiz.addQuestion(q);
            }
            quiz.setStatus("READY");
            quizRepository.save(quiz);
        } catch (Exception e) {
            System.err.println("Error processing quiz async: " + e.getMessage());
            quiz.setStatus("FAILED");
            quizRepository.save(quiz);
        }
    }

    public void deleteQuiz(Long id) {
        quizRepository.deleteById(id);
    }
    
    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }
    
    public Quiz getQuizById(Long id) {
        return quizRepository.findById(id).orElse(null);
    }
}
