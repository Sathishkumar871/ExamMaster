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

  // ============================================================
  // LOAD LOGGED-IN USER
  // ============================================================

  useEffect(() => {
    const loadUser = () => {
      const student = localStorage.getItem("student");
      const teacher = localStorage.getItem("teacher");
      const staff = localStorage.getItem("staff");

      // ========================================================
      // STUDENT
      // ========================================================

      if (student) {
        try {
          const studentData = JSON.parse(student);

          setUser({
            ...studentData,
            role: "student",
          });

          return;
        } catch (error) {
          console.error("Student data parse error:", error);
        }
      }

      // ========================================================
      // TEACHER
      // ========================================================

      if (teacher) {
        try {
          const teacherData = JSON.parse(teacher);

          setUser({
            ...teacherData,
            role: teacherData.role || "teacher",
          });

          return;
        } catch (error) {
          console.error("Teacher data parse error:", error);
        }
      }

      // ========================================================
      // STAFF / MENTOR / HEAD / MANAGER
      // ========================================================

      if (staff) {
        try {
          const staffData = JSON.parse(staff);

          setUser({
            ...staffData,
            role: staffData.role || "staff",
          });

          return;
        } catch (error) {
          console.error("Staff data parse error:", error);
        }
      }

      // ========================================================
      // NO USER
      // ========================================================

      setUser(null);
    };

    loadUser();

    // ==========================================================
    // UPDATE NAVBAR WHEN LOGIN STATE CHANGES
    // ==========================================================

    const handleStorageChange = () => {
      loadUser();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // ============================================================
  // LOGOUT
  // ============================================================

  const logout = () => {
    // Remove authentication/user data
    localStorage.removeItem("student");
    localStorage.removeItem("teacher");
    localStorage.removeItem("staff");

    // Remove common auth tokens if present
    localStorage.removeItem("studentToken");
    localStorage.removeItem("teacherToken");
    localStorage.removeItem("staffToken");
    localStorage.removeItem("token");

    // Update navbar immediately
    setUser(null);

    // Redirect to login
    navigate("/login");
  };

  // ============================================================
  // DISPLAY ROLE
  // ============================================================

  const getDisplayRole = () => {
    if (!user) return "";

    // Teacher type
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

  // ============================================================
  // DASHBOARD ROUTE
  // ============================================================

  const getDashboardRoute = () => {
    if (!user) {
      return "/login";
    }

    switch (user.role) {
      case "student":
        return "/dashboard";

      case "teacher":
        return "/teacher/dashboard";

      case "mentor":
        return "/mentor/dashboard";

      case "head":
        return "/head/dashboard";

      case "manager":
        return "/manager/dashboard";

      default:
        return "/mentor/dashboard";
    }
  };

  // ============================================================
  // DAILY TEST NAVIGATION
  // ONLY STUDENT CAN ACCESS DAILY TESTS
  // ============================================================

  const handleDailyTests = () => {
    if (user?.role === "student") {
      navigate("/student/daily-test");
      return;
    }

    // If someone somehow triggers it without student login
    navigate("/login");
  };

  // ============================================================
  // IS STUDENT
  // ============================================================

  const isStudent = user?.role === "student";

  // ============================================================
  // IS LOGGED IN
  // ============================================================

  const isLoggedIn = !!user;

  return (
    <nav className="navbar">

      {/* ========================================================
          LOGO
      ======================================================== */}

      <div className="logo-section">

        <img
          src="https://res.cloudinary.com/dlkborjdl/image/upload/v1785332958/images_i0oy4a.jpg"
          alt="STG PU College"
          className="college-logo"
        />

        <div className="college-brand">

          <h2>STG PU COLLEGE</h2>

          <p>
            Smart Examination Platform
          </p>

        </div>

      </div>


      {/* ========================================================
          LEARNING ANIMATION
      ======================================================== */}

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

        <p>
          Learn • Practice • Win
        </p>

      </div>


      {/* ========================================================
          NAVIGATION
      ======================================================== */}

      <div className="nav-links">

        {/* ======================================================
            HOME
            ALWAYS VISIBLE
        ====================================================== */}

        <Link to="/">
          Home
        </Link>


        {/* ======================================================
            LOGGED-IN NAVIGATION
        ====================================================== */}

        {isLoggedIn && (
          <>

            {/* ==================================================
                DASHBOARD
            ================================================== */}

            <Link to={getDashboardRoute()}>
              Dashboard
            </Link>


            {/* ==================================================
                SUBJECTS
                ONLY LOGGED-IN USERS
            ================================================== */}

            <Link to="/subjects">
              Subjects
            </Link>


            {/* ==================================================
                DAILY TESTS
                STUDENT ONLY
            ================================================== */}

            {isStudent && (
              <button
                type="button"
                className="daily-test-nav-btn"
                onClick={handleDailyTests}
              >
                Daily Tests
              </button>
            )}

          </>
        )}


        {/* ======================================================
            USER AREA
        ====================================================== */}

        {user ? (

          <div className="user-area">

            {/* ==================================================
                USER CARD
            ================================================== */}

            <div className="user-card">

              <UserCircle size={25} />

              <div>

                <b>
                  {user.name}
                </b>

                <small>
                  {getDisplayRole()}
                </small>

              </div>

            </div>


            {/* ==================================================
                USER DROPDOWN
            ================================================== */}

            <div className="dropdown">

              {/* ================================================
                  DASHBOARD
              ================================================= */}

              <Link to={getDashboardRoute()}>

                <LayoutDashboard size={18} />

                Dashboard

              </Link>


              {/* ================================================
                  PROFILE
              ================================================= */}

              <Link to="/profile">

                <BookOpen size={18} />

                Profile

              </Link>


              {/* ================================================
                  LOGOUT
              ================================================= */}

              <button
                type="button"
                className="logout"
                onClick={logout}
              >

                <LogOut size={18} />

                Logout

              </button>

            </div>

          </div>

        ) : (

          /* ====================================================
             LOGIN DROPDOWN
          ==================================================== */

          <div className="login-dropdown">

            <button
              type="button"
              className="login-btn"
            >
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