import { useEffect, useMemo, useState } from "react";
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
  Sparkles,
  ChevronRight,
} from "lucide-react";
import "./Leaderboard.css";

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

const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api"
    : "https://exammaster-backend-up1y.onrender.com/api";

export default function Leaderboard() {
  const [students, setStudents] = useState<StudentRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentStudent = useMemo<StudentData>(() => {
    try {
      return JSON.parse(localStorage.getItem("student") || "{}");
    } catch {
      return {};
    }
  }, []);

  const currentStudentName = currentStudent.name?.trim() || "Student";

  const studentPucClass =
    currentStudent.className ||
    currentStudent.pucClass ||
    currentStudent.standard ||
    "2nd PUC";

  const normalizeName = (name: string) =>
    name.trim().toLowerCase().replace(/\s+/g, " ");

  const fetchLeaderboard = async () => {
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
        throw new Error(`Unable to load leaderboard (${response.status})`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid leaderboard response");
      }

      const cleanedData: StudentRank[] = data
        .map((student) => ({
          name: String(student?.name || "Unknown Student"),
          pucClass: String(student?.pucClass || studentPucClass),
          totalScore: Number(student?.totalScore || 0),
          examsCompleted: Number(student?.examsCompleted || 0),
        }))
        .sort((a, b) => {
          if (b.totalScore !== a.totalScore) {
            return b.totalScore - a.totalScore;
          }

          return b.examsCompleted - a.examsCompleted;
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
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [studentPucClass]);

  const studentRankIndex = students.findIndex(
    (student) =>
      normalizeName(student.name) === normalizeName(currentStudentName)
  );

  const myRank =
    studentRankIndex !== -1 ? studentRankIndex + 1 : null;

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

  const remainingStudents = students.slice(3);

  const totalStudents = students.length;

  const averageScore =
    totalStudents > 0
      ? Math.round(
          students.reduce(
            (sum, student) => sum + student.totalScore,
            0
          ) / totalStudents
        )
      : 0;

  const topScore = first?.totalScore || 0;

  const percentile =
    myRank && totalStudents > 0
      ? Math.max(
          1,
          Math.round(((totalStudents - myRank + 1) / totalStudents) * 100)
        )
      : 0;

  if (loading) {
    return (
      <div className="leaderboard-page">
        <div className="leaderboard-bg-glow glow-one" />
        <div className="leaderboard-bg-glow glow-two" />

        <div className="leaderboard-loading">
          <div className="loading-trophy">
            <Trophy size={42} />
          </div>

          <div className="loading-spinner" />

          <h2>Loading Leaderboard</h2>
          <p>
            Preparing rankings for{" "}
            <strong>{studentPucClass}</strong>
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-page">
        <div className="leaderboard-bg-glow glow-one" />
        <div className="leaderboard-bg-glow glow-two" />

        <div className="leaderboard-error">
          <div className="error-icon">
            <AlertCircle size={38} />
          </div>

          <h2>Leaderboard Unavailable</h2>
          <p>{error}</p>

          <button
            className="retry-btn"
            onClick={fetchLeaderboard}
          >
            <RefreshCw size={18} />
            Try Again
          </button>

          <Link to="/dashboard" className="back-dashboard-btn">
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-page">
      {/* Background */}
      <div className="leaderboard-grid" />
      <div className="leaderboard-bg-glow glow-one" />
      <div className="leaderboard-bg-glow glow-two" />
      <div className="leaderboard-bg-glow glow-three" />

      <div className="leaderboard-container">
        {/* =====================================================
            HEADER
        ===================================================== */}
        <header className="leaderboard-header">
          <Link to="/dashboard" className="back-btn">
            <ArrowLeft size={18} />
            <span>Dashboard</span>
          </Link>

          <div className="header-center">
            <div className="header-icon">
              <Trophy size={27} />
            </div>

            <div>
              <div className="eyebrow">
               
                STG UNIVERSITY
              </div>

              <h1>Class Leaderboard</h1>

              <div className="class-label">
                <GraduationCap size={15} />
                {studentPucClass}
              </div>
            </div>
          </div>

          <button
            className="refresh-btn"
            onClick={fetchLeaderboard}
            title="Refresh leaderboard"
          >
            <RefreshCw size={18} />
          </button>
        </header>

        <p className="header-description">
          Measure your progress. Rise through the ranks. Lead your class.
        </p>

        {/* =====================================================
            PERSONAL RANK HERO
        ===================================================== */}
        <section className="my-rank-card">
          <div className="rank-card-shine" />

          <div className="my-rank-left">
            <div className="student-avatar">
              <User size={26} />
            </div>

            <div className="student-details">
              <span className="small-label">YOUR CURRENT POSITION</span>

              <h2>
                {myRank ? `Rank #${myRank}` : "Not Ranked Yet"}
              </h2>

              <p>
                {currentStudentName}
                <span className="dot-separator">•</span>
                {studentPucClass}
              </p>
            </div>
          </div>

          <div className="rank-stats">
            <div className="personal-stat">
              <div className="stat-icon score-icon">
                <Award size={19} />
              </div>

              <div>
                <span>Total Score</span>
                <strong>{myData.totalScore}</strong>
              </div>
            </div>

            <div className="personal-stat">
              <div className="stat-icon exam-icon">
                <Target size={19} />
              </div>

              <div>
                <span>Exams</span>
                <strong>{myData.examsCompleted}</strong>
              </div>
            </div>

            {myRank && (
              <div className="personal-stat">
                <div className="stat-icon rank-icon">
                  <TrendingUp size={19} />
                </div>

                <div>
                  <span>Top</span>
                  <strong>{percentile}%</strong>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            OVERVIEW STATS
        ===================================================== */}
        {students.length > 0 && (
          <section className="overview-grid">
            <div className="overview-card">
              <div className="overview-icon">
                <User size={20} />
              </div>

              <div>
                <span>Total Students</span>
                <strong>{totalStudents}</strong>
              </div>
            </div>

            <div className="overview-card">
              <div className="overview-icon gold">
                <Crown size={20} />
              </div>

              <div>
                <span>Highest Score</span>
                <strong>{topScore} pts</strong>
              </div>
            </div>

            <div className="overview-card">
              <div className="overview-icon green">
                <TrendingUp size={20} />
              </div>

              <div>
                <span>Class Average</span>
                <strong>{averageScore} pts</strong>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================
            PODIUM
        ===================================================== */}
        {students.length > 0 && (
          <section className="podium-section">
            <div className="section-heading">
              <div>
                <span className="section-kicker">TOP PERFORMERS</span>
                <h2>Champions of the Class</h2>
              </div>

              <div className="live-badge">
                <span />
                Live Rankings
              </div>
            </div>

            <div className="podium-wrapper">
              {/* 2ND */}
              <div
                className={`podium-card podium-second ${
                  second &&
                  normalizeName(second.name) ===
                    normalizeName(currentStudentName)
                    ? "podium-me"
                    : ""
                }`}
              >
                {second ? (
                  <>
                    <div className="podium-avatar silver">
                      <Medal size={30} />
                    </div>

                    <div className="place-number">02</div>

                    <h3>{second.name}</h3>

                    <span className="podium-exams">
                      {second.examsCompleted} exams completed
                    </span>

                    <strong className="podium-points">
                      {second.totalScore}
                      <small> pts</small>
                    </strong>

                    <div className="podium-platform platform-second">
                      <span>2</span>
                    </div>
                  </>
                ) : (
                  <div className="empty-podium">
                    <Medal size={28} />
                    <span>2nd Place</span>
                  </div>
                )}
              </div>

              {/* 1ST */}
              <div
                className={`podium-card podium-first ${
                  first &&
                  normalizeName(first.name) ===
                    normalizeName(currentStudentName)
                    ? "podium-me"
                    : ""
                }`}
              >
                {first ? (
                  <>
                    <div className="crown-floating">
                      <Crown size={22} />
                    </div>

                    <div className="podium-avatar gold">
                      <Trophy size={35} />
                    </div>

                    <div className="place-number">01</div>

                    <h3>{first.name}</h3>

                    <span className="podium-exams">
                      {first.examsCompleted} exams completed
                    </span>

                    <strong className="podium-points">
                      {first.totalScore}
                      <small> pts</small>
                    </strong>

                    <div className="podium-platform platform-first">
                      <span>1</span>
                    </div>
                  </>
                ) : (
                  <div className="empty-podium">
                    <Trophy size={30} />
                    <span>1st Place</span>
                  </div>
                )}
              </div>

              {/* 3RD */}
              <div
                className={`podium-card podium-third ${
                  third &&
                  normalizeName(third.name) ===
                    normalizeName(currentStudentName)
                    ? "podium-me"
                    : ""
                }`}
              >
                {third ? (
                  <>
                    <div className="podium-avatar bronze">
                      <Medal size={30} />
                    </div>

                    <div className="place-number">03</div>

                    <h3>{third.name}</h3>

                    <span className="podium-exams">
                      {third.examsCompleted} exams completed
                    </span>

                    <strong className="podium-points">
                      {third.totalScore}
                      <small> pts</small>
                    </strong>

                    <div className="podium-platform platform-third">
                      <span>3</span>
                    </div>
                  </>
                ) : (
                  <div className="empty-podium">
                    <Medal size={28} />
                    <span>3rd Place</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* =====================================================
            RANKINGS
        ===================================================== */}
        <section className="rankings-section">
          <div className="section-heading ranking-heading">
            <div>
              <span className="section-kicker">CLASS STANDINGS</span>
              <h2>Complete Rankings</h2>
            </div>

            <span className="student-count">
              {students.length} Students
            </span>
          </div>

          <div className="rankings-container">
            {students.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Trophy size={35} />
                </div>

                <h3>No Rankings Yet</h3>

                <p>
                  There are no leaderboard results for{" "}
                  <strong>{studentPucClass}</strong> yet.
                </p>

                <Link to="/dashboard" className="empty-action">
                  Start Learning
                  <ChevronRight size={17} />
                </Link>
              </div>
            ) : (
              <>
                <div className="desktop-table">
                  <div className="table-header">
                    <span>RANK</span>
                    <span>STUDENT</span>
                    <span>EXAMS</span>
                    <span>SCORE</span>
                  </div>

                  {students.map((student, index) => {
                    const actualRank = index + 1;

                    const isMe =
                      normalizeName(student.name) ===
                      normalizeName(currentStudentName);

                    return (
                      <div
                        key={`${student.name}-${index}`}
                        className={`table-row ${
                          isMe ? "highlight-my-row" : ""
                        } ${
                          actualRank <= 3
                            ? "top-ranking-row"
                            : ""
                        }`}
                      >
                        <div className="rank-col">
                          {actualRank === 1 ? (
                            <span className="mini-rank gold-rank">
                              <Crown size={14} />
                              1
                            </span>
                          ) : actualRank === 2 ? (
                            <span className="mini-rank silver-rank">
                              2
                            </span>
                          ) : actualRank === 3 ? (
                            <span className="mini-rank bronze-rank">
                              3
                            </span>
                          ) : (
                            <span className="normal-rank">
                              #{actualRank}
                            </span>
                          )}
                        </div>

                        <div className="name-col">
                          <div className="table-avatar">
                            {student.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="name-content">
                            <strong>{student.name}</strong>

                            {isMe && (
                              <span className="you-badge">
                                YOU
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="exams-col">
                          <Target size={15} />
                          {student.examsCompleted}
                        </div>

                        <div className="score-col">
                          <strong>
                            {student.totalScore}
                          </strong>
                          <span>pts</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* MOBILE RANKING */}
                <div className="mobile-rank-list">
                  {students.map((student, index) => {
                    const actualRank = index + 1;

                    const isMe =
                      normalizeName(student.name) ===
                      normalizeName(currentStudentName);

                    return (
                      <div
                        key={`mobile-${student.name}-${index}`}
                        className={`mobile-rank-card ${
                          isMe ? "mobile-my-card" : ""
                        }`}
                      >
                        <div
                          className={`mobile-rank-number rank-${actualRank}`}
                        >
                          {actualRank}
                        </div>

                        <div className="mobile-student-avatar">
                          {student.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="mobile-student-info">
                          <div className="mobile-name">
                            {student.name}

                            {isMe && (
                              <span className="you-badge">
                                YOU
                              </span>
                            )}
                          </div>

                          <div className="mobile-exam-count">
                            {student.examsCompleted} exams
                          </div>
                        </div>

                        <div className="mobile-score">
                          <strong>
                            {student.totalScore}
                          </strong>
                          <span>pts</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>

        {/* =====================================================
            FOOTER MESSAGE
        ===================================================== */}
        {students.length > 0 && (
          <div className="leaderboard-footer">
            <div className="footer-icon">
              <Trophy size={20} />
            </div>

            <div>
              <strong>Keep pushing forward!</strong>
              <p>
                Every exam is a chance to improve your rank.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}