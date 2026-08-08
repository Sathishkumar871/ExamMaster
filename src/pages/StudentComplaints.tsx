import { useState, useEffect } from "react";
import "./StudentComplaints.css";

interface Complaint {
  _id: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function StudentComplaints() {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [myComplaints, setMyComplaints] = useState<Complaint[]>([]);
  const [filterStatus, setFilterStatus] = useState("All");

  const student = JSON.parse(localStorage.getItem("student") || "{}");
  const studentId = localStorage.getItem("studentId") || student.studentId;

  useEffect(() => {
    if (studentId) {
      fetchMyComplaints();
    }
  }, [studentId]);

  const fetchMyComplaints = async () => {
    try {
      const response = await fetch(`https://exammaster-backend-up1y.onrender.com/api/complaints/student/complaints/${studentId}`);
      const data = await response.json();
      if (data.success) {
        setMyComplaints(data.complaints || []);
      }
    } catch (error) {
      console.log("Error fetching complaints:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;
    try {
      const response = await fetch(`https://exammaster-backend-up1y.onrender.com/api/complaints/student/complaint/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ text: "🗑️ Request deleted successfully. You can now submit a new one.", type: "success" });
        fetchMyComplaints();
      } else {
        setMessage({ text: data.message || "Failed to delete", type: "error" });
      }
    } catch (error) {
      console.log("Error deleting:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    try {
      setLoading(true);
      setMessage({ text: "", type: "" });

      const response = await fetch(`https://exammaster-backend-up1y.onrender.com/api/complaints/student/complaint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: studentId,
          studentName: student.name || "Student",
          className: student.className || "N/A",
          classId: student.classId || "N/A",
          description: description,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ text: "✨ Complaint submitted successfully! (Limit: 1 per week)", type: "success" });
        setDescription("");
        fetchMyComplaints();
      } else {
        setMessage({ text: data.message || "⚠️ You can only submit 1 requirement per week.", type: "error" });
      }
    } catch (error) {
      console.log("Error:", error);
      setMessage({ text: "❌ Server error occurred. Please try again later.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = myComplaints.filter((item) => {
    if (filterStatus === "All") return true;
    return item.status === filterStatus || (filterStatus === "Pending" && !item.status);
  });

  return (
    <div className="complaint-container">
      {/* PREMIUM HEADER (Dashboard button removed) */}
      <div className="complaint-header">
        <div className="header-text">
          <h1>📢 Student Support & Helpdesk</h1>
          <p>Raise academic requirements securely. Limit: <strong>1 submission per week</strong>.</p>
        </div>
      </div>

      <div className="complaint-content-grid">
        {/* PREMIUM SUBMIT FORM CARD */}
        <div className="complaint-form-card">
          <h2>✍️ New Requirement Portal</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Detailed Description</label>
              <textarea
                rows={5}
                placeholder="Describe your issue or requirement clearly here..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={300}
                required
              />
              <small className="char-counter">{description.length}/300 characters</small>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Submitting securely..." : "🚀 Submit Requirement"}
            </button>

            {message.text && (
              <div className={`premium-alert ${message.type}`}>
                <span>{message.text}</span>
              </div>
            )}
          </form>
        </div>

        {/* PREMIUM HISTORY CARD WITH TABS */}
        <div className="complaint-history-card">
          <div className="history-top-bar">
            <h2>📋 Weekly Tracking History</h2>
            <div className="filter-tabs">
              <button className={filterStatus === "All" ? "active-tab" : ""} onClick={() => setFilterStatus("All")}>All</button>
              <button className={filterStatus === "Pending" ? "active-tab" : ""} onClick={() => setFilterStatus("Pending")}>Pending</button>
              <button className={filterStatus === "Resolved" ? "active-tab" : ""} onClick={() => setFilterStatus("Resolved")}>Resolved</button>
            </div>
          </div>

          {filteredComplaints.length === 0 ? (
            <div className="empty-state">
              <p>📭 No requests found.</p>
            </div>
          ) : (
            <div className="history-list">
              {filteredComplaints.map((item) => (
                <div className="history-item premium-item" key={item._id}>
                  <p className="history-desc">{item.description}</p>
                  <div className="history-footer">
                    <span className="history-date">📅 {new Date(item.createdAt).toLocaleDateString()}</span>
                    
                    <div className="footer-actions">
                      <span className={`badge ${item.status === "Resolved" ? "resolved" : "pending"}`}>
                        {item.status || "Pending"}
                      </span>
                      {(!item.status || item.status === "Pending") && (
                        <button className="delete-mini-btn" onClick={() => handleDelete(item._id)} title="Cancel Request">
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}