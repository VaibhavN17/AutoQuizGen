import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { buildApiUrl } from '../lib/api';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalQuizzesCreated: 0,
    totalAttempts: 0,
    averageScore: 0,
    currentStreak: 0,
    categoryStats: {},
    dailyActivity: {},
    attemptsPerQuiz: {},
    topQuizzes: [],
    scoreDistribution: {},
  });
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const dashboardRes = await fetch(buildApiUrl('/quizzes/analytics/dashboard'));
        if (!dashboardRes.ok) {
          throw new Error(`Failed to load dashboard stats (${dashboardRes.status})`);
        }
        const dashboardData = await dashboardRes.json();

        const categoryRes = await fetch(buildApiUrl('/quizzes/analytics/category-stats'));
        const categoryData = categoryRes.ok ? await categoryRes.json() : {};

        const dailyRes = await fetch(buildApiUrl('/quizzes/analytics/daily-activity'));
        const dailyData = dailyRes.ok ? await dailyRes.json() : {};

        const attemptsRes = await fetch(buildApiUrl('/quizzes/analytics/attempts-per-quiz'));
        const attemptsData = attemptsRes.ok ? await attemptsRes.json() : {};

        const topRes = await fetch(buildApiUrl('/quizzes/analytics/top-quizzes'));
        const topData = topRes.ok ? await topRes.json() : [];

        const scoreRes = await fetch(buildApiUrl('/quizzes/analytics/score-distribution'));
        const scoreData = scoreRes.ok ? await scoreRes.json() : {};

        setStats({
          totalQuizzesCreated: dashboardData.totalQuizzesCreated || 0,
          totalAttempts: dashboardData.totalAttempts || 0,
          averageScore: dashboardData.averageScore || 0,
          currentStreak: dashboardData.currentStreak || 0,
          categoryStats: categoryData || {},
          dailyActivity: dailyData || {},
          attemptsPerQuiz: attemptsData.data || {},
          topQuizzes: topData || [],
          scoreDistribution: scoreData || {},
        });
        setLoadError('');
      } catch (error) {
        console.error('Analytics load error:', error);
        setLoadError('Unable to load analytics. Make sure backend is running.');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  // Chart configurations
  const dailyActivityChart = {
    labels: Object.keys(stats.dailyActivity),
    datasets: [
      {
        label: 'Attempts',
        data: Object.values(stats.dailyActivity),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
      },
    ],
  };

  const categoryChart = {
    labels: Object.keys(stats.categoryStats),
    datasets: [
      {
        label: 'Average Score by Difficulty',
        data: Object.values(stats.categoryStats),
        backgroundColor: [
          'rgba(34, 197, 94, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(239, 68, 68, 0.7)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(249, 115, 22)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const scoreDistributionChart = {
    labels: Object.keys(stats.scoreDistribution),
    datasets: [
      {
        data: Object.values(stats.scoreDistribution),
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(59, 130, 246, 0.7)',
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(249, 115, 22)',
          'rgb(234, 179, 8)',
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        labels: {
          font: { size: 12, weight: 'bold' },
          color: '#382f8c',
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
      },
    },
  };

  if (loading) {
    return (
      <div className="p-8 lg:p-12 max-w-7xl animate-fade-in-up">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <span className="material-symbols-outlined text-4xl text-primary">progress_activity</span>
          </div>
          <p className="mt-4 text-on-surface-variant font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 max-w-7xl animate-fade-in-up">
      {/* Header */}
      <div className="mb-12">
        <p className="text-primary font-bold tracking-widest text-[10px] uppercase mb-2">📊 Analytics Dashboard</p>
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">Your Learning Hub</h1>
        {loadError && <p className="mt-3 text-sm font-medium text-error">{loadError}</p>}
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Total Quizzes */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-primary">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>quiz</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Total</span>
          </div>
          <div className="text-3xl font-black text-on-surface">{stats.totalQuizzesCreated}</div>
          <p className="text-xs font-medium text-on-surface-variant mt-1">Quizzes created</p>
        </div>

        {/* Total Attempts */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-secondary">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>assignment</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Attempts</span>
          </div>
          <div className="text-3xl font-black text-on-surface">{stats.totalAttempts}</div>
          <p className="text-xs font-medium text-on-surface-variant mt-1">Attempts made</p>
        </div>

        {/* Average Score */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-tertiary">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-tertiary-container/20 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Avg</span>
          </div>
          <div className="text-3xl font-black text-on-surface">{stats.averageScore.toFixed(1)}%</div>
          <p className="text-xs font-medium text-on-surface-variant mt-1">Average score</p>
        </div>

        {/* Streak */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-error">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-error-container/20 flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Streak</span>
          </div>
          <div className="text-3xl font-black text-on-surface">{stats.currentStreak}</div>
          <p className="text-xs font-medium text-on-surface-variant mt-1">Days in a row</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Daily Activity Chart */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">show_chart</span>
            📈 Daily Activity (7 days)
          </h2>
          <div className="h-80">
            {Object.keys(stats.dailyActivity).length > 0 ? (
              <Line data={dailyActivityChart} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: false } } }} />
            ) : (
              <p className="text-on-surface-variant font-medium">No activity data yet</p>
            )}
          </div>
        </div>

        {/* Score Distribution Chart */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">pie_chart</span>
            📊 Score Distribution
          </h2>
          <div className="h-80">
            {Object.keys(stats.scoreDistribution).length > 0 ? (
              <Doughnut data={scoreDistributionChart} options={chartOptions} />
            ) : (
              <p className="text-on-surface-variant font-medium">No score data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Performance by Difficulty */}
      <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm mb-12">
        <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-tertiary">auto_awesome</span>
          📉 Performance by Difficulty
        </h2>
        <div className="h-80">
          {Object.keys(stats.categoryStats).length > 0 ? (
            <Bar data={categoryChart} options={chartOptions} />
          ) : (
            <p className="text-on-surface-variant font-medium">No difficulty data yet</p>
          )}
        </div>
      </div>

      {/* Top Quizzes and Attempts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performing Quizzes */}
        {stats.topQuizzes.length > 0 && (
          <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">star</span>
              🏆 Top Performing Quizzes
            </h2>
            <div className="space-y-4">
              {stats.topQuizzes.map((quiz, idx) => (
                <div
                  key={quiz.id}
                  className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors cursor-pointer"
                  onClick={() => navigate(`/quiz/${quiz.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-container/30 flex items-center justify-center text-primary font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-on-surface text-sm">{quiz.title}</p>
                      <p className="text-xs text-on-surface-variant">{quiz.attempts} attempts</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-primary">{quiz.averageScore.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attempts Per Quiz */}
        {Object.keys(stats.attemptsPerQuiz).length > 0 && (
          <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">assignment_turned_in</span>
              📋 Attempts Per Quiz
            </h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {Object.entries(stats.attemptsPerQuiz).map(([title, count]) => (
                <div key={title} className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                  <span className="text-sm font-medium text-on-surface truncate flex-1">{title}</span>
                  <span className="ml-2 px-3 py-1 bg-primary-container/20 text-primary font-bold rounded-full text-sm whitespace-nowrap">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Empty State Message */}
      {stats.totalAttempts === 0 && (
        <div className="mt-12 p-12 bg-surface-container-lowest rounded-2xl text-center border-2 border-dashed border-outline-variant">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant opacity-30 display-block mb-4">trending_up</span>
          <h3 className="text-xl font-bold text-on-surface mb-2">No Activity Yet</h3>
          <p className="text-on-surface-variant mb-6">Start taking quizzes to see your analytics and progress tracking!</p>
          <button
            onClick={() => navigate('/upload')}
            className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:scale-105 transition-transform"
          >
            Create Your First Quiz
          </button>
        </div>
      )}
    </div>
  );
}
