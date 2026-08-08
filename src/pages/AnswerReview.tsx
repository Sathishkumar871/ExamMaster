import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AnswerReview.css";

interface Review {

  questionId: string;

  question: string;

  selectedAnswer: string;

  correctAnswer: string;

  isCorrect: boolean;

}

interface ResultData {

  review: Review[];

}

export default function AnswerReview() {

  const navigate = useNavigate();

  const [review, setReview] = useState<Review[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    loadReview();

  }, []);

  const loadReview = async () => {

    try {

      const studentId =
        localStorage.getItem("studentId");

      const response =
        await fetch(

          `http://localhost:5000/api/result/latest/${studentId}`

        );

      const data =
        await response.json();

      if (data.success) {

        setReview(data.result.review);

      }

    }

    catch (error) {

      console.log(error);

    }

    finally {

      setLoading(false);

    }

  };

  if (loading) {

    return <h1>Loading...</h1>;

  }

  return (

    <div className="review-container">

      <h1>

        Answer Review

      </h1>

      {
        review.map((item, index) => (

          <div

            className="review-card"

            key={item.questionId}

          >

            <h2>

              Question {index + 1}

            </h2>

            <h3>

              {item.question}

            </h3>
                        <div className="answer-section">

              <div className="answer-box your-answer">

                <h4>📝 Your Answer</h4>

                <p>

                  {item.selectedAnswer || "Not Answered"}

                </p>

              </div>



              <div className="answer-box correct-answer">

                <h4>✅ Correct Answer</h4>

                <p>

                  {item.correctAnswer}

                </p>

              </div>

            </div>



            <div
              className={
                item.isCorrect
                  ? "answer-status correct"
                  : "answer-status wrong"
              }
            >

              {

                item.isCorrect

                  ? "✅ Correct"

                  : "❌ Wrong"

              }

            </div>

          </div>

        ))
      }

      <div className="review-buttons">

        <button

          className="result-btn"

          onClick={() => navigate("/result")}

        >

          ← Back To Result

        </button>



        <button

          className="profile-btn"

          onClick={() => navigate("/profile")}

        >

          👤 My Profile

        </button>

      </div>

    </div>

  );

}