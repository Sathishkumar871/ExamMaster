import { Link } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const student = JSON.parse(localStorage.getItem("student") || "{}");

  return (
    <div className="dashboard-container">
      {/* ================= HERO BANNER ================= */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <span className="hero-greeting-tag">🔥 Welcome back</span>
          <h1>Hello, <span>{student.name || "Student"}</span>! 👋</h1>
          <p>Ready to conquer your next exam? Access your subjects, practice tests, or raise college requirements easily.</p>
          
          {/* Quick Stats inside Hero */}
          <div className="hero-quick-stats">
            <div className="stat-pill">
              <span className="stat-icon">🎯</span>
              <div>
                <strong>{student.testsCompleted || 12}</strong>
                <span>Tests Done</span>
              </div>
            </div>
            <div className="stat-pill">
              <span className="stat-icon">🔥</span>
              <div>
                <strong>{student.streak || 5} Days</strong>
                <span>Streak</span>
              </div>
            </div>
            <div className="stat-pill">
              <span className="stat-icon">📊</span>
              <div>
                <strong>{student.avgScore || "88%"}</strong>
                <span>Avg. Score</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-badge-wrapper">
          <div className="hero-badge">
            <span>🎓 Student Portal</span>
          </div>
          <div className="announcement-pill">
            <span className="pulse-dot"></span>
            <p>New Mock Test for Mathematics is live!</p>
          </div>
        </div>
      </div>

      {/* ================= QUICK RESUME BANNER ================= */}
      <div className="resume-learning-card">
        <div className="resume-info">
          <span className="resume-tag">Continue Learning</span>
          <h3>Advanced Physics: Quantum Mechanics</h3>
          <p>Last studied 2 hours ago • Chapter 4: Wave Functions</p>
        </div>
        <Link to="/subjects" className="resume-btn">
          Resume <span>→</span>
        </Link>
      </div>

      {/* ================= DASHBOARD GRID CARDS ================= */}
      <div className="section-title">
        <h2>Quick Navigation</h2>
        <p>Explore your study tools and portal options</p>
      </div>

      <div className="dashboard-grid">
        {/* Subjects Card */}
        <Link to="/subjects" className="dashboard-card card-subjects">
          <div className="card-top">
            <div className="card-icon-wrapper">
              <span className="card-emoji">📚</span>
            </div>
            <span className="card-badge">6 Active</span>
          </div>
          <div className="card-content">
            <h3>Subjects</h3>
            <p>Choose your subjects & learning materials</p>
          </div>
          <div className="card-footer">
            <span>Explore materials</span>
            <span className="card-arrow">→</span>
          </div>
        </Link>

        {/* Mock Tests Card */}
        <Link to="/mock-tests" className="dashboard-card card-mock">
          <div className="card-top">
            <div className="card-icon-wrapper">
              <span className="card-emoji">📝</span>
            </div>
            <span className="card-badge pulse-badge">New Test</span>
          </div>
          <div className="card-content">
            <h3>Mock Tests</h3>
            <p>Practice online exams & boost your score</p>
          </div>
          <div className="card-footer">
            <span>Take a test</span>
            <span className="card-arrow">→</span>
          </div>
        </Link>

        {/* Complaints & Requirements Card */}
        <Link to="/student/complaints" className="dashboard-card card-complaint">
          <div className="card-top">
            <div className="card-icon-wrapper">
              <span className="card-emoji">📢</span>
            </div>
            <span className="card-badge">24/7 Support</span>
          </div>
          <div className="card-content">
            <h3>Complaints & Needs</h3>
            <p>Submit college issues or special requirements</p>
          </div>
          <div className="card-footer">
            <span>Raise ticket</span>
            <span className="card-arrow">→</span>
          </div>
        </Link>

        {/* Profile Card */}
        <Link to="/profile" className="dashboard-card card-profile">
          <div className="card-top">
            <div className="card-icon-wrapper">
              <span className="card-emoji">👤</span>
            </div>
            <span className="card-badge">Analytics</span>
          </div>
          <div className="card-content">
            <h3>My Profile</h3>
            <p>View your marks, stats & performance history</p>
          </div>
          <div className="card-footer">
            <span>View stats</span>
            <span className="card-arrow">→</span>
          </div>
        </Link>
      </div>
    </div>
  );
}