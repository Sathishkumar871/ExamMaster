import {
  Dna,
  ArrowRight,
  BookOpen,
  Leaf,
  Microscope,
  Sprout,
  FlaskConical,
  Target,
} from "lucide-react";

import "./Botany.css";

export default function Botany() {
  return (
    <main className="botany-page">

      <div className="botany-container">

        {/* ================= HERO ================= */}

        <section className="botany-hero">

          <div className="botany-hero-glow"></div>

          <div className="botany-hero-content">

            <div className="botany-badge">
              <Dna size={15} />
              NEET • BOTANY
            </div>

            <h1 className="botany-title">
              Botany
              <span>
                Master Biology. Strengthen Your Concepts.
              </span>
            </h1>

            <p className="botany-description">
              Practice Botany chapter-wise with focused
              questions, NCERT-oriented concepts and
              exam-focused tests designed for NEET
              preparation.
            </p>

            {/* ================= STATS ================= */}

            <div className="botany-stats">

              <div className="botany-stat">
                <span className="botany-stat-value">
                  50+
                </span>

                <span className="botany-stat-label">
                  Questions
                </span>
              </div>

              <div className="botany-stat">
                <span className="botany-stat-value">
                  10+
                </span>

                <span className="botany-stat-label">
                  Chapters
                </span>
              </div>

              <div className="botany-stat">
                <span className="botany-stat-value">
                  NEET
                </span>

                <span className="botany-stat-label">
                  Exam Pattern
                </span>
              </div>

            </div>

          </div>

        </section>


        {/* ================= CHAPTER SECTION ================= */}

        <section className="botany-chapters-section">

          <div className="botany-section-header">

            <div>

              <span className="botany-section-eyebrow">
                EXPLORE BOTANY
              </span>

              <h2 className="botany-section-title">
                Botany Chapters
              </h2>

              <p className="botany-section-subtitle">
                Select a chapter and start your Botany
                practice.
              </p>

            </div>

          </div>


          {/* ================= CHAPTER GRID ================= */}

          <div className="botany-chapter-grid">


            {/* 01 CELL BIOLOGY */}

            <div className="botany-chapter-card">

              <div className="botany-card-top">

                <div className="botany-chapter-icon">
                  <Microscope size={24} />
                </div>

                <span className="botany-chapter-number">
                  01
                </span>

              </div>

              <div className="botany-card-content">

                <span className="botany-card-tag">
                  CELL BIOLOGY
                </span>

                <h3>
                  Cell Biology
                </h3>

                <p>
                  Cell structure, organelles, cell cycle,
                  cell division and cellular organization.
                </p>

                <button
                  className="botany-test-button"
                  onClick={() =>
                    console.log("Cell Biology clicked")
                  }
                >
                  <BookOpen size={16} />
                  Start Practice
                  <ArrowRight size={15} />
                </button>

              </div>

            </div>


            {/* 02 PLANT PHYSIOLOGY */}

            <div className="botany-chapter-card">

              <div className="botany-card-top">

                <div className="botany-chapter-icon">
                  <Leaf size={24} />
                </div>

                <span className="botany-chapter-number">
                  02
                </span>

              </div>

              <div className="botany-card-content">

                <span className="botany-card-tag">
                  PLANT PHYSIOLOGY
                </span>

                <h3>
                  Plant Physiology
                </h3>

                <p>
                  Photosynthesis, respiration, plant growth,
                  transport and mineral nutrition.
                </p>

                <button
                  className="botany-test-button"
                  onClick={() =>
                    console.log("Plant Physiology clicked")
                  }
                >
                  <BookOpen size={16} />
                  Start Practice
                  <ArrowRight size={15} />
                </button>

              </div>

            </div>


            {/* 03 GENETICS */}

            <div className="botany-chapter-card">

              <div className="botany-card-top">

                <div className="botany-chapter-icon">
                  <Dna size={24} />
                </div>

                <span className="botany-chapter-number">
                  03
                </span>

              </div>

              <div className="botany-card-content">

                <span className="botany-card-tag">
                  GENETICS
                </span>

                <h3>
                  Genetics & Evolution
                </h3>

                <p>
                  Mendelian genetics, inheritance,
                  molecular basis and evolutionary concepts.
                </p>

                <button
                  className="botany-test-button"
                  onClick={() =>
                    console.log("Genetics clicked")
                  }
                >
                  <BookOpen size={16} />
                  Start Practice
                  <ArrowRight size={15} />
                </button>

              </div>

            </div>


            {/* 04 PLANT DIVERSITY */}

            <div className="botany-chapter-card">

              <div className="botany-card-top">

                <div className="botany-chapter-icon">
                  <Sprout size={24} />
                </div>

                <span className="botany-chapter-number">
                  04
                </span>

              </div>

              <div className="botany-card-content">

                <span className="botany-card-tag">
                  PLANT DIVERSITY
                </span>

                <h3>
                  Plant Kingdom
                </h3>

                <p>
                  Algae, bryophytes, pteridophytes,
                  gymnosperms and angiosperms.
                </p>

                <button
                  className="botany-test-button"
                  onClick={() =>
                    console.log("Plant Kingdom clicked")
                  }
                >
                  <BookOpen size={16} />
                  Start Practice
                  <ArrowRight size={15} />
                </button>

              </div>

            </div>


            {/* 05 REPRODUCTION */}

            <div className="botany-chapter-card">

              <div className="botany-card-top">

                <div className="botany-chapter-icon">
                  <FlaskConical size={24} />
                </div>

                <span className="botany-chapter-number">
                  05
                </span>

              </div>

              <div className="botany-card-content">

                <span className="botany-card-tag">
                  REPRODUCTION
                </span>

                <h3>
                  Plant Reproduction
                </h3>

                <p>
                  Sexual reproduction, flowering plants,
                  pollination, fertilization and seed formation.
                </p>

                <button
                  className="botany-test-button"
                  onClick={() =>
                    console.log("Plant Reproduction clicked")
                  }
                >
                  <BookOpen size={16} />
                  Start Practice
                  <ArrowRight size={15} />
                </button>

              </div>

            </div>


            {/* 06 ECOLOGY */}

            <div className="botany-chapter-card">

              <div className="botany-card-top">

                <div className="botany-chapter-icon">
                  <Target size={24} />
                </div>

                <span className="botany-chapter-number">
                  06
                </span>

              </div>

              <div className="botany-card-content">

                <span className="botany-card-tag">
                  ECOLOGY
                </span>

                <h3>
                  Ecology & Environment
                </h3>

                <p>
                  Ecosystems, biodiversity, environmental
                  issues and ecological interactions.
                </p>

                <button
                  className="botany-test-button"
                  onClick={() =>
                    console.log("Ecology clicked")
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

      </div>

    </main>
  );
}