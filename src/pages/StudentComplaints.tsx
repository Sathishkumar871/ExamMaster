import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import "./StudentComplaints.css";

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

interface Complaint {
  _id: string;
  description: string;
  status?: string;
  createdAt: string;
}

interface StudentData {
  studentId?: string;
  name?: string;
  className?: string;
  classId?: string;
}

type FilterStatus = "All" | "Pending" | "Resolved";
type MessageType = "" | "success" | "error";

interface MessageState {
  text: string;
  type: MessageType;
}

// ============================================================
// HELPERS
// ============================================================

function getStoredStudent(): StudentData {
  try {
    const raw = localStorage.getItem("student");

    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return parsed as StudentData;
  } catch {
    return {};
  }
}

function getStudentId(student: StudentData): string {
  return (
    localStorage.getItem("studentId") ||
    student.studentId ||
    ""
  );
}

function formatComplaintDate(date: string): string {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Date unavailable";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ============================================================
// COMPONENT
// ============================================================

export default function StudentComplaints() {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [message, setMessage] = useState<MessageState>({
    text: "",
    type: "",
  });

  const [myComplaints, setMyComplaints] = useState<Complaint[]>([]);
  const [filterStatus, setFilterStatus] =
    useState<FilterStatus>("All");

  // ==========================================================
  // STUDENT
  // ==========================================================

  const student = useMemo(() => getStoredStudent(), []);

  const studentId = useMemo(
    () => getStudentId(student),
    [student]
  );

  // ==========================================================
  // FETCH HISTORY
  // ==========================================================

  const fetchMyComplaints = useCallback(
    async (showLoader = false) => {
      if (!studentId) {
        setMyComplaints([]);
        setHistoryLoading(false);
        return;
      }

      if (showLoader) {
        setHistoryLoading(true);
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/complaints/student/complaints/${encodeURIComponent(
            studentId
          )}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              `Unable to load complaints (${response.status})`
          );
        }

        setMyComplaints(
          data?.success && Array.isArray(data.complaints)
            ? data.complaints
            : []
        );
      } catch (error) {
        console.error(
          "Error fetching complaints:",
          error
        );
      } finally {
        setHistoryLoading(false);
      }
    },
    [studentId]
  );

  useEffect(() => {
    fetchMyComplaints(true);
  }, [fetchMyComplaints]);

  // ==========================================================
  // COUNTS
  // ==========================================================

  const counts = useMemo(() => {
    let pending = 0;
    let resolved = 0;

    for (const complaint of myComplaints) {
      if (complaint.status === "Resolved") {
        resolved++;
      } else {
        pending++;
      }
    }

    return {
      all: myComplaints.length,
      pending,
      resolved,
    };
  }, [myComplaints]);

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredComplaints = useMemo(() => {
    if (filterStatus === "All") {
      return myComplaints;
    }

    return myComplaints.filter((item) => {
      const status = item.status || "Pending";
      return status === filterStatus;
    });
  }, [myComplaints, filterStatus]);

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const trimmedDescription = description.trim();

    if (!trimmedDescription) {
      setMessage({
        text: "Please enter your requirement before submitting.",
        type: "error",
      });
      return;
    }

    if (!studentId) {
      setMessage({
        text: "Student information is missing. Please login again.",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);

      setMessage({
        text: "",
        type: "",
      });

      const response = await fetch(
        `${API_BASE_URL}/api/complaints/student/complaint`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId,
            studentName: student.name || "Student",
            className: student.className || "N/A",
            classId: student.classId || "N/A",
            description: trimmedDescription,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Unable to submit request (${response.status})`
        );
      }

      if (data?.success) {
        setMessage({
          text:
            "Complaint submitted successfully. Limit: 1 submission per week.",
          type: "success",
        });

        setDescription("");

        await fetchMyComplaints();
        return;
      }

      setMessage({
        text:
          data?.message ||
          "You can only submit 1 requirement per week.",
        type: "error",
      });
    } catch (error) {
      console.error(
        "Error submitting complaint:",
        error
      );

      setMessage({
        text:
          error instanceof Error
            ? error.message
            : "Server error occurred. Please try again later.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // DELETE
  // ==========================================================

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this request?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      setMessage({
        text: "",
        type: "",
      });

      const response = await fetch(
        `${API_BASE_URL}/api/complaints/student/complaint/${encodeURIComponent(
          id
        )}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to delete request (${response.status})`
        );
      }

      if (data?.success) {
        setMessage({
          text:
            "Request deleted successfully. You can now submit a new one.",
          type: "success",
        });

        await fetchMyComplaints();
        return;
      }

      setMessage({
        text: data?.message || "Failed to delete request.",
        type: "error",
      });
    } catch (error) {
      console.error(
        "Error deleting complaint:",
        error
      );

      setMessage({
        text:
          error instanceof Error
            ? error.message
            : "Unable to delete request.",
        type: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main className="complaint-container">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="complaint-header">
        <div
          className="header-icon"
          aria-hidden="true"
        >
          📢
        </div>

        <div className="header-text">
          <span className="header-eyebrow">
            STG STUDENT SERVICES
          </span>

          <h1>Student Support &amp; Helpdesk</h1>

          <p>
            Raise your academic requirements securely.
            <strong>
              {" "}
              Limit: 1 submission per week.
            </strong>
          </p>
        </div>
      </header>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <div className="complaint-content-grid">
        {/* ====================================================
            SUBMIT FORM
        ==================================================== */}

        <section
          className="complaint-form-card"
          aria-labelledby="new-requirement-title"
        >
          <div className="section-heading-row">
            <div
              className="section-heading-icon"
              aria-hidden="true"
            >
              ✍️
            </div>

            <div>
              <span className="section-kicker">
                NEW REQUEST
              </span>

              <h2 id="new-requirement-title">
                New Requirement Portal
              </h2>
            </div>
          </div>

          <div className="form-info-banner">
            <span aria-hidden="true">ℹ️</span>

            <span>
              Please describe your requirement clearly so
              the appropriate department can review it.
            </span>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="form-group">
              <label htmlFor="complaint-description">
                Detailed Description
              </label>

              <div className="textarea-wrapper">
                <textarea
                  id="complaint-description"
                  name="description"
                  rows={6}
                  maxLength={300}
                  required
                  value={description}
                  placeholder="Describe your issue or requirement clearly here..."
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  aria-describedby="complaint-description-help"
                />

                <span
                  className="textarea-counter"
                  aria-live="polite"
                >
                  {description.length}/300
                </span>
              </div>

              <small id="complaint-description-help">
                Maximum 300 characters.
              </small>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={
                loading || !description.trim()
              }
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <span
                    className="button-spinner"
                    aria-hidden="true"
                  />
                  <span>Submitting securely...</span>
                </>
              ) : (
                <>
                  <span aria-hidden="true">🚀</span>
                  <span>Submit Requirement</span>
                </>
              )}
            </button>

            {message.text && (
              <div
                className={`premium-alert ${message.type}`}
                role={
                  message.type === "error"
                    ? "alert"
                    : "status"
                }
                aria-live="polite"
              >
                <span aria-hidden="true">
                  {message.type === "success"
                    ? "✓"
                    : "!"}
                </span>

                <span>{message.text}</span>
              </div>
            )}
          </form>
        </section>

        {/* ====================================================
            HISTORY
        ==================================================== */}

        <section
          className="complaint-history-card"
          aria-labelledby="history-title"
        >
          <div className="history-top-bar">
            <div className="section-heading-row">
              <div
                className="section-heading-icon"
                aria-hidden="true"
              >
                📋
              </div>

              <div>
                <span className="section-kicker">
                  TRACK REQUESTS
                </span>

                <h2 id="history-title">
                  Weekly Tracking History
                </h2>
              </div>
            </div>

            <button
              type="button"
              className="history-refresh-btn"
              onClick={() =>
                fetchMyComplaints(true)
              }
              disabled={historyLoading}
              aria-label="Refresh complaint history"
              title="Refresh history"
            >
              <span
                aria-hidden="true"
                className={
                  historyLoading
                    ? "refresh-icon spinning"
                    : "refresh-icon"
                }
              >
                ↻
              </span>
            </button>
          </div>

          {/* ==================================================
              FILTERS
          ================================================== */}

          <div
            className="filter-tabs"
            role="tablist"
            aria-label="Request status filter"
          >
            <button
              type="button"
              role="tab"
              aria-selected={
                filterStatus === "All"
              }
              className={
                filterStatus === "All"
                  ? "active-tab"
                  : ""
              }
              onClick={() =>
                setFilterStatus("All")
              }
            >
              <span>All</span>
              <b>{counts.all}</b>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={
                filterStatus === "Pending"
              }
              className={
                filterStatus === "Pending"
                  ? "active-tab"
                  : ""
              }
              onClick={() =>
                setFilterStatus("Pending")
              }
            >
              <span>Pending</span>
              <b>{counts.pending}</b>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={
                filterStatus === "Resolved"
              }
              className={
                filterStatus === "Resolved"
                  ? "active-tab"
                  : ""
              }
              onClick={() =>
                setFilterStatus("Resolved")
              }
            >
              <span>Resolved</span>
              <b>{counts.resolved}</b>
            </button>
          </div>

          {/* ==================================================
              CONTENT
          ================================================== */}

          {historyLoading ? (
            <div
              className="complaint-loading-state"
              aria-live="polite"
            >
              <span
                className="loading-spinner"
                aria-hidden="true"
              />

              <strong>
                Loading your requests...
              </strong>

              <span>
                Please wait a moment.
              </span>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="empty-state">
              <div
                className="empty-icon"
                aria-hidden="true"
              >
                📭
              </div>

              <h3>No requests found</h3>

              <p>
                {filterStatus === "All"
                  ? "Your submitted requirements will appear here."
                  : `There are no ${filterStatus.toLowerCase()} requests.`}
              </p>
            </div>
          ) : (
            <div className="history-list">
              {filteredComplaints.map((item) => {
                const currentStatus =
                  item.status || "Pending";

                const isResolved =
                  currentStatus === "Resolved";

                const isDeleting =
                  deletingId === item._id;

                return (
                  <article
                    className="history-item"
                    key={item._id}
                  >
                    <div className="history-item-top">
                      <span
                        className={`status-dot ${
                          isResolved
                            ? "resolved"
                            : "pending"
                        }`}
                        aria-hidden="true"
                      />

                      <span className="request-label">
                        STUDENT REQUEST
                      </span>
                    </div>

                    <p className="history-desc">
                      {item.description}
                    </p>

                    <div className="history-footer">
                      <time
                        className="history-date"
                        dateTime={item.createdAt}
                      >
                        <span aria-hidden="true">
                          📅
                        </span>

                        {formatComplaintDate(
                          item.createdAt
                        )}
                      </time>

                      <div className="footer-actions">
                        <span
                          className={`badge ${
                            isResolved
                              ? "resolved"
                              : "pending"
                          }`}
                        >
                          <span aria-hidden="true">
                            {isResolved ? "✓" : "◷"}
                          </span>

                          <span>
                            {currentStatus}
                          </span>
                        </span>

                        {!isResolved && (
                          <button
                            type="button"
                            className="delete-mini-btn"
                            onClick={() =>
                              handleDelete(
                                item._id
                              )
                            }
                            disabled={isDeleting}
                            aria-label={`Cancel request: ${item.description}`}
                            title="Cancel Request"
                          >
                            {isDeleting ? (
                              <span
                                className="button-spinner dark"
                                aria-hidden="true"
                              />
                            ) : (
                              <span aria-hidden="true">
                                🗑
                              </span>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}