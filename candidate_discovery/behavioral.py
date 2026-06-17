import re
from typing import Dict

def extract_behavioral_signals(text: str) -> Dict[str, any]:
    """
    Extracts behavioral signals like URLs, hackathon keywords, and open source mentions.
    Returns a dictionary of boolean flags and a total behavioral score out of 100.
    """
    text_lower = text.lower()
    
    # 1. Check for GitHub presence
    has_github = bool(re.search(r'github\.com\/[a-zA-Z0-9-]+', text_lower))
    
    # 2. Check for LinkedIn presence
    has_linkedin = bool(re.search(r'linkedin\.com\/in\/[a-zA-Z0-9-]+', text_lower))
    
    # 3. Check for Portfolio/Personal Website (common keywords or generic URLs)
    has_portfolio = bool(re.search(r'(portfolio|personal website|bit\.ly|linktr\.ee)', text_lower))
    
    # 4. Check for Hackathon or Open Source keywords
    hackathon_keywords = ['hackathon', 'competitive programming', 'leetcode', 'kaggle']
    has_hackathon = any(keyword in text_lower for keyword in hackathon_keywords)
    
    open_source_keywords = ['open source', 'open-source', 'contributed to']
    has_open_source = any(keyword in text_lower for keyword in open_source_keywords)
    
    # 5. Leadership/Initiative keywords
    leadership_keywords = ['led a team', 'founder', 'co-founder', 'president', 'manager', 'organized']
    has_leadership = any(keyword in text_lower for keyword in leadership_keywords)
    
    # Calculate a simple behavioral score out of 100
    score = 0
    if has_github: score += 25
    if has_linkedin: score += 15
    if has_portfolio: score += 15
    if has_hackathon: score += 20
    if has_open_source: score += 15
    if has_leadership: score += 10
    
    return {
        "has_github": has_github,
        "has_linkedin": has_linkedin,
        "has_portfolio": has_portfolio,
        "has_hackathon": has_hackathon,
        "has_open_source": has_open_source,
        "has_leadership": has_leadership,
        "behavioral_score": min(100, score) # Cap at 100
    }
