import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Clock3,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  Loader2,
  Send,
  
  UserRound,
} from "lucide-react";

import { Link } from "react-router-dom";
import "./AcademicHelp.css";

// ============================================================
// API BASE URL
// ============================================================

const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://exammaster-backend-up1y.onrender.com";

// ============================================================
// COMPONENT
// ============================================================

export default function AcademicHelp() {
  // ============================================================
  // AI STATES
  // ============================================================

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState("");

  // ============================================================
  // ASK AI
  // ============================================================

  const askAI = async () => {
    const cleanQuestion = question.trim();

    if (!cleanQuestion || loadingAI) return;

    setLoadingAI(true);
    setAnswer("");
    setAiError("");

    try {
      const token =
        localStorage.getItem("studentToken") ||
        localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/academic/ask`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },

          body: JSON.stringify({
            question: cleanQuestion,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to get AI answer"
        );
      }

      setAnswer(
        data.answer || "No answer available."
      );
    } catch (error: any) {
      console.error("Academic AI Error:", error);

      setAiError(
        error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoadingAI(false);
    }
  };

  // ============================================================
  // QUICK QUESTIONS
  // ============================================================

  const askQuickQuestion = (text: string) => {
    setQuestion(text);
    setAnswer("");
    setAiError("");

    setTimeout(() => {
      const input = document.getElementById(
        "academic-ai-question"
      ) as HTMLInputElement | null;

      input?.focus();
    }, 50);
  };

  // ============================================================
  // ONLY 3 STUDENT TOOLS
  // ============================================================

  const helpItems = [
    {
      icon: Lightbulb,
      number: "01",
      title: "AI Doubt Solver",
      description:
        "Ask any academic doubt and get clear, simple and step-by-step explanations from ExamMaster AI.",
      link: "#ask-ai",
      label: "Ask Your Doubt",
      className: "ai-tool-card",
    },

    {
      icon: Clock3,
      number: "02",
      title: "Study Time Planner",
      description:
        "Organize your daily study hours, divide time between subjects and build a focused study routine.",
      link: "/study-planner",
      label: "Plan Study Time",
      className: "time-tool-card",
    },

    {
      icon: BarChart3,
      number: "03",
      title: "Weak Area Analysis",
      description:
        "Analyze your previous performance and identify subjects and topics that need more attention.",
      link: "/weak-areas",
      label: "Analyze Performance",
      className: "weak-area-tool-card",
    },
  ];

  // ============================================================
  // RETURN
  // ============================================================

  return (
    <div className="academic-page">

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="academic-hero">

        <div className="academic-glow glow-one" />
        <div className="academic-glow glow-two" />

        <div className="academic-hero-content">

          {/* BADGE */}

          <span className="academic-badge">
            <GraduationCap size={15} />
            ACADEMIC SUPPORT CENTER
          </span>

          {/* TITLE */}

          <h1>
            Learn smarter.
            <span> Prepare better.</span>
          </h1>

          <p>
            Get instant academic help, manage your
            study time and discover where you need
            to improve — all from one place.
          </p>

          {/* ==================================================
              AI DOUBT SOLVER
          ================================================== */}

          <div
            id="ask-ai"
            className="academic-ai-box"
          >

            <div className="academic-ai-label">
              

              <span>
                EXAMMASTER AI • DOUBT SOLVER
              </span>
            </div>

            <div className="academic-ai-input">

              <Lightbulb size={19} />

              <input
                id="academic-ai-question"
                type="text"
                value={question}
                onChange={(e) =>
                  setQuestion(e.target.value)
                }
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !loadingAI
                  ) {
                    askAI();
                  }
                }}
                placeholder="Ask any academic question..."
                autoComplete="off"
              />

              <button
                type="button"
                onClick={askAI}
                disabled={
                  loadingAI ||
                  !question.trim()
                }
                aria-label="Ask ExamMaster AI"
              >
                {loadingAI ? (
                  <Loader2
                    size={19}
                    className="ai-spinner"
                  />
                ) : (
                  <Send size={19} />
                )}
              </button>

            </div>

            {/* QUICK QUESTIONS */}

            <div className="academic-ai-hints">

              <span>
                Try asking:
              </span>

              <button
                type="button"
                onClick={() =>
                  askQuickQuestion(
                    "Explain Newton's second law in simple words"
                  )
                }
              >
                Newton's Second Law
              </button>

              <button
                type="button"
                onClick={() =>
                  askQuickQuestion(
                    "What is photosynthesis?"
                  )
                }
              >
                Photosynthesis
              </button>

              <button
                type="button"
                onClick={() =>
                  askQuickQuestion(
                    "Explain Kirchhoff's law with an example"
                  )
                }
              >
                Kirchhoff's Law
              </button>

              <button
                type="button"
                onClick={() =>
                  askQuickQuestion(
                    "How can I improve my exam preparation?"
                  )
                }
              >
                Preparation Tips
              </button>

            </div>

          </div>

        </div>
      </section>

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="academic-content">

        {/* ====================================================
            AI ANSWER
        ==================================================== */}

        {(loadingAI || answer || aiError) && (
          <section className="academic-ai-answer">

            {/* ANSWER HEADER */}

            <div className="ai-answer-header">

              <div className="ai-answer-brand">

                <div className="ai-answer-icon">
                 
                </div>

                <div>
                  <span>
                    EXAMMASTER AI
                  </span>

                  <h3>
                    Academic Assistant
                  </h3>
                </div>

              </div>

              <div className="ai-status">
                <span className="ai-status-dot" />
                AI Assistant
              </div>

            </div>

            {/* LOADING */}

            {loadingAI && (
              <div className="ai-loading">

                <div className="ai-loading-icon">
                  <Loader2
                    size={23}
                    className="ai-spinner"
                  />
                </div>

                <div>
                  <strong>
                    Thinking...
                  </strong>

                  <p>
                    Preparing a clear academic
                    explanation for you.
                  </p>
                </div>

              </div>
            )}

            {/* ERROR */}

            {aiError && !loadingAI && (
              <div className="ai-error">

                <HelpCircle size={20} />

                <div>
                  <strong>
                    Unable to answer
                  </strong>

                  <p>
                    {aiError}
                  </p>
                </div>

              </div>
            )}

            {/* ANSWER */}

            {answer && !loadingAI && (
              <div className="ai-answer-content">

                {/* USER QUESTION */}

                <div className="ai-question-block">

                  <div className="ai-block-label">
                    <UserRound size={15} />
                    YOUR QUESTION
                  </div>

                  <p>
                    {question}
                  </p>

                </div>

                {/* AI RESPONSE */}

                <div className="ai-response-block">

                  <div className="ai-block-label">
                   
                    AI ANSWER
                  </div>

                  <div className="ai-response-text">
                    {answer}
                  </div>

                </div>

              </div>
            )}

          </section>
        )}

        {/* ====================================================
            SECTION HEADER
        ==================================================== */}

        <div className="academic-heading">

          <div>

            <span>
              YOUR ACADEMIC TOOLS
            </span>

            <h2>
              Everything you need
              to study better
            </h2>

            <p>
              Solve your doubts, manage your
              study time and identify the areas
              where you need to improve.
            </p>

          </div>

        </div>

        {/* ====================================================
            ONLY 3 CARDS
        ==================================================== */}

        <div className="academic-grid academic-grid-three">

          {helpItems.map((item) => {

            const Icon = item.icon;

            return (
              <Link
                to={item.link}
                className={`academic-card ${item.className}`}
                key={item.title}

                onClick={(e) => {

                  // AI card scrolls to AI box
                  if (item.link === "#ask-ai") {

                    e.preventDefault();

                    document
                      .getElementById("ask-ai")
                      ?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });

                    setTimeout(() => {
                      document
                        .getElementById(
                          "academic-ai-question"
                        )
                        ?.focus();
                    }, 500);
                  }

                }}
              >

                {/* CARD TOP */}

                <div className="academic-card-top">

                  <div className="academic-icon">
                    <Icon size={24} />
                  </div>

                  <span>
                    {item.number}
                  </span>

                </div>

                {/* CARD BODY */}

                <div className="academic-card-body">

                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    {item.description}
                  </p>

                </div>

                {/* CARD BOTTOM */}

                <div className="academic-card-bottom">

                  <span>
                    {item.label}
                  </span>

                  <div className="academic-arrow">
                    <ArrowRight size={17} />
                  </div>

                </div>

              </Link>
            );
          })}

        </div>

        {/* ====================================================
            BOTTOM INFO
        ==================================================== */}

        <section className="academic-info">

          <div className="academic-info-icon">
            <Lightbulb size={24} />
          </div>

          <div>

            <span>
              STUDY SMART
            </span>

            <h3>
              Understand. Plan. Improve.
            </h3>

            <p>
              Clear your doubts, use your available
              study time wisely and focus more on
              the subjects and topics where you need
              improvement.
            </p>

          </div>

        </section>

      </main>

    </div>
  );
}