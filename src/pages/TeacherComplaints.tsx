import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TeacherDashboard.css";

interface Complaint {
  _id: string;
  studentId: string;
  studentName: string;
  className: string;
  classId: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function TeacherComplaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("teacherToken");

      const response = await fetch(
        `https://exammaster-backend-up1y.onrender.com/api/teacher/complaints`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      console.log("STUDENT COMPLAINTS:", data);

      if (data.success) {
        setComplaints(data.complaints || []);
      }
    } catch (error) {
      console.log("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🛠️ Mark as Resolved Function
  const handleResolve = async (id: string) => {
    try {
      const response = await fetch(`https://exammaster-backend-up1y.onrender.com/api/teacher/complaint/${id}`, {
        method: "PUT",
      });
      const data = await response.json();
      if (data.success) {
        setComplaints(complaints.map(item => item._id === id ? { ...item, status: "Resolved" } : item));
      }
    } catch (error) {
      console.log("Error updating status:", error);
    }
  };

  if (loading) {
    return <div className="teacher-loading">Loading Complaints & Students...</div>;
  }

  return (
    <div className="teacher-container">
      {/* HEADER SECTION */}
      <div className="teacher-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>📢 Student Complaints & Requirements</h1>
          <p>Complete list of students who submitted issues, requirements, or problems.</p>
        </div>
        <button
          onClick={() => navigate("/teacher/dashboard")}
          style={{
            padding: "8px 16px",
            backgroundColor: "#333",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          ⬅ Back to Dashboard
        </button>
      </div>

      {/* COMPLAINTS & STUDENTS GRID */}
      <div className="student-grid" style={{ marginTop: "20px" }}>
        {complaints.length === 0 ? (
          <div style={{ textAlign: "center", gridColumn: "1 / -1", padding: "40px" }}>
            <h2>No Submissions Found</h2>
            <p style={{ color: "#666", fontSize: "14px", marginTop: "5px" }}>
              Students haven't submitted any college requirements or problems yet.
            </p>
          </div>
        ) : (
          complaints.map((item) => (
            <div 
              className="student-card" 
              key={item._id} 
              style={{ borderLeft: `5px solid ${item.status === "Resolved" ? "#10b981" : "#e67e22"}` }}
            >
              <h2>👤 {item.studentName || "Student Name"}</h2>
              <p>🆔 Student ID: <strong>{item.studentId}</strong></p>
              <p>🏫 Class Name: <strong>{item.className || "N/A"}</strong></p>
              <p>🏷️ Class ID: <strong>{item.classId || "N/A"}</strong></p>
              
              <hr />

              <div className="performance" style={{ textAlign: "left", marginTop: "10px" }}>
                <p><strong>📌 Requirement / Issue:</strong></p>
                <p style={{ backgroundColor: "#f9f9f9", padding: "10px", borderRadius: "5px", marginTop: "5px", color: "#333", wordBreak: "break-word" }}>
                  {item.description}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px" }}>
                  <span style={{ fontSize: "12px", color: "#888" }}>
                    📅 Date: {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <span style={{ 
                    padding: "4px 10px", 
                    borderRadius: "20px", 
                    fontSize: "12px", 
                    fontWeight: "bold",
                    background: item.status === "Resolved" ? "#d1fae5" : "#fef3c7",
                    color: item.status === "Resolved" ? "#065f46" : "#d97706"
                  }}>
                    {item.status || "Pending"}
                  </span>
                </div>

                {item.status !== "Resolved" && (
                  <button
                    onClick={() => handleResolve(item._id)}
                    style={{
                      marginTop: "12px",
                      width: "100%",
                      padding: "8px",
                      backgroundColor: "#10b981",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontWeight: "600"
                    }}
                  >
                    ✔ Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}