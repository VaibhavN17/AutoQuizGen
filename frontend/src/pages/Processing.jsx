import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { buildApiUrl } from '../lib/api';

const steps = [
  { label: 'Extracting text...', duration: 1500 },
  { label: 'Generating questions...', duration: 2500 },
  { label: 'Structuring curriculum...', duration: 1500 },
  { label: 'Finalizing insights...', duration: 1000 },
];

export default function Processing() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let totalDelay = 0;
    const timeouts = steps.map((step, index) => {
      if (index === steps.length - 1) return null; // Last step waits for fetch
      totalDelay += step.duration;
      return setTimeout(() => {
        setCurrentStep(index + 1);
      }, totalDelay);
    }).filter(Boolean);

    const file = location.state?.file;
    const questionCount = Number(location.state?.questionCount) || 10;
    const difficulty = location.state?.difficulty || 'medium';
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('numQuestions', String(questionCount));
      formData.append('difficulty', difficulty);
      
      fetch(buildApiUrl('/quizzes/generate'), {
        method: 'POST',
        body: formData,
      })
      .then(res => res.json())
      .then(data => {
        timeouts.forEach(clearTimeout);
        setCurrentStep(steps.length);
        setTimeout(() => navigate('/quiz', { state: { quiz: data } }), 800);
      })
      .catch(err => {
        console.error(err);
        timeouts.forEach(clearTimeout);
        navigate('/');
      });
    } else {
      const navTimeout = setTimeout(() => {
        navigate('/quiz');
      }, totalDelay + 800);
      timeouts.push(navTimeout);
    }

    return () => timeouts.forEach(clearTimeout);
  }, [navigate, location]);

  return (
    <div className="p-12 min-h-[calc(100vh-64px)] relative">
      {/* Background skeleton */}
      <div className="max-w-4xl mx-auto opacity-10">
        <div className="h-10 w-64 bg-slate-200 rounded-lg mb-8"></div>
        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="h-32 bg-slate-200 rounded-xl"></div>
          <div className="h-32 bg-slate-200 rounded-xl"></div>
          <div className="h-32 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="h-[400px] bg-slate-200 rounded-2xl w-full"></div>
      </div>

      {/* Processing Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="w-full max-w-xl p-1 bg-gradient-to-br from-primary/5 via-tertiary/5 to-secondary/5 rounded-[2rem] pointer-events-auto">
          <div className="bg-surface-container-lowest/90 backdrop-blur-3xl rounded-[1.9rem] p-12 text-center shadow-2xl shadow-primary/10 border border-white/40">
            
            {/* Modern Loader */}
            <div className="relative w-32 h-32 mx-auto mb-10">
              {/* Outer Glow */}
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse-ring"></div>
              {/* Main Ring */}
              <div className="absolute inset-0 border-[6px] border-surface-container-high rounded-full"></div>
              {/* Active Spinner */}
              <div className="absolute inset-0 border-[6px] border-t-primary border-r-primary border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              {/* Center Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-4xl text-primary animate-pulse"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  temp_preferences_custom
                </span>
              </div>
            </div>

            {/* Status Messaging */}
            <h2 className="text-3xl font-extrabold tracking-tight text-on-surface mb-3">
              Crafting Your Experience
            </h2>
            <p className="text-on-surface-variant font-medium mb-12 max-w-sm mx-auto">
              Our AI is analyzing your content to curate the perfect set of questions.
            </p>

            {/* Progress Steps */}
            <div className="space-y-6 max-w-xs mx-auto text-left">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 transition-all duration-500 ${
                    index < currentStep
                      ? 'opacity-100'
                      : index === currentStep
                      ? 'opacity-100'
                      : 'opacity-30'
                  }`}
                >
                  {index < currentStep ? (
                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                      <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'wght' 700" }}>
                        check
                      </span>
                    </div>
                  ) : index === currentStep ? (
                    <div className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-primary/40 animate-pulse">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    </div>
                  ) : (
                    <div className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-outline-variant"></div>
                  )}
                  <span
                    className={`text-sm ${
                      index === currentStep
                        ? 'font-semibold text-primary'
                        : index < currentStep
                        ? 'font-semibold text-on-surface'
                        : 'font-medium text-on-surface-variant'
                    }`}
                  >
                    {step.label}
                  </span>
                  {index === currentStep && (
                    <span className="ml-auto text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full tracking-wider">
                      AI PROCESSING
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Info Note */}
            <div className="mt-16 pt-8 border-t border-slate-100">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-full">
                <span className="material-symbols-outlined text-base text-secondary">info</span>
                <span className="text-xs font-medium text-on-surface-variant">
                  Larger documents may take up to 30 seconds
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Background */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10"></div>
    </div>
  );
}
