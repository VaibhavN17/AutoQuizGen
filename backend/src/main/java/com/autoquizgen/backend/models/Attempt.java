package com.autoquizgen.backend.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "attempts")
public class Attempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(nullable = false)
    private Integer score; // 0-100

    @Column(nullable = false)
    private Integer totalQuestions;

    @Column(nullable = false)
    private Integer correctAnswers;

    @Column(nullable = false)
    private LocalDateTime attemptedAt;

    @Column(name = "time_elapsed_seconds")
    private Integer timeElapsedSeconds; // time taken in seconds

    @Column(name = "difficulty_level")
    private String difficultyLevel; // easy, medium, hard

    @PrePersist
    protected void onCreate() {
        attemptedAt = LocalDateTime.now();
    }

    // Constructors
    public Attempt() {}

    public Attempt(Quiz quiz, Integer score, Integer totalQuestions, Integer correctAnswers, Integer timeElapsedSeconds, String difficultyLevel) {
        this.quiz = quiz;
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.correctAnswers = correctAnswers;
        this.timeElapsedSeconds = timeElapsedSeconds;
        this.difficultyLevel = difficultyLevel;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Quiz getQuiz() {
        return quiz;
    }

    public void setQuiz(Quiz quiz) {
        this.quiz = quiz;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public Integer getCorrectAnswers() {
        return correctAnswers;
    }

    public void setCorrectAnswers(Integer correctAnswers) {
        this.correctAnswers = correctAnswers;
    }

    public LocalDateTime getAttemptedAt() {
        return attemptedAt;
    }

    public void setAttemptedAt(LocalDateTime attemptedAt) {
        this.attemptedAt = attemptedAt;
    }

    public Integer getTimeElapsedSeconds() {
        return timeElapsedSeconds;
    }

    public void setTimeElapsedSeconds(Integer timeElapsedSeconds) {
        this.timeElapsedSeconds = timeElapsedSeconds;
    }

    public String getDifficultyLevel() {
        return difficultyLevel;
    }

    public void setDifficultyLevel(String difficultyLevel) {
        this.difficultyLevel = difficultyLevel;
    }

    @Override
    public String toString() {
        return "Attempt{" +
                "id=" + id +
                ", quizId=" + (quiz != null ? quiz.getId() : null) +
                ", score=" + score +
                ", correctAnswers=" + correctAnswers +
                ", totalQuestions=" + totalQuestions +
                ", attemptedAt=" + attemptedAt +
                ", timeElapsedSeconds=" + timeElapsedSeconds +
                ", difficultyLevel='" + difficultyLevel + '\'' +
                '}';
    }
}
