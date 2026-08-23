import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calculator, BookOpen, ArrowRight } from "lucide-react";
import TestInterface from "../../components/TestInterface";
import "./Mathematics.css";

// ఆటోమేటిక్ డిటెక్షన్ (Local & Render)
const API_BASE_URL = 
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://exammaster-backend-up1y.onrender.com";

interface Question {
  _id: string;
  question?: string;
  questionText?: string;
  options: string[];
  correctAnswer: string;
  subject?: string;
  chapter?: string;
  className?: string;
  testCategory?: string;
  isPublished?: boolean;
}

export default function Mathematics() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [studentId, setStudentId] = useState<string>("STU1001");
  const [studentName, setStudentName] = useState<string>("Student");
  const [className, setClassName] = useState<string>("2nd PUC");

  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  
  const [chapterUserAnswers, setChapterUserAnswers] = useState<Record<string, Record<string, string>>>({});
  const [submittedChapters, setSubmittedChapters] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user") || localStorage.getItem("student") || "{}";
      const parsedUser = JSON.parse(storedUser);

      if (parsedUser.className) setClassName(parsedUser.className);
      if (parsedUser.name) setStudentName(parsedUser.name);
      if (parsedUser.studentId) setStudentId(parsedUser.studentId);

      if (localStorage.getItem("className")) setClassName(localStorage.getItem("className")!);
      if (localStorage.getItem("studentName")) setStudentName(localStorage.getItem("studentName")!);
      if (localStorage.getItem("studentId")) setStudentId(localStorage.getItem("studentId")!);
    } catch (e) {
      console.log("Error reading student data from localStorage", e);
    }
  }, []);

  useEffect(() => {
    const loadDataFromDB = async () => {
      try {
        setLoading(true);

        // 1. Fetch Mathematics Questions from Backend API
        const queryParams = new URLSearchParams({
          className: className,
          subject: "Mathematics",
          testCategory: "subject",
        });

        const qResponse = await fetch(`${API_BASE_URL}/api/subjects/questions?${queryParams.toString()}`);
        if (!qResponse.ok) throw new Error("Failed to load Mathematics questions from database");
        
        const qData = await qResponse.json();
        const mathQuestions = qData.questions || [];
        setQuestions(mathQuestions);

        // 2. Fetch Student's Previous Results from MongoDB Database
        const currentStudentId = localStorage.getItem("studentId") || studentId;
        const resultsResponse = await fetch(`${API_BASE_URL}/api/results/student/${currentStudentId}`);
        
        if (resultsResponse.ok) {
          const resultsData = await resultsResponse.json();
          const resultsList = Array.isArray(resultsData) ? resultsData : (resultsData.results || resultsData.data || []);

          const loadedSubmittedChapters: Record<string, boolean> = {};
          const loadedChapterAnswers: Record<string, Record<string, string>> = {};

          resultsList.forEach((res: any) => {
            if (res.examName && res.examName.includes("Mathematics -")) {
              const parts = res.examName.split("Mathematics -");
              const chapName = parts[1]?.trim();

              if (chapName && res.review && Array.isArray(res.review)) {
                loadedSubmittedChapters[chapName] = true;
                const ansMap: Record<string, string> = {};
                res.review.forEach((item: any) => {
                  if (item.questionId && item.selectedAnswer) {
                    ansMap[item.questionId] = item.selectedAnswer;
                  }
                });
                loadedChapterAnswers[chapName] = ansMap;
              }
            }
          });

          setSubmittedChapters(loadedSubmittedChapters);
          setChapterUserAnswers(loadedChapterAnswers);
        }

      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadDataFromDB();
  }, [className]);

  const chaptersList = (() => {
    const map = new Map<string, number>();
    questions.forEach((q) => {
      const chap = String(q.chapter || "General Mathematics").trim();
      map.set(chap, (map.get(chap) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  })();

  const currentChapterQuestions = selectedChapter
    ? questions.filter((q) => String(q.chapter || "").trim() === selectedChapter)
    : [];

  if (loading) {
    return <div style={{ textAlign: "center", padding: "80px", color: "#64748b", fontSize: "16px" }}>Loading Mathematics data from database...</div>;
  }

  if (error) {
    return <div style={{ textAlign: "center", padding: "80px", color: "red", fontSize: "16px" }}>{error}</div>;
  }

  // ================= 1. EXAM / QUESTIONS SCREEN (USING TestInterface) =================
  if (selectedChapter) {
    return (
      <TestInterface
        subject="Mathematics"
        className={className}
        chapterName={selectedChapter}
        questions={currentChapterQuestions}
        studentId={studentId}
        studentName={studentName}
        themeColor="#6366f1" // Mathematics Indigo Theme
        onBack={() => setSelectedChapter(null)}
        isAlreadySubmitted={submittedChapters[selectedChapter] || false}
        initialAnswers={chapterUserAnswers[selectedChapter] || {}}
      />
    );
  }

  // ================= 2. MAIN DASHBOARD VIEW =================
  return (
    <main className="mathematics-page">
      <div className="mathematics-container">
        <section className="mathematics-hero">
          <div className="mathematics-hero-content">
            <div className="mathematics-badge">
              <Calculator size={15} />
              JEE / KCET • {className.toUpperCase()} MATHEMATICS
            </div>

            <h1 className="mathematics-title">
              Mathematics
              <span>
                Solve Equations. Crack JEE.
              </span>
            </h1>

            <p className="mathematics-description">
              Welcome back, <strong>{studentName}</strong>! Practice {className} Mathematics chapter-wise with focused
              problems, formulas, and exam-oriented tests.
            </p>

            <div className="mathematics-stats">
              <div className="mathematics-stat">
                <span className="mathematics-stat-value">
                  {questions.length}+
                </span>
                <span className="mathematics-stat-label">
                  {className} Questions
                </span>
              </div>

              <div className="mathematics-stat">
                <span className="mathematics-stat-value">
                  {chaptersList.length}
                </span>
                <span className="mathematics-stat-label">
                  Chapters
                </span>
              </div>

              <div className="mathematics-stat">
                <span className="mathematics-stat-value">
                  JEE Pattern
                </span>
                <span className="mathematics-stat-label">
                  Exam Standard
                </span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mathematics-section-header">
            <div>
              <h2 className="mathematics-section-title">
                {className} Mathematics Chapters
              </h2>
              <p className="mathematics-section-subtitle">
                Select a chapter and start your practice. (Student ID: {studentId})
              </p>
            </div>
          </div>

          {chaptersList.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b", background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              No Mathematics chapters found for {className}.
            </div>
          ) : (
            <div className="mathematics-chapter-grid">
              {chaptersList.map((chap, idx) => {
                const isCompleted = submittedChapters[chap.name];

                return (
                  <div className="mathematics-chapter-card" key={idx}>
                    <div className="mathematics-card-top">
                      <div className="mathematics-chapter-icon">
                        <Calculator size={24} />
                      </div>
                      <span className="mathematics-chapter-number">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="mathematics-card-content">
                      <h3>
                        {chap.name} {isCompleted && " ✅"}
                      </h3>
                      <p>
                        Practice important multiple-choice questions and problems from this chapter.
                      </p>

                      <div style={{ fontSize: "13px", fontWeight: "600", color: "#6366f1", marginBottom: "12px" }}>
                        {chap.count} Questions Available {isCompleted && "• Saved in DB"}
                      </div>

                      <button
                        type="button"
                        className="mathematics-test-button"
                        onClick={() => setSelectedChapter(chap.name)}
                      >
                        <BookOpen size={16} />
                        {isCompleted ? "View DB History" : "Start Practice"}
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}