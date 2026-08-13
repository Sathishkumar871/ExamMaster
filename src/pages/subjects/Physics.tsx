
import {
  Atom,
  ArrowRight,
  BookOpen,
  Clock3,
  Target,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getStudentQuestions } from "../../services/api";

import "./Physics.css";


// ============================================================
// CHAPTER DATA
// ============================================================

const chapters = [
  {
    id: "01",
    name: "Mechanics",
    description:
      "Motion, force, work, energy, momentum and rotational motion.",
    icon: Atom,
  },

  {
    id: "02",
    name: "Thermodynamics",
    description:
      "Heat, temperature, laws of thermodynamics and thermal processes.",
    icon: Target,
  },

  {
    id: "03",
    name: "Electrodynamics",
    description:
      "Electric fields, current electricity, magnetism and electromagnetic induction.",
    icon: Atom,
  },

  {
    id: "04",
    name: "Optics",
    description:
      "Ray optics, wave optics, mirrors, lenses and optical instruments.",
    icon: Target,
  },

  {
    id: "05",
    name: "Modern Physics",
    description:
      "Atoms, nuclei, dual nature, semiconductors and modern physics concepts.",
    icon: Atom,
  },

  {
    id: "06",
    name: "Waves & Oscillations",
    description:
      "Simple harmonic motion, waves, sound and oscillatory motion.",
    icon: Clock3,
  },
];


// ============================================================
// TYPES
// ============================================================

interface Question {
  _id: string;

  question: string;

  options: string[];

  correctAnswer?: string;

  subject?: string;

  chapter?: string;

  testType?: string;

  testTitle?: string;

  isPublished?: boolean;
}


// ============================================================
// COMPONENT
// ============================================================

