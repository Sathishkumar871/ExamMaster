
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Result.css";


// ============================================================
// REVIEW
// ============================================================

interface Review {
  questionId: string;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  marks?: number;
}


// ============================================================
// RESULT DATA
// ============================================================

interface ResultData {

  _id?: string;

  examName: string;

  subject: string;

  testCategory?: "mock" | "daily" | "subject";

  totalQuestions: number;

  attemptedQuestions?: number;

  unansweredQuestions?: number;

  correctAnswers?: number;

  wrongAnswers?: number;

  marks?: number;

  percentage?: number;

  grade?: string;

  status?: string;

  timeTaken?: number;

  warnings?: number;

  review?: Review[];

  resultAvailableAt?: string;

  isResultPublished?: boolean;

  locked?: boolean;

  message?: string;
}


// ============================================================
// COMPONENT
// ============================================================

export default function Result() {

  const navigate = useNavigate();

  const { id } = useParams();


  const [loading, setLoading] =
    useState(true);


  const [result, setResult] =
    useState<ResultData | null>(null);


  const [error, setError] =
    useState("");


  // ============================================================
  // FETCH RESULT
  // ============================================================

  useEffect(() => {

    fetchResult();

  }, [id]);


  const fetchResult = async () => {

    try {

      setLoading(true);

      setError("");


      const response = await fetch(

        `https://exammaster-backend-up1y.onrender.com/api/result/${id}`

      );


      const data =
        await response.json();


      if (!response.ok || !data.success) {

        setError(
          data.message ||
          "Failed to load result"
        );

        return;

      }


      setResult(data.result);


    }

    catch (error) {

      console.log(
        "FETCH RESULT ERROR:",
        error
      );

      setError(
        "Unable to load result"
      );

    }

    finally {

      setLoading(false);

    }

  };


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {

    return (

      <div className="loading">

        Loading Result...

      </div>

    );

  }


  // ============================================================
  // ERROR
  // ============================================================

  if (error) {

    return (

      <div className="loading">

        {error}

      </div>

    );

  }


  // ============================================================
  // RESULT NOT FOUND
  // ============================================================

  if (!result) {

    return (

      <div className="loading">

        Result Not Found

      </div>

    );

  }


  // ============================================================
  // MOCK RESULT LOCKED
  // ============================================================

  if (result.locked) {

    const releaseTime =
      result.resultAvailableAt
        ? new Date(
            result.resultAvailableAt
          )
        : null;


    return (

      <div className="result-container">

        <div className="result-card locked-result">


          {/* ==================================================
              LOCK ICON
          ================================================== */}

          <div className="lock-icon">

            🔒

          </div>


          {/* ==================================================
              TITLE
          ================================================== */}

          <h1>

            Result Locked

          </h1>


          {/* ==================================================
              TEST NAME
          ================================================== */}

          <h2>

            {result.examName}

          </h2>


          {/* ==================================================
              SUBJECT
          ================================================== */}

          <p>

            Subject :

            <strong>

              {result.subject}

            </strong>

          </p>


          {/* ==================================================
              CATEGORY
          ================================================== */}

          <div className="locked-category">

            MOCK TEST

          </div>


          {/* ==================================================
              MESSAGE
          ================================================== */}

          <div className="locked-message">

            <h3>

              ⏳ Result will be available later

            </h3>


            <p>

              Your Mock Test has been submitted
              successfully.

            </p>


            <p>

              The result will be released
              <strong>
                {" "}
                tomorrow at 8:00 AM
              </strong>
              .

            </p>


            {releaseTime && (

              <p className="release-time">

                Release Time:{" "}

                <strong>

                  {releaseTime.toLocaleString()}

                </strong>

              </p>

            )}

          </div>


          {/* ==================================================
              BASIC TEST INFO
          ================================================== */}

          <div className="locked-info">

            <div>

              <span>
                Questions
              </span>

              <strong>
                {result.totalQuestions}
              </strong>

            </div>


            <div>

              <span>
                Status
              </span>

              <strong>
                Submitted
              </strong>

            </div>


          </div>


          {/* ==================================================
              BUTTONS
          ================================================== */}

          <div className="button-group">

            <button

              className="profile-btn"

              onClick={() =>
                navigate("/profile")
              }

            >

              👤 My Profile

            </button>


            <button

              className="dashboard-btn"

              onClick={() =>
                navigate("/")
              }

            >

              🏠 Dashboard

            </button>

          </div>


        </div>

      </div>

    );

  }


  // ============================================================
  // NORMAL RESULT
  // DAILY / SUBJECT / RELEASED MOCK
  // ============================================================

  return (

    <div className="result-container">


      <div className="result-card">


        {/* ==================================================
            HEADER
        ================================================== */}

        <h1>

          🎉 Exam Completed

        </h1>


        <h2>

          {result.examName}

        </h2>


        {/* ==================================================
            SUBJECT
        ================================================== */}

        <p>

          Subject :

          <strong>

            {result.subject}

          </strong>

        </p>


        {/* ==================================================
            CATEGORY
        ================================================== */}

        {result.testCategory && (

          <div className="test-category">

            {result.testCategory.toUpperCase()} TEST

          </div>

        )}


        {/* ==================================================
            SCORE
        ================================================== */}

        <div className="score-box">


          <div>

            <h3>
              Marks
            </h3>

            <p>
              {result.marks ?? 0}
            </p>

          </div>


          <div>

            <h3>
              Percentage
            </h3>

            <p>
              {result.percentage ?? 0}%
            </p>

          </div>


          <div>

            <h3>
              Grade
            </h3>

            <p>
              {result.grade ?? "F"}
            </p>

          </div>


        </div>


        {/* ==================================================
            RESULT GRID
        ================================================== */}

        <div className="result-grid">


          <div className="result-item">

            <h4>
              ✅ Correct
            </h4>

            <p>
              {result.correctAnswers ?? 0}
            </p>

          </div>


          <div className="result-item">

            <h4>
              ❌ Wrong
            </h4>

            <p>
              {result.wrongAnswers ?? 0}
            </p>

          </div>


          <div className="result-item">

            <h4>
              📝 Attempted
            </h4>

            <p>
              {result.attemptedQuestions ?? 0}
            </p>

          </div>


          <div className="result-item">

            <h4>
              📄 Skipped
            </h4>

            <p>
              {result.unansweredQuestions ?? 0}
            </p>

          </div>


          <div className="result-item">

            <h4>
              ⏱ Time
            </h4>

            <p>
              {result.timeTaken ?? 0} sec
            </p>

          </div>


          <div className="result-item">

            <h4>
              ⚠ Warnings
            </h4>

            <p>
              {result.warnings ?? 0}
            </p>

          </div>


        </div>


        {/* ==================================================
            STATUS
        ================================================== */}

        <div

          className={

            result.status === "PASS"

              ? "status pass"

              : "status fail"

          }

        >

          {result.status}

        </div>


        {/* ==================================================
            BUTTONS
        ================================================== */}

        <div className="button-group">


          <button

            className="profile-btn"

            onClick={() =>
              navigate("/profile")
            }

          >

            👤 My Profile

          </button>


          <button

            className="review-btn"

            onClick={() =>
              navigate(`/review/${id}`)
            }

          >

            📖 Review Answers

          </button>


          <button

            className="dashboard-btn"

            onClick={() =>
              navigate("/")
            }

          >

            🏠 Dashboard

          </button>


        </div>


      </div>

    </div>

  );

}

