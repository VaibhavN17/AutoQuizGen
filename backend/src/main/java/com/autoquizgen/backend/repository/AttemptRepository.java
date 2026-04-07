package com.autoquizgen.backend.repository;

import com.autoquizgen.backend.models.Attempt;
import com.autoquizgen.backend.models.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AttemptRepository extends JpaRepository<Attempt, Long> {

    // Find all attempts for a specific quiz
    List<Attempt> findByQuiz(Quiz quiz);

    // Find all attempts within a date range (for daily activity)
    List<Attempt> findByAttemptedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Custom query to get attempts for a quiz ordered by date
    @Query("SELECT a FROM Attempt a WHERE a.quiz = :quiz ORDER BY a.attemptedAt DESC")
    List<Attempt> findAttemptsForQuizOrderByDate(@Param("quiz") Quiz quiz);

    // Get all attempts across all quizzes
    List<Attempt> findAllByOrderByAttemptedAtDesc();

    // Find attempts by quiz ID
    @Query("SELECT a FROM Attempt a WHERE a.quiz.id = :quizId ORDER BY a.attemptedAt DESC")
    List<Attempt> findByQuizId(@Param("quizId") Long quizId);

    // Count total attempts
    long count();

    // Get average score across all attempts
    @Query("SELECT AVG(a.score) FROM Attempt a")
    Double getAverageScoreOverall();

    // Get average score for a specific quiz
    @Query("SELECT AVG(a.score) FROM Attempt a WHERE a.quiz.id = :quizId")
    Double getAverageScoreForQuiz(@Param("quizId") Long quizId);

    // Count attempts by date
    @Query("SELECT COUNT(a) FROM Attempt a WHERE DATE(a.attemptedAt) = DATE(:date)")
    long countAttemptsByDate(@Param("date") LocalDateTime date);
}
