"use client";

import { useState } from "react";
import {
  Sparkles,
  Brain,
  Loader2,
  Copy,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  Zap,
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const SAMPLE_TEXT = `• Worked on the company website and helped fix bugs
• Was responsible for developing new features for the mobile app
• Did database work and made queries faster
• Assisted with the team's agile development process
• Made improvements to the CI/CD pipeline`;

const SECTIONS = ["Experience", "Projects", "Summary", "Achievements"];

interface Enhancement {
  enhanced: string;
  changes: { type: string; original: string; replacement: string; reason: string }[];
  actionVerbs: string[];
  score: { before: number; after: number };
  tips: string[];
}

export default function EnhancePage() {
  const [input, setInput] = useState("");
  const [section, setSection] = useState("Experience");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Enhancement | null>(null);
  const [copied, setCopied] = useState(false);
  const [showChanges, setShowChanges] = useState(false);

  const enhance = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, section }),
      });
      setResult(await res.json());
    } catch { /* handled by API */ }
    setLoading(false);
  };

  const copy = () => {
    if (result) navigator.clipboard.writeText(result.enhanced);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const useEnhanced = () => {
    if (result) setInput(result.enhanced);
    setResult(null);
  };

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
              Resume Enhancer
            </h1>
            <p className="text-slate-400 text-sm">
              Transform weak bullet points into powerful impact statements
            </p>
          </div>
        </div>

        {/* Tips banner */}
        <div className="glass-light rounded-xl p-4 mb-6 flex items-start gap-3 border border-indigo-500/20">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <Zap size={15} className="text-indigo-400" />
          </div>
          <div className="text-sm text-slate-400">
            <span className="text-white font-medium">Pro tip:</span> Paste your resume bullet points below.
            The AI will replace weak verbs with power words, add measurable metrics, and make each line
            recruiter-ready. You can enhance one section at a time.
          </div>
        </div>

        {/* Main editor */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input side */}
          <div className="space-y-4">
            <div className="section-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white">Original Text</h2>
                <div className="flex items-center gap-2">
                  <select
                    className="text-xs px-2 py-1 rounded-lg border border-white/[0.08] bg-white/[0.04] text-slate-400 outline-none"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    {SECTIONS.map((s) => <option key={s} value={s} style={{ background: "#0f0f23" }}>{s}</option>)}
                  </select>
                  <button
                    onClick={() => setInput(SAMPLE_TEXT)}
                    className="text-xs px-2 py-1 rounded-lg border border-white/[0.08] text-slate-500 hover:text-slate-300 hover:border-white/20 transition-all"
                  >
                    Use sample
                  </button>
                </div>
              </div>

              <textarea
                className="input-dark min-h-[240px] resize-none font-mono text-sm"
                placeholder="Paste your resume bullet points here...&#10;&#10;Example:&#10;• Worked on the company website&#10;• Helped fix performance issues&#10;• Was responsible for database work"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />

              <button
                onClick={enhance}
                disabled={!input.trim() || loading}
                className="btn-primary w-full justify-center py-3 mt-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Enhancing with AI...</>
                ) : (
                  <><Brain size={16} /> Enhance with AI</>
                )}
              </button>
            </div>

            {/* Action verbs */}
            {result && (
              <div className="section-card animate-fadeInUp">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                  <Star size={14} className="text-yellow-400" />
                  Power Action Verbs
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {result.actionVerbs.map((verb) => (
                    <button
                      key={verb}
                      onClick={() => setInput((t) => t + `\n• ${verb} `)}
                      className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25 transition-all"
                    >
                      {verb}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">Click a verb to add it to your text</p>
              </div>
            )}
          </div>

          {/* Output side */}
          <div className="space-y-4">
            {!result && !loading && (
              <div className="section-card flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center mb-4 animate-pulse-glow">
                  <Sparkles size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">AI-Enhanced Version</h3>
                <p className="text-slate-400 text-sm max-w-xs">
                  Your enhanced resume content will appear here with stronger action verbs and measurable metrics.
                </p>
              </div>
            )}

            {loading && (
              <div className="section-card flex flex-col items-center justify-center py-16">
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                  <Brain size={20} className="text-indigo-400 absolute inset-0 m-auto" />
                </div>
                <p className="text-slate-400 text-sm">AI is enhancing your content...</p>
                <p className="text-slate-600 text-xs mt-1">Adding power verbs and metrics</p>
              </div>
            )}

            {result && (
              <div className="section-card animate-fadeInUp">
                {/* Score improvement */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-white">Enhanced Version</h2>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500">{result.score.before}%</span>
                    <ArrowRight size={13} className="text-slate-600" />
                    <span className="text-green-400 font-bold">{result.score.after}%</span>
                    <TrendingUp size={13} className="text-green-400" />
                  </div>
                </div>

                {/* Score bars */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="w-12">Before</span>
                    <div className="progress-track flex-1">
                      <div className="h-full rounded-full bg-red-500/40" style={{ width: `${result.score.before}%` }} />
                    </div>
                    <span className="w-8 text-right">{result.score.before}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="w-12">After</span>
                    <div className="progress-track flex-1">
                      <div className="progress-fill" style={{ width: `${result.score.after}%` }} />
                    </div>
                    <span className="w-8 text-right text-green-400 font-bold">{result.score.after}%</span>
                  </div>
                </div>

                {/* Enhanced text */}
                <div className="glass-light rounded-xl p-4 mb-4 font-mono text-sm text-slate-200 leading-relaxed whitespace-pre-wrap border border-green-500/15">
                  {result.enhanced}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mb-4">
                  <button onClick={copy} className="btn-secondary flex-1 justify-center py-2.5 text-sm">
                    {copied ? <><CheckCircle size={14} className="text-green-400" /> Copied!</> : <><Copy size={14} /> Copy</>}
                  </button>
                  <button onClick={useEnhanced} className="btn-primary flex-1 justify-center py-2.5 text-sm">
                    <RefreshCw size={14} />
                    Use & Re-enhance
                  </button>
                </div>

                {/* Changes breakdown */}
                <button
                  onClick={() => setShowChanges(!showChanges)}
                  className="w-full flex items-center justify-between text-sm text-slate-400 hover:text-white transition-colors py-1"
                >
                  <span>View changes ({result.changes.length})</span>
                  {showChanges ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>

                {showChanges && (
                  <div className="mt-3 space-y-2">
                    {result.changes.map((c, i) => (
                      <div key={i} className="glass-light rounded-lg p-3 text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded text-indigo-300 bg-indigo-500/20 capitalize">{c.type}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <span className="line-through text-red-400">{c.original}</span>
                          <ArrowRight size={10} className="text-slate-600" />
                          <span className="text-green-400 font-medium">{c.replacement}</span>
                        </div>
                        <p className="text-slate-500">{c.reason}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tips */}
                {result.tips.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/[0.06]">
                    <div className="text-xs font-medium text-yellow-400 mb-2">💡 Tips</div>
                    <ul className="space-y-1">
                      {result.tips.map((tip, i) => (
                        <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                          <CheckCircle size={11} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
