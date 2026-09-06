import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  ArrowLeft,
  Award,
  User,
  Medal,
  TrendingUp,
  Target,
  GraduationCap,
  RefreshCw,
  AlertCircle,
  Crown,
  ChevronRight,
} from "lucide-react";
import "./Leaderboard.css";

// ============================================================
// TYPES
// ============================================================

interface StudentRank {
  name: string;
  pucClass: string;
  totalScore: number;
  examsCompleted: number;
}

interface StudentData {
  name?: string;
  className?: string;
  pucClass?: string;
  standard?: string;
}

// ============================================================
// API
// ============================================================

const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api"
    : "https://exammaster-backend-up1y.onrender.com/api";

// ============================================================
// HELPERS
// ============================================================

const normalizeName = (name: string) =>
  name.trim().toLowerCase().replace(/\s+/g, " ");

// ============================================================
// COMPONENT
// ============================================================

export default function Leaderboard() {
  const [students, setStudents] = useState<StudentRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================
  // CURRENT STUDENT
  // ==========================================================

  const currentStudent = useMemo<StudentData>(() => {
    try {
      const storedStudent = localStorage.getItem("student");

      if (!storedStudent) {
        return {};
      }

      const parsed = JSON.parse(storedStudent);

      return parsed && typeof parsed === "object"
        ? parsed
        : {};
    } catch {
      return {};
    }
  }, []);

  const currentStudentName =
    currentStudent.name?.trim() || "Student";

  const studentPucClass =
    currentStudent.className ||
    currentStudent.pucClass ||
    currentStudent.standard ||
    "2nd PUC";

  // ==========================================================
  // FETCH LEADERBOARD
  // ==========================================================

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/leaderboard?pucClass=${encodeURIComponent(
          studentPucClass
        )}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Unable to load leaderboard (${response.status})`
        );
      }

      const data: unknown = await response.json();

      if (!Array.isArray(data)) {
        throw new Error(
          "Invalid leaderboard response"
        );
      }

      const cleanedData: StudentRank[] = data
        .map((student: any) => ({
          name: String(
            student?.name || "Unknown Student"
          ).trim(),
          pucClass: String(
            student?.pucClass || studentPucClass
          ),
          totalScore: Number(
            student?.totalScore || 0
          ),
          examsCompleted: Number(
            student?.examsCompleted || 0
          ),
        }))
        .sort((a, b) => {
          if (b.totalScore !== a.totalScore) {
            return b.totalScore - a.totalScore;
          }

          return (
            b.examsCompleted - a.examsCompleted
          );
        });

      setStudents(cleanedData);
    } catch (err) {
      console.error("Leaderboard error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load leaderboard. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [studentPucClass]);

  // ==========================================================
  // INITIAL FETCH
  // ==========================================================

  useEffect(() => {
    void fetchLeaderboard();
  }, [fetchLeaderboard]);

  // ==========================================================
  // RANK CALCULATIONS
  // ==========================================================

  const studentRankIndex = useMemo(
    () =>
      students.findIndex(
        (student) =>
          normalizeName(student.name) ===
          normalizeName(currentStudentName)
      ),
    [students, currentStudentName]
  );

  const myRank =
    studentRankIndex !== -1
      ? studentRankIndex + 1
      : null;

  const myData =
    studentRankIndex !== -1
      ? students[studentRankIndex]
      : {
          name: currentStudentName,
          pucClass: studentPucClass,
          totalScore: 0,
          examsCompleted: 0,
        };

  const first = students[0];
  const second = students[1];
  const third = students[2];

  const totalStudents = students.length;

  const averageScore =
    totalStudents > 0
      ? Math.round(
          students.reduce(
            (sum, student) =>
              sum + student.totalScore,
            0
          ) / totalStudents
        )
      : 0;

  const topScore = first?.totalScore || 0;

  const percentile =
    myRank && totalStudents > 0
      ? Math.max(
          1,
          Math.round(
            ((totalStudents - myRank + 1) /
              totalStudents) *
              100
          )
        )
      : 0;

  // ==========================================================
  // ERROR STATE
  // ==========================================================

  if (error) {
    return (
      <div className="leaderboard-page">
        <div
          className="leaderboard-bg-glow glow-one"
          aria-hidden="true"
        />
        <div
          className="leaderboard-bg-glow glow-two"
          aria-hidden="true"
        />

        <main
          className="leaderboard-error"
          aria-labelledby="leaderboard-error-title"
        >
          <div
            className="error-icon"
            aria-hidden="true"
          >
            <AlertCircle size={38} />
          </div>

          <h1 id="leaderboard-error-title">
            Leaderboard Unavailable
          </h1>

          <p>{error}</p>

          <div className="error-actions">
            <button
              type="button"
              className="retry-btn"
              onClick={() => void fetchLeaderboard()}
              aria-label="Try loading the leaderboard again"
            >
              <RefreshCw
                size={18}
                aria-hidden="true"
              />
              <span>Try Again</span>
            </button>

            <Link
              to="/dashboard"
              className="back-dashboard-btn"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft
                size={18}
                aria-hidden="true"
              />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div className="leaderboard-page">
      {/* ====================================================
          BACKGROUND
      ==================================================== */}

      <div
        className="leaderboard-grid"
        aria-hidden="true"
      />

      <div
        className="leaderboard-bg-glow glow-one"
        aria-hidden="true"
      />

      <div
        className="leaderboard-bg-glow glow-two"
        aria-hidden="true"
      />

      <div
        className="leaderboard-bg-glow glow-three"
        aria-hidden="true"
      />

      {/* ====================================================
          MAIN LANDMARK
      ==================================================== */}

      <main className="leaderboard-container">
        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="leaderboard-header">
          <Link
            to="/dashboard"
            className="back-btn"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft
              size={18}
              aria-hidden="true"
            />

            <span>Dashboard</span>
          </Link>

          <div className="header-center">
            <div
              className="header-icon"
              aria-hidden="true"
            >
              <Trophy size={27} />
            </div>

            <div>
              <div className="eyebrow">
                STG UNIVERSITY
              </div>

              <h1>Class Leaderboard</h1>

              <div className="class-label">
                <GraduationCap
                  size={15}
                  aria-hidden="true"
                />

                <span>{studentPucClass}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="refresh-btn"
            onClick={() => void fetchLeaderboard()}
            title="Refresh leaderboard"
            aria-label={
              loading
                ? "Refreshing leaderboard"
                : "Refresh leaderboard"
            }
            disabled={loading}
          >
            <RefreshCw
              size={18}
              aria-hidden="true"
            />
          </button>
        </header>

        {/* ==================================================
            HEADER DESCRIPTION
        ================================================== */}

        <p className="header-description">
          Measure your progress. Rise through the ranks.
          Lead your class.
        </p>

        {/* ==================================================
            LOADING STATE
        ================================================== */}

        {loading ? (
          <section
            className="leaderboard-loading"
            aria-live="polite"
            aria-busy="true"
            aria-label="Loading leaderboard"
          >
            <div
              className="loading-trophy"
              aria-hidden="true"
            >
              <Trophy size={42} />
            </div>

            <div
              className="loading-spinner"
              aria-hidden="true"
            />

            <h2>Loading Leaderboard</h2>

            <p>
              Preparing rankings for{" "}
              <strong>{studentPucClass}</strong>
            </p>
          </section>
        ) : (
          <>
            {/* ==================================================
                PERSONAL RANK HERO
            ================================================== */}

            <section
              className="my-rank-card"
              aria-labelledby="my-rank-heading"
            >
              <div
                className="rank-card-shine"
                aria-hidden="true"
              />

              <div className="my-rank-left">
                <div
                  className="student-avatar"
                  aria-hidden="true"
                >
                  <User size={26} />
                </div>

                <div className="student-details">
                  <span className="small-label">
                    YOUR CURRENT POSITION
                  </span>

                  <h2 id="my-rank-heading">
                    {myRank
                      ? `Rank #${myRank}`
                      : "Not Ranked Yet"}
                  </h2>

                  <p>
                    {currentStudentName}

                    <span
                      className="dot-separator"
                      aria-hidden="true"
                    >
                      •
                    </span>

                    {studentPucClass}
                  </p>
                </div>
              </div>

              <div className="rank-stats">
                <div className="personal-stat">
                  <div
                    className="stat-icon score-icon"
                    aria-hidden="true"
                  >
                    <Award size={19} />
                  </div>

                  <div>
                    <span>Total Score</span>
                    <strong>
                      {myData.totalScore}
                    </strong>
                  </div>
                </div>

                <div className="personal-stat">
                  <div
                    className="stat-icon exam-icon"
                    aria-hidden="true"
                  >
                    <Target size={19} />
                  </div>

                  <div>
                    <span>Exams</span>
                    <strong>
                      {myData.examsCompleted}
                    </strong>
                  </div>
                </div>

                {myRank && (
                  <div className="personal-stat">
                    <div
                      className="stat-icon rank-icon"
                      aria-hidden="true"
                    >
                      <TrendingUp size={19} />
                    </div>

                    <div>
                      <span>Top</span>
                      <strong>
                        {percentile}%
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ==================================================
                OVERVIEW STATS
            ================================================== */}

            {students.length > 0 && (
              <section
                className="overview-grid"
                aria-label="Leaderboard overview"
              >
                <div className="overview-card">
                  <div
                    className="overview-icon"
                    aria-hidden="true"
                  >
                    <User size={20} />
                  </div>

                  <div>
                    <span>Total Students</span>
                    <strong>{totalStudents}</strong>
                  </div>
                </div>

                <div className="overview-card">
                  <div
                    className="overview-icon gold"
                    aria-hidden="true"
                  >
                    <Crown size={20} />
                  </div>

                  <div>
                    <span>Highest Score</span>
                    <strong>
                      {topScore} pts
                    </strong>
                  </div>
                </div>

                <div className="overview-card">
                  <div
                    className="overview-icon green"
                    aria-hidden="true"
                  >
                    <TrendingUp size={20} />
                  </div>

                  <div>
                    <span>Class Average</span>
                    <strong>
                      {averageScore} pts
                    </strong>
                  </div>
                </div>
              </section>
            )}

            {/* ==================================================
                PODIUM
            ================================================== */}

            {students.length > 0 && (
              <section
                className="podium-section"
                aria-labelledby="podium-heading"
              >
                <div className="section-heading">
                  <div>
                    <span className="section-kicker">
                      TOP PERFORMERS
                    </span>

                    <h2 id="podium-heading">
                      Champions of the Class
                    </h2>
                  </div>

                  <div
                    className="live-badge"
                    aria-label="Live rankings"
                  >
                    <span
                      aria-hidden="true"
                    />
                    Live Rankings
                  </div>
                </div>

                <div className="podium-wrapper">
                  {/* ================================
                      2ND
                  ================================= */}

                  <div
                    className={`podium-card podium-second ${
                      second &&
                      normalizeName(second.name) ===
                        normalizeName(
                          currentStudentName
                        )
                        ? "podium-me"
                        : ""
                    }`}
                  >
                    {second ? (
                      <>
                        <div
                          className="podium-avatar silver"
                          aria-hidden="true"
                        >
                          <Medal size={30} />
                        </div>

                        <div className="place-number">
                          02
                        </div>

                        <h3>{second.name}</h3>

                        <span className="podium-exams">
                          {second.examsCompleted}{" "}
                          exams completed
                        </span>

                        <strong className="podium-points">
                          {second.totalScore}
                          <small> pts</small>
                        </strong>

                        <div
                          className="podium-platform platform-second"
                          aria-hidden="true"
                        >
                          <span>2</span>
                        </div>
                      </>
                    ) : (
                      <div className="empty-podium">
                        <Medal
                          size={28}
                          aria-hidden="true"
                        />
                        <span>2nd Place</span>
                      </div>
                    )}
                  </div>

                  {/* ================================
                      1ST
                  ================================= */}

                  <div
                    className={`podium-card podium-first ${
                      first &&
                      normalizeName(first.name) ===
                        normalizeName(
                          currentStudentName
                        )
                        ? "podium-me"
                        : ""
                    }`}
                  >
                    {first ? (
                      <>
                        <div
                          className="crown-floating"
                          aria-hidden="true"
                        >
                          <Crown size={22} />
                        </div>

                        <div
                          className="podium-avatar gold"
                          aria-hidden="true"
                        >
                          <Trophy size={35} />
                        </div>

                        <div className="place-number">
                          01
                        </div>

                        <h3>{first.name}</h3>

                        <span className="podium-exams">
                          {first.examsCompleted}{" "}
                          exams completed
                        </span>

                        <strong className="podium-points">
                          {first.totalScore}
                          <small> pts</small>
                        </strong>

                        <div
                          className="podium-platform platform-first"
                          aria-hidden="true"
                        >
                          <span>1</span>
                        </div>
                      </>
                    ) : (
                      <div className="empty-podium">
                        <Trophy
                          size={30}
                          aria-hidden="true"
                        />
                        <span>1st Place</span>
                      </div>
                    )}
                  </div>

                  {/* ================================
                      3RD
                  ================================= */}

                  <div
                    className={`podium-card podium-third ${
                      third &&
                      normalizeName(third.name) ===
                        normalizeName(
                          currentStudentName
                        )
                        ? "podium-me"
                        : ""
                    }`}
                  >
                    {third ? (
                      <>
                        <div
                          className="podium-avatar bronze"
                          aria-hidden="true"
                        >
                          <Medal size={30} />
                        </div>

                        <div className="place-number">
                          03
                        </div>

                        <h3>{third.name}</h3>

                        <span className="podium-exams">
                          {third.examsCompleted}{" "}
                          exams completed
                        </span>

                        <strong className="podium-points">
                          {third.totalScore}
                          <small> pts</small>
                        </strong>

                        <div
                          className="podium-platform platform-third"
                          aria-hidden="true"
                        >
                          <span>3</span>
                        </div>
                      </>
                    ) : (
                      <div className="empty-podium">
                        <Medal
                          size={28}
                          aria-hidden="true"
                        />
                        <span>3rd Place</span>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* ==================================================
                COMPLETE RANKINGS
            ================================================== */}

            <section
              className="rankings-section"
              aria-labelledby="rankings-heading"
            >
              <div className="section-heading ranking-heading">
                <div>
                  <span className="section-kicker">
                    CLASS STANDINGS
                  </span>

                  <h2 id="rankings-heading">
                    Complete Rankings
                  </h2>
                </div>

                <span
                  className="student-count"
                  aria-label={`${students.length} students`}
                >
                  {students.length} Students
                </span>
              </div>

              <div className="rankings-container">
                {students.length === 0 ? (
                  <div className="empty-state">
                    <div
                      className="empty-state-icon"
                      aria-hidden="true"
                    >
                      <Trophy size={35} />
                    </div>

                    <h3>No Rankings Yet</h3>

                    <p>
                      There are no leaderboard
                      results for{" "}
                      <strong>
                        {studentPucClass}
                      </strong>{" "}
                      yet.
                    </p>

                    <Link
                      to="/dashboard"
                      className="empty-action"
                      aria-label="Start learning from dashboard"
                    >
                      <span>Start Learning</span>

                      <ChevronRight
                        size={17}
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* =========================================
                        DESKTOP TABLE
                    ========================================== */}

                    <div className="desktop-table">
                      <div
                        className="table-header"
                        role="row"
                      >
                        <span>RANK</span>
                        <span>STUDENT</span>
                        <span>EXAMS</span>
                        <span>SCORE</span>
                      </div>

                      {students.map(
                        (student, index) => {
                          const actualRank =
                            index + 1;

                          const isMe =
                            normalizeName(
                              student.name
                            ) ===
                            normalizeName(
                              currentStudentName
                            );

                          return (
                            <div
                              key={`${student.name}-${index}`}
                              className={`table-row ${
                                isMe
                                  ? "highlight-my-row"
                                  : ""
                              } ${
                                actualRank <= 3
                                  ? "top-ranking-row"
                                  : ""
                              }`}
                            >
                              {/* RANK */}

                              <div className="rank-col">
                                {actualRank === 1 ? (
                                  <span className="mini-rank gold-rank">
                                    <Crown
                                      size={14}
                                      aria-hidden="true"
                                    />
                                    <span>1</span>
                                  </span>
                                ) : actualRank ===
                                  2 ? (
                                  <span className="mini-rank silver-rank">
                                    2
                                  </span>
                                ) : actualRank ===
                                  3 ? (
                                  <span className="mini-rank bronze-rank">
                                    3
                                  </span>
                                ) : (
                                  <span className="normal-rank">
                                    #{actualRank}
                                  </span>
                                )}
                              </div>

                              {/* STUDENT */}

                              <div className="name-col">
                                <div
                                  className="table-avatar"
                                  aria-hidden="true"
                                >
                                  {student.name
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>

                                <div className="name-content">
                                  <strong>
                                    {student.name}
                                  </strong>

                                  {isMe && (
                                    <span className="you-badge">
                                      YOU
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* EXAMS */}

                              <div className="exams-col">
                                <Target
                                  size={15}
                                  aria-hidden="true"
                                />

                                <span>
                                  {
                                    student.examsCompleted
                                  }
                                </span>
                              </div>

                              {/* SCORE */}

                              <div className="score-col">
                                <strong>
                                  {
                                    student.totalScore
                                  }
                                </strong>

                                <span>pts</span>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>

                    {/* =========================================
                        MOBILE RANKING
                    ========================================== */}

                    <div className="mobile-rank-list">
                      {students.map(
                        (student, index) => {
                          const actualRank =
                            index + 1;

                          const isMe =
                            normalizeName(
                              student.name
                            ) ===
                            normalizeName(
                              currentStudentName
                            );

                          return (
                            <div
                              key={`mobile-${student.name}-${index}`}
                              className={`mobile-rank-card ${
                                isMe
                                  ? "mobile-my-card"
                                  : ""
                              }`}
                            >
                              <div
                                className={`mobile-rank-number rank-${Math.min(
                                  actualRank,
                                  4
                                )}`}
                                aria-label={`Rank ${actualRank}`}
                              >
                                {actualRank}
                              </div>

                              <div
                                className="mobile-student-avatar"
                                aria-hidden="true"
                              >
                                {student.name
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div className="mobile-student-info">
                                <div className="mobile-name">
                                  <span>
                                    {student.name}
                                  </span>

                                  {isMe && (
                                    <span className="you-badge">
                                      YOU
                                    </span>
                                  )}
                                </div>

                                <div className="mobile-exam-count">
                                  {
                                    student.examsCompleted
                                  }{" "}
                                  exams
                                </div>
                              </div>

                              <div className="mobile-score">
                                <strong>
                                  {
                                    student.totalScore
                                  }
                                </strong>

                                <span>pts</span>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* ==================================================
                FOOTER MESSAGE
            ================================================== */}

            {students.length > 0 && (
              <div className="leaderboard-footer">
                <div
                  className="footer-icon"
                  aria-hidden="true"
                >
                  <Trophy size={20} />
                </div>

                <div>
                  <strong>
                    Keep pushing forward!
                  </strong>

                  <p>
                    Every exam is a chance to improve
                    your rank.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}