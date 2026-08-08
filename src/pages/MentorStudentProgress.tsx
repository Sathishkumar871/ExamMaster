import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Heart,
  Utensils,
  Home,
  ShieldAlert,
  BookOpen,
  Award,
  Share2,
  UserCheck,
  FileText
} from "lucide-react";

import "./MentorStudentProgress.css";

export default function MentorStudentProgress() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("staffToken");

  const getProgress = async () => {
    try {
      const response = await axios.get(
        `https://exammaster-backend-up1y.onrender.com/api/mentor/student/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setData(response.data);
    } catch (error: any) {
      console.log("Progress Error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProgress();
  }, []);

  if (loading) {
    return <h2 className="loading-text">Loading Progress...</h2>;
  }

  if (!data) {
    return <h2 className="loading-text">No Data Found</h2>;
  }

  const student = data.student;
  const results = data.results || [];
  const feedback = data.feedback;

  return (
    <div className="progress-container">

      {/* STUDENT HEADER */}
      <div className="progress-header">
        <div className="header-avatar-badge">
          <UserCheck size={28} />
        </div>

        <h1>Student Progress Dashboard</h1>
        <h2>{student.name}</h2>

        <div className="student-meta">
          <p>ID : <span>{student.studentId}</span></p>
          <p>Class : <span>{student.className}</span></p>
          <p>Section : <span>{student.section}</span></p>
        </div>

        {/* COMPLETE PROGRESS CARD BUTTON - Navigates to Separate Page */}
        <button
          className="view-progress-btn"
          onClick={() => {
            navigate(`/mentor/student/${student.studentId}/progress-card`, {
              state: {
                student: {
                  ...student,
                  feedback: feedback,
                  results: results
                }
              }
            });
          }}
        >
          📄 View Complete Progress Card
        </button>
      </div>

      {/* EVALUATION BUTTONS */}
      <div className="progress-card">
        <h2>📝 Mentor Evaluation Hub</h2>
        <div className="evaluation-buttons-grid">
          <button onClick={() => navigate(`/mentor/evaluation/${student.studentId}/health`)}>
            <Heart size={18} /> Health & Wellbeing
          </button>
          <button onClick={() => navigate(`/mentor/evaluation/${student.studentId}/food`)}>
            <Utensils size={18} /> Food & Nutrition
          </button>
          <button onClick={() => navigate(`/mentor/evaluation/${student.studentId}/hostel`)}>
            <Home size={18} /> Hostel Life
          </button>
          <button onClick={() => navigate(`/mentor/evaluation/${student.studentId}/action`)}>
            <ShieldAlert size={18} /> Behaviour & Discipline
          </button>
          <button onClick={() => navigate(`/mentor/evaluation/${student.studentId}/academic`)}>
            <BookOpen size={18} /> Academic Progress
          </button>
        </div>
      </div>

      {/* MENTOR FEEDBACK ANALYTICS */}
      <div className="progress-card">
        <h2>📊 Mentor Feedback Analytics</h2>
        {feedback ? (
          <div className="feedback-analytics-grid">
            {Object.entries(feedback).map(([section, value]: any) => (
              <div className="analytics-card" key={section}>
                <h3>{section.replace(/([A-Z])/g, " $1").toUpperCase()}</h3>
                {typeof value === "object" && value !== null ? (
                  Object.entries(value).map(([key, val]: any) => (
                    <div className="detail-row" key={key}>
                      <span>{key.replace(/([A-Z])/g, " ")}</span>
                      <b>{Array.isArray(val) ? val.join(", ") : val || "Not Updated"}</b>
                    </div>
                  ))
                ) : (
                  <p>{value}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data-text">No Mentor Updates Available</p>
        )}
      </div>

      {/* EXAM RESULTS & PERFORMANCE */}
      <div className="progress-card">
        <h2><Award size={20} /> Exam Results & Performance</h2>
        {results.length === 0 ? (
          <p className="no-data-text">No Exams Attempted</p>
        ) : (
          results.map((item: any, index: number) => (
            <div className="result-item" key={index}>
              <FileText size={16} />
              <strong>{item.examName}</strong>
              <p>Subject: {item.subject}</p>
              <p>
                Marks:
                <span className="mark-badge">
                  {item.marks}/{item.totalQuestions}
                </span>
              </p>
              <p>Percentage: {item.percentage}%</p>
              <p>Status: {item.status}</p>
            </div>
          ))
        )}
      </div>

      {/* WHATSAPP SHARE BUTTON */}
      <button
        className="whatsapp-share-btn"
        onClick={() => {
          window.open(
            `https://wa.me/9553679915?text=Student Progress Report - ${student.name}`
          );
        }}
      >
        <Share2 size={18} /> Share Progress via WhatsApp
      </button>

    </div>
  );
}