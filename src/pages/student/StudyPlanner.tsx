import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Loader2,
  Target,
  AlertTriangle,
  Brain,
  
  Flame,
  ChevronRight,
  RefreshCw,
  GraduationCap,
  
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./StudyPlanner.css";

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

interface WeakTopic {
  id: number | string;
  topic: string;
  subject: string;
  accuracy: string | number;
  priority: "High Priority" | "Medium Priority" | "Low Priority";
}

interface StudyPlanItem {
  id: number | string;
  subject: string;
  hours: number;
  completed: boolean;
}

interface DailyScheduleItem {
  id: string | number;
  date?: string;
  startTime: string;
  endTime: string;
  subject: string;
  topic?: string;
  task: string;
  duration: number;
  priority?: "High" | "Medium" | "Low";
  completed: boolean;
}

interface PerformanceResponse {
  success: boolean;
  weakTopics?: WeakTopic[];
  recommendedStudyPlan?: StudyPlanItem[];
  dailySchedule?: DailyScheduleItem[];
  message?: string;
}

// ============================================================
// HELPERS
// ============================================================

const getStudentId = (): string => {
  const directKeys = [
    "studentId",
    "studentID",
    "student_id",
  ];

  for (const key of directKeys) {
    const value = localStorage.getItem(key);

    if (
      value &&
      value !== "null" &&
      value !== "undefined"
    ) {
      return value;
    }
  }

  const objectKeys = [
    "student",
    "studentData",
    "studentInfo",
    "user",
    "userData",
  ];

  for (const key of objectKeys) {
    const raw = localStorage.getItem(key);

    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);

      const id =
        parsed?.studentId ||
        parsed?.studentID ||
        parsed?.student_id ||
        parsed?.userId ||
        parsed?.userID ||
        parsed?._id;

      if (id) {
        return String(id);
      }
    } catch {
      // Ignore invalid JSON
    }
  }

  return "";
};

const getToken = (): string => {
  return (
    localStorage.getItem("studentToken") ||
    localStorage.getItem("token") ||
    ""
  );
};

const getAccuracy = (value: string | number): number => {
  if (typeof value === "number") {
    return Math.max(0, Math.min(100, value));
  }

  const parsed = parseFloat(
    String(value).replace("%", "")
  );

  return Math.max(
    0,
    Math.min(100, Number.isFinite(parsed) ? parsed : 0)
  );
};

const formatTime = (time: string): string => {
  const [hourString, minuteString] = time.split(":");

  let hour = Number(hourString);
  const minute = Number(minuteString);

  const suffix = hour >= 12 ? "PM" : "AM";

  hour = hour % 12 || 12;

  return `${String(hour).padStart(2, "0")}:${String(
    minute
  ).padStart(2, "0")} ${suffix}`;
};

const todayKey = (): string => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(
    2,
    "0"
  );
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getDayName = (): string => {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
  }).format(new Date());
};

const getGreeting = (): string => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";

  return "Good night";
};

// ============================================================
// FALLBACK SCHEDULE GENERATOR
// ============================================================

const generateSchedule = (
  weakTopics: WeakTopic[],
  studyPlan: StudyPlanItem[]
): DailyScheduleItem[] => {
  const result: DailyScheduleItem[] = [];

  const prioritySubjects = [...weakTopics]
    .sort(
      (a, b) =>
        getAccuracy(a.accuracy) -
        getAccuracy(b.accuracy)
    )
    .map((item) => item.subject);

  const uniqueSubjects = Array.from(
    new Set(prioritySubjects)
  );

  const subjects =
    uniqueSubjects.length > 0
      ? uniqueSubjects
      : studyPlan.map((item) => item.subject);

  if (subjects.length === 0) {
    return [];
  }

  const subjectTimes = [
    {
      start: "06:00",
      end: "07:00",
      duration: 60,
    },
    {
      start: "07:00",
      end: "07:30",
      duration: 30,
    },
    {
      start: "18:00",
      end: "19:00",
      duration: 60,
    },
    {
      start: "19:00",
      end: "19:30",
      duration: 30,
    },
    {
      start: "21:00",
      end: "21:30",
      duration: 30,
    },
  ];

  subjects.slice(0, subjectTimes.length).forEach(
    (subject, index) => {
      const weak = weakTopics.find(
        (item) =>
          item.subject.toLowerCase() ===
          subject.toLowerCase()
      );

      const accuracy = weak
        ? getAccuracy(weak.accuracy)
        : 70;

      const isHighPriority = accuracy < 50;

      result.push({
        id: `fallback-${index}-${subject}`,
        date: todayKey(),
        startTime: subjectTimes[index].start,
        endTime: subjectTimes[index].end,
        subject,
        topic: weak?.topic || "Revision",
        task:
          index % 2 === 0
            ? "Concept Revision"
            : "Practice Questions",
        duration: subjectTimes[index].duration,
        priority: isHighPriority
          ? "High"
          : accuracy < 70
          ? "Medium"
          : "Low",
        completed: false,
      });
    }
  );

  return result;
};

