from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import fitz
import io

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains (adjust for production)

# ✅ Configure Gemini API
genai.configure(api_key="AIzaSyCRB9CdMbwwszySZ6ZOFl9R_GSgviLcaqU")
model = genai.GenerativeModel(model_name="models/gemini-1.5-flash")

# ✅ Function to extract text from PDF bytes
def extract_text_from_pdf_bytes(file_bytes):
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text.strip()
    except Exception as e:
        return f"❌ Error reading PDF: {str(e)}"

# ✅ Prompt Template
def build_prompt(resume_text, job_description):
    return f"""
You are an expert AI Resume Analyzer. Analyze the following resume in comparison with the provided job description.

🔑 Start your response with:
--------------------------------
✅ ATS Score (out of 100):
✅ Overall Resume Strength (Weak / Medium / Strong):
--------------------------------

Then give a detailed analysis in the below sections:

1) **Spelling & Grammar**:
   - List all spelling mistakes and suggest corrections.
   - Suggest grammar improvements.

2) **Section Completeness Check:** 
   For each section below, say:
   - Whether it is present.
   - Whether it is detailed enough (Yes / No / Partial).
   - Suggestions for improvement.
   Sections: Summary, Skills, Work Experience, Projects, Certifications, Achievements, Education.

3) **Job Match Analysis:**
   - List the key strengths matching the JD.
   - List missing skills or experiences.

4) **Resume Customization Suggestions:**
   Break it down section-wise:
   - **Summary Customization:** Tailor to the JD, add impact statements.
   - **Skills Customization:** Add/reorder skills to match JD keywords.
   - **Work Experience Customization:** Rephrase bullets to include metrics and keywords.
   - **Projects Customization:** Recommend projects to add.
   - **Certifications Customization:** Suggest additional relevant certifications.

5) **Section-wise Quality Description:**
   - Give a 1-2 line comment describing the quality and alignment of each section with the JD.

👇 Resume:
{resume_text}

📄 Job Description:
{job_description}
"""

# ✅ API route to handle analysis
@app.route("/analyze", methods=["POST"])
def analyze_resume():
    if "resume" not in request.files or "jd" not in request.form:
        return jsonify({"error": "Missing resume file or job description"}), 400

    resume_file = request.files["resume"]
    job_description = request.form["jd"]

    # Extract text from PDF
    resume_text = extract_text_from_pdf_bytes(resume_file.read())
    if resume_text.startswith("❌"):
        return jsonify({"error": resume_text}), 500

    prompt = build_prompt(resume_text, job_description)

    try:
        response = model.generate_content(prompt)
        return jsonify({"result": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ Start the server
if __name__ == "__main__":
    app.run(debug=True)
