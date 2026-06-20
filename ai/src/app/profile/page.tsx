"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Briefcase,
  GraduationCap,
  Target,
  Save,
  CheckCircle,
  Plus,
  X,
} from "lucide-react";

const JOB_ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Cloud Architect",
  "Mobile Developer",
  "UI/UX Designer",
  "Product Manager",
  "Cybersecurity Analyst",
  "Data Analyst",
  "AI/ML Researcher",
  "Software Engineer",
];

const EXPERIENCE_LEVELS = [
  { value: "student", label: "Student", icon: "🎓" },
  { value: "fresh", label: "Fresh Graduate", icon: "🌱" },
  { value: "entry", label: "Entry Level (0-2 yrs)", icon: "🚀" },
  { value: "mid", label: "Mid Level (2-5 yrs)", icon: "⚡" },
  { value: "career-switch", label: "Career Switcher", icon: "🔄" },
];

const INTERESTS = [
  "Web Development",
  "Machine Learning",
  "Cloud Computing",
  "Mobile Apps",
  "Data Science",
  "Cybersecurity",
  "DevOps",
  "UI/UX Design",
  "Blockchain",
  "Game Development",
  "Robotics",
  "IoT",
];

const SKILL_SUGGESTIONS = [
  "Python", "JavaScript", "TypeScript", "React", "Node.js", "SQL",
  "Java", "C++", "Machine Learning", "TensorFlow", "AWS", "Docker",
  "Git", "REST APIs", "MongoDB", "PostgreSQL", "Kubernetes", "GraphQL",
];

export default function ProfilePage() {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    targetRole: "",
    experience: "",
    education: "",
    interests: [] as string[],
    skills: [] as string[],
  });

  useEffect(() => {
    const stored = localStorage.getItem("cc_profile");
    if (stored) {
      setProfile(JSON.parse(stored));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("cc_profile", JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      router.push("/dashboard");
    }, 1500);
  };

  const toggleInterest = (interest: string) => {
    setProfile((p) => ({
      ...p,
      interests: p.interests.includes(interest)
        ? p.interests.filter((i) => i !== interest)
        : [...p.interests, interest],
    }));
  };

  const addSkill = (skill: string) => {
    if (skill && !profile.skills.includes(skill)) {
      setProfile((p) => ({ ...p, skills: [...p.skills, skill] }));
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setProfile((p) => ({ ...p, skills: p.skills.filter((s) => s !== skill) }));
  };

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <User size={36} className="text-white" />
          </div>
          <h1
            className="text-3xl font-bold gradient-text"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Your Career Profile
          </h1>
          <p className="text-slate-400 mt-2">
            Help us personalize your AI-powered career guidance
          </p>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="section-card">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
              <User size={18} className="text-indigo-400" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">
                  Full Name
                </label>
                <input
                  className="input-dark"
                  placeholder="e.g. Riya Sharma"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">
                  Email Address
                </label>
                <input
                  className="input-dark"
                  type="email"
                  placeholder="e.g. riya@email.com"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, email: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">
                  Education
                </label>
                <input
                  className="input-dark"
                  placeholder="e.g. B.Tech Computer Science"
                  value={profile.education}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, education: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">
                  Target Job Role
                </label>
                <select
                  className="input-dark"
                  value={profile.targetRole}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, targetRole: e.target.value }))
                  }
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <option value="">Select a role...</option>
                  {JOB_ROLES.map((r) => (
                    <option key={r} value={r} style={{ background: "#0f0f23" }}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Experience Level */}
          <div className="section-card">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
              <Briefcase size={18} className="text-purple-400" />
              Experience Level
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {EXPERIENCE_LEVELS.map(({ value, label, icon }) => (
                <button
                  key={value}
                  onClick={() =>
                    setProfile((p) => ({ ...p, experience: value }))
                  }
                  className={`p-3 rounded-xl text-sm font-medium border transition-all text-left ${
                    profile.experience === value
                      ? "border-indigo-500/60 bg-indigo-500/15 text-indigo-200"
                      : "border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-indigo-500/30 hover:bg-indigo-500/5"
                  }`}
                >
                  <span className="text-xl block mb-1">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="section-card">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
              <Target size={18} className="text-cyan-400" />
              Career Interests
            </h2>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`skill-badge cursor-pointer transition-all ${
                    profile.interests.includes(interest)
                      ? "bg-indigo-500/25 border-indigo-500/50 text-indigo-200"
                      : ""
                  }`}
                >
                  {profile.interests.includes(interest) && (
                    <CheckCircle size={11} className="mr-1" />
                  )}
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="section-card">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
              <GraduationCap size={18} className="text-pink-400" />
              Your Current Skills
            </h2>

            {/* Input */}
            <div className="flex gap-2 mb-4">
              <input
                className="input-dark flex-1"
                placeholder="Type a skill and press Enter..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addSkill(skillInput.trim());
                }}
              />
              <button
                className="btn-primary px-4 py-2"
                onClick={() => addSkill(skillInput.trim())}
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Suggestions */}
            <div className="flex flex-wrap gap-2 mb-4">
              {SKILL_SUGGESTIONS.filter(
                (s) => !profile.skills.includes(s)
              ).map((s) => (
                <button
                  key={s}
                  onClick={() => addSkill(s)}
                  className="text-xs px-2.5 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] text-slate-500 hover:border-indigo-500/30 hover:text-slate-300 transition-all"
                >
                  + {s}
                </button>
              ))}
            </div>

            {/* Selected skills */}
            {profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span key={skill} className="skill-badge">
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-1.5 hover:text-red-400 transition-colors"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            className="btn-primary w-full justify-center py-4 text-base"
          >
            {saved ? (
              <>
                <CheckCircle size={20} />
                Profile Saved! Redirecting...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Profile & Continue
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
