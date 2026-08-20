import React, { useEffect, useState } from "react";
import {
  X,
  Save,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileText,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Loader2,
} from "lucide-react";

import type { Question } from "../QuestionBank";

interface QuestionReviewProps {
  question: Question;
  onClose: () => void;
  onUpdated: (question: Question) => void;
  onDeleted: (questionId: string) => void;
}

const API_BASE_URL =
  "https://exammaster-backend-up1y.onrender.com/api";

const getToken = () => {
  return (
    localStorage.getItem("headToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    ""
  );
};

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

const QuestionReview: React.FC<
  QuestionReviewProps
> = ({
  question,
  onClose,
  onUpdated,
  onDeleted,
}) => {
  const [questionText, setQuestionText] =
    useState(question.question || "");

  const [options, setOptions] = useState<string[]>(
    question.options?.length === 4
      ? [...question.options]
      : [
          question.options?.[0] || "",
          question.options?.[1] || "",
          question.options?.[2] || "",
          question.options?.[3] || "",
        ]
  );

  const [correctAnswer, setCorrectAnswer] =
    useState(question.correctAnswer || "");

  const [explanation, setExplanation] =
    useState(
      question.explanation ||
        question.aiExplanation ||
        ""
    );

  const [subject, setSubject] =
    useState(question.subject || "");

  const [chapter, setChapter] =
    useState(question.chapter || "");

  const [status, setStatus] =
    useState<Question["status"]>(
      question.status || "pending"
    );

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    setQuestionText(question.question || "");

    setOptions(
      question.options?.length === 4
        ? [...question.options]
        : [
            question.options?.[0] || "",
            question.options?.[1] || "",
            question.options?.[2] || "",
            question.options?.[3] || "",
          ]
    );

    setCorrectAnswer(
      question.correctAnswer || ""
    );

    setExplanation(
      question.explanation ||
        question.aiExplanation ||
        ""
    );

    setSubject(question.subject || "");
    setChapter(question.chapter || "");
    setStatus(question.status || "pending");

    setError("");
    setSuccess("");
  }, [question]);

  const updateOption = (
    index: number,
    value: string
  ) => {
    setOptions((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
  };

  const handleSave = async () => {
    if (!questionText.trim()) {
      setError("Question cannot be empty.");
      return;
    }

    if (options.some((option) => !option.trim())) {
      setError("All four options are required.");
      return;
    }

    if (!correctAnswer.trim()) {
      setError("Please select the correct answer.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_BASE_URL}/question-bank/${question._id}`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify({
            question: questionText.trim(),
            options,
            correctAnswer,
            explanation: explanation.trim(),
            subject: subject.trim(),
            chapter: chapter.trim(),
            status,
            isPublished:
              status === "published",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to update question."
        );
      }

      const updatedQuestion =
        data?.question || {
          ...question,
          question: questionText.trim(),
          options,
          correctAnswer,
          explanation:
            explanation.trim(),
          subject: subject.trim(),
          chapter: chapter.trim(),
          status,
          isPublished:
            status === "published",
        };

      onUpdated(updatedQuestion);

      setSuccess(
        "Question updated successfully."
      );
    } catch (err: any) {
      console.error(
        "QUESTION UPDATE ERROR:",
        err
      );

      setError(
        err?.message ||
          "Failed to update question."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setStatus("published");

    setTimeout(() => {
      handleSave();
    }, 0);
  };

  const handleApprove = async () => {
    setStatus("approved");

    setTimeout(() => {
      handleSave();
    }, 0);
  };

  const handleReject = async () => {
    setStatus("rejected");

    setTimeout(() => {
      handleSave();
    }, 0);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?"
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/question-bank/${question._id}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to delete question."
        );
      }

      onDeleted(question._id);
    } catch (err: any) {
      console.error(
        "QUESTION DELETE ERROR:",
        err
      );

      setError(
        err?.message ||
          "Failed to delete question."
      );
    } finally {
      setDeleting(false);
    }
  };

  const getCategoryIcon = () => {
    if (question.testCategory === "daily") {
      return <CalendarDays size={15} />;
    }

    if (question.testCategory === "mock") {
      return <ClipboardList size={15} />;
    }

    return <BookOpen size={15} />;
  };

  return (
    <div
      className="question-review-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="question-review-panel">
        {/* HEADER */}

        <div className="question-review-header">
          <div className="question-review-header-info">
            <div className="question-review-icon">
              <FileText size={21} />
            </div>

            <div>
              <span>
                QUESTION REVIEW
              </span>

              <h2>
                Review & Edit Question
              </h2>

              <p>
                Question #{question.globalQuestionNumber ??
                  question.questionNumber ??
                  "—"}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="question-review-close"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* META */}

        <div className="question-review-meta">
          <span>
            {getCategoryIcon()}

            {question.testCategory ===
            "daily"
              ? "Daily Test"
              : question.testCategory ===
                "mock"
              ? "Mock Test"
              : "Subject"}
          </span>

          {question.subject && (
            <span>
              <BookOpen size={14} />
              {question.subject}
            </span>
          )}

          {question.chapter && (
            <span>
              Chapter: {question.chapter}
            </span>
          )}

          {question.source && (
            <span>
              Source:{" "}
              {question.source.toUpperCase()}
            </span>
          )}
        </div>

        {/* BODY */}

        <div className="question-review-body">
          {/* ERROR */}

          {error && (
            <div className="question-review-alert error">
              <AlertCircle size={17} />

              <span>{error}</span>
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="question-review-alert success">
              <CheckCircle2 size={17} />

              <span>{success}</span>
            </div>
          )}

          {/* QUESTION */}

          <section className="question-review-section">
            <div className="question-review-section-title">
              <span>
                Question
              </span>

              <small>
                Required
              </small>
            </div>

            <textarea
              className="question-review-question-input"
              value={questionText}
              onChange={(event) =>
                setQuestionText(
                  event.target.value
                )
              }
              rows={5}
              placeholder="Enter question..."
            />
          </section>

          {/* OPTIONS */}

          <section className="question-review-section">
            <div className="question-review-section-title">
              <span>
                Answer Options
              </span>

              <small>
                Select correct answer
              </small>
            </div>

            <div className="question-review-options">
              {options.map(
                (option, index) => {
                  const letter =
                    String.fromCharCode(
                      65 + index
                    );

                  const selected =
                    correctAnswer ===
                    option &&
                    option.trim() !== "";

                  return (
                    <div
                      key={index}
                      className={`question-review-option ${
                        selected
                          ? "selected"
                          : ""
                      }`}
                    >
                      <button
                        type="button"
                        className="question-answer-radio"
                        onClick={() =>
                          setCorrectAnswer(
                            option
                          )
                        }
                        title="Mark as correct answer"
                      >
                        {selected && (
                          <CheckCircle2
                            size={18}
                          />
                        )}

                        {!selected && (
                          <span />
                        )}
                      </button>

                      <div className="question-option-letter">
                        {letter}
                      </div>

                      <input
                        type="text"
                        value={option}
                        onChange={(event) =>
                          updateOption(
                            index,
                            event.target
                              .value
                          )
                        }
                        placeholder={`Option ${letter}`}
                      />
                    </div>
                  );
                }
              )}
            </div>
          </section>

          {/* DETAILS */}

          <section className="question-review-section">
            <div className="question-review-section-title">
              <span>
                Question Details
              </span>
            </div>

            <div className="question-review-details-grid">
              <label>
                <span>
                  Subject
                </span>

                <input
                  type="text"
                  value={subject}
                  onChange={(event) =>
                    setSubject(
                      event.target.value
                    )
                  }
                  placeholder="Subject"
                />
              </label>

              <label>
                <span>
                  Chapter
                </span>

                <input
                  type="text"
                  value={chapter}
                  onChange={(event) =>
                    setChapter(
                      event.target.value
                    )
                  }
                  placeholder="Chapter"
                />
              </label>

              <label>
                <span>
                  Status
                </span>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target
                        .value as QuestionStatus
                    )
                  }
                >
                  <option value="pending">
                    Pending
                  </option>

                  <option value="approved">
                    Approved
                  </option>

                  <option value="published">
                    Published
                  </option>

                  <option value="rejected">
                    Rejected
                  </option>
                </select>
              </label>
            </div>
          </section>

          {/* EXPLANATION */}

          <section className="question-review-section">
            <div className="question-review-section-title">
              <span>
                Explanation
              </span>

              {question.aiExplanation && (
                <small>
                  <Sparkles size={13} />
                  AI Generated
                </small>
              )}
            </div>

            <textarea
              value={explanation}
              onChange={(event) =>
                setExplanation(
                  event.target.value
                )
              }
              rows={5}
              placeholder="Add explanation..."
              className="question-review-explanation"
            />
          </section>

          {/* AI INFORMATION */}

          <section className="question-review-ai-box">
            <div className="question-review-ai-icon">
              <Sparkles size={18} />
            </div>

            <div>
              <strong>
                AI Review
              </strong>

              <p>
                AI status:{" "}
                <b>
                  {question.aiStatus ||
                    "pending"}
                </b>
              </p>

              {question.aiHasIssue && (
                <span>
                  This question has been
                  flagged for AI review.
                </span>
              )}
            </div>
          </section>
        </div>

        {/* FOOTER */}

        <div className="question-review-footer">
          <button
            type="button"
            className="question-delete-btn"
            onClick={handleDelete}
            disabled={
              deleting || saving
            }
          >
            {deleting ? (
              <Loader2
                size={16}
                className="question-bank-spin"
              />
            ) : (
              <Trash2 size={16} />
            )}

            Delete
          </button>

          <div className="question-review-footer-right">
            <button
              type="button"
              className="question-review-cancel"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="button"
              className="question-review-approve"
              onClick={handleApprove}
              disabled={saving}
            >
              {saving ? (
                <Loader2
                  size={16}
                  className="question-bank-spin"
                />
              ) : (
                <CheckCircle2
                  size={16}
                />
              )}

              Approve
            </button>

            <button
              type="button"
              className="question-review-publish"
              onClick={handlePublish}
              disabled={saving}
            >
              {saving ? (
                <Loader2
                  size={16}
                  className="question-bank-spin"
                />
              ) : (
                <CheckCircle2
                  size={16}
                />
              )}

              Publish
            </button>

            <button
              type="button"
              className="question-review-save"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2
                  size={16}
                  className="question-bank-spin"
                />
              ) : (
                <Save size={16} />
              )}

              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionReview;