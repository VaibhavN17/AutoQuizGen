import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const processLocalFile = (selectedFile) => {
    setFile(selectedFile);
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 300);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) processLocalFile(droppedFile);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) processLocalFile(selectedFile);
  };

  const handleGenerate = () => {
    navigate('/processing', {
      state: {
        file,
        questionCount,
        difficulty,
      },
    });
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  const progress = Math.min(Math.round(uploadProgress), 100);

  return (
    <div className="p-8 lg:p-12 min-h-[calc(100vh-64px)] overflow-y-auto animate-fade-in-up">
      <div className="max-w-4xl mx-auto">
        {/* Editorial Header */}
        <header className="mb-12">
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">
            Transform Content to Knowledge
          </h2>
          <p className="text-on-surface-variant max-w-2xl text-lg">
            Upload your lecture notes, whitepapers, or documents to instantly generate structured quizzes with our advanced AI engine.
          </p>
        </header>

        {/* Main Upload Card */}
        <div className="bg-surface-container-lowest rounded-3xl shadow-xl shadow-slate-200/50 p-8 relative overflow-hidden">
          {/* Decoration Gradient */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>

          <div className="relative z-10">
            {/* Drop Area */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`custom-dashed rounded-2xl p-12 mb-8 flex flex-col items-center justify-center text-center cursor-pointer group transition-all duration-200 ${
                isDragOver ? 'bg-primary/5 scale-[1.01]' : 'hover:bg-slate-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <div className={`w-16 h-16 bg-primary-container/20 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 ${isDragOver ? 'scale-125' : 'group-hover:scale-110'}`}>
                <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  upload_file
                </span>
              </div>
              <h3 className="text-2xl font-bold text-on-surface mb-2">Upload PDF / DOCX</h3>
              <p className="text-on-surface-variant mb-4">
                Drag and drop your files here, or click to browse local storage
              </p>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-surface-container rounded-lg text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Max 50MB
                </span>
                <span className="px-3 py-1 bg-surface-container rounded-lg text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  PDF, DOCX, TXT
                </span>
              </div>
            </div>

            {/* Active File Upload */}
            {file && (
              <div className="bg-surface-container-low rounded-2xl p-6 mb-8 border border-slate-200/30 animate-fade-in-up">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                      description
                    </span>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-on-surface">{file.name}</h4>
                      <span className="text-sm font-bold text-primary">{progress}%</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mb-3 uppercase tracking-tighter font-semibold">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB • {isUploading ? 'Processing text structures...' : 'Upload complete'}
                    </p>
                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
                    className="text-on-surface-variant hover:text-error transition-colors p-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                  Number of Questions
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={questionCount}
                  onChange={(e) => {
                    const parsedValue = Number.parseInt(e.target.value, 10);
                    if (Number.isNaN(parsedValue)) {
                      setQuestionCount(1);
                      return;
                    }
                    setQuestionCount(Math.min(50, Math.max(1, parsedValue)));
                  }}
                  className="w-full px-4 py-3.5 bg-surface-container-low rounded-xl border-0 text-on-surface font-medium placeholder:text-outline-variant focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3.5 bg-surface-container-low rounded-xl border-0 text-on-surface font-medium focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all outline-none"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <button
                id="generate-quiz-btn"
                onClick={handleGenerate}
                disabled={!file || progress < 100}
                className={`w-full sm:w-64 py-4 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${
                  file && progress >= 100
                    ? 'primary-gradient text-white shadow-xl shadow-indigo-200 hover:shadow-2xl active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span className="material-symbols-outlined text-xl">psychology</span>
                <span>Generate Quiz</span>
              </button>
              <p className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
                <span className="material-symbols-outlined text-sm animate-pulse">timer</span>
                This may take 10-20 seconds
              </p>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-surface-container-low rounded-2xl flex flex-col gap-3 hover:bg-surface-container-lowest hover:shadow-sm transition-all">
            <span className="material-symbols-outlined text-tertiary">bolt</span>
            <h5 className="font-bold">Neural Parsing</h5>
            <p className="text-sm text-on-surface-variant">Our AI reads beyond the text to understand context and intent.</p>
          </div>
          <div className="p-6 bg-surface-container-low rounded-2xl flex flex-col gap-3 hover:bg-surface-container-lowest hover:shadow-sm transition-all">
            <span className="material-symbols-outlined text-secondary">verified</span>
            <h5 className="font-bold">Fact Checking</h5>
            <p className="text-sm text-on-surface-variant">Automatically cross-references data to ensure quiz accuracy.</p>
          </div>
          <div className="p-6 bg-surface-container-low rounded-2xl flex flex-col gap-3 hover:bg-surface-container-lowest hover:shadow-sm transition-all">
            <span className="material-symbols-outlined text-primary">auto_graph</span>
            <h5 className="font-bold">Smart Difficulty</h5>
            <p className="text-sm text-on-surface-variant">Adapts question complexity based on the source content depth.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