// ============================================================
// COMPONENT
// ============================================================

export default function StudyPlanner() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [weakTopics, setWeakTopics] = useState<
    WeakTopic[]
  >([]);

  const [studyPlan, setStudyPlan] = useState<
    StudyPlanItem[]
  >([]);

  const [dailySchedule, setDailySchedule] = useState<
    DailyScheduleItem[]
  >([]);

  // ============================================================
  // FETCH
  // ============================================================

  const fetchStudyPlan = async (
    isRefresh = false
  ) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const studentId = getStudentId();
      const token = getToken();

      if (!studentId) {
        throw new Error(
          "Student ID not found. Please login again."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/api/results/performance/${encodeURIComponent(
          studentId
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      let data: PerformanceResponse;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Invalid response received from server."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load your study plan."
        );
      }

      const topics = Array.isArray(data.weakTopics)
        ? data.weakTopics
        : [];

      const plans = Array.isArray(
        data.recommendedStudyPlan
      )
        ? data.recommendedStudyPlan
        : [];

      setWeakTopics(topics);
      setStudyPlan(plans);

      // --------------------------------------------------------
      // USE BACKEND SCHEDULE IF AVAILABLE
      // --------------------------------------------------------

      if (
        Array.isArray(data.dailySchedule) &&
        data.dailySchedule.length > 0
      ) {
        setDailySchedule(data.dailySchedule);
      } else {
        // ------------------------------------------------------
        // FALLBACK
        // ------------------------------------------------------

        setDailySchedule(
          generateSchedule(topics, plans)
        );
      }
    } catch (err: any) {
      console.error(
        "STUDY PLANNER ERROR:",
        err
      );

      setError(
        err?.message ||
          "Unable to load your study plan."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchStudyPlan();
  }, []);

  // ============================================================
  // SUMMARY
  // ============================================================

  const totalHours = useMemo(() => {
    return studyPlan.reduce(
      (total, item) =>
        total + Number(item.hours || 0),
      0
    );
  }, [studyPlan]);

  const highPriorityCount = useMemo(() => {
    return weakTopics.filter(
      (item) =>
        item.priority === "High Priority"
    ).length;
  }, [weakTopics]);

  const completedCount = useMemo(() => {
    return dailySchedule.filter(
      (item) => item.completed
    ).length;
  }, [dailySchedule]);

  const completionPercentage = useMemo(() => {
    if (dailySchedule.length === 0) return 0;

    return Math.round(
      (completedCount / dailySchedule.length) *
        100
    );
  }, [dailySchedule, completedCount]);

  // ============================================================
  // TOP WEAK SUBJECT
  // ============================================================

  const weakestSubject = useMemo(() => {
    if (weakTopics.length === 0) return null;

    return [...weakTopics].sort(
      (a, b) =>
        getAccuracy(a.accuracy) -
        getAccuracy(b.accuracy)
    )[0];
  }, [weakTopics]);

  // ============================================================
  // TOGGLE
  // ============================================================

  const toggleScheduleItem = (
    id: string | number
  ) => {
    setDailySchedule((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              completed: !item.completed,
            }
          : item
      )
    );
  };

  // ============================================================
  // BACK
  // ============================================================

  const goBack = () => {
    navigate("/academic-help");
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="study-planner-page">
        <div className="planner-loading">
          <div className="planner-loading-icon">
            <Loader2
              size={32}
              className="planner-spinner"
            />
          </div>

          <h2>
            Building your study plan
          </h2>

          <p>
            ExamMaster is analyzing your
            previous exam performance...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div className="study-planner-page">
        <div className="planner-error-page">
          <div className="planner-error-icon">
            <AlertTriangle size={30} />
          </div>

          <h2>
            Study plan unavailable
          </h2>

          <p>{error}</p>

          <div className="planner-error-actions">
            <button
              type="button"
              onClick={() =>
                fetchStudyPlan()
              }
            >
              <RefreshCw size={17} />
              Try Again
            </button>

            <button
              type="button"
              className="secondary"
              onClick={goBack}
            >
              <ArrowLeft size={17} />
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN
  // ============================================================

  return (
    <div className="study-planner-page">
      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div className="planner-bg-orb orb-one" />
      <div className="planner-bg-orb orb-two" />

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="planner-header">
        <div className="planner-header-inner">
          <button
            type="button"
            className="planner-back"
            onClick={goBack}
          >
            <ArrowLeft size={18} />
            <span>Academic Help</span>
          </button>

          <button
            type="button"
            className="planner-refresh"
            onClick={() =>
              fetchStudyPlan(true)
            }
            disabled={refreshing}
            title="Refresh study plan"
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "planner-refresh-spin"
                  : ""
              }
            />

            <span>Refresh</span>
          </button>
        </div>
      </header>

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="planner-hero">
        <div className="planner-hero-inner">
          <div className="planner-eyebrow">
            
            PERSONALIZED AI STUDY PLANNER
          </div>

          <h1>
            {getGreeting()}.
            <br />
            <span>
              Let's improve your results.
            </span>
          </h1>

          <p>
            Your study schedule is based on
            your previous exam performance,
            weak subjects and priority areas.
          </p>

          <div className="planner-date">
            <CalendarDays size={16} />
            {getDayName()} •{" "}
            {new Date().toLocaleDateString(
              "en-IN",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
              }
            )}
          </div>
        </div>
      </section>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <main className="planner-content">
        {/* ====================================================
            PERFORMANCE OVERVIEW
        ==================================================== */}

        <section className="planner-overview">
          <div className="overview-card">
            <div className="overview-icon">
              <BookOpen size={21} />
            </div>

            <div>
              <span>Weak Areas</span>
              <strong>
                {weakTopics.length}
              </strong>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-icon">
              <Clock3 size={21} />
            </div>

            <div>
              <span>Study Target</span>
              <strong>
                {totalHours} hrs
              </strong>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-icon">
              <Flame size={21} />
            </div>

            <div>
              <span>High Priority</span>
              <strong>
                {highPriorityCount}
              </strong>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-icon">
              <CheckCircle2 size={21} />
            </div>

            <div>
              <span>Today's Progress</span>
              <strong>
                {completionPercentage}%
              </strong>
            </div>
          </div>
        </section>

        {/* ====================================================
            FOCUS CARD
        ==================================================== */}

        {weakestSubject && (
          <section className="focus-card">
            <div className="focus-left">
              <div className="focus-icon">
                <Target size={24} />
              </div>

              <div>
                <span>
                  YOUR BIGGEST FOCUS AREA
                </span>

                <h2>
                  {weakestSubject.subject}
                </h2>

                <p>
                  {weakestSubject.topic}
                </p>
              </div>
            </div>

            <div className="focus-score">
              <strong>
                {weakestSubject.accuracy}
              </strong>

              <span>Accuracy</span>
            </div>
          </section>
        )}

        {/* ====================================================
            MAIN GRID
        ==================================================== */}

        <div className="planner-grid">
          {/* ==================================================
              TODAY SCHEDULE
          ================================================== */}

          <section className="schedule-card">
            <div className="section-heading">
              <div>
                <span className="section-label">
                  TODAY
                </span>

                <h2>
                  Your Study Schedule
                </h2>

                <p>
                  Follow these time slots to
                  stay on track.
                </p>
              </div>

              <div className="schedule-progress">
                <strong>
                  {completedCount}/
                  {dailySchedule.length}
                </strong>

                <span>completed</span>
              </div>
            </div>

            <div className="today-line" />

            {dailySchedule.length === 0 ? (
              <div className="empty-schedule">
                <CalendarDays size={30} />

                <h3>
                  No schedule available yet
                </h3>

                <p>
                  Take a few more tests and
                  ExamMaster will build a
                  personalized schedule for you.
                </p>
              </div>
            ) : (
              <div className="schedule-list">
                {dailySchedule.map(
                  (item, index) => (
                    <div
                      className={`schedule-item ${
                        item.completed
                          ? "is-completed"
                          : ""
                      }`}
                      key={item.id}
                    >
                      <div className="schedule-time">
                        <strong>
                          {formatTime(
                            item.startTime
                          )}
                        </strong>

                        <span>
                          {formatTime(
                            item.endTime
                          )}
                        </span>
                      </div>

                      <div className="schedule-dot">
                        <span />
                      </div>

                      <div className="schedule-main">
                        <div className="schedule-top">
                          <span
                            className={`priority-badge ${
                              item.priority ===
                              "High"
                                ? "high"
                                : item.priority ===
                                  "Medium"
                                ? "medium"
                                : "low"
                            }`}
                          >
                            {item.priority ||
                              "Focus"}
                          </span>

                          <span className="duration">
                            <Clock3
                              size={14}
                            />
                            {item.duration} min
                          </span>
                        </div>

                        <h3>
                          {item.subject}
                        </h3>

                        <p>
                          {item.task}
                          {item.topic
                            ? ` • ${item.topic}`
                            : ""}
                        </p>
                      </div>

                      <button
                        type="button"
                        className={`complete-button ${
                          item.completed
                            ? "checked"
                            : ""
                        }`}
                        onClick={() =>
                          toggleScheduleItem(
                            item.id
                          )
                        }
                        title={
                          item.completed
                            ? "Mark incomplete"
                            : "Mark completed"
                        }
                      >
                        {item.completed ? (
                          <Check size={18} />
                        ) : (
                          <CheckCircle2
                            size={19}
                          />
                        )}
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </section>

          {/* ==================================================
              RIGHT PANEL
          ================================================== */}

          <aside className="planner-sidebar">
            {/* =================================================
                AI INSIGHT
            ================================================= */}

            <div className="ai-insight-card">
              <div className="ai-insight-top">
                <div className="ai-insight-icon">
                  <Brain size={20} />
                </div>

                <span>
                  PERFORMANCE INSIGHT
                </span>
              </div>

              <h3>
                Study smarter, not longer.
              </h3>

              <p>
                Your weakest subjects receive
                more study time automatically.
                As your test performance
                improves, your priorities can
                change.
              </p>
            </div>

            {/* =================================================
                WEAK SUBJECTS
            ================================================= */}

            <div className="weak-card">
              <div className="sidebar-heading">
                <div>
                  <BarChart3 size={18} />
                  <span>
                    WEAK SUBJECTS
                  </span>
                </div>

                <ChevronRight size={17} />
              </div>

              {weakTopics.length === 0 ? (
                <div className="sidebar-empty">
                  No weak subjects detected.
                </div>
              ) : (
                <div className="weak-list">
                  {weakTopics
                    .slice(0, 5)
                    .map((item) => {
                      const accuracy =
                        getAccuracy(
                          item.accuracy
                        );

                      return (
                        <div
                          className="weak-item"
                          key={item.id}
                        >
                          <div className="weak-item-top">
                            <div>
                              <strong>
                                {item.subject}
                              </strong>

                              <span>
                                {item.topic}
                              </span>
                            </div>

                            <b>
                              {item.accuracy}
                            </b>
                          </div>

                          <div className="weak-progress">
                            <span
                              style={{
                                width: `${accuracy}%`,
                              }}
                            />
                          </div>

                          <div className="weak-priority">
                            {item.priority}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* =================================================
                WEEKLY TARGET
            ================================================= */}

            <div className="weekly-card">
              <div className="sidebar-heading">
                <div>
                  <Target size={18} />
                  <span>
                    WEEKLY TARGET
                  </span>
                </div>
              </div>

              <div className="weekly-number">
                <strong>
                  {totalHours}
                </strong>

                <span>
                  hours recommended
                </span>
              </div>

              <div className="weekly-progress">
                <span
                  style={{
                    width: `${completionPercentage}%`,
                  }}
                />
              </div>

              <p>
                {completionPercentage}% of
                today's schedule completed.
              </p>
            </div>
          </aside>
        </div>

        {/* ====================================================
            HOW IT WORKS
        ==================================================== */}

        <section className="planner-method">
          <div className="method-icon">
           <GraduationCap size={24} strokeWidth={1.8} />
          </div>

          <div>
            <span>
              HOW YOUR PLAN WORKS
            </span>

            <p>
              ExamMaster analyzes your previous
              exam results, identifies subjects
              where your accuracy is lower,
              assigns higher priority to those
              areas and distributes recommended
              study time into practical daily
              sessions.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}