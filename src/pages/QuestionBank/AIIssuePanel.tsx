import React, {
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock3,
  RefreshCw,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";

import type { Question } from "../QuestionBank";

import "./AIIssuePanel.css";

// ============================================================
// PROPS
// ============================================================

interface AIIssuePanelProps {
  onClose: () => void;

  onQuestionClick: (
    question: Question
  ) => void;
}

// ============================================================
// API
// ============================================================

const API_BASE_URL =
  "https://exammaster-backend-up1y.onrender.com/api";

// ============================================================
// TOKEN
// ============================================================

const getToken = (): string => {
  return (
    localStorage.getItem("headToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    ""
  );
};

// ============================================================
// HEADERS
// ============================================================

const getHeaders = (): HeadersInit => {
  const token = getToken();

  return {
    "Content-Type": "application/json",

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

// ============================================================
// COMPONENT
// ============================================================

export default function AIIssuePanel({
  onClose,
  onQuestionClick,
}: AIIssuePanelProps) {
  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==========================================================
  // FETCH AI ISSUES
  // ==========================================================

  const fetchIssues = async (
    refresh = false
  ) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        `${API_BASE_URL}/question-bank?aiHasIssue=true`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to load AI issues"
        );
      }

      const loadedQuestions =
        Array.isArray(
          data?.questions
        )
          ? data.questions
          : [];

      /*
       * Safety filter:
       * Backend may return all questions
       * if aiHasIssue query is not supported.
       */

      const issueQuestions =
        loadedQuestions.filter(
          (question: Question) =>
            question.aiHasIssue === true ||
            question.aiStatus ===
              "failed"
        );

      setQuestions(
        issueQuestions
      );
    } catch (err: any) {
      console.error(
        "AI ISSUE PANEL ERROR:",
        err
      );

      setError(
        err?.message ||
          "Failed to load AI issues"
      );

      setQuestions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    fetchIssues();
  }, []);

  // ==========================================================
  // COUNTS
  // ==========================================================

  const failedCount =
    questions.filter(
      (question) =>
        question.aiStatus ===
        "failed"
    ).length;

  const pendingCount =
    questions.filter(
      (question) =>
        question.aiStatus ===
        "pending"
    ).length;

  const issueCount =
    questions.filter(
      (question) =>
        question.aiHasIssue === true
    ).length;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="ai-issue-overlay">
      <aside className="ai-issue-panel">
        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="ai-issue-header">
          <div className="ai-issue-title-wrap">
            <div className="ai-issue-icon">
              <Sparkles
                size={20}
              />
            </div>

            <div>
              <span className="ai-issue-eyebrow">
                AI QUALITY CONTROL
              </span>

              <h2>
                AI Review Issues
              </h2>

              <p>
                Questions requiring Head
                attention
              </p>
            </div>
          </div>

          <button
            type="button"
            className="ai-issue-close"
            onClick={onClose}
            aria-label="Close AI issues"
          >
            <X size={20} />
          </button>
        </header>

        {/* ==================================================
            SUMMARY
        ================================================== */}

        <div className="ai-issue-summary">
          <div className="ai-summary-card">
            <AlertCircle
              size={17}
            />

            <div>
              <span>
                Issues
              </span>

              <strong>
                {issueCount}
              </strong>
            </div>
          </div>

          <div className="ai-summary-card">
            <Clock3
              size={17}
            />

            <div>
              <span>
                Pending
              </span>

              <strong>
                {pendingCount}
              </strong>
            </div>
          </div>

          <div className="ai-summary-card">
            <XCircle
              size={17}
            />

            <div>
              <span>
                Failed
              </span>

              <strong>
                {failedCount}
              </strong>
            </div>
          </div>
        </div>

        {/* ==================================================
            TOOLBAR
        ================================================== */}

        <div className="ai-issue-toolbar">
          <div>
            <strong>
              Review Queue
            </strong>

            <span>
              {questions.length} questions
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchIssues(true)
            }
            disabled={refreshing}
            title="Refresh AI issues"
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "ai-issue-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="ai-issue-error">
            <AlertCircle
              size={18}
            />

            <div>
              <strong>
                Unable to load issues
              </strong>

              <span>
                {error}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                fetchIssues()
              }
            >
              Retry
            </button>
          </div>
        )}

        {/* ==================================================
            CONTENT
        ================================================== */}

        <div className="ai-issue-content">
          {loading ? (
            <div className="ai-issue-empty">
              <RefreshCw
                size={28}
                className="ai-issue-spin"
              />

              <strong>
                Checking AI review queue...
              </strong>

              <span>
                Please wait
              </span>
            </div>
          ) : questions.length ===
            0 ? (
            <div className="ai-issue-empty">
              <div className="ai-clean-icon">
                <CheckCircle2
                  size={30}
                />
              </div>

              <strong>
                No AI issues found
              </strong>

              <span>
                All currently loaded questions
                have passed AI review.
              </span>
            </div>
          ) : (
            <div className="ai-issue-list">
              {questions.map(
                (question) => (
                  <button
                    type="button"
                    key={
                      question._id
                    }
                    className="ai-issue-item"
                    onClick={() =>
                      onQuestionClick(
                        question
                      )
                    }
                  >
                    {/* ICON */}

                    <div className="ai-item-status">
                      {question.aiStatus ===
                      "failed" ? (
                        <XCircle
                          size={19}
                        />
                      ) : (
                        <AlertCircle
                          size={19}
                        />
                      )}
                    </div>

                    {/* CONTENT */}

                    <div className="ai-item-content">
                      <div className="ai-item-top">
                        <span>
                          Q
                          {question.questionNumber ||
                            "—"}
                        </span>

                        {question.subject && (
                          <small>
                            {
                              question.subject
                            }
                          </small>
                        )}
                      </div>

                      <strong>
                        {question.question}
                      </strong>

                      <div className="ai-item-meta">
                        {question.chapter && (
                          <span>
                            {
                              question.chapter
                            }
                          </span>
                        )}

                        {question.testTitle && (
                          <span>
                            {
                              question.testTitle
                            }
                          </span>
                        )}

                        {question.aiStatus && (
                          <span>
                            AI:{" "}
                            {
                              question.aiStatus
                            }
                          </span>
                        )}
                      </div>

                      {question.aiExplanation && (
                        <p>
                          {
                            question.aiExplanation
                          }
                        </p>
                      )}
                    </div>

                    {/* ARROW */}

                    <div className="ai-item-arrow">
                      <ChevronRight
                        size={18}
                      />
                    </div>
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <footer className="ai-issue-footer">
          <div>
            <Sparkles
              size={14}
            />

            <span>
              AI suggestions are advisory
            </span>
          </div>

          <strong>
            Head has final approval
          </strong>
        </footer>
      </aside>
    </div>
  );
}