import streamlit as st
import pandas as pd
from parser import extract_text
from skill_extractor import (
    extract_skills, 
    extract_years_of_experience, 
    extract_seniority, 
    extract_education, 
    extract_certifications, 
    generate_summary
)
from behavioral import extract_behavioral_signals
from matcher import calculate_semantic_similarity
from ranking import generate_final_ranking
from utils import format_rankings_as_dataframe, generate_csv_download

# Import advanced features
from advanced_features import (
    anonymize_candidate_list,
    get_recommendation_data,
    generate_recruiter_kpis,
    plot_score_distribution,
    plot_skill_match_comparison,
    plot_ranking_breakdown,
    compare_candidates,
    generate_explanation_panel,
    get_recommendation_badge_html,
    generate_interview_questions
)

st.set_page_config(page_title="TalentIQ AI - Candidate Intelligence Platform", page_icon="🚀", layout="wide")

# Custom CSS for Premium Slate-900 dark theme, bounded container, and clean spacing
st.markdown("""
<style>
    /* Slate-900 background styling */
    .stApp {
        background-color: #0F172A !important;
        color: #F8FAFC !important;
    }
    
    /* Bounded container width to avoid wide stretching (Ashby/LinkedIn style) */
    .block-container {
        padding-top: 1.5rem !important;
        padding-bottom: 1.5rem !important;
        padding-left: 2rem !important;
        padding-right: 2rem !important;
        max-width: 1200px !important;
        margin: 0 auto !important;
    }
    
    /* Custom Scrollbar */
    ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }
    ::-webkit-scrollbar-track {
        background: #0F172A;
    }
    ::-webkit-scrollbar-thumb {
        background: #334155;
        border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
        background: #475569;
    }

    /* Modern typography & font weight */
    h1, h2, h3, h4, h5, h6 {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        color: #F8FAFC !important;
        font-weight: 700 !important;
    }
    
    /* Premium SaaS Card container styling */
    div[data-testid="stVerticalBlock"] > div > div[data-testid="element-container"] > div.stAlert,
    div[data-testid="stExpander"], 
    div[data-testid="stDataFrame"],
    .saas-card {
        background-color: #1E293B !important;
        border: 1px solid #334155 !important;
        border-radius: 12px !important;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1) !important;
        padding: 12px 16px !important;
        margin-bottom: 12px !important;
    }

    /* Streamlit Container card overrides */
    div[data-testid="stContainer"] {
        background-color: #1E293B !important;
        border: 1px solid #334155 !important;
        border-radius: 12px !important;
        padding: 16px !important;
        margin-bottom: 12px !important;
    }

    /* Expander styling */
    div[data-testid="stExpander"] {
        padding: 0px !important;
    }
    div[data-testid="stExpander"] details summary {
        background-color: #1E293B !important;
        color: #F8FAFC !important;
        border-radius: 12px !important;
        padding: 10px 16px !important;
        font-weight: 600 !important;
        font-size: 0.95rem !important;
    }
    div[data-testid="stExpander"] details summary:hover {
        background-color: #334155 !important;
    }

    /* Prominent Run Analysis button (Indigo CTA) */
    button[kind="primary"] {
        background-color: #6366F1 !important;
        color: #FFFFFF !important;
        border: none !important;
        border-radius: 8px !important;
        padding: 10px 20px !important;
        font-weight: 700 !important;
        font-size: 0.95rem !important;
        box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3) !important;
        transition: all 0.2s ease-in-out !important;
        width: 100% !important;
        margin-top: 10px !important;
    }
    button[kind="primary"]:hover {
        background-color: #4F46E5 !important;
        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.5) !important;
    }
    
    /* Secondary CTA buttons (CSV download etc.) */
    button[kind="secondary"] {
        background-color: #334155 !important;
        color: #F8FAFC !important;
        border: 1px solid #475569 !important;
        border-radius: 8px !important;
        padding: 8px 16px !important;
        font-size: 0.85rem !important;
        transition: all 0.2s ease-in-out !important;
    }
    button[kind="secondary"]:hover {
        background-color: #475569 !important;
    }

    /* Style Streamlit Tabs */
    button[data-baseweb="tab"] {
        color: #94A3B8 !important;
        background-color: transparent !important;
        font-weight: 600 !important;
        font-size: 0.9rem !important;
        padding: 8px 20px !important;
        border-radius: 6px !important;
        border: 1px solid transparent !important;
        margin-right: 8px !important;
        transition: all 0.2s ease !important;
    }
    button[data-baseweb="tab"]:hover {
        color: #F8FAFC !important;
        background-color: #334155 !important;
    }
    button[data-baseweb="tab"][aria-selected="true"] {
        color: #FFFFFF !important;
        background-color: #6366F1 !important;
        border-color: #6366F1 !important;
        box-shadow: 0 4px 8px rgba(99, 102, 241, 0.2) !important;
    }
    div[data-testid="stTabBar"] {
        background-color: #0F172A !important;
        border-bottom: 1px solid #334155 !important;
        padding-bottom: 6px !important;
        margin-bottom: 14px !important;
    }

    /* Compact File Uploader */
    div[data-testid="stFileUploader"] {
        padding: 0px !important;
    }
    div[data-testid="stFileUploader"] > section {
        padding: 10px 14px !important;
        background-color: #0F172A !important;
        border: 1.5px dashed #475569 !important;
        border-radius: 8px !important;
        color: #94A3B8 !important;
        transition: border-color 0.2s ease !important;
    }
    div[data-testid="stFileUploader"] > section:hover {
        border-color: #6366F1 !important;
    }
    
    /* Input Label Padding Fixes */
    label[data-testid="stWidgetLabel"] {
        color: #E2E8F0 !important;
        font-size: 0.85rem !important;
        font-weight: 600 !important;
        margin-bottom: 4px !important;
    }

    /* Form Fields and Text inputs styling */
    .stTextInput input, .stTextArea textarea {
        background-color: #0F172A !important;
        color: #F8FAFC !important;
        border: 1px solid #334155 !important;
        border-radius: 8px !important;
        padding: 8px 12px !important;
        font-size: 0.85rem !important;
    }
    .stTextInput input:focus, .stTextArea textarea:focus {
        border-color: #6366F1 !important;
        box-shadow: 0 0 0 1px #6366F1 !important;
    }

    /* Layout Spacing (Gaps between items) */
    div[data-testid="stVerticalBlock"] {
        gap: 0.8rem !important;
    }
    div[data-testid="column"] {
        padding: 0px 8px !important;
    }
    
    /* Toggle components styling */
    div[data-testid="stCheckbox"] label, div[data-testid="stToggle"] label {
        color: #E2E8F0 !important;
        font-size: 0.85rem !important;
    }
</style>
""", unsafe_allow_html=True)

