import React, { useState, useEffect } from "react";
import "./QuestionBank.css";

interface QuestionItem {
  _id?: string;
  id?: string;
  subject: string;
  chapter: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  ansNumber: string;
  imageUrl?: string;
  difficulty?: string;
  testDate?: string;
  testTime?: string;
  testType?: string;
}

export default function QuestionBank() {
  const [mode, setMode] = useState<"bulk" | "pdf">("bulk");
  
  // State Management
  const [existingQuestions, setExistingQuestions] = useState<QuestionItem[]>([]);
  const [showAllTotalView, setShowAllTotalView] = useState(false);
  const [viewCategoryTab, setViewCategoryTab] = useState<"all" | "mock" | "daily">("all");

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination for Explorer View
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Bulk Import
  const [bulkQuestionsText, setBulkQuestionsText] = useState("");
  const [bulkAnswersText, setBulkAnswersText] = useState("");
  const [parsedQuestions, setParsedQuestions] = useState<QuestionItem[]>([]);

  // PDF & Config (Title, Date, Time)
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [publishTestType, setPublishTestType] = useState<"mock" | "daily">("mock");
  const [publishTestTitle, setPublishTestTitle] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [publishTime, setPublishTime] = useState("");

  // Custom AM/PM Time Selector States
  const [tHour, setTHour] = useState("10");
  const [tMin, setTMin] = useState("00");
  const [tAmPm, setTAmPm] = useState("AM");

  // Sync custom time dropdowns to 24-hour publishTime format for backend
  useEffect(() => {
    let h = parseInt(tHour, 10);
    if (tAmPm === "PM" && h < 12) h += 12;
    if (tAmPm === "AM" && h === 12) h = 0;
    const formattedHour = String(h).padStart(2, "0");
    setPublishTime(`${formattedHour}:${tMin}`);
  }, [tHour, tMin, tAmPm]);

  // Editing state for individual questions
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<QuestionItem | null>(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("jwt") ||
      localStorage.getItem("staffToken") ||
      localStorage.getItem("teacherToken") ||
      localStorage.getItem("headToken")
    );
  };

  useEffect(() => {
    fetchExistingQuestions();
  }, []);

  // Reset pagination when search query or category tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, viewCategoryTab]);

  const fetchExistingQuestions = async () => {
    try {
      const token = getToken();
      if (!token) {
        setMessage("⚠️ Authentication token not found! Please login again.");
        return;
      }

      const res = await fetch("http://localhost:5000/api/questions", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        setMessage("❌ Session Expired (401 Unauthorized). Please re-login!");
        return;
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.questions)) {
        setExistingQuestions(data.questions);
      }
    } catch (err) {
      console.log("Question Load Error:", err);
    }
  };

  const processBulkImport = () => {
    if (!bulkQuestionsText.trim()) {
      setMessage("⚠️ First, paste questions text into the box!");
      return;
    }

    const rawAnsText = bulkAnswersText.trim();
    const answerKeyMap: { [key: number]: number } = {};

    if (rawAnsText) {
      const explicitPairs = [...rawAnsText.matchAll(/(\d+)[\.\s\:\-\)]+(\d+)/g)];
      if (explicitPairs.length > 0) {
        explicitPairs.forEach((m) => {
          const qNum = parseInt(m[1]);
          const aNum = parseInt(m[2]);
          if (qNum && aNum >= 1 && aNum <= 4) answerKeyMap[qNum] = aNum;
        });
      } else {
        const cleanNums = rawAnsText.match(/[1-4]/g);
        if (cleanNums) {
          cleanNums.forEach((numStr, index) => {
            answerKeyMap[index + 1] = parseInt(numStr);
          });
        }
      }
    }

    const text = bulkQuestionsText;
    const tokenRegex = /(?:\s|^)(?:\(([1-4]|[A-Da-d])\)|([1-4]|[A-Da-d])[\)]|([1-4]|[A-Da-d])\.(?!\d))\s*/g;

    interface TokenMatch {
      index: number;
      length: number;
      num: number;
    }

    const tokens: TokenMatch[] = [];
    let m;
    while ((m = tokenRegex.exec(text)) !== null) {
      const valStr = m[1] || m[2] || m[3];
      let num = parseInt(valStr);
      if (isNaN(num)) {
        num = valStr.toUpperCase().charCodeAt(0) - 64;
      }
      tokens.push({ index: m.index, length: m[0].length, num });
    }

    const questionBlocks: { qText: string; options: string[] }[] = [];
    let currentCluster: TokenMatch[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.num === 1 && currentCluster.length >= 2) {
        pushClusterToQuestions(text, currentCluster, questionBlocks);
        currentCluster = [token];
      } else {
        currentCluster.push(token);
      }
    }
    if (currentCluster.length >= 2) {
      pushClusterToQuestions(text, currentCluster, questionBlocks);
    }

    function pushClusterToQuestions(
      fullText: string,
      cluster: TokenMatch[],
      out: { qText: string; options: string[] }[]
    ) {
      const firstOptIndex = cluster[0].index;
      const prevQEnd = (out as any)._lastEnd || 0;
      let rawQText = fullText.substring(prevQEnd, firstOptIndex).trim();

      rawQText = rawQText.replace(/^(?:Q(?:uestion)?\s*\d*[\.\:\)]|\d+[\.\:\)])\s*/i, "").trim();

      const extractedOpts = ["", "", "", ""];
      cluster.forEach((optToken, idx) => {
        if (idx < 4) {
          const start = optToken.index + optToken.length;
          const end = idx < cluster.length - 1 ? cluster[idx + 1].index : fullText.length;
          let optVal = fullText.substring(start, end).trim();

          const nextQMatch = optVal.match(/\n?\s*(?:Q\d+|\d+)[\.\)]\s+/i);
          if (nextQMatch && nextQMatch.index !== undefined) {
            optVal = optVal.substring(0, nextQMatch.index).trim();
          }
          extractedOpts[idx] = optVal;
        }
      });

      (out as any)._lastEnd = cluster[cluster.length - 1].index;
      if (rawQText) {
        out.push({ qText: rawQText, options: extractedOpts });
      }
    }

    const finalItems: QuestionItem[] = questionBlocks.map((block, idx) => {
      const qIndex = idx + 1;
      const ansNumber = answerKeyMap[qIndex] ? answerKeyMap[qIndex].toString() : "1";
      const correctText = block.options[parseInt(ansNumber) - 1] || block.options[0] || "";

      return {
        id: "q_" + Date.now() + "_" + idx,
        subject: "General",
        chapter: publishTestTitle || "General Practice Test",
        questionText: block.qText,
        options: block.options,
        ansNumber,
        correctAnswer: correctText,
        imageUrl: "",
        difficulty: "Medium",
        testDate: publishDate || new Date().toISOString().split("T")[0],
        testTime: publishTime || "10:00",
        testType: publishTestType,
      };
    });

    setParsedQuestions(finalItems);
    if (finalItems.length > 0) {
      setMessage(`⚡ Successfully parsed ${finalItems.length} questions! Review and save.`);
    }
  };

  const handlePdfUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile) {
      setMessage("⚠️ Please select a PDF file!");
      return;
    }
    if (!publishTestTitle.trim()) {
      setMessage("⚠️ Please enter a Test Title!");
      return;
    }
    if (!publishDate) {
      setMessage("⚠️ Please select the Test Date!");
      return;
    }

    const token = getToken();
    if (!token) {
      setMessage("⚠️ Authentication token missing! Please login again.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", pdfFile);
    formData.append("subject", "General");
    formData.append("chapter", publishTestTitle);
    formData.append("testTitle", publishTestTitle);
    formData.append("testType", publishTestType);
    formData.append("publishDate", publishDate);
    formData.append("publishTime", publishTime);

    try {
      setPdfLoading(true);
      setMessage("⏳ Extracting data from PDF & publishing test...");

      const res = await fetch("http://localhost:5000/api/questions/generate-from-pdf", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.status === 401) {
        setMessage("❌ Session Expired (401). Please re-login!");
        return;
      }

      const data = await res.json();
      if (data.success) {
        setMessage(`🎉 Success! Published ${data.totalSaved || 0} questions securely!`);
        setPdfFile(null);
        setPublishTestTitle("");
        setPublishDate("");
        setPublishTime("");
        setTHour("10");
        setTMin("00");
        setTAmPm("AM");
        fetchExistingQuestions();
      } else {
        setMessage(`❌ Error: ${data.message || "Failed to process PDF"}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Network or Server error occurred");
    } finally {
      setPdfLoading(false);
    }
  };

  const saveBulkQuestions = async () => {
    const token = getToken();
    if (!token) {
      setMessage("⚠️ Authentication token missing!");
      return;
    }

    if (parsedQuestions.length === 0) {
      setMessage("⚠️ No parsed questions found!");
      return;
    }

    setLoading(true);
    setMessage("⏳ Saving questions to the core database...");

    try {
      let successCount = 0;
      for (const item of parsedQuestions) {
        const res = await fetch("http://localhost:5000/api/questions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(item),
        });
        if (res.ok) successCount++;
      }

      setMessage(`🚀 Successfully Saved ${successCount} Questions to Database!`);
      setParsedQuestions([]);
      setBulkQuestionsText("");
      setBulkAnswersText("");
      fetchExistingQuestions();
    } catch (err) {
      console.error(err);
      setMessage("❌ Error saving questions");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExistingQuestion = async (qId: string) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:5000/api/questions/${qId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessage("🗑️ Question deleted successfully!");
        fetchExistingQuestions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAllQuestions = async () => {
    if (!window.confirm("⚠️ WARNING: This will delete ALL stored questions and tests. Are you sure?")) return;
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch("http://localhost:5000/api/questions/all", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessage("🗑️ All questions cleared successfully!");
        setExistingQuestions([]);
      } else {
        setMessage("❌ Failed to delete all questions");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEditing = (q: QuestionItem) => {
    setEditingQuestionId(q._id || q.id || null);
    setEditFormData({ ...q, options: [...(q.options || ["", "", "", ""])] });
  };

  const saveEditedQuestion = async () => {
    if (!editingQuestionId || !editFormData) return;
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:5000/api/questions/${editingQuestionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        setMessage("✨ Question updated successfully!");
        setEditingQuestionId(null);
        setEditFormData(null);
        fetchExistingQuestions();
      } else {
        setMessage("❌ Failed to update question");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const processedQuestions = existingQuestions.filter((q) => {
    if (viewCategoryTab === "mock" && q.testType !== "mock" && !q.chapter?.toLowerCase().includes("mock")) return false;
    if (viewCategoryTab === "daily" && q.testType !== "daily" && !q.chapter?.toLowerCase().includes("daily")) return false;

    return (
      q.questionText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.chapter?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(processedQuestions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentQuestions = processedQuestions.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="qb-wrapper premium-qb">
      <div className="qb-card glass-card">
        
        {/* STATS BANNER */}
        <div className="qb-stats-banner">
          <div 
            className="stat-pill clickable-pill" 
            onClick={() => setShowAllTotalView(!showAllTotalView)}
          >
            <span className="stat-label">📂 Database Explorer</span>
            <div className="stat-value">{existingQuestions.length} Total</div>
          </div>
          <div className="stat-pill glow-blue">
            <span className="stat-label">⚡ Daily Practice</span>
            <div className="stat-value">
              {existingQuestions.filter(q => q.testType === "daily" || q.chapter?.toLowerCase().includes("daily")).length}
            </div>
          </div>
          <div className="stat-pill glow-purple">
            <span className="stat-label">📝 Live Mock Tests</span>
            <div className="stat-value">
              {existingQuestions.filter(q => q.testType === "mock" || q.chapter?.toLowerCase().includes("mock")).length}
            </div>
          </div>
        </div>

        {/* HEADER & SWITCHER */}
        <div className="qb-header">
          <div className="qb-header-text">
            <h1>🚀 Exam Command Center</h1>
            <p className="qb-subtitle">Publish tests, edit questions & options, manage schedules seamlessly</p>
          </div>
          <div className="qb-mode-toggle">
            <button 
              className={mode === "bulk" && !showAllTotalView ? "active-tab" : "inactive-tab"} 
              onClick={() => { setMode("bulk"); setShowAllTotalView(false); }}
            >
              ⚡ Bulk Auto-Parser
            </button>
            <button 
              className={mode === "pdf" && !showAllTotalView ? "active-tab" : "inactive-tab"} 
              onClick={() => { setMode("pdf"); setShowAllTotalView(false); }}
            >
              📄 AI PDF Extractor
            </button>
          </div>
        </div>

        {message && <div className="qb-message-banner animate-fade">{message}</div>}

        {/* EXPLORER & MANAGEMENT VIEW */}
        {showAllTotalView ? (
          <div className="manage-section animate-fade">
            <div className="explorer-top-flex">
              <div>
                <h3>🗄️ All Stored Tests & Questions</h3>
                <p className="explorer-sub">Edit individual questions, modify options, or clear entire database.</p>
              </div>
              <div className="explorer-actions">
                <button onClick={handleDeleteAllQuestions} className="btn-danger-all">🗑️ Delete All Data</button>
                <button onClick={fetchExistingQuestions} className="btn-refresh">🔄 Refresh</button>
                <button onClick={() => setShowAllTotalView(false)} className="btn-close-explorer">❌ Close</button>
              </div>
            </div>

            {/* CATEGORY TABS */}
            <div className="category-tabs-scroll">
              <button onClick={() => setViewCategoryTab("all")} className={`cat-pill-btn ${viewCategoryTab === "all" ? "active" : ""}`}>
                📁 All ({existingQuestions.length})
              </button>
              <button onClick={() => setViewCategoryTab("mock")} className={`cat-pill-btn ${viewCategoryTab === "mock" ? "active" : ""}`}>
                📝 Mock Tests
              </button>
              <button onClick={() => setViewCategoryTab("daily")} className={`cat-pill-btn ${viewCategoryTab === "daily" ? "active" : ""}`}>
                ⚡ Daily Tests
              </button>
            </div>

            <div className="filter-grid-stack">
              <input
                type="text"
                placeholder="🔍 Search across test titles, topics, or question phrases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-box-premium"
              />
            </div>

            {processedQuestions.length === 0 ? (
              <div className="empty-warning-card">
                <p>⚠️ No records match your criteria right now.</p>
              </div>
            ) : (
              <>
                <div className="parsed-list">
                  {currentQuestions.map((q, idx) => {
                    const globalIdx = indexOfFirstItem + idx;
                    const qId = q._id || q.id || "";
                    const isEditing = editingQuestionId === qId;

                    return (
                      <div className="parsed-editable-card premium-card" key={qId || globalIdx}>
                        <div className="card-top-bar">
                          <div className="card-badge-group">
                            <span className="q-badge">Q#{globalIdx + 1}</span>
                            <span className="chapter-tag">📌 {q.chapter || "Untitled Test"}</span>
                            {q.testDate && <span className="date-tag">📅 {q.testDate}</span>}
                            {q.testTime && <span className="time-tag">⏰ {q.testTime}</span>}
                          </div>
                          <div className="card-action-buttons">
                            {!isEditing ? (
                              <>
                                <button onClick={() => startEditing(q)} className="btn-edit-sm">✏️ Edit Question & Options</button>
                                <button onClick={() => handleDeleteExistingQuestion(qId)} className="btn-delete-sm">🗑️ Delete</button>
                              </>
                            ) : (
                              <div className="edit-action-group">
                                <button onClick={saveEditedQuestion} className="btn-save-sm">💾 Update Changes</button>
                                <button onClick={() => setEditingQuestionId(null)} className="btn-cancel-sm">❌ Cancel</button>
                              </div>
                            )}
                          </div>
                        </div>

                        {isEditing && editFormData ? (
                          <div className="edit-form-inline">
                            <div className="qb-input-group mb-2">
                              <label>Test Title / Chapter</label>
                              <input
                                type="text"
                                value={editFormData.chapter}
                                onChange={(e) => setEditFormData({ ...editFormData, chapter: e.target.value })}
                                className="input-box"
                              />
                            </div>
                            <div className="qb-input-group mb-2">
                              <label>Question Text</label>
                              <textarea
                                value={editFormData.questionText}
                                onChange={(e) => setEditFormData({ ...editFormData, questionText: e.target.value })}
                                className="textarea-box"
                                rows={3}
                              />
                            </div>
                            <div className="qb-input-group mb-2">
                              <label>Options (1 to 4)</label>
                              <div className="edit-options-grid" style={{ display: "grid", gap: "8px" }}>
                                {editFormData.options.map((opt, oI) => (
                                  <div key={oI} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                    <span style={{ fontWeight: 700, minWidth: "30px" }}>({oI + 1})</span>
                                    <input
                                      type="text"
                                      value={opt}
                                      onChange={(e) => {
                                        const newOpts = [...editFormData.options];
                                        newOpts[oI] = e.target.value;
                                        setEditFormData({ ...editFormData, options: newOpts });
                                      }}
                                      className="input-box"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="qb-input-group mb-2">
                              <label>Correct Answer Option Number (e.g., 1, 2, 3, or 4)</label>
                              <input
                                type="text"
                                value={editFormData.ansNumber}
                                onChange={(e) => setEditFormData({ ...editFormData, ansNumber: e.target.value })}
                                className="input-box"
                                style={{ width: "120px" }}
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="pq-text">{q.questionText}</p>
                            {q.imageUrl && (
                              <div className="question-image-preview">
                                <img src={q.imageUrl} alt="Question Diagram" />
                              </div>
                            )}
                            <div className="pq-options">
                              {(q.options || []).map((opt, oI) => (
                                <div key={oI} className={`pq-opt ${q.ansNumber === String(oI + 1) ? "correct-opt" : ""}`}>
                                  <span className="opt-num">({oI + 1})</span> {opt}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* PAGINATION CONTROLS */}
                {totalPages > 1 && (
                  <div className="pagination-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginTop: "20px", padding: "10px" }}>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="btn-refresh"
                      style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
                    >
                      ◀ Previous
                    </button>
                    <span style={{ fontWeight: 600, fontSize: "14px" }}>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="btn-refresh"
                      style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
                    >
                      Next ▶
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <>
            {mode === "bulk" ? (
              <div className="qb-bulk-section animate-fade">
                <div className="qb-grid-2">
                  <div className="qb-input-group">
                    <label>📝 Test Title / Exam Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Grand Master Mock Test 01"
                      value={publishTestTitle}
                      onChange={(e) => setPublishTestTitle(e.target.value)}
                      className="input-box-premium"
                    />
                  </div>
                  <div className="qb-input-group">
                    <label>📅 Exam Date</label>
                    <input
                      type="date"
                      value={publishDate}
                      onChange={(e) => setPublishDate(e.target.value)}
                      className="input-box-premium"
                    />
                  </div>
                </div>

                <div className="qb-grid-2 mt-4">
                  <div className="qb-input-group">
                    <label>📝 Paste Questions Text Block</label>
                    <textarea
                      rows={8}
                      placeholder="Paste your complete test questions block here..."
                      value={bulkQuestionsText}
                      onChange={(e) => setBulkQuestionsText(e.target.value)}
                      className="textarea-box-premium"
                    />
                  </div>
                  <div className="qb-input-group">
                    <label>🔑 Answer Key (Optional: 1 3 2 4)</label>
                    <textarea
                      rows={8}
                      placeholder="Paste matching option sequence numbers..."
                      value={bulkAnswersText}
                      onChange={(e) => setBulkAnswersText(e.target.value)}
                      className="textarea-box-premium"
                    />
                  </div>
                </div>

                <div className="qb-action-row">
                  <button type="button" onClick={processBulkImport} className="btn-primary-glow">
                    ⚡ Auto-Detect & Parse Questions Instantly
                  </button>
                </div>

                {parsedQuestions.length > 0 && (
                  <div className="parsed-preview-container animate-fade">
                    <h3>📋 Parsed Ready Queue ({parsedQuestions.length} Questions)</h3>
                    <div className="qb-save-row">
                      <button type="button" onClick={saveBulkQuestions} disabled={loading} className="btn-success-glow">
                        {loading ? "⏳ Uploading..." : `💾 Publish ${parsedQuestions.length} Items to Live System`}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="qb-pdf-section animate-fade">
                <form onSubmit={handlePdfUpload} className="pdf-form-card premium-form">
                  <h3>📄 AI PDF Question Extractor & Publisher</h3>
                  <p className="pdf-sub">Upload question sheets directly. Configure Title, Date, and live Start Time for synchronized user evaluation.</p>

                  <div className="qb-grid-2">
                    <div className="qb-input-group">
                      <label>Select Document File (.PDF)</label>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                        className="file-input-box-premium"
                      />
                    </div>
                    <div className="qb-input-group">
                      <label>📝 Test Title / Name</label>
                      <input
                        type="text"
                        placeholder="e.g. National Level Mock Test 04"
                        value={publishTestTitle}
                        onChange={(e) => setPublishTestTitle(e.target.value)}
                        className="input-box-premium"
                      />
                    </div>
                  </div>

                  <div className="qb-grid-3 mt-3">
                    <div className="qb-input-group">
                      <label>Test Publishing Type</label>
                      <select
                        value={publishTestType}
                        onChange={(e: any) => setPublishTestType(e.target.value)}
                        className="select-box-premium"
                      >
                        <option value="mock">📝 Mock Test (Simultaneous Start)</option>
                        <option value="daily">⚡ Daily Test (Flexible Access)</option>
                      </select>
                    </div>

                    <div className="qb-input-group">
                      <label>📅 Scheduled Date</label>
                      <input
                        type="date"
                        value={publishDate}
                        onChange={(e) => setPublishDate(e.target.value)}
                        className="input-box-premium"
                      />
                    </div>

                    <div className="qb-input-group animate-fade">
                      <label>⏰ Exam Start Time (AM/PM)</label>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {/* Hour Dropdown */}
                        <select
                          value={tHour}
                          onChange={(e) => setTHour(e.target.value)}
                          className="select-box-premium"
                          style={{ flex: 1 }}
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                            <option key={h} value={String(h)}>
                              {h}
                            </option>
                          ))}
                        </select>

                        {/* Minute Dropdown */}
                        <select
                          value={tMin}
                          onChange={(e) => setTMin(e.target.value)}
                          className="select-box-premium"
                          style={{ flex: 1 }}
                        >
                          {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>

                        {/* AM / PM Dropdown */}
                        <select
                          value={tAmPm}
                          onChange={(e) => setTAmPm(e.target.value)}
                          className="select-box-premium"
                          style={{ flex: 1 }}
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="qb-action-row mt-4">
                    <button
                      type="submit"
                      disabled={pdfLoading}
                      className="btn-primary-glow"
                    >
                      {pdfLoading ? "⏳ Processing PDF & Publishing..." : "🚀 Upload & Publish Test"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}