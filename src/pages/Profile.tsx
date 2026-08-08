import { useEffect, useState } from "react";
import { 
  UserCircle, 
  Mail, 
  Fingerprint, 
  Award, 
  TrendingUp, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  FileText,
  ShieldAlert,
  ArrowRight,
  Building
} from "lucide-react";
import "./Profile.css";

interface Result {
  _id: string;
  examName: string;
  subject: string;
  marks: number;
  totalQuestions: number;
  percentage: number;
  grade: string;
  status: string; // "PASS" or "FAIL"
  createdAt: string;
}

interface ProfileData {
  student: {
    name: string;
    email: string;
    studentId: string;
    department?: string;
    college?: string;
  };
  performance: {
    totalExams: number;
    totalMarks: number;
    average: number;
    correctAnswers: number;
    wrongAnswers: number;
  };
  results: Result[];
}

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "PASS" | "FAIL">("ALL");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const studentId = localStorage.getItem("studentId");
      const localStudentData = JSON.parse(localStorage.getItem("student") || "{}");

      if (!studentId && !localStudentData?._id) {
        setLoading(false);
        return;
      }

      const activeId = studentId || localStudentData._id || localStudentData.studentId;
      const token = localStorage.getItem("token") || localStudentData?.token;

      const response = await fetch(
        `http://localhost:5000/api/student/profile/${activeId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setProfile(data);
      } else {
        setProfile({
          student: {
            name: localStudentData.name || "Student Name",
            email: localStudentData.email || "student@exammaster.ai",
            studentId: activeId || "STU0000",
            department: localStudentData.department || "Computer Science & Engineering",
            college: localStudentData.college || "ExamMaster Institute of Technology"
          },
          performance: data.performance || { totalExams: 0, totalMarks: 0, average: 0, correctAnswers: 0, wrongAnswers: 0 },
          results: data.results || []
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getBestSubject = () => {
    if (!profile || profile.results.length === 0) return "No Data Yet";
    const best = [...profile.results].sort((a, b) => b.percentage - a.percentage)[0];
    return best.subject;
  };

  const getWeakSubject = () => {
    if (!profile || profile.results.length === 0) return "No Data Yet";
    const weak = [...profile.results].sort((a, b) => a.percentage - b.percentage)[0];
    return weak.subject;
  };

  // Filter results based on click
  const filteredResults = profile?.results.filter((item) => {
    if (activeFilter === "PASS") return item.status === "PASS";
    if (activeFilter === "FAIL") return item.status === "FAIL";
    return true; // "ALL"
  }) || [];

  if (loading) {
    return (
      <div className="profile-loading-screen">
        <div className="spinner"></div>
        <p>Loading Elite Profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-loading-screen">
        <ShieldAlert size={48} className="text-[#ff6f91] mb-2" />
        <h2>Profile Not Found</h2>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* 🌟 ULTRA PREMIUM PROFILE HEADER */}
      <div className="profile-header-card">
        <div className="profile-avatar-glow">
          <UserCircle size={75} style={{ color: "#ff6f91" }} />
        </div>
        <div className="profile-main-info">
          <h1>{profile.student.name}</h1>
          <div className="info-badge-group">
            <span className="badge">
              <Mail size={14} style={{ color: "#ffc75f" }} /> {profile.student.email}
            </span>
            <span className="badge">
              <Fingerprint size={14} style={{ color: "#f9f871" }} /> ID: {profile.student.studentId}
            </span>
          </div>

          <div className="info-badge-group secondary-info">
            <span className="badge-sub">
              <Building size={14} style={{ color: "#ff9671" }} /> {profile.student.department || "B.Tech / General"}
            </span>
          </div>
        </div>
      </div>

      {/* 📊 ELITE STAT CARDS (Clickable for Filtering Right/Wrong Answers) */}
      <div className="stats-container">
        <div 
          className={`stat-card ${activeFilter === "ALL" ? "active-filter" : ""}`}
          onClick={() => setActiveFilter("ALL")}
          title="Click to view all exams"
        >
          <div className="stat-icon icon-pink">
            <FileText size={22} />
          </div>
          <div>
            <p>Total Exams</p>
            <h2>{profile.performance.totalExams}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-yellow">
            <Award size={22} />
          </div>
          <div>
            <p>Total Marks</p>
            <h2>{profile.performance.totalMarks}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-peach">
            <TrendingUp size={22} />
          </div>
          <div>
            <p>Average Score</p>
            <h2>{profile.performance.average}%</h2>
          </div>
        </div>

        {/* 🟢 Correct Answers Clickable Button */}
        <div 
          className={`stat-card clickable-card ${activeFilter === "PASS" ? "active-filter" : ""}`}
          onClick={() => setActiveFilter("PASS")}
          title="Click to view Right/Passed Exams"
        >
          <div className="stat-icon icon-bright">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p>Right Answers <span className="filter-hint">(Click)</span></p>
            <h2>{profile.performance.correctAnswers}</h2>
          </div>
        </div>

        {/* 🔴 Wrong Answers Clickable Button */}
        <div 
          className={`stat-card clickable-card ${activeFilter === "FAIL" ? "active-filter" : ""}`}
          onClick={() => setActiveFilter("FAIL")}
          title="Click to view Wrong/Failed Exams"
        >
          <div className="stat-icon icon-pink">
            <XCircle size={22} />
          </div>
          <div>
            <p>Wrong Answers <span className="filter-hint">(Click)</span></p>
            <h2>{profile.performance.wrongAnswers}</h2>
          </div>
        </div>
      </div>

      {/* 📈 PERFORMANCE ANALYSIS */}
      <div className="analysis-section">
        <h2 className="vibrant-section-title">Performance Insights & Strengths</h2>
        <div className="analysis-grid">
          <div className="analysis-card strong">
            <div className="card-top">
              <BookOpen size={20} style={{ color: "#ffc75f" }} />
              <h3>Strongest Subject</h3>
            </div>
            <p>{getBestSubject()}</p>
          </div>

          <div className="analysis-card weak">
            <div className="card-top">
              <TrendingUp size={20} style={{ color: "#ff6f91" }} />
              <h3>Needs Improvement</h3>
            </div>
            <p>{getWeakSubject()}</p>
          </div>
        </div>
      </div>

      {/* 📚 EXAM HISTORY & FILTER TABS */}
      <div className="history-section">
        <div className="history-header-row">
          <h2 className="vibrant-section-title">
            Exam History & Records 
            {activeFilter !== "ALL" && (
              <span className="filter-tag-indicator">
                ({activeFilter === "PASS" ? "Showing Right Answers Only" : "Showing Wrong Answers Only"})
              </span>
            )}
          </h2>
          
          {activeFilter !== "ALL" && (
            <button className="reset-filter-btn" onClick={() => setActiveFilter("ALL")}>
              Show All Exams
            </button>
          )}
        </div>

        {filteredResults.length === 0 ? (
          <div className="no-data-card">
            <p>No records found for this filter. Click 'Show All Exams' to reset.</p>
          </div>
        ) : (
          <div className="history-grid">
            {filteredResults.map((item) => (
              <div className="history-card" key={item._id}>
                <div className="history-details">
                  <h3>{item.examName}</h3>
                  <p className="subject-tag">📘 Subject: {item.subject}</p>
                  <p className="date-tag">
                    <Calendar size={14} /> Attempted on: {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="score-info-box">
                  <div className="score-metrics">
                    <span className="score-main">{item.marks} / {item.totalQuestions}</span>
                    <span className="percentage-tag">{item.percentage}%</span>
                    <span className={`status-pill ${item.status === "PASS" ? "pass" : "fail"}`}>
                      {item.status === "PASS" ? "Right Answer" : "Wrong Answer"}
                    </span>
                  </div>

                  <button
                    className="review-btn"
                    onClick={() => {
                      window.location.href = `/review/${item._id}`;
                    }}
                  >
                    <span>View Review</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}