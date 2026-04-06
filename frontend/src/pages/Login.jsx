import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login delay
    await new Promise((r) => setTimeout(r, 800));
    setIsLoading(false);

    let finalName = name;
    if (!finalName && email) {
      finalName = email.split('@')[0];
      finalName = finalName.charAt(0).toUpperCase() + finalName.slice(1);
    }
    
    if (onLogin) onLogin({ name: finalName, email });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 primary-gradient relative overflow-hidden items-center justify-center p-16">
        {/* Decorative shapes */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 w-32 h-32 border-2 border-white/10 rounded-2xl rotate-12"></div>
        <div className="absolute bottom-1/3 left-1/3 w-24 h-24 border-2 border-white/10 rounded-full"></div>

        <div className="relative z-10 text-center max-w-md">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/20">
            <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">Curator AI</h1>
          <p className="text-white/70 text-lg font-medium leading-relaxed">
            Transform your documents into intelligent quizzes. Upload, learn, and master any subject with AI-powered assessments.
          </p>
          <div className="mt-12 flex items-center justify-center gap-8 text-white/50">
            <div className="text-center">
              <div className="text-2xl font-black text-white/80">10K+</div>
              <div className="text-xs uppercase tracking-widest font-bold">Quizzes</div>
            </div>
            <div className="w-px h-10 bg-white/20"></div>
            <div className="text-center">
              <div className="text-2xl font-black text-white/80">98%</div>
              <div className="text-xs uppercase tracking-widest font-bold">Accuracy</div>
            </div>
            <div className="w-px h-10 bg-white/20"></div>
            <div className="text-center">
              <div className="text-2xl font-black text-white/80">5K+</div>
              <div className="text-xs uppercase tracking-widest font-bold">Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="w-10 h-10 primary-glow rounded-xl flex items-center justify-center text-white">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tighter text-indigo-600">Curator AI</h1>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-extrabold tracking-tight text-on-surface mb-2">
              {isSignup ? 'Create an account' : 'Welcome back'}
            </h2>
            <p className="text-on-surface-variant font-medium">
              {isSignup ? 'Sign up to start generating intelligent quizzes' : 'Sign in to your account to continue learning'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignup && (
              <div className="animate-fade-in-up">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                  Full Name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full px-4 py-3.5 bg-surface-container-low rounded-xl border-0 text-on-surface font-medium placeholder:text-outline-variant focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all outline-none"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@curator.ai"
                className="w-full px-4 py-3.5 bg-surface-container-low rounded-xl border-0 text-on-surface font-medium placeholder:text-outline-variant focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="w-full px-4 py-3.5 bg-surface-container-low rounded-xl border-0 text-on-surface font-medium placeholder:text-outline-variant focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all outline-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-primary" />
                <span className="text-sm font-medium text-on-surface-variant">Remember me</span>
              </label>
              <button type="button" className="text-sm font-semibold text-primary hover:text-primary-dim transition-colors">
                Forgot password?
              </button>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-4 primary-gradient text-white font-bold rounded-xl shadow-xl shadow-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{isSignup ? "Creating account..." : "Signing in..."}</span>
                </>
              ) : (
                <>
                  <span>{isSignup ? "Sign up" : "Sign in"}</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-on-surface-variant">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{' '}
            <button 
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="font-bold text-primary hover:text-primary-dim transition-colors cursor-pointer"
            >
              {isSignup ? "Sign in instead" : "Sign up for free"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
