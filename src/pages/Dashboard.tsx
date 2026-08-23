import { Link } from "react-router-dom";
import {
  Award,
  BookOpen,
  MessageSquareText,
  UserRound,
  ArrowUpRight,
  ChevronRight,
  BarChart3,
  Trophy, // ఇక్కడ Trophy ఐకాన్ యాడ్ చేశాను
} from "lucide-react";

import "./Dashboard.css";

export default function Dashboard() {
  const student = JSON.parse(localStorage.getItem("student") || "{}");
  const studentName = student.name || "Student";

  return (
    <div className="dashboard-container">

      {/* ================= PREMIUM HERO ================= */}
      <section className="dashboard-hero">
        <div className="hero-glow hero-glow-one"></div>
        <div className="hero-glow hero-glow-two"></div>

        <div className="hero-content">
          <div className="hero-top-line">
            <span className="portal-badge">
              Student Portal
            </span>

            <span className="hero-status">
              <span className="status-dot"></span>
              Ready to learn
            </span>
          </div>

          <h1>
            Welcome back,
            <span>{studentName}</span>
          </h1>

          <p className="hero-description">
            Your learning journey continues here. Access study materials, check your
            results, and keep building your confidence.
          </p>

          <div className="hero-actions">
            <Link to="/study-materials" className="primary-action">
              <span>Academic Help</span>
              <ArrowUpRight size={18} />
            </Link>

            <Link to="/results" className="secondary-action">
              <BarChart3 size={16} />
              View Results
            </Link>
          </div>
        </div>

        {/* Decorative Hero Panel */}
        <div className="hero-visual">
          <div className="visual-orbit orbit-one"></div>
          <div className="visual-orbit orbit-two"></div>

          <div className="hero-center-card">
            <div className="center-icon">
              <BookOpen size={28} />
            </div>

            <span>Exam Master</span>

            <strong>Focus. Practice. Excel.</strong>

            <div className="center-line"></div>

            <small>
              Your personalized student dashboard
            </small>
          </div>
        </div>
      </section>

      {/* ================= SECTION HEADER ================= */}
      <section className="navigation-section">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">
              YOUR STUDY SPACE
            </span>

            <h2>
              Everything you need
            </h2>

            <p>
              Access your study materials, performance results, and student services.
            </p>
          </div>
        </div>

        {/* ================= DASHBOARD CARDS ================= */}
        <div className="dashboard-grid">

          {/* 01. RESULTS (Total Exam History & Scorecard) */}
          <Link
            to="/results"
            className="dashboard-card subjects-card"
          >
            <div className="card-background"></div>

            <div className="card-top">
              <div className="card-icon">
                <Award size={23} />
              </div>

              <span className="card-number">
                01
              </span>
            </div>

            <div className="card-body">
              <span className="card-label">
                PERFORMANCE
              </span>

              <h3>
                My Results
              </h3>

              <p>
                View your complete exam history, correct/wrong answers, and scores.
              </p>
            </div>

            <div className="card-bottom">
              <span>
                View results
              </span>

              <div className="card-arrow">
                <ArrowUpRight size={18} />
              </div>
            </div>
          </Link>

          {/* 02. LEADERBOARD & RANKINGS */}
          <Link
            to="/leaderboard"
            className="dashboard-card tests-card leaderboard-dashboard-card"
          >
            <div className="card-background"></div>

            <div className="card-top">
              <div className="card-icon" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff" }}>
                <Trophy size={23} />
              </div>

              <span className="card-number">
                02
              </span>
            </div>

            <div className="card-body">
              <span className="card-label">
                COMPETITION
              </span>

              <h3>
                Leaderboard & Ranks
              </h3>

              <p>
                Check top performers, class-wise rankings, and your position.
              </p>
            </div>

            <div className="card-bottom">
              <span>
                View rankings
              </span>

              <div className="card-arrow">
                <ArrowUpRight size={18} />
              </div>
            </div>
          </Link>

          {/* 03. COMPLAINTS / SUPPORT */}
          <Link
            to="/student/complaints"
            className="dashboard-card support-card"
          >
            <div className="card-background"></div>

            <div className="card-top">
              <div className="card-icon">
                <MessageSquareText size={23} />
              </div>

              <span className="card-number">
                03
              </span>
            </div>

            <div className="card-body">
              <span className="card-label">
                SUPPORT
              </span>

              <h3>
                Student Support
              </h3>

              <p>
                Raise complaints, requests or special requirements easily.
              </p>
            </div>

            <div className="card-bottom">
              <span>
                Get support
              </span>

              <div className="card-arrow">
                <ArrowUpRight size={18} />
              </div>
            </div>
          </Link>


          {/* 04. PROFILE */}
          <Link
            to="/profile"
            className="dashboard-card profile-card"
          >
            <div className="card-background"></div>

            <div className="card-top">
              <div className="card-icon">
                <UserRound size={23} />
              </div>

              <span className="card-number">
                04
              </span>
            </div>

            <div className="card-body">
              <span className="card-label">
                PERSONAL
              </span>

              <h3>
                My Profile
              </h3>

              <p>
                View your profile details and account settings.
              </p>
            </div>

            <div className="card-bottom">
              <span>
                View profile
              </span>

              <div className="card-arrow">
                <ArrowUpRight size={18} />
              </div>
            </div>
          </Link>

        </div>
      </section>

      {/* ================= BOTTOM MOTIVATION ================= */}
      <section className="dashboard-footer-banner">
        <div>
          <strong>
            Small progress every day.
          </strong>

          <p>
            Stay consistent and let your preparation speak for itself.
          </p>
        </div>

        <ChevronRight className="footer-chevron" size={20} />
      </section>

    </div>
  );
}