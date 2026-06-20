"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Brain,
  FileText,
  Target,
  Map,
  Mic,
  MessageSquare,
  Sparkles,
  CheckCircle,
  Upload,
  Zap,
  Star,
  Users,
  TrendingUp,
  Shield,
} from "lucide-react";

const TAGLINES = [
  "Smarter Career Growth.",
  "Interview Excellence.",
  "Resume Mastery.",
  "Your Dream Job.",
];

const features = [
  {
    icon: FileText,
    title: "AI Resume Analysis",
    description:
      "Upload your PDF resume and get instant ATS compatibility scores, skill extraction, and targeted improvement suggestions.",
    color: "#6366f1",
    glow: "rgba(99,102,241,0.3)",
    href: "/resume",
  },
  {
    icon: Target,
    title: "Skill Gap Detection",
    description:
      "Compare your current skills against target roles and discover exactly what you need to learn to land the job.",
    color: "#8b5cf6",
    glow: "rgba(139,92,246,0.3)",
    href: "/skills",
  },
  {
    icon: Map,
    title: "Career Roadmap",
    description:
      "Get a personalized, step-by-step 6-month learning plan with certifications, projects, and milestones tailored to you.",
    color: "#06b6d4",
    glow: "rgba(6,182,212,0.3)",
    href: "/roadmap",
  },
  {
    icon: Mic,
    title: "AI Mock Interview",
    description:
      "Practice role-specific interview questions with real-time AI evaluation on clarity, accuracy, and communication.",
    color: "#ec4899",
    glow: "rgba(236,72,153,0.3)",
    href: "/interview",
  },
  {
    icon: MessageSquare,
    title: "Career Chat AI",
    description:
      "Ask anything about your career. Get personalized, context-aware guidance powered by Google Gemini.",
    color: "#10b981",
    glow: "rgba(16,185,129,0.3)",
    href: "/chat",
  },
  {
    icon: Sparkles,
    title: "Resume Enhancer",
    description:
      "Transform weak bullet points into powerful impact statements with action verbs and measurable achievements.",
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.3)",
    href: "/enhance",
  },
];

const steps = [
  {
    step: "01",
    title: "Upload Your Resume",
    description: "Drag and drop your PDF resume. Our AI extracts all your skills, experience, and education instantly.",
    icon: Upload,
  },
  {
    step: "02",
    title: "Get AI Analysis",
    description: "Receive your ATS score, skill gaps, and personalized insights powered by Google Gemini.",
    icon: Brain,
  },
  {
    step: "03",
    title: "Level Up Your Career",
    description: "Follow your custom roadmap, practice mock interviews, and land your dream job.",
    icon: TrendingUp,
  },
];

const stats = [
  { label: "Students Helped", value: "50K+", icon: Users },
  { label: "Resume Analyses", value: "120K+", icon: FileText },
  { label: "Interview Sessions", value: "80K+", icon: Mic },
  { label: "Success Rate", value: "94%", icon: Star },
];

