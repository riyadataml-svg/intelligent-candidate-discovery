import streamlit as st
import spacy
import re
from typing import List, Dict

@st.cache_resource(show_spinner="Downloading/Loading NLP Model (First run only)...")
def load_spacy_model():
    try:
        return spacy.load("en_core_web_sm")
    except OSError:
        print("Downloading en_core_web_sm model...")
        from spacy.cli import download
        download("en_core_web_sm")
        return spacy.load("en_core_web_sm")

# Comprehensive list of tech, product, design, management, and business skills.
COMMON_SKILLS = {
    # Programming Languages
    "python", "java", "javascript", "c++", "c#", "ruby", "go", "rust", "php",
    "typescript", "swift", "kotlin", "scala", "perl", "r", "matlab", "cobol", "solidity",
    
    # Web Frameworks & Frontend
    "react", "angular", "vue", "node.js", "django", "flask", "fastapi", "spring", "spring boot",
    "express", "laravel", "rails", "asp.net", "html", "css", "bootstrap", "tailwind", "jquery",
    "graphql", "next.js", "nuxt.js", "svelte",
    
    # Databases & Caching
    "sql", "nosql", "mongodb", "postgresql", "mysql", "oracle", "redis", "sqlite",
    "cassandra", "dynamodb", "mariadb", "elasticsearch", "neo4j", "firebase",
    
    # Cloud, DevOps & Systems
    "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "git", "linux", "terraform",
    "ansible", "ci/cd", "prometheus", "grafana", "vagrant", "bash", "powershell", "nginx",
    "apache", "cloud computing",
    
    # Data Science, AI & ML
    "machine learning", "deep learning", "nlp", "computer vision", "pandas", "numpy",
    "scikit-learn", "tensorflow", "pytorch", "keras", "data analysis", "data science",
    "tableau", "power bi", "spark", "hadoop", "statistics", "data engineering",
    "artificial intelligence", "neural networks", "data visualization",
    
    # Mobile Development
    "flutter", "react native", "ios", "android", "xamarin", "ionic",
    
    # QA, Testing & Automation
    "selenium", "cypress", "junit", "pytest", "manual testing", "automation testing",
    "postman", "qa", "testing", "loadrunner", "jmeter",
    
    # Product, Project Management & Methodologies
    "agile", "scrum", "kanban", "jira", "product management", "project management",
    "business analysis", "pmp", "scrum master", "product owner", "confluence",
    "sdlc", "risk management", "operations management",
    
    # Design, UI & UX
    "figma", "adobe xd", "photoshop", "illustrator", "sketch", "ui/ux",
    "user experience", "user interface", "wireframing", "prototyping",
    
    # Marketing, Sales & Finance
    "sales", "marketing", "digital marketing", "seo", "sem", "social media",
    "human resources", "recruitment", "talent acquisition", "financial analysis",
    "accounting", "excel", "crm", "salesforce", "business development",
    
    # Soft Skills & Leadership
    "leadership", "communication", "teamwork", "problem solving", "negotiation",
    "critical thinking", "collaboration", "public speaking", "time management"
}

def extract_skills(text: str) -> List[str]:
    """
    Extracts skills from text using spaCy and a predefined list of skills.
    """
    nlp = load_spacy_model()
    doc = nlp(text.lower())
    extracted_skills = set()
    
    # Check noun chunks and tokens against our common skills list
    for token in doc:
        if token.text in COMMON_SKILLS:
            extracted_skills.add(token.text.title())
            
    for ent in doc.ents:
        if ent.text.lower() in COMMON_SKILLS:
            extracted_skills.add(ent.text.title())
            
    # Simple regex fallbacks for common multi-word skills
    for skill in COMMON_SKILLS:
        if re.search(r'\b' + re.escape(skill) + r'\b', text.lower()):
            extracted_skills.add(skill.title())
            
    return list(extracted_skills)

def extract_years_of_experience(text: str) -> int:
    """
    Extracts the numerical years of experience. Returns 0 if none found.
    """
    exp_pattern = re.compile(r'(\d+)(?:\+|-)?\s*(?:years?|yrs?)(?:\s+of)?\s+experience', re.IGNORECASE)
    matches = exp_pattern.findall(text)
    
    if matches:
        years = [int(m) for m in matches]
        return max(years)
    return 0

def extract_seniority(text: str) -> str:
    """
    Classifies the text into a seniority level.
    """
    text_lower = text.lower()
    if re.search(r'\b(vp|vice president|director|c-level|ceo|cto|head of)\b', text_lower):
        return "Executive"
    elif re.search(r'\b(principal|staff|lead|manager|architect)\b', text_lower):
        return "Lead/Manager"
    elif re.search(r'\b(senior|snr|sr\.?)\b', text_lower):
        return "Senior"
    elif re.search(r'\b(junior|jnr|jr\.?|fresher|entry-level|entry level|intern)\b', text_lower):
        return "Junior"
    return "Mid-Level" # Default

def extract_education(text: str) -> str:
    """
    Extracts highest education level.
    """
    text_lower = text.lower()
    if re.search(r'\b(phd|doctorate|d\.phil)\b', text_lower):
        return "PhD"
    elif re.search(r'\b(master|m\.?s\.?|m\.?tech|m\.?a\.?|mba|mca)\b', text_lower):
        return "Master's"
    elif re.search(r'\b(bachelor|b\.?s\.?|b\.?tech|b\.?a\.?|bca|bsc)\b', text_lower):
        return "Bachelor's"
    return "Not specified"

def extract_certifications(text: str) -> List[str]:
    """
    Looks for industry-standard certs.
    """
    certs = []
    text_lower = text.lower()
    common_certs = {
        "aws certified": "AWS Certified",
        "azure fundamentals": "Azure Fundamentals",
        "pmp": "PMP",
        "scrum master": "Scrum Master",
        "cisco": "Cisco (CCNA/CCNP)",
        "comptia": "CompTIA",
        "gcp certified": "GCP Certified"
    }
    for key, val in common_certs.items():
        if key in text_lower:
            certs.append(val)
    return certs

def generate_summary(skills: List[str], yoe: int, seniority: str) -> str:
    """
    Generates a basic text summary of the extracted profile.
    """
    skill_str = ", ".join(skills[:10])
    if len(skills) > 10:
        skill_str += f" and {len(skills) - 10} more"
        
    exp_str = f"{yoe} years" if yoe > 0 else "Unspecified years"
    return f"Candidate is a {seniority} level professional with {exp_str} of experience. Key skills: {skill_str}."

if __name__ == "__main__":
    # Test
    sample = "I am a senior software engineer with 4 years of experience in Python, Django, and AWS. I have an MCA."
    skills = extract_skills(sample)
    yoe = extract_years_of_experience(sample)
    sen = extract_seniority(sample)
    print("Skills:", skills)
    print("Experience:", yoe)
    print("Seniority:", sen)
    print("Education:", extract_education(sample))
