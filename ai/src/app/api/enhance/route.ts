import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  let text = "";
  let section = "Experience";
  try {
    const body = await req.json();
    text = body.text || "";
    section = body.section || "Experience";

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
      return NextResponse.json(getMockEnhancement(text, section));
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const prompt = `You are a professional resume writer. Enhance the following resume ${section} to be more impactful, ATS-friendly, and professional.

Original text:
${text}

Rules:
- Start bullet points with strong action verbs (Architected, Engineered, Spearheaded, Optimized, etc.)
- Add quantifiable metrics where possible (%, numbers, timeframes)
- Keep approximately the same length
- Make it professional and industry-standard
- Fix any grammar issues

Respond with a JSON object (no markdown):
{
  "enhanced": "<improved text>",
  "changes": [
    { "type": "verb", "original": "<old>", "replacement": "<new>", "reason": "<why>" },
    { "type": "metric", "original": "<old>", "replacement": "<new>", "reason": "<why>" }
  ],
  "actionVerbs": ["verb1", "verb2", "verb3"],
  "score": { "before": <0-100>, "after": <0-100> },
  "tips": ["tip1", "tip2"]
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim().replace(/```json\n?/g, "").replace(/```\n?/g, "");
    return NextResponse.json(JSON.parse(responseText));
  } catch (error) {
    console.error("Enhance error:", error);
    return NextResponse.json(getMockEnhancement(text, section));
  }
}

function getMockEnhancement(text: string, section: string) {
  const lines = (text || "").split("\n").filter((l) => l.trim());

  const enhanced = lines.map((line) => {
    const weak = ["worked on", "helped with", "did", "made", "was responsible for", "assisted"];
    const strong = ["Engineered", "Spearheaded", "Architected", "Developed", "Orchestrated", "Implemented"];
    let result = line;
    weak.forEach((w, i) => {
      if (line.toLowerCase().includes(w)) {
        result = result.replace(new RegExp(w, "gi"), strong[i % strong.length]);
      }
    });
    // Add metric if no number present
    if (!/\d+/.test(result) && result.includes("•")) {
      result = result.replace(/\.$/, ", resulting in a 30% improvement in efficiency.");
    }
    return result;
  }).join("\n");

  return {
    enhanced: enhanced || "• Architected and deployed a scalable REST API serving 10,000+ daily active users, reducing response time by 45%\n• Engineered a real-time data pipeline processing 1M+ records/day using Python and Apache Kafka\n• Optimized database queries reducing load time by 60% and improving user satisfaction scores",
    changes: [
      { type: "verb", original: "worked on", replacement: "Engineered", reason: "Stronger action verb that demonstrates ownership" },
      { type: "metric", original: "improved performance", replacement: "improved performance by 45%", reason: "Quantifiable impact is 3x more effective for recruiters" },
      { type: "verb", original: "helped with", replacement: "Spearheaded", reason: "Shows leadership and initiative" },
    ],
    actionVerbs: ["Architected", "Engineered", "Optimized", "Spearheaded", "Orchestrated", "Implemented", "Streamlined", "Accelerated"],
    score: { before: 42, after: 85 },
    tips: [
      "Lead every bullet with a strong past-tense action verb",
      "Include at least one number or percentage per bullet point",
      "Focus on impact, not just responsibilities",
    ],
  };
}
