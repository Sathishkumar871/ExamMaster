
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Archive,
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  ChevronUp,
  Clock3,
  Filter,
  GraduationCap,
  History,
  Inbox,
  MessageCircle,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  UserRound,
} from "lucide-react";

import "./TeacherComplaints.css";


// ============================================================
// TYPES
// ============================================================

interface Complaint {
  _id: string;

  studentId: string;

  studentName: string;

  className: string;

  classId: string;

  section?: string;

  description: string;

  status: string;

  createdAt: string;

  managementReply?: string;

  repliedBy?: string;

  repliedAt?: string;

  resolvedAt?: string;
}


// ============================================================
// API
// ============================================================

const API_BASE =
  "https://exammaster-backend-up1y.onrender.com";


// ============================================================
// HELPERS
// ============================================================

const getStoredUser = () => {
  try {
    const teacher = JSON.parse(
      localStorage.getItem("teacher") || "{}"
    );

    const staff = JSON.parse(
      localStorage.getItem("staff") || "{}"
    );

    return {
      teacher,
      staff,
    };
  } catch {
    return {
      teacher: {},
      staff: {},
    };
  }
};


const clearAuthAndRedirect = (
  navigate: ReturnType<typeof useNavigate>
) => {
  localStorage.removeItem("teacherToken");
  localStorage.removeItem("staffToken");
  localStorage.removeItem("teacher");
  localStorage.removeItem("staff");

  navigate(
    "/management/login",
    {
      replace: true,
    }
  );
};


// ============================================================
// COMPONENT
// ============================================================

