import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  Brain,
  Star,
  Target,
  TrendingUp,
  Building2,
  Hotel,
  ClipboardList,
} from "lucide-react";

import "./AcademicEvaluation.css";

// ============================================================
// TYPES
// ============================================================

type Department =
  | "management"
  | "director"
  | "warden";

// ============================================================
// COMPONENT
// ============================================================

export default function AcademicEvaluation() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  // ==========================================================
  // STATE
  // ==========================================================

  const [ratings, setRatings] = useState<
    Record<string, number>
  >({});

  const [mentorActionPlan, setMentorActionPlan] =
    useState("");

  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);

  const [submitting, setSubmitting] =
    useState(false);

  // ==========================================================
  // QUESTIONS
  // ==========================================================

  const questions = [
    {
      title: "Attendance",

      description:
        "Regularity and classroom participation",

      icon: Target,
    },

    {
      title: "Subject Understanding",

      description:
        "Concept clarity and academic understanding",

      icon: BookOpen,
    },

    {
      title: "Exam Performance",

      description:
        "Performance in tests and examinations",

      icon: TrendingUp,
    },

    {
      title: "Homework Completion",

      description:
        "Consistency in assignments and practice",

      icon: CheckCircle2,
    },

    {
      title: "Learning Interest",

      description:
        "Curiosity, engagement and willingness to learn",

      icon: Brain,
    },
  ];

  // ==========================================================
  // RATED COUNT
  // ==========================================================

  const ratedCount =
    Object.keys(ratings).length;

  // ==========================================================
  // TOTAL SCORE
  // ==========================================================

  const totalScore = useMemo(() => {
    return Object.values(ratings).reduce(
      (sum, value) => sum + value,
      0
    );
  }, [ratings]);

  // ==========================================================
  // AVERAGE
  // ==========================================================

  const average =
    ratedCount > 0
      ? (
          totalScore / ratedCount
        ).toFixed(1)
      : "0.0";

  // ==========================================================
  // PROGRESS
  // ==========================================================

  const progress = Math.round(
    (ratedCount / questions.length) * 100
  );

  // ==========================================================
  // VALIDATION
  // ==========================================================

  const allRatingsCompleted =
    ratedCount === questions.length;

  const canProceed =
    allRatingsCompleted &&
    mentorActionPlan.trim().length > 0 &&
    selectedDepartment !== null;

  // ==========================================================
  // RATING CHANGE
  // ==========================================================

  const changeRating = (
    question: string,
    value: number
  ) => {
    setRatings((previous) => ({
      ...previous,
      [question]: value,
    }));
  };

  // ==========================================================
  // DEPARTMENT SELECT
  // ==========================================================

  const handleDepartmentSelect = (
    department: Department
  ) => {
    setSelectedDepartment(department);
  };

  // ==========================================================
  // SAVE & CONTINUE
  // ==========================================================

  const handleContinue = async () => {
    if (
      !canProceed ||
      !studentId ||
      submitting
    ) {
      return;
    }

    setSubmitting(true);

    try {
      // ======================================================
      // API BASE URL
      // ======================================================

      const API_BASE_URL =
        window.location.hostname ===
          "localhost" ||
        window.location.hostname ===
          "127.0.0.1"
          ? "http://localhost:5000/api"
          : "https://exammaster-backend-up1y.onrender.com/api";

      // ======================================================
      // AUTH TOKEN
      // ======================================================

      const token =
        localStorage.getItem("staffToken") ||
        localStorage.getItem("teacherToken");

      if (!token) {
        throw new Error(
          "Staff/Mentor authentication token not found. Please login again."
        );
      }

      // ======================================================
      // REQUEST BODY
      // ======================================================

      const payload = {
        ratings: {
          attendance:
            ratings["Attendance"] || 0,

          subjectUnderstanding:
            ratings[
              "Subject Understanding"
            ] || 0,

          examPerformance:
            ratings[
              "Exam Performance"
            ] || 0,

          homeworkCompletion:
            ratings[
              "Homework Completion"
            ] || 0,

          learningInterest:
            ratings[
              "Learning Interest"
            ] || 0,
        },

        averageRating:
          Number(average),

        mentorActionPlan:
          mentorActionPlan.trim(),

        selectedDepartment:
          selectedDepartment,
      };

      console.log(
        "Submitting academic evaluation:",
        {
          studentId,
          selectedDepartment,
        }
      );

      // ======================================================
      // BACKEND REQUEST
      // ======================================================

      const response = await fetch(
        `${API_BASE_URL}/department-feedback/mentor/${studentId}`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify(payload),
        }
      );

      // ======================================================
      // PARSE RESPONSE
      // ======================================================

      let data: any;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          `Server returned an invalid response (${response.status}).`
        );
      }

      // ======================================================
      // API ERROR
      // ======================================================

      if (
        !response.ok ||
        !data?.success
      ) {
        throw new Error(
          data?.message ||
            `Failed to save academic evaluation (${response.status}).`
        );
      }

      // ======================================================
      // SUCCESS
      // ======================================================

      console.log(
        "Academic evaluation saved successfully:",
        data
      );

      // ======================================================
      // ROUTING
      // ======================================================

      if (
        selectedDepartment ===
        "management"
      ) {
        navigate(
          `/mentor/evaluation/${studentId}/management`
        );

        return;
      }

      if (
        selectedDepartment ===
        "director"
      ) {
        navigate(
          `/mentor/evaluation/${studentId}/director`
        );

        return;
      }

      if (
        selectedDepartment ===
        "warden"
      ) {
        navigate(
          `/mentor/evaluation/${studentId}/warden`
        );

        return;
      }

    } catch (error) {
      console.error(
        "Academic evaluation save error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to save academic evaluation."
      );

    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="evaluation-page">

      {/* ======================================================
          BACKGROUND
          ====================================================== */}

      <div className="evaluation-grid" />

      <div className="evaluation-orb evaluation-orb-one" />

      <div className="evaluation-orb evaluation-orb-two" />

      <main className="evaluation-shell">

        {/* ====================================================
            HEADER
            ==================================================== */}

        <header className="evaluation-header">

          <button
            className="evaluation-back"
            onClick={() => navigate(-1)}
            type="button"
          >
            <ArrowLeft size={17} />

            Back
          </button>

          <div className="evaluation-heading">

            <div className="evaluation-title-row">

              <div className="evaluation-icon">

                <GraduationCap
                  size={23}
                />

              </div>

              <div>

                <div className="evaluation-eyebrow">

                  STUDENT ASSESSMENT

                </div>

                <h1>
                  Academic Evaluation
                </h1>

              </div>

            </div>

            <p>
              Evaluate the student's academic
              progress, consistency and learning
              engagement.
            </p>

          </div>

          <div className="student-id-card">

            <span>
              STUDENT ID
            </span>

            <strong>
              {studentId || "—"}
            </strong>

          </div>

        </header>

        {/* ====================================================
            SUMMARY
            ==================================================== */}

        <section className="evaluation-summary">

          <div className="summary-main">

            <div className="summary-icon">

              <Award size={20} />

            </div>

            <div>

              <span>
                Assessment Progress
              </span>

              <strong>

                {ratedCount}{" "}

                <small>
                  / {questions.length} completed
                </small>

              </strong>

            </div>

          </div>

          <div className="progress-area">

            <div className="progress-track">

              <div
                className="progress-fill"
                style={{
                  width:
                    `${progress}%`,
                }}
              />

            </div>

            <span>
              {progress}%
            </span>

          </div>

          <div className="summary-stat">

            <span>
              Average Rating
            </span>

            <strong>
              {average}/5
            </strong>

          </div>

        </section>

        {/* ====================================================
            SECURITY
            ==================================================== */}

        <div className="evaluation-security">

          <ShieldCheck size={16} />

          <span>

            Academic evaluation is securely
            recorded for authorized mentor access.

          </span>

        </div>

        {/* ====================================================
            QUESTIONS
            ==================================================== */}

        <section className="evaluation-list">

          {questions.map(
            (question, index) => {

              const Icon =
                question.icon;

              const currentRating =
                ratings[
                  question.title
                ] || 0;

              return (
                <article
                  key={
                    question.title
                  }
                  className={`evaluation-card ${
                    currentRating
                      ? "evaluation-card-rated"
                      : ""
                  }`}
                >

                  <div className="question-top">

                    <div className="question-number">

                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}

                    </div>

                    <div className="question-icon">

                      <Icon size={19} />

                    </div>

                    <div className="question-content">

                      <h2>
                        {question.title}
                      </h2>

                      <p>
                        {
                          question.description
                        }
                      </p>

                    </div>

                    <div
                      className={`rating-status ${
                        currentRating
                          ? "rating-status-complete"
                          : ""
                      }`}
                    >

                      {currentRating ? (
                        <>
                          <CheckCircle2
                            size={13}
                          />

                          Rated
                        </>
                      ) : (
                        "Pending"
                      )}

                    </div>

                  </div>

                  <div className="rating-area">

                    <div className="rating-label">

                      <span>

                        {currentRating
                          ? `Selected: ${currentRating}/5`
                          : "Select performance rating"}

                      </span>

                      <small>

                        1 = Needs Improvement

                        <b>
                          5 = Excellent
                        </b>

                      </small>

                    </div>

                    <div className="rating-buttons">

                      {[1, 2, 3, 4, 5].map(
                        (star) => {

                          const selected =
                            currentRating >=
                            star;

                          return (
                            <button
                              key={star}
                              type="button"
                              aria-label={`Rate ${star} out of 5`}
                              className={`rating-button ${
                                selected
                                  ? "rating-button-selected"
                                  : ""
                              }`}
                              onClick={() =>
                                changeRating(
                                  question.title,
                                  star
                                )
                              }
                            >

                              <Star
                                size={19}
                                fill={
                                  selected
                                    ? "currentColor"
                                    : "none"
                                }
                              />

                              <span>
                                {star}
                              </span>

                            </button>
                          );
                        }
                      )}

                    </div>

                  </div>

                </article>
              );
            }
          )}

        </section>

        {/* ====================================================
            MENTOR ACTION PLAN
            ==================================================== */}

        <section className="mentor-action-section">

          <div className="mentor-action-header">

            <div className="mentor-action-title">

              <div className="mentor-action-icon">

                <ClipboardList
                  size={22}
                />

              </div>

              <div>

                <div className="mentor-action-eyebrow">

                  MENTOR REVIEW

                </div>

                <h2>
                  Mentor Action Plan
                </h2>

                <p>

                  Record the mentor's recommended
                  action plan for this student.

                </p>

              </div>

            </div>

            <div className="mentor-action-badge">

              {mentorActionPlan.trim()
                ? "Completed"
                : "Required"}

            </div>

          </div>

          <div className="mentor-action-textarea-wrap">

            <textarea
              value={
                mentorActionPlan
              }
              onChange={(event) =>
                setMentorActionPlan(
                  event.target.value
                )
              }
              placeholder="Enter mentor action plan, observations, recommendations and next steps for the student..."
              rows={6}
            />

            <div className="textarea-footer">

              <span>

                {
                  mentorActionPlan.length
                }{" "}
                characters

              </span>

              <span>

                This information is stored
                in the student's feedback
                record.

              </span>

            </div>

          </div>

        </section>

        {/* ====================================================
            DEPARTMENT ROUTING
            ==================================================== */}

        <section className="department-routing-section">

          <div className="department-routing-header">

            <div>

              <div className="routing-eyebrow">
                NEXT STAGE
              </div>

              <h2>
                Select Department
              </h2>

              <p>

                Choose who should continue
                this student's assessment.

              </p>

            </div>

            <div className="routing-security">

              <ShieldCheck size={16} />

              Authorized routing

            </div>

          </div>

          <div className="department-options">

            {/* =================================================
                MANAGEMENT
                ================================================= */}

            <button
              type="button"
              className={`department-card ${
                selectedDepartment ===
                "management"
                  ? "department-card-selected"
                  : ""
              }`}
              onClick={() =>
                handleDepartmentSelect(
                  "management"
                )
              }
            >

              <div className="department-card-top">

                <div className="department-icon">

                  <Building2
                    size={25}
                  />

                </div>

                <div
                  className={`department-radio ${
                    selectedDepartment ===
                    "management"
                      ? "department-radio-selected"
                      : ""
                  }`}
                >

                  {selectedDepartment ===
                    "management" && (
                    <span />
                  )}

                </div>

              </div>

              <div className="department-content">

                <h3>
                  Management
                </h3>

                <p>

                  Overall student development,
                  management review and action
                  planning.

                </p>

              </div>

              <div className="department-card-footer">

                <span>

                  {selectedDepartment ===
                  "management"
                    ? "Selected"
                    : "Select Management"}

                </span>

                <ArrowRight
                  size={16}
                />

              </div>

            </button>


            {/* =================================================
                DIRECTOR
                ================================================= */}

            <button
              type="button"
              className={`department-card ${
                selectedDepartment ===
                "director"
                  ? "department-card-selected"
                  : ""
              }`}
              onClick={() =>
                handleDepartmentSelect(
                  "director"
                )
              }
            >

              <div className="department-card-top">

                <div className="department-icon">

                  <Building2
                    size={25}
                  />

                </div>

                <div
                  className={`department-radio ${
                    selectedDepartment ===
                    "director"
                      ? "department-radio-selected"
                      : ""
                  }`}
                >

                  {selectedDepartment ===
                    "director" && (
                    <span />
                  )}

                </div>

              </div>

              <div className="department-content">

                <h3>
                  Director
                </h3>

                <p>

                  Academic supervision,
                  institutional review and
                  student development oversight.

                </p>

              </div>

              <div className="department-card-footer">

                <span>

                  {selectedDepartment ===
                  "director"
                    ? "Selected"
                    : "Select Director"}

                </span>

                <ArrowRight
                  size={16}
                />

              </div>

            </button>


            {/* =================================================
                WARDEN
                ================================================= */}

            <button
              type="button"
              className={`department-card ${
                selectedDepartment ===
                "warden"
                  ? "department-card-selected"
                  : ""
              }`}
              onClick={() =>
                handleDepartmentSelect(
                  "warden"
                )
              }
            >

              <div className="department-card-top">

                <div className="department-icon">

                  <Hotel
                    size={25}
                  />

                </div>

                <div
                  className={`department-radio ${
                    selectedDepartment ===
                    "warden"
                      ? "department-radio-selected"
                      : ""
                  }`}
                >

                  {selectedDepartment ===
                    "warden" && (
                    <span />
                  )}

                </div>

              </div>

              <div className="department-content">

                <h3>
                  Warden
                </h3>

                <p>

                  Hostel discipline,
                  accommodation, student welfare
                  and residential support.

                </p>

              </div>

              <div className="department-card-footer">

                <span>

                  {selectedDepartment ===
                  "warden"
                    ? "Selected"
                    : "Select Warden"}

                </span>

                <ArrowRight
                  size={16}
                />

              </div>

            </button>

          </div>

        </section>

        {/* ====================================================
            FOOTER
            ==================================================== */}

        <footer className="evaluation-footer">

          <div className="footer-info">

            <div className="footer-check">

              <CheckCircle2
                size={15}
              />

            </div>

            <div>

              <strong>

                {canProceed
                  ? "Ready to continue"
                  : "Complete the assessment"}

              </strong>

              <span>

                {!allRatingsCompleted
                  ? "Complete all academic ratings."
                  : !mentorActionPlan.trim()
                  ? "Enter the mentor action plan."
                  : !selectedDepartment
                  ? "Select the next department."
                  : "All required information is ready."}

              </span>

            </div>

          </div>

          <button
            type="button"
            className="continue-button"
            disabled={
              !canProceed ||
              submitting
            }
            onClick={
              handleContinue
            }
          >

            {submitting
              ? "Saving..."
              : "Save & Continue"}

            {!submitting && (
              <ArrowRight
                size={17}
              />
            )}

          </button>

        </footer>

      </main>

    </div>
  );
}