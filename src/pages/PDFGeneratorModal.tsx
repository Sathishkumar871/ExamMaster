import React, { useState } from "react";

interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  ansNumber: string;
}

export default function PDFGeneratorModal({ onQuestionsGenerated }: { onQuestionsGenerated: (qs: any[]) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const handlePDFUploadAndGenerate = async () => {
    if (!file) {
      alert("Dayachesi oka PDF select cheyyandi!");
      return;
    }

    setLoading(true);
    setUploadProgress("📤 Uploading PDF to Cloudinary...");

    try {
      const formData = new FormData();
      formData.append("pdf", file);

      const token =
     localStorage.getItem("staffToken") ||
      localStorage.getItem("token");

      // 1. Send PDF to Backend for Cloudinary upload & AI Question Generation
      setUploadProgress("🤖 Reading PDF & Generating Questions using AI...");
      const res = await fetch("http://localhost:5000/api/generate-from-pdf", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setUploadProgress("✅ Questions Generated Successfully!");
        onQuestionsGenerated(data.questions); // Pass generated questions to parent QuestionBank
      } else {
        alert("Failed to generate questions: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error processing PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pdf-generator-box" style={{ background: "#f8fafc", padding: "1.5rem", borderRadius: "12px", border: "1px dashed #cbd5e1", marginBottom: "1.5rem" }}>
      <h3>📄 AI PDF-to-Question Generator</h3>
      <p style={{ fontSize: "0.85rem", color: "#64748b" }}>Upload chapter notes or textbook PDF. AI will automatically generate multiple-choice questions.</p>
      
      <div style={{ display: "flex", gap: "10px", marginTop: "10px", alignItems: "center" }}>
        <input 
          type="file" 
          accept="application/pdf" 
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={{ padding: "8px", background: "#fff", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%" }}
        />
        <button 
          onClick={handlePDFUploadAndGenerate} 
          disabled={loading}
          style={{ background: "#2563eb", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }}
        >
          {loading ? "Processing..." : "⚡ Generate Questions"}
        </button>
      </div>

      {loading && <p style={{ marginTop: "8px", fontSize: "0.85rem", color: "#2563eb", fontWeight: "600" }}>{uploadProgress}</p>}
    </div>
  );
}