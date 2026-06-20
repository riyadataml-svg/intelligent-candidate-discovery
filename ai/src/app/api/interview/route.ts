import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  let action = "";
  let role = "Software Engineer";
  let level = "Junior";
  let question = "";
  let answer = "";

  try {
    const body = await req.json();
    action = body.action || "";
    role = body.role || "Software Engineer";
    level = body.level || "Junior";
    question = body.question || "";
    answer = body.answer || "";
  } catch (err) {
    console.error("Error parsing request body:", err);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
      if (action === "generate") return NextResponse.json(getMockQuestions(role, level));
      if (action === "evaluate") return NextResponse.json(getMockEvaluation(answer));
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    if (action === "generate") {
      const prompt = `Generate 8 interview questions for a ${level} ${role} position.
Mix: 3 technical, 2 behavioral, 2 situational, 1 system design.
Respond with JSON only (no markdown):
{
  "questions": [
    { "id": "q1", "text": "<question>", "type": "<Technical|Behavioral|Situational|System Design>", "difficulty": "<Easy|Medium|Hard>", "timeLimit": <seconds: 90-180>, "hint": "<optional hint>" }
  ]
}`;
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim().replace(/```json\n?/g, "").replace(/```\n?/g, "");
      return NextResponse.json(JSON.parse(text));
    }

    if (action === "evaluate") {
      const prompt = `Evaluate this interview answer as an expert interviewer.
Question: ${question}
Candidate's Answer: ${answer}

Respond with JSON only (no markdown):
{
  "scores": {
    "clarity": <0-100>,
    "technicalAccuracy": <0-100>,
    "confidence": <0-100>,
    "communication": <0-100>
  },
  "overall": <0-100>,
  "grade": "<A|B|C|D|F>",
  "feedback": "<2-3 sentences of specific feedback>",
  "strengths": ["<strength1>"],
  "improvements": ["<improvement1>"],
  "modelAnswer": "<brief ideal answer in 2-3 sentences>"
}`;
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim().replace(/```json\n?/g, "").replace(/```\n?/g, "");
      return NextResponse.json(JSON.parse(text));
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Interview error:", error);
    if (action === "evaluate") {
      return NextResponse.json(getMockEvaluation(answer));
    }
    return NextResponse.json(getMockQuestions(role, level));
  }
}

function getMockQuestions(role: string, level: string) {
  return {
    questions: [
      { id: "q1", text: `Tell me about yourself and why you want to become a ${level} ${role}.`, type: "Behavioral", difficulty: "Easy", timeLimit: 120, hint: "Structure: Past → Present → Future" },
      { id: "q2", text: "Explain the difference between REST and GraphQL APIs. When would you choose one over the other?", type: "Technical", difficulty: "Medium", timeLimit: 150, hint: "Focus on use cases and trade-offs" },
      { id: "q3", text: "Describe a time you had to debug a complex production issue under pressure. What was your approach?", type: "Situational", difficulty: "Medium", timeLimit: 180, hint: "Use STAR method: Situation, Task, Action, Result" },
      { id: "q4", text: "How does JavaScript's event loop work? Explain with an example.", type: "Technical", difficulty: "Hard", timeLimit: 150, hint: "Mention call stack, task queue, microtask queue" },
      { id: "q5", text: "Design a URL shortener like bit.ly. Walk me through your system design.", type: "System Design", difficulty: "Hard", timeLimit: 180, hint: "Consider: scalability, hashing, databases, caching" },
      { id: "q6", text: "What is the difference between useState and useEffect in React? Give examples.", type: "Technical", difficulty: "Easy", timeLimit: 90, hint: "Focus on purpose and lifecycle" },
      { id: "q7", text: "Tell me about a project you're most proud of. What challenges did you overcome?", type: "Behavioral", difficulty: "Easy", timeLimit: 120, hint: "Highlight your specific contributions" },
      { id: "q8", text: "How would you optimize a web application that's experiencing slow load times?", type: "Situational", difficulty: "Medium", timeLimit: 150, hint: "Think: network, rendering, caching, code splitting" },
    ],
  };
}

function getMockEvaluation(answer: string) {
  const hasContent = answer && answer.length > 50;
  return {
    scores: {
      clarity: hasContent ? 72 : 45,
      technicalAccuracy: hasContent ? 68 : 40,
      confidence: hasContent ? 75 : 55,
      communication: hasContent ? 78 : 50,
    },
    overall: hasContent ? 73 : 47,
    grade: hasContent ? "B" : "C",
    feedback: hasContent
      ? "Good answer with solid structure. You covered the main concepts clearly. Consider adding a concrete example from your experience to make it more memorable and specific."
      : "Your answer needs more depth. Try to provide specific examples and elaborate on the technical details. Use the STAR method for behavioral questions.",
    strengths: ["Clear structure", "Good communication style"],
    improvements: ["Add specific examples", "Include more technical depth", "Quantify your impact"],
    modelAnswer: "A strong answer would include a concrete example from personal experience, specific technical details, and measurable outcomes or results achieved.",
  };
}
