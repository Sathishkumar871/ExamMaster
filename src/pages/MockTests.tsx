import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FaceVerification from "../components/FaceVerification";
import ExamHeader from "../components/ExamHeader";
import Timer from "../components/Timer";
import QuestionCard from "../components/QuestionCard";
import QuestionPalette from "../components/QuestionPalette";

import "./MockTests.css";

export default function MockTests() {
  const { examId } = useParams(); // URL నుండి examId తీసుకోవడానికి

  // ఒకవేళ URL లో ఐడీ రాకపోతే, మీ డేటాబేస్‌లోని పబ్లిష్ అయిన ఎగ్జామ్ ఐడీని ఇక్కడ రాయండి
  const fallbackExamId = "YOUR_PUBLISHED_EXAM_ID_HERE"; 
  const activeExamId = examId || fallbackExamId;
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [verified, setVerified] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [warnings, setWarnings] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1800);

  // LocalStorage నుండి Student వివరాలు తీసుకోవడం
  const student = JSON.parse(localStorage.getItem("student") || "{}");
  const studentId = student.studentId || student._id || student.id;
  const studentName = student.name || "Student";

  // ==============================
  // Disable Browser Back
  // ==============================
  useEffect(() => {
    if (!examStarted) return;

    window.history.pushState(null, "", window.location.href);

    const handleBack = () => {
      window.history.pushState(null, "", window.location.href);
      alert("You cannot leave the exam.");
    };

    window.addEventListener("popstate", handleBack);

    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, [examStarted]);

  // ==============================
  // Warn Before Refresh
  // ==============================
  useEffect(() => {
    if (!examStarted) return;

    const beforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", beforeUnload);

    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [examStarted]);

  // ==============================
  // Start Exam
  // ==============================
  const startExam = async () => {
    if (!verified) {
      alert("Please complete face verification first.");
      return;
    }

    if (!studentId) {
      alert("Student ID not found. Please log in again.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/exam/start",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId,
            examId: activeExamId, // బ్యాకెండ్ అడిగే examId ఇక్కడ పంపుతున్నాము
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setSessionId(data.sessionId || "");
        setExamStarted(true);
      } else {
        alert(data.message || "No published mock tests found.");
      }
    } catch (error) {
      console.log("Error starting exam:", error);
      alert("Failed to start exam. Please try again.");
    }
  };

  // ==============================
  // Select Answer
  // ==============================
  const selectAnswer = (answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: answer,
    }));
  };

  // ==============================
  // Exit Exam
  // ==============================
  const exitExam = () => {
    const ok = window.confirm("Submit exam and exit?");
    if (ok) {
      submitExam();
    }
  };

  // ==============================
  // Submit Exam
  // ==============================
  const submitExam = async () => {
    try {
      const formattedAnswers = Object.keys(answers).map((key) => {
        const qIndex = Number(key);
        const q = questions[qIndex];
        return {
          questionId: q?.questionId || q?._id || q?.id,
          answer: answers[qIndex],
        };
      });

      const response = await fetch(
        "http://localhost:5000/api/exam/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId,
            studentName,
            sessionId, // బ్యాకెండ్ submitExam కోడ్ ప్రకారం sessionId పంపాలి
            answers: formattedAnswers,
            warnings,
            timeTaken: 1800 - timeLeft,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Exam Submitted Successfully");
        window.location.href = "/result";
      } else {
        alert(data.message || "Submission failed");
      }
    } catch (error) {
      console.log("SUBMIT ERROR:", error);
      alert("Exam submit failed");
    }
  };

  // ==============================
  // Time Over
  // ==============================
  const timeOver = () => {
    alert("Time Over");
    submitExam();
  };

  return (
    <div className="mock-container">
      {!examStarted ? (
        <div className="start-screen">
          <h1 className="exam-title">ExamMaster AI Mock Test</h1>
          <p className="exam-subtitle">
            Complete face verification before starting the examination.
          </p>

          <div className="face-section">
            <FaceVerification
              onVerified={() => {
                setVerified(true);
              }}
              onViolation={(count) => {
                setWarnings(count);
                if (count >= 5) {
                  alert("Too many violations.");
                  submitExam();
                }
              }}
            />
          </div>

          <button
            className="start-btn"
            disabled={!verified}
            onClick={startExam}
          >
            {verified ? "Start Mock Test" : "Verify Face First"}
          </button>
        </div>
      ) : (
        <div className="exam-screen">
          <ExamHeader
            timeLeft={timeLeft}
            answered={Object.keys(answers).length}
            total={questions.length}
            warnings={warnings}
            onExit={exitExam}
          />

          <div className="timer-wrapper">
            <Timer
              timeLeft={timeLeft}
              setTimeLeft={setTimeLeft}
              onTimeOver={timeOver}
            />
          </div>

          <div className="progress-wrapper">
            <div
              className="progress-fill"
              style={{
                width: `${
                  (Object.keys(answers).length / questions.length) * 100
                }%`,
              }}
            ></div>
          </div>

          <div className="progress-text">
            Answered <b>{Object.keys(answers).length}</b> / <b>{questions.length}</b>
          </div>

          <div className="exam-layout">
            <div className="exam-left">
              {questions.length > 0 && (
                <QuestionCard
                  question={questions[currentQuestion]}
                  questionNumber={currentQuestion + 1}
                  totalQuestions={questions.length}
                  selectedAnswer={answers[currentQuestion] || ""}
                  onSelectAnswer={selectAnswer}
                  onPrevious={() => {
                    setCurrentQuestion((prev) => prev - 1);
                  }}
                  onNext={() => {
                    if (currentQuestion < questions.length - 1) {
                      setCurrentQuestion((prev) => prev + 1);
                    } else {
                      submitExam();
                    }
                  }}
                  isFirst={currentQuestion === 0}
                  isLast={currentQuestion === questions.length - 1}
                />
              )}
            </div>

            <div className="exam-right">
              <QuestionPalette
                totalQuestions={questions.length}
                currentQuestion={currentQuestion}
                answers={answers}
                onSelectQuestion={(index) => {
                  setCurrentQuestion(index);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}