# Initialize Session States
if 'candidates_data' not in st.session_state:
    st.session_state.candidates_data = []
if 'jd_text' not in st.session_state:
    st.session_state.jd_text = ""
if 'jd_skills' not in st.session_state:
    st.session_state.jd_skills = []
if 'jd_yoe' not in st.session_state:
    st.session_state.jd_yoe = 0
if 'jd_sen' not in st.session_state:
    st.session_state.jd_sen = ""
if 'ranked_candidates' not in st.session_state:
    st.session_state.ranked_candidates = []

# ------------------ BRANDING HEADER ------------------
st.markdown("""
<div style="text-align: center; padding: 10px 0 14px 0;">
    <h1 style="color: #6366F1; margin: 0; font-size: 2.1rem; font-weight: 800; letter-spacing: -0.5px;">🚀 TalentIQ AI</h1>
    <p style="color: #94A3B8; margin: 4px 0 0 0; font-size: 0.95rem; font-weight: 500;">AI-Powered Candidate Intelligence Platform</p>
</div>
""", unsafe_allow_html=True)

# ------------------ TOP KPI DASHBOARD ------------------
if st.session_state.ranked_candidates:
    ranked_candidates = st.session_state.ranked_candidates
    kpis = generate_recruiter_kpis(ranked_candidates, st.session_state.jd_skills)
    avg_score = sum(c.get('final_score', 0.0) for c in ranked_candidates) / len(ranked_candidates)
    
    best_cand = kpis["best_candidate"]
    strong_hires = kpis["strong_hires"]
    total_candidates = kpis["total_candidates"]
    avg_match = f"{round(avg_score, 1)}%"
