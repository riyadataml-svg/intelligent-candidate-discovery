import pandas as pd
from typing import List, Dict

def format_rankings_as_dataframe(ranked_candidates: List[Dict]) -> pd.DataFrame:
    """
    Converts the ranked candidates dictionary into a pandas DataFrame for Streamlit display.
    """
    if not ranked_candidates:
        return pd.DataFrame()
        
    data = []
    for idx, candidate in enumerate(ranked_candidates, start=1):
        data.append({
            "Rank": idx,
            "Candidate File": candidate.get('filename', 'Unknown'),
            "Final Score (%)": candidate.get('final_score', 0),
            "Semantic (%)": round(candidate.get('semantic_similarity', 0) * 100, 2),
            "Skill (%)": round(candidate.get('skill_score', 0), 2),
            "Behavioral (%)": round(candidate.get('behavioral_score_display', 0), 2),
            "Years of Experience": candidate.get('years_of_experience', 0),
            "Seniority": candidate.get('seniority', 'Mid-Level'),
            "Education": candidate.get('education', 'Not specified'),
            "Certifications": ", ".join(candidate.get('certifications', [])),
            "Recommendation": candidate.get('recommendation', 'Unknown'),
            "Narrative Insight": candidate.get('narrative', ''),
            "Missing Skills": ", ".join(candidate.get('missing_skills', []))
        })
        
    df = pd.DataFrame(data)
    return df

def generate_csv_download(df: pd.DataFrame) -> bytes:
    """
    Converts a pandas DataFrame to CSV bytes for download.
    """
    return df.to_csv(index=False).encode('utf-8')
