import { useState, useEffect } from "react";
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
  Clock,
  Lock,
  X,
  UserCheck,
} from "lucide-react";

import "./Home.css";

const TARGET_HOUR = 22;
const TARGET_MINUTE = 50;

export default function Home() {
  const [showExamModal, setShowExamModal] = useState(false);
  const [isLive, setIsLive] = useState(false);

  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const navigate = useNavigate();

  // =====================================================
  // EXAM COUNTDOWN
  // =====================================================

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const target = new Date();

      target.setHours(TARGET_HOUR, TARGET_MINUTE, 0, 0);

      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setIsLive(true);

        setTimeLeft({
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
      } else {
        setIsLive(false);

        const hours = Math.floor(
          (diff / (1000 * 60 * 60)) % 24
        );

        const minutes = Math.floor(
          (diff / (1000 * 60)) % 60
        );

        const seconds = Math.floor(
          (diff / 1000) % 60
        );

        setTimeLeft({
          hours,
          minutes,
          seconds,
        });
      }
    };

    updateCountdown();

    const interval = setInterval(
      updateCountdown,
      1000
    );

    return () => clearInterval(interval);
  }, []);

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (time: number) => {
    return String(time).padStart(2, "0");
  };

  // =====================================================
  // START EXAM
  // =====================================================

  const handleStartExam = () => {
    if (!isLive) {
      setShowExamModal(true);
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert(
        "⚠️ Login required! Please log in to begin the exam and face verification."
      );

      navigate("/login", {
        state: {
          redirectTo: "/mock-tests",
        },
      });

      return;
    }

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


          <div className="hero-buttons">

            {isLive ? (

              <button
                onClick={handleStartExam}
                className="start-btn active-live"
              >

                Start NEET Practice Now

                <ArrowRight size={18} />

              </button>

            ) : (

              <button
                className="locked-hero-btn"
                onClick={() =>
                  setShowExamModal(true)
                }
              >

                <Lock size={18} />

                Locked • Opens in{" "}

                {formatTime(timeLeft.hours)}:
                {formatTime(timeLeft.minutes)}:
                {formatTime(timeLeft.seconds)}

              </button>

            )}


            <Link
              to="/subjects"
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

                <span className="subject-number">
                  
                </span>

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

                <span className="subject-number">
                  
                </span>

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

                <span className="subject-number">
                  
                </span>

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

                <span className="subject-number">
                  
                </span>

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

                <span className="subject-number">
                  
                </span>

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
          EXAM MODAL
      ====================================================== */}

      {showExamModal && (

        <div
          className="exam-modal-backdrop"
          onClick={() =>
            setShowExamModal(false)
          }
        >

          <div
            className="exam-modal-content"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* MODAL HEADER */}

            <div className="alert-header">

              <span className="alert-title-wrapper">

                <Clock
                  size={20}
                  className="alert-icon"
                />

                <strong>
                  NEET Weekly Grand Test Schedule
                </strong>

              </span>


              <button
                className="close-alert-btn"
                onClick={() =>
                  setShowExamModal(false)
                }
                aria-label="Close"
              >

                <X size={18} />

              </button>

            </div>


            {/* MODAL BODY */}

            <div className="modal-body-content">

              {isLive ? (

                /* =================================================
                    LIVE EXAM
                ================================================== */

                <div className="live-status-container">

                  <div className="live-badge">

                    <span className="pulse-dot"></span>

                    🔴 EXAM IS LIVE NOW

                  </div>


                  <h3>
                    The Weekly NEET Mock Test Has Started!
                  </h3>


                  <p>
                    Please ensure you are logged in to
                    start camera verification.
                  </p>


                  <button
                    className="start-exam-now-btn active-live"
                    onClick={handleStartExam}
                  >

                    <UserCheck size={18} />

                    Verify Login & Start Exam

                  </button>

                </div>

              ) : (

                /* =================================================
                    COUNTDOWN
                ================================================== */

                <div className="countdown-container">

                  <p className="schedule-info">

                    Exam Scheduled Today at{" "}

                    <strong>
                      10:50 PM
                    </strong>

                    <br />

                    The{" "}

                    <strong>
                      "Start Exam Now"
                    </strong>{" "}

                    button will automatically activate
                    once countdown hits 00:00:00.

                  </p>


                  <div className="timer-grid">


                    {/* HOURS */}

                    <div className="timer-box">

                      <span className="digit">

                        {formatTime(
                          timeLeft.hours
                        )}

                      </span>

                      <span className="label">
                        Hours
                      </span>

                    </div>


                    <span className="colon">
                      :
                    </span>


                    {/* MINUTES */}

                    <div className="timer-box">

                      <span className="digit">

                        {formatTime(
                          timeLeft.minutes
                        )}

                      </span>

                      <span className="label">
                        Mins
                      </span>

                    </div>


                    <span className="colon">
                      :
                    </span>


                    {/* SECONDS */}

                    <div className="timer-box">

                      <span className="digit">

                        {formatTime(
                          timeLeft.seconds
                        )}

                      </span>

                      <span className="label">
                        Secs
                      </span>

                    </div>

                  </div>


                  <button
                    className="waiting-btn locked-disabled"
                    disabled
                  >

                    <Lock size={16} />

                    Waiting for 10:50 PM...

                  </button>

                </div>

              )}

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <Footer />

    </>
  );
}