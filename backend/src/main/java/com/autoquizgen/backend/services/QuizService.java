package com.autoquizgen.backend.services;

import com.autoquizgen.backend.models.Question;
import com.autoquizgen.backend.models.Quiz;
import com.autoquizgen.backend.repository.QuizRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.scheduling.annotation.Async;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;
import java.nio.charset.StandardCharsets;

@Service
public class QuizService {

    private final FileExtractionService fileExtractionService;
    private final TextChunkingService textChunkingService;
    private final LlamaService llamaService;
    private final ResponseParserService responseParserService;
    private final QuizRepository quizRepository;
    private static final PDType1Font FONT_HELVETICA = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
    private static final PDType1Font FONT_HELVETICA_BOLD = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);

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
            if (chunks.isEmpty()) {
                quiz.setStatus("FAILED");
                quizRepository.save(quiz);
                return;
            }

            int chunksToProcess = Math.min(chunks.size(), 3);

            List<Question> allGeneratedQuestions = new ArrayList<>();
            int attempt = 0;
            int maxAttempts = Math.max(6, chunksToProcess * 4);

            while (allGeneratedQuestions.size() < numQuestions && attempt < maxAttempts) {
                int remaining = numQuestions - allGeneratedQuestions.size();
                int questionsPerChunk = Math.max(1, (int) Math.ceil((double) remaining / chunksToProcess));

                for (int i = 0; i < chunksToProcess; i++) {
                    if (allGeneratedQuestions.size() >= numQuestions) {
                        break;
                    }

                    String rawJsonResponse = llamaService.generateQuizFromChunk(chunks.get(i), questionsPerChunk, difficulty);
                    List<Question> parsedQuestions = responseParserService.parseQuestions(rawJsonResponse);

                    if (!parsedQuestions.isEmpty()) {
                        allGeneratedQuestions.addAll(parsedQuestions);
                    }
                }

                attempt++;
            }

            if (allGeneratedQuestions.size() < numQuestions) {
                int remaining = numQuestions - allGeneratedQuestions.size();
                for (int i = 0; i < remaining; i++) {
                    String chunk = chunks.get(i % chunksToProcess);
                    String rawJsonResponse = llamaService.generateQuizFromChunk(chunk, 1, difficulty);
                    List<Question> parsedQuestions = responseParserService.parseQuestions(rawJsonResponse);
                    if (!parsedQuestions.isEmpty()) {
                        allGeneratedQuestions.add(parsedQuestions.get(0));
                    }
                }
            }

            if (allGeneratedQuestions.isEmpty()) {
                quiz.setStatus("FAILED");
                quizRepository.save(quiz);
                return;
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

    public byte[] exportQuizAsCsv(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found for id=" + quizId));

        StringBuilder csv = new StringBuilder();
        csv.append("Question No,Question,Option A,Option B,Option C,Option D,Correct Option,Category\n");

        List<Question> questions = quiz.getQuestions();
        for (int i = 0; i < questions.size(); i++) {
            Question q = questions.get(i);
            List<String> opts = q.getOptions() == null ? List.of() : q.getOptions();

            String optionA = opts.size() > 0 ? opts.get(0) : "";
            String optionB = opts.size() > 1 ? opts.get(1) : "";
            String optionC = opts.size() > 2 ? opts.get(2) : "";
            String optionD = opts.size() > 3 ? opts.get(3) : "";

            String correctOption = "";
            if (q.getCorrectAnswerIndex() != null && q.getCorrectAnswerIndex() >= 0 && q.getCorrectAnswerIndex() < opts.size()) {
                correctOption = opts.get(q.getCorrectAnswerIndex());
            }

            csv
                    .append(i + 1).append(',')
                    .append(csvEscape(q.getQuestionText())).append(',')
                    .append(csvEscape(optionA)).append(',')
                    .append(csvEscape(optionB)).append(',')
                    .append(csvEscape(optionC)).append(',')
                    .append(csvEscape(optionD)).append(',')
                    .append(csvEscape(correctOption)).append(',')
                    .append(csvEscape(q.getCategory()))
                    .append('\n');
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    public byte[] exportQuizAsPdf(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found for id=" + quizId));

        try (PDDocument document = new PDDocument(); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            document.addPage(page);

            PDPageContentStream content = new PDPageContentStream(document, page);
            content.setFont(FONT_HELVETICA_BOLD, 14);

            float margin = 50;
            float y = 760;
            float leading = 18;

            content.beginText();
            content.newLineAtOffset(margin, y);
            content.showText("Quiz Export: " + (quiz.getTitle() == null ? "Untitled Quiz" : quiz.getTitle()));
            content.newLineAtOffset(0, -leading);
            content.setFont(FONT_HELVETICA, 11);
            content.showText("Difficulty: " + (quiz.getDifficulty() == null ? "medium" : quiz.getDifficulty()));
            content.newLineAtOffset(0, -leading);
            content.showText("Questions: " + quiz.getQuestions().size());
            content.endText();

            y -= (leading * 4);

            for (int i = 0; i < quiz.getQuestions().size(); i++) {
                Question q = quiz.getQuestions().get(i);
                List<String> options = q.getOptions() == null ? List.of() : q.getOptions();

                if (y < 120) {
                    content.close();
                    page = new PDPage();
                    document.addPage(page);
                    content = new PDPageContentStream(document, page);
                    y = 760;
                }

                y = writeWrappedLine(content, margin, y, 500, "Q" + (i + 1) + ": " + nullSafe(q.getQuestionText()), 12, true);

                for (int optIdx = 0; optIdx < options.size(); optIdx++) {
                    String prefix = switch (optIdx) {
                        case 0 -> "A) ";
                        case 1 -> "B) ";
                        case 2 -> "C) ";
                        case 3 -> "D) ";
                        default -> "- ";
                    };
                    y = writeWrappedLine(content, margin + 16, y, 484, prefix + nullSafe(options.get(optIdx)), 10, false);
                }

                String correct = "N/A";
                if (q.getCorrectAnswerIndex() != null && q.getCorrectAnswerIndex() >= 0 && q.getCorrectAnswerIndex() < options.size()) {
                    correct = options.get(q.getCorrectAnswerIndex());
                }
                y = writeWrappedLine(content, margin + 16, y, 484, "Correct: " + correct, 10, false);
                y = writeWrappedLine(content, margin + 16, y, 484, "Category: " + nullSafe(q.getCategory()), 10, false);
                y -= 8;
            }

            content.close();
            document.save(outputStream);
            return outputStream.toByteArray();
        } catch (Exception ex) {
            throw new RuntimeException("Failed to export PDF: " + ex.getMessage(), ex);
        }
    }

    private String csvEscape(String value) {
        if (value == null) {
            return "\"\"";
        }
        String escaped = value.replace("\"", "\"\"");
        return "\"" + escaped + "\"";
    }

    private String nullSafe(String value) {
        return value == null ? "" : value;
    }

    private float writeWrappedLine(
            PDPageContentStream content,
            float x,
            float y,
            float maxWidth,
            String text,
            int fontSize,
            boolean bold
    ) throws Exception {
        var font = bold ? FONT_HELVETICA_BOLD : FONT_HELVETICA;
        content.setFont(font, fontSize);

        String[] words = nullSafe(text).split(" ");
        StringBuilder line = new StringBuilder();
        float lineHeight = fontSize + 4;

        for (String word : words) {
            String candidate = line.isEmpty() ? word : line + " " + word;
            float width = font.getStringWidth(candidate) / 1000 * fontSize;
            if (width > maxWidth && !line.isEmpty()) {
                content.beginText();
                content.newLineAtOffset(x, y);
                content.showText(line.toString());
                content.endText();
                y -= lineHeight;
                line = new StringBuilder(word);
            } else {
                line = new StringBuilder(candidate);
            }
        }

        if (!line.isEmpty()) {
            content.beginText();
            content.newLineAtOffset(x, y);
            content.showText(line.toString());
            content.endText();
            y -= lineHeight;
        }

        return y;
    }
}