else:
    best_cand = "N/A"
    strong_hires = "0"
    total_candidates = "0"
    avg_match = "0.0%"

st.markdown(f"""
<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px;">
    <div style="background-color: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 12px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="font-size: 0.75rem; color: #94A3B8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">🏆 Best Candidate</div>
        <div style="font-size: 1.15rem; color: #6366F1; font-weight: 700; margin-top: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="{best_cand}">{best_cand}</div>
    </div>
    <div style="background-color: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 12px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="font-size: 0.75rem; color: #94A3B8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">🎯 Strong Hires</div>
        <div style="font-size: 1.15rem; color: #10B981; font-weight: 700; margin-top: 6px;">{strong_hires}</div>
    </div>
    <div style="background-color: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 12px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="font-size: 0.75rem; color: #94A3B8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">📄 Candidates</div>
        <div style="font-size: 1.15rem; color: #F8FAFC; font-weight: 700; margin-top: 6px;">{total_candidates}</div>
    </div>
    <div style="background-color: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 12px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="font-size: 0.75rem; color: #94A3B8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">⚡ Average Match</div>
        <div style="font-size: 1.15rem; color: #F59E0B; font-weight: 700; margin-top: 6px;">{avg_match}</div>
    </div>
</div>
""", unsafe_allow_html=True)

# ------------------ COMPACT ACTION PANEL ------------------
with st.container(border=True):
    use_demo = st.toggle("⚡ Use Pre-Loaded Demo Data (Job Description & 2 Resumes)", value=False, help="Enable this to automatically populate a sample JD and 2 mock resumes for quick demonstration.")
    
    import os
    mock_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "mock_data")
    if use_demo:
        jd_path = os.path.join(mock_dir, "job_description.txt")
        if os.path.exists(jd_path):
            with open(jd_path, "r", encoding="utf-8") as f:
                st.session_state.jd_text = f.read()

    col_act1, col_act2 = st.columns(2)
    with col_act1:
        # Left Column: Upload JD, JD Text Area, Blind Hiring Toggle
        jd_file = st.file_uploader("Upload Job Description (JD)", type=["pdf", "docx", "txt"], key="jd_uploader", disabled=use_demo)
        jd_text_input = st.text_area("Or paste Job Description (JD) text here:", value=st.session_state.jd_text, height=75, placeholder="Paste Job Description text here...", disabled=use_demo)
        st.write("") # Tiny spacer
        blind_hiring_enabled = st.toggle("Enable Blind Hiring Mode", value=False, help="Hide Candidate Names, Emails, Phones, Colleges, and Gender indicators.")
        
    with col_act2:
        # Right Column: Upload Resumes, Run Analysis Button
        if use_demo:
            st.success("📝 Loaded 2 demo resumes from `mock_data` directory:")
            st.info("- `resume_jane_doe.txt` (Senior Python Engineer)\n- `resume_john_smith.txt` (Mid Java Developer)")
            
            # Read Demo Resumes
            mock_filenames = ["resume_jane_doe.txt", "resume_john_smith.txt"]
            resume_files = []
            
            class MockUploadedFile:
                def __init__(self, name, data):
                    self.name = name
                    self.data = data
                def read(self):
                    return self.data
                def getvalue(self):
                    return self.data
            
            for fname in mock_filenames:
                path = os.path.join(mock_dir, fname)
                if os.path.exists(path):
                    with open(path, "rb") as f:
                        content = f.read()
                    resume_files.append(MockUploadedFile(fname, content))
        else:
            resume_files = st.file_uploader("Upload Candidate Resumes (Multiple allowed)", type=["pdf", "docx", "txt"], accept_multiple_files=True, key="resumes_uploader")
        
        st.write("")
        st.write("")
        run_ranking = st.button("Run Candidate Analysis", type="primary", use_container_width=True)

