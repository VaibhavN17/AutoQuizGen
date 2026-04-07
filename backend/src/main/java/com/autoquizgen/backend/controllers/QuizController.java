package com.autoquizgen.backend.controllers;

import com.autoquizgen.backend.models.Attempt;
import com.autoquizgen.backend.models.Quiz;
import com.autoquizgen.backend.services.AnalyticsService;
import com.autoquizgen.backend.services.QuizService;
import com.autoquizgen.backend.repository.AttemptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(originPatterns = "http://localhost:*") // Allow local React/Vite ports (dev + preview)
public class QuizController {

    private final QuizService quizService;
    private final AnalyticsService analyticsService;
    private final AttemptRepository attemptRepository;

    @Autowired
    public QuizController(QuizService quizService, AnalyticsService analyticsService, AttemptRepository attemptRepository) {
        this.quizService = quizService;
        this.analyticsService = analyticsService;
        this.attemptRepository = attemptRepository;
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

    @GetMapping("/{id}/export/pdf")
    public ResponseEntity<?> exportQuizPdf(@PathVariable Long id) {
        return buildPdfResponse(id);
    }

    @GetMapping("/{id}/export/csv")
    public ResponseEntity<?> exportQuizCsv(@PathVariable Long id) {
        return buildCsvResponse(id);
    }

    // Bonus endpoints matching requested URL style: /export/pdf and /export/csv with quiz id as query param.
    @GetMapping("/export/pdf")
    public ResponseEntity<?> exportQuizPdfByQuery(@RequestParam("id") Long id) {
        return buildPdfResponse(id);
    }

    @GetMapping("/export/csv")
    public ResponseEntity<?> exportQuizCsvByQuery(@RequestParam("id") Long id) {
        return buildCsvResponse(id);
    }

    private ResponseEntity<?> buildPdfResponse(Long id) {
        try {
            Quiz quiz = quizService.getQuizById(id);
            if (quiz == null) {
                return ResponseEntity.notFound().build();
            }

            byte[] bytes = quizService.exportQuizAsPdf(id);
            String safeTitle = sanitizeFilename(quiz.getTitle());
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + safeTitle + "-quiz.pdf\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(bytes);
        } catch (Throwable e) {
            return ResponseEntity.internalServerError().body("Error exporting PDF: " + e.getMessage());
        }
    }

    private ResponseEntity<?> buildCsvResponse(Long id) {
        try {
            Quiz quiz = quizService.getQuizById(id);
            if (quiz == null) {
                return ResponseEntity.notFound().build();
            }

            byte[] bytes = quizService.exportQuizAsCsv(id);
            String safeTitle = sanitizeFilename(quiz.getTitle());
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + safeTitle + "-quiz.csv\"")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(bytes);
        } catch (Throwable e) {
            return ResponseEntity.internalServerError().body("Error exporting CSV: " + e.getMessage());
        }
    }

    private String sanitizeFilename(String input) {
        String fallback = "quiz";
        if (input == null || input.isBlank()) {
            return fallback;
        }
        String cleaned = input.replaceAll("[\\\\/:*?\"<>|]", "_").trim();
        return cleaned.isEmpty() ? fallback : cleaned;
    }

    // ==================== ANALYTICS ENDPOINTS ====================

    /**
     * Save a quiz attempt with score and metadata
     */
    @PostMapping("/{quizId}/attempts")
    public ResponseEntity<?> saveAttempt(
            @PathVariable Long quizId,
            @RequestBody Map<String, Object> attemptData) {
        try {
            Quiz quiz = quizService.getQuizById(quizId);
            if (quiz == null) {
                return ResponseEntity.notFound().build();
            }

            Integer score = ((Number) attemptData.get("score")).intValue();
            Integer totalQuestions = ((Number) attemptData.get("totalQuestions")).intValue();
            Integer correctAnswers = ((Number) attemptData.get("correctAnswers")).intValue();
            Integer timeElapsedSeconds = attemptData.containsKey("timeElapsedSeconds") 
                    ? ((Number) attemptData.get("timeElapsedSeconds")).intValue() 
                    : 0;
            String difficultyLevel = (String) attemptData.getOrDefault("difficultyLevel", "medium");

            Attempt attempt = new Attempt(quiz, score, totalQuestions, correctAnswers, timeElapsedSeconds, difficultyLevel);
            Attempt saved = attemptRepository.save(attempt);

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error saving attempt: " + e.getMessage());
        }
    }

    /**
     * Get dashboard statistics (total quizzes, average score, daily activity, etc.)
     */
    @GetMapping("/analytics/dashboard")
    public ResponseEntity<?> getDashboardStats() {
        try {
            Map<String, Object> stats = analyticsService.getDashboardStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error fetching dashboard stats: " + e.getMessage());
        }
    }

    /**
     * Get attempts per quiz
     */
    @GetMapping("/analytics/attempts-per-quiz")
    public ResponseEntity<?> getAttemptsPerQuiz() {
        try {
            Map<String, Object> data = analyticsService.getAttemptsPerQuiz();
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error fetching attempts per quiz: " + e.getMessage());
        }
    }

    /**
     * Get daily activity (last 7 days)
     */
    @GetMapping("/analytics/daily-activity")
    public ResponseEntity<?> getDailyActivity() {
        try {
            Map<String, Integer> activity = analyticsService.getDailyActivityLastSevenDays();
            return ResponseEntity.ok(activity);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error fetching daily activity: " + e.getMessage());
        }
    }

    /**
     * Get daily activity (last 30 days)
     */
    @GetMapping("/analytics/daily-activity-30d")
    public ResponseEntity<?> getDailyActivity30d() {
        try {
            Map<String, Integer> activity = analyticsService.getDailyActivityLastThirtyDays();
            return ResponseEntity.ok(activity);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error fetching 30-day activity: " + e.getMessage());
        }
    }

    /**
     * Get score distribution (for histogram chart)
     */
    @GetMapping("/analytics/score-distribution")
    public ResponseEntity<?> getScoreDistribution() {
        try {
            Map<String, Integer> distribution = analyticsService.getScoreDistribution();
            return ResponseEntity.ok(distribution);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error fetching score distribution: " + e.getMessage());
        }
    }

    /**
     * Get top performing quizzes
     */
    @GetMapping("/analytics/top-quizzes")
    public ResponseEntity<?> getTopQuizzes() {
        try {
            List<Map<String, Object>> topQuizzes = analyticsService.getTopQuizzes();
            return ResponseEntity.ok(topQuizzes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error fetching top quizzes: " + e.getMessage());
        }
    }

    /**
     * Get detailed stats for a specific quiz
     */
    @GetMapping("/{quizId}/analytics/stats")
    public ResponseEntity<?> getQuizStats(@PathVariable Long quizId) {
        try {
            Map<String, Object> stats = analyticsService.getQuizStats(quizId);
            if (stats.containsKey("error")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error fetching quiz stats: " + e.getMessage());
        }
    }

    /**
     * Get category performance stats
     */
    @GetMapping("/analytics/category-stats")
    public ResponseEntity<?> getCategoryStats() {
        try {
            Map<String, Double> stats = analyticsService.getCategoryStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error fetching category stats: " + e.getMessage());
        }
    }

    /**
     * Get current streak
     */
    @GetMapping("/analytics/streak")
    public ResponseEntity<?> getStreak() {
        try {
            int streak = analyticsService.calculateStreak();
            Map<String, Integer> response = new java.util.HashMap<>();
            response.put("streak", streak);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error calculating streak: " + e.getMessage());
        }
    }
}