export default function LandingPage() {
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const interval = setInterval(() => {
      setTaglineIndex((i) => (i + 1) % TAGLINES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      {/* ─── HERO ─── */}
      <section className="relative flex flex-col items-center justify-center min-h-[92vh] px-4 text-center overflow-hidden">
        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Pill badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-8 border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Zap size={13} className="text-indigo-400" />
          Powered by Google Gemini AI
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        </div>

        {/* Headline */}
        <h1
          className={`text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight max-w-4xl transition-all duration-700 delay-100 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Your Personal{" "}
          <span className="gradient-text">AI Career Mentor</span>
          <br />
          <span className="text-slate-400 text-4xl sm:text-5xl lg:text-6xl">
            for{" "}
          </span>
          <span
            key={taglineIndex}
            className="gradient-text-pink inline-block"
            style={{ animation: "fadeInUp 0.4s ease-out forwards" }}
          >
            {TAGLINES[taglineIndex]}
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className={`mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed transition-all duration-700 delay-200 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          Analyze your resume, detect skill gaps, prepare for interviews, and
          get a personalized career roadmap — all in one AI-powered platform.
        </p>

        {/* CTA Buttons */}
        <div
          className={`mt-10 flex flex-col sm:flex-row items-center gap-4 transition-all duration-700 delay-300 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <Link href="/dashboard" className="btn-primary text-base px-8 py-3.5">
            Get Started Free
            <ArrowRight size={18} />
          </Link>
          <Link href="/resume" className="btn-secondary text-base px-8 py-3.5">
            <Upload size={16} />
            Analyze Resume
          </Link>
        </div>

        {/* Trust indicators */}
        <div
          className={`mt-12 flex items-center gap-6 text-sm text-slate-500 transition-all duration-700 delay-400 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          {["No credit card required", "Free forever plan", "Instant results"].map(
            (text) => (
              <div key={text} className="flex items-center gap-1.5">
                <CheckCircle size={13} className="text-green-400" />
                {text}
              </div>
            )
          )}
        </div>

        {/* Floating preview card */}
        <div
          className={`mt-16 relative max-w-3xl w-full transition-all duration-1000 delay-500 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <div className="glass rounded-2xl p-6 border border-white/[0.08] glow-primary">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                <div className="w-3 h-3 rounded-full bg-green-400/70" />
              </div>
              <span className="text-slate-500 text-xs">CareerCopilot AI — Resume Analysis</span>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { label: "ATS Score", value: "87%", color: "#6366f1" },
                { label: "Skills Found", value: "24", color: "#06b6d4" },
                { label: "Gaps Found", value: "6", color: "#ec4899" },
              ].map(({ label, value, color }) => (
                <div key={label} className="glass-light rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold" style={{ color }}>
                    {value}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{label}</div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {[
                { skill: "React.js", level: 90 },
                { skill: "Python", level: 75 },
                { skill: "Machine Learning", level: 45 },
              ].map(({ skill, level }) => (
                <div key={skill} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-32 text-left">{skill}</span>
                  <div className="progress-track flex-1">
                    <div
                      className="progress-fill"
                      style={{ width: `${level}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 w-8 text-right">{level}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="section-card text-center group">
              <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Icon size={18} className="text-white" />
              </div>
              <div className="text-2xl font-bold gradient-text">{value}</div>
              <div className="text-sm text-slate-400 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4 border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
              <Sparkles size={13} />
              Everything You Need
            </div>
            <h2
              className="text-4xl font-bold gradient-text"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              All-in-One Career Intelligence
            </h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">
              Six powerful AI tools working together to accelerate your career
              growth from student to professional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, description, color, glow, href }) => (
              <Link
                key={title}
                href={href}
                className="section-card group cursor-pointer block"
                style={{ textDecoration: "none" }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: `${color}22`,
                    border: `1px solid ${color}44`,
                    boxShadow: `0 0 0 0 ${glow}`,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.boxShadow = `0 0 20px ${glow}`)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.boxShadow = `0 0 0 0 ${glow}`)
                  }
                >
                  <Icon size={22} style={{ color }} />
                </div>
                <h3 className="text-lg font-semibold text-slate-100 mb-2 group-hover:text-white transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {description}
                </p>
                <div className="flex items-center gap-1 mt-4 text-xs font-medium" style={{ color }}>
                  Get Started <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-4xl font-bold gradient-text"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              How It Works
            </h2>
            <p className="text-slate-400 mt-3">
              Three simple steps to transform your career trajectory.
            </p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-[27px] top-12 bottom-12 w-px bg-gradient-to-b from-indigo-500/50 via-purple-500/50 to-cyan-500/50 hidden md:block" />

            <div className="space-y-8">
              {steps.map(({ step, title, description, icon: Icon }, i) => (
                <div key={step} className="flex gap-6 items-start">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 gradient-brand shadow-lg"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  >
                    <Icon size={22} className="text-white" />
                  </div>
                  <div className="section-card flex-1">
                    <div className="text-xs text-indigo-400 font-bold tracking-wider mb-1">
                      STEP {step}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="section-card border-gradient relative overflow-hidden">
            <div className="absolute inset-0 gradient-bg opacity-50 rounded-2xl" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                <Shield size={28} className="text-white" />
              </div>
              <h2
                className="text-3xl font-bold text-white mb-4"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Ready to Supercharge Your Career?
              </h2>
              <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                Join thousands of students and graduates who&apos;ve accelerated
                their careers with CareerCopilot AI.
              </p>
              <Link href="/profile" className="btn-primary text-base px-10 py-3.5">
                Start For Free
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/[0.06] py-8 px-4 text-center text-slate-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain size={14} className="text-indigo-400" />
          <span className="gradient-text font-semibold">CareerCopilot AI</span>
        </div>
        <p>Your Personal AI Career Mentor for Smarter Career Growth.</p>
        <p className="mt-1 text-slate-600">
          Powered by Google Gemini · Built with Next.js
        </p>
      </footer>
    </div>
  );
}
