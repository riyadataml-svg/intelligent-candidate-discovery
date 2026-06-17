import re
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from typing import List, Dict, Tuple

# ====================================================
# FEATURE 1: BLIND HIRING MODE
# ====================================================

def anonymize_text(text: str) -> str:
    """
    Redacts personal identifiers from text to enable blind hiring.
    Redacts: Email, Phone numbers, LinkedIn, College/University names, and Gender indicators.
    """
    if not text:
        return ""
        
    # 1. Redact Emails
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    text = re.sub(email_pattern, "[REDACTED EMAIL]", text)
    
    # 2. Redact Phone Numbers (min 8 digits to avoid matching years/numbers)
    phone_pattern = r'\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}'
    def phone_replacer(match):
        val = match.group(0)
        digits = sum(c.isdigit() for c in val)
        if digits >= 8:
            return "[REDACTED PHONE]"
        return val
    text = re.sub(phone_pattern, phone_replacer, text)
    
    # 3. Redact LinkedIn URLs
    linkedin_pattern = r'(https?://)?(www\.)?linkedin\.com/in/[a-zA-Z0-9-_./]+'
    text = re.sub(linkedin_pattern, "[REDACTED LINKEDIN]", text)
    
    # 4. Redact College/University/Institute names
    edu_pattern = r'\b[A-Z][a-zA-Z0-9\s,\.\-\&]+ (University|College|Institute of Technology|School of [A-Z][a-zA-Z]+)\b'
    text = re.sub(edu_pattern, "[REDACTED EDUCATION INSTITUTION]", text)
    
    # 5. Neutralize Gender Indicators
    text = re.sub(r'\b(he|she)\b', "they", text, flags=re.IGNORECASE)
    text = re.sub(r'\b(him|her)\b', "them", text, flags=re.IGNORECASE)
    text = re.sub(r'\b(his|hers?)\b', "their", text, flags=re.IGNORECASE)
    text = re.sub(r'\b(himself|herself)\b', "themselves", text, flags=re.IGNORECASE)
    
    return text

def anonymize_candidate_list(candidates: List[Dict], enabled: bool = True) -> List[Dict]:
    """
    Returns a list of candidates with anonymized filenames, summaries, and text if enabled.
    """
    if not enabled:
        return candidates
        
    anonymized = []
    for idx, candidate in enumerate(candidates, start=1):
        cand_copy = candidate.copy()
        cand_copy['original_filename'] = candidate.get('filename', 'Unknown')
        cand_copy['filename'] = f"Candidate #{idx}"
        cand_copy['summary'] = anonymize_text(candidate.get('summary', ''))
        cand_copy['text'] = anonymize_text(candidate.get('text', ''))
        anonymized.append(cand_copy)
    return anonymized


# ====================================================
# FEATURE 2: INTERVIEW QUESTION GENERATOR
# ====================================================

