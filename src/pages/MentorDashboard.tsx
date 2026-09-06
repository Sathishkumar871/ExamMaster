
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  ArrowRight,
  BookOpen,
  FileText,
  GraduationCap,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import StudentReport from "../components/StudentReport/StudentReport";

import "./MentorDashboard.css";

// ============================================================
// API
// ============================================================

const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://exammaster-backend-up1y.onrender.com";

// ============================================================
// TYPES
// ============================================================

interface Student {
  studentId: string;
  name: string;
  className: string;
  section: string;
  classId?: string;
}

interface MentorData {
  name?: string;
  section?: string;
  email?: string;
}

// ============================================================
// COMPONENT
// ============================================================

export default function MentorDashboard() {
  const navigate = useNavigate();

  // ==========================================================
  // STATES
  // ==========================================================

  const [students, setStudents] =
    useState<Student[]>([]);

  const [mentor, setMentor] =
    useState<MentorData>({});

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==========================================================
  // REPORT
  // ==========================================================

  const [showStudentReport, setShowStudentReport] =
    useState(false);

  // ==========================================================
  // TOKEN
  // ==========================================================

  const token =
    localStorage.getItem(
      "staffToken"
    ) || "";

  // ==========================================================
  // GET STUDENTS
  // ==========================================================

  const getStudents = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        setError(
          "Staff login required."
        );

        return;
      }

      const response =
        await axios.get(
          `${API_BASE_URL}/api/mentor/dashboard`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      console.log(
        "Mentor Dashboard Response:",
        response.data
      );

      const mentorData =
        response.data?.mentor ||
        {};

      const studentData =
        Array.isArray(
          response.data?.students
        )
          ? response.data.students
          : [];

      // ========================================================
      // SORT STUDENTS
      // ========================================================

      const sortedStudents =
        [...studentData].sort(
          (
            a: Student,
            b: Student
          ) =>
            (a.name || "")
              .localeCompare(
                b.name || ""
              )
        );

      setMentor(
        mentorData
      );

      setStudents(
        sortedStudents
      );
    } catch (
      error: any
    ) {
      console.error(
        "Mentor Dashboard Error:",
        error?.response
          ?.data ||
          error?.message
      );

      setError(
        error?.response
          ?.data
          ?.message ||
          "Unable to load students."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // INITIAL FETCH
  // ==========================================================

  useEffect(() => {
    getStudents();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredStudents =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return students;
      }

      return students.filter(
        (student) =>
          student.name
            ?.toLowerCase()
            .includes(value) ||
          student.studentId
            ?.toLowerCase()
            .includes(value) ||
          student.className
            ?.toLowerCase()
            .includes(value)
      );
    }, [
      students,
      search,
    ]);

  // ==========================================================
  // INITIALS
  // ==========================================================

  const getInitials = (
    name: string
  ) => {
    if (!name) {
      return "ST";
    }

    const parts =
      name
        .trim()
        .split(
          /\s+/
        );

    if (
      parts.length === 1
    ) {
      return parts[0]
        .slice(
          0,
          2
        )
        .toUpperCase();
    }

    return `${parts[0][0]}${
      parts[
        parts.length - 1
      ][0]
    }`.toUpperCase();
  };

  // ==========================================================
  // GREETING NAME
  // ==========================================================

  const mentorName =
    mentor.name?.trim() ||
    "Mentor";

  // ==========================================================
  // OPEN REPORT
  // ==========================================================

  const handleOpenStudentReport =
    () => {
      if (
        students.length ===
        0
      ) {
        return;
      }

      setShowStudentReport(
        true
      );
    };

  // ==========================================================
  // RETURN
  // ==========================================================

  return (
    <div className="mentor-dashboard-page">

      {/* =====================================================
          BACKGROUND EFFECTS
      ===================================================== */}

      <div className="mentor-bg-glow mentor-bg-glow-one" />

      <div className="mentor-bg-glow mentor-bg-glow-two" />

      <div className="mentor-container">

        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="mentor-header">

          <div className="mentor-header-left">

            <div className="mentor-brand-icon">
              <GraduationCap size={22} />
            </div>

            <div className="mentor-heading">

              <span>
                EXAMMASTER • MENTOR
              </span>

              <h1>
                Welcome back,{" "}
                {mentorName}
              </h1>

              <p>
                Manage and monitor your
                section students from one place.
              </p>

            </div>

          </div>

          <button
            type="button"
            className="mentor-refresh-btn"
            onClick={
              getStudents
            }
            disabled={
              loading
            }
          >

            <RefreshCw
              size={16}
              className={
                loading
                  ? "mentor-refresh-spin"
                  : ""
              }
            />

            <span>
              {loading
                ? "Refreshing"
                : "Refresh"}
            </span>

          </button>

        </header>

        {/* ===================================================
            OVERVIEW
        =================================================== */}

        <section className="mentor-overview-grid">

          {/* ==================================================
              TOTAL STUDENTS
          ================================================== */}

          <div className="mentor-stat-card mentor-total-students-card">

            <div className="mentor-stat-icon students">
              <Users size={19} />
            </div>

            <div className="mentor-stat-content">

              <span>
                Total Students
              </span>

              <strong>
                {students.length}
              </strong>

              {/* ==================================================
                  REPORT BUTTON
              ================================================== */}

              <button
                type="button"
                className="mentor-total-students-btn"
                onClick={
                  handleOpenStudentReport
                }
                disabled={
                  students.length ===
                  0
                }
              >

                <FileText
                  size={13}
                />

                <span>
                  Total Students Data
                </span>

              </button>

            </div>

          </div>

          {/* ==================================================
              SECTION
          ================================================== */}

          <div className="mentor-stat-card">

            <div className="mentor-stat-icon section">

              <BookOpen
                size={19}
              />

            </div>

            <div>

              <span>
                Section
              </span>

              <strong>
                {
                  mentor.section ||
                  "N/A"
                }
              </strong>

            </div>

          </div>

          {/* ==================================================
              SHOWING
          ================================================== */}

          <div className="mentor-stat-card">

            <div className="mentor-stat-icon visible">

              <Search
                size={19}
              />

            </div>

            <div>

              <span>
                Showing
              </span>

              <strong>
                {
                  filteredStudents.length
                }
              </strong>

            </div>

          </div>

        </section>

        {/* ===================================================
            SEARCH PANEL
        =================================================== */}

        <section className="mentor-control-card">

          <div className="mentor-control-heading">

            <div>

              <span>
                STUDENT DIRECTORY
              </span>

              <h2>
                My Section Students
              </h2>

            </div>

            <div className="mentor-section-pill">

              Section{" "}

              {
                mentor.section ||
                "N/A"
              }

            </div>

          </div>

          <div className="mentor-search-wrapper">

            <Search
              size={18}
            />

            <input
              type="text"
              placeholder="Search by student name, ID or class..."
              value={search}
              onChange={(
                e
              ) =>
                setSearch(
                  e.target.value
                )
              }
              autoComplete="off"
            />

            {search && (
              <button
                type="button"
                className="mentor-search-clear"
                onClick={() =>
                  setSearch("")
                }
                aria-label="Clear search"
              >
                ×
              </button>
            )}

          </div>

        </section>

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (

          <section className="mentor-error-card">

            <strong>
              Unable to load students
            </strong>

            <p>
              {error}
            </p>

            <button
              type="button"
              onClick={
                getStudents
              }
            >
              Try Again
            </button>

          </section>

        )}

        {/* ===================================================
            STUDENT GRID
        =================================================== */}

        {!error && (

          <section className="mentor-student-section">

            <div className="mentor-grid-header">

              <div>

                <span>
                  STUDENT DIRECTORY
                </span>

                <h2>
                  Students
                </h2>

              </div>

              <p>

                {
                  filteredStudents.length
                }{" "}

                student

                {
                  filteredStudents.length !==
                  1
                    ? "s"
                    : ""
                }

              </p>

            </div>

            {/* =================================================
                LOADING
            ================================================= */}

            {loading &&
            students.length ===
              0 ? (

              <div className="mentor-loading-grid">

                {[
                  1,
                  2,
                  3,
                  4,
                ].map(
                  (
                    item
                  ) => (

                    <div
                      key={
                        item
                      }
                      className="mentor-skeleton-card"
                    >

                      <div className="mentor-skeleton-avatar" />

                      <div className="mentor-skeleton-lines">

                        <span />
                        <span />
                        <span />

                      </div>

                    </div>

                  )
                )}

              </div>

            ) : filteredStudents.length ===
              0 ? (

              /* =================================================
                 EMPTY
              ================================================= */

              <div className="mentor-empty-state">

                <div className="mentor-empty-icon">

                  <Search
                    size={25}
                  />

                </div>

                <h3>
                  No students found
                </h3>

                <p>

                  {search
                    ? `No student matches "${search}".`
                    : "There are no students available in this section yet."}

                </p>

                {search && (

                  <button
                    type="button"
                    onClick={() =>
                      setSearch(
                        ""
                      )
                    }
                  >
                    Clear Search
                  </button>

                )}

              </div>

            ) : (

              /* =================================================
                 STUDENT CARDS
              ================================================= */

              <div className="mentor-student-grid">

                {filteredStudents.map(
                  (
                    student,
                    index
                  ) => (

                    <article
                      key={
                        student.studentId ||
                        `${student.name}-${index}`
                      }
                      className="mentor-student-card"
                      onClick={() =>
                        navigate(
                          `/mentor/student/${student.studentId}`
                        )
                      }
                    >

                      {/* CARD TOP */}

                      <div className="mentor-card-top">

                        <div className="mentor-student-avatar">

                          {
                            getInitials(
                              student.name
                            )
                          }

                        </div>

                        <span className="mentor-card-number">

                          {String(
                            index +
                              1
                          ).padStart(
                            2,
                            "0"
                          )}

                        </span>

                      </div>

                      {/* STUDENT INFO */}

                      <div className="mentor-student-info">

                        <h3>

                          {
                            student.name ||
                            "Student"
                          }

                        </h3>

                        <p>
                          Student Profile
                        </p>

                      </div>

                      {/* DETAILS */}

                      <div className="mentor-student-details">

                        <div>

                          <span>
                            STUDENT ID
                          </span>

                          <strong>

                            {
                              student.studentId ||
                              "N/A"
                            }

                          </strong>

                        </div>

                        <div>

                          <span>
                            CLASS
                          </span>

                          <strong>

                            {
                              student.className ||
                              "N/A"
                            }

                          </strong>

                        </div>

                        <div>

                          <span>
                            SECTION
                          </span>

                          <strong>

                            {
                              student.section ||
                              mentor.section ||
                              "N/A"
                            }

                          </strong>

                        </div>

                      </div>

                      {/* PROFILE */}

                      <div className="mentor-view-profile">

                        <span>
                          View Student Profile
                        </span>

                        <div className="mentor-arrow">

                          <ArrowRight
                            size={16}
                          />

                        </div>

                      </div>

                    </article>

                  )
                )}

              </div>

            )}

          </section>

        )}

      </div>

      {/* =====================================================
          REUSABLE STUDENT REPORT
      ===================================================== */}

      <StudentReport
        students={
          students
        }
        owner={
          mentor
        }
        apiBaseUrl={
          API_BASE_URL
        }
        open={
          showStudentReport
        }
        onOpenChange={
          setShowStudentReport
        }
        title="Mentor Section Performance Report"
      />

    </div>
  );
}

