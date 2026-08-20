import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FaceVerification from "./../components/FaceVerification";
import "./MockTests.css";

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
  exam?: string;
  testCategory?: string;
  category?: string;
  className?: string;
  class?: string;
}

export default function MockTests() {
  const navigate = useNavigate();

  const [step, setStep] = useState<string>("verify");
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [studentName, setStudentName] = useState("Student");
  const [studentId, setStudentId] = useState("");
  const [className, setClassName] = useState<string>("");
  const [examType, setExamType] = useState<string>("NEET"); 
  
  const [violationCount, setViolationCount] = useState<number>(0);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem("exam_answers");
    return saved ? JSON.parse(saved) : {};
  });

  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("exam_marked");
    return saved ? JSON.parse(saved) : {};
  });

  const [timeLeft, setTimeLeft] = useState<number>(30 * 60);

  // Stats for result page
  const [score, setScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [unattemptedCount, setUnattemptedCount] = useState<number>(0);
  const [attemptedCount, setAttemptedCount] = useState<number>(0);

  // 1. Retrieve student details
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
      return "ID-N/A";
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

    const getStoredExamType = () => {
      const direct = localStorage.getItem("examType") || localStorage.getItem("exam");
      if (direct) return direct;

      const userStr = localStorage.getItem("user") || localStorage.getItem("student");
      if (userStr) {
        try {
          const obj = JSON.parse(userStr);
          if (obj?.examType) return obj.examType;
          if (obj?.exam) return obj.exam;
        } catch (e) {}
      }
      return "NEET";
    };

    setStudentName(getStoredName());
    setStudentId(getStoredId());
    setClassName(getStoredClass());
    setExamType(getStoredExamType());
  }, [navigate]);

  // 🎯 DYNAMIC BACKEND FETCH FUNCTION (Using API_BASE_URL)
  const fetchQuestionsForClass = async (selectedClass: string, selectedExamType: string) => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("studentToken") || localStorage.getItem("token");

    try {
      const queryParams = new URLSearchParams();
      if (selectedClass) queryParams.append("className", selectedClass);
      if (selectedExamType) queryParams.append("examType", selectedExamType);

      const response = await fetch(`${API_BASE_URL}/api/questions/mock-tests?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load questions");
      }

      const loadedQuestions = data.questions || data.data || data;
      
      console.log(`🎯 Dedicated Mock Test Questions Loaded: ${loadedQuestions.length}`);

      setQuestions(loadedQuestions);
      const calculatedTime = loadedQuestions.length > 0 ? loadedQuestions.length * 60 : 30 * 60;
      setTimeLeft(calculatedTime);
    } catch (err: any) {
      console.error(err);
      setError("Unable to load mock questions: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === "exam" && !submitted) {
      localStorage.setItem("exam_answers", JSON.stringify(answers));
      localStorage.setItem("exam_marked", JSON.stringify(markedForReview));
    }
  }, [answers, markedForReview, step, submitted]);

  useEffect(() => {
    if (step !== "exam" || submitted || isSubmitting) return;

    if (timeLeft <= 0) {
      submitExam();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [step, submitted, timeLeft, isSubmitting]);

  const handleFaceVerified = () => {
    setStep("dashboard");
  };

  const handleViolation = (count: number) => {
    setViolationCount((prev) => prev + count);
  };

  const handleStartExam = async () => {
    setStep("greeting");
    await fetchQuestionsForClass(className, examType);

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

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  // SUBMIT EXAM LOGIC (Using API_BASE_URL)
  const submitExam = async () => {
    if (isSubmitting || submitted) return;

    setIsSubmitting(true);

    let correct = 0;
    let wrong = 0;
    let unattempted = 0;
    const reviewList: any[] = [];
    const totalQ = questions.length;

    questions.forEach((q) => {
      const userAns = answers[q._id] || "";
      const isCorrect = userAns === q.correctAnswer;

      if (!userAns) {
        unattempted++;
      } else if (isCorrect) {
        correct++;
      } else {
        wrong++;
      }

      reviewList.push({
        questionId: q._id,
        question: q.question || q.questionText || "",
        selectedAnswer: userAns || "Not Attempted",
        correctAnswer: q.correctAnswer,
        isCorrect,
      });
    });

    const attempted = totalQ - unattempted;
    const calculatedScore = correct;
    const percentage = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;
    const status = percentage >= 35 ? "PASS" : "FAIL";
    const grade = percentage >= 85 ? "A" : percentage >= 60 ? "B" : percentage >= 35 ? "C" : "F";

    setScore(calculatedScore);
    setAttemptedCount(attempted);
    setCorrectCount(correct);
    setWrongCount(wrong);
    setUnattemptedCount(unattempted);

    setSubmitted(true);
    setStep("results-view");

    const payload = {
      studentId,
      studentName,
      examId: questions[0]?._id || "MOCK_TEST_EXAM",
      examName: `${examType} Mock Test (${className || "Assessment"})`,
      testCategory: "mock",
      subject: examType || "NEET/JEE",
      totalQuestions: totalQ,
      attemptedQuestions: attempted,
      unansweredQuestions: unattempted,
      correctAnswers: correct,
      wrongAnswers: wrong,
      marks: calculatedScore,
      percentage,
      grade,
      status,
      timeTaken: Math.round((questions.length * 60 - timeLeft) / 60),
      warnings: violationCount,
      review: reviewList,
    };

    try {
      const token = localStorage.getItem("studentToken") || localStorage.getItem("token");
      
      const response = await fetch(`${API_BASE_URL}/api/results/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error("Result submission failed with status:", response.status);
      }
    } catch (e) {
      console.error("Backend result submission error:", e);
    } finally {
      setIsSubmitting(false);
      localStorage.removeItem("exam_answers");
      localStorage.removeItem("exam_marked");
    }
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

  // 1. FACE VERIFICATION SCREEN
  if (step === "verify") {
    return (
      <FaceVerification
        onVerified={handleFaceVerified}
        onViolation={handleViolation}
      />
    );
  }

  // 2. DASHBOARD
  if (step === "dashboard") {
    return (
      <div className="exam-page">
        <div className="start-wrapper">
          <div className="start-card" style={{ textAlign: "center", padding: "40px", maxWidth: "500px", margin: "auto", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div className="test-badge" style={{ marginBottom: "12px", display: "inline-block", background: "#e0f2fe", color: "#0284c7", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
              {examType.toUpperCase()} MOCK TEST {className ? `(${className})` : ""}
            </div>
            
            <h1 style={{ marginBottom: "10px", color: "#1e293b" }}>Welcome, {studentName}!</h1>
            
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", margin: "20px 0", border: "1px solid #e2e8f0", textAlign: "left" }}>
              <p style={{ margin: "6px 0", color: "#475569", fontSize: "14px" }}>
                🆔 <strong>Student ID:</strong> <span style={{ color: "#0f172a" }}>{studentId}</span>
              </p>
              <p style={{ margin: "6px 0", color: "#475569", fontSize: "14px" }}>
                📚 <strong>Class Name:</strong> <span style={{ color: "#2563eb", fontWeight: "bold" }}>{className || "Not Specified"}</span>
              </p>
              <p style={{ margin: "6px 0", color: "#475569", fontSize: "14px" }}>
                🎯 <strong>Exam Type:</strong> <span style={{ color: "#7c3aed", fontWeight: "bold" }}>{examType || "NEET"}</span>
              </p>
              <p style={{ margin: "6px 0", color: "#16a34a", fontSize: "14px" }}>
                ✅ <strong>Face Verification:</strong> <span style={{ fontWeight: "bold" }}>Authenticated Successfully</span>
              </p>
            </div>

            <p style={{ color: "#64748b", marginBottom: "24px", fontSize: "14px" }}>
              Your {examType} assessment package for {className || "Class"} is ready.
            </p>
            
            <button 
              className="start-button" 
              onClick={handleStartExam}
              style={{ background: "#3b82f6", color: "#fff", padding: "14px 28px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold", width: "100%", fontSize: "16px" }}
            >
              Start Test Now →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. GREETING SCREEN
  if (step === "greeting") {
    return (
      <div className="exam-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "linear-gradient(135deg, #1e3a8a, #3b82f6)" }}>
        <div style={{ textAlign: "center", color: "#fff" }}>
          <div style={{ fontSize: "65px", marginBottom: "15px" }}>🌟🚀🎯</div>
          <h1 style={{ fontSize: "38px", marginBottom: "10px", fontWeight: "bold" }}>
            All The Best, <span style={{ color: "#facc15" }}>{studentName}</span>!
          </h1>
          <p style={{ fontSize: "18px", opacity: "0.9" }}>
            Get ready for your <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{examType} - {className || "Assessment"}</span> test.
          </p>
          <div className="loading-spinner" style={{ margin: "30px auto", borderColor: "#fff", borderTopColor: "transparent" }} />
        </div>
      </div>
    );
  }

  // 4. RESULTS PAGE
  if (step === "results-view" || submitted) {
    const totalQ = questions.length;
    const percentage = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;

    return (
      <div className="exam-page">
        <div className="result-wrapper" style={{ maxWidth: "650px", margin: "40px auto" }}>
          <div className="result-card" style={{ textAlign: "center", padding: "40px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div className="result-icon" style={{ background: "#dcfce7", color: "#16a34a", marginBottom: "16px", fontSize: "32px", display: "inline-block", padding: "12px 20px", borderRadius: "50%" }}>🎉</div>
            <span className="result-label" style={{ color: "#16a34a", fontWeight: "bold", display: "block" }}>TEST SUBMITTED SUCCESSFULLY</span>
            <h1 style={{ color: "#1e293b", marginTop: "8px" }}>Performance Report</h1>
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>{examType} Mock Test ({className || "Assessment"})</p>
            
            <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "10px", margin: "20px 0", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "14px", color: "#475569" }}>Your Final Score</span>
              <div style={{ fontSize: "38px", fontWeight: "bold", color: "#2563eb", marginTop: "6px" }}>
                {score} / {totalQ}
              </div>
              <div style={{ fontSize: "16px", fontWeight: "600", color: percentage >= 35 ? "#16a34a" : "#dc2626", marginTop: "4px" }}>
                Percentage: {percentage}%
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px", margin: "20px 0" }}>
              <div style={{ background: "#f0fdf4", padding: "10px", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                <span style={{ fontSize: "12px", color: "#16a34a", display: "block" }}>Correct</span>
                <strong style={{ fontSize: "18px", color: "#15803d" }}>{correctCount}</strong>
              </div>
              <div style={{ background: "#fef2f2", padding: "10px", borderRadius: "8px", border: "1px solid #fecaca" }}>
                <span style={{ fontSize: "12px", color: "#dc2626", display: "block" }}>Wrong</span>
                <strong style={{ fontSize: "18px", color: "#b91c1c" }}>{wrongCount}</strong>
              </div>
              <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Skipped</span>
                <strong style={{ fontSize: "18px", color: "#475569" }}>{unattemptedCount}</strong>
              </div>
              <div style={{ background: "#eff6ff", padding: "10px", borderRadius: "8px", border: "1px solid #bfdbfe" }}>
                <span style={{ fontSize: "12px", color: "#2563eb", display: "block" }}>Attempted</span>
                <strong style={{ fontSize: "18px", color: "#1d4ed8" }}>{attemptedCount}</strong>
              </div>
            </div>

            <button 
              className="result-button" 
              onClick={() => navigate("/")}
              style={{ marginTop: "16px", background: "#3b82f6", color: "#fff", padding: "12px 28px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "15px" }}
            >
              Return to Dashboard →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. LOADING SCREEN
  if (loading) {
    return (
      <div className="exam-loading">
        <div className="loading-spinner" />
        <h2>Loading {examType} Mock Test</h2>
        <p>Please wait while we prepare your exam environment...</p>
      </div>
    );
  }

  // 6. ERROR SCREEN
  if (error) {
    return (
      <div className="exam-error-page">
        <div className="error-card">
          <div className="error-icon">!</div>
          <h2>Unable to Load Test</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  // 7. EXAM SCREEN
  return (
    <div className="exam-page">
      <header className="exam-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
        <div>
          <div style={{ fontWeight: "bold", color: "#3b82f6" }}>{examType} Mock Test ({className})</div>
          <div style={{ fontSize: "12px", color: "#64748b" }}>{studentName} ({studentId})</div>
        </div>
        <div className="exam-timer" style={{ background: "#fef2f2", color: "#dc2626", padding: "6px 12px", borderRadius: "6px" }}>
          <span style={{ fontSize: "11px", display: "block" }}>TIME LEFT</span>
          <strong>⏱ {formatTime(timeLeft)}</strong>
        </div>
      </header>

      <main className="question-layout">
        <section className="question-section">
          <div className="question-card">
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Question {currentQuestion + 1} of {questions.length}</span>
            <h1 style={{ marginTop: "8px" }}>{current?.questionText || current?.question}</h1>

            <div className="options">
              {current?.options?.map((option, index) => {
                const selected = answers[current._id] === option;
                return (
                  <button
                    key={current._id ? `${current._id}-opt-${index}` : index}
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

          <div className="navigation-buttons">
            <button onClick={previousQuestion} disabled={currentQuestion === 0}>← Previous</button>
            {currentQuestion === questions.length - 1 ? (
              <button 
                onClick={submitExam} 
                disabled={isSubmitting}
                style={{ background: "#22c55e", color: "white" }}
              >
                {isSubmitting ? "Submitting..." : "Submit Test ✓"}
              </button>
            ) : (
              <button onClick={nextQuestion}>Next Question →</button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}