# Tailored questions mapped to common skills
SKILL_QUESTIONS = {
    "Python": {
        "tech": [
            "Explain decorators in Python and write a simple custom decorator code.",
            "What is the difference between list and tuple? When would you use which and why?",
            "How does memory management and garbage collection work in Python (e.g., GIL, reference counting)?"
        ],
        "project": "Describe your Django/Flask/FastAPI project architecture. How did you handle database routing and API serialization?"
    },
    "Java": {
        "tech": [
            "What is the difference between JVM, JRE, and JDK?",
            "Explain Java garbage collection and the difference between G1 and CMS collectors.",
            "Explain object-oriented programming concepts (Abstraction vs Encapsulation) with Java examples."
        ],
        "project": "Walk me through the Spring Boot application architecture in your past projects. How did you manage dependencies?"
    },
    "Javascript": {
        "tech": [
            "Explain closure and prototypal inheritance in JavaScript.",
            "What is the difference between event loop, microtasks, and macrotasks?",
            "What is the difference between '==' and '===' in JavaScript?"
        ],
        "project": "In your frontend/Node.js project, how did you handle state management or asynchronous API orchestrations?"
    },
    "React": {
        "tech": [
            "What is the Virtual DOM and how does React's reconciliation algorithm work?",
            "Explain the difference between useEffect, useMemo, and useCallback hooks.",
            "How do you manage global state in a complex React application (e.g., Redux, Context API, Zustand)?"
        ],
        "project": "Tell me about a React project where you optimized component render performance or built custom reusable hooks."
    },
    "Aws": {
        "tech": [
            "Explain the difference between EC2, ECS, and AWS Lambda. When would you use serverless?",
            "What are IAM Roles, Policies, and Groups, and how do you enforce least privilege?",
            "How do you configure a highly available VPC architecture (subnets, route tables, NAT gateway)?"
        ],
        "project": "Describe an AWS deployment model you built. How did you handle database failover and auto-scaling?"
    },
    "Docker": {
        "tech": [
            "What is a Docker image layer and how do you write a multi-stage Dockerfile to minimize image size?",
            "What is the difference between copy and add instructions in a Dockerfile?",
            "Explain Docker network drivers and when to use bridge vs host networking."
        ],
        "project": "How did you use Docker to solve configuration drift and environment mismatch issues in your project pipeline?"
    },
    "Kubernetes": {
        "tech": [
            "Explain Kubernetes architecture components: API Server, Etcd, Scheduler, Controller Manager.",
            "What is the difference between a Pod, a Deployment, and a StatefulSet?",
            "How do Kubernetes Services route traffic, and what is the difference between ClusterIP, NodePort, and LoadBalancer?"
        ],
        "project": "Describe a Kubernetes deployment strategy (e.g., Rolling, Canary) you implemented in production."
    },
    "Sql": {
        "tech": [
            "Explain the difference between clustered and non-clustered indexes. How do they affect read/write performance?",
            "What are ACID properties in database transactions?",
            "What is the difference between INNER JOIN, LEFT JOIN, and outer joins?"
        ],
        "project": "Tell me about a complex SQL query optimization you did. How did you analyze the execution plan?"
    },
    "Machine Learning": {
        "tech": [
            "What is the difference between bagging and boosting algorithms? Give examples.",
            "How do you handle overfitting in deep learning or machine learning models?",
            "Explain evaluation metrics: Precision, Recall, F1-Score, and ROC-AUC. When is F1 better than Accuracy?"
        ],
        "project": "Explain the feature engineering process and architecture of a machine learning model you deployed."
    },
    "Figma": {
        "tech": [
            "What are Figma auto-layouts and how do they aid in creating responsive UI designs?",
            "Explain how component libraries, variants, and design systems are structured in Figma.",
            "How do you ensure UI designs meet Web Content Accessibility Guidelines (WCAG)?"
        ],
        "project": "Walk me through a UI/UX wireframing and prototyping project you designed in Figma. How did you collect user feedback?"
    },
    "Project Management": {
        "tech": [
            "What are the main phases of the project lifecycle, and how do you handle critical path analysis?",
            "How do you manage scope creep and handle stakeholder misalignment mid-project?",
            "Explain Agile scrum ceremonies and the role of a Scrum Master vs Product Owner."
        ],
        "project": "Describe a project you managed where the timeline was compromised. What recovery strategy did you implement?"
    }
}

def generate_interview_questions(skills: List[str], yoe: int, seniority: str) -> Dict[str, List[str]]:
    """
    Generates tailored technical, behavioral, and project-based questions from skills, experience, and seniority.
    """
    tech_qs = []
    project_qs = []
    
    # Match candidate skills to predefined tailored questions
    skills_lower = [s.lower() for s in skills]
    for skill_name, Qs in SKILL_QUESTIONS.items():
        if skill_name.lower() in skills_lower:
            tech_qs.extend(Qs["tech"])
            project_qs.append(Qs["project"])
            
    # Generic Tech Fallbacks if candidate has no matching skills in dict
    if not tech_qs:
        tech_qs = [
            "How do you handle code quality, linting, and automated unit testing in your daily workflow?",
            "Explain the difference between synchronous and asynchronous programming.",
            "Describe the architecture of the most complex software system you have built."
        ]
        
    if not project_qs:
        project_qs = [
            "Describe a challenging project you worked on. What were the technical constraints and how did you resolve them?",
            "How do you approach database selection (SQL vs NoSQL) when starting a new project?"
        ]
        
    # Behavioral Questions based on Seniority and YoE
    behavioral_qs = []
    if seniority in ["Senior", "Lead/Manager", "Executive"]:
        behavioral_qs = [
            "Describe a situation where you had a strong disagreement with a technical decision made by your lead or peer. How did you handle it?",
            "Tell me about a time you mentored a junior engineer or led a cross-functional squad to deliver a major feature.",
            "How do you balance high-velocity feature delivery against mounting technical debt in your team?"
        ]
    else: # Junior / Mid-Level
        behavioral_qs = [
            "Tell me about a time you encountered a severe bug in production. What steps did you take to triage and fix it?",
            "Describe a situation where you had to learn a completely new technology or tool in a very short period to complete a task.",
            "How do you handle feedback or code reviews that request major changes to your implementation?"
        ]
        
    # Limit number of questions returned (Top 3 for each category)
    return {
        "Technical": tech_qs[:3],
        "Behavioral": behavioral_qs[:3],
        "Project-Based": project_qs[:3]
    }


# ====================================================
# FEATURE 3: CANDIDATE COMPARISON MODE
# ====================================================

def compare_candidates(cand_a: Dict, cand_b: Dict) -> Tuple[pd.DataFrame, str]:
    """
    Compares Candidate A vs Candidate B and yields a comparison table and recruiter summary.
    """
    name_a = cand_a.get('filename', 'Candidate A')
    name_b = cand_b.get('filename', 'Candidate B')
    
    score_a = cand_a.get('final_score', 0.0)
    score_b = cand_b.get('final_score', 0.0)
    
    sem_a = cand_a.get('semantic_similarity', 0.0) * 100.0
    sem_b = cand_b.get('semantic_similarity', 0.0) * 100.0
    
    skill_a = cand_a.get('skill_score', 0.0)
    skill_b = cand_b.get('skill_score', 0.0)
    
    beh_a = cand_a.get('behavioral_score_display', 0.0)
    beh_b = cand_b.get('behavioral_score_display', 0.0)
    
    yoe_a = cand_a.get('years_of_experience', 0)
    yoe_b = cand_b.get('years_of_experience', 0)
    
    proj_count_a = len(cand_a.get('skills', []))  # surrogate metric for skills/projects
    proj_count_b = len(cand_b.get('skills', []))
    
    # Determine Winners
    def get_winner(val_a, val_b, label_a=name_a, label_b=name_b):
        if val_a > val_b:
            return label_a
        elif val_b > val_a:
            return label_b
        return "Tie"

    comp_data = {
        "Metric": ["Final Score", "Semantic Match", "Skill Match", "Behavioral Score", "Experience (YoE)", "Total Skills Found"],
        name_a: [f"{score_a}%", f"{round(sem_a, 2)}%", f"{round(skill_a, 2)}%", f"{round(beh_a, 2)}%", f"{yoe_a} years", proj_count_a],
        name_b: [f"{score_b}%", f"{round(sem_b, 2)}%", f"{round(skill_b, 2)}%", f"{round(beh_b, 2)}%", f"{yoe_b} years", proj_count_b],
        "Winner": [
            get_winner(score_a, score_b),
            get_winner(sem_a, sem_b),
            get_winner(skill_a, skill_b),
            get_winner(beh_a, beh_b),
            get_winner(yoe_a, yoe_b),
            get_winner(proj_count_a, proj_count_b)
        ]
    }
    
    df = pd.DataFrame(comp_data)
    
    # Recruiter Summary
    better_cand = name_a if score_a >= score_b else name_b
    worse_cand = name_b if score_a >= score_b else name_a
    diff = abs(score_a - score_b)
    
    summary = (
        f"### Recruiter Comparison Summary\n"
        f"**{better_cand}** is ranked above **{worse_cand}** by a margin of **{round(diff, 2)}%**.\n\n"
    )
    
    reasons = []
    if score_a >= score_b:
        if sem_a > sem_b:
            reasons.append(f"Stronger semantic relevance to the job requirements (+{round(sem_a - sem_b, 1)}% higher similarity).")
        if skill_a > skill_b:
            reasons.append(f"Higher technical skill overlap (+{round(skill_a - skill_b, 1)}% more key skills matched).")
        if beh_a > beh_b:
            reasons.append(f"Stronger behavioral metrics and social signals (+{round(beh_a - beh_b, 1)}% behavioral match).")
        if yoe_a > yoe_b:
            reasons.append(f"More years of relevant career experience ({yoe_a} years vs {yoe_b} years).")
    else:
        if sem_b > sem_a:
            reasons.append(f"Stronger semantic relevance to the job requirements (+{round(sem_b - sem_a, 1)}% higher similarity).")
        if skill_b > skill_a:
            reasons.append(f"Higher technical skill overlap (+{round(skill_b - skill_a, 1)}% more key skills matched).")
        if beh_b > beh_a:
            reasons.append(f"Stronger behavioral metrics and social signals (+{round(beh_b - beh_a, 1)}% behavioral match).")
        if yoe_b > yoe_a:
            reasons.append(f"More years of relevant career experience ({yoe_b} years vs {yoe_a} years).")
            
    if reasons:
        summary += f"Key differentiators for **{better_cand}** include:\n"
        for r in reasons:
            summary += f"- {r}\n"
    else:
        summary += "Both candidates have extremely close technical scores and profiles."
        
    return df, summary


# ====================================================
# FEATURE 4: TOP RECRUITER DASHBOARD
# ====================================================

def generate_recruiter_kpis(ranked_candidates: List[Dict], jd_skills: List[str]) -> Dict[str, str]:
    """
    Returns KPI dashboard card variables.
    """
    if not ranked_candidates:
        return {
            "best_candidate": "N/A",
            "total_candidates": "0",
            "strong_hires": "0",
            "skill_gaps_found": "0"
        }
        
    best_cand = ranked_candidates[0].get('filename', 'N/A')
    best_score = ranked_candidates[0].get('final_score', 0)
    best_candidate_display = f"{best_cand} ({best_score}%)"
    
    total_candidates = str(len(ranked_candidates))
    
    strong_hires = sum(1 for c in ranked_candidates if c.get('final_score', 0) >= 90)
    
    # Calculate unique missing skills across all candidates
    all_missing = set()
    for c in ranked_candidates:
        for ms in c.get('missing_skills', []):
            all_missing.add(ms.lower())
    skill_gaps_found = str(len(all_missing))
    
    return {
        "best_candidate": best_candidate_display,
        "total_candidates": total_candidates,
        "strong_hires": str(strong_hires),
        "skill_gaps_found": skill_gaps_found
    }


# ====================================================
# FEATURE 5: VISUAL ANALYTICS
# ====================================================

def plot_score_distribution(ranked_candidates: List[Dict]):
    """
    Plots score distribution using Plotly.
    """
    scores = [c.get('final_score', 0.0) for c in ranked_candidates]
    names = [c.get('filename', 'Unknown') for c in ranked_candidates]
    
    df = pd.DataFrame({"Candidate": names, "Final Score (%)": scores})
    
    fig = px.bar(
        df, 
        x="Candidate", 
        y="Final Score (%)", 
        color="Final Score (%)",
        color_continuous_scale=[
            [0.0, '#EF4444'],   # Reject (Rose)
            [0.6, '#F59E0B'],   # Consider (Amber)
            [0.75, '#10B981'],  # Hire (Emerald)
            [1.0, '#6366F1']    # Strong Hire (Indigo)
        ],
        title="Candidate Score Distribution",
        text_auto=".1f"
    )
    fig.update_layout(yaxis_range=[0, 100], template="plotly_dark")
    return fig

def plot_skill_match_comparison(ranked_candidates: List[Dict]):
    """
    Plots skill matches comparison using Plotly.
    """
    names = [c.get('filename', 'Unknown') for c in ranked_candidates]
    skill_scores = [c.get('skill_score', 0.0) for c in ranked_candidates]
    semantic_scores = [c.get('semantic_similarity', 0.0) * 100.0 for c in ranked_candidates]
    
    df = pd.DataFrame({
        "Candidate": names * 2,
        "Score (%)": skill_scores + semantic_scores,
        "Metric": ["Skill Match Overlap"] * len(names) + ["Semantic Job Match"] * len(names)
    })
    
    fig = px.bar(
        df,
        x="Candidate",
        y="Score (%)",
        color="Metric",
        barmode="group",
        title="Technical Skill vs Semantic Match",
        color_discrete_sequence=["#10B981", "#6366F1"]  # Emerald and Indigo
    )
    fig.update_layout(yaxis_range=[0, 100], template="plotly_dark")
    return fig

def plot_ranking_breakdown(ranked_candidates: List[Dict], weights: Dict[str, float]):
    """
    Plots stacked breakdown of candidate scores.
    """
    names = [c.get('filename', 'Unknown') for c in ranked_candidates]
    
    w_sem = weights.get('semantic', 0.50)
    w_skill = weights.get('skill', 0.30)
    w_beh = weights.get('behavioral', 0.20)
    
    semantic_contrib = [c.get('semantic_similarity', 0.0) * w_sem * 100.0 for c in ranked_candidates]
    skill_contrib = [(c.get('skill_score', 0.0) / 100.0) * w_skill * 100.0 for c in ranked_candidates]
    behavioral_contrib = [(c.get('behavioral_score_display', 0.0) / 100.0) * w_beh * 100.0 for c in ranked_candidates]
    
    fig = go.Figure()
    fig.add_trace(go.Bar(name='Semantic Contribution', x=names, y=semantic_contrib, marker_color='#6366F1'))
    fig.add_trace(go.Bar(name='Skill Contribution', x=names, y=skill_contrib, marker_color='#10B981'))
    fig.add_trace(go.Bar(name='Behavioral Contribution', x=names, y=behavioral_contrib, marker_color='#F59E0B'))
    
    fig.update_layout(
        barmode='stack',
        title="Candidate Score Component Breakdown",
        yaxis_title="Normalized Contribution (%)",
        yaxis_range=[0, 100],
        template="plotly_dark"
    )
    return fig


# ====================================================
# FEATURE 6: RECOMMENDATION ENGINE (NEW RULE SYSTEM)
# ====================================================

def get_recommendation_data(score: float) -> Tuple[str, str]:
    """
    Applies Feature 6 recommendation engine rules:
    Score >= 90: Strong Hire
    Score >= 75: Hire
    Score >= 60: Consider
    Else: Reject
    Returns: (Recommendation Text, Color Hex Code)
    """
    if score >= 90:
        return "Strong Hire", "#6366F1" # Primary (Indigo)
    elif score >= 75:
        return "Hire", "#10B981" # Success (Emerald)
    elif score >= 60:
        return "Consider", "#F59E0B" # Warning (Amber)
    else:
        return "Reject", "#EF4444" # Danger (Rose)

def get_recommendation_badge_html(score: float) -> str:
    """
    Returns an HTML badge for the recommendation.
    """
    rec_text, color = get_recommendation_data(score)
    font_color = "black" if rec_text == "Consider" else "white"
    return f'''
    <span style="
        background-color: {color};
        color: {font_color};
        padding: 5px 12px;
        font-size: 14px;
        font-weight: bold;
        border-radius: 12px;
        display: inline-block;
        margin-top: 5px;
    ">{rec_text}</span>
    '''