# ------------------ ADVANCED SETTINGS (EXPANDER) ------------------
with st.expander("⚙️ Advanced Settings", expanded=False):
    col_w1, col_w2, col_w3 = st.columns(3)
    with col_w1:
        w_semantic = st.slider("Semantic Similarity Weight", 0, 100, 50, help="Matches job duties and context.") / 100.0
    with col_w2:
        w_skill = st.slider("Skill Match Weight", 0, 100, 30, help="Matches exact list of key tech skills.") / 100.0
    with col_w3:
        w_behavioral = st.slider("Behavioral Signals Weight", 0, 100, 20, help="Assesses GitHub, LinkedIn, leadership etc.") / 100.0
        
    # Normalize weights
    total_w = w_semantic + w_skill + w_behavioral
    if total_w > 0:
        n_w_semantic = w_semantic / total_w
        n_w_skill = w_skill / total_w
        n_w_behavioral = w_behavioral / total_w
    else:
        n_w_semantic, n_w_skill, n_w_behavioral = 0.5, 0.3, 0.2
        
    if abs(total_w - 1.0) > 0.001:
        st.info(
            f"⚖️ Weights auto-normalized to: "
            f"Semantic: {round(n_w_semantic * 100)}% | "
            f"Skill: {round(n_w_skill * 100)}% | "
            f"Behavioral: {round(n_w_behavioral * 100)}%"
        )

# Execute ranking computation on button click
if run_ranking:
    if not (jd_file or jd_text_input):
        st.error("Please provide a Job Description.")
    elif not resume_files:
        st.error("Please upload candidate resumes.")
    else:
        with st.spinner("Analyzing Job Description..."):
            # Parse JD
            if jd_file:
                jd_text = extract_text(jd_file.read(), jd_file.name)
                if jd_text.startswith("[ERROR]") or jd_text.startswith("[EMPTY_FILE]"):
                    st.error(f"⚠️ JD Error: {jd_text}")
                    st.stop()
            else:
                jd_text = jd_text_input
                
            jd_skills = extract_skills(jd_text)
            jd_yoe = extract_years_of_experience(jd_text)
            jd_sen = extract_seniority(jd_text)
            
            st.session_state.jd_text = jd_text
            st.session_state.jd_skills = jd_skills
            st.session_state.jd_yoe = jd_yoe
            st.session_state.jd_sen = jd_sen
            
        candidates_data = []
        progress_bar = st.progress(0)
        
        st.write("### Processing Candidates...")
        for i, file in enumerate(resume_files):
            res_text = extract_text(file.read(), file.name)
            
            if res_text.startswith("[ERROR]") or res_text.startswith("[EMPTY_FILE]"):
                st.error(f"⚠️ Skipping {file.name}: {res_text}")
                continue
                
            skills = extract_skills(res_text)
            yoe = extract_years_of_experience(res_text)
            seniority = extract_seniority(res_text)
            education = extract_education(res_text)
            certifications = extract_certifications(res_text)
            summary = generate_summary(skills, yoe, seniority)
            behavioral = extract_behavioral_signals(res_text)
            semantic_score = calculate_semantic_similarity(jd_text, res_text)
            
            candidates_data.append({
                "filename": file.name,
                "text": res_text,
                "skills": skills,
                "years_of_experience": yoe,
                "seniority": seniority,
                "education": education,
                "certifications": certifications,
                "summary": summary,
                "behavioral": behavioral,
                "semantic_similarity": semantic_score
            })
            progress_bar.progress((i + 1) / len(resume_files))
            
        st.session_state.candidates_data = candidates_data
        st.success("Ranking Complete!")
        st.rerun()

