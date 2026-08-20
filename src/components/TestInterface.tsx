import { useState } from "react";
import { ArrowLeft, CheckCircle2, XCircle, RefreshCw, Send, ShieldCheck, Trophy } from "lucide-react";
import "./TestInterface.css";

interface Question {
  _id: string;
  question?: string;
  questionText?: string;
  options: string[];
  correctAnswer: string;
  subject?: string;
  chapter?: string;
}

interface TestInterfaceProps {
  subject: string;
  className: string;
  chapterName: string;
  questions: Question[];
  studentId: string;
  studentName: string;
  themeColor?: string;
  onBack: () => void;
  isAlreadySubmitted: boolean;
  initialAnswers?: Record<string, string>;
}

export default function TestInterface({
  subject,
  className,
  chapterName,
  questions,
  studentId,
  studentName,
  themeColor = "#2563eb",
  onBack,
  isAlreadySubmitted: initialSubmitted,
  initialAnswers = {},
}: TestInterfaceProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>(initialAnswers);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(initialSubmitted);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [submitted, setSubmitted] = useState<boolean>(initialSubmitted);
  const [score, setScore] = useState<number>(0);
  const [totalQCount, setTotalQCount] = useState<number>(0);
  const [attemptedCount, setAttemptedCount] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [unattemptedCount, setUnattemptedCount] = useState<number>(0);

  // స్టూడెంట్ మార్కుల బట్టి డైనమిక్ మెసేజ్ ఇచ్చే ఫంక్షన్
  const getPerformanceDetails = (pct: number) => {
    if (pct >= 85) {
      return {
        title: `Outstanding Performance, ${studentName}! 🚀`,
        subtitle: "Exceptional mastery of concepts. You're fully exam-ready!",
        badgeBg: "#f0fdf4",
        badgeColor: "#16a34a"
      };
    } else if (pct >= 60) {
      return {
        title: `Great Job, ${studentName}! 🌟`,
        subtitle: "Solid understanding of the chapter. Keep up the momentum!",
        badgeBg: "#eff6ff",
        badgeColor: "#2563eb"
      };
    } else if (pct >= 35) {
      return {
        title: `Good Effort, ${studentName}! 👍`,
        subtitle: "You passed, but review the incorrect answers to strengthen your base.",
        badgeBg: "#fffbeb",
        badgeColor: "#d97706"
      };
    } else {
      return {
        title: `Keep Practicing, ${studentName}! 💪`,
        subtitle: "Don't get discouraged! Review the solutions below and try a retake.",
        badgeBg: "#fef2f2",
        badgeColor: "#dc2626"
      };
    }
  };

  const handleSelectOption = (questionId: string, option: string) => {
    if (isSubmitted && !isEditing) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const submitTest = async () => {
    let correct = 0;
    let wrong = 0;
    let unattempted = 0;
    const reviewList: any[] = [];
    const totalQ = questions.length;

    questions.forEach((q) => {
      const userAns = selectedAnswers[q._id] || "";
      const isCorrect = userAns === q.correctAnswer;

      if (!userAns) unattempted++;
      else if (isCorrect) correct++;
      else wrong++;

      reviewList.push({
        questionId: q._id,
        question: q.question || q.questionText,
        selectedAnswer: userAns,
        correctAnswer: q.correctAnswer,
        isCorrect: isCorrect,
      });
    });

    const attempted = totalQ - unattempted;
    const calculatedScore = (correct * 4) - (wrong * 1);
    const totalPossibleMarks = totalQ * 4;
    const percentage = totalPossibleMarks > 0 ? Math.max(0, Math.round((calculatedScore / totalPossibleMarks) * 100)) : 0;
    const status = percentage >= 35 ? "PASS" : "FAIL";
    const grade = percentage >= 85 ? "A" : percentage >= 60 ? "B" : percentage >= 35 ? "C" : "F";

    const payload = {
      studentId,
      studentName,
      examId: questions[0]?._id || `${subject.toUpperCase()}_EXAM`,
      examName: `${className} ${subject} - ${chapterName}`,
      testCategory: "subject",
      subject,
      totalQuestions: totalQ,
      attemptedQuestions: attempted,
      unansweredQuestions: unattempted,
      correctAnswers: correct,
      wrongAnswers: wrong,
      marks: calculatedScore,
      percentage,
      grade,
      status,
      timeTaken: 20,
      warnings: 0,
      review: reviewList
    };

    setIsSubmitted(true);
    setIsEditing(false);

    try {
      await fetch("http://localhost:5000/api/results/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Error submitting test:", err);
    }

    setTotalQCount(totalQ);
    setAttemptedCount(attempted);
    setCorrectCount(correct);
    setWrongCount(wrong);
    setUnattemptedCount(unattempted);
    setScore(calculatedScore);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ================= RESULT DASHBOARD =================
  if (submitted && !isEditing) {
    const totalPossible = totalQCount > 0 ? totalQCount * 4 : (questions.length * 4);
    const percentage = totalPossible > 0 ? Math.max(0, Math.round((score / totalPossible) * 100)) : 0;
    const perf = getPerformanceDetails(percentage);

    return (
      <div className="test-result-wrapper">
        <div className="test-result-card">
          
          <div className="test-trophy-icon" style={{ background: `linear-gradient(135deg, ${themeColor}15 0%, ${themeColor}30 100%)`, color: themeColor }}>
            <Trophy size={40} />
          </div>

          <div style={{ display: "inline-block", background: perf.badgeBg, color: perf.badgeColor, padding: "6px 16px", borderRadius: "30px", fontSize: "12px", fontWeight: "800", letterSpacing: "1.2px", marginBottom: "16px", textTransform: "uppercase" }}>
            {className} • {subject.toUpperCase()} • Score: {percentage}%
          </div>

          <h1 className="test-title" style={{ fontSize: "30px", marginBottom: "8px" }}>
            {perf.title}
          </h1>
          <p className="test-subtitle" style={{ fontSize: "15px", marginBottom: "40px" }}>
            {perf.subtitle}
          </p>

          <div className="test-score-circle" style={{ border: `6px solid ${themeColor}` }}>
            <strong style={{ fontSize: "38px", color: "#0f172a", fontWeight: "900", lineHeight: "1" }}>{score}</strong>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", marginTop: "4px" }}>Total Marks</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginBottom: "16px" }}>
            <div style={{ background: "#ffffff", padding: "20px", borderRadius: "18px", border: "1px solid #f1f5f9", textAlign: "left" }}>
              <span style={{ display: "block", fontSize: "13px", color: "#64748b", fontWeight: "600" }}>Total Questions</span>
              <strong style={{ fontSize: "22px", color: "#0f172a", fontWeight: "800" }}>{totalQCount || questions.length}</strong>
            </div>
            <div style={{ background: `${themeColor}08`, padding: "20px", borderRadius: "18px", border: `1px solid ${themeColor}20`, textAlign: "left" }}>
              <span style={{ display: "block", fontSize: "13px", color: themeColor, fontWeight: "600" }}>Attempted</span>
              <strong style={{ fontSize: "22px", color: themeColor, fontWeight: "800" }}>{attemptedCount}</strong>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "40px" }}>
            <div style={{ background: "#f0fdf4", padding: "18px 12px", borderRadius: "16px", border: "1px solid #bbf7d0", textAlign: "center" }}>
              <span style={{ display: "block", fontSize: "11px", color: "#166534", fontWeight: "700", textTransform: "uppercase" }}>Correct (+4)</span>
              <strong style={{ fontSize: "20px", color: "#15803d", fontWeight: "900" }}>{correctCount}</strong>
            </div>
            <div style={{ background: "#fef2f2", padding: "18px 12px", borderRadius: "16px", border: "1px solid #fecaca", textAlign: "center" }}>
              <span style={{ display: "block", fontSize: "11px", color: "#991b1b", fontWeight: "700", textTransform: "uppercase" }}>Wrong (-1)</span>
              <strong style={{ fontSize: "20px", color: "#dc2626", fontWeight: "900" }}>{wrongCount}</strong>
            </div>
            <div style={{ background: "#fffbeb", padding: "18px 12px", borderRadius: "16px", border: "1px solid #fde68a", textAlign: "center" }}>
              <span style={{ display: "block", fontSize: "11px", color: "#b45309", fontWeight: "700", textTransform: "uppercase" }}>Unattempted</span>
              <strong style={{ fontSize: "20px", color: "#d97706", fontWeight: "900" }}>{unattemptedCount}</strong>
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <button 
              onClick={() => setSubmitted(false)}
              style={{ background: "#f1f5f9", color: "#334155", border: "1px solid #e2e8f0", padding: "16px 24px", borderRadius: "14px", fontSize: "15px", fontWeight: "700", cursor: "pointer", flex: 1 }}
            >
              Review Full Solutions
            </button>
            <button 
              onClick={onBack}
              style={{ background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}dd 100%)`, color: "#fff", border: "none", padding: "16px 24px", borderRadius: "14px", fontSize: "15px", fontWeight: "700", cursor: "pointer", flex: 1, boxShadow: `0 10px 25px ${themeColor}40` }}
            >
              Back to Chapters
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= EXAM QUESTIONS INTERFACE =================
  return (
    <div className="test-interface-wrapper">
      <div className="test-interface-container">
        
        <button onClick={onBack} className="test-back-btn" style={{ color: themeColor }}>
          <ArrowLeft size={18} /> Back to Chapters
        </button>

        <div className="test-header-card">
          <div>
            <div className="test-badge" style={{ color: themeColor, background: `${themeColor}12` }}>
              <ShieldCheck size={14} /> {className} • {subject.toUpperCase()} PRACTICE MODULE
            </div>
            <h1 className="test-title">{chapterName}</h1>
            <p className="test-subtitle">
              Total <strong style={{ color: "#0f172a" }}>{questions.length} Questions</strong> • Marking Scheme: <span style={{ color: "#16a34a", fontWeight: "700" }}>+4 Correct</span>, <span style={{ color: "#dc2626", fontWeight: "700" }}>-1 Incorrect</span>
            </p>
          </div>

          {isSubmitted && !isEditing && (
            <button
              onClick={() => {
                setIsEditing(true);
                setSubmitted(false);
              }}
              style={{ background: `${themeColor}15`, color: themeColor, border: `1px solid ${themeColor}40`, padding: "12px 22px", borderRadius: "14px", fontSize: "14px", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <RefreshCw size={16} /> Modify Answers
            </button>
          )}
        </div>

        {isSubmitted && !isEditing && (
          <div className="test-banner success">
            <CheckCircle2 size={22} color="#15803d" />
            <span>Loaded previous session from MongoDB. Correct choices in <strong style={{ color: "#15803d" }}>Green</strong>, your responses in <strong style={{ color: "#dc2626" }}>Red</strong>.</span>
          </div>
        )}

        {isEditing && (
          <div className="test-banner warning">
            <RefreshCw size={22} color="#d97706" />
            <span>Editing mode enabled. Update your choices and click <strong>"Resubmit Test"</strong>.</span>
          </div>
        )}

        {questions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px", color: "#64748b", background: "#ffffff", borderRadius: "24px", border: "1px solid #e2e8f0", fontSize: "16px", fontWeight: "600" }}>
            No questions available for this chapter in {className}.
          </div>
        ) : (
          <div>
            {questions.map((item, index) => {
              const userSelected = selectedAnswers[item._id];
              const correctAnswer = item.correctAnswer;

              return (
                <div key={item._id} className="test-question-card">
                  
                  <div className="test-question-header">
                    <span className="test-q-number" style={{ color: themeColor, background: `${themeColor}10` }}>
                      QUESTION {index + 1} OF {questions.length}
                    </span>

                    {isSubmitted && !isEditing && (
                      <div>
                        {userSelected === correctAnswer ? (
                          <span style={{ fontSize: "13px", fontWeight: "800", color: "#15803d", display: "flex", alignItems: "center", gap: "6px", background: "#dcfce7", padding: "6px 14px", borderRadius: "8px" }}>
                            <CheckCircle2 size={16} /> Correct (+4)
                          </span>
                        ) : userSelected ? (
                          <span style={{ fontSize: "13px", fontWeight: "800", color: "#dc2626", display: "flex", alignItems: "center", gap: "6px", background: "#fee2e2", padding: "6px 14px", borderRadius: "8px" }}>
                            <XCircle size={16} /> Incorrect (-1)
                          </span>
                        ) : (
                          <span style={{ fontSize: "13px", fontWeight: "800", color: "#d97706", background: "#fef3c7", padding: "6px 14px", borderRadius: "8px" }}>
                            Skipped (0)
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <h2 className="test-question-text">
                    {item.question || item.questionText}
                  </h2>

                  <div className="test-options-list">
                    {item.options.map((option, optionIndex) => {
                      const isSelected = userSelected === option;
                      const isCorrectOption = option === correctAnswer;

                      let bgColor = "#f8fafc";
                      let borderColor = "#e2e8f0";
                      let textColor = "#334155";
                      let badgeBg = "#e2e8f0";
                      let badgeColor = "#475569";

                      if (isSubmitted && !isEditing) {
                        if (isCorrectOption) {
                          bgColor = "#f0fdf4";
                          borderColor = "#22c55e";
                          textColor = "#166534";
                          badgeBg = "#22c55e";
                          badgeColor = "#fff";
                        } else if (isSelected && !isCorrectOption) {
                          bgColor = "#fef2f2";
                          borderColor = "#ef4444";
                          textColor = "#991b1b";
                          badgeBg = "#ef4444";
                          badgeColor = "#fff";
                        }
                      } else {
                        if (isSelected) {
                          bgColor = `${themeColor}08`;
                          borderColor = themeColor;
                          textColor = themeColor;
                          badgeBg = themeColor;
                          badgeColor = "#fff";
                        }
                      }

                      return (
                        <button
                          key={optionIndex}
                          type="button"
                          onClick={() => handleSelectOption(item._id, option)}
                          className="test-option-btn"
                          style={{
                            backgroundColor: bgColor,
                            borderColor: borderColor,
                            color: textColor,
                          }}
                        >
                          <span className="test-option-badge" style={{ background: badgeBg, color: badgeColor }}>
                            {String.fromCharCode(65 + optionIndex)}
                          </span>
                          <span className="test-option-text">{option}</span>
                          
                          {isSubmitted && !isEditing && isCorrectOption && (
                            <span style={{ fontSize: "12px", fontWeight: "800", color: "#15803d", background: "#dcfce7", padding: "6px 12px", borderRadius: "8px" }}>Correct Choice</span>
                          )}
                          {isSubmitted && !isEditing && isSelected && !isCorrectOption && (
                            <span style={{ fontSize: "12px", fontWeight: "800", color: "#dc2626", background: "#fee2e2", padding: "6px 12px", borderRadius: "8px" }}>Your Choice</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {(!isSubmitted || isEditing) && (
              <div className="test-submit-container">
                <button onClick={submitTest} className="test-submit-btn">
                  <Send size={20} /> {isEditing ? "Resubmit Test to DB" : "Submit Test & Evaluate"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}