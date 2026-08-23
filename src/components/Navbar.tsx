import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserCircle,
  LogOut,
  LayoutDashboard,
  BookOpen,
  Menu,
  X,
  ChevronDown,
  GraduationCap,
  Users,
  ShieldCheck,
  ClipboardCheck,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginMenuOpen, setLoginMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // ============================================================
  // LOAD AUTH USER
  // ============================================================

  const loadUser = () => {
    const role = localStorage.getItem("role");

    const student = localStorage.getItem("student");
    const teacher = localStorage.getItem("teacher");
    const staff = localStorage.getItem("staff");

    // ================= STUDENT =================

    if (role === "student" && student) {
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

    // ================= TEACHER / MANAGEMENT =================

    if (role === "teacher" && teacher) {
      try {
        const teacherData = JSON.parse(teacher);

        setUser({
          ...teacherData,
          role: "teacher",
        });

        return;
      } catch (error) {
        console.error("Teacher data parse error:", error);
      }
    }

    // ================= STAFF / MENTOR =================

    if (role === "staff" && staff) {
      try {
        const staffData = JSON.parse(staff);

        setUser({
          ...staffData,
          role: "staff",
        });

        return;
      } catch (error) {
        console.error("Staff data parse error:", error);
      }
    }

    // ================= HEAD =================

    if (role === "head" && staff) {
      try {
        const staffData = JSON.parse(staff);

        setUser({
          ...staffData,
          role: "head",
        });

        return;
      } catch (error) {
        console.error("Head data parse error:", error);
      }
    }

    setUser(null);
  };

  // ============================================================
  // INITIAL AUTH LOAD
  // ============================================================

  useEffect(() => {
    loadUser();

    const handleStorageChange = () => {
      loadUser();
    };

    const handleAuthChange = () => {
      loadUser();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authChanged", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authChanged", handleAuthChange);
    };
  }, []);

  // ============================================================
  // RESIZE
  // ============================================================

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // ============================================================
  // ESC KEY
  // ============================================================

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        setLoginMenuOpen(false);
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // ============================================================
  // LOGOUT
  // ============================================================

  const logout = () => {
    localStorage.removeItem("student");
    localStorage.removeItem("studentToken");

    localStorage.removeItem("teacher");
    localStorage.removeItem("teacherToken");

    localStorage.removeItem("staff");
    localStorage.removeItem("staffToken");

    localStorage.removeItem("token");
    localStorage.removeItem("role");

    setUser(null);

    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setLoginMenuOpen(false);

    window.dispatchEvent(new Event("authChanged"));

    navigate("/login");
  };

  // ============================================================
  // DISPLAY ROLE
  // ============================================================

  const getDisplayRole = () => {
    if (!user) return "";

    if (user.role === "student") {
      return "Student";
    }

    if (user.role === "teacher") {
      return "Management";
    }

    if (user.role === "staff") {
      return "Staff";
    }

    if (user.role === "head") {
      return "Director";
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

    // STUDENT
    if (user.role === "student") {
      return "/dashboard";
    }

    // MANAGEMENT
    if (user.role === "teacher") {
      return "/teacher/dashboard";
    }

    // STAFF / MENTOR
    if (user.role === "staff") {
      return "/mentor/dashboard";
    }

    // DIRECTOR
    if (user.role === "head") {
      return "/head/dashboard";
    }

    return "/login";
  };

  // ============================================================
  // DAILY TESTS
  // ============================================================

  const handleDailyTests = () => {
    setMobileMenuOpen(false);

    if (user?.role === "student") {
      navigate("/student/daily-test");
      return;
    }

    navigate("/login");
  };

  // ============================================================
  // MOBILE NAVIGATION
  // ============================================================

  const handleMobileNavigation = (path: string) => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setLoginMenuOpen(false);

    navigate(path);
  };

  // ============================================================
  // LOGIN NAVIGATION
  // ============================================================

  const handleLoginNavigation = (path: string) => {
    setLoginMenuOpen(false);
    setMobileMenuOpen(false);

    navigate(path);
  };

  // ============================================================
  // FLAGS
  // ============================================================

  const isStudent = user?.role === "student";

  const isStaff = user?.role === "staff";

  const isLoggedIn = !!user;

  // ============================================================
  // RETURN
  // ============================================================

  return (
    <nav className="navbar">

      {/* ========================================================
          BRAND
      ======================================================== */}

      <div className="logo-section">
        <Link
          to={isLoggedIn ? getDashboardRoute() : "/"}
          className="brand-link"
          onClick={() => setMobileMenuOpen(false)}
        >
          <img
            src="https://res.cloudinary.com/dlkborjdl/image/upload/v1787452197/IMG_20260823_075544_rbgexi.jpg"
            alt="STG PU College"
            className="college-logo"
          />

          <div className="college-brand">
            <h2>STG PU COLLEGE</h2>
            <p>Smart Examination Platform</p>
          </div>
        </Link>
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
        <p>Learn • Practice • Win</p>
      </div>

      {/* ========================================================
          DESKTOP NAVIGATION
      ======================================================== */}

      <div className="nav-links">

        {/* ======================================================
            LOGGED IN (SUBJECTS & DAILY TESTS ONLY)
        ====================================================== */}

        {isLoggedIn && (
          <>
           
            
            {/* DAILY TESTS */}
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
            USER DROPDOWN
        ====================================================== */}

        {user ? (
          <div
            className="user-area"
            onMouseEnter={() => setUserMenuOpen(true)}
            onMouseLeave={() => setUserMenuOpen(false)}
          >
            <button
              type="button"
              className="user-card"
              onClick={() => setUserMenuOpen((prev) => !prev)}
            >
              <UserCircle size={25} />
              <div>
                <b>{user.name}</b>
                <small>{getDisplayRole()}</small>
              </div>
              <ChevronDown
                size={16}
                className={`user-chevron ${userMenuOpen ? "rotate" : ""}`}
              />
            </button>

            {/* USER DROPDOWN */}
            <div className={`dropdown ${userMenuOpen ? "dropdown-visible" : ""}`}>
              <Link
                to={getDashboardRoute()}
                onClick={() => setUserMenuOpen(false)}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>

              
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
              onClick={() => setLoginMenuOpen((prev) => !prev)}
            >
              Login
              <ChevronDown
                size={16}
                className={loginMenuOpen ? "rotate" : ""}
              />
            </button>

            <div className={`login-menu ${loginMenuOpen ? "login-menu-visible" : ""}`}>
              {/* STUDENT */}
              <button
                type="button"
                onClick={() => handleLoginNavigation("/login")}
              >
                <span className="login-option-icon student-icon">
                  <GraduationCap size={20} />
                </span>
                <span>
                  <strong>Student Login</strong>
                  <small>Access your learning dashboard</small>
                </span>
              </button>

              {/* MANAGEMENT */}
              <button
                type="button"
                onClick={() => handleLoginNavigation("/teacher/login")}
              >
                <span className="login-option-icon management-icon">
                  <Users size={20} />
                </span>
                <span>
                  <strong>Management Login</strong>
                  <small>Teachers & management team</small>
                </span>
              </button>

              {/* STAFF */}
              <button
                type="button"
                onClick={() => handleLoginNavigation("/staff/login")}
              >
                <span className="login-option-icon staff-icon">
                  <ShieldCheck size={20} />
                </span>
                <span>
                  <strong>Staff Login</strong>
                  <small>Staff & administration access</small>
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          MOBILE MENU BUTTON
      ======================================================== */}

      <button
        type="button"
        className="mobile-menu-btn"
        onClick={() => setMobileMenuOpen((prev) => !prev)}
        aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
      >
        {mobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
      </button>

      {/* ========================================================
          MOBILE MENU
      ======================================================== */}

      <div className={`mobile-menu ${mobileMenuOpen ? "mobile-menu-open" : ""}`}>

        {/* MOBILE PROFILE */}
        <div className="mobile-menu-header">
          {user && (
            <div className="mobile-profile">
              <div className="mobile-avatar">
                <UserCircle size={26} />
              </div>
              <div>
                <strong>{user.name}</strong>
                <span>{getDisplayRole()}</span>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================
            LOGGED IN MOBILE
        ======================================================== */}

        {isLoggedIn ? (
          <div className="mobile-nav-items">
            {/* DASHBOARD */}
            <button
              type="button"
              onClick={() => handleMobileNavigation(getDashboardRoute())}
            >
              <span className="mobile-nav-icon dashboard-mobile">
                <LayoutDashboard size={20} />
              </span>
              <span className="mobile-nav-text">
                <strong>Dashboard</strong>
                <small>View your dashboard</small>
              </span>
            </button>

            {/* SUBJECTS */}
            {!isStaff && user?.role !== "head" && (
              <button
                type="button"
                onClick={() => handleMobileNavigation("/subjects")}
              >
                <span className="mobile-nav-icon subjects-mobile">
                  <BookOpen size={20} />
                </span>
                <span className="mobile-nav-text">
                  <strong>Subjects</strong>
                  <small>Explore your subjects</small>
                </span>
              </button>
            )}

            {/* DAILY TESTS */}
            {isStudent && (
              <button
                type="button"
                onClick={handleDailyTests}
              >
                <span className="mobile-nav-icon tests-mobile">
                  <ClipboardCheck size={20} />
                </span>
                <span className="mobile-nav-text">
                  <strong>Daily Tests</strong>
                  <small>Practice today's test</small>
                </span>
              </button>
            )}

            {/* PROFILE */}
            <button
              type="button"
              onClick={() => handleMobileNavigation("/profile")}
            >
              <span className="mobile-nav-icon profile-mobile">
                <UserCircle size={20} />
              </span>
              <span className="mobile-nav-text">
                <strong>Profile</strong>
                <small>Manage your account</small>
              </span>
            </button>

            {/* LOGOUT */}
            <button
              type="button"
              className="mobile-logout"
              onClick={logout}
            >
              <span className="mobile-nav-icon logout-mobile">
                <LogOut size={20} />
              </span>
              <span className="mobile-nav-text">
                <strong>Logout</strong>
                <small>Sign out securely</small>
              </span>
            </button>
          </div>
        ) : (

          /* ====================================================
              BEFORE LOGIN MOBILE
          ==================================================== */

          <div className="mobile-login-section">
            <div className="mobile-login-heading">
              <span>Welcome to STG</span>
              <h3>Choose your login</h3>
              <p>Select your account type to continue.</p>
            </div>

            {/* STUDENT */}
            <button
              type="button"
              className="mobile-login-option"
              onClick={() => handleLoginNavigation("/login")}
            >
              <span className="mobile-login-icon student-icon">
                <GraduationCap size={22} />
              </span>
              <span>
                <strong>Student Login</strong>
                <small>Learning & exam access</small>
              </span>
            </button>

            {/* MANAGEMENT */}
            <button
              type="button"
              className="mobile-login-option"
              onClick={() => handleLoginNavigation("/teacher/login")}
            >
              <span className="mobile-login-icon management-icon">
                <Users size={22} />
              </span>
              <span>
                <strong>Management Login</strong>
                <small>Teachers & management team</small>
              </span>
            </button>

            {/* STAFF */}
            <button
              type="button"
              className="mobile-login-option"
              onClick={() => handleLoginNavigation("/staff/login")}
            >
              <span className="mobile-login-icon staff-icon">
                <ShieldCheck size={22} />
              </span>
              <span>
                <strong>Staff Login</strong>
                <small>Administration & staff access</small>
              </span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}