import React, { useMemo, useState } from "react";
import {
  ClipboardList,
  Search,
  RefreshCw,
  Plus,
  Eye,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

import "./MockTestQuestions.css";

export interface MockQuestion {
  _id: string;

  questionNumber?: number;
  question: string;

  options: string[];

  correctAnswer?: string;
  ansNumber?: string;

  subject?: string;
  chapter?: string;

  testId?: string;
  testTitle?: string;

  totalQuestions?: number;

  examType?: "NEET" | "JEE";

  academicYear?: "1st PUC" | "2nd PUC";

  status?: "pending" | "published" | "approved" | "rejected";

  isPublished?: boolean;

  aiStatus?:
    | "pending"
    | "processing"
    | "completed"
    | "failed";

  aiHasIssue?: boolean;

  createdAt?: string;
}

// ============================================================
// PROPS
// ============================================================

interface MockTestQuestionsProps {
  questions: MockQuestion[];

  loading?: boolean;

  onRefresh?: () => void;

  onQuestionClick?: (
    question: MockQuestion
  ) => void;

  onDelete?: (
    question: MockQuestion
  ) => void;

  onCreate?: () => void;
}

// ============================================================
// COMPONENT
// ============================================================

export default function MockTestQuestions({
  questions,
  loading = false,
  onRefresh,
  onQuestionClick,
  onDelete,
  onCreate,
}: MockTestQuestionsProps) {
  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const filteredQuestions =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      return questions.filter(
        (question) => {
          const matchesSearch =
            !value ||
            question.question
              ?.toLowerCase()
              .includes(value) ||
            question.subject
              ?.toLowerCase()
              .includes(value) ||
            question.chapter
              ?.toLowerCase()
              .includes(value) ||
            question.testTitle
              ?.toLowerCase()
              .includes(value) ||
            question.testId
              ?.toLowerCase()
              .includes(value);

          const currentStatus =
            question.status ||
            (question.isPublished
              ? "published"
              : "pending");

          const matchesStatus =
            statusFilter === "All" ||
            currentStatus ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      questions,
      search,
      statusFilter,
    ]);

  const statistics = useMemo(() => {
    const total =
      questions.length;

    const published =
      questions.filter(
        (q) =>
          q.isPublished === true ||
          q.status === "published"
      ).length;

    const pending =
      questions.filter(
        (q) =>
          q.status === "pending"
      ).length;

    const rejected =
      questions.filter(
        (q) =>
          q.status === "rejected"
      ).length;

    const aiIssues =
      questions.filter(
        (q) =>
          q.aiHasIssue === true
      ).length;

    return {
      total,
      published,
      pending,
      rejected,
      aiIssues,
    };
  }, [questions]);

  return (
    <section className="mock-test-questions">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mock-test-header">
        <div className="mock-test-header-left">
          <div className="mock-test-icon">
            <ClipboardList
              size={22}
            />
          </div>

          <div>
            <span className="mock-test-eyebrow">
              QUESTION BANK
            </span>

            <h2>
              Mock Test Questions
            </h2>

            <p>
              Manage questions used in
              full-length mock examinations
            </p>
          </div>
        </div>

        <div className="mock-test-actions">
          <button
            type="button"
            className="mock-refresh-btn"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? "mock-spin"
                  : ""
              }
            />

            Refresh
          </button>

          <button
            type="button"
            className="mock-create-btn"
            onClick={onCreate}
          >
            <Plus size={17} />

            Create Mock Test
          </button>
        </div>
      </div>

      {/* =====================================================
          STATS
      ===================================================== */}

      <div className="mock-test-stats">
        <div className="mock-stat-card">
          <div className="mock-stat-icon">
            <ClipboardList
              size={18}
            />
          </div>

          <div>
            <span>
              Total Questions
            </span>

            <strong>
              {statistics.total}
            </strong>
          </div>
        </div>

        <div className="mock-stat-card">
          <div className="mock-stat-icon">
            <CheckCircle2
              size={18}
            />
          </div>

          <div>
            <span>
              Published
            </span>

            <strong>
              {statistics.published}
            </strong>
          </div>
        </div>

        <div className="mock-stat-card">
          <div className="mock-stat-icon">
            <Clock3 size={18} />
          </div>

          <div>
            <span>
              Pending
            </span>

            <strong>
              {statistics.pending}
            </strong>
          </div>
        </div>

        <div className="mock-stat-card">
          <div className="mock-stat-icon">
            <XCircle size={18} />
          </div>

          <div>
            <span>
              Rejected
            </span>

            <strong>
              {statistics.rejected}
            </strong>
          </div>
        </div>

        <div className="mock-stat-card">
          <div className="mock-stat-icon">
            <span className="mock-ai-dot" />
          </div>

          <div>
            <span>
              AI Issues
            </span>

            <strong>
              {statistics.aiIssues}
            </strong>
          </div>
        </div>
      </div>

      {/* =====================================================
          FILTER BAR
      ===================================================== */}

      <div className="mock-test-toolbar">
        <div className="mock-search">
          <Search size={17} />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search mock test, question, subject..."
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
            >
              ×
            </button>
          )}
        </div>

        <div className="mock-status-filter">
          {[
            "All",
            "pending",
            "published",
            "approved",
            "rejected",
          ].map((status) => (
            <button
              key={status}
              type="button"
              className={
                statusFilter === status
                  ? "active"
                  : ""
              }
              onClick={() =>
                setStatusFilter(
                  status
                )
              }
            >
              {status === "All"
                ? "All"
                : status
                    .charAt(0)
                    .toUpperCase() +
                  status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="mock-test-table-wrapper">
        {loading ? (
          <div className="mock-empty-state">
            <RefreshCw
              size={25}
              className="mock-spin"
            />

            <strong>
              Loading mock questions...
            </strong>
          </div>
        ) : filteredQuestions.length ===
          0 ? (
          <div className="mock-empty-state">
            <ClipboardList
              size={38}
            />

            <strong>
              No mock test questions
            </strong>

            <span>
              Questions assigned to mock
              tests will appear here.
            </span>
          </div>
        ) : (
          <table className="mock-test-table">
            <thead>
              <tr>
                <th>#</th>

                <th>
                  Question
                </th>

                <th>
                  Mock Test
                </th>

                <th>
                  Subject
                </th>

                <th>
                  Exam
                </th>

                <th>
                  Status
                </th>

                <th>
                  AI
                </th>

                <th>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredQuestions.map(
                (question, index) => {
                  const status =
                    question.status ||
                    (question.isPublished
                      ? "published"
                      : "pending");

                  return (
                    <tr
                      key={
                        question._id
                      }
                    >
                      <td>
                        <span className="mock-question-number">
                          {question.questionNumber ||
                            index + 1}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="mock-question-text"
                          onClick={() =>
                            onQuestionClick?.(
                              question
                            )
                          }
                        >
                          {question.question}
                        </button>

                        <small>
                          {question.chapter ||
                            "General"}
                        </small>
                      </td>

                      <td>
                        <div className="mock-test-name">
                          {question.testTitle ||
                            "Untitled Mock Test"}
                        </div>

                        {question.testId && (
                          <small>
                            ID:{" "}
                            {
                              question.testId
                            }
                          </small>
                        )}
                      </td>

                      <td>
                        {question.subject ||
                          "—"}
                      </td>

                      <td>
                        <span className="mock-exam-badge">
                          {question.examType ||
                            "NEET"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`mock-status mock-status-${status}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td>
                        {question.aiHasIssue ? (
                          <span className="mock-ai-issue">
                            Issue
                          </span>
                        ) : (
                          <span className="mock-ai-ok">
                            Checked
                          </span>
                        )}
                      </td>

                      <td>
                        <div className="mock-row-actions">
                          <button
                            type="button"
                            title="View"
                            onClick={() =>
                              onQuestionClick?.(
                                question
                              )
                            }
                          >
                            <Eye
                              size={16}
                            />
                          </button>

                          <button
                            type="button"
                            title="Edit"
                            onClick={() =>
                              onQuestionClick?.(
                                question
                              )
                            }
                          >
                            <Edit3
                              size={16}
                            />
                          </button>

                          <button
                            type="button"
                            title="Delete"
                            onClick={() =>
                              onDelete?.(
                                question
                              )
                            }
                          >
                            <Trash2
                              size={16}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="mock-test-footer">
        <span>
          Showing{" "}
          <strong>
            {filteredQuestions.length}
          </strong>{" "}
          of{" "}
          <strong>
            {questions.length}
          </strong>{" "}
          mock test questions
        </span>

        <span>
          Mock Test Question Management
        </span>
      </div>
    </section>
  );
}