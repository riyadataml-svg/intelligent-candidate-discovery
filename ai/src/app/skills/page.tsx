"use client";

import { useState, useEffect } from "react";
import {
  Target,
  CheckCircle,
  XCircle,
  Brain,
  Loader2,
  BookOpen,
  ExternalLink,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
} from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const JOB_ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Cloud Architect",
];

interface SkillGapResult {
  matchPercentage: number;
  requiredSkills: {
    name: string;
    category: string;
    importance: string;
    userHas: boolean;
    userLevel: number;
  }[];
  radarData: { subject: string; userScore: number; requiredScore: number }[];
  learningPlan: {
    skill: string;
    priority: string;
    resources: { title: string; platform: string; duration: string; url: string }[];
  }[];
  topMissingSkills: string[];
  readinessLevel: string;
}

const importanceColor: Record<string, string> = {
  Critical: "#ef4444",
  Important: "#f59e0b",
  "Nice-to-have": "#10b981",
};

const readinessColor: Record<string, string> = {
  Ready: "#10b981",
  "Almost Ready": "#6366f1",
  "Needs More Work": "#f59e0b",
  "Major Gaps": "#ef4444",
};

export default function SkillsPage() {
  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SkillGapResult | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("cc_profile");
    if (stored) {
      const profile = JSON.parse(stored);
      if (profile.skills?.length) setUserSkills(profile.skills);
      if (profile.targetRole) setTargetRole(profile.targetRole);
    }
  }, []);

  const addSkill = (skill: string) => {
    if (skill && !userSkills.includes(skill)) {
      setUserSkills((s) => [...s, skill]);
    }
    setSkillInput("");
  };

  const analyze = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userSkills, targetRole }),
      });
      setResult(await res.json());
    } catch { /* fallback handled in API */ }
    setLoading(false);
  };

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
            <Target size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
              Skill Gap Detection
            </h1>
            <p className="text-slate-400 text-sm">
              Compare your skills against your target role
            </p>
          </div>
        </div>

        {/* Input section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Role + Skills */}
          <div className="section-card space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Target Role</label>
              <select
                className="input-dark"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                {JOB_ROLES.map((r) => (
                  <option key={r} value={r} style={{ background: "#0f0f23" }}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Your Skills</label>
              <div className="flex gap-2 mb-2">
                <input
                  className="input-dark flex-1"
                  placeholder="Add a skill..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addSkill(skillInput.trim()); }}
                />
                <button className="btn-primary px-3" onClick={() => addSkill(skillInput.trim())}>
                  <Plus size={15} />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 min-h-[36px]">
                {userSkills.map((s) => (
                  <span key={s} className="skill-badge">
                    {s}
                    <button onClick={() => setUserSkills((prev) => prev.filter((x) => x !== s))} className="ml-1.5 hover:text-red-400">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={analyze}
              disabled={userSkills.length === 0 || loading}
              className="btn-primary w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Analyzing Gaps...</>
              ) : (
                <><Brain size={16} /> Detect Skill Gaps</>
              )}
            </button>
          </div>

          {/* What you'll get */}
          {!result && (
            <div className="section-card flex flex-col justify-center gap-4">
              <h3 className="text-base font-semibold text-white">What you&apos;ll get:</h3>
              {[
                { icon: TrendingUp, color: "#6366f1", text: "Match percentage vs target role" },
                { icon: Target, color: "#ec4899", text: "Missing critical skills identified" },
                { icon: BookOpen, color: "#06b6d4", text: "Curated learning resources per skill" },
                { icon: CheckCircle, color: "#10b981", text: "Visual radar chart comparison" },
              ].map(({ icon: Icon, color, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                    <Icon size={15} style={{ color }} />
                  </div>
                  <span className="text-sm text-slate-400">{text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Match score */}
          {result && (
            <div className="section-card flex flex-col items-center justify-center text-center">
              <div
                className="text-6xl font-bold mb-2"
                style={{ color: result.matchPercentage >= 70 ? "#10b981" : result.matchPercentage >= 50 ? "#6366f1" : "#f59e0b" }}
              >
                {result.matchPercentage}%
              </div>
              <div className="text-slate-400 text-sm mb-4">Skill Match Rate</div>
              <span
                className="px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
                style={{
                  color: readinessColor[result.readinessLevel],
                  background: `${readinessColor[result.readinessLevel]}20`,
                  border: `1px solid ${readinessColor[result.readinessLevel]}40`,
                }}
              >
                {result.readinessLevel}
              </span>
              <div className="progress-track w-full">
                <div className="progress-fill" style={{ width: `${result.matchPercentage}%` }} />
              </div>
              <p className="text-xs text-slate-500 mt-3">
                {result.topMissingSkills.length} skills to learn for{" "}
                <span className="text-indigo-300">{targetRole}</span>
              </p>
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-fadeInUp">
            {/* Radar Chart */}
            <div className="section-card">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <TrendingUp size={18} className="text-cyan-400" />
                Skills Comparison Radar
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={result.radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Radar name="You" dataKey="userScore" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                  <Radar name="Required" dataKey="requiredScore" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 3" />
                  <Tooltip
                    contentStyle={{ background: "#0f0f23", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#f1f5f9", fontSize: "12px" }}
                  />
                </RadarChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-8 h-0.5 bg-indigo-500" />
                  Your Level
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-8 h-0.5 bg-cyan-500 border-dashed" />
                  Required Level
                </div>
              </div>
            </div>

            {/* Required skills list */}
            <div className="section-card">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <Target size={18} className="text-indigo-400" />
                Required Skills Breakdown
              </h3>
              <div className="space-y-3">
                {result.requiredSkills.map((skill) => (
                  <div key={skill.name} className="flex items-center gap-3">
                    {skill.userHas ? (
                      <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                    ) : (
                      <XCircle size={16} className="text-red-400 flex-shrink-0" />
                    )}
                    <span className="text-sm text-slate-300 w-36 flex-shrink-0">{skill.name}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 hidden sm:block"
                      style={{
                        color: importanceColor[skill.importance],
                        background: `${importanceColor[skill.importance]}18`,
                        border: `1px solid ${importanceColor[skill.importance]}30`,
                      }}
                    >
                      {skill.importance}
                    </span>
                    <div className="progress-track flex-1">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${skill.userLevel}%`,
                          background: skill.userHas
                            ? "linear-gradient(90deg, #10b981, #06b6d4)"
                            : "linear-gradient(90deg, #ef4444, #f59e0b)",
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 w-8 text-right">{skill.userLevel}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Plan */}
            <div className="section-card">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <BookOpen size={18} className="text-yellow-400" />
                Personalized Learning Plan
              </h3>
              <div className="space-y-3">
                {result.learningPlan.map((item) => (
                  <div
                    key={item.skill}
                    className="rounded-xl border border-white/[0.07] overflow-hidden"
                  >
                    <button
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
                      onClick={() => setExpandedPlan(expandedPlan === item.skill ? null : item.skill)}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{
                            color: item.priority === "High" ? "#ef4444" : item.priority === "Medium" ? "#f59e0b" : "#10b981",
                            background: item.priority === "High" ? "#ef444420" : item.priority === "Medium" ? "#f59e0b20" : "#10b98120",
                          }}
                        >
                          {item.priority}
                        </span>
                        <span className="text-sm font-medium text-white">{item.skill}</span>
                        <span className="text-xs text-slate-500">{item.resources.length} resources</span>
                      </div>
                      {expandedPlan === item.skill ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
                    </button>
                    {expandedPlan === item.skill && (
                      <div className="border-t border-white/[0.06] p-4 space-y-2">
                        {item.resources.map((r, i) => (
                          <a
                            key={i}
                            href={r.url}
                            className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] transition-all group"
                          >
                            <div>
                              <div className="text-sm text-slate-200 group-hover:text-white transition-colors">{r.title}</div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                {r.platform} · {r.duration}
                              </div>
                            </div>
                            <ExternalLink size={13} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