export default function TeacherComplaints() {
  const navigate = useNavigate();


  // ==========================================================
  // STATE
  // ==========================================================

  const [
    complaints,
    setComplaints,
  ] = useState<Complaint[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    showHistory,
    setShowHistory,
  ] = useState(false);

  const [
    sendingReply,
    setSendingReply,
  ] = useState<string | null>(null);

  const [
    resolving,
    setResolving,
  ] = useState<string | null>(null);

  const [
    replyText,
    setReplyText,
  ] = useState<Record<string, string>>({});


  // ==========================================================
  // HISTORY FILTERS
  // ==========================================================

  const [
    historyYear,
    setHistoryYear,
  ] = useState("All");

  const [
    historySection,
    setHistorySection,
  ] = useState("All");

  const [
    historyDate,
    setHistoryDate,
  ] = useState("");

  const [
    historySearch,
    setHistorySearch,
  ] = useState("");


  // ==========================================================
  // FETCH COMPLAINTS
  // ==========================================================

  const fetchComplaints = async (
    showRefreshLoader = false
  ) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      }

      const token =
        localStorage.getItem(
          "teacherToken"
        ) ||
        localStorage.getItem(
          "staffToken"
        );

      if (!token) {
        clearAuthAndRedirect(navigate);
        return;
      }

      const response = await fetch(
        `${API_BASE}/api/complaints/teacher/complaints`,
        {
          method: "GET",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      let data: any = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      console.log(
        "📢 ALL STUDENT COMPLAINTS:",
        data
      );

      if (
        response.status === 401
      ) {
        clearAuthAndRedirect(navigate);
        return;
      }

      if (
        response.ok &&
        data.success
      ) {
        setComplaints(
          Array.isArray(
            data.complaints
          )
            ? data.complaints
            : []
        );
      } else {
        console.error(
          "Complaints API error:",
          data.message ||
            "Unable to fetch complaints."
        );
      }

    } catch (error) {
      console.error(
        "Fetch complaints error:",
        error
      );

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    fetchComplaints();
  }, []);


  // ==========================================================
  // ACTIVE COMPLAINTS
  // ==========================================================

  const activeComplaints =
    useMemo(
      () => {
        return complaints
          .filter(
            (item) =>
              !item.status ||
              item.status ===
                "Pending"
          )
          .sort(
            (a, b) =>
              new Date(
                b.createdAt
              ).getTime() -
              new Date(
                a.createdAt
              ).getTime()
          );
      },
      [complaints]
    );


  // ==========================================================
  // RESOLVED HISTORY
  // ==========================================================

  const resolvedComplaints =
    useMemo(
      () => {
        return complaints
          .filter(
            (item) =>
              item.status ===
              "Resolved"
          )
          .sort(
            (a, b) =>
              new Date(
                b.createdAt
              ).getTime() -
              new Date(
                a.createdAt
              ).getTime()
          );
      },
      [complaints]
    );


  // ==========================================================
  // YEARS
  // ==========================================================

  const availableYears =
    useMemo(
      () => {
        const years =
          resolvedComplaints
            .map(
              (item) =>
                new Date(
                  item.createdAt
                ).getFullYear()
            )
            .filter(
              (
                year,
                index,
                arr
              ) =>
                arr.indexOf(
                  year
                ) === index
            )
            .sort(
              (a, b) =>
                b - a
            );

        return years;
      },
      [resolvedComplaints]
    );


  // ==========================================================
  // SECTIONS
  // ==========================================================

  const availableSections =
    useMemo(
      () => {
        const sections =
          resolvedComplaints
            .map(
              (item) =>
                item.section ||
                "N/A"
            )
            .filter(
              (
                section,
                index,
                arr
              ) =>
                arr.indexOf(
                  section
                ) === index
            )
            .sort();

        return sections;
      },
      [resolvedComplaints]
    );


  // ==========================================================
  // FILTERED HISTORY
  // ==========================================================

  const filteredHistory =
    useMemo(
      () => {
        const search =
          historySearch
            .trim()
            .toLowerCase();

        return resolvedComplaints
          .filter(
            (item) => {
              const date =
                new Date(
                  item.createdAt
                );

              // YEAR
              if (
                historyYear !==
                "All"
              ) {
                if (
                  String(
                    date.getFullYear()
                  ) !==
                  historyYear
                ) {
                  return false;
                }
              }


              // SECTION
              if (
                historySection !==
                "All"
              ) {
                if (
                  (
                    item.section ||
                    "N/A"
                  ) !==
                  historySection
                ) {
                  return false;
                }
              }


              // DATE
              if (
                historyDate
              ) {
                const itemDate =
                  date
                    .toISOString()
                    .split("T")[0];

                if (
                  itemDate !==
                  historyDate
                ) {
                  return false;
                }
              }


              // SEARCH
              if (
                search
              ) {
                const searchable =
                  [
                    item.studentName,
                    item.studentId,
                    item.className,
                    item.section,
                    item.description,
                    item.managementReply,
                  ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                if (
                  !searchable.includes(
                    search
                  )
                ) {
                  return false;
                }
              }

              return true;
            }
          );
      },
      [
        resolvedComplaints,
        historyYear,
        historySection,
        historyDate,
        historySearch,
      ]
    );


  // ==========================================================
  // REPLY INPUT
  // ==========================================================

  const handleReplyChange = (
    id: string,
    value: string
  ) => {
    setReplyText(
      (previous) => ({
        ...previous,
        [id]:
          value,
      })
    );
  };


  // ==========================================================
  // SEND RESPONSE
  // ==========================================================

  const handleSendReply = async (
    complaint: Complaint
  ) => {
    const message =
      (
        replyText[
          complaint._id
        ] ||
        ""
      ).trim();

    if (!message) {
      alert(
        "Please enter a response message."
      );
      return;
    }


    try {
      setSendingReply(
        complaint._id
      );

      const token =
        localStorage.getItem(
          "teacherToken"
        ) ||
        localStorage.getItem(
          "staffToken"
        );

      if (!token) {
        clearAuthAndRedirect(navigate);
        return;
      }

      const {
        teacher,
        staff,
      } = getStoredUser();

      const repliedBy =
        teacher.name ||
        staff.name ||
        "Management";


      const response =
        await fetch(
          `${API_BASE}/api/complaints/teacher/complaint/${complaint._id}/reply`,
          {
            method:
              "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify({
                message,
                repliedBy,
              }),
          }
        );


      let data: any = {};

      try {
        data =
          await response.json();
      } catch {
        data = {};
      }


      if (
        response.status ===
        401
      ) {
        clearAuthAndRedirect(
          navigate
        );
        return;
      }


      if (
        response.ok &&
        data.success
      ) {
        setComplaints(
          (previous) =>
            previous.map(
              (item) =>
                item._id ===
                complaint._id
                  ? {
                      ...item,

                      managementReply:
                        data
                          .complaint
                          ?.managementReply ||
                        message,

                      repliedBy:
                        data
                          .complaint
                          ?.repliedBy ||
                        repliedBy,

                      repliedAt:
                        data
                          .complaint
                          ?.repliedAt ||
                        new Date()
                          .toISOString(),
                    }
                  : item
            )
        );


        setReplyText(
          (previous) => ({
            ...previous,
            [complaint._id]:
              "",
          })
        );

      } else {
        alert(
          data.message ||
            "Failed to send response."
        );
      }

    } catch (error) {
      console.error(
        "Send reply error:",
        error
      );

      alert(
        "Server error while sending response."
      );

    } finally {
      setSendingReply(
        null
      );
    }
  };


  // ==========================================================
  // RESOLVE
  // ==========================================================

  const handleResolve = async (
    complaint: Complaint
  ) => {
    try {
      setResolving(
        complaint._id
      );

      const token =
        localStorage.getItem(
          "teacherToken"
        ) ||
        localStorage.getItem(
          "staffToken"
        );

      if (!token) {
        clearAuthAndRedirect(navigate);
        return;
      }


      const response =
        await fetch(
          `${API_BASE}/api/complaints/teacher/complaint/${complaint._id}`,
          {
            method:
              "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      let data: any = {};

      try {
        data =
          await response.json();
      } catch {
        data = {};
      }


      if (
        response.status ===
        401
      ) {
        clearAuthAndRedirect(
          navigate
        );
        return;
      }


      if (
        response.ok &&
        data.success
      ) {
        setComplaints(
          (previous) =>
            previous.map(
              (item) =>
                item._id ===
                complaint._id
                  ? {
                      ...item,

                      status:
                        "Resolved",

                      resolvedAt:
                        data
                          .updatedComplaint
                          ?.resolvedAt ||
                        new Date()
                          .toISOString(),
                    }
                  : item
            )
        );

      } else {
        alert(
          data.message ||
            "Unable to resolve complaint."
        );
      }

    } catch (error) {
      console.error(
        "Resolve error:",
        error
      );

      alert(
        "Server error while resolving complaint."
      );

    } finally {
      setResolving(
        null
      );
    }
  };


  // ==========================================================
  // RESET HISTORY FILTERS
  // ==========================================================

  const resetHistoryFilters =
    () => {
      setHistoryYear("All");
      setHistorySection("All");
      setHistoryDate("");
      setHistorySearch("");
    };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="teacher-loading">
        <div className="loading-card">
          <div className="loading-icon">
            <Clock3
              size={24}
            />
          </div>

          <strong>
            Loading Student Complaints
          </strong>

          <span>
            Fetching the latest requests...
          </span>
        </div>
      </div>
    );
  }


  // ==========================================================
  // MAIN
  // ==========================================================

  return (
    <div className="complaints-page">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <header className="complaints-header">

        <div className="header-content">

          <div className="management-label">
            <span className="label-dot" />
            STG COLLEGE
            <span className="label-divider">
              /
            </span>
            MANAGEMENT
          </div>

          <h1>
            Student Complaints
            <span>
              & Requirements
            </span>
          </h1>

          <p>
            Review student requests,
            communicate with students,
            and manage resolutions
            from one secure workspace.
          </p>

        </div>


        <div className="header-actions">

          <button
            className="refresh-button"
            onClick={() =>
              fetchComplaints(true)
            }
            disabled={refreshing}
            title="Refresh complaints"
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "spin"
                  : ""
              }
            />

            <span>
              Refresh
            </span>
          </button>


          <button
            className="back-dashboard"
            onClick={() =>
              navigate(
                "/teacher/dashboard"
              )
            }
            type="button"
          >
            <ArrowLeft size={16} />
            Dashboard
          </button>

        </div>

      </header>


      {/* ====================================================
          SUMMARY
      ==================================================== */}

      <section className="complaint-summary">

        <div className="summary-card active-summary">

          <div className="summary-icon">
            <Inbox
              size={19}
            />
          </div>

          <div className="summary-copy">
            <span>
              ACTIVE REQUESTS
            </span>

            <strong>
              {
                activeComplaints.length
              }
            </strong>

            <small>
              Currently requiring attention
            </small>
          </div>

        </div>


        <div className="summary-card resolved-summary">

          <div className="summary-icon">
            <CheckCircle2
              size={19}
            />
          </div>

          <div className="summary-copy">
            <span>
              TOTAL RESOLVED
            </span>

            <strong>
              {
                resolvedComplaints.length
              }
            </strong>

            <small>
              Completed student requests
            </small>
          </div>

        </div>


        <div className="summary-card total-summary">

          <div className="summary-icon">
            <MessageCircle
              size={19}
            />
          </div>

          <div className="summary-copy">
            <span>
              TOTAL REQUESTS
            </span>

            <strong>
              {
                complaints.length
              }
            </strong>

            <small>
              All student submissions
            </small>
          </div>

        </div>

      </section>


      {/* ====================================================
          CORNER HISTORY BUTTON
      ==================================================== */}

      <div className="history-control">

        <button
          className={
            showHistory
              ? "history-button active"
              : "history-button"
          }
          onClick={() =>
            setShowHistory(
              !showHistory
            )
          }
          type="button"
        >

          <span className="history-icon">
            <History
              size={16}
              strokeWidth={2.2}
            />
          </span>


          <span className="history-button-text">
            <strong>
              History
            </strong>

            <small>
              {
                resolvedComplaints.length
              } resolved
            </small>
          </span>


          <span className="history-arrow">

            {showHistory ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronRight size={14} />
            )}

          </span>

        </button>

      </div>


      {/* ====================================================
          HISTORY
      ==================================================== */}

      {showHistory && (

        <section className="old-history-panel">

          <div className="history-panel-header">

            <div>

              <span className="section-kicker">
                <Archive size={13} />
                ARCHIVE
              </span>

              <h2>
                Old Complaint History
              </h2>

              <p>
                Search and filter previously
                resolved student requests.
              </p>

            </div>


            <button
              className="reset-filter"
              onClick={
                resetHistoryFilters
              }
              type="button"
            >
              <RotateCcw size={13} />
              Reset
            </button>

          </div>


          {/* FILTERS */}

          <div className="history-filters">

            <div className="filter-title">
              <Filter size={14} />
              Filters
            </div>


            {/* YEAR */}

            <div className="filter-field">

              <label>
                Year
              </label>

              <select
                value={
                  historyYear
                }
                onChange={(e) =>
                  setHistoryYear(
                    e.target.value
                  )
                }
              >

                <option value="All">
                  All Years
                </option>

                {availableYears.map(
                  (year) => (
                    <option
                      key={year}
                      value={
                        String(year)
                      }
                    >
                      {year}
                    </option>
                  )
                )}

              </select>

            </div>


            {/* SECTION */}

            <div className="filter-field">

              <label>
                Section
              </label>

              <select
                value={
                  historySection
                }
                onChange={(e) =>
                  setHistorySection(
                    e.target.value
                  )
                }
              >

                <option value="All">
                  All Sections
                </option>

                {availableSections.map(
                  (section) => (
                    <option
                      key={section}
                      value={section}
                    >
                      Section{" "}
                      {section}
                    </option>
                  )
                )}

              </select>

            </div>


            {/* DATE */}

            <div className="filter-field">

              <label>
                Specific Date
              </label>

              <div className="date-input-wrap">

                <CalendarDays
                  size={14}
                />

                <input
                  type="date"
                  value={
                    historyDate
                  }
                  onChange={(e) =>
                    setHistoryDate(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>


            {/* SEARCH */}

            <div className="filter-field search-filter">

              <label>
                Search
              </label>

              <div className="search-input-wrap">

                <Search
                  size={14}
                />

                <input
                  type="text"
                  value={
                    historySearch
                  }
                  onChange={(e) =>
                    setHistorySearch(
                      e.target.value
                    )
                  }
                  placeholder="Student, ID, class..."
                />

              </div>

            </div>

          </div>


          {/* HISTORY RESULT HEADER */}

          <div className="history-result-header">

            <strong>
              {
                filteredHistory.length
              } records
            </strong>

            <span>
              Resolved archive
            </span>

          </div>


          {filteredHistory.length ===
          0 ? (

            <div className="history-empty">

              <div className="empty-icon">
                <Archive
                  size={25}
                />
              </div>

              <h3>
                No History Found
              </h3>

              <p>
                No resolved complaints
                match the selected filters.
              </p>

            </div>

          ) : (

            <div className="history-list">

              {filteredHistory.map(
                (item) => (

                  <article
                    className="history-card"
                    key={
                      item._id
                    }
                  >

                    <div className="history-card-top">

                      <div className="history-student">

                        <div className="history-avatar">
                          <UserRound
                            size={17}
                          />
                        </div>

                        <div>

                          <h3>
                            {
                              item.studentName
                            }
                          </h3>

                          <p>
                            ID:{" "}
                            {
                              item.studentId
                            }
                          </p>

                        </div>

                      </div>


                      <span className="resolved-badge">
                        <Check
                          size={13}
                        />
                        Resolved
                      </span>

                    </div>


                    <div className="history-meta">

                      <span>
                        <GraduationCap
                          size={13}
                        />
                        {
                          item.className ||
                          "N/A"
                        }
                      </span>

                      <span>
                        Section{" "}
                        {
                          item.section ||
                          "N/A"
                        }
                      </span>

                      <span>
                        <CalendarDays
                          size={13}
                        />
                        {
                          new Date(
                            item.createdAt
                          ).toLocaleDateString()
                        }
                      </span>

                    </div>


                    <div className="history-message">

                      <small>
                        STUDENT REQUEST
                      </small>

                      <p>
                        {
                          item.description
                        }
                      </p>

                    </div>


                    {item.managementReply && (

                      <div className="history-reply">

                        <small>
                          MANAGEMENT RESPONSE
                        </small>

                        <p>
                          {
                            item.managementReply
                          }
                        </p>

                        <span>

                          {item.repliedBy
                            ? `By ${item.repliedBy}`
                            : "By Management"}

                          {item.repliedAt
                            ? ` • ${new Date(
                                item.repliedAt
                              ).toLocaleString()}`
                            : ""}

                        </span>

                      </div>

                    )}


                    {item.resolvedAt && (

                      <div className="resolved-date">

                        <CheckCircle2
                          size={13}
                        />

                        Resolved on{" "}
                        {
                          new Date(
                            item.resolvedAt
                          ).toLocaleString()
                        }

                      </div>

                    )}

                  </article>

                )
              )}

            </div>

          )}

        </section>

      )}


      {/* ====================================================
          ACTIVE REQUESTS
      ==================================================== */}

      {!showHistory && (

        <section className="active-section">

          <div className="active-section-heading">

            <div>

              <span className="section-kicker">
                <Clock3 size={13} />
                LIVE
              </span>

              <h2>
                Active Student Requests
              </h2>

              <p>
                Requests waiting for management
                response or resolution.
              </p>

            </div>


            <span className="active-count">

              <span className="active-count-dot" />

              {
                activeComplaints.length
              }

              {" "}
              Pending

            </span>

          </div>


          {activeComplaints.length ===
          0 ? (

            <div className="active-empty">

              <div className="empty-icon success">
                <CheckCircle2
                  size={28}
                />
              </div>

              <h3>
                All Clear
              </h3>

              <p>
                There are no pending student
                complaints right now.
              </p>

            </div>

          ) : (

            <div className="active-grid">

              {activeComplaints.map(
                (item) => {

                  const reply =
                    replyText[
                      item._id
                    ] ||
                    "";

                  const sending =
                    sendingReply ===
                    item._id;

                  const resolvingNow =
                    resolving ===
                    item._id;


                  return (

                    <article
                      className="active-card"
                      key={
                        item._id
                      }
                    >

                      {/* STUDENT */}

                      <div className="student-heading">

                        <div className="student-identity">

                          <div className="student-avatar">
                            <UserRound
                              size={18}
                            />
                          </div>

                          <div>

                            <h3>
                              {
                                item.studentName ||
                                "Student"
                              }
                            </h3>

                            <span>
                              ID:{" "}
                              {
                                item.studentId
                              }
                            </span>

                          </div>

                        </div>


                        <span className="pending-badge">
                          <Clock3
                            size={12}
                          />
                          Pending
                        </span>

                      </div>


                      {/* DETAILS */}

                      <div className="student-details">

                        <div>

                          <small>
                            <GraduationCap
                              size={11}
                            />
                            CLASS
                          </small>

                          <strong>
                            {
                              item.className ||
                              "N/A"
                            }
                          </strong>

                        </div>


                        <div>

                          <small>
                            SECTION
                          </small>

                          <strong>
                            {
                              item.section ||
                              "N/A"
                            }
                          </strong>

                        </div>


                        <div>

                          <small>
                            <CalendarDays
                              size={11}
                            />
                            SUBMITTED
                          </small>

                          <strong>
                            {
                              new Date(
                                item.createdAt
                              ).toLocaleDateString()
                            }
                          </strong>

                        </div>

                      </div>


                      {/* REQUEST */}

                      <div className="request-box">

                        <div className="box-heading">

                          <span>
                            STUDENT REQUEST
                          </span>

                          <MessageCircle
                            size={14}
                          />

                        </div>

                        <p>
                          {
                            item.description
                          }
                        </p>

                      </div>


                      {/* EXISTING REPLY */}

                      {item.managementReply && (

                        <div className="existing-reply">

                          <div className="box-heading">
                            <span>
                              CURRENT RESPONSE
                            </span>

                            <CheckCircle2
                              size={14}
                            />
                          </div>

                          <p>
                            {
                              item.managementReply
                            }
                          </p>

                        </div>

                      )}


                      {/* RESPONSE */}

                      <div className="reply-box">

                        <div className="reply-title">
                          Management Response
                        </div>

                        <textarea
                          rows={4}
                          maxLength={1000}
                          value={reply}
                          onChange={(e) =>
                            handleReplyChange(
                              item._id,
                              e.target.value
                            )
                          }
                          placeholder="Write a response to this student..."
                        />

                        <div className="reply-footer">

                          <span>
                            {
                              reply.length
                            }
                            /1000
                          </span>

                          <button
                            onClick={() =>
                              handleSendReply(
                                item
                              )
                            }
                            disabled={
                              sending
                            }
                            type="button"
                          >

                            {sending ? (
                              <>
                                <Clock3
                                  size={14}
                                />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send
                                  size={14}
                                />
                                Send Response
                              </>
                            )}

                          </button>

                        </div>

                      </div>


                      {/* RESOLVE */}

                      <button
                        className="resolve-button"
                        onClick={() =>
                          handleResolve(
                            item
                          )
                        }
                        disabled={
                          resolvingNow
                        }
                        type="button"
                      >

                        {resolvingNow ? (
                          <>
                            <Clock3
                              size={15}
                            />
                            Resolving...
                          </>
                        ) : (
                          <>
                            <CheckCircle2
                              size={16}
                            />
                            Mark as Resolved
                          </>
                        )}

                      </button>


                      {/* DATE */}

                      <div className="submitted-date">

                        <CalendarDays
                          size={12}
                        />

                        Submitted on{" "}
                        {
                          new Date(
                            item.createdAt
                          ).toLocaleString()
                        }

                      </div>

                    </article>

                  );
                }
              )}

            </div>

          )}

        </section>

      )}

    </div>
  );
}

