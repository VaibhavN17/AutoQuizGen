package com.autoquizgen.backend.services;

import com.autoquizgen.backend.models.Attempt;
import com.autoquizgen.backend.models.Quiz;
import com.autoquizgen.backend.repository.AttemptRepository;
import com.autoquizgen.backend.repository.QuizRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final AttemptRepository attemptRepository;
    private final QuizRepository quizRepository;

    public AnalyticsService(AttemptRepository attemptRepository, QuizRepository quizRepository) {
        this.attemptRepository = attemptRepository;
        this.quizRepository = quizRepository;
    }

    /**
     * Get overall analytics dashboard stats
     */
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        try {
            // Total quizzes created
            long totalQuizzes = quizRepository.count();
            stats.put("totalQuizzesCreated", totalQuizzes);

            // Total attempts made
            long totalAttempts = attemptRepository.count();
            stats.put("totalAttempts", totalAttempts);

            // Average score
            Double avgScore = attemptRepository.getAverageScoreOverall();
            stats.put("averageScore", avgScore != null ? Math.round(avgScore * 100.0) / 100.0 : 0);

            // Get attempts per quiz
            Map<String, Object> attemptsPerQuiz = getAttemptsPerQuiz();
            stats.put("attemptsPerQuiz", attemptsPerQuiz);

            // Get attempts by day (last 7 days)
            Map<String, Integer> dailyActivity = getDailyActivityLastSevenDays();
            stats.put("dailyActivity", dailyActivity);

            // Best performing category (based on average scores by category)
            Map<String, Double> categoryStats = getCategoryStats();
            stats.put("categoryStats", categoryStats);

            // Streaks and milestones
            stats.put("currentStreak", calculateStreak());
            stats.put("totalQuestionsAnswered", totalAttempts * 10); // assuming avg 10 questions per quiz

        } catch (Exception e) {
            System.err.println("Error getting dashboard stats: " + e.getMessage());
            e.printStackTrace();
        }

        return stats;
    }

    /**
     * Get attempts count per quiz
     */
    public Map<String, Object> getAttemptsPerQuiz() {
        Map<String, Object> result = new HashMap<>();
        try {
            List<Quiz> allQuizzes = quizRepository.findAll();
            Map<String, Integer> attemptsMap = new HashMap<>();

            for (Quiz quiz : allQuizzes) {
                long attemptCount = attemptRepository.findByQuiz(quiz).size();
                attemptsMap.put(quiz.getTitle(), (int) attemptCount);
            }

            result.put("data", attemptsMap);
            result.put("totalAttempts", allQuizzes.stream()
                    .mapToInt(q -> attemptRepository.findByQuiz(q).size())
                    .sum());

            return result;
        } catch (Exception e) {
            System.err.println("Error getting attempts per quiz: " + e.getMessage());
            return result;
        }
    }

    /**
     * Get daily activity for the last 7 days
     */
    public Map<String, Integer> getDailyActivityLastSevenDays() {
        Map<String, Integer> dailyActivity = new LinkedHashMap<>();
        LocalDate today = LocalDate.now();

        try {
            for (int i = 6; i >= 0; i--) {
                LocalDate date = today.minusDays(i);
                LocalDateTime startOfDay = date.atStartOfDay();
                LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

                long count = attemptRepository.findByAttemptedAtBetween(startOfDay, endOfDay).size();
                dailyActivity.put(date.toString(), (int) count);
            }
        } catch (Exception e) {
            System.err.println("Error getting daily activity: " + e.getMessage());
        }

        return dailyActivity;
    }

    /**
     * Get 30-day daily activity
     */
    public Map<String, Integer> getDailyActivityLastThirtyDays() {
        Map<String, Integer> dailyActivity = new LinkedHashMap<>();
        LocalDate today = LocalDate.now();

        try {
            for (int i = 29; i >= 0; i--) {
                LocalDate date = today.minusDays(i);
                LocalDateTime startOfDay = date.atStartOfDay();
                LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

                long count = attemptRepository.findByAttemptedAtBetween(startOfDay, endOfDay).size();
                dailyActivity.put(date.toString(), (int) count);
            }
        } catch (Exception e) {
            System.err.println("Error getting 30-day activity: " + e.getMessage());
        }

        return dailyActivity;
    }

    /**
     * Get category performance stats
     */
    public Map<String, Double> getCategoryStats() {
        Map<String, Double> categoryStats = new HashMap<>();

        try {
            List<Attempt> allAttempts = attemptRepository.findAllByOrderByAttemptedAtDesc();

            // Group by category and calculate average scores
            // Note: This is simplified - you may want to enhance Question model with category field
            Map<String, List<Integer>> categoryScores = new HashMap<>();

            for (Attempt attempt : allAttempts) {
                String difficulty = attempt.getDifficultyLevel() != null ? attempt.getDifficultyLevel() : "unknown";
                categoryScores.computeIfAbsent(difficulty, k -> new ArrayList<>()).add(attempt.getScore());
            }

            // Calculate averages
            categoryScores.forEach((category, scores) -> {
                double avg = scores.stream().mapToDouble(Integer::doubleValue).average().orElse(0);
                categoryStats.put(category, Math.round(avg * 100.0) / 100.0);
            });

        } catch (Exception e) {
            System.err.println("Error getting category stats: " + e.getMessage());
        }

        return categoryStats;
    }

    /**
     * Calculate current streak (consecutive days with attempts)
     */
    public int calculateStreak() {
        try {
            int streak = 0;
            LocalDate today = LocalDate.now();

            for (int i = 0; i < 100; i++) { // Check up to 100 days back
                LocalDate date = today.minusDays(i);
                LocalDateTime startOfDay = date.atStartOfDay();
                LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

                long count = attemptRepository.findByAttemptedAtBetween(startOfDay, endOfDay).size();
                if (count > 0) {
                    streak++;
                } else {
                    break;
                }
            }

            return streak;
        } catch (Exception e) {
            System.err.println("Error calculating streak: " + e.getMessage());
            return 0;
        }
    }

    /**
     * Get score distribution (for histogram/chart)
     */
    public Map<String, Integer> getScoreDistribution() {
        Map<String, Integer> distribution = new LinkedHashMap<>();
        distribution.put("0-20", 0);
        distribution.put("21-40", 0);
        distribution.put("41-60", 0);
        distribution.put("61-80", 0);
        distribution.put("81-100", 0);

        try {
            List<Attempt> allAttempts = attemptRepository.findAllByOrderByAttemptedAtDesc();

            for (Attempt attempt : allAttempts) {
                int score = attempt.getScore();
                if (score <= 20) distribution.put("0-20", distribution.get("0-20") + 1);
                else if (score <= 40) distribution.put("21-40", distribution.get("21-40") + 1);
                else if (score <= 60) distribution.put("41-60", distribution.get("41-60") + 1);
                else if (score <= 80) distribution.put("61-80", distribution.get("61-80") + 1);
                else distribution.put("81-100", distribution.get("81-100") + 1);
            }
        } catch (Exception e) {
            System.err.println("Error getting score distribution: " + e.getMessage());
        }

        return distribution;
    }

    /**
     * Get top performing quizzes by average score
     */
    public List<Map<String, Object>> getTopQuizzes() {
        List<Map<String, Object>> topQuizzes = new ArrayList<>();

        try {
            List<Quiz> allQuizzes = quizRepository.findAll();

            for (Quiz quiz : allQuizzes) {
                Double avgScore = attemptRepository.getAverageScoreForQuiz(quiz.getId());
                if (avgScore != null && avgScore > 0) {
                    Map<String, Object> quizData = new HashMap<>();
                    quizData.put("id", quiz.getId());
                    quizData.put("title", quiz.getTitle());
                    quizData.put("averageScore", Math.round(avgScore * 100.0) / 100.0);
                    quizData.put("attempts", attemptRepository.findByQuiz(quiz).size());
                    topQuizzes.add(quizData);
                }
            }

            // Sort by average score descending
            topQuizzes.sort((a, b) -> Double.compare((Double) b.get("averageScore"), (Double) a.get("averageScore")));

            // Return top 5
            return topQuizzes.stream().limit(5).collect(Collectors.toList());

        } catch (Exception e) {
            System.err.println("Error getting top quizzes: " + e.getMessage());
        }

        return topQuizzes;
    }

    /**
     * Get detailed stats for a specific quiz
     */
    public Map<String, Object> getQuizStats(Long quizId) {
        Map<String, Object> stats = new HashMap<>();

        try {
            Optional<Quiz> quizOpt = quizRepository.findById(quizId);
            if (quizOpt.isEmpty()) {
                stats.put("error", "Quiz not found");
                return stats;
            }

            Quiz quiz = quizOpt.get();
            List<Attempt> attempts = attemptRepository.findByQuiz(quiz);

            stats.put("quizId", quizId);
            stats.put("quizTitle", quiz.getTitle());
            stats.put("totalAttempts", attempts.size());
            stats.put("averageScore", attempts.isEmpty() ? 0 : 
                    Math.round(attempts.stream().mapToInt(Attempt::getScore).average().orElse(0) * 100.0) / 100.0);
            stats.put("maxScore", attempts.isEmpty() ? 0 : 
                    attempts.stream().mapToInt(Attempt::getScore).max().orElse(0));
            stats.put("minScore", attempts.isEmpty() ? 0 : 
                    attempts.stream().mapToInt(Attempt::getScore).min().orElse(100));

            // Get scores trend over time
            List<Map<String, Object>> scoresTrend = attempts.stream()
                    .sorted(Comparator.comparing(Attempt::getAttemptedAt))
                    .map(a -> {
                        Map<String, Object> trendData = new HashMap<>();
                        trendData.put("date", a.getAttemptedAt().toLocalDate());
                        trendData.put("score", a.getScore());
                        return trendData;
                    })
                    .collect(Collectors.toList());

            stats.put("scoresTrend", scoresTrend);

        } catch (Exception e) {
            System.err.println("Error getting quiz stats: " + e.getMessage());
            stats.put("error", "Error retrieving stats: " + e.getMessage());
        }

        return stats;
    }
}
