"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Target,
  Map,
  Mic,
  MessageSquare,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Brain,
  Clock,
  CheckCircle,
  Zap,
} from "lucide-react";

interface Profile {
  name: string;
  targetRole: string;
  experience: string;
  skills: string[];
}

const quickActions = [
  {
    href: "/resume",
    icon: FileText,
    title: "Analyze Resume",
    description: "Upload PDF, get ATS score & insights",
    color: "#6366f1",
    glow: "rgba(99,102,241,0.2)",
  },
  {
    href: "/interview",
    icon: Mic,
    title: "Mock Interview",
    description: "Practice role-specific questions",
    color: "#ec4899",
    glow: "rgba(236,72,153,0.2)",
  },
  {
    href: "/chat",
    icon: MessageSquare,
    title: "Career Chat",
    description: "Ask your AI career mentor",
    color: "#10b981",
    glow: "rgba(16,185,129,0.2)",
  },
  {
    href: "/roadmap",
    icon: Map,
    title: "Career Roadmap",
    description: "Your personalized learning plan",
    color: "#06b6d4",
    glow: "rgba(6,182,212,0.2)",
  },
  {
    href: "/skills",
    icon: Target,
    title: "Skill Gap Analysis",
    description: "Find what's missing for your goal role",
    color: "#8b5cf6",
    glow: "rgba(139,92,246,0.2)",
  },
  {
    href: "/enhance",
    icon: Sparkles,
    title: "Enhance Resume",
    description: "Improve bullet points with AI",
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.2)",
  },
];

const recentActivity = [
  { icon: FileText, text: "Resume analyzed", time: "2 hours ago", color: "#6366f1" },
  { icon: Mic, text: "Mock interview session completed", time: "Yesterday", color: "#ec4899" },
  { icon: Map, text: "Roadmap updated", time: "2 days ago", color: "#06b6d4" },
  { icon: CheckCircle, text: "3 skills marked as learned", time: "3 days ago", color: "#10b981" },
];

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [time, setTime] = useState("");
  const [atsScore] = useState(87);
  const [roadmapProgress] = useState(34);
  const [interviewScore] = useState(72);

  useEffect(() => {
    const stored = localStorage.getItem("cc_profile");
    if (stored) setProfile(JSON.parse(stored));

    const updateTime = () => {
      const h = new Date().getHours();
      if (h < 12) setTime("Good morning");
      else if (h < 17) setTime("Good afternoon");
      else setTime("Good evening");
    };
    updateTime();
  }, []);

  const firstName = profile?.name?.split(" ")[0] || "there";

  const stats = [
    { label: "ATS Score", value: `${atsScore}%`, icon: TrendingUp, color: "#6366f1", change: "+5%" },
    { label: "Skills Matched", value: `${profile?.skills?.length || 0}`, icon: Brain, color: "#8b5cf6", change: "Tracked" },
    { label: "Roadmap Progress", value: `${roadmapProgress}%`, icon: Map, color: "#06b6d4", change: "Phase 2/5" },
    { label: "Interview Score", value: `${interviewScore}%`, icon: Mic, color: "#ec4899", change: "+12%" },
  ];

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Welcome banner */}
        <div className="section-card mb-8 relative overflow-hidden">
          <div className="absolute inset-0 gradient-bg opacity-60 rounded-2xl" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-slate-400 text-sm">{time},</span>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              </div>
              <h1
                className="text-2xl sm:text-3xl font-bold text-white"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Welcome back,{" "}
                <span className="gradient-text">{firstName}!</span>
              </h1>
              {profile?.targetRole && (
                <p className="text-slate-400 mt-1 text-sm">
                  Working towards:{" "}
                  <span className="text-indigo-300 font-medium">
                    {profile.targetRole}
                  </span>
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Link href="/resume" className="btn-primary">
                <FileText size={16} />
                Analyze Resume
              </Link>
              <Link href="/profile" className="btn-secondary">
                Edit Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color, change }) => (
            <div key={label} className="section-card group">
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: `${color}20`, border: `1px solid ${color}40` }}
                >
                  <Icon size={18} style={{ color }} />
                </div>
                <span className="text-xs text-slate-500">{change}</span>
              </div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick actions — 2/3 width */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap size={18} className="text-indigo-400" />
              Quick Actions
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {quickActions.map(({ href, icon: Icon, title, description, color, glow }) => (
                <Link
                  key={href}
                  href={href}
                  className="section-card group cursor-pointer flex items-start gap-4 no-underline"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                    style={{ background: `${color}18`, border: `1px solid ${color}35` }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.boxShadow = `0 0 20px ${glow}`)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.boxShadow = "none")
                    }
                  >
                    <Icon size={20} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white group-hover:text-indigo-200 transition-colors">
                      {title}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      {description}
                    </div>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-slate-600 group-hover:text-indigo-400 transition-colors mt-0.5 flex-shrink-0"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent activity — 1/3 width */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock size={18} className="text-cyan-400" />
              Recent Activity
            </h2>
            <div className="section-card space-y-4">
              {recentActivity.map(({ icon: Icon, text, time: t, color }, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                  >
                    <Icon size={14} style={{ color }} />
                  </div>
                  <div>
                    <div className="text-sm text-slate-300">{text}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{t}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Roadmap progress */}
            <div className="section-card mt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-white">
                  Roadmap Progress
                </span>
                <span className="text-xs text-indigo-400">Phase 2</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${roadmapProgress}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-slate-500">Foundation</span>
                <span className="text-xs text-indigo-400 font-medium">
                  {roadmapProgress}%
                </span>
              </div>
              <Link
                href="/roadmap"
                className="btn-ghost w-full justify-center mt-3 text-xs"
              >
                View Full Roadmap <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>

        {/* AI Tip banner */}
        <div className="mt-6 section-card flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0">
            <Brain size={18} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white mb-1">
              AI Insight of the Day
            </div>
            <p className="text-sm text-slate-400">
              Candidates who list quantified achievements (e.g., &quot;Reduced load time by 40%&quot;)
              are <span className="text-indigo-300 font-medium">3x more likely</span> to get
              shortlisted. Try the{" "}
              <Link href="/enhance" className="text-cyan-400 hover:underline">
                Resume Enhancer
              </Link>{" "}
              to transform your bullet points.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
