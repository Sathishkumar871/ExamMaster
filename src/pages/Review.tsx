import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Review.css";

interface ReviewData {
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
}

interface ResultResponse {
  success: boolean;
  locked?: boolean;
  message?: string;
  result?: {
    examName: string;
    subject: string;
    testCategory: "mock" | "daily" | "subject";
    resultAvailableAt?: string;
    review?: ReviewData[];
  };
}

export default function Review() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchReview();
  }, [id]);

  const fetchReview = async () => {
    try {
      const response = await fetch(
        `https://exammaster-backend-up1y.onrender.com/api/result/${id}`
      );

      const data: ResultResponse = await response.json();

      if (!data.success) {
        setMessage(data.message || "Review not available");
        return;
      }

      // =====================================================
      // MOCK RESULT LOCK CHECK
      // =====================================================

      if (data.locked === true) {
        setLocked(true);

        setMessage(
          data.message ||
            "Mock test result will be available tomorrow at 8:00 AM."
        );

        return;
      }

      // =====================================================
      // RESULT AVAILABLE
      // DAILY / SUBJECT / RELEASED MOCK
      // =====================================================

      if (data.result) {
        setReviews(data.result.review || []);
      }
    } catch (error) {
      console.log("REVIEW ERROR:", error);

      setMessage("Failed to load review");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="review-page">
        <div className="review-loading">
          <h2>Loading Review...</h2>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MOCK LOCKED
  // ==========================================================

  if (locked) {
    return (
      <div className="review-page">
        <div className="review-locked-card">

          <div className="lock-icon">
            🔒
          </div>

          <h1>
            Result Locked
          </h1>

          <p>
            Mock Test result and answer review are locked.
          </p>

          <p className="release-message">
            📅 Result will be available tomorrow at <strong>8:00 AM</strong>.
          </p>

          <button
            className="back-result-btn"
            onClick={() => navigate(`/result/${id}`)}
          >
            ← Back to Result
          </button>

          <button
            className="dashboard-btn"
            onClick={() => navigate("/")}
          >
            🏠 Dashboard
          </button>

        </div>
      </div>
    );
  }

  // ==========================================================
  // NO REVIEW
  // ==========================================================

  if (reviews.length === 0) {
    return (
      <div className="review-page">

        <div className="review-empty">

          <h1>
            📖 Answer Review
          </h1>

          <h2>
            {message || "No Review Available"}
          </h2>

          <button
            onClick={() => navigate(`/result/${id}`)}
          >
            ← Back to Result
          </button>

        </div>

      </div>
    );
  }

  // ==========================================================
  // REVIEW PAGE
  // ==========================================================

  return (
    <div className="review-page">

      <h1>
        📖 Answer Review
      </h1>

      {reviews.map((item, index) => (

        <div
          className={
            item.isCorrect
              ? "review-card correct"
              : "review-card wrong"
          }
          key={index}
        >

          <h3>
            Q{index + 1}. {item.question}
          </h3>

          <p>
            Your Answer:
            <span>
              {item.selectedAnswer || "Not Answered"}
            </span>
          </p>

          <p>
            Correct Answer:
            <span>
              {item.correctAnswer}
            </span>
          </p>

          <h4>
            {item.isCorrect
              ? "✅ Correct"
              : "❌ Wrong"}
          </h4>

          {item.explanation && (
            <p className="explanation">
              💡 Explanation:
              <br />
              {item.explanation}
            </p>
          )}

        </div>

      ))}

    </div>
  );
}