export default function Physics() {

  const navigate = useNavigate();


  // ==========================================================
  // STATES
  // ==========================================================

  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");



  // ==========================================================
  // LOAD PHYSICS QUESTIONS
  // ==========================================================

  useEffect(() => {

    const loadPhysicsQuestions =
      async () => {

        try {

          setLoading(true);

          setError("");


          const data =
            await getStudentQuestions({

              subject: "Physics",

              testType: "subject",

            });


          console.log(
            "PHYSICS QUESTIONS:",
            data
          );


          setQuestions(
            data?.questions || []
          );

        } catch (error) {

          console.error(
            "Physics questions loading error:",
            error
          );

          setError(
            "Unable to load Physics questions."
          );

        } finally {

          setLoading(false);

        }

      };


    loadPhysicsQuestions();

  }, []);



  // ==========================================================
  // GET CHAPTER QUESTION COUNT
  // ==========================================================

  const getChapterCount =
    (chapterName: string) => {

      return questions.filter(
        (question) =>
          question.chapter?.trim().toLowerCase() ===
          chapterName.trim().toLowerCase()
      ).length;

    };



  // ==========================================================
  // START PRACTICE
  // ==========================================================

  const startPractice =
    (chapterName: string) => {

      const chapterQuestions =
        questions.filter(
          (question) =>
            question.chapter?.trim().toLowerCase() ===
            chapterName.trim().toLowerCase()
        );


      console.log(
        `Starting ${chapterName}`,
        chapterQuestions
      );


      // ------------------------------------------------------
      // If no questions available
      // ------------------------------------------------------

      if (chapterQuestions.length === 0) {

        alert(
          `No questions available for ${chapterName} yet.`
        );

        return;

      }


      // ------------------------------------------------------
      // Navigate to practice page
      // ------------------------------------------------------

      navigate(
        `/physics/practice/${encodeURIComponent(
          chapterName
        )}`
      );

    };



  // ==========================================================
  // TOTAL QUESTIONS
  // ==========================================================

  const totalQuestions =
    questions.length;



  // ==========================================================
  // TOTAL CHAPTERS WITH QUESTIONS
  // ==========================================================

  const activeChapters =
    chapters.filter(
      (chapter) =>
        getChapterCount(chapter.name) > 0
    ).length;



  // ==========================================================
  // UI
  // ==========================================================

  return (

    <main className="physics-page">

      <div className="physics-container">


        {/* ==================================================
            HERO
        ================================================== */}

        <section className="physics-hero">

          <div className="physics-hero-content">


            <div className="physics-badge">

              <Atom size={15} />

              NEET • JEE PHYSICS

            </div>



            <h1 className="physics-title">

              Physics

              <span>
                Master Concepts. Improve Accuracy.
              </span>

            </h1>



            <p className="physics-description">

              Practice Physics chapter-wise with focused
              questions and exam-oriented tests designed
              for NEET & JEE preparation.

            </p>



            {/* ==================================================
                STATS
            ================================================== */}

            <div className="physics-stats">


              <div className="physics-stat">

                <span className="physics-stat-value">

                  {loading
                    ? "..."
                    : `${totalQuestions}+`}

                </span>

                <span className="physics-stat-label">

                  Questions

                </span>

              </div>



              <div className="physics-stat">

                <span className="physics-stat-value">

                  {loading
                    ? "..."
                    : activeChapters}

                </span>

                <span className="physics-stat-label">

                  Active Chapters

                </span>

              </div>



              <div className="physics-stat">

                <span className="physics-stat-value">

                  NEET

                </span>

                <span className="physics-stat-label">

                  Exam Pattern

                </span>

              </div>


            </div>

          </div>

        </section>



        {/* ==================================================
            CHAPTER SECTION
        ================================================== */}

        <section>


          <div className="physics-section-header">

            <div>

              <h2 className="physics-section-title">

                Physics Chapters

              </h2>


              <p className="physics-section-subtitle">

                Select a chapter and start your practice.

              </p>

            </div>

          </div>



          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (

            <div className="physics-error">

              {error}

            </div>

          )}



          {/* ==================================================
              LOADING
          ================================================== */}

          {loading ? (

            <div className="physics-loading">

              <div className="physics-loading-spinner" />

              <p>
                Loading Physics questions...
              </p>

            </div>

          ) : (


            /* ==================================================
               CHAPTER GRID
            ================================================== */

            <div className="physics-chapter-grid">


              {chapters.map(
                (chapter) => {

                  const Icon =
                    chapter.icon;


                  const questionCount =
                    getChapterCount(
                      chapter.name
                    );


                  return (

                    <div
                      className={`physics-chapter-card ${
                        questionCount === 0
                          ? "physics-chapter-empty"
                          : ""
                      }`}
                      key={chapter.id}
                    >


                      {/* ======================================
                          CARD TOP
                      ====================================== */}

                      <div className="physics-card-top">


                        <div className="physics-chapter-icon">

                          <Icon size={24} />

                        </div>


                        <span className="physics-chapter-number">

                          {chapter.id}

                        </span>


                      </div>



                      {/* ======================================
                          CARD CONTENT
                      ====================================== */}

                      <div className="physics-card-content">


                        <h3>

                          {chapter.name}

                        </h3>


                        <p>

                          {chapter.description}

                        </p>



                        {/* ====================================
                            QUESTION COUNT
                        ==================================== */}

                        <div className="physics-question-count">

                          <BookOpen size={15} />

                          <span>

                            {questionCount}

                            {" "}

                            {questionCount === 1
                              ? "Question"
                              : "Questions"}

                          </span>

                        </div>



                        {/* ====================================
                            START BUTTON
                        ==================================== */}

                        <button
                          className="physics-test-button"
                          disabled={
                            questionCount === 0
                          }
                          onClick={() =>
                            startPractice(
                              chapter.name
                            )
                          }
                        >

                          <BookOpen size={16} />

                          {questionCount === 0
                            ? "Coming Soon"
                            : "Start Practice"}

                          <ArrowRight size={15} />

                        </button>


                      </div>

                    </div>

                  );

                }
              )}

            </div>

          )}

        </section>

      </div>

    </main>

  );

}

