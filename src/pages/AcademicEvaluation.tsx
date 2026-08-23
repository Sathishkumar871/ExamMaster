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
} from "lucide-react";
import "./AcademicEvaluation.css";

export default function AcademicEvaluation() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [ratings, setRatings] = useState<Record<string, number>>({});

  const questions = [
    {
      title: "Attendance",
      description: "Regularity and classroom participation",
      icon: Target,
    },
    {
      title: "Subject Understanding",
      description: "Concept clarity and academic understanding",
      icon: BookOpen,
    },
    {
      title: "Exam Performance",
      description: "Performance in tests and examinations",
      icon: TrendingUp,
    },
    {
      title: "Homework Completion",
      description: "Consistency in assignments and practice",
      icon: CheckCircle2,
    },
    {
      title: "Learning Interest",
      description: "Curiosity, engagement and willingness to learn",
      icon: Brain,
    },
  ];

  const ratedCount = Object.keys(ratings).length;

  const totalScore = useMemo(() => {
    return Object.values(ratings).reduce(
      (sum, value) => sum + value,
      0
    );
  }, [ratings]);

  const average =
    ratedCount > 0
      ? (totalScore / ratedCount).toFixed(1)
      : "0.0";

  const progress = Math.round(
    (ratedCount / questions.length) * 100
  );

  const changeRating = (
    question: string,
    value: number
  ) => {
    setRatings((previous) => ({
      ...previous,
      [question]: value,
    }));
  };

  const handleContinue = () => {
    if (ratedCount !== questions.length) return;

    navigate(
      `/mentor/evaluation/${studentId}/action`
    );
  };

  return (
    <div className="evaluation-page">

      {/* Background decoration */}
      <div className="evaluation-grid" />
      <div className="evaluation-orb evaluation-orb-one" />
      <div className="evaluation-orb evaluation-orb-two" />

      <main className="evaluation-shell">

        {/* ================= HEADER ================= */}

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
                <GraduationCap size={23} />
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
              Evaluate the student's academic progress,
              consistency and learning engagement.
            </p>

          </div>

          <div className="student-id-card">
            <span>STUDENT ID</span>
            <strong>{studentId || "—"}</strong>
          </div>

        </header>

        {/* ================= SUMMARY ================= */}

        <section className="evaluation-summary">

          <div className="summary-main">

            <div className="summary-icon">
              <Award size={20} />
            </div>

            <div>
              <span>Assessment Progress</span>

              <strong>
                {ratedCount}{" "}
                <small>/ {questions.length} completed</small>
              </strong>
            </div>

          </div>

          <div className="progress-area">

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>

            <span>{progress}%</span>

          </div>

          <div className="summary-stat">
            <span>Average Rating</span>
            <strong>{average}/5</strong>
          </div>

        </section>

        {/* ================= SECURITY ================= */}

        <div className="evaluation-security">
          <ShieldCheck size={16} />

          <span>
            Academic evaluation is securely recorded for
            authorized mentor access.
          </span>
        </div>

        {/* ================= QUESTIONS ================= */}

        <section className="evaluation-list">

          {questions.map((question, index) => {

            const Icon = question.icon;
            const currentRating =
              ratings[question.title] || 0;

            return (
              <article
                key={question.title}
                className={`evaluation-card ${
                  currentRating
                    ? "evaluation-card-rated"
                    : ""
                }`}
              >

                <div className="question-top">

                  <div className="question-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="question-icon">
                    <Icon size={19} />
                  </div>

                  <div className="question-content">

                    <h2>
                      {question.title}
                    </h2>

                    <p>
                      {question.description}
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
                        <CheckCircle2 size={13} />
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
                      <b>5 = Excellent</b>
                    </small>
                  </div>

                  <div className="rating-buttons">

                    {[1, 2, 3, 4, 5].map(
                      (star) => {

                        const selected =
                          currentRating >= star;

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

                            <span>{star}</span>
                          </button>
                        );
                      }
                    )}

                  </div>

                </div>

              </article>
            );
          })}

        </section>

        {/* ================= FOOTER ACTION ================= */}

        <footer className="evaluation-footer">

          <div className="footer-info">

            <div className="footer-check">
              <CheckCircle2 size={15} />
            </div>

            <div>
              <strong>
                Ready for the next stage?
              </strong>

              <span>
                Complete all ratings before continuing.
              </span>
            </div>

          </div>

          <button
            type="button"
            className="continue-button"
            disabled={ratedCount !== questions.length}
            onClick={handleContinue}
          >
            Continue Assessment
            <ArrowRight size={17} />
          </button>

        </footer>

      </main>
    </div>
  );
}