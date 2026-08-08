
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserCircle,
  LogOut,
  LayoutDashboard,
  BookOpen,
} from "lucide-react";
import "./Navbar.css";

interface User {
  name: string;
  role?: string;
  teacherType?: string;
  [key: string]: any;
}

export default function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);

  // ==========================================
  // LOAD LOGGED-IN USER
  // ==========================================
  useEffect(() => {
    const student = localStorage.getItem("student");
    const teacher = localStorage.getItem("teacher");
    const staff = localStorage.getItem("staff");

    // ==============================
    // STUDENT
    // ==============================
    if (student) {
      try {
        const studentData = JSON.parse(student);

        setUser({
          ...studentData,
          role: "student",
        });
      } catch (error) {
        console.error("Student data parse error:", error);
      }
    }

    // ==============================
    // TEACHER / MANAGEMENT
    // ==============================
    else if (teacher) {
      try {
        const teacherData = JSON.parse(teacher);

        setUser({
          ...teacherData,
          role: teacherData.role || "teacher",
        });
      } catch (error) {
        console.error("Teacher data parse error:", error);
      }
    }

    // ==============================
    // STAFF / MENTOR / HEAD
    // ==============================
    else if (staff) {
      try {
        const staffData = JSON.parse(staff);

        setUser({
          ...staffData,

          // IMPORTANT:
          // Use backend role if available.
          // Mentor will remain mentor.
          role: staffData.role || "staff",
        });
      } catch (error) {
        console.error("Staff data parse error:", error);
      }
    }
  }, []);

  // ==========================================
  // LOGOUT
  // ==========================================
  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  // ==========================================
  // DISPLAY ROLE
  // ==========================================
  const getDisplayRole = () => {
    if (!user) return "";

    // Teacher Type
    if (user.teacherType) {
      return `👤 ${user.teacherType}`;
    }

    // Head
    if (user.role === "head") {
      return "👔 Head / Admin";
    }

    // Mentor
    if (user.role === "mentor") {
      return "🎓 Mentor";
    }

    // Manager
    if (user.role === "manager") {
      return "👨‍💼 Manager";
    }

    // Staff
    if (user.role === "staff") {
      return "👥 Staff";
    }

    // Teacher
    if (user.role === "teacher") {
      return "👨‍🏫 Teacher";
    }

    // Student
    if (user.role === "student") {
      return "🎓 Student";
    }

    return "User";
  };

  return (
    <nav className="navbar">

      {/* ==========================================
          LOGO
      ========================================== */}
      <div className="logo-section">
        <h2>ExamMaster AI</h2>
        <p>Smart Examination Platform</p>
      </div>

      {/* ==========================================
          VIDEO
      ========================================== */}
      <div className="learning-animation">
        <div className="student-run">
          <video
            src="https://res.cloudinary.com/dlkborjdl/video/upload/v1785385746/12743779_xrqvvv.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="running-icon-video"
          />
        </div>

        <p>Learn • Practice • Win</p>
      </div>

      {/* ==========================================
          NAV LINKS
      ========================================== */}
      <div className="nav-links">

        {/* HOME */}
        <Link to="/">
          Home
        </Link>

        {/* SUBJECTS */}
        <Link to="/subjects">
          Subjects
        </Link>

        {/* ==========================================
            DAILY TESTS
        ========================================== */}
        {user?.role === "student" ? (
          <Link to="/student/daily-test">
            Daily Tests
          </Link>
        ) : (
          <Link to="/daily-tests">
            Daily Tests
          </Link>
        )}

        {/* ==========================================
            USER AREA
        ========================================== */}
        {user ? (
          <div className="user-area">

            {/* USER CARD */}
            <div className="user-card">
              <UserCircle size={25} />

              <div>
                <b>{user.name}</b>
                <small>{getDisplayRole()}</small>
              </div>
            </div>

            {/* ==========================================
                DROPDOWN
            ========================================== */}
            <div className="dropdown">

              {/* ========================================
                  STUDENT DASHBOARD
              ======================================== */}
              {user.role === "student" ? (
                <Link to="/dashboard">
                  <LayoutDashboard size={18} />
                  Student Dashboard
                </Link>
              )

              /* ========================================
                 TEACHER DASHBOARD
              ======================================== */
              : user.role === "teacher" ? (
                <Link to="/teacher/dashboard">
                  <LayoutDashboard size={18} />
                  Teacher Dashboard
                </Link>
              )

              /* ========================================
                 MENTOR DASHBOARD
              ======================================== */
              : user.role === "mentor" ? (
                <Link to="/mentor/dashboard">
                  <LayoutDashboard size={18} />
                  Mentor Dashboard
                </Link>
              )

              /* ========================================
                 HEAD DASHBOARD
              ======================================== */
              : user.role === "head" ? (
                <Link to="/head/dashboard">
                  <LayoutDashboard size={18} />
                  Head Dashboard
                </Link>
              )

              /* ========================================
                 MANAGER DASHBOARD
              ======================================== */
              : user.role === "manager" ? (
                <Link to="/manager/dashboard">
                  <LayoutDashboard size={18} />
                  Manager Dashboard
                </Link>
              )

              /* ========================================
                 OTHER STAFF
              ======================================== */
              : (
                <Link to="/mentor/dashboard">
                  <LayoutDashboard size={18} />
                  Staff Dashboard
                </Link>
              )}

              {/* ========================================
                  PROFILE
              ======================================== */}
              <Link to="/profile">
                <BookOpen size={18} />
                Profile
              </Link>

              {/* ========================================
                  LOGOUT
              ======================================== */}
              <button
                className="logout"
                onClick={logout}
              >
                <LogOut size={18} />
                Logout
              </button>

            </div>
          </div>
        ) : (

          /* ==========================================
             LOGIN DROPDOWN
          ========================================== */
          <div className="login-dropdown">

            <button className="login-btn">
              Login ▾
            </button>

            <div className="login-menu">

              <Link to="/login">
                🎓 Student Login
              </Link>

              <Link to="/teacher/login">
                👥 Management Team
              </Link>

            </div>
          </div>
        )}

      </div>
    </nav>
  );
}

