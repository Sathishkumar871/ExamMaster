import {
  ArrowRight,
  BookOpen,
  Dna,
  HeartPulse,
  Microscope,
  Stethoscope,
  Target,
  Bug,
} from "lucide-react";

import "./Zoology.css";

export default function Zoology() {
  const handlePractice = (chapter: string) => {
    console.log(`${chapter} clicked`);
  };

  return (
    <main className="zoology-page">

      <div className="zoology-container">

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="zoology-hero">

          <div className="zoology-hero-glow"></div>

          <div className="zoology-hero-content">

            <div className="zoology-badge">
              <HeartPulse size={16} />
              NEET • ZOOLOGY
            </div>

            <h1 className="zoology-title">
              Zoology

              <span>
                Understand Life. Master Biology.
              </span>
            </h1>

            <p className="zoology-description">
              Practice Zoology chapter-wise with
              NEET-focused questions, important concepts
              and exam-oriented practice tests.
            </p>

            {/* =================================================
                STATS
            ================================================= */}

            <div className="zoology-stats">

              <div className="zoology-stat">

                <span className="zoology-stat-value">
                  50+
                </span>

                <span className="zoology-stat-label">
                  Questions
                </span>

              </div>


              <div className="zoology-stat">

                <span className="zoology-stat-value">
                  10+
                </span>

                <span className="zoology-stat-label">
                  Chapters
                </span>

              </div>


              <div className="zoology-stat">

                <span className="zoology-stat-value">
                  NEET
                </span>

                <span className="zoology-stat-label">
                  Exam Pattern
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            CHAPTER SECTION
        ===================================================== */}

        <section className="zoology-chapters-section">

          <div className="zoology-section-header">

            <div>

              <span className="zoology-section-eyebrow">
                NEET BIOLOGY
              </span>

              <h2 className="zoology-section-title">
                Zoology Chapters
              </h2>

              <p className="zoology-section-subtitle">
                Select a chapter and start your Zoology
                practice.
              </p>

            </div>

          </div>


          {/* =================================================
              CHAPTER GRID
          ================================================= */}

          <div className="zoology-chapter-grid">


            {/* =================================================
                HUMAN PHYSIOLOGY
            ================================================= */}

            <div className="zoology-chapter-card">

              <div className="zoology-card-top">

                <div className="zoology-chapter-icon physiology">
                  <HeartPulse size={25} />
                </div>

                <span className="zoology-chapter-number">
                  01
                </span>

              </div>


              <div className="zoology-card-content">

                <span className="zoology-card-tag">
                  HIGH WEIGHTAGE
                </span>

                <h3>
                  Human Physiology
                </h3>

                <p>
                  Digestion, breathing, circulation,
                  excretion, neural control and
                  coordination.
                </p>

                <button
                  className="zoology-test-button"
                  onClick={() =>
                    handlePractice("Human Physiology")
                  }
                >

                  <BookOpen size={16} />

                  Start Practice

                  <ArrowRight size={15} />

                </button>

              </div>

            </div>


            {/* =================================================
                HUMAN REPRODUCTION
            ================================================= */}

            <div className="zoology-chapter-card">

              <div className="zoology-card-top">

                <div className="zoology-chapter-icon reproduction">
                  <Dna size={25} />
                </div>

                <span className="zoology-chapter-number">
                  02
                </span>

              </div>


              <div className="zoology-card-content">

                <span className="zoology-card-tag">
                  NEET IMPORTANT
                </span>

                <h3>
                  Human Reproduction
                </h3>

                <p>
                  Reproductive systems, gametogenesis,
                  menstrual cycle, fertilisation and
                  pregnancy.
                </p>

                <button
                  className="zoology-test-button"
                  onClick={() =>
                    handlePractice("Human Reproduction")
                  }
                >

                  <BookOpen size={16} />

                  Start Practice

                  <ArrowRight size={15} />

                </button>

              </div>

            </div>


            {/* =================================================
                HUMAN HEALTH & DISEASE
            ================================================= */}

            <div className="zoology-chapter-card">

              <div className="zoology-card-top">

                <div className="zoology-chapter-icon health">
                  <Stethoscope size={25} />
                </div>

                <span className="zoology-chapter-number">
                  03
                </span>

              </div>


              <div className="zoology-card-content">

                <span className="zoology-card-tag">
                  IMPORTANT
                </span>

                <h3>
                  Human Health & Disease
                </h3>

                <p>
                  Diseases, immunity, immune responses,
                  vaccines and common human disorders.
                </p>

                <button
                  className="zoology-test-button"
                  onClick={() =>
                    handlePractice("Human Health & Disease")
                  }
                >

                  <BookOpen size={16} />

                  Start Practice

                  <ArrowRight size={15} />

                </button>

              </div>

            </div>


            {/* =================================================
                GENETICS
            ================================================= */}

            <div className="zoology-chapter-card">

              <div className="zoology-card-top">

                <div className="zoology-chapter-icon genetics">
                  <Dna size={25} />
                </div>

                <span className="zoology-chapter-number">
                  04
                </span>

              </div>


              <div className="zoology-card-content">

                <span className="zoology-card-tag">
                  HIGH WEIGHTAGE
                </span>

                <h3>
                  Genetics & Evolution
                </h3>

                <p>
                  Mendelian inheritance, molecular basis
                  of inheritance, mutations and evolution.
                </p>

                <button
                  className="zoology-test-button"
                  onClick={() =>
                    handlePractice("Genetics & Evolution")
                  }
                >

                  <BookOpen size={16} />

                  Start Practice

                  <ArrowRight size={15} />

                </button>

              </div>

            </div>


            {/* =================================================
                ANIMAL KINGDOM
            ================================================= */}

            <div className="zoology-chapter-card">

              <div className="zoology-card-top">

                <div className="zoology-chapter-icon animal">
                  <Bug size={25} />
                </div>

                <span className="zoology-chapter-number">
                  05
                </span>

              </div>


              <div className="zoology-card-content">

                <span className="zoology-card-tag">
                  NCERT FOCUSED
                </span>

                <h3>
                  Animal Kingdom
                </h3>

                <p>
                  Animal classification, characteristics,
                  body organisation and important examples.
                </p>

                <button
                  className="zoology-test-button"
                  onClick={() =>
                    handlePractice("Animal Kingdom")
                  }
                >

                  <BookOpen size={16} />

                  Start Practice

                  <ArrowRight size={15} />

                </button>

              </div>

            </div>


            {/* =================================================
                EVOLUTION
            ================================================= */}

            <div className="zoology-chapter-card">

              <div className="zoology-card-top">

                <div className="zoology-chapter-icon evolution">
                  <Target size={25} />
                </div>

                <span className="zoology-chapter-number">
                  06
                </span>

              </div>


              <div className="zoology-card-content">

                <span className="zoology-card-tag">
                  CONCEPT BASED
                </span>

                <h3>
                  Evolution
                </h3>

                <p>
                  Origin of life, evidences of evolution,
                  natural selection and evolutionary theories.
                </p>

                <button
                  className="zoology-test-button"
                  onClick={() =>
                    handlePractice("Evolution")
                  }
                >

                  <BookOpen size={16} />

                  Start Practice

                  <ArrowRight size={15} />

                </button>

              </div>

            </div>


            {/* =================================================
                BIOMOLECULES & CELL
            ================================================= */}

            <div className="zoology-chapter-card">

              <div className="zoology-card-top">

                <div className="zoology-chapter-icon cell">
                  <Microscope size={25} />
                </div>

                <span className="zoology-chapter-number">
                  07
                </span>

              </div>


              <div className="zoology-card-content">

                <span className="zoology-card-tag">
                  FOUNDATION
                </span>

                <h3>
                  Cell Biology
                </h3>

                <p>
                  Cell structure, organelles, cell cycle,
                  cell division and cellular organisation.
                </p>

                <button
                  className="zoology-test-button"
                  onClick={() =>
                    handlePractice("Cell Biology")
                  }
                >

                  <BookOpen size={16} />

                  Start Practice

                  <ArrowRight size={15} />

                </button>

              </div>

            </div>


            {/* =================================================
                BIOTECHNOLOGY
            ================================================= */}

            <div className="zoology-chapter-card">

              <div className="zoology-card-top">

                <div className="zoology-chapter-icon biotech">
                  <Dna size={25} />
                </div>

                <span className="zoology-chapter-number">
                  08
                </span>

              </div>


              <div className="zoology-card-content">

                <span className="zoology-card-tag">
                  APPLICATION
                </span>

                <h3>
                  Biotechnology
                </h3>

                <p>
                  Genetic engineering, recombinant DNA,
                  applications and biotechnology principles.
                </p>

                <button
                  className="zoology-test-button"
                  onClick={() =>
                    handlePractice("Biotechnology")
                  }
                >

                  <BookOpen size={16} />

                  Start Practice

                  <ArrowRight size={15} />

                </button>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            BOTTOM CTA
        ===================================================== */}

        <section className="zoology-bottom-cta">

          <div className="zoology-cta-icon">
            <HeartPulse size={26} />
          </div>

          <div className="zoology-cta-content">

            <span>
              READY TO PRACTICE?
            </span>

            <h2>
              Strengthen Your Zoology Concepts
            </h2>

            <p>
              Practice important NEET questions chapter
              by chapter and improve your accuracy.
            </p>

          </div>

          <button
            className="zoology-cta-button"
            onClick={() =>
              console.log("Zoology practice started")
            }
          >

            Start Practice

            <ArrowRight size={18} />

          </button>

        </section>

      </div>

    </main>
  );
}