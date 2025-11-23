from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import PyPDF2
from sklearn.feature_extraction.text import TfidfVectorizer
from io import BytesIO

app = FastAPI()

# Allow backend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------
# 1. Predefined skill dictionary
# -------------------------------------------
SKILL_KEYWORDS = [
    "python", "java", "javascript", "react", "node", "spring", "spring boot",
    "html", "css", "mongodb", "mysql", "machine learning", "deep learning",
    "nlp", "data analysis", "docker", "git", "api", "rest", "tensorflow"
]

# -------------------------------------------
# 2. Job role descriptions
# -------------------------------------------
JOB_ROLES = {
    "Backend Developer": "java spring boot apis rest sql mongodb server backend architecture",
    "Frontend Developer": "javascript react html css ui ux frontend web responsive",
    "Full Stack Developer": "react node javascript java sql mongodb apis full stack web",
    "Data Analyst": "python data analysis pandas excel visualization statistics",
    "Machine Learning Engineer": "python machine learning tensorflow sklearn nlp models training"
}

# -------------------------------------------
# PDF TEXT EXTRACTION (fixed for bytes)
# -------------------------------------------
def extract_text_from_pdf(pdf_bytes):
    reader = PyPDF2.PdfReader(BytesIO(pdf_bytes))
    text = ""
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted
    return text.lower()

# -------------------------------------------
# SKILL EXTRACTION LOGIC
# -------------------------------------------
def extract_skills(text):
    found = []
    for skill in SKILL_KEYWORDS:
        if skill in text:
            found.append(skill)
    return list(set(found))

# -------------------------------------------
# JOB MATCH LOGIC (TF-IDF similarity)
# -------------------------------------------
def get_best_role(text):
    roles = list(JOB_ROLES.keys())
    corpus = list(JOB_ROLES.values()) + [text]

    vectorizer = TfidfVectorizer()
    vectors = vectorizer.fit_transform(corpus)

    candidate_vec = vectors[-1]
    role_vecs = vectors[:-1]

    similarities = (role_vecs @ candidate_vec.T).toarray()

    best_index = similarities.argmax()
    best_role = roles[best_index]
    match_percentage = round(similarities[best_index][0] * 100, 2)

    return best_role, match_percentage

# -------------------------------------------
# MAIN ENDPOINT
# -------------------------------------------
@app.post("/analyze")
async def analyze_resume(file: UploadFile = File(...)):
    pdf_bytes = await file.read()
    text = extract_text_from_pdf(pdf_bytes)

    skills = extract_skills(text)
    best_role, match = get_best_role(text)

    return {
        "skills": skills,
        "best_role": best_role,
        "match_percentage": match
    }
