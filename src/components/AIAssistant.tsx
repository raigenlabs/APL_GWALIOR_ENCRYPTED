import { useState } from 'react';
import { Sparkles, RefreshCw, X, ShieldAlert } from 'lucide-react';

export default function AIAssistant() {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchAIAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/analyze-match', { method: 'POST' });
      const data = await res.json();
      if (data.summary) {
        setAnalysis(data.summary);
      } else {
        setAnalysis('Unable to contact secure server analyst, please check secrets variables.');
      }
    } catch (e) {
      setAnalysis('Failed to contact PitchSide server. Ensure Gemini API Key is loaded in the workspace.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Sparkle Trigger Button */}
      <button
        id="btn_ai_analyst_float"
        onClick={() => {
          setIsOpen(true);
          if (!analysis) fetchAIAnalysis();
        }}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-brand-orange to-amber-500 text-white font-extrabold px-5 py-3.5 rounded-full flex items-center gap-2 shadow-[0_4px_20px_rgba(234,88,12,0.3)] border border-white hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-wider cursor-pointer z-50"
      >
        <Sparkles className="w-4 h-4 text-white animate-pulse" />
        AI Insights Hub
      </button>

      {/* Floating Insights Drawer */}
      {isOpen && (
        <div id="drawer_ai_analyst" className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-32px)] bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden z-50 flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="bg-slate-50 px-5 py-4 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="bg-orange-50 p-1 rounded-lg">
                <Sparkles className="w-4 h-4 text-brand-orange" />
              </div>
              <div>
                <span className="text-xs font-black text-slate-800 uppercase tracking-widest block">AI Match Intelligence</span>
                <span className="text-[9px] text-slate-400 font-bold font-mono uppercase tracking-widest">Powered by Gemini AI</span>
              </div>
            </div>
            <button
              id="btn_close_ai_analyst"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-800 p-1.5 hover:bg-slate-100 rounded-full cursor-pointer transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            <div className="text-slate-400 flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-400">Match Momentum Feed</span>
              <button
                id="btn_refresh_ai_analyst"
                onClick={fetchAIAnalysis}
                disabled={loading}
                className="text-slate-500 hover:text-slate-800 disabled:opacity-40 flex items-center gap-1 cursor-pointer text-[10px] font-black uppercase tracking-wider"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                Refresh Analysis
              </button>
            </div>

            {loading ? (
              <div className="text-slate-500 py-12 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-orange-200 border-t-brand-orange rounded-full animate-spin" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider animate-pulse">Running live tactical scan...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {analysis.split('\n\n').map((paragraph, index) => {
                  let cleanPara = paragraph
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-extrabold">$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em class="text-slate-800 font-semibold">$1</em>');
                  
                  return (
                    <p 
                      key={index} 
                      className="border-l-2 border-orange-400 pl-3.5 leading-relaxed text-[11px] text-slate-600 font-semibold"
                      dangerouslySetInnerHTML={{ __html: cleanPara }}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-5 py-3 text-[9px] text-slate-400 text-center font-mono font-bold uppercase tracking-wider border-t border-slate-100">
            Realtime Analytics Core Agent Loaded
          </div>
        </div>
      )}
    </>
  );
}
