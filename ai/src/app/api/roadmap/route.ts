import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  let targetRole = "Software Engineer";
  try {
    const { targetRole: parsedRole, userSkills, experienceLevel } = await req.json();
    if (parsedRole) {
      targetRole = parsedRole;
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
      return NextResponse.json(getMockRoadmap(targetRole));
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const prompt = `Create a detailed 6-month career roadmap for someone wanting to become a ${targetRole}.
Current skills: ${userSkills?.join(", ") || "beginner"}
Experience level: ${experienceLevel || "student"}

Respond with a JSON object (no markdown, raw JSON only):
{
  "title": "<roadmap title>",
  "duration": "6 months",
  "phases": [
    {
      "id": "phase-1",
      "title": "<phase name>",
      "duration": "<e.g. Month 1-2>",
      "description": "<brief description>",
      "icon": "<emoji>",
      "color": "<hex color>",
      "milestones": [
        { "id": "m1", "title": "<milestone>", "type": "<learn|build|certify>", "description": "<detail>", "resources": [{ "title": "<title>", "platform": "<platform>", "duration": "<time>" }] }
      ]
    }
  ],
  "finalGoal": "<what they'll achieve>"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonStr = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return NextResponse.json(JSON.parse(jsonStr));
  } catch (error) {
    console.error("Roadmap error:", error);
    return NextResponse.json(getMockRoadmap(targetRole));
  }
}

function getMockRoadmap(targetRole: string) {
  return {
    title: `${targetRole || "Software Engineer"} Career Roadmap`,
    duration: "6 months",
    finalGoal: `Land your first ${targetRole || "Software Engineer"} job at a top tech company`,
    phases: [
      {
        id: "phase-1",
        title: "Foundation",
        duration: "Month 1-2",
        description: "Build core programming and CS fundamentals",
        icon: "🏗️",
        color: "#6366f1",
        milestones: [
          { id: "m1", title: "Master Core Language", type: "learn", description: "Become proficient in the primary language for your role (JavaScript/Python)", resources: [{ title: "The Complete JavaScript Course", platform: "Udemy", duration: "69 hrs" }, { title: "JavaScript.info", platform: "Free", duration: "Self-paced" }] },
          { id: "m2", title: "Data Structures & Algorithms", type: "learn", description: "Study arrays, linked lists, trees, sorting, searching", resources: [{ title: "Data Structures & Algorithms Bootcamp", platform: "Udemy", duration: "30 hrs" }] },
          { id: "m3", title: "Version Control with Git", type: "learn", description: "Learn Git workflow, branching, pull requests", resources: [{ title: "Git & GitHub Crash Course", platform: "YouTube", duration: "4 hrs" }] },
        ],
      },
      {
        id: "phase-2",
        title: "Core Skills",
        duration: "Month 2-3",
        description: "Learn the core technologies for your target role",
        icon: "⚡",
        color: "#8b5cf6",
        milestones: [
          { id: "m4", title: "Learn Primary Framework", type: "learn", description: "Deep dive into React.js / Node.js / relevant framework", resources: [{ title: "React - The Complete Guide", platform: "Udemy", duration: "48 hrs" }] },
          { id: "m5", title: "Database Fundamentals", type: "learn", description: "Learn SQL, PostgreSQL basics, and data modeling", resources: [{ title: "Complete SQL Bootcamp", platform: "Udemy", duration: "9 hrs" }] },
          { id: "m6", title: "Build 2 Mini Projects", type: "build", description: "Apply what you've learned by building small real-world apps", resources: [{ title: "30 Days of Projects", platform: "GitHub", duration: "Ongoing" }] },
        ],
      },
      {
        id: "phase-3",
        title: "Advanced Topics",
        duration: "Month 3-4",
        description: "Tackle advanced concepts and industry tools",
        icon: "🚀",
        color: "#06b6d4",
        milestones: [
          { id: "m7", title: "System Design Basics", type: "learn", description: "Learn scalability, load balancing, microservices concepts", resources: [{ title: "System Design Primer", platform: "GitHub", duration: "Self-paced" }] },
          { id: "m8", title: "Cloud & DevOps Basics", type: "learn", description: "Learn Docker, basic AWS/GCP, CI/CD pipelines", resources: [{ title: "Docker Mastery", platform: "Udemy", duration: "19 hrs" }] },
          { id: "m9", title: "Certification Prep", type: "certify", description: "Prepare for a relevant cloud or tech certification", resources: [{ title: "AWS Cloud Practitioner", platform: "AWS", duration: "40 hrs prep" }] },
        ],
      },
      {
        id: "phase-4",
        title: "Portfolio Projects",
        duration: "Month 4-5",
        description: "Build impressive portfolio projects to showcase skills",
        icon: "🎨",
        color: "#ec4899",
        milestones: [
          { id: "m10", title: "Build Capstone Project", type: "build", description: "Build a full-stack, production-ready project with all core technologies", resources: [{ title: "Project Ideas for Developers", platform: "GitHub", duration: "2-4 weeks" }] },
          { id: "m11", title: "Open Source Contribution", type: "build", description: "Contribute to 2-3 open source projects for real-world experience", resources: [{ title: "First Contributions Guide", platform: "GitHub", duration: "Ongoing" }] },
          { id: "m12", title: "Portfolio Website", type: "build", description: "Create a professional portfolio showcasing your projects", resources: [{ title: "Portfolio Design Tutorial", platform: "YouTube", duration: "8 hrs" }] },
        ],
      },
      {
        id: "phase-5",
        title: "Job Ready",
        duration: "Month 5-6",
        description: "Polish resume, prepare for interviews, apply to jobs",
        icon: "🎯",
        color: "#10b981",
        milestones: [
          { id: "m13", title: "Resume & LinkedIn Optimization", type: "learn", description: "Craft an ATS-optimized resume and professional LinkedIn profile", resources: [{ title: "CareerCopilot Resume Analyzer", platform: "This Platform", duration: "30 min" }] },
          { id: "m14", title: "Interview Preparation", type: "learn", description: "Practice 100+ LeetCode problems, system design, behavioral questions", resources: [{ title: "Blind 75 LeetCode", platform: "LeetCode", duration: "4 weeks" }] },
          { id: "m15", title: "Apply & Network", type: "build", description: "Apply to 5-10 jobs daily, network on LinkedIn, attend meetups", resources: [{ title: "Job Search Strategy Guide", platform: "CareerCopilot", duration: "Ongoing" }] },
        ],
      },
    ],
  };
}
