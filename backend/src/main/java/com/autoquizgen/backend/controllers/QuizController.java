package com.autoquizgen.backend.controllers;

import com.autoquizgen.backend.models.Quiz;
import com.autoquizgen.backend.services.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(originPatterns = "http://localhost:*") // Allow local React/Vite ports (dev + preview)
public class QuizController {

    private final QuizService quizService;

    @Autowired
    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateQuiz(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "numQuestions", required = false, defaultValue = "10") Integer numQuestions,
            @RequestParam(value = "difficulty", required = false, defaultValue = "medium") String difficulty) {
        
        try {
            Quiz createdQuiz = quizService.generateQuizFromFile(file, title, numQuestions, difficulty);
            return ResponseEntity.ok(createdQuiz);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error generating quiz: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Quiz>> getAllQuizzes() {
        return ResponseEntity.ok(quizService.getAllQuizzes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getQuizById(@PathVariable Long id) {
        Quiz quiz = quizService.getQuizById(id);
        if (quiz != null) {
            return ResponseEntity.ok(quiz);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
