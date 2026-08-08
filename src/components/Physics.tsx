import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Physics.css";

interface Exam {
  _id: string;
  title: string;
  subject: string;
  chapter?: string;
  duration: number;
  totalQuestions: number;
  status?: string;
  isPublished?: boolean;
}

export default function Physics() {
  const navigate = useNavigate();

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getPhysicsExams = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:5000/api/exams",
        {
          params: {
            examType: "NEET",
            subject: "Physics",
            status: "published",
            isPublished: true,
          },
        }
      );

      console.log(
        "Physics Exams:",
        response.data
      );

      const examData =
        response.data.exams ||
        response.data.data ||
        [];

      setExams(examData);
    } catch (error: any) {
      console.log(
        "Physics Error:",
        error.response?.data ||
          error.message
      );

      setError(
        error.response?.data?.message ||
          "Unable to load Physics exams"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPhysicsExams();
  }, []);

  const startExam = (examId: string) => {
    navigate(`/exam/${examId}`);
  };

  return (
    <div className="physics-page">

      {/* HEADER */}

      <div className="physics-header">
        <div>
          <div className="physics-icon">
            ⚛️
          </div>

          <h1>NEET Physics</h1>

          <p>
            Physics exams and practice tests
          </p>
        </div>
      </div>

      {/* TITLE */}

      <div className="physics-title">
        <h2>Physics Exams</h2>

        <p>
          Choose an exam and start your
          Physics preparation.
        </p>
      </div>

      {/* LOADING */}

      {loading && (
        <div className="physics-loading">
          Loading Physics Exams...
        </div>
      )}

      {/* ERROR */}

      {!loading && error && (
        <div className="physics-error">
          {error}
        </div>
      )}

      {/* NO EXAMS */}

      {!loading &&
        !error &&
        exams.length === 0 && (
          <div className="physics-empty">

            <div className="empty-icon">
              📚
            </div>

            <h3>
              No Physics Exams Available
            </h3>

            <p>
              Published Physics exams
              will appear here.
            </p>

          </div>
        )}

      {/* EXAMS */}

      {!loading &&
        exams.length > 0 && (

          <div className="physics-exam-grid">

            {exams.map((exam) => (

              <div
                className="physics-exam-card"
                key={exam._id}
              >

                <div className="exam-top">

                  <span className="physics-badge">
                    ⚛️ Physics
                  </span>

                  <span className="published-badge">
                    Published
                  </span>

                </div>

                <h3>
                  {exam.title}
                </h3>

                {exam.chapter && (
                  <p className="exam-chapter">
                    📖 {exam.chapter}
                  </p>
                )}

                <div className="exam-details">

                  <div>
                    📝
                    <span>
                      {exam.totalQuestions}
                      {" "}Questions
                    </span>
                  </div>

                  <div>
                    ⏱️
                    <span>
                      {exam.duration}
                      {" "}Minutes
                    </span>
                  </div>

                </div>

                <button
                  className="start-physics-btn"
                  onClick={() =>
                    startExam(exam._id)
                  }
                >
                  Start Physics Exam →
                </button>

              </div>

            ))}

          </div>
        )}

    </div>
  );
}