"use client";

import { useState, useEffect } from "react";
import {
  Map,
  Brain,
  Loader2,
  CheckCircle,
  BookOpen,
  Hammer,
  Award,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Trophy,
  Clock,
} from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  type: string;
  description: string;
  resources: { title: string; platform: string; duration: string }[];
}

interface Phase {
  id: string;
  title: string;
  duration: string;
  description: string;
  icon: string;
  color: string;
  milestones: Milestone[];
}

interface Roadmap {
  title: string;
  duration: string;
  finalGoal: string;
  phases: Phase[];
}

const typeIcon: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  learn: BookOpen,
  build: Hammer,
  certify: Award,
};

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [expandedPhase, setExpandedPhase] = useState<string | null>("phase-1");
  const [profile, setProfile] = useState<{ targetRole?: string; skills?: string[]; experience?: string }>({});

  useEffect(() => {
    const stored = localStorage.getItem("cc_profile");
    if (stored) setProfile(JSON.parse(stored));

    const savedCompleted = localStorage.getItem("cc_roadmap_completed");
    if (savedCompleted) setCompleted(new Set(JSON.parse(savedCompleted)));

    const savedRoadmap = localStorage.getItem("cc_roadmap");
    if (savedRoadmap) setRoadmap(JSON.parse(savedRoadmap));
  }, []);

  const toggleCompleted = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem("cc_roadmap_completed", JSON.stringify([...next]));
      return next;
    });
  };

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole: profile.targetRole || "Software Engineer",
          userSkills: profile.skills || [],
          experienceLevel: profile.experience || "student",
        }),
      });
      const data = await res.json();
      setRoadmap(data);
      localStorage.setItem("cc_roadmap", JSON.stringify(data));
      setCompleted(new Set());
    } catch { /* handled by API */ }
    setLoading(false);
  };

  const totalMilestones = roadmap?.phases.reduce((a, p) => a + p.milestones.length, 0) || 0;
  const completedCount = completed.size;
  const progressPercent = totalMilestones > 0 ? Math.round((completedCount / totalMilestones) * 100) : 0;

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
              <Map size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
                Career Roadmap
              </h1>
              <p className="text-slate-400 text-sm">
                Your personalized 6-month learning plan
              </p>
            </div>
          </div>
          <button
            onClick={generate}
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Generating...</>
            ) : (
              <><Brain size={16} /> {roadmap ? "Regenerate" : "Generate Roadmap"}</>
            )}
          </button>
        </div>

        {/* Progress overview */}
        {roadmap && (
          <div className="section-card mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">{roadmap.title}</h2>
                <p className="text-slate-400 text-sm mt-0.5">{roadmap.finalGoal}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold gradient-text">{progressPercent}%</div>
                <div className="text-xs text-slate-500">{completedCount}/{totalMilestones} milestones</div>
              </div>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Clock size={11} /> {roadmap.duration}</span>
              {progressPercent === 100 && (
                <span className="flex items-center gap-1 text-yellow-400">
                  <Trophy size={11} /> Roadmap Complete!
                </span>
              )}
            </div>
          </div>
        )}

        {!roadmap && !loading && (
          <div className="section-card text-center py-16">
            <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
              <Sparkles size={28} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Generate Your Career Roadmap</h2>
            <p className="text-slate-400 max-w-md mx-auto text-sm">
              Click &quot;Generate Roadmap&quot; above to get a personalized 6-month plan
              based on your profile and target role.
              {!profile.targetRole && (
                <span className="block mt-2 text-indigo-400">
                  Tip: Set your target role in{" "}
                  <a href="/profile" className="underline">Profile</a> for better results.
                </span>
              )}
            </p>
          </div>
        )}

        {/* Phases */}
        {roadmap && (
          <div className="space-y-4">
            {roadmap.phases.map((phase, phaseIdx) => {
              const phaseMilestones = phase.milestones;
              const phaseCompleted = phaseMilestones.filter((m) => completed.has(m.id)).length;
              const isExpanded = expandedPhase === phase.id;
              const allPreviousDone =
                phaseIdx === 0 ||
                roadmap.phases
                  .slice(0, phaseIdx)
                  .every((p) => p.milestones.every((m) => completed.has(m.id)));

              return (
                <div key={phase.id} className="section-card overflow-hidden">
                  {/* Phase header */}
                  <button
                    className="w-full flex items-center gap-4 text-left"
                    onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: `${phase.color}20`, border: `1px solid ${phase.color}40` }}
                    >
                      {phase.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-semibold text-white">{phase.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${phase.color}20`, color: phase.color }}>
                          {phase.duration}
                        </span>
                        {phaseCompleted === phaseMilestones.length && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                            ✓ Complete
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 mt-0.5 truncate">{phase.description}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm text-slate-400">{phaseCompleted}/{phaseMilestones.length}</span>
                      {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </div>
                  </button>

                  {/* Milestones */}
                  {isExpanded && (
                    <div className="mt-4 space-y-3 border-t border-white/[0.06] pt-4">
                      {phaseMilestones.map((milestone) => {
                        const isComplete = completed.has(milestone.id);
                        const TypeIcon = typeIcon[milestone.type] || BookOpen;

                        return (
                          <div
                            key={milestone.id}
                            className={`rounded-xl p-4 border transition-all ${
                              isComplete
                                ? "border-green-500/30 bg-green-500/5"
                                : "border-white/[0.06] bg-white/[0.02] hover:border-white/10"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() => toggleCompleted(milestone.id)}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                                  isComplete
                                    ? "border-green-500 bg-green-500"
                                    : "border-slate-600 hover:border-indigo-500"
                                }`}
                              >
                                {isComplete && <CheckCircle size={14} className="text-white" />}
                              </button>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <TypeIcon size={13} className="text-slate-400" />
                                  <span className={`text-sm font-medium ${isComplete ? "line-through text-slate-500" : "text-white"}`}>
                                    {milestone.title}
                                  </span>
                                  <span className="text-xs text-slate-600 capitalize">{milestone.type}</span>
                                </div>
                                <p className="text-xs text-slate-400 mb-2">{milestone.description}</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {milestone.resources.map((r, i) => (
                                    <span
                                      key={i}
                                      className="text-xs px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.07] text-slate-400"
                                    >
                                      {r.platform} · {r.duration}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