# Real-time update of scores and ranking if candidates data is already loaded in Session State
if st.session_state.candidates_data:
    weights = {
        "semantic": n_w_semantic,
        "skill": n_w_skill,
        "behavioral": n_w_behavioral
    }
    ranked = generate_final_ranking(
        st.session_state.candidates_data,
        st.session_state.jd_text,
        st.session_state.jd_skills,
        st.session_state.jd_yoe,
        st.session_state.jd_sen,
        weights
    )
    for candidate in ranked:
        rec_text, _ = get_recommendation_data(candidate['final_score'])
        candidate['recommendation'] = rec_text
        
    st.session_state.ranked_candidates = anonymize_candidate_list(ranked, enabled=blind_hiring_enabled)

# If no data exists, display info guide and stop execution
if not st.session_state.ranked_candidates:
    st.info("👋 Welcome to TalentIQ AI. Please upload a Job Description and Resumes above, then click **Run Candidate Analysis** to start.")
    st.stop()

# Retrieve active state details
ranked_candidates = st.session_state.ranked_candidates
jd_skills = st.session_state.jd_skills
jd_yoe = st.session_state.jd_yoe
jd_sen = st.session_state.jd_sen

st.write("") # Add a small spacing below Action Panel

# ------------------ TABS NAVIGATION ------------------
tab_overview, tab_rankings, tab_analytics, tab_compare, tab_insights = st.tabs([
    "Overview", 
    "Rankings", 
    "Analytics", 
    "Compare", 
    "Insights"
])

