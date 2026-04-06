import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { buildApiUrl } from '../lib/api';

export default function History() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const res = await fetch(buildApiUrl('/quizzes'));
        if (!res.ok) {
          throw new Error(`Failed to load quizzes (${res.status})`);
        }

        const data = await res.json();
        if (Array.isArray(data)) {
          setQuizzes(data);
          setLoadError('');
          return;
        }

        setQuizzes([]);
        setLoadError('Unexpected response from server.');
      } catch (error) {
        console.error(error);
        setQuizzes([]);
        setLoadError('Unable to load quiz history. Check backend and database connection.');
      }
    };

    loadQuizzes();
  }, []);

  const sortedQuizzes = [...quizzes].reverse();

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-extrabold tracking-tighter text-on-surface">Your Learning Journey</h2>
          <p className="text-on-surface-variant font-medium max-w-md">
            Review your previous quiz performances and track your intellectual growth over time.
          </p>
          {loadError && <p className="text-sm font-medium text-error">{loadError}</p>}
        </div>
        <div className="flex gap-3">
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined">auto_awesome</span>
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight">{quizzes.length}</div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Total Quizzes</div>
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-surface-container-lowest rounded-[2rem] shadow-2xl shadow-slate-200/40 overflow-hidden relative">
        {/* Left Accent Bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-full"></div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/50">
              <th className="px-6 lg:px-8 py-6 text-[11px] uppercase tracking-[0.2em] font-black text-on-surface-variant/70">
                Date
              </th>
              <th className="px-6 lg:px-8 py-6 text-[11px] uppercase tracking-[0.2em] font-black text-on-surface-variant/70">
                Quiz Name
              </th>
              <th className="px-6 lg:px-8 py-6 text-[11px] uppercase tracking-[0.2em] font-black text-on-surface-variant/70">
                Score
              </th>
              <th className="px-6 lg:px-8 py-6 text-[11px] uppercase tracking-[0.2em] font-black text-on-surface-variant/70 text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {sortedQuizzes.map((quiz) => (
              <tr key={quiz.id} className="group hover:bg-surface-container-low/30 transition-all">
                <td className="px-6 lg:px-8 py-6 lg:py-8">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-on-surface">{new Date(quiz.createdAt).toLocaleDateString()}</span>
                    <span className="text-xs text-on-surface-variant">{new Date(quiz.createdAt).toLocaleTimeString()}</span>
                  </div>
                </td>
                <td className="px-6 lg:px-8 py-6 lg:py-8">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-primary-container/20 text-primary`}>
                      <span className="material-symbols-outlined text-xl">quiz</span>
                    </div>
                    <span className="text-sm lg:text-base font-semibold text-on-surface">{quiz.title || 'Generated Quiz'}</span>
                  </div>
                </td>
                <td className="px-6 lg:px-8 py-6 lg:py-8">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-surface-container-high h-1.5 rounded-full max-w-[80px]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 bg-primary`}
                        style={{ width: `0%` }}
                      ></div>
                    </div>
                    <span className={`text-sm font-black text-primary`}>
                      N/A
                    </span>
                  </div>
                </td>
                <td className="px-6 lg:px-8 py-6 lg:py-8 text-right">
                  <button
                    onClick={() => navigate('/quiz', { state: { quiz } })}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary text-sm font-bold rounded-xl shadow-md shadow-primary/10 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 cursor-pointer"
                  >
                    Take Quiz
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </td>
              </tr>
            ))}
            {sortedQuizzes.length === 0 && (
               <tr><td colSpan="4" className="text-center py-8 text-on-surface-variant flex items-center justify-center">No quizzes found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {/* Motivational Banner */}
        <div className="md:col-span-2 bg-gradient-to-r from-secondary to-secondary-dim p-8 rounded-3xl text-on-secondary flex justify-between items-center relative overflow-hidden group">
          <div className="relative z-10 space-y-4">
            <div className="space-y-1">
              <h4 className="text-2xl font-black tracking-tight">Level Up Your Knowledge</h4>
              <p className="text-on-secondary/80 text-sm max-w-sm">
                You've generated {quizzes.length} total quizzes so far. Keep the momentum!
              </p>
            </div>
            <button
              onClick={() => navigate('/upload')}
              className="px-6 py-2.5 bg-white text-secondary font-bold rounded-xl hover:bg-secondary-container transition-colors cursor-pointer"
            >
              Generate New Quiz
            </button>
          </div>
          <div className="absolute -right-12 -bottom-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <span className="material-symbols-outlined text-[200px]">trending_up</span>
          </div>
        </div>

        {/* Badge Card */}
        <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/10 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              military_tech
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Badge Earned</span>
          </div>
          <div className="mt-6">
            <h4 className="text-xl font-bold tracking-tight">Consistent Scholar</h4>
            <p className="text-xs text-on-surface-variant mt-1">7-day daily quiz streak maintained.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
