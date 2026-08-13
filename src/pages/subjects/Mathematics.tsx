import {
  Calculator,
  ArrowRight,
  BookOpen,
  Sigma,
  Triangle,
  FunctionSquare,
  BarChart3,
  Target,
} from "lucide-react";

import "./Mathematics.css";

export default function Mathematics() {
  return (
    <main className="mathematics-page">

      <div className="mathematics-container">

        {/* =====================================================
            HERO
        ====================================================== */}

        <section className="mathematics-hero">

          <div className="mathematics-hero-glow"></div>

          <div className="mathematics-hero-content">

            <div className="mathematics-badge">
              <Calculator size={15} />
              JEE • MATHEMATICS
            </div>

            <h1 className="mathematics-title">
              Mathematics

              <span>
                Master Problems. Maximize Your Score.
              </span>
            </h1>

            <p className="mathematics-description">
              Strengthen your JEE Mathematics preparation
              with chapter-wise practice, concept-based
              questions and exam-oriented tests.
            </p>

            {/* =================================================
                STATS
            ================================================== */}

            <div className="mathematics-stats">

              <div className="mathematics-stat">

                <span className="mathematics-stat-value">
                  50+
                </span>

                <span className="mathematics-stat-label">
                  Questions
                </span>

              </div>


              <div className="mathematics-stat">

                <span className="mathematics-stat-value">
                  12+
                </span>

                <span className="mathematics-stat-label">
                  Chapters
                </span>

              </div>


              <div className="mathematics-stat">

                <span className="mathematics-stat-value">
                  JEE
                </span>

                <span className="mathematics-stat-label">
                  Exam Pattern
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            CHAPTER SECTION
        ====================================================== */}

        <section className="mathematics-chapters-section">

          <div className="mathematics-section-header">

            <div>

              <span className="mathematics-section-eyebrow">
                JEE PREPARATION
              </span>

              <h2 className="mathematics-section-title">
                Mathematics Chapters
              </h2>

              <p className="mathematics-section-subtitle">
                Select a chapter and start your focused practice.
              </p>

            </div>

          </div>


          {/* =================================================
              CHAPTER GRID
          ================================================== */}

          <div className="mathematics-chapter-grid">


            {/* =================================================
                ALGEBRA
            ================================================== */}

            <div className="mathematics-chapter-card">

              <div className="mathematics-card-top">

                <div className="mathematics-chapter-icon algebra">
                  <Sigma size={24} />
                </div>

                <span className="mathematics-chapter-number">
                  01
                </span>

              </div>


              <div className="mathematics-card-content">

                <span className="mathematics-card-tag">
                  ALGEBRA
                </span>

                <h3>
                  Algebra
                </h3>

                <p>
                  Quadratic equations, sequences, series,
                  permutations, combinations and complex numbers.
                </p>


                <button
                  className="mathematics-test-button"
                  onClick={() =>
                    console.log("Algebra clicked")
                  }
                >

                  <BookOpen size={16} />

                  Start Practice

                  <ArrowRight size={15} />

                </button>

              </div>

            </div>


            {/* =================================================
                CALCULUS
            ================================================== */}

            <div className="mathematics-chapter-card">

              <div className="mathematics-card-top">

                <div className="mathematics-chapter-icon calculus">
                  <FunctionSquare size={24} />
                </div>

                <span className="mathematics-chapter-number">
                  02
                </span>

              </div>


              <div className="mathematics-card-content">

                <span className="mathematics-card-tag">
                  CALCULUS
                </span>

                <h3>
                  Calculus
                </h3>

                <p>
                  Limits, continuity, differentiation,
                  integration and differential equations.
                </p>


                <button
                  className="mathematics-test-button"
                  onClick={() =>
                    console.log("Calculus clicked")
                  }
                >

                  <BookOpen size={16} />

                  Start Practice

                  <ArrowRight size={15} />

                </button>

              </div>

            </div>


            {/* =================================================
                COORDINATE GEOMETRY
            ================================================== */}

            <div className="mathematics-chapter-card">

              <div className="mathematics-card-top">

                <div className="mathematics-chapter-icon coordinate">
                  <Triangle size={24} />
                </div>

                <span className="mathematics-chapter-number">
                  03
                </span>

              </div>


              <div className="mathematics-card-content">

                <span className="mathematics-card-tag">
                  GEOMETRY
                </span>

                <h3>
                  Coordinate Geometry
                </h3>

                <p>
                  Straight lines, circles, parabola, ellipse
                  and hyperbola with JEE-level problems.
                </p>


                <button
                  className="mathematics-test-button"
                  onClick={() =>
                    console.log("Coordinate Geometry clicked")
                  }
                >

                  <BookOpen size={16} />

                  Start Practice

                  <ArrowRight size={15} />

                </button>

              </div>

            </div>


            {/* =================================================
                TRIGONOMETRY
            ================================================== */}

            <div className="mathematics-chapter-card">

              <div className="mathematics-card-top">

                <div className="mathematics-chapter-icon trigonometry">
                  <Triangle size={24} />
                </div>

                <span className="mathematics-chapter-number">
                  04
                </span>

              </div>


              <div className="mathematics-card-content">

                <span className="mathematics-card-tag">
                  TRIGONOMETRY
                </span>

                <h3>
                  Trigonometry
                </h3>

                <p>
                  Trigonometric ratios, identities, equations
                  and inverse trigonometric functions.
                </p>


                <button
                  className="mathematics-test-button"
                  onClick={() =>
                    console.log("Trigonometry clicked")
                  }
                >

                  <BookOpen size={16} />

                  Start Practice

                  <ArrowRight size={15} />

                </button>

              </div>

            </div>


            {/* =================================================
                MATRICES & DETERMINANTS
            ================================================== */}

            <div className="mathematics-chapter-card">

              <div className="mathematics-card-top">

                <div className="mathematics-chapter-icon matrices">
                  <BarChart3 size={24} />
                </div>

                <span className="mathematics-chapter-number">
                  05
                </span>

              </div>


              <div className="mathematics-card-content">

                <span className="mathematics-card-tag">
                  LINEAR ALGEBRA
                </span>

                <h3>
                  Matrices & Determinants
                </h3>

                <p>
                  Matrix operations, determinants,
                  inverse matrices and system of equations.
                </p>


                <button
                  className="mathematics-test-button"
                  onClick={() =>
                    console.log("Matrices clicked")
                  }
                >

                  <BookOpen size={16} />

                  Start Practice

                  <ArrowRight size={15} />

                </button>

              </div>

            </div>


            {/* =================================================
                VECTOR & 3D
            ================================================== */}

            <div className="mathematics-chapter-card">

              <div className="mathematics-card-top">

                <div className="mathematics-chapter-icon vector">
                  <Target size={24} />
                </div>

                <span className="mathematics-chapter-number">
                  06
                </span>

              </div>


              <div className="mathematics-card-content">

                <span className="mathematics-card-tag">
                  VECTOR & 3D
                </span>

                <h3>
                  Vector & 3D Geometry
                </h3>

                <p>
                  Vectors, lines, planes, direction ratios
                  and three-dimensional geometry.
                </p>


                <button
                  className="mathematics-test-button"
                  onClick={() =>
                    console.log("Vector & 3D clicked")
                  }
                >

                  <BookOpen size={16} />

                  Start Practice

                  <ArrowRight size={15} />

                </button>

              </div>

            </div>


            {/* =================================================
                PROBABILITY
            ================================================== */}

            <div className="mathematics-chapter-card">

              <div className="mathematics-card-top">

                <div className="mathematics-chapter-icon probability">
                  <BarChart3 size={24} />
                </div>

                <span className="mathematics-chapter-number">
                  07
                </span>

              </div>


              <div className="mathematics-card-content">

                <span className="mathematics-card-tag">
                  PROBABILITY
                </span>

                <h3>
                  Probability
                </h3>

                <p>
                  Probability concepts, conditional probability,
                  Bayes theorem and random variables.
                </p>


                <button
                  className="mathematics-test-button"
                  onClick={() =>
                    console.log("Probability clicked")
                  }
                >

                  <BookOpen size={16} />

                  Start Practice

                  <ArrowRight size={15} />

                </button>

              </div>

            </div>


            {/* =================================================
                STATISTICS
            ================================================== */}

            <div className="mathematics-chapter-card">

              <div className="mathematics-card-top">

                <div className="mathematics-chapter-icon statistics">
                  <BarChart3 size={24} />
                </div>

                <span className="mathematics-chapter-number">
                  08
                </span>

              </div>


              <div className="mathematics-card-content">

                <span className="mathematics-card-tag">
                  STATISTICS
                </span>

                <h3>
                  Statistics
                </h3>

                <p>
                  Mean, variance, standard deviation and
                  statistical analysis for JEE preparation.
                </p>


                <button
                  className="mathematics-test-button"
                  onClick={() =>
                    console.log("Statistics clicked")
                  }
                >

                  <BookOpen size={16} />

                  Start Practice

                  <ArrowRight size={15} />

                </button>

              </div>

            </div>


          </div>


          {/* =================================================
              BOTTOM CTA
          ================================================== */}

          <div className="mathematics-bottom-cta">

            <div className="mathematics-cta-icon">
              <Calculator size={26} />
            </div>

            <div className="mathematics-cta-content">

              <span>
                JEE MATHEMATICS
              </span>

              <h2>
                Ready to challenge yourself?
              </h2>

              <p>
                Practice chapter-wise questions and improve
                your problem-solving speed.
              </p>

            </div>


            <button
              className="mathematics-cta-button"
              onClick={() =>
                console.log("Mathematics practice clicked")
              }
            >

              Start Practice

              <ArrowRight size={16} />

            </button>

          </div>

        </section>

      </div>

    </main>
  );
}