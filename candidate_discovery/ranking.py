from typing import List, Dict

def calculate_skill_match(jd_skills: List[str], resume_skills: List[str]) -> float:
    """
    Calculates a basic skill match ratio using Jaccard-like similarity.
    """
    if not jd_skills:
        return 1.0 # If JD has no specific skills, assume full match
        
    jd_set = set([s.lower() for s in jd_skills])
    resume_set = set([s.lower() for s in resume_skills])
    
    # Intersection over JD skills length
    intersection = jd_set.intersection(resume_set)
    return len(intersection) / len(jd_set)

def get_missing_skills(jd_skills: List[str], resume_skills: List[str]) -> List[str]:
    """
    Returns skills required by JD that are not found in the resume.
    """
    jd_set = set([s.lower() for s in jd_skills])
    resume_set = set([s.lower() for s in resume_skills])
    
    missing = jd_set - resume_set
    # Format nicely
    return [skill.title() for skill in missing]

def generate_narrative_insight(semantic: float, skill: float, beh: float, yoe: int, jd_yoe: int, sen: str, jd_sen: str, final_score: float) -> str:
    """
    Generates a deterministic narrative insight.
    """
    insight = ""
    
    if final_score >= 85:
        insight += f"Highly recommended. "
    elif final_score >= 60:
        insight += f"Solid potential. "
    else:
        insight += f"May not be a strong fit. "
        
    if skill >= 0.8:
        insight += "Exceptional technical skill match. "
    elif skill <= 0.3:
        insight += "Lacks critical required skills. "
        
    if jd_yoe > 0:
        if yoe >= jd_yoe:
            insight += f"Meets/exceeds the {jd_yoe}+ years experience requirement. "
        elif yoe > 0:
            insight += f"Falls short of the {jd_yoe} years required (has {yoe} years). "
            
    if beh >= 0.5:
        insight += "Shows strong behavioral signals (e.g., GitHub/Open Source presence)."
        
    return insight.strip()

def generate_final_ranking(candidates_data: List[Dict], jd_text: str, jd_skills: List[str], jd_yoe: int, jd_sen: str, weights: Dict[str, float]) -> List[Dict]:
    """
    Calculates the final ranking using adaptive weights and contextual metadata.
    """
    w_sem = weights.get('semantic', 0.60)
    w_skill = weights.get('skill', 0.25)
    w_beh = weights.get('behavioral', 0.15)
    
    for candidate in candidates_data:
        semantic_score = candidate.get('semantic_similarity', 0.0)
        
        # Calculate Skill Score
        resume_skills = candidate.get('skills', [])
        skill_score = calculate_skill_match(jd_skills, resume_skills)
        candidate['skill_score'] = skill_score * 100 # Store as percentage
        
        # Calculate Behavioral Score
        behavioral_data = candidate.get('behavioral', {})
        behavioral_score = behavioral_data.get('behavioral_score', 0) / 100.0
        candidate['behavioral_score_display'] = behavioral_score * 100
        
        # Determine missing skills
        candidate['missing_skills'] = get_missing_skills(jd_skills, resume_skills)
        
        # Experience Penalty Logic
        yoe = candidate.get('years_of_experience', 0)
        sen = candidate.get('seniority', 'Mid-Level')
        
        exp_penalty = 0.0
        if jd_yoe > 0 and yoe < jd_yoe:
            # 5% penalty for each year short, capped at 20%
            gap = jd_yoe - yoe
            exp_penalty = min(0.20, gap * 0.05)
            
        # Final Formula calculation
        base_score = (semantic_score * w_sem) + (skill_score * w_skill) + (behavioral_score * w_beh)
        
        # Apply penalty
        final_score = max(0.0, base_score - exp_penalty)
        final_score_percentage = round(final_score * 100, 2)
        candidate['final_score'] = final_score_percentage
        
        # Narrative Generation
        candidate['narrative'] = generate_narrative_insight(
            semantic_score, skill_score, behavioral_score, 
            yoe, jd_yoe, sen, jd_sen, final_score_percentage
        )
        
        # Recommendation Logic
        if final_score_percentage >= 85:
            candidate['recommendation'] = "Strong Hire"
        elif final_score_percentage >= 65:
            candidate['recommendation'] = "Hire"
        elif final_score_percentage >= 50:
            candidate['recommendation'] = "Consider"
        else:
            candidate['recommendation'] = "Reject"
            
    # Sort candidates by final score descending
    ranked_candidates = sorted(candidates_data, key=lambda x: x['final_score'], reverse=True)
    return ranked_candidates
