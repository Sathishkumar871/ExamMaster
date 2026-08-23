import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ChevronRight, 
  ArrowLeft,
  BarChart3,
  Printer
} from "lucide-react";
import "./ExamHistory.css";

const API_BASE_URL = 
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://exammaster-backend-up1y.onrender.com";

interface ReviewItem {
  questionId: string;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

interface ExamResult {
  _id: string;
  examName: string;
  subject: string;
  totalQuestions: number;
  attemptedQuestions: number;
  unansweredQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  marks: number;
  percentage: number;
  grade: string;
  status: string;
  timeTaken: number;
  createdAt: string;
  review?: ReviewItem[];
}

export default function ExamHistory() {
  const navigate = useNavigate();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [selectedExam, setSelectedExam] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all"); // 'all', 'correct', 'wrong', 'skipped'

  useEffect(() => {
    fetchStudentResults();
  }, []);

  const fetchStudentResults = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("studentToken") || localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const studentStr = localStorage.getItem("user") || localStorage.getItem("student");
      let studentId = "";
      if (studentStr) {
        try {
          const obj = JSON.parse(studentStr);
          studentId = obj?.studentId || obj?.id || obj?._id || "";
        } catch (e) {}
      }

      if (!studentId) {
        throw new Error("Student ID not found in local storage.");
      }

      const response = await fetch(`${API_BASE_URL}/api/results/student/${studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to fetch exam history");
      }

      const resultsList = data.results || data.data || data;
      const formattedList = Array.isArray(resultsList) ? resultsList : [resultsList];
      
      setResults(formattedList);
      if (formattedList.length > 0) {
        setSelectedExam(formattedList[0]);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unable to load exam history.");
    } finally {
      setLoading(false);
    }
  };

  // పేరులో "mock" లేదా "jee" ఉండి, 24 గంటల్లోపు ఉంటేనే హైలైట్ అయ్యే ఫంక్షన్
  const isRecentResult = (exam: ExamResult) => {
    if (!exam.createdAt || !exam.examName) return false;

    const nameLower = exam.examName.toLowerCase();
    // ఎగ్జామ్ పేరులో "mock" లేదా "jee" ఉందో లేదో చెక్ చేస్తుంది
    const isTargetTest = nameLower.includes("mock") || nameLower.includes("jee");
    if (!isTargetTest) return false;

    const createdTime = new Date(exam.createdAt).getTime();
    const currentTime = new Date().getTime();
    const hoursDifference = (currentTime - createdTime) / (1000 * 60 * 60);
    return hoursDifference <= 24; // 24 గంటల లోపు ఉంటేనే true
  };

  // Filtered Exam List based on Search
  const filteredExams = results.filter((exam) => 
    exam.examName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (exam.subject && exam.subject.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter questions inside the selected exam
  const getFilteredQuestions = () => {
    if (!selectedExam?.review) return [];
    const reviewItems = selectedExam.review;
    if (filterType === "correct") return reviewItems.filter(q => q.isCorrect);
    if (filterType === "wrong") return reviewItems.filter(q => !q.isCorrect && q.selectedAnswer !== "Not Attempted");
    if (filterType === "skipped") return reviewItems.filter(q => q.selectedAnswer === "Not Attempted");
    return reviewItems;
  };

  if (loading) {
    return (
      <div className="eh-loading-screen">
        <div className="loading-spinner" />
        <p>Loading Exam History...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="eh-error-screen">
        <div className="eh-error-card">
          <h3>Error Loading History</h3>
          <p>{error}</p>
          <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="eh-page">
      <div className="eh-container">
        
        {/* Top Bar Navigation */}
        <div className="eh-top-bar">
          <button onClick={() => navigate("/dashboard")} className="eh-back-btn">
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1>Exam History & Analytics</h1>
        </div>

        {results.length === 0 ? (
          <div className="eh-empty-box">
            <BarChart3 size={48} color="#94a3b8" />
            <h3>No Exam Records Found</h3>
            <p>You haven't taken any mock tests yet.</p>
            <button onClick={() => navigate("/mock-tests")} className="eh-action-btn">Take a Test</button>
          </div>
        ) : (
          <div className="eh-layout">
            
            {/* Sidebar: Exam List & Search */}
            <div className="eh-sidebar">
              <div className="eh-search-wrapper">
                <Search size={16} color="#64748b" />
                <input 
                  type="text" 
                  placeholder="Search exams..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} 
                />
              </div>

              <div className="eh-exam-list">
                {filteredExams.length === 0 ? (
                  <p className="eh-no-match">No exams match your search.</p>
                ) : (
                  filteredExams.map((exam) => {
                    const recent = isRecentResult(exam);
                    return (
                      <div 
                        key={exam._id} 
                        className={`eh-card ${selectedExam?._id === exam._id ? 'active' : ''} ${recent ? 'recent-highlight-card' : ''}`}
                        onClick={() => { setSelectedExam(exam); setFilterType('all'); }}
                      >
                        <div className="eh-card-info">
                          <div className="eh-card-title-row">
                            <h4>{exam.examName}</h4>
                            {recent && <span className="eh-new-badge">NEW ✨</span>}
                          </div>
                          <span>{new Date(exam.createdAt).toLocaleDateString()}</span>
                        </div>
                        <ChevronRight size={16} color="#94a3b8" />
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="eh-main-content">
              {selectedExam ? (
                <div>
                  {/* Summary Header */}
                  <div className="eh-summary-box">
                    <div className="eh-summary-info">
                      <span className="eh-badge-subject">{selectedExam.subject || "General"}</span>
                      <h2>{selectedExam.examName}</h2>
                      <p>Submitted: {new Date(selectedExam.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="eh-summary-score">
                      <div className="eh-score-circle">
                        <strong>{selectedExam.marks}</strong>/{selectedExam.totalQuestions}
                      </div>
                      <span className={`eh-status-pill ${selectedExam.percentage >= 35 ? 'pass' : 'fail'}`}>
                        {selectedExam.percentage}% ({selectedExam.status})
                      </span>
                      <button onClick={() => window.print()} className="eh-print-btn">
                        <Printer size={13} /> Print Report
                      </button>
                    </div>
                  </div>

                  {/* Quick Stats Grid */}
                  <div className="eh-stats-row">
                    <div className="eh-stat-item">
                      <span>Total</span>
                      <strong>{selectedExam.totalQuestions}</strong>
                    </div>
                    <div className="eh-stat-item green">
                      <span>Correct</span>
                      <strong>{selectedExam.correctAnswers}</strong>
                    </div>
                    <div className="eh-stat-item red">
                      <span>Wrong</span>
                      <strong>{selectedExam.wrongAnswers}</strong>
                    </div>
                    <div className="eh-stat-item grey">
                      <span>Skipped</span>
                      <strong>{selectedExam.unansweredQuestions}</strong>
                    </div>
                  </div>

                  {/* Question Filter Tabs */}
                  <div className="eh-review-header">
                    <h3>Question Review</h3>
                    <div className="eh-tabs">
                      <button 
                        className={filterType === 'all' ? 'active' : ''} 
                        onClick={() => setFilterType('all')}
                      >
                        All ({selectedExam.review?.length || 0})
                      </button>
                      <button 
                        className={filterType === 'correct' ? 'active correct' : ''} 
                        onClick={() => setFilterType('correct')}
                      >
                        Correct ({selectedExam.correctAnswers})
                      </button>
                      <button 
                        className={filterType === 'wrong' ? 'active wrong' : ''} 
                        onClick={() => setFilterType('wrong')}
                      >
                        Wrong ({selectedExam.wrongAnswers})
                      </button>
                      <button 
                        className={filterType === 'skipped' ? 'active skipped' : ''} 
                        onClick={() => setFilterType('skipped')}
                      >
                        Skipped ({selectedExam.unansweredQuestions})
                      </button>
                    </div>
                  </div>

                  {/* Questions Cards List */}
                  <div className="eh-questions-container">
                    {getFilteredQuestions().length === 0 ? (
                      <p className="eh-no-questions">No questions available for this filter.</p>
                    ) : (
                      getFilteredQuestions().map((q, idx) => (
                        <div 
                          key={q.questionId || idx} 
                          className={`eh-q-card ${q.isCorrect ? 'correct' : q.selectedAnswer === 'Not Attempted' ? 'skipped' : 'wrong'}`}
                        >
                          <div className="eh-q-top-row">
                            <span className="eh-q-num">Question {idx + 1}</span>
                            <span className={`eh-q-badge ${q.isCorrect ? 'green' : q.selectedAnswer === 'Not Attempted' ? 'grey' : 'red'}`}>
                              {q.isCorrect ? <CheckCircle2 size={14} /> : q.selectedAnswer === 'Not Attempted' ? <HelpCircle size={14} /> : <XCircle size={14} />}
                              {q.isCorrect ? "Correct" : q.selectedAnswer === 'Not Attempted' ? "Skipped" : "Wrong"}
                            </span>
                          </div>

                          <p className="eh-q-text">{q.question}</p>

                          <div className="eh-q-ans-box">
                            <div>
                              <span>Your Answer: </span>
                              <strong className={q.isCorrect ? "text-green" : "text-red"}>{q.selectedAnswer}</strong>
                            </div>
                            <div>
                              <span>Correct Answer: </span>
                              <strong className="text-green">{q.correctAnswer}</strong>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                </div>
              ) : (
                <div className="eh-select-prompt">
                  <p>Select an exam from the left sidebar to inspect your performance.</p>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}