# ====================================================
# FEATURE 7: RECRUITER EXPLANATION PANEL
# ====================================================

def generate_explanation_panel(candidate: Dict, jd_yoe: int, jd_sen: str) -> Dict[str, str]:
    """
    Generates a structured recruiter explanation panel containing:
    Why Ranked Here, Strengths, Weaknesses, Missing Skills, Risk Factors, Hiring Recommendation.
    """
    score = candidate.get('final_score', 0.0)
    sem_score = candidate.get('semantic_similarity', 0.0) * 100.0
    skill_score = candidate.get('skill_score', 0.0)
    beh_score = candidate.get('behavioral_score_display', 0.0)
    yoe = candidate.get('years_of_experience', 0)
    sen = candidate.get('seniority', 'Mid-Level')
    
    # 1. Why Ranked Here
    why_ranked = (
        f"This candidate achieved a final score of **{score}%** ranking them in the shortlist. "
        f"This is driven by a **{round(sem_score, 1)}%** semantic contextual match with the JD, "
        f"a **{round(skill_score, 1)}%** exact skill set overlap, and a **{round(beh_score, 1)}%** behavioral score."
    )
    if jd_yoe > 0 and yoe < jd_yoe:
        gap = jd_yoe - yoe
        why_ranked += f" An experience penalty of **{gap * 5}%** was applied because the candidate has {yoe} years vs the required {jd_yoe} years."
        
    # 2. Strengths
    strengths = []
    if sem_score >= 70:
        strengths.append(f"Excellent overall semantic fit ({round(sem_score, 1)}% similarity) to the role's responsibilities.")
    if skill_score >= 80:
        strengths.append(f"Highly optimized key technical skill set overlap ({round(skill_score, 1)}%).")
    if yoe >= jd_yoe and yoe > 0:
        strengths.append(f"Meets or exceeds the target career tenure requirement ({yoe} years).")
    
    b = candidate.get('behavioral', {})
    if b.get('has_github') or b.get('has_open_source'):
        strengths.append("Demonstrates active open-source contribution and peer coding (GitHub).")
    if b.get('has_leadership'):
        strengths.append("Resume contains explicit signals of team coordination/leadership roles.")
        
    if not strengths:
        strengths.append("Broad match on base technical competencies.")

    # 3. Weaknesses
    weaknesses = []
    if sem_score < 50:
        weaknesses.append(f"Weak semantic match ({round(sem_score, 1)}%) to duties and job context.")
    if skill_score < 40:
        weaknesses.append("Significant technical skills gap identified against target criteria.")
    if candidate.get('missing_skills', []):
        weaknesses.append(f"Missing key required skills: {', '.join(candidate.get('missing_skills', []))}.")
        
    if not weaknesses:
        weaknesses.append("No critical profile weaknesses identified.")

    # 4. Risk Factors
    risks = []
    if jd_yoe > 0 and yoe < jd_yoe:
        risks.append(f"Tenure deficit: The role requests {jd_yoe}+ years, but candidate has {yoe} years.")
    if not (b.get('has_github') or b.get('has_linkedin') or b.get('has_portfolio')):
        risks.append("No active public portfolios or professional networks detected in resume.")
    if score < 50:
        risks.append("Low overall alignment score; high onboarding/training overhead likely.")
        
    if not risks:
        risks.append("Low risk candidate; profile matches required scope.")

    # 5. Recommendation Action
    rec_text, _ = get_recommendation_data(score)
    if rec_text == "Strong Hire":
        action = "Fast-track directly to technical coding round and leadership assessment."
    elif rec_text == "Hire":
        action = "Schedule initial technical screening call to verify core capabilities."
    elif rec_text == "Consider":
        action = "Consider for screening call if higher-ranked profiles fall through."
    else:
        action = "Politely decline/keep candidate profile in database for future junior roles."

    return {
        "why_ranked": why_ranked,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "missing_skills": candidate.get('missing_skills', []),
        "risks": risks,
        "recommendation": f"**{rec_text}**: {action}"
    }
