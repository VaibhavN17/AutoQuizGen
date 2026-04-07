import { useLocation, useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../lib/api';

const PROGRESS_STORAGE_KEY = 'autoquiz.progress';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    quizId = null,
    score = 0, 
    correct = 0, 
    total = 0, 
    timeElapsed = '0:00',
    questions = [],
    title = 'Quiz Results'
  } = location.state || {};

  // Calculate category performance
  const categories = {};
  questions.forEach((q, i) => {
    if (!categories[q.category]) {
      categories[q.category] = { correct: 0, total: 0 };
    }
    categories[q.category].total++;
    const userAnswer = location.state?.answers?.[i];
    if (userAnswer === q.correctAnswer) {
      categories[q.category].correct++;
    }
  });

  const categoryPerformance = Object.entries(categories).map(([name, data]) => ({
    name,
    score: Math.round((data.correct / data.total) * 100),
    correct: data.correct,
    total: data.total,
  }));

  const weakAreas = categoryPerformance.filter((c) => c.score < 60);
  const strongAreas = categoryPerformance.filter((c) => c.score >= 80);
  const wrong = total - correct;

  const progressCount = (() => {
    try {
      const progress = JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) || '[]');
      return Array.isArray(progress) ? progress.length : 0;
    } catch {
      return 0;
    }
  })();

  const handleExport = async (type) => {
    if (!quizId) {
      alert('Export is available only for saved quizzes.');
      return;
    }

    try {
      const response = await fetch(buildApiUrl(`/quizzes/${quizId}/export/${type}`));
      if (!response.ok) {
        throw new Error(`Export failed (${response.status})`);
      }

      const blob = await response.blob();
      const extension = type === 'pdf' ? 'pdf' : 'csv';
      const downloadName = `${(title || 'quiz').replace(/[^a-zA-Z0-9-_]+/g, '_')}-${quizId}.${extension}`;

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = downloadName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('Unable to export file right now.');
    }
  };

  // SVG circle calculations
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="p-8 lg:p-12 max-w-7xl animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-4">
        <div>
          <p className="text-primary font-bold tracking-widest text-[10px] uppercase mb-2">Quiz Completed</p>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-on-surface">
            {title}
          </h1>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2.5 bg-surface-container-low text-on-surface-variant font-semibold rounded-lg flex items-center gap-2 hover:bg-surface-container-high transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-lg">share</span>
            Share Results
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="px-6 py-2.5 bg-surface-container-low text-on-surface-variant font-semibold rounded-lg flex items-center gap-2 hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
            Export PDF
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="px-6 py-2.5 bg-surface-container-low text-on-surface-variant font-semibold rounded-lg flex items-center gap-2 hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">table_view</span>
            Export CSV
          </button>
          <button
            onClick={() => navigate('/quiz')}
            className="px-6 py-2.5 primary-gradient text-white font-semibold rounded-lg shadow-xl shadow-indigo-500/20 active:scale-95 duration-150 cursor-pointer"
          >
            Review Answers
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Score Indicator */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-2xl p-8 shadow-sm relative overflow-hidden flex flex-col items-center justify-center text-center">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
          <div className="relative w-48 h-48 flex items-center justify-center mb-6">
            <svg className="w-full h-full -rotate-90">
              <circle
                className="text-surface-container-low"
                cx="96" cy="96" fill="transparent" r={radius}
                stroke="currentColor" strokeWidth="12"
              />
              <circle
                className="text-primary transition-all duration-1000"
                cx="96" cy="96" fill="transparent" r={radius}
                stroke="currentColor"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeWidth="12"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-black tracking-tighter text-on-surface animate-count-up">{score}%</span>
              <span className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Score</span>
            </div>
          </div>
          <p className="text-on-surface-variant text-sm font-medium max-w-[200px]">
            You performed better than 92% of other participants.
          </p>
        </div>

        {/* Performance Breakdown */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-2xl p-8 shadow-sm relative overflow-hidden">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-lg font-bold text-on-surface">Performance Breakdown</h3>
                <p className="text-sm text-on-surface-variant">
                    {total} Questions total • {timeElapsed} Completion time • {progressCount} attempts tracked
                </p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#10b981]"></span>
                  <span className="text-sm font-bold">{correct} Correct</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ef4444]"></span>
                  <span className="text-sm font-bold">{wrong} Wrong</span>
                </div>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="flex-1 flex items-end justify-between gap-3 lg:gap-4 h-48 pb-4">
              {categoryPerformance.map((cat) => (
                <div key={cat.name} className="flex-1 flex flex-col gap-2 group">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 hover:opacity-80 ${
                      cat.score >= 60 ? 'bg-[#10b981]' : 'bg-[#ef4444] opacity-80'
                    }`}
                    style={{ height: `${Math.max(cat.score, 10)}%` }}
                  ></div>
                  <span className="text-[10px] font-bold text-center text-on-surface-variant truncate">
                    {cat.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weak Areas */}
        <div className="col-span-12 lg:col-span-5 bg-surface-container-lowest rounded-2xl p-8 shadow-sm">
          <h3 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-error">trending_down</span>
            Weak Areas
          </h3>
          <div className="flex flex-wrap gap-3">
            {weakAreas.length > 0 ? (
              weakAreas.map((area) => (
                <div
                  key={area.name}
                  className="px-4 py-2 bg-error/10 text-error rounded-full text-sm font-bold flex items-center gap-2"
                >
                  {area.name}
                  <span className="material-symbols-outlined text-xs">priority_high</span>
                </div>
              ))
            ) : (
              <>
                <div className="px-4 py-2 bg-error/10 text-error rounded-full text-sm font-bold flex items-center gap-2">
                  Visual Hierarchy
                  <span className="material-symbols-outlined text-xs">priority_high</span>
                </div>
                <div className="px-4 py-2 bg-error/10 text-error rounded-full text-sm font-bold flex items-center gap-2">
                  Grid Systems
                  <span className="material-symbols-outlined text-xs">priority_high</span>
                </div>
                <div className="px-4 py-2 bg-error/10 text-error rounded-full text-sm font-bold flex items-center gap-2">
                  Typography Contrast
                  <span className="material-symbols-outlined text-xs">priority_high</span>
                </div>
              </>
            )}
          </div>
          <p className="mt-8 text-sm text-on-surface-variant italic">
            Suggested Review: Chapter 4 - Layout & Composition
          </p>
        </div>

        {/* Mastered Concepts */}
        <div className="col-span-12 lg:col-span-7 bg-surface-container-lowest rounded-2xl p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-on-surface mb-2">Mastered Concepts</h3>
            <p className="text-sm text-on-surface-variant mb-6">You've shown exceptional understanding in these categories.</p>
            <div className="space-y-4">
              {(strongAreas.length > 0 ? strongAreas.slice(0, 2) : [
                { name: 'Color Psychology', score: 100 },
                { name: 'Font Pairings', score: 94 },
              ]).map((area) => (
                <div key={area.name}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-sm">palette</span>
                      </div>
                      <span className="font-bold text-sm">{area.name}</span>
                    </div>
                    <span className="text-primary font-black">{area.score}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container-low rounded-full mt-2">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-1000"
                      style={{ width: `${area.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="col-span-12 bg-primary py-10 px-8 lg:px-12 rounded-3xl overflow-hidden relative shadow-2xl shadow-primary/30">
          <div className="absolute -right-12 -bottom-12 opacity-10">
            <span className="material-symbols-outlined text-[200px]">rocket_launch</span>
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Ready to Level Up?</h2>
            <p className="text-primary-container text-lg font-medium max-w-xl mb-8">
              Take the 'Advanced Component Engineering' quiz to unlock your next certification badge.
            </p>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => navigate('/upload')}
                className="px-8 py-3 bg-white text-primary font-bold rounded-xl hover:shadow-xl transition-all active:scale-95 duration-150 cursor-pointer"
              >
                Explore Next Quiz
              </button>
              <button className="px-8 py-3 bg-primary-dim text-white font-bold rounded-xl hover:bg-opacity-80 transition-all border border-white/10 cursor-pointer">
                Download Certificate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
