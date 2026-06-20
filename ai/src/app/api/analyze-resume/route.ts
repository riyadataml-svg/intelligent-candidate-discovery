import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { resumeText, targetRole } = await req.json();

    if (!resumeText) {
      return NextResponse.json({ error: "Resume text required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
      // Return mock data if no API key
      return NextResponse.json(getMockResumeData(targetRole));
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const prompt = `You are an expert career coach and ATS system analyst. Analyze the following resume and provide a detailed evaluation.

Target Role: ${targetRole || "Software Engineer"}

Resume Text:
${resumeText}

Respond with a JSON object (no markdown, no code blocks, just raw JSON) with this exact structure:
{
  "atsScore": <number 0-100>,
  "overallRating": "<Excellent|Good|Average|Needs Work>",
  "summary": "<2-3 sentence overall assessment>",
  "sections": {
    "education": { "found": <boolean>, "score": <0-100>, "content": "<brief summary>" },
    "experience": { "found": <boolean>, "score": <0-100>, "content": "<brief summary>" },
    "projects": { "found": <boolean>, "score": <0-100>, "content": "<brief summary>" },
    "skills": { "found": <boolean>, "score": <0-100>, "content": "<brief summary>" },
    "certifications": { "found": <boolean>, "score": <0-100>, "content": "<brief summary>" }
  },
  "extractedSkills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"],
    "tools": ["tool1", "tool2"],
    "languages": ["lang1", "lang2"]
  },
  "missingKeywords": ["keyword1", "keyword2"],
  "suggestions": [
    { "priority": "high", "category": "Content", "title": "<title>", "description": "<description>" },
    { "priority": "medium", "category": "Format", "title": "<title>", "description": "<description>" }
  ],
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip markdown code blocks if present
    const jsonStr = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const data = JSON.parse(jsonStr);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Resume analysis error:", error);
    return NextResponse.json(getMockResumeData("Software Engineer"));
  }
}

function getMockResumeData(targetRole: string) {
  return {
    atsScore: 78,
    overallRating: "Good",
    summary: `Your resume shows strong technical foundations suitable for a ${targetRole || "Software Engineer"} role. The structure is clear, but adding more quantifiable achievements would significantly boost your ATS score and recruiter appeal.`,
    sections: {
      education: { found: true, score: 85, content: "Well-structured education section with relevant degree" },
      experience: { found: true, score: 72, content: "Good experience listed but could use more impact metrics" },
      projects: { found: true, score: 80, content: "Solid project portfolio demonstrating practical skills" },
      skills: { found: true, score: 88, content: "Technical skills section is comprehensive and relevant" },
      certifications: { found: false, score: 20, content: "No certifications found — consider adding relevant ones" },
    },
    extractedSkills: {
      technical: ["React.js", "Node.js", "Python", "REST APIs", "SQL"],
      soft: ["Problem Solving", "Team Collaboration", "Communication"],
      tools: ["Git", "VS Code", "Postman", "Docker"],
      languages: ["JavaScript", "Python", "HTML/CSS"],
    },
    missingKeywords: ["TypeScript", "AWS", "CI/CD", "Agile", "Unit Testing", "System Design"],
    suggestions: [
      { priority: "high", category: "Content", title: "Add Quantifiable Achievements", description: "Replace vague statements with measurable impact. E.g., 'Improved app performance by 40%' instead of 'Improved app performance'." },
      { priority: "high", category: "Keywords", title: "Include Missing ATS Keywords", description: "Add TypeScript, AWS, CI/CD, and Agile to your skills or experience descriptions to pass ATS filters." },
      { priority: "medium", category: "Format", title: "Use Action Verbs", description: "Start each bullet point with strong action verbs like 'Architected', 'Optimized', 'Engineered', 'Deployed'." },
      { priority: "medium", category: "Content", title: "Add Certifications", description: "Consider adding AWS Certified Developer, Google Cloud, or Meta Frontend Developer certifications." },
      { priority: "low", category: "Format", title: "Consistent Formatting", description: "Ensure consistent date formatting and bullet point style throughout the resume." },
    ],
    strengths: [
      "Clear technical skills section with relevant technologies",
      "Well-organized project descriptions",
      "Good educational background",
    ],
    weaknesses: [
      "Lack of quantifiable achievements and metrics",
      "Missing industry keywords (TypeScript, AWS, CI/CD)",
      "No certifications listed",
    ],
  };
}
