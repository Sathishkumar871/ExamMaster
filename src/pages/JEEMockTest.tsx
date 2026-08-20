import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FaceVerification from "./../components/FaceVerification";
import { Clock, ShieldAlert, Bookmark, ArrowRight, ArrowLeft, LogOut, Lock } from "lucide-react";
import "./JeeMains.css";

// ఆటోమేటిక్ డిటెక్షన్ (Local & Render)
const API_BASE_URL = 
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://exammaster-backend-up1y.onrender.com";

interface Question {
  _id: string;
  questionText?: string;
  question?: string;
  options: string[];
  correctAnswer: string;
  isPublished?: boolean;
  status?: string;
  examType?: string;
  testCategory?: string;
  className?: string;
  class?: string;
}

export default function JeeMains() {
  const navigate = useNavigate();

  const [step, setStep] = useState<string>("verify");
  
  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem("jeemains_questions");
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [studentName, setStudentName] = useState("Student");
  const [studentId, setStudentId] = useState("");
  const [className, setClassName] = useState<string>("");
  const [academicYear, setAcademicYear] = useState<string>("2026-2027");
  
  const [violationCount, setViolationCount] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem("jeemains_answers");
    return saved ? JSON.parse(saved) : {};
  });

  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("jeemains_marked");
    return saved ? JSON.parse(saved) : {};
  });

  const [timeLeft, setTimeLeft] = useState<number>(30 * 60);

  useEffect(() => {
    const token = localStorage.getItem("studentToken") || localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const getStoredName = () => {
      const direct = localStorage.getItem("studentName") || localStorage.getItem("name");
      if (direct) return direct;
      
      const userStr = localStorage.getItem("user") || localStorage.getItem("student");
      if (userStr) {
        try {
          const obj = JSON.parse(userStr);
          if (obj?.name) return obj.name;
        } catch (e) {}
      }
      return "Student";
    };

    const getStoredId = () => {
      const direct = localStorage.getItem("studentId") || localStorage.getItem("id");
      if (direct) return direct;

      const userStr = localStorage.getItem("user") || localStorage.getItem("student");
      if (userStr) {
        try {
          const obj = JSON.parse(userStr);
          if (obj?.studentId || obj?.id) return obj.studentId || obj.id;
        } catch (e) {}
      }
      return "SEC-2026-X";
    };

    const getStoredClass = () => {
      const direct = localStorage.getItem("className") || localStorage.getItem("class") || localStorage.getItem("puc");
      if (direct) return direct;

      const userStr = localStorage.getItem("user") || localStorage.getItem("student");
      if (userStr) {
        try {
          const obj = JSON.parse(userStr);
          if (obj?.className) return obj.className;
          if (obj?.class) return obj.class;
          if (obj?.puc) return obj.puc;
        } catch (e) {}
      }
      return "";
    };

    setStudentName(getStoredName());
    setStudentId(getStoredId());
    setClassName(getStoredClass());
  }, [navigate]);

  // Dedicated Backend API Call for JEE Mock Questions (using API_BASE_URL)
  const fetchJeeQuestions = async (selectedClass: string) => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("studentToken") || localStorage.getItem("token");

    try {
      const queryParams = new URLSearchParams({
        examType: "JEE",
        className: selectedClass || ""
      });

      const response = await fetch(
        `${API_BASE_URL}/api/questions/mock-tests?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load JEE questions");
      }

      const loadedQuestions = data.questions || [];
      
      setQuestions(loadedQuestions);
      localStorage.setItem("jeemains_questions", JSON.stringify(loadedQuestions));

      const calculatedTime = loadedQuestions.length > 0 ? loadedQuestions.length * 60 : 30 * 60;
      setTimeLeft(calculatedTime);
    } catch (err) {
      console.error(err);
      setError("Unable to load JEE Mains Mock Test questions from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === "exam") {
      localStorage.setItem("jeemains_answers", JSON.stringify(answers));
      localStorage.setItem("jeemains_marked", JSON.stringify(markedForReview));
    }
  }, [answers, markedForReview, step]);

  useEffect(() => {
    if (step !== "exam") return;

    if (timeLeft <= 0) {
      submitExam();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const handleFaceVerified = () => {
    setStep("dashboard");
  };

  const handleViolation = (count: number) => {
    setViolationCount((prev) => prev + count);
  };

  const handleStartExam = async () => {
    setStep("greeting");
    await fetchJeeQuestions(className);

    setTimeout(() => {
      setStep("exam");
      setCurrentQuestion(0);
    }, 3000);
  };

  const selectAnswer = (answer: string) => {
    const question = questions[currentQuestion];
    if (!question) return;

    setAnswers((prev) => ({
      ...prev,
      [question._id]: answer,
    }));
  };

  const handleClearResponse = () => {
    const question = questions[currentQuestion];
    if (!question) return;
    const updated = { ...answers };
    delete updated[question._id];
    setAnswers(updated);
  };

  const handleMarkReview = () => {
    const question = questions[currentQuestion];
    if (!question) return;
    setMarkedForReview({
      ...markedForReview,
      [question._id]: !markedForReview[question._id]
    });
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const submitExam = async () => {
    let calculatedScore = 0;

    questions.forEach((question) => {
      if (answers[question._id] === question.correctAnswer) {
        calculatedScore++;
      }
    });

    try {
      const token = localStorage.getItem("studentToken") || localStorage.getItem("token");
      await fetch(`${API_BASE_URL}/api/exams/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          examType: "JEE",
          testCategory: "Mock Test",
          className,
          answers,
          score: calculatedScore,
        }),
      });
    } catch (e) {
      console.log("Backend submission error", e);
    }

    localStorage.removeItem("jeemains_answers");
    localStorage.removeItem("jeemains_marked");
    localStorage.removeItem("jeemains_questions");
    navigate("/");
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const current = questions[currentQuestion];

  if (step === "verify") {
    return (
      <FaceVerification
        onVerified={handleFaceVerified}
        onViolation={handleViolation}
      />
    );
  }

  if (step === "dashboard") {
    return (
      <div className="exam-page">
        <div className="start-wrapper">
          <div className="start-card" style={{ textAlign: "center", padding: "40px", maxWidth: "500px", margin: "auto", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div className="test-badge" style={{ marginBottom: "12px", display: "inline-block", background: "#e0f2fe", color: "#0284c7", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
              <Lock size={12} style={{ display: "inline", marginRight: "4px" }} /> JEE MAINS MOCK TEST PORTAL
            </div>
            
            <h1 style={{ marginBottom: "10px", color: "#1e293b" }}>Welcome, {studentName}!</h1>
            
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", margin: "20px 0", border: "1px solid #e2e8f0", textAlign: "left" }}>
              <p style={{ margin: "6px 0", color: "#475569", fontSize: "14px" }}>
                🆔 <strong>Student ID:</strong> <span style={{ color: "#0f172a" }}>{studentId}</span>
              </p>
              <p style={{ margin: "6px 0", color: "#475569", fontSize: "14px" }}>
                📚 <strong>Class Name:</strong> <span style={{ color: "#2563eb", fontWeight: "bold" }}>{className || "Not Specified"}</span>
              </p>
              <p style={{ margin: "6px 0", color: "#16a34a", fontSize: "14px" }}>
                ✅ <strong>Face Verification:</strong> <span style={{ fontWeight: "bold" }}>Authenticated Successfully</span>
              </p>
            </div>

            <button 
              className="start-button" 
              onClick={handleStartExam}
              style={{ background: "#3b82f6", color: "#fff", padding: "14px 28px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold", width: "100%", fontSize: "16px" }}
            >
              Start JEE Mock Test Now →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "greeting") {
    return (
      <div className="exam-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "linear-gradient(135deg, #0f172a, #1e3a8a)" }}>
        <div style={{ textAlign: "center", color: "#fff" }}>
          <div style={{ fontSize: "65px", marginBottom: "15px" }}>🚀⚡🎯</div>
          <h1 style={{ fontSize: "38px", marginBottom: "10px", fontWeight: "bold" }}>
            All The Best, <span style={{ color: "#38bdf8" }}>{studentName}</span>!
          </h1>
          <p style={{ fontSize: "18px", opacity: "0.9" }}>
            Preparing your <span style={{ fontWeight: "bold", textDecoration: "underline" }}>JEE ({className || "Mock"})</span> test matrix...
          </p>
          <div className="loading-spinner" style={{ margin: "30px auto", borderColor: "#fff", borderTopColor: "transparent" }} />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="exam-loading">
        <div className="loading-spinner" />
        <h2>Initializing JEE Mock Test</h2>
        <p>Please wait while we prepare your test items...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="exam-error-page">
        <div className="error-card">
          <div className="error-icon">!</div>
          <h2>Connection Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="jee-cbt-root">
      <header className="jee-header">
        <div className="jee-brand">
          <span className="jee-badge-yr">JEE Mock Test ({className})</span>
          <h1>CBT Assessment Terminal</h1>
        </div>
        <div className="jee-header-right">
          <div className="jee-timer-box">
            <Clock size={15} />
            <span>TIME: <strong className="mono">{formatTime(timeLeft)}</strong></span>
          </div>
          <div className="jee-security-indicator">
            <ShieldAlert size={14} className={violationCount > 0 ? "text-red" : "text-green"} />
            <span>VIOLATIONS: {violationCount}</span>
          </div>
        </div>
      </header>

      <div className="jee-workspace">
        <div className="jee-question-section">
          <div className="jee-question-card">
            <div className="q-meta-info">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span className="marks-badge">JEE Pattern (+4 / -1)</span>
            </div>
            
            <h1 className="q-text">{current?.questionText || current?.question}</h1>

            <div className="options">
              {current?.options?.map((option, index) => {
                const selected = answers[current._id] === option;
                return (
                  <button
                    key={index}
                    className={`option ${selected ? "selected" : ""}`}
                    onClick={() => selectAnswer(option)}
                  >
                    <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                    <span className="option-text">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="jee-action-footer">
            <button className="jee-btn-secondary" onClick={handleClearResponse}>Clear Response</button>
            <button className="jee-btn-warning" onClick={handleMarkReview}>
              <Bookmark size={14} /> {markedForReview[current?._id] ? "Unmark Review" : "Mark for Review"}
            </button>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="jee-btn-secondary" onClick={previousQuestion} disabled={currentQuestion === 0}>
                <ArrowLeft size={14} /> Prev
              </button>
              {currentQuestion === questions.length - 1 ? (
                <button className="jee-btn-primary" onClick={submitExam}>Submit Test ✓</button>
              ) : (
                <button className="jee-btn-primary" onClick={nextQuestion}>
                  Save & Next <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="jee-sidebar">
          <div className="candidate-info-box">
            <div className="cand-avatar">👤</div>
            <div className="cand-details">
              <h4>{studentName}</h4>
              <span className="mono">ID: {studentId}</span>
            </div>
          </div>

          <div className="palette-section">
            <h3>Question Palette</h3>
            <div className="palette-grid">
              {questions.map((q, idx) => {
                const isAnswered = answers[q._id] !== undefined;
                const isMarked = markedForReview[q._id];
                let statusClass = "not-visited";
                if (isAnswered) statusClass = "answered";
                if (isMarked) statusClass = "marked";

                return (
                  <button
                    key={q._id}
                    className={`palette-item ${statusClass} ${currentQuestion === idx ? "current" : ""}`}
                    onClick={() => setCurrentQuestion(idx)}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="palette-legend">
              <div className="legend-item"><span className="dot answered"></span> Answered</div>
              <div className="legend-item"><span className="dot not-answered"></span> Not Answered</div>
              <div className="legend-item"><span className="dot marked"></span> Marked for Review</div>
            </div>
          </div>

          <button className="jee-submit-final-btn" onClick={submitExam}>
            <LogOut size={15} /> Finish & Submit Exam
          </button>
        </div>
      </div>
    </div>
  );
}