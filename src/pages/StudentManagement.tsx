import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentManagement.css";
interface ResultItem {
  _id: string;
  examName: string;
  subject: string;
  marks: number;
  totalQuestions: number;
  percentage: number;
  grade: string;
  status: string;
  createdAt: string;
}

interface Student {
  studentId: string;
  name: string;
  email?: string;
  className: string;
  totalExams: number;
  average: number;
  highestMarks: number;
  correctAnswers: number;
  wrongAnswers: number;
  pass: number;
  fail: number;
  results?: ResultItem[];
  feedback?: any;
}

export default function StudentManagement() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const teacher = JSON.parse(localStorage.getItem("teacher") || "{}");

  useEffect(() => {
    fetchStudentsHistory();
  }, []);

  const fetchStudentsHistory = async () => {
    try {
      const token = localStorage.getItem("teacherToken");
      const response = await fetch(
        `http://localhost:5000/api/teacher/students?classId=${teacher.classId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error("Error fetching students history:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(search.toLowerCase())
  );

  const getBadgeStyle = (avg: number) => {
    if (avg >= 80) return { bg: "#D1FAE5", text: "#065F46" };
    if (avg >= 60) return { bg: "#DBEAFE", text: "#1E40AF" };
    if (avg >= 40) return { bg: "#FEF3C7", text: "#92400E" };
    return { bg: "#FEE2E2", text: "#991B1B" };
  };

  if (loading) {
    return (
      <div style={{ display: "flex", height: "100vh", justifyContent: "center", alignItems: "center", background: "#0f172a", color: "#38bdf8", fontSize: "1.2rem", fontWeight: 600 }}>
        ✨ Loading Academic Records & Profiles...
      </div>
    );
  }

  return (
    <div className="student-management-container">
      {/* HEADER & BACK BUTTON */}
      <div className="sm-header-box">
        <button
          onClick={() => navigate("/teacher/dashboard")}
          className="sm-back-btn"
        >
          ← Back to Dashboard
        </button>
        <h1 className="sm-title">👥 Student Management & Performance Hub</h1>
      </div>

      {/* SEARCH BOX */}
      <div className="sm-search-box">
        <input
          type="text"
          placeholder="🔍 Search student by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm-search-input"
        />
      </div>

      {/* STUDENTS TABLE VIEW */}
      <div className="sm-table-card">
        {filteredStudents.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            <h3>No Students Found</h3>
          </div>
        ) : (
          <table className="sm-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Student ID</th>
                <th>Class</th>
                <th>Total Exams</th>
                <th>Pass / Fail</th>
                <th>Average %</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const badge = getBadgeStyle(student.average);
                return (
                  <tr key={student.studentId}>
                    <td style={{ fontWeight: 600, color: "#1e293b" }}>{student.name}</td>
                    <td style={{ color: "#64748b" }}>{student.studentId}</td>
                    <td style={{ color: "#475569" }}>{student.className}</td>
                    <td style={{ fontWeight: 500 }}>{student.totalExams}</td>
                    <td>
                      <span style={{ color: "#059669", fontWeight: 600 }}>{student.pass} Pass</span> /{" "}
                      <span style={{ color: "#dc2626", fontWeight: 600 }}>{student.fail} Fail</span>
                    </td>
                    <td>
                      <span style={{ background: badge.bg, color: badge.text, padding: "4px 10px", borderRadius: "20px", fontSize: "13px", fontWeight: 700 }}>
                        {student.average}%
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => navigate(`/mentor/student/${student.studentId}`)}
                        className="sm-action-btn"
                      >
                        View Progress Card 📄
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}