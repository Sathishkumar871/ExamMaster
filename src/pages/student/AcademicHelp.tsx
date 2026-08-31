
import { useState } from "react";

import {
  ArrowRight,
  Brain,
  Clock3,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  Loader2,
  Send,
  Bot,
  Target,
  UserRound,
  X,
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
// LANGUAGE
// ============================================================

type AcademicLanguage =
  | "English"
  | "Kannada";

// ============================================================
// COMPONENT
// ============================================================

export default function AcademicHelp() {

  // ==========================================================
  // AI STATES
  // ==========================================================

  const [question, setQuestion] =
    useState("");

  const [answer, setAnswer] =
    useState("");

  const [loadingAI, setLoadingAI] =
    useState(false);

  const [aiError, setAiError] =
    useState("");

  // ==========================================================
  // LANGUAGE
  // ==========================================================

  const [language, setLanguage] =
    useState<AcademicLanguage>(
      "English"
    );

  // ==========================================================
  // COMING SOON
  // ==========================================================

  const [showComingSoon, setShowComingSoon] =
    useState(false);

  // ==========================================================
  // ASK AI
  // ==========================================================

  const askAI = async () => {

    const cleanQuestion =
      question.trim();

    if (
      !cleanQuestion ||
      loadingAI
    ) {
      return;
    }

    setLoadingAI(true);
    setAnswer("");
    setAiError("");

    try {

      const token =
        localStorage.getItem(
          "studentToken"
        ) ||
        localStorage.getItem(
          "token"
        );

      const response =
        await fetch(
          `${API_BASE_URL}/api/academic/ask`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              ...(token
                ? {
                    Authorization:
                      `Bearer ${token}`,
                  }
                : {}),
            },

            body: JSON.stringify({
              question:
                cleanQuestion,

              language,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.message ||
            "Unable to get AI answer"
        );

      }

      setAnswer(
        data.answer ||
          "No answer available."
      );

    } catch (error: any) {

      console.error(
        "Academic AI Error:",
        error
      );

      setAiError(
        error.message ||
          "Something went wrong. Please try again."
      );

    } finally {

      setLoadingAI(false);

    }
  };

  // ==========================================================
  // STUDENT AI TOOLS
  // ==========================================================

  const helpItems = [

    {
      icon: Brain,

      number: "01",

      title:
        "AI Exam Strategy",

      description:
        "Get a personalized preparation strategy to understand how to approach your exams more effectively.",

      link:
        "/exam-strategy",

      label:
        "Build My Strategy",

      className:
        "strategy-tool-card",

      comingSoon:
        false,
    },

    {
      icon: Clock3,

      number: "02",

      title:
        "Study Time Planner",

      description:
        "Create a smarter subject-wise study schedule and organize your preparation time effectively.",

      link:
        "/study-planner",

      label:
        "Plan My Study Time",

      className:
        "time-tool-card",

      comingSoon:
        false,
    },

    {
      icon: GraduationCap,

      number: "03",

      title:
        "AI Concept Builder",

      description:
        "Understand difficult concepts through simple explanations, examples, formulas and exam-focused guidance.",

      link:
        "",

      label:
        "Coming Soon",

      className:
        "concept-builder-tool-card",

      comingSoon:
        true,
    },
  ];

  // ==========================================================
  // RETURN
  // ==========================================================

  return (

    <div className="academic-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="academic-hero">

        {/* GLOW */}

        <div
          className="academic-glow glow-one"
        />

        <div
          className="academic-glow glow-two"
        />

        <div className="academic-hero-content">

          {/* ==================================================
              BADGE
          ================================================== */}

          <span className="academic-badge">

            <GraduationCap
              size={15}
            />

            ACADEMIC SUPPORT CENTER

          </span>


          {/* ==================================================
              TITLE
          ================================================== */}

          <h1>

            Learn smarter.

            <span>
              {" "}Prepare better.
            </span>

          </h1>


          <p>
            Get instant academic help,
            understand difficult concepts
            and prepare smarter with
            ExamMaster AI.
          </p>


          {/* ==================================================
              AI DOUBT SOLVER
          ================================================== */}

          <div
            id="ask-ai"
            className="academic-ai-box"
          >

            {/* =================================================
                AI LABEL
            ================================================= */}

            <div className="academic-ai-label">

              <Bot
                size={17}
              />

              <span>
                EXAMMASTER AI • DOUBT SOLVER
              </span>

            </div>


            {/* =================================================
                PREMIUM AI SEARCH
            ================================================= */}

            <div className="academic-ai-search">

              {/* SEARCH ICON */}

              <div className="academic-ai-search-icon">

                <Lightbulb
                  size={19}
                />

              </div>


              {/* INPUT */}

              <input
                id="academic-ai-question"
                type="text"
                value={question}
                onChange={(e) =>
                  setQuestion(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {

                  if (
                    e.key === "Enter" &&
                    !loadingAI
                  ) {

                    askAI();

                  }

                }}
                placeholder="Ask your academic question..."
                autoComplete="off"
                aria-label="Academic question"
              />


              {/* SEND */}

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
                    size={18}
                    className="ai-spinner"
                  />

                ) : (

                  <Send
                    size={18}
                  />

                )}

              </button>

            </div>


            {/* =================================================
                SEARCH HINT
            ================================================= */}

            <div className="academic-ai-hint">

              Ask any study question —
              Physics, Chemistry, Biology,
              Maths & more.

            </div>


            {/* =================================================
                LANGUAGE SELECTOR
            ================================================= */}

            <div className="academic-language-selector">

              <span>
                Answer in:
              </span>


              {/* ENGLISH */}

              <button
                type="button"
                className={
                  language === "English"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setLanguage(
                    "English"
                  )
                }
                aria-pressed={
                  language === "English"
                }
              >
                English
              </button>


              {/* KANNADA */}

              <button
                type="button"
                className={
                  language === "Kannada"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setLanguage(
                    "Kannada"
                  )
                }
                aria-pressed={
                  language === "Kannada"
                }
              >
                ಕನ್ನಡ
              </button>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="academic-content">


        {/* ====================================================
            AI ANSWER
        ==================================================== */}

        {(loadingAI ||
          answer ||
          aiError) && (

          <section
            className="academic-ai-answer"
          >

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="ai-answer-header">

              <div className="ai-answer-brand">

                <div className="ai-answer-icon">

                  <Brain
                    size={21}
                  />

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

                <span
                  className="ai-status-dot"
                />

                AI Assistant

              </div>

            </div>


            {/* ==================================================
                LOADING
            ================================================== */}

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
                    Preparing a clear
                    academic explanation
                    for you.
                  </p>

                </div>

              </div>

            )}


            {/* ==================================================
                ERROR
            ================================================== */}

            {aiError &&
              !loadingAI && (

                <div className="ai-error">

                  <HelpCircle
                    size={20}
                  />

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


            {/* ==================================================
                ANSWER
            ================================================== */}

            {answer &&
              !loadingAI && (

                <div className="ai-answer-content">

                  {/* QUESTION */}

                  <div className="ai-question-block">

                    <div className="ai-block-label">

                      <UserRound
                        size={15}
                      />

                      YOUR QUESTION

                    </div>

                    <p>
                      {question}
                    </p>

                  </div>


                  {/* ANSWER */}

                  <div className="ai-response-block">

                    <div className="ai-block-label">

                      <Brain
                        size={15}
                      />

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
              YOUR AI ACADEMIC TOOLS
            </span>

            <h2>
              Everything you need
              to study better
            </h2>

            <p>
              Plan your preparation,
              understand concepts and
              get focused academic help
              using ExamMaster AI.
            </p>

          </div>

        </div>


        {/* ====================================================
            THREE CARDS
        ==================================================== */}

        <div className="academic-grid academic-grid-three">

          {helpItems.map((item) => {

            const Icon = item.icon;

            const cardContent = (

              <>

                {/* CARD TOP */}

                <div className="academic-card-top">

                  <div className="academic-icon">

                    <Icon
                      size={24}
                    />

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

                    <ArrowRight
                      size={17}
                    />

                  </div>

                </div>

              </>

            );


            // ==================================================
            // COMING SOON
            // ==================================================

            if (item.comingSoon) {

              return (

                <button
                  type="button"
                  key={item.title}
                  className={
                    `academic-card ${item.className}`
                  }
                  onClick={() =>
                    setShowComingSoon(true)
                  }
                  aria-label={
                    `${item.title} - Coming Soon`
                  }
                >
                  {cardContent}
                </button>

              );

            }


            // ==================================================
            // NORMAL LINK
            // ==================================================

            return (

              <Link
                to={item.link}
                className={
                  `academic-card ${item.className}`
                }
                key={item.title}
              >
                {cardContent}
              </Link>

            );

          })}

        </div>


        {/* ====================================================
            PERSONALIZED LEARNING
        ==================================================== */}

        <section className="academic-info">

          <div className="academic-info-icon">

            <Target
              size={24}
            />

          </div>


          <div>

            <span>
              PERSONALIZED LEARNING
            </span>

            <h3>
              Your results. Your plan.
              Your progress.
            </h3>

            <p>
              ExamMaster helps you
              understand difficult concepts,
              prepare more effectively and
              improve your academic
              performance.
            </p>

          </div>

        </section>

      </main>


      {/* =====================================================
          COMING SOON MODAL
      ===================================================== */}

      {showComingSoon && (

        <div
          className="coming-soon-overlay"
          onClick={() =>
            setShowComingSoon(false)
          }
          role="presentation"
        >

          <div
            className="coming-soon-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="coming-soon-title"
          >

            {/* CLOSE */}

            <button
              type="button"
              className="coming-soon-close"
              onClick={() =>
                setShowComingSoon(false)
              }
              aria-label="Close"
            >
              <X
                size={17}
              />
            </button>


            {/* ICON */}

            <div className="coming-soon-icon">

              <Bot
                size={28}
              />

            </div>


            {/* BADGE */}

            <span className="coming-soon-badge">

              EXAMMASTER AI

            </span>


            {/* TITLE */}

            <h3 id="coming-soon-title">

              AI Concept Builder

            </h3>


            {/* DESCRIPTION */}

            <p>

              This feature is coming soon.
              It will help you understand
              difficult concepts with simple
              explanations, examples, formulas
              and exam-focused guidance.

            </p>


            {/* BUTTON */}

            <button
              type="button"
              className="coming-soon-ok"
              onClick={() =>
                setShowComingSoon(false)
              }
            >
              Got it
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

