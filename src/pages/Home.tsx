import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  ArrowRight,
  Atom,
  Calculator,
  ShieldCheck,
  BarChart3,
  HeartPulse,
  FlaskConical,
  Dna,
  Stethoscope,
} from "lucide-react";

import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  // =====================================================
  // START NEET PRACTICE
  // =====================================================

  const handleStartExam = () => {
    // IMPORTANT:
    // Student login token is stored as studentToken
    const token = localStorage.getItem("studentToken");

    if (!token) {
      alert(
        "⚠️ Login required! Please log in to begin the exam."
      );

      navigate("/login", {
        state: {
          redirectTo: "/mock-tests",
        },
      });

      return;
    }

    // Go to mock test / exam selection
    navigate("/mock-tests");
  };

  // =====================================================
  // HOME
  // =====================================================

  return (
    <>
      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <Navbar />

      {/* =====================================================
          HERO SECTION
      ====================================================== */}

      <section className="hero">

        <div className="hero-bg-wrapper">

          <img
            src="https://res.cloudinary.com/dlkborjdl/image/upload/v1785383712/IMG_20260730_091436_lkmtde.jpg"
            alt="NEET Exam Background"
            className="hero-custom-img"
            draggable={false}
          />

          <div className="hero-gradient-overlay"></div>

        </div>

        <div className="hero-content">

          <h1 className="hero-title-anim">
            Crack NEET & JEE With Confidence
            <br />
            <span></span>
          </h1>

          <p className="hero-desc-anim">
            Practice thousands of high-yield NEET & JEE
            questions, chapter-wise mock tests, and live
            face verification proctoring.
          </p>

          {/* =================================================
              HERO BUTTONS
          ================================================== */}

          <div className="hero-buttons">

            {/* NEET */}

            <button
              type="button"
              onClick={handleStartExam}
              className="start-btn active-live"
            >
              Start NEET Practice Now
              <ArrowRight size={18} />
            </button>

            {/* JEE */}

            <Link
              to="/jee-mock-tests"
              className="browse-btn"
            >
              Start JEE Practice Now
            </Link>

          </div>

        </div>

      </section>

      {/* =====================================================
          PREMIUM SUBJECTS SECTION
      ====================================================== */}

      <section className="subjects-premium-section">

        <div className="subjects-section-header">

          <div className="subjects-title-wrap">

            <span className="subjects-eyebrow">
              EXPLORE YOUR POTENTIAL
            </span>

            <h2>
              Master Every Subject.
              <span> Conquer Every Exam.</span>
            </h2>

            <p>
              Explore NEET & JEE subjects, strengthen your
              concepts, and practice with exam-focused
              questions.
            </p>

          </div>

          <div className="scroll-hint">

            <span>
              Swipe to explore
            </span>

            <ArrowRight size={17} />

          </div>

        </div>

        {/* =================================================
            HORIZONTAL SUBJECT SCROLL
        ================================================== */}

        <div className="subject-scroll-wrapper">

          <div className="subject-scroll-container">

            {/* =================================================
                PHYSICS
            ================================================== */}

            <div className="premium-subject-card">

              <div className="subject-card-top">

                <div className="premium-subject-icon physics">
                  <Atom size={30} />
                </div>

                <span className="subject-number"></span>

              </div>

              <div className="subject-card-content">

                <span className="subject-exam">
                  NEET • JEE
                </span>

                <h3>
                  Physics
                </h3>

                <p>
                  Mechanics, Thermodynamics, Optics &
                  Modern Physics
                </p>

              </div>

              <Link
                to="/subjects/physics"
                className="premium-subject-link"
              >
                <span>
                  Explore Physics
                </span>

                <ArrowRight size={17} />
              </Link>

            </div>

            {/* =================================================
                CHEMISTRY
            ================================================== */}

            <div className="premium-subject-card">

              <div className="subject-card-top">

                <div className="premium-subject-icon chemistry">
                  <FlaskConical size={30} />
                </div>

                <span className="subject-number"></span>

              </div>

              <div className="subject-card-content">

                <span className="subject-exam">
                  NEET • JEE
                </span>

                <h3>
                  Chemistry
                </h3>

                <p>
                  Organic, Inorganic & Physical Chemistry
                </p>

              </div>

              <Link
                to="/subjects/chemistry"
                className="premium-subject-link"
              >
                <span>
                  Explore Chemistry
                </span>

                <ArrowRight size={17} />
              </Link>

            </div>

            {/* =================================================
                BOTANY
            ================================================== */}

            <div className="premium-subject-card">

              <div className="subject-card-top">

                <div className="premium-subject-icon botany">
                  <Dna size={30} />
                </div>

                <span className="subject-number"></span>

              </div>

              <div className="subject-card-content">

                <span className="subject-exam">
                  NEET
                </span>

                <h3>
                  Botany
                </h3>

                <p>
                  Plant Physiology, Genetics, Ecology &
                  Cell Biology
                </p>

              </div>

              <Link
                to="/subjects/botany"
                className="premium-subject-link"
              >
                <span>
                  Explore Botany
                </span>

                <ArrowRight size={17} />
              </Link>

            </div>

            {/* =================================================
                ZOOLOGY
            ================================================== */}

            <div className="premium-subject-card">

              <div className="subject-card-top">

                <div className="premium-subject-icon zoology">
                  <HeartPulse size={30} />
                </div>

                <span className="subject-number"></span>

              </div>

              <div className="subject-card-content">

                <span className="subject-exam">
                  NEET
                </span>

                <h3>
                  Zoology
                </h3>

                <p>
                  Human Physiology, Evolution &
                  Reproduction
                </p>

              </div>

              <Link
                to="/subjects/zoology"
                className="premium-subject-link"
              >
                <span>
                  Explore Zoology
                </span>

                <ArrowRight size={17} />
              </Link>

            </div>

            {/* =================================================
                MATHEMATICS
            ================================================== */}

            <div className="premium-subject-card">

              <div className="subject-card-top">

                <div className="premium-subject-icon mathematics">
                  <Calculator size={30} />
                </div>

                <span className="subject-number"></span>

              </div>

              <div className="subject-card-content">

                <span className="subject-exam">
                  JEE
                </span>

                <h3>
                  Mathematics
                </h3>

                <p>
                  Algebra, Calculus, Coordinate Geometry &
                  Trigonometry
                </p>

              </div>

              <Link
                to="/subjects/mathematics"
                className="premium-subject-link"
              >
                <span>
                  Explore Mathematics
                </span>

                <ArrowRight size={17} />
              </Link>

            </div>

          </div>

        </div>

        {/* =================================================
            SCROLL INDICATOR
        ================================================== */}

        <div className="subject-scroll-bottom">

          <div className="scroll-line">
            <span></span>
          </div>

          <p>
            Scroll horizontally to explore all subjects
          </p>

        </div>

      </section>

      {/* =====================================================
          FEATURES SECTION
      ====================================================== */}

      <section className="features">

        <div className="section-header">

          <h2>
            Why NEET & JEE Aspirants Choose STG Exam Master?
          </h2>

          <p>
            Engineered for focused preparation with
            exam-oriented practice and secure testing.
          </p>

        </div>

        <div className="feature-grid">

          {/* FEATURE 1 */}

          <div className="feature-card">

            <div className="feat-icon-box">
              <Stethoscope size={24} />
            </div>

            <h3>
              NTA Pattern Mock Tests
            </h3>

            <p>
              Experience exam-focused formats with
              negative marking and detailed section
              breakdowns.
            </p>

          </div>

          {/* FEATURE 2 */}

          <div className="feature-card">

            <div className="feat-icon-box">
              <BarChart3 size={24} />
            </div>

            <h3>
              Detailed Diagnostic Analytics
            </h3>

            <p>
              Identify your weak chapters and improve
              your accuracy and calculation speed
              instantly.
            </p>

          </div>

          {/* FEATURE 3 */}

          <div className="feature-card">

            <div className="feat-icon-box">
              <ShieldCheck size={24} />
            </div>

            <h3>
              Secure Exam Environment
            </h3>

            <p>
              Advanced proctoring features like live
              face verification.
            </p>

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <Footer />

    </>
  );
}