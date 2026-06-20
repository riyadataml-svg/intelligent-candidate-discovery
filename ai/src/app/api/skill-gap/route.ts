import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  let userSkills: string[] = [];
  let targetRole = "Software Engineer";
  try {
    const body = await req.json();
    userSkills = body.userSkills || [];
    targetRole = body.targetRole || "Software Engineer";

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
      return NextResponse.json(getMockSkillGapData(targetRole, userSkills));
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const prompt = `You are an expert tech recruiter and skills analyst. Analyze skill gaps for the target role.

Target Role: ${targetRole}
User's Current Skills: ${userSkills.join(", ")}

Respond with a JSON object (no markdown, raw JSON only) with this structure:
{
  "matchPercentage": <0-100>,
  "requiredSkills": [
    { "name": "<skill>", "category": "<Technical|Soft|Tools>", "importance": "<Critical|Important|Nice-to-have>", "userHas": <boolean>, "userLevel": <0-100> }
  ],
  "radarData": [
    { "subject": "<category>", "userScore": <0-100>, "requiredScore": <0-100> }
  ],
  "learningPlan": [
    { "skill": "<skill>", "priority": "<High|Medium|Low>", "resources": [{ "title": "<title>", "platform": "<platform>", "duration": "<duration>", "url": "#" }] }
  ],
  "topMissingSkills": ["skill1", "skill2"],
  "readinessLevel": "<Ready|Almost Ready|Needs More Work|Major Gaps>"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonStr = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return NextResponse.json(JSON.parse(jsonStr));
  } catch (error) {
    console.error("Skill gap error:", error);
    return NextResponse.json(getMockSkillGapData(targetRole, userSkills));
  }
}

function getMockSkillGapData(targetRole: string, userSkills: string[]) {
  const roleSkills: Record<string, string[]> = {
    "Data Scientist": ["Python", "Machine Learning", "TensorFlow", "SQL", "Statistics", "Pandas", "Scikit-learn", "Deep Learning"],
    "Frontend Developer": ["React.js", "TypeScript", "CSS", "JavaScript", "Next.js", "Redux", "Testing", "Performance"],
    "Backend Developer": ["Node.js", "Python", "PostgreSQL", "REST APIs", "Docker", "AWS", "Redis", "System Design"],
    "Full Stack Developer": ["React.js", "Node.js", "TypeScript", "PostgreSQL", "Docker", "AWS", "Git", "REST APIs"],
    "DevOps Engineer": ["Docker", "Kubernetes", "AWS", "CI/CD", "Terraform", "Linux", "Monitoring", "Scripting"],
  };

  const required = roleSkills[targetRole] || roleSkills["Full Stack Developer"];
  const skills = required.map((skill) => {
    const has = userSkills.some((s) => s.toLowerCase().includes(skill.toLowerCase()));
    return {
      name: skill,
      category: ["Python", "React.js", "TypeScript", "Node.js", "Machine Learning"].includes(skill) ? "Technical" : "Tools",
      importance: ["Python", "React.js", "Node.js", "Machine Learning"].includes(skill) ? "Critical" : "Important",
      userHas: has,
      userLevel: has ? Math.floor(Math.random() * 40) + 55 : Math.floor(Math.random() * 25),
    };
  });

  return {
    matchPercentage: Math.floor((skills.filter((s) => s.userHas).length / skills.length) * 100),
    requiredSkills: skills,
    radarData: [
      { subject: "Technical", userScore: 65, requiredScore: 90 },
      { subject: "Tools", userScore: 55, requiredScore: 80 },
      { subject: "Soft Skills", userScore: 75, requiredScore: 70 },
      { subject: "Frameworks", userScore: 50, requiredScore: 85 },
      { subject: "Cloud", userScore: 30, requiredScore: 75 },
    ],
    learningPlan: skills.filter((s) => !s.userHas).slice(0, 4).map((s) => ({
      skill: s.name,
      priority: s.importance === "Critical" ? "High" : "Medium",
      resources: [
        { title: `${s.name} Complete Course`, platform: "Udemy", duration: "20 hrs", url: "#" },
        { title: `${s.name} Documentation`, platform: "Official Docs", duration: "Self-paced", url: "#" },
        { title: `${s.name} Practice Projects`, platform: "GitHub", duration: "Ongoing", url: "#" },
      ],
    })),
    topMissingSkills: skills.filter((s) => !s.userHas).map((s) => s.name),
    readinessLevel: skills.filter((s) => s.userHas).length >= skills.length * 0.7 ? "Almost Ready" : "Needs More Work",
  };
}
