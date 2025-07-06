import React, { useState } from "react";
import "./App.css";

function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState("");
  const [result, setResult] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !jd.trim()) {
      setResult("❗ Please upload a resume and paste a job description.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jd", jd);

    try {
      setResult("⏳ Analyzing resume using Gemini...");
      const response = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      setResult(data.result || data.error);
    } catch (err) {
      setResult("❌ Error connecting to server: " + err.message);
    }
  };

  return (
    <div style={{
      backgroundColor: '#6A0DAD',
  minHeight: '100vh',
  width: '100vw',
  overflowX: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: 0,
  padding: 0 
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.2)',
        maxWidth: '600px',
        width: '100%'
      }}>
        <h1 style={{ textAlign: 'center', color: '#6A0DAD', marginBottom: '1rem' }}>🧠 AI Resume Analyzer</h1>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="resume">Upload Resume (PDF):</label>
            <input
              type="file"
              id="resume"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              required
              style={{ 
                       padding: '0.5rem',
                       fontSize: '1rem',
                       border: '2px solid #6A0DAD',
                       borderRadius: '8px',
                       backgroundColor: '#f5f5f5',
                       cursor: 'pointer',
                       width: '80%' 
                    }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="jd">Paste Job Description:</label>
            <textarea
              id="jd"
              rows="6"
              placeholder="Paste the job description here..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              required
              style={{ width: '100%', marginTop: '0.5rem' }}
            ></textarea>
          </div>

          <button
            type="submit"
            style={{
              backgroundColor: '#6A0DAD',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              width: '100%',
              fontSize: '1rem'
            }}
          >
            ✨ Analyze Resume
          </button>
        </form>

        {result && (
          <div style={{ marginTop: '2rem' }}>
            <h3>📊 Analysis Result</h3>
            <pre style={{ backgroundColor: '#f7f7f7', padding: '1rem', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumeAnalyzer;
