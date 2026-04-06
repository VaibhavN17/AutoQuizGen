import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Quiz({ onTimerUpdate }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [timeElapsed, setTimeElapsed] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const quizData = location.state?.quiz;
  const questions = quizData ? quizData.questions.map((q, idx) => ({
    id: q.id || idx,
    question: q.questionText,
    options: q.options,
    correctAnswer: q.correctAnswerIndex,
    category: q.category || 'Generated'
  })) : [];

  useEffect(() => {
    if (!quizData || questions.length === 0) {
      navigate('/');
    }
  }, [quizData, questions.length, navigate]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update timer display in TopNav
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }, []);

  useEffect(() => {
    if (onTimerUpdate) {
      onTimerUpdate(formatTime(timeElapsed));
    }
  }, [timeElapsed, onTimerUpdate, formatTime]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (onTimerUpdate) onTimerUpdate(null);
    };
  }, [onTimerUpdate]);

  if (questions.length === 0) return null;

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleSelectAnswer = (optionIndex) => {
    setSelectedAnswers({ ...selectedAnswers, [currentQuestion]: optionIndex });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleFlag = () => {
    setFlagged({ ...flagged, [currentQuestion]: !flagged[currentQuestion] });
  };

  const handleSubmit = () => {
    // Calculate score and navigate to results
    let correct = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correct++;
      }
    });
    const score = Math.round((correct / questions.length) * 100);
    navigate('/results', {
      state: {
        score,
        correct,
        total: questions.length,
        answers: selectedAnswers,
        timeElapsed: formatTime(timeElapsed),
        questions,
        title: quizData?.title || 'Generated Quiz',
      },
    });
  };

  const isLastQuestion = currentQuestion === questions.length - 1;

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-64px)]">
      <div className="flex-1 max-w-4xl w-full mx-auto p-8 lg:p-12 flex flex-col animate-fade-in-up">
        {/* Progress Bar Section */}
        <div className="mb-12">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-1">Current Session</h2>
              <p className="text-2xl font-black text-on-surface tracking-tight">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">Completion</span>
              <p className="text-lg font-bold text-on-surface">{Math.round(progress)}%</p>
            </div>
          </div>
          <div className="w-full h-3 bg-surface-container-low rounded-full overflow-hidden">
            <div
              className="h-full primary-glow rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="relative group">
          <div className="bg-surface-container-lowest rounded-3xl p-8 lg:p-10 shadow-2xl shadow-slate-200/40 border-l-4 border-primary">
            <h3 className="text-2xl lg:text-3xl font-extrabold text-on-surface leading-tight tracking-tight mb-10 lg:mb-12">
              {question.question}
            </h3>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswers[currentQuestion] === index;
                return (
                  <label
                    key={index}
                    onClick={() => handleSelectAnswer(index)}
                    className={`group relative flex items-center p-5 lg:p-6 rounded-2xl cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-surface-container-lowest border-2 border-primary shadow-lg shadow-indigo-50/50'
                        : 'bg-surface-container-low border-2 border-transparent hover:bg-surface-container-lowest hover:border-primary/20'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-primary bg-primary'
                          : 'border-outline-variant'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <span
                      className={`ml-4 text-sm lg:text-base font-medium transition-colors ${
                        isSelected ? 'font-bold text-primary' : 'text-on-surface group-hover:text-primary'
                      }`}
                    >
                      {option}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
          {/* Background decorative element */}
          <div className="absolute -z-10 -bottom-4 -right-4 w-full h-full bg-indigo-100/30 rounded-3xl blur-2xl"></div>
        </div>

        {/* Navigation Actions */}
        <div className="mt-12 lg:mt-16 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className={`px-6 lg:px-8 py-3 lg:py-4 bg-surface-container-high text-primary font-bold rounded-2xl flex items-center gap-3 transition-all cursor-pointer ${
              currentQuestion === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Previous
          </button>

          <div className="flex gap-4">
            <button
              onClick={handleFlag}
              className={`p-3 lg:p-4 rounded-2xl transition-all cursor-pointer ${
                flagged[currentQuestion]
                  ? 'bg-error/10 text-error'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined" style={flagged[currentQuestion] ? { fontVariationSettings: "'FILL' 1" } : {}}>
                flag
              </span>
            </button>

            {isLastQuestion ? (
              <button
                onClick={handleSubmit}
                className="px-8 lg:px-12 py-3 lg:py-4 bg-green-600 text-white font-bold rounded-2xl flex items-center gap-3 shadow-xl shadow-green-200 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                Submit Quiz
                <span className="material-symbols-outlined">check_circle</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-8 lg:px-12 py-3 lg:py-4 primary-glow text-white font-bold rounded-2xl flex items-center gap-3 shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                Next
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Decorative Illustration */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 w-48 hidden 2xl:block opacity-20 pointer-events-none">
        <div className="space-y-4">
          <div className="h-32 w-full bg-primary/10 rounded-2xl transform rotate-6 border-2 border-primary/20"></div>
          <div className="h-32 w-full bg-secondary/10 rounded-2xl transform -rotate-3 border-2 border-secondary/20"></div>
          <div className="h-32 w-full bg-tertiary/10 rounded-2xl transform rotate-12 border-2 border-tertiary/20"></div>
        </div>
      </div>
    </div>
  );
}
