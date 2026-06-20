import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CareerCopilot AI — Your Personal AI Career Mentor",
  description:
    "CareerCopilot AI is an AI-powered career guidance platform that helps students and job seekers evaluate their resumes, identify skill gaps, receive personalized learning recommendations, prepare for interviews, and improve employability.",
  keywords: [
    "career guidance",
    "AI resume analysis",
    "mock interview",
    "skill gap detection",
    "career roadmap",
    "ATS score",
    "job preparation",
  ],
  openGraph: {
    title: "CareerCopilot AI",
    description: "Your Personal AI Career Mentor for Smarter Career Growth.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="font-sans antialiased">
        {/* Ambient orbs */}
        <div
          className="orb"
          style={{
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, #6366f1, transparent)",
            top: "-100px",
            left: "-200px",
          }}
        />
        <div
          className="orb"
          style={{
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, #8b5cf6, transparent)",
            top: "40%",
            right: "-150px",
            animationDelay: "3s",
          }}
        />
        <div
          className="orb"
          style={{
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, #06b6d4, transparent)",
            bottom: "10%",
            left: "30%",
            animationDelay: "6s",
          }}
        />

        <Navbar />
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
