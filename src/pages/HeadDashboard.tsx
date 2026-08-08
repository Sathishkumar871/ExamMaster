import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HeadDashboard.css";

interface Staff {
  _id: string;
  name: string;
  mobile: string;
  role: string;
  department?: string;
  section?: string;
}

interface Student {
  _id: string;
  name: string;
  studentId: string;
  email?: string;
  password?: string;
  className?: string;
  section?: string;
}

interface Feedback {
  _id: string;
  message: string;
  name?: string;
  department?: string;
  status?: "pending" | "resolved";
  createdAt?: string;
}

export default function HeadDashboard() {
  const navigate = useNavigate();
  const [pendingStaff, setPendingStaff] = useState<Staff[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    totalFeedback: 0,
  });

  const [activeTab, setActiveTab] = useState<"staff" | "students" | "feedback">("staff");
  const [message, setMessage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  // టోకెన్ ఏ పేరుతో ఉన్నా ఆటోమేటిక్‌గా చెక్ చేయడానికి హెల్పర్ ఫంక్షన్
  const getToken = () => {
    return (
      localStorage.getItem("staffToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("teacherToken") ||
      localStorage.getItem("userToken")
    );
  };

  const loadHeadData = async () => {
    try {
      const token = getToken();

      const dashResponse = await fetch("http://localhost:5000/api/head/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dashData = await dashResponse.json();

      if (dashData.success) {
        setDashboardStats({
          totalStudents: dashData.dashboard.totalStudents,
          totalFeedback: dashData.dashboard.totalFeedback,
        });
        setStudents(dashData.students || []);
        setFeedback(dashData.feedback || []);
      }

      const staffResponse = await fetch("http://localhost:5000/api/head/pending-staff", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const staffData = await staffResponse.json();

      if (staffData.success) {
        setPendingStaff(staffData.staff);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadHeadData();
  }, []);

  const approveStaff = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/head/approve/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (data.success) {
        setMessage("Staff Approved Successfully");
        loadHeadData();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const rejectStaff = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/head/reject/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (data.success) {
        setMessage("Staff Rejected Successfully");
        loadHeadData();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const resolveComplaint = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/head/resolve-complaint/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setMessage("Complaint Resolved & Removed from Active Queue");
        loadHeadData();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.email && student.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesYear = selectedYear ? student.className === selectedYear : true;
    const matchesSection = selectedSection ? student.section === selectedSection : true;

    return matchesSearch && matchesYear && matchesSection;
  });

  const uniqueYears = Array.from(new Set(students.map((s) => s.className).filter(Boolean)));
  const uniqueSections = Array.from(new Set(students.map((s) => s.section).filter(Boolean)));

  const getDaysDifference = (createdAt?: string) => {
    if (!createdAt) return 0;
    const complaintDate = new Date(createdAt);
    const currentDate = new Date();
    const diffTime = currentDate.getTime() - complaintDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const activeFeedback = feedback
    .filter((fb) => {
      const isResolved = fb.status === "resolved";
      const daysOld = getDaysDifference(fb.createdAt);
      
      if (isResolved) return false;
      if (daysOld > 15) return false;
      
      return true;
    })
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

  return (
    <div className="head-dashboard-container">
      {/* Top Header */}
      <div className="dashboard-header">
        <div className="welcome-text">
          <h1>Welcome Head <span className="crown-emoji">👑</span></h1>
          <p>Manage staff approvals, student credentials & mentor feedback seamlessly.</p>
        </div>

        {/* Quick Action & Notification Panel */}
        <div className="header-actions-wrapper">
          {/* Create Exam & Question Bank Buttons */}
          <div className="quick-action-buttons">
            <button 
              className="premium-btn btn-primary"
              onClick={() => navigate("/create-exam")}
            >
              📝 Create Exam
            </button>
            <button 
              className="premium-btn btn-secondary"
              onClick={() => navigate("/question-bank")}
            >
              📚 Question Bank
            </button>
          </div>

          {/* Notification Bell */}
          <div className="notification-wrapper">
            <button onClick={() => setShowNotifications(!showNotifications)} className="notification-bell-btn">
              🔔
              {pendingStaff.length > 0 && <span className="notification-badge">{pendingStaff.length}</span>}
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                <h4>Notifications</h4>
                {pendingStaff.length === 0 ? (
                  <p className="no-notif">No new notifications</p>
                ) : (
                  pendingStaff.map((staff) => (
                    <div key={staff._id} className="notif-item" onClick={() => { setActiveTab("staff"); setShowNotifications(false); }}>
                      <p className="notif-title">New Staff Request</p>
                      <p className="notif-desc">{staff.name} ({staff.role})</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-icon blue">👥</div>
          <div>
            <h3>Total Students</h3>
            <p>{dashboardStats.totalStudents}</p>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon red">⚠️</div>
          <div>
            <h3>Active Complaints</h3>
            <p>{activeFeedback.length}</p>
          </div>
        </div>
      </div>

      {message && <div className="alert-banner">{message}</div>}

      {/* Navigation Tabs */}
      <div className="tabs-container">
        <button className={`tab-button ${activeTab === "staff" ? "active" : ""}`} onClick={() => setActiveTab("staff")}>
          Staff Approvals <span>{pendingStaff.length}</span>
        </button>
        <button className={`tab-button ${activeTab === "students" ? "active" : ""}`} onClick={() => setActiveTab("students")}>
          Student Credentials <span>{students.length}</span>
        </button>
        <button className={`tab-button ${activeTab === "feedback" ? "active" : ""}`} onClick={() => setActiveTab("feedback")}>
          Mentor Complaints <span>{activeFeedback.length}</span>
        </button>
      </div>

      {/* TAB 1: STAFF APPROVALS */}
      {activeTab === "staff" && (
        <div className="content-card">
          <h2>Pending Staff Approvals</h2>
          {pendingStaff.length === 0 ? (
            <p className="empty-text">No Pending Requests Found</p>
          ) : (
            <div className="grid-list">
              {pendingStaff.map((staff) => (
                <div key={staff._id} className="item-card">
                  <div className="item-info">
                    <h3>{staff.name}</h3>
                    <p><strong>Role:</strong> {staff.role}</p>
                    <p><strong>Mobile:</strong> {staff.mobile}</p>
                    <p><strong>Dept/Sec:</strong> {staff.department || "N/A"} / {staff.section || "N/A"}</p>
                  </div>
                  <div className="action-buttons">
                    <button onClick={() => approveStaff(staff._id)} className="btn-approve">Accept</button>
                    <button onClick={() => rejectStaff(staff._id)} className="btn-reject">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STUDENTS PASSWORDS & GMAIL */}
      {activeTab === "students" && (
        <div className="content-card">
          <h2>Student Gmail & Passwords Directory</h2>
          <p className="card-subtitle">Quickly search student login details to assist with access issues.</p>

          <div className="filter-toolbar">
            <input
              type="text"
              placeholder="🔍 Search by name, ID, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="filter-select">
              <option value="">All Years / Classes</option>
              {uniqueYears.map((yr, idx) => (<option key={idx} value={yr}>{yr}</option>))}
            </select>
            <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} className="filter-select">
              <option value="">All Sections</option>
              {uniqueSections.map((sec, idx) => (<option key={idx} value={sec}>{sec}</option>))}
            </select>
          </div>

          {filteredStudents.length === 0 ? (
            <p className="empty-text">No Students Found</p>
          ) : (
            <div className="grid-list">
              {filteredStudents.map((student) => (
                <div key={student._id} className="item-card">
                  <h3>{student.name} <span className="student-id-badge">ID: {student.studentId}</span></h3>
                  <p><strong>Gmail:</strong> {student.email || "N/A"}</p>
                  <p><strong>Password:</strong> <span className="password-text">{student.password || "N/A"}</span></p>
                  <p className="meta-info">Class: {student.className || "N/A"} &bull; Section: {student.section || "N/A"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MENTOR COMPLAINTS */}
      {activeTab === "feedback" && (
        <div className="content-card">
          <h2>Mentor Complaints & Feedback</h2>
          <p className="card-subtitle">Recent pending complaints appear first. Once resolved, they update on the mentor dashboard and clear from here.</p>

          {activeFeedback.length === 0 ? (
            <p className="empty-text">No Active Pending Complaints</p>
          ) : (
            <div className="grid-list">
              {activeFeedback.map((fb) => (
                <div key={fb._id} className="item-card">
                  <div className="feedback-header">
                    <span className="mentor-name">From: {fb.name || "Mentor"} ({fb.department || "N/A"})</span>
                    <span className="badge pending">⏳ Pending</span>
                  </div>
                  <div className="feedback-body">
                    <p><strong>Complaint:</strong> {fb.message}</p>
                  </div>
                  
                  <div className="feedback-item-footer">
                    <span className="feedback-footer">
                      {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : ""}
                    </span>

                    <button onClick={() => resolveComplaint(fb._id)} className="btn-resolve">
                      Mark as Resolved ✓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}