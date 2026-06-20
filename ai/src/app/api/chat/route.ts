import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { message, history, userProfile } = await req.json();

    const systemContext = userProfile
      ? `User Profile: Name: ${userProfile.name || "Student"}, Target Role: ${userProfile.targetRole || "Software Engineer"}, Experience: ${userProfile.experience || "student"}, Current Skills: ${userProfile.skills?.join(", ") || "beginner"}`
      : "User is a student or job seeker seeking career advice.";

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
      await new Promise((r) => setTimeout(r, 800));
      return NextResponse.json({ reply: getMockReply(message) });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const conversationHistory = (history || [])
      .map((m: { role: string; content: string }) =>
        `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`
      )
      .join("\n");

    const prompt = `You are CareerCopilot AI, an expert career mentor for students and job seekers. You provide personalized, actionable career guidance.

${systemContext}

Conversation history:
${conversationHistory}

User: ${message}

Provide a helpful, encouraging, and specific response. Keep it conversational and under 200 words. Use bullet points when listing multiple items.`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ reply: getMockReply("") });
  }
}

function getMockReply(message: string): string {
  const msg = (message || "").toLowerCase();

  if (msg.includes("data scientist") || msg.includes("data science")) {
    return "Great choice! 🎯 To become a Data Scientist, here's your path:\n\n• **Python** — Learn NumPy, Pandas, Matplotlib\n• **Statistics & Math** — Probability, linear algebra, regression\n• **Machine Learning** — Scikit-learn, then TensorFlow/PyTorch\n• **SQL** — Essential for querying databases\n• **Projects** — Kaggle competitions are gold for your portfolio\n\nStart with the Google Data Analytics Certificate or Andrew Ng's ML course on Coursera. Timeline: 6-9 months of consistent practice. You've got this! 💪";
  }
  if (msg.includes("resume") || msg.includes("cv")) {
    return "Here are the top resume tips for tech roles:\n\n• **Quantify everything** — 'Improved performance by 40%' beats 'Improved performance'\n• **Use ATS keywords** — Mirror the job description language\n• **Action verbs** — Start bullets with: Architected, Built, Reduced, Led, Increased\n• **Projects section** — List 3-4 strong projects with tech stack + impact\n• **One page** — For < 3 years experience, keep it to 1 page\n\nTry our Resume Analyzer for a detailed ATS score and personalized suggestions!";
  }
  if (msg.includes("backend") || msg.includes("back-end")) {
    return "Backend Development is a fantastic career path! Here's what to focus on:\n\n• **Language** — Node.js (JavaScript), Python (Django/FastAPI), or Java (Spring)\n• **Databases** — PostgreSQL, MongoDB, Redis\n• **APIs** — REST API design, authentication (JWT, OAuth)\n• **DevOps basics** — Docker, CI/CD, basic AWS/GCP\n• **System Design** — Start reading 'Designing Data-Intensive Applications'\n\nBuild 2-3 projects showcasing CRUD APIs, authentication, and database design. That's your ticket to a junior backend role!";
  }
  if (msg.includes("interview") || msg.includes("prepare")) {
    return "Interview prep strategy for tech roles:\n\n• **DSA** — Solve 75-100 LeetCode problems (focus on arrays, trees, DP)\n• **System Design** — Study scalability, caching, databases (use systemdesign.io)\n• **Behavioral** — Prepare 8-10 STAR stories covering leadership, conflict, failure\n• **Company research** — Study their tech stack, recent news, culture\n• **Mock interviews** — Practice our AI Mock Interview feature daily!\n\n4-6 weeks of focused prep is usually enough for junior roles. Start today!";
  }
  if (msg.includes("career") || msg.includes("path") || msg.includes("which")) {
    return "Choosing the right career path depends on your interests! Let me help:\n\n• **Love UI/visuals?** → Frontend (React, TypeScript)\n• **Love logic/systems?** → Backend (Node.js, Python)\n• **Love data?** → Data Science/ML\n• **Love automation?** → DevOps/Cloud\n• **Love both frontend & backend?** → Full Stack\n\nThe best path is the one that excites you! What subjects do you enjoy most — math, design, problem-solving, or infrastructure? Tell me more about your interests and I'll give you a personalized recommendation.";
  }

  return "Great question! As your AI career mentor, I'm here to help you navigate your career journey. I can assist with:\n\n• **Career direction** — Which path suits your skills and interests\n• **Skills to learn** — Exactly what to study for your target role\n• **Resume tips** — How to make your resume ATS-friendly\n• **Interview prep** — Strategies for technical and behavioral rounds\n• **Learning resources** — Best courses, books, and platforms\n\nWhat specific aspect of your career would you like to discuss? The more details you share, the more personalized my advice will be!";
}
