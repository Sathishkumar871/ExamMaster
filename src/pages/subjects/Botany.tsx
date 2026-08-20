import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, BookOpen, ArrowRight } from "lucide-react";
import TestInterface from "../../components/TestInterface";
import "./Botany.css";

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

export default function Botany() {
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

        // 1. Fetch Botany Questions from Backend API
        const queryParams = new URLSearchParams({
          className: className,
          subject: "Botany",
          testCategory: "subject",
        });

        const qResponse = await fetch(`${API_BASE_URL}/api/subjects/questions?${queryParams.toString()}`);
        if (!qResponse.ok) throw new Error("Failed to load Botany questions from database");
        
        const qData = await qResponse.json();
        const botanyQuestions = qData.questions || [];
        setQuestions(botanyQuestions);

        // 2. Fetch Student's Previous Results from MongoDB Database
        const currentStudentId = localStorage.getItem("studentId") || studentId;
        const resultsResponse = await fetch(`${API_BASE_URL}/api/results/student/${currentStudentId}`);
        
        if (resultsResponse.ok) {
          const resultsData = await resultsResponse.json();
          const resultsList = Array.isArray(resultsData) ? resultsData : (resultsData.results || resultsData.data || []);

          const loadedSubmittedChapters: Record<string, boolean> = {};
          const loadedChapterAnswers: Record<string, Record<string, string>> = {};

          resultsList.forEach((res: any) => {
            if (res.examName && res.examName.includes("Botany -")) {
              const parts = res.examName.split("Botany -");
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
      const chap = String(q.chapter || "General Botany").trim();
      map.set(chap, (map.get(chap) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  })();

  const currentChapterQuestions = selectedChapter
    ? questions.filter((q) => String(q.chapter || "").trim() === selectedChapter)
    : [];

  if (loading) {
    return <div style={{ textAlign: "center", padding: "80px", color: "#64748b", fontSize: "16px" }}>Loading Botany data from database...</div>;
  }

  if (error) {
    return <div style={{ textAlign: "center", padding: "80px", color: "red", fontSize: "16px" }}>{error}</div>;
  }

  // ================= 1. EXAM / QUESTIONS SCREEN (USING TestInterface) =================
  if (selectedChapter) {
    return (
      <TestInterface
        subject="Botany"
        className={className}
        chapterName={selectedChapter}
        questions={currentChapterQuestions}
        studentId={studentId}
        studentName={studentName}
        themeColor="#16a34a" // Botany Emerald Green Theme
        onBack={() => setSelectedChapter(null)}
        isAlreadySubmitted={submittedChapters[selectedChapter] || false}
        initialAnswers={chapterUserAnswers[selectedChapter] || {}}
      />
    );
  }

  // ================= 2. MAIN DASHBOARD VIEW =================
  return (
    <main className="botany-page">
      <div className="botany-container">
        <section className="botany-hero">
          <div className="botany-hero-content">
            <div className="botany-badge">
              <Leaf size={15} />
              JEE / NEET • {className.toUpperCase()} BOTANY
            </div>

            <h1 className="botany-title">
              Botany
              <span>
                Master Plant Sciences. Crack Exams.
              </span>
            </h1>

            <p className="botany-description">
              Welcome back, <strong>{studentName}</strong>! Practice {className} Botany chapter-wise with focused
              plant anatomy, physiology, and exam-oriented tests.
            </p>

            <div className="botany-stats">
              <div className="botany-stat">
                <span className="botany-stat-value">
                  {questions.length}+
                </span>
                <span className="botany-stat-label">
                  {className} Questions
                </span>
              </div>

              <div className="botany-stat">
                <span className="botany-stat-value">
                  {chaptersList.length}
                </span>
                <span className="botany-stat-label">
                  Chapters
                </span>
              </div>

              <div className="botany-stat">
                <span className="botany-stat-value">
                  JEE / NEET
                </span>
                <span className="botany-stat-label">
                  Exam Standard
                </span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="botany-section-header">
            <div>
              <h2 className="botany-section-title">
                {className} Botany Chapters
              </h2>
              <p className="botany-section-subtitle">
                Select a chapter and start your practice. (Student ID: {studentId})
              </p>
            </div>
          </div>

          {chaptersList.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b", background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              No Botany chapters found for {className}.
            </div>
          ) : (
            <div className="botany-chapter-grid">
              {chaptersList.map((chap, idx) => {
                const isCompleted = submittedChapters[chap.name];

                return (
                  <div className="botany-chapter-card" key={idx}>
                    <div className="botany-card-top">
                      <div className="botany-chapter-icon">
                        <Leaf size={24} />
                      </div>
                      <span className="botany-chapter-number">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="botany-card-content">
                      <h3>
                        {chap.name} {isCompleted && " ✅"}
                      </h3>
                      <p>
                        Practice important multiple-choice questions and conceptual problems from this chapter.
                      </p>

                      <div style={{ fontSize: "13px", fontWeight: "600", color: "#16a34a", marginBottom: "12px" }}>
                        {chap.count} Questions Available {isCompleted && "• Saved in DB"}
                      </div>

                      <button
                        type="button"
                        className="botany-test-button"
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