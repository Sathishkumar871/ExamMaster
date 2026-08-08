import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateDailyTest.css";

interface QuestionItem {
  _id?: string;
  id?: string;
  subject: string;
  chapter?: string;
  question: string;
  options: string[];
  correctAnswer?: string;
  difficulty?: string; // "Easy" | "Medium" | "Hard"
}

export default function CreateDailyTest() {
  const navigate = useNavigate();
  const teacher = JSON.parse(localStorage.getItem("teacher") || "{}");
  const assignedSubject = teacher.subject || "Physics";

  // 1. Exam Configuration
  const [testTitle, setTestTitle] = useState("");
  const [examType, setExamType] = useState("Daily Test"); // Daily, Weekly, Mock
  const [durationMinutes, setDurationMinutes] = useState<number>(20);
  const [scheduledDate, setScheduledDate] = useState("");

  // 2. Filters (Subject is fixed to teacher's subject)
  const [selectedChapter, setSelectedChapter] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  // 3. State Data
  const [availableQuestions, setAvailableQuestions] = useState<QuestionItem[]>([]);
  const [selectedQIds, setSelectedQIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Helper to safely extract Unique ID
  const getQuestionId = (q: QuestionItem): string => {
    return q._id || q.id || "";
  };

  // Fetch Questions from Question Bank when Teacher Subject loads
  useEffect(() => {
    fetchQuestionBank();
  }, [assignedSubject]);

  const fetchQuestionBank = async () => {
    setLoading(true);
    setMessage("");
    try {
      const token = localStorage.getItem("teacherToken");
      const res = await fetch(
        `http://localhost:5000/api/question-bank?subject=${encodeURIComponent(assignedSubject)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (data.success && Array.isArray(data.questions)) {
        setAvailableQuestions(data.questions);
      } else {
        setAvailableQuestions([]);
      }
    } catch (err) {
      console.error("Error fetching question bank:", err);
      setMessage("⚠️ Failed to load questions from server.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate Overview Stats
  const stats = useMemo(() => {
    const total = availableQuestions.length;
    let easy = 0;
    let medium = 0;
    let hard = 0;
    const chaptersMap: { [key: string]: number } = {};

    availableQuestions.forEach((q) => {
      const diff = (q.difficulty || "easy").toLowerCase();
      if (diff === "easy") easy++;
      else if (diff === "medium") medium++;
      else if (diff === "hard") hard++;

      const chName = q.chapter?.trim() || "General / Unassigned";
      chaptersMap[chName] = (chaptersMap[chName] || 0) + 1;
    });

    return {
      total,
      easy,
      medium,
      hard,
      chaptersMap,
      chapterNames: Object.keys(chaptersMap),
    };
  }, [availableQuestions]);

  // Filtered Questions list
  const filteredQuestions = useMemo(() => {
    return availableQuestions.filter((q) => {
      const qChapter = q.chapter?.trim() || "General / Unassigned";
      const matchesChapter =
        selectedChapter === "All" || qChapter.toLowerCase() === selectedChapter.toLowerCase();

      const qDiff = (q.difficulty || "easy").toLowerCase();
      const targetDiff = selectedDifficulty.toLowerCase();
      const matchesDifficulty =
        selectedDifficulty === "All" || qDiff === targetDiff;

      return matchesChapter && matchesDifficulty;
    });
  }, [availableQuestions, selectedChapter, selectedDifficulty]);

  // Group filtered questions by Chapter
  const groupedQuestionsByChapter = useMemo(() => {
    const groups: { [key: string]: QuestionItem[] } = {};
    filteredQuestions.forEach((q) => {
      const chName = q.chapter?.trim() || "General / Unassigned";
      if (!groups[chName]) groups[chName] = [];
      groups[chName].push(q);
    });
    return groups;
  }, [filteredQuestions]);

  // Toggle Single Question Selection
  const toggleSelectQuestion = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!id) return;

    setSelectedQIds((prevIds) =>
      prevIds.includes(id)
        ? prevIds.filter((item) => item !== id)
        : [...prevIds, id]
    );
  };

  // Select / Deselect All Questions in a Chapter Group
  const toggleSelectChapterGroup = (chapterName: string) => {
    const chapterQuestions = groupedQuestionsByChapter[chapterName] || [];
    const chapterQIds = chapterQuestions.map(getQuestionId).filter(Boolean);

    const areAllChapterSelected = chapterQIds.every((id) =>
      selectedQIds.includes(id)
    );

    if (areAllChapterSelected) {
      setSelectedQIds((prev) => prev.filter((id) => !chapterQIds.includes(id)));
    } else {
      setSelectedQIds((prev) => Array.from(new Set([...prev, ...chapterQIds])));
    }
  };

  // Quick Select by Difficulty (Easy, Medium, Hard)
  const handleSelectByDifficulty = (level: string) => {
    const matchingIds = availableQuestions
      .filter((q) => (q.difficulty || "easy").toLowerCase() === level.toLowerCase())
      .map(getQuestionId)
      .filter(Boolean);

    setSelectedQIds((prev) => Array.from(new Set([...prev, ...matchingIds])));
  };

  // Create Exam Handler
  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!testTitle.trim()) {
      return setMessage("⚠️ Please enter a test title.");
    }
    if (selectedQIds.length === 0) {
      return setMessage("⚠️ Please select at least one question.");
    }

    setSaving(true);
    setMessage("");

    const payload = {
      title: testTitle,
      examType: examType, // Daily Test / Weekly Test / Mock Test
      subject: assignedSubject,
      classId: teacher.classId,
      className: teacher.className,
      durationMinutes: Number(durationMinutes),
      scheduledDate: scheduledDate || new Date().toISOString(),
      questionIds: selectedQIds,
      totalQuestions: selectedQIds.length,
    };

    try {
      const token = localStorage.getItem("teacherToken");
      const res = await fetch("http://localhost:5000/api/teacher/exams/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(`✅ ${examType} Created Successfully!`);
        setTimeout(() => navigate("/teacher/exams"), 1200);
      } else {
        setMessage(`❌ ${data.message || "Failed to create test"}`);
      }
    } catch (err) {
      console.error("Create test error:", err);
      setMessage("❌ Server error while creating test.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="daily-test-container">
      <div className="daily-test-card premium-theme">
        {/* PAGE HEADER */}
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate("/teacher/dashboard")}>
            ← Back to Dashboard
          </button>
          <h1>Create Assessment & Practice Test</h1>
          <div className="teacher-subject-badge">
            📚 Subject: <strong>{assignedSubject}</strong>
          </div>
        </div>

        <form onSubmit={handleCreateTest}>
          {/* SECTION 1: CONFIGURATION & EXAM TYPE */}
          <div className="form-section glass-panel">
            <h3>1. Test Configuration & Type</h3>
            <div className="form-grid-3">
              <div className="input-group">
                <label>Test Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Kinematics Revision Test"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  required
                />
              </div>

              {/* 3 Exam Type Options */}
              <div className="input-group">
                <label>Test Category *</label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  className="premium-select"
                >
                  <option value="Daily Test">📅 Daily Test</option>
                  <option value="Weekly Test">📊 Weekly Test</option>
                  <option value="Mock Test">🏆 Mock Test</option>
                </select>
              </div>

              <div className="input-group">
                <label>Duration (Minutes) *</label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: PREMIUM OVERVIEW & BULK SELECTORS */}
          <div className="form-section glass-panel">
            <div className="section-header-flex">
              <h3>2. Question Bank Overview & Quick Actions</h3>
              <span className="live-indicator">🟢 Live Bank Active</span>
            </div>

            {/* STATS CARDS WITH PREMIUM ICONS & QUICK ACTIONS */}
            <div className="stats-overview-grid">
              <div className="stat-card total">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total Pool</span>
              </div>
              
              <div className="stat-card easy interactive" onClick={() => handleSelectByDifficulty("Easy")}>
                <span className="stat-value">{stats.easy}</span>
                <span className="stat-label">🥉 Easy (Click to Select) 🛡️</span>
              </div>

              <div className="stat-card medium interactive" onClick={() => handleSelectByDifficulty("Medium")}>
                <span className="stat-value">{stats.medium}</span>
                <span className="stat-label">🥈 Medium (Click to Select) ⚔️</span>
              </div>

              <div className="stat-card hard interactive" onClick={() => handleSelectByDifficulty("Hard")}>
                <span className="stat-value">{stats.hard}</span>
                <span className="stat-label">🥇 Hard (Click to Select) 👑</span>
              </div>
            </div>

            {/* FILTER BAR */}
            <div className="form-grid-2 margin-top">
              <div className="input-group">
                <label>Filter by Chapter</label>
                <select
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                >
                  <option value="All">All Chapters ({stats.chapterNames.length})</option>
                  {stats.chapterNames.map((ch) => (
                    <option key={ch} value={ch}>
                      {ch} ({stats.chaptersMap[ch]} questions)
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Filter by Difficulty Level</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                >
                  <option value="All">All Levels ({stats.total})</option>
                  <option value="Easy">🟢 Easy Level ({stats.easy})</option>
                  <option value="Medium">⚡ Medium Level ({stats.medium})</option>
                  <option value="Hard">💎 Hard Level ({stats.hard})</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: QUESTION SELECTION GROUPED BY CHAPTER */}
          <div className="form-section glass-panel">
            <div className="selection-bar">
              <div>
                <h3>
                  3. Question Selection (
                  <span className="selected-count highlight-badge">{selectedQIds.length}</span> Selected)
                </h3>
                <p className="sub-text">
                  Showing {filteredQuestions.length} questions matching filters
                </p>
              </div>
              {selectedQIds.length > 0 && (
                <button
                  type="button"
                  className="clear-selection-btn"
                  onClick={() => setSelectedQIds([])}
                >
                  Clear All Selections ❌
                </button>
              )}
            </div>

            {loading ? (
              <div className="loading-box">Loading {assignedSubject} Question Bank...</div>
            ) : filteredQuestions.length === 0 ? (
              <div className="no-questions-box">
                No questions found for the selected criteria.
              </div>
            ) : (
              <div className="questions-scroll-list">
                {Object.keys(groupedQuestionsByChapter).map((chName) => {
                  const chQuestions = groupedQuestionsByChapter[chName];
                  const chQIds = chQuestions.map(getQuestionId).filter(Boolean);
                  const isAllChSelected = chQIds.every((id) => selectedQIds.includes(id));

                  return (
                    <div key={chName} className="chapter-group-wrapper">
                      <div className="chapter-group-header">
                        <div className="ch-title-wrap">
                          <span className="ch-icon">📖</span>
                          <h4>{chName}</h4>
                          <span className="ch-count-badge">
                            {chQuestions.length} Questions
                          </span>
                        </div>
                        <button
                          type="button"
                          className="ch-select-btn"
                          onClick={() => toggleSelectChapterGroup(chName)}
                        >
                          {isAllChSelected ? "Deselect Chapter" : "Select Entire Chapter"}
                        </button>
                      </div>

                      <div className="chapter-questions-grid">
                        {chQuestions.map((q, qIdx) => {
                          const qId = getQuestionId(q);
                          const isSelected = selectedQIds.includes(qId);
                          const difficultyClass = (q.difficulty || "easy").toLowerCase();

                          // Modern Icon-based difficulty label
                          const diffBadgeLabel =
                            difficultyClass === "hard"
                              ? "💎 Hard"
                              : difficultyClass === "medium"
                              ? "⚡ Medium"
                              : "🟢 Easy";

                          return (
                            <div
                              key={qId || qIdx}
                              className={`question-item-card ${
                                isSelected ? "selected" : ""
                              }`}
                              onClick={() => toggleSelectQuestion(qId)}
                            >
                              <div className="q-card-header">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => toggleSelectQuestion(qId, e)}
                                />
                                <span className="q-num">Q{qIdx + 1}</span>
                                <span className={`diff-badge ${difficultyClass}`}>
                                  {diffBadgeLabel}
                                </span>
                              </div>

                              <p className="q-text">{q.question}</p>

                              <div className="q-options-grid">
                                {q.options?.map((opt, oIdx) => (
                                  <div key={oIdx} className="q-opt-pill">
                                    <strong>({String.fromCharCode(65 + oIdx)})</strong>{" "}
                                    {opt}
                                  </div>
                                ))}
                              </div>

                              <div className="q-card-footer">
                                <button
                                  type="button"
                                  className={`toggle-btn ${
                                    isSelected ? "remove" : "add"
                                  }`}
                                  onClick={(e) => toggleSelectQuestion(qId, e)}
                                >
                                  {isSelected ? "Remove Question" : "Select Question"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* STATUS MESSAGE */}
          {message && (
            <div
              className={`status-banner ${
                message.includes("✅") ? "success" : "error"
              }`}
            >
              {message}
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <div className="action-row">
            <button
              type="submit"
              className="submit-test-btn premium-glow"
              disabled={saving || selectedQIds.length === 0}
            >
              {saving
                ? "Publishing Assessment..."
                : `Publish ${examType} (${selectedQIds.length} Questions)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}