import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { buildApiUrl } from '../lib/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    avgScore: 0,
    streak: 0,
    bestCategory: 'N/A',
    worstCategory: 'N/A'
  });

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const res = await fetch(buildApiUrl('/quizzes'));
        if (!res.ok) {
          throw new Error(`Failed to load quizzes (${res.status})`);
        }

        const data = await res.json();
        const quizList = Array.isArray(data) ? data : [];

        if (!Array.isArray(data)) {
          setLoadError('Unexpected response from server.');
        } else {
          setLoadError('');
        }

        setQuizzes(quizList);
        setStats({
          totalQuizzes: quizList.length,
          // the backend currently doesn't persist user scores, using placeholders for other metrics
          avgScore: quizList.length > 0 ? 84 : 0,
          streak: quizList.length > 0 ? 3 : 0,
          bestCategory: 'Concepts',
          worstCategory: 'Syntax'
        });
      } catch (error) {
        console.error(error);
        setQuizzes([]);
        setLoadError('Unable to load dashboard data. Check backend and database connection.');
      }
    };

    loadQuizzes();
  }, []);

  const recentQuizzes = [...quizzes].reverse();

  return (
    <div className="p-8 lg:p-12 max-w-7xl animate-fade-in-up">
      {/* Header */}
      <div className="mb-12">
        <p className="text-primary font-bold tracking-widest text-[10px] uppercase mb-2">Welcome back</p>
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">Your Learning Hub</h1>
        {loadError && <p className="mt-3 text-sm font-medium text-error">{loadError}</p>}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Total Quizzes */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                quiz
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Total</span>
          </div>
          <div className="text-4xl font-black tracking-tight text-on-surface animate-count-up">{stats.totalQuizzes}</div>
          <p className="text-sm font-medium text-on-surface-variant mt-1">Quizzes completed</p>
        </div>

        {/* Average Score */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-secondary"></div>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Average</span>
          </div>
          <div className="text-4xl font-black tracking-tight text-on-surface animate-count-up">{stats.avgScore}%</div>
          <p className="text-sm font-medium text-on-surface-variant mt-1">Accuracy rate</p>
        </div>

        {/* Streak */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-tertiary"></div>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-tertiary-container/20 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_fire_department
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Streak</span>
          </div>
          <div className="text-4xl font-black tracking-tight text-on-surface animate-count-up">{stats.streak}</div>
          <p className="text-sm font-medium text-on-surface-variant mt-1">Day learning streak</p>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Quick Actions */}
        <div className="col-span-12 lg:col-span-5 bg-primary py-10 px-8 rounded-3xl overflow-hidden relative shadow-2xl shadow-primary/30 hover:shadow-3xl transition-shadow">
          <div className="absolute -right-8 -bottom-8 opacity-10">
            <span className="material-symbols-outlined text-[180px]">upload_file</span>
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-black text-white mb-3 tracking-tight">Upload & Generate</h2>
            <p className="text-primary-container text-sm font-medium max-w-xs mb-8">
              Drop your documents and let AI create a quiz for you in seconds.
            </p>
            <button
              onClick={() => navigate('/upload')}
              className="px-8 py-3 bg-white text-primary font-bold rounded-xl hover:shadow-xl transition-all active:scale-95 duration-150 cursor-pointer"
            >
              Upload Now
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-span-12 lg:col-span-7 bg-surface-container-lowest rounded-2xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-on-surface">Recent Activity</h3>
            <button
              onClick={() => navigate('/history')}
              className="text-sm font-semibold text-primary hover:text-primary-dim transition-colors cursor-pointer"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentQuizzes.slice(0, 3).map((quiz) => (
              <div
                key={quiz.id}
                className="flex items-center justify-between p-4 bg-surface-container-low/50 rounded-xl hover:bg-surface-container-low transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary`}>
                    <span className="material-symbols-outlined">quiz</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{quiz.title || 'Generated Quiz'}</p>
                    <p className="text-xs text-on-surface-variant">{new Date(quiz.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`text-sm font-black text-primary`}>
                  N/A
                </span>
              </div>
            ))}
            {recentQuizzes.length === 0 && <p className="text-sm text-on-surface-variant">No quizzes yet. Upload a document to generate one!</p>}
          </div>
        </div>

        {/* Performance Insight */}
        <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest rounded-2xl p-8 shadow-sm">
          <h3 className="text-lg font-bold text-on-surface mb-2">Top Strength</h3>
          <p className="text-sm text-on-surface-variant mb-6">Your best performing category</p>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>palette</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-on-surface">{stats.bestCategory}</p>
              <div className="w-full h-2 bg-surface-container-low rounded-full mt-2">
                <div className="h-full bg-primary rounded-full w-full transition-all duration-1000"></div>
              </div>
            </div>
            <span className="text-2xl font-black text-primary">100%</span>
          </div>
        </div>

        {/* Needs Improvement */}
        <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest rounded-2xl p-8 shadow-sm">
          <h3 className="text-lg font-bold text-on-surface mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-error">trending_down</span>
            Needs Improvement
          </h3>
          <p className="text-sm text-on-surface-variant mb-6">Focus on this area next</p>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-error-container/20 flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-2xl">grid_view</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-on-surface">{stats.worstCategory}</p>
              <div className="w-full h-2 bg-surface-container-low rounded-full mt-2">
                <div className="h-full bg-error rounded-full w-[30%] transition-all duration-1000"></div>
              </div>
            </div>
            <span className="text-2xl font-black text-error">30%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