# 1. OVERVIEW TAB
with tab_overview:
    col_ov1, col_ov2 = st.columns([2, 1])
    with col_ov1:
        st.markdown(f"""
        <div style="background-color: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 14px; min-height: 150px;">
            <h3 style="color: #6366F1; margin-top: 0; font-size: 1.05rem; font-weight: 700; margin-bottom: 10px;">📋 Job Requirements Summary</h3>
            <table style="width: 100%; border-collapse: collapse; color: #f8fafc; font-size: 0.85rem;">
                <tr style="border-bottom: 1px solid #334155;">
                    <td style="padding: 6px 0; font-weight: 600; color: #94a3b8; width: 45%;">Target Seniority</td>
                    <td style="padding: 6px 0; color: #f8fafc;">{jd_sen}</td>
                </tr>
                <tr style="border-bottom: 1px solid #334155;">
                    <td style="padding: 6px 0; font-weight: 600; color: #94a3b8;">Experience Required</td>
                    <td style="padding: 6px 0; color: #f8fafc;">{"Not specified" if jd_yoe == 0 else f"{jd_yoe}+ years"}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; font-weight: 600; color: #94a3b8; vertical-align: top;">Target Skills</td>
                    <td style="padding: 6px 0; color: #f8fafc; line-height: 1.4;">{", ".join(jd_skills) if jd_skills else "None"}</td>
                </tr>
            </table>
        </div>
        """, unsafe_allow_html=True)
    with col_ov2:
        st.markdown("""
        <div style="background-color: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 14px; min-height: 150px;">
            <h3 style="color: #10B981; margin-top: 0; font-size: 1.05rem; font-weight: 700; margin-bottom: 10px;">🎯 Recommendation Logic</h3>
            <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.8rem;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="background-color: #6366F1; color: white; padding: 2px 6px; border-radius: 4px; font-weight: 700;">Strong Hire</span>
                    <span style="font-weight: 600; color: #f8fafc;">≥ 90% Match</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="background-color: #10B981; color: white; padding: 2px 6px; border-radius: 4px; font-weight: 700;">Hire</span>
                    <span style="font-weight: 600; color: #f8fafc;">≥ 75% Match</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="background-color: #F59E0B; color: black; padding: 2px 6px; border-radius: 4px; font-weight: 700;">Consider</span>
                    <span style="font-weight: 600; color: #f8fafc;">≥ 60% Match</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="background-color: #EF4444; color: white; padding: 2px 6px; border-radius: 4px; font-weight: 700;">Reject</span>
                    <span style="font-weight: 600; color: #f8fafc;">&lt; 60% Match</span>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)

# 2. RANKINGS TAB
with tab_rankings:
    st.markdown("<h3 style='color: #6366F1; margin-top: 0;'>Shortlisted Candidates</h3>", unsafe_allow_html=True)
    view_all = st.checkbox("Show All Candidates", value=False, help="Toggle to show the full candidate list instead of only top 5.")
    
    df_results = format_rankings_as_dataframe(ranked_candidates)
    
    # Recommendation color coding matching rule 12 palette
    def color_recommendation(val):
        color = ''
        font_color = '#ffffff'
        if val == 'Strong Hire': 
            color = '#6366F1'
        elif val == 'Hire': 
            color = '#10B981'
        elif val == 'Consider': 
            color = '#F59E0B'
            font_color = '#000000'
        elif val == 'Reject': 
            color = '#EF4444'
        return f'background-color: {color}; color: {font_color}; font-weight: bold;'
        
    if not view_all and len(df_results) > 5:
        st.dataframe(df_results.head(5).style.map(color_recommendation, subset=['Recommendation']), use_container_width=True, hide_index=True)
        st.info(f"Showing Top 5 of {len(df_results)} candidates. Check 'Show All Candidates' above to see the entire list.")
    else:
        st.dataframe(df_results.style.map(color_recommendation, subset=['Recommendation']), use_container_width=True, hide_index=True)
        
    csv_bytes = generate_csv_download(df_results)
    st.download_button(
        label="Download Full Report (CSV)",
        data=csv_bytes,
        file_name="candidate_rankings.csv",
        mime="text/csv"
    )

# 3. ANALYTICS TAB
with tab_analytics:
    st.markdown("<h3 style='color: #6366F1; margin-top: 0;'>Visual Analytics</h3>", unsafe_allow_html=True)
    sub_tab1, sub_tab2, sub_tab3 = st.tabs(["Score Distribution", "Skill Match", "Behavior Signals"])
    with sub_tab1:
        st.plotly_chart(plot_score_distribution(ranked_candidates), use_container_width=True)
    with sub_tab2:
        st.plotly_chart(plot_skill_match_comparison(ranked_candidates), use_container_width=True)
    with sub_tab3:
        weights_contrib = {"semantic": n_w_semantic, "skill": n_w_skill, "behavioral": n_w_behavioral}
        st.plotly_chart(plot_ranking_breakdown(ranked_candidates, weights_contrib), use_container_width=True)

# 4. COMPARE TAB
with tab_compare:
    st.markdown("<h3 style='color: #6366F1; margin-top: 0;'>Compare Candidates</h3>", unsafe_allow_html=True)
    candidate_names = [c['filename'] for c in ranked_candidates]
    if len(candidate_names) >= 2:
        col_comp1, col_comp2 = st.columns(2)
        with col_comp1:
            cand_a_name = st.selectbox("Select Candidate A", candidate_names, index=0)
        with col_comp2:
            cand_b_name = st.selectbox("Select Candidate B", candidate_names, index=1)
            
        cand_a = next(c for c in ranked_candidates if c['filename'] == cand_a_name)
        cand_b = next(c for c in ranked_candidates if c['filename'] == cand_b_name)
        
        df_comp, summary_comp = compare_candidates(cand_a, cand_b)
        
        # Display comparison matrix inside an expander (Rule 6)
        with st.expander("⚖️ Candidate Comparison Matrix", expanded=True):
            st.dataframe(df_comp, use_container_width=True, hide_index=True)
            st.markdown(summary_comp)
    else:
        st.info("Please upload at least two candidate resumes to enable Comparison Mode.")

# 5. INSIGHTS TAB (Expandable candidate details)
with tab_insights:
    st.markdown("<h3 style='color: #6366F1; margin-top: 0;'>Candidate Insights</h3>", unsafe_allow_html=True)
    show_all_insights = st.checkbox("Show Insights for All Candidates", value=False, help="Toggle to show insights for all candidates instead of only top 5.")
    
    candidates_to_show = ranked_candidates[:5] if (not show_all_insights and len(ranked_candidates) > 5) else ranked_candidates
    
    for candidate in candidates_to_show:
        score = candidate['final_score']
        rec = candidate['recommendation']
        
        # Recommendation badge matching rule 12 palette
        badge_icon = "🟢" if rec == "Strong Hire" else ("🔵" if rec == "Hire" else ("🟡" if rec == "Consider" else "🔴"))
        header_text = f"👤 {candidate['filename']}  •  Match Score: {score}%  •  {badge_icon} {rec}"
        
        with st.expander(header_text, expanded=False):
            col_det1, col_det2 = st.columns(2)
            
            # LEFT COLUMN: Profile Summary & Recruiter Explanation Panel
            with col_det1:
                panel = generate_explanation_panel(candidate, jd_yoe, jd_sen)
                
                st.markdown("#### 📋 Recruiter Explanation Panel")
                st.markdown(f"**Recommendation Badge:** {get_recommendation_badge_html(score)}", unsafe_allow_html=True)
                st.write("")
                st.markdown(f"**Why Ranked Here:** {panel['why_ranked']}")
                
                st.markdown("**Strengths:**")
                for s in panel['strengths']:
                    st.markdown(f"- {s}")
                    
                st.markdown("**Weaknesses:**")
                for w in panel['weaknesses']:
                    st.markdown(f"- {w}")
                    
                st.markdown("**Risk Factors:**")
                for r in panel['risks']:
                    st.markdown(f"- {r}")
                    
                st.markdown(f"**Next Steps / Action:** {panel['recommendation']}")
                
            # RIGHT COLUMN: Interview Questions & Details
            with col_det2:
                questions = generate_interview_questions(candidate['skills'], candidate['years_of_experience'], candidate['seniority'])
                st.markdown("#### 💬 Suggested Interview Questions")
                
                st.markdown("**Technical Questions:**")
                for q in questions["Technical"]:
                    st.markdown(f"- {q}")
                    
                st.markdown("**Behavioral Questions:**")
                for q in questions["Behavioral"]:
                    st.markdown(f"- {q}")
                    
                st.markdown("**Project-Based Questions:**")
                for q in questions["Project-Based"]:
                    st.markdown(f"- {q}")
                    
                st.write("")
                
                # Nested Details expander
                with st.expander("Show Technical Match & Signals Details", expanded=False):
                    st.markdown("**Summary:**")
                    st.info(candidate['summary'])
                    
                    st.markdown("**Score Breakdown:**")
                    st.write(f"🧠 Semantic Match: {round(candidate['semantic_similarity']*100, 2)}%")
                    st.write(f"🎯 Skill Overlap: {round(candidate['skill_score'], 2)}%")
                    st.write(f"🌟 Behavioral Score: {round(candidate['behavioral_score_display'], 2)}%")
                    
                    st.markdown("**Missing Required Skills:**")
                    if candidate['missing_skills']:
                        st.error(", ".join(candidate['missing_skills']))
                    else:
                        st.success("None! Perfect Skill Match.")
                        
                    st.markdown("**Behavioral Signals Found:**")
                    b = candidate['behavioral']
                    signals = []
                    if b['has_github']: signals.append("GitHub")
                    if b['has_linkedin']: signals.append("LinkedIn")
                    if b['has_portfolio']: signals.append("Portfolio")
                    if b['has_hackathon']: signals.append("Hackathons")
                    if b['has_open_source']: signals.append("Open Source")
                    if b['has_leadership']: signals.append("Leadership")
                    
                    if signals:
                        st.info(" | ".join(signals))
                    else:
                        st.warning("No strong behavioral signals detected.")
