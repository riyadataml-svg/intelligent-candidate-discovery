import streamlit as st
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

@st.cache_resource(show_spinner="Downloading/Loading Sentence Transformer Model (First run only, ~100MB)...")
def load_sentence_transformer():
    try:
        return SentenceTransformer('all-MiniLM-L6-v2')
    except Exception as e:
        print(f"Error loading SentenceTransformer model: {e}")
        return None

def get_embedding(text: str) -> np.ndarray:
    """
    Generates a dense vector embedding for the given text.
    """
    model = load_sentence_transformer()
    if not text.strip() or model is None:
        return np.zeros((384,)) # Default size for all-MiniLM-L6-v2
    return model.encode([text])[0]

def calculate_semantic_similarity(jd_text: str, resume_text: str) -> float:
    """
    Calculates the cosine similarity between the Job Description and the Resume.
    Returns a score between 0 and 1.
    """
    jd_embedding = get_embedding(jd_text).reshape(1, -1)
    resume_embedding = get_embedding(resume_text).reshape(1, -1)
    
    # Cosine similarity returns a 2D array, get the scalar value
    similarity = cosine_similarity(jd_embedding, resume_embedding)[0][0]
    
    # Convert from [-1, 1] to [0, 1] range to avoid negative scores
    similarity_percentage = max(0.0, float(similarity))
    
    return similarity_percentage
