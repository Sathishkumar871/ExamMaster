import React from "react";
import {
  Eye,
  RefreshCw,
  CheckCircle2,
  Clock3,
  XCircle,
  Sparkles,
  FileText,
  CalendarDays,
  ClipboardList,
  BookOpen,
} from "lucide-react";

import type { Question } from "../QuestionBank";

interface QuestionTableProps {
  questions: Question[];
  loading: boolean;
  onQuestionClick: (question: Question) => void;
  onRefresh: () => void;
}

const getCategoryLabel = (
  category?: Question["testCategory"]
) => {
  switch (category) {
    case "subject":
      return "Subject";

    case "daily":
      return "Daily Test";

    case "mock":
      return "Mock Test";

    default:
      return "Question";
  }
};

const getCategoryIcon = (
  category?: Question["testCategory"]
) => {
  switch (category) {
    case "subject":
      return <BookOpen size={14} />;

    case "daily":
      return <CalendarDays size={14} />;

    case "mock":
      return <ClipboardList size={14} />;

    default:
      return <FileText size={14} />;
  }
};

const getStatus = (question: Question) => {
  if (
    question.isPublished === true ||
    question.status === "published"
  ) {
    return {
      label: "Published",
      className: "published",
      icon: <CheckCircle2 size={13} />,
    };
  }

  if (question.status === "rejected") {
    return {
      label: "Rejected",
      className: "rejected",
      icon: <XCircle size={13} />,
    };
  }

  return {
    label: "Pending",
    className: "pending",
    icon: <Clock3 size={13} />,
  };
};

const getAIStatus = (question: Question) => {
  if (question.aiHasIssue) {
    return {
      label: "Issue",
      className: "issue",
    };
  }

  if (question.aiStatus === "processing") {
    return {
      label: "Checking",
      className: "processing",
    };
  }

  if (question.aiStatus === "completed") {
    return {
      label: "Checked",
      className: "completed",
    };
  }

  if (question.aiStatus === "failed") {
    return {
      label: "Failed",
      className: "failed",
    };
  }

  return {
    label: "Pending",
    className: "pending",
  };
};

const QuestionTable: React.FC<QuestionTableProps> = ({
  questions,
  loading,
  onQuestionClick,
  onRefresh,
}) => {
  if (loading) {
    return (
      <div className="question-table-state">
        <div className="question-table-loader">
          <RefreshCw
            size={25}
            className="question-bank-spin"
          />
        </div>

        <strong>
          Loading Question Bank
        </strong>

        <span>
          Fetching questions from the server...
        </span>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="question-table-state question-table-empty">
        <div className="question-empty-icon">
          <FileText size={28} />
        </div>

        <strong>
          No Questions Found
        </strong>

        <span>
          No questions match the selected
          filters.
        </span>

        <button
          type="button"
          onClick={onRefresh}
          className="question-empty-refresh"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="question-table-wrapper">
      <div className="question-table-scroll">
        <table className="question-table">
          <thead>
            <tr>
              <th>NO.</th>

              <th>QUESTION</th>

              <th>SUBJECT</th>

              <th>CHAPTER</th>

              <th>TYPE</th>

              <th>STATUS</th>

              <th>AI REVIEW</th>

              <th>ACTION</th>
            </tr>
          </thead>

          <tbody>
            {questions.map(
              (question, index) => {
                const status =
                  getStatus(question);

                const aiStatus =
                  getAIStatus(question);

                const number =
                  question.globalQuestionNumber ??
                  question.questionNumber ??
                  index + 1;

                return (
                  <tr
                    key={question._id}
                    className={
                      question.aiHasIssue
                        ? "has-ai-issue"
                        : ""
                    }
                  >
                    {/* NUMBER */}
                    <td>
                      <div className="question-number">
                        {number}
                      </div>
                    </td>

                    {/* QUESTION */}
                    <td>
                      <button
                        type="button"
                        className="question-cell"
                        onClick={() =>
                          onQuestionClick(
                            question
                          )
                        }
                      >
                        <span className="question-main-text">
                          {question.question}
                        </span>

                        <span className="question-meta">
                          {question.options?.length ||
                            0}{" "}
                          Options

                          {question.source && (
                            <>
                              {" • "}
                              {question.source.toUpperCase()}
                            </>
                          )}
                        </span>
                      </button>
                    </td>

                    {/* SUBJECT */}
                    <td>
                      <div className="question-subject">
                        {question.subject ||
                          "—"}
                      </div>
                    </td>

                    {/* CHAPTER */}
                    <td>
                      <div className="question-chapter">
                        {question.chapter ||
                          "—"}
                      </div>
                    </td>

                    {/* TYPE */}
                    <td>
                      <div
                        className={`question-category ${question.testCategory || "default"}`}
                      >
                        {getCategoryIcon(
                          question.testCategory
                        )}

                        <span>
                          {getCategoryLabel(
                            question.testCategory
                          )}
                        </span>
                      </div>

                      {question.testTitle && (
                        <div className="question-test-title">
                          {question.testTitle}
                        </div>
                      )}
                    </td>

                    {/* STATUS */}
                    <td>
                      <span
                        className={`question-status ${status.className}`}
                      >
                        {status.icon}

                        {status.label}
                      </span>
                    </td>

                    {/* AI */}
                    <td>
                      <span
                        className={`question-ai-status ${aiStatus.className}`}
                      >
                        <Sparkles
                          size={13}
                        />

                        {aiStatus.label}
                      </span>
                    </td>

                    {/* ACTION */}
                    <td>
                      <button
                        type="button"
                        className="question-view-btn"
                        onClick={() =>
                          onQuestionClick(
                            question
                          )
                        }
                        title="Review question"
                      >
                        <Eye size={16} />

                        <span>
                          Review
                        </span>
                      </button>
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>

      {/* TABLE FOOTER */}

      <div className="question-table-footer">
        <div>
          Showing{" "}
          <strong>
            {questions.length}
          </strong>{" "}
          questions
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="question-table-refresh"
        >
          <RefreshCw
            size={14}
            className={
              loading
                ? "question-bank-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>
    </div>
  );
};

export default QuestionTable;