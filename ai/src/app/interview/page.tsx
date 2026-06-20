"use client";

import { useState, useEffect, useRef } from "react";
import {
  Mic,
  Brain,
  Loader2,
  ChevronRight,
  CheckCircle,
  Clock,
  Trophy,
  Star,
  SkipForward,
  RefreshCw,
  MessageSquare,
  Target,
  Zap,
  TrendingUp,
} from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

const ROLES = ["Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer", "Data Scientist", "Machine Learning Engineer", "DevOps Engineer"];
const LEVELS = ["Junior", "Mid-level", "Senior"];

interface Question {
  id: string;
  text: string;
  type: string;
  difficulty: string;
  timeLimit: number;
  hint?: string;
}

interface Evaluation {
  scores: { clarity: number; technicalAccuracy: number; confidence: number; communication: number };
  overall: number;
  grade: string;
  feedback: string;
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
}

const difficultyColor: Record<string, string> = {
  Easy: "#10b981",
  Medium: "#f59e0b",
  Hard: "#ef4444",
};

const typeColor: Record<string, string> = {
  Technical: "#6366f1",
  Behavioral: "#8b5cf6",
  Situational: "#06b6d4",
  "System Design": "#ec4899",
};

const gradeColor: Record<string, string> = {
  A: "#10b981", B: "#6366f1", C: "#f59e0b", D: "#f97316", F: "#ef4444",
};

export default function InterviewPage() {
  const [role, setRole] = useState("Software Engineer");
  const [level, setLevel] = useState("Junior");
  const [phase, setPhase] = useState<"setup" | "interview" | "evaluation" | "summary">("setup");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [evalLoading, setEvalLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("cc_profile");
    if (stored) {
      const p = JSON.parse(stored);
      if (p.targetRole) setRole(p.targetRole);
    }
  }, []);

  useEffect(() => {
    if (phase === "interview" && questions[currentQ]) {
      setTimeLeft(questions[currentQ].timeLimit);
      setAnswer("");
      setShowHint(false);
      setShowModel(false);
    }
  }, [currentQ, phase, questions]);

  useEffect(() => {
    if (phase === "interview" && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [phase, timeLeft]);

  const startInterview = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", role, level }),
      });
      const data = await res.json();
      setQuestions(data.questions || []);
      setCurrentQ(0);
      setEvaluations([]);
      setPhase("interview");
    } catch { /* handled by API */ }
    setLoading(false);
  };

  const submitAnswer = async () => {
    setEvalLoading(true);
    setPhase("evaluation");
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate",
          question: questions[currentQ].text,
          answer,
          role,
          level,
        }),
      });
      const evalData = await res.json();
      setEvaluations((prev) => [...prev, evalData]);
    } catch { /* handled by API */ }
    setEvalLoading(false);
  };

  const nextQuestion = () => {
    if (currentQ + 1 < questions.length) {
      setCurrentQ((q) => q + 1);
      setPhase("interview");
    } else {
      setPhase("summary");
    }
  };

  const avgScore = evaluations.length
    ? Math.round(evaluations.reduce((a, e) => a + e.overall, 0) / evaluations.length)
    : 0;

  const radarData = evaluations.length
    ? [
        { subject: "Clarity", score: Math.round(evaluations.reduce((a, e) => a + e.scores.clarity, 0) / evaluations.length) },
        { subject: "Technical", score: Math.round(evaluations.reduce((a, e) => a + e.scores.technicalAccuracy, 0) / evaluations.length) },
        { subject: "Confidence", score: Math.round(evaluations.reduce((a, e) => a + e.scores.confidence, 0) / evaluations.length) },
        { subject: "Communication", score: Math.round(evaluations.reduce((a, e) => a + e.scores.communication, 0) / evaluations.length) },
      ]
    : [];

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
            <Mic size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
              AI Mock Interview
            </h1>
            <p className="text-slate-400 text-sm">Practice role-specific questions with AI feedback</p>
          </div>
          {phase !== "setup" && (
            <div className="ml-auto text-sm text-slate-400">
              Q{currentQ + 1}/{questions.length}
            </div>
          )}
        </div>

        {/* ── SETUP PHASE ── */}
        {phase === "setup" && (
          <div className="section-card">
            <h2 className="text-lg font-semibold text-white mb-6">Configure Your Interview</h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Target Role</label>
                <select className="input-dark" value={role} onChange={(e) => setRole(e.target.value)} style={{ background: "rgba(255,255,255,0.04)" }}>
                  {ROLES.map((r) => <option key={r} value={r} style={{ background: "#0f0f23" }}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Experience Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {LEVELS.map((l) => (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                        level === l ? "border-indigo-500/60 bg-indigo-500/15 text-indigo-200" : "border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-indigo-500/30"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* What to expect */}
            <div className="glass-light rounded-xl p-4 mb-6 space-y-2">
              <div className="text-sm font-medium text-white mb-3">Session includes:</div>
              {[
                { icon: MessageSquare, color: "#6366f1", text: "8 questions: Technical, Behavioral, Situational, System Design" },
                { icon: Clock, color: "#06b6d4", text: "90-180 second time limit per question" },
                { icon: Brain, color: "#8b5cf6", text: "AI evaluation: Clarity, Accuracy, Confidence, Communication" },
                { icon: Star, color: "#f59e0b", text: "Detailed feedback + model answers" },
              ].map(({ icon: Icon, color, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-sm text-slate-400">
                  <Icon size={14} style={{ color }} />
                  {text}
                </div>
              ))}
            </div>

            <button
              onClick={startInterview}
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Generating Questions...</> : <><Zap size={18} /> Start Interview Session</>}
            </button>
          </div>
        )}

        {/* ── INTERVIEW PHASE ── */}
        {phase === "interview" && questions[currentQ] && (
          <div className="space-y-4 animate-fadeInUp">
            {/* Progress */}
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${((currentQ) / questions.length) * 100}%` }} />
            </div>

            {/* Question card */}
            <div className="section-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ color: typeColor[questions[currentQ].type], background: `${typeColor[questions[currentQ].type]}20` }}
                  >
                    {questions[currentQ].type}
                  </span>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ color: difficultyColor[questions[currentQ].difficulty], background: `${difficultyColor[questions[currentQ].difficulty]}20` }}
                  >
                    {questions[currentQ].difficulty}
                  </span>
                </div>
                <div className={`flex items-center gap-1.5 text-sm font-mono font-bold ${timeLeft <= 30 ? "text-red-400" : "text-slate-300"}`}>
                  <Clock size={14} />
                  {formatTime(timeLeft)}
                </div>
              </div>

              <h2 className="text-xl text-white font-semibold leading-relaxed mb-4">
                {questions[currentQ].text}
              </h2>

              {questions[currentQ].hint && (
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors mb-3"
                >
                  {showHint ? "Hide hint" : "Show hint"}
                </button>
              )}
              {showHint && questions[currentQ].hint && (
                <div className="glass-light rounded-lg p-3 mb-4 text-sm text-slate-300 border border-indigo-500/20">
                  💡 {questions[currentQ].hint}
                </div>
              )}

              <textarea
                className="input-dark min-h-[140px] resize-none"
                placeholder="Type your answer here... Speak clearly and structure your response."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={submitAnswer}
                  disabled={!answer.trim()}
                  className="btn-primary flex-1 justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <CheckCircle size={16} />
                  Submit Answer
                </button>
                <button
                  onClick={nextQuestion}
                  className="btn-ghost px-4 py-3"
                  title="Skip question"
                >
                  <SkipForward size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── EVALUATION PHASE ── */}
        {phase === "evaluation" && (
          <div className="space-y-4 animate-fadeInUp">
            {evalLoading ? (
              <div className="section-card text-center py-12">
                <Loader2 size={32} className="animate-spin text-indigo-400 mx-auto mb-3" />
                <p className="text-slate-400">AI is evaluating your answer...</p>
              </div>
            ) : evaluations[evaluations.length - 1] ? (
              <>
                {/* Score card */}
                {(() => {
                  const ev = evaluations[evaluations.length - 1];
                  return (
                    <>
                      <div className="section-card">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h2 className="text-lg font-bold text-white">Answer Evaluation</h2>
                            <p className="text-slate-400 text-sm">Q{currentQ + 1} of {questions.length}</p>
                          </div>
                          <div className="text-center">
                            <div className="text-4xl font-bold" style={{ color: gradeColor[ev.grade] }}>
                              {ev.grade}
                            </div>
                            <div className="text-xs text-slate-500">{ev.overall}/100</div>
                          </div>
                        </div>

                        {/* Score bars */}
                        <div className="space-y-3 mb-6">
                          {Object.entries(ev.scores).map(([key, val]) => (
                            <div key={key} className="flex items-center gap-3">
                              <span className="text-xs text-slate-400 w-36 capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                              <div className="progress-track flex-1">
                                <div className="progress-fill" style={{ width: `${val}%` }} />
                              </div>
                              <span className="text-xs text-slate-400 w-8 text-right">{val}</span>
                            </div>
                          ))}
                        </div>

                        {/* Feedback */}
                        <div className="glass-light rounded-xl p-4 mb-4">
                          <div className="text-sm font-medium text-white mb-2 flex items-center gap-1.5">
                            <Brain size={13} className="text-indigo-400" />
                            AI Feedback
                          </div>
                          <p className="text-sm text-slate-400 leading-relaxed">{ev.feedback}</p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-xs font-medium text-green-400 mb-2">✓ Strengths</div>
                            <ul className="space-y-1">
                              {ev.strengths.map((s, i) => <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5"><CheckCircle size={11} className="text-green-400 mt-0.5" />{s}</li>)}
                            </ul>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-yellow-400 mb-2">↑ Improve</div>
                            <ul className="space-y-1">
                              {ev.improvements.map((s, i) => <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5"><Target size={11} className="text-yellow-400 mt-0.5" />{s}</li>)}
                            </ul>
                          </div>
                        </div>

                        <button onClick={() => setShowModel(!showModel)} className="text-xs text-indigo-400 hover:underline mb-2">
                          {showModel ? "Hide" : "Show"} model answer
                        </button>
                        {showModel && (
                          <div className="glass-light rounded-xl p-4 text-sm text-slate-300 border border-indigo-500/20">
                            {ev.modelAnswer}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={nextQuestion}
                        className="btn-primary w-full justify-center py-3.5"
                      >
                        {currentQ + 1 < questions.length ? (
                          <><ChevronRight size={18} /> Next Question</>
                        ) : (
                          <><Trophy size={18} /> View Final Summary</>
                        )}
                      </button>
                    </>
                  );
                })()}
              </>
            ) : null}
          </div>
        )}

        {/* ── SUMMARY PHASE ── */}
        {phase === "summary" && evaluations.length > 0 && (
          <div className="space-y-6 animate-fadeInUp">
            <div className="section-card text-center">
              <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-4">
                <Trophy size={30} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Interview Complete!</h2>
              <p className="text-slate-400 text-sm mb-6">
                {role} — {level} level · {evaluations.length} questions answered
              </p>
              <div className="text-6xl font-bold gradient-text mb-2">{avgScore}</div>
              <div className="text-slate-400 text-sm mb-6">Overall Score</div>

              {radarData.length > 0 && (
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.35} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              )}

              <div className="grid grid-cols-2 gap-3 mt-4">
                {[
                  { label: "Clarity", value: Math.round(evaluations.reduce((a, e) => a + e.scores.clarity, 0) / evaluations.length) },
                  { label: "Technical", value: Math.round(evaluations.reduce((a, e) => a + e.scores.technicalAccuracy, 0) / evaluations.length) },
                  { label: "Confidence", value: Math.round(evaluations.reduce((a, e) => a + e.scores.confidence, 0) / evaluations.length) },
                  { label: "Communication", value: Math.round(evaluations.reduce((a, e) => a + e.scores.communication, 0) / evaluations.length) },
                ].map(({ label, value }) => (
                  <div key={label} className="glass-light rounded-xl p-3">
                    <div className="text-xl font-bold gradient-text">{value}%</div>
                    <div className="text-xs text-slate-400 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Per-question breakdown */}
            <div className="section-card">
              <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-cyan-400" />
                Question Breakdown
              </h3>
              <div className="space-y-2">
                {evaluations.map((ev, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                    <span className="text-xs text-slate-500 w-16 flex-shrink-0">Q{i + 1}</span>
                    <div className="progress-track flex-1">
                      <div className="progress-fill" style={{ width: `${ev.overall}%` }} />
                    </div>
                    <span className="text-sm font-bold w-8 text-right" style={{ color: gradeColor[ev.grade] }}>
                      {ev.grade}
                    </span>
                    <span className="text-xs text-slate-500 w-8 text-right">{ev.overall}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setPhase("setup")} className="btn-primary w-full justify-center py-3.5">
              <RefreshCw size={16} />
              Start New Interview
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
