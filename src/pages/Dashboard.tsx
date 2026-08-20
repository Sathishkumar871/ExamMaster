import { Link } from "react-router-dom";
import {
  BookOpen,
  ClipboardCheck,
  MessageSquareText,
  UserRound,
  ArrowUpRight,
  Sparkles,
  Play,
  Clock3,
  ChevronRight,
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
            Your learning journey continues here. Explore your subjects,
            practice with daily tests, and keep building your confidence.
          </p>

          <div className="hero-actions">

            <Link to="/subjects" className="primary-action">
              <span>Continue Learning</span>
              <ArrowUpRight size={18} />
            </Link>

            <Link to="/daily-tests" className="secondary-action">
              <Play size={16} />
              Daily Tests
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

            <span>Learning Space</span>

            <strong>Focus. Practice. Improve.</strong>

            <div className="center-line"></div>

            <small>
              Your personalized study dashboard
            </small>

          </div>

        </div>

      </section>


      {/* ================= CONTINUE LEARNING ================= */}
      
         

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
              Access your learning tools and student services.
            </p>
          </div>

        </div>


        {/* ================= DASHBOARD CARDS ================= */}
        <div className="dashboard-grid">

          {/* SUBJECTS */}
          <Link
            to="/subjects"
            className="dashboard-card subjects-card"
          >

            <div className="card-background"></div>

            <div className="card-top">

              <div className="card-icon">
                <BookOpen size={23} />
              </div>

              <span className="card-number">
                01
              </span>

            </div>

            <div className="card-body">

              <span className="card-label">
                LEARNING
              </span>

              <h3>
                Subjects
              </h3>

              <p>
                Explore your subjects, chapters and
                learning materials.
              </p>

            </div>

            <div className="card-bottom">

              <span>
                Explore subjects
              </span>

              <div className="card-arrow">
                <ArrowUpRight size={18} />
              </div>

            </div>

          </Link>


          {/* DAILY TESTS */}
          <Link
            to="/daily-tests"
            className="dashboard-card tests-card"
          >

            <div className="card-background"></div>

            <div className="card-top">

              <div className="card-icon">
                <ClipboardCheck size={23} />
              </div>

              <span className="card-number">
                02
              </span>

            </div>

            <div className="card-body">

              <span className="card-label">
                PRACTICE
              </span>

              <h3>
                Daily Tests
              </h3>

              <p>
                Practice chapter-wise questions and
                improve your preparation.
              </p>

            </div>

            <div className="card-bottom">

              <span>
                Start practice
              </span>

              <div className="card-arrow">
                <ArrowUpRight size={18} />
              </div>

            </div>

          </Link>


          {/* COMPLAINTS */}
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
                Raise complaints, requests or special
                requirements easily.
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


          {/* PROFILE */}
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
                View your profile, examination history
                and performance.
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