import {
  FlaskConical,
  ArrowRight,
  BookOpen,
  Atom,
  Target,
  Beaker,
  TestTube2,
  Layers3,
} from "lucide-react";

import "./Chemistry.css";

export default function Chemistry() {
  return (
    <main className="chemistry-page">

      <div className="chemistry-container">

        {/* ================= HERO ================= */}

        <section className="chemistry-hero">

          <div className="chemistry-hero-content">

            <div className="chemistry-badge">
              <FlaskConical size={15} />
              NEET • JEE CHEMISTRY
            </div>

            <h1 className="chemistry-title">
              Chemistry
              <span>
                Understand Reactions. Master Concepts.
              </span>
            </h1>

            <p className="chemistry-description">
              Practice Chemistry chapter-wise with focused
              questions, important concepts and exam-oriented
              tests designed for NEET & JEE preparation.
            </p>

            {/* ================= STATS ================= */}

            <div className="chemistry-stats">

              <div className="chemistry-stat">
                <span className="chemistry-stat-value">
                  50+
                </span>

                <span className="chemistry-stat-label">
                  Questions
                </span>
              </div>

              <div className="chemistry-stat">
                <span className="chemistry-stat-value">
                  10+
                </span>

                <span className="chemistry-stat-label">
                  Chapters
                </span>
              </div>

              <div className="chemistry-stat">
                <span className="chemistry-stat-value">
                  NEET
                </span>

                <span className="chemistry-stat-label">
                  Exam Pattern
                </span>
              </div>

            </div>

          </div>

        </section>


        {/* ================= CHAPTER SECTION ================= */}

        <section>

          <div className="chemistry-section-header">

            <div>

              <h2 className="chemistry-section-title">
                Chemistry Chapters
              </h2>

              <p className="chemistry-section-subtitle">
                Select a chapter and start your practice.
              </p>

            </div>

          </div>


          {/* ================= CHAPTER GRID ================= */}

          <div className="chemistry-chapter-grid">


            {/* ================= PHYSICAL CHEMISTRY ================= */}

            <div className="chemistry-chapter-card">

              <div className="chemistry-card-top">

                <div className="chemistry-chapter-icon">
                  <Atom size={24} />
                </div>

                <span className="chemistry-chapter-number">
                  01
                </span>

              </div>


              <div className="chemistry-card-content">

                <h3>
                  Physical Chemistry
                </h3>

                <p>
                  Mole concept, thermodynamics, equilibrium,
                  solutions, electrochemistry and kinetics.
                </p>

                <button
                  className="chemistry-test-button"
                  onClick={() =>
                    console.log("Physical Chemistry clicked")
                  }
                >
                  <BookOpen size={16} />

                  Start Practice

                  <ArrowRight size={15} />
                </button>

              </div>

            </div>


            {/* ================= ORGANIC CHEMISTRY ================= */}

            <div className="chemistry-chapter-card">

              <div className="chemistry-card-top">

                <div className="chemistry-chapter-icon">
                  <Beaker size={24} />
                </div>

                <span className="chemistry-chapter-number">
                  02
                </span>

              </div>


              <div className="chemistry-card-content">

                <h3>
                  Organic Chemistry
                </h3>

                <p>
                  Hydrocarbons, functional groups, reaction
                  mechanisms, biomolecules and polymers.
                </p>

                <button
                  className="chemistry-test-button"
                  onClick={() =>
                    console.log("Organic Chemistry clicked")
                  }
                >
                  <BookOpen size={16} />

                  Start Practice

                  <ArrowRight size={15} />
                </button>

              </div>

            </div>


            {/* ================= INORGANIC CHEMISTRY ================= */}

            <div className="chemistry-chapter-card">

              <div className="chemistry-card-top">

                <div className="chemistry-chapter-icon">
                  <TestTube2 size={24} />
                </div>

                <span className="chemistry-chapter-number">
                  03
                </span>

              </div>


              <div className="chemistry-card-content">

                <h3>
                  Inorganic Chemistry
                </h3>

                <p>
                  Periodic table, chemical bonding, coordination
                  compounds, p-block and d-block elements.
                </p>

                <button
                  className="chemistry-test-button"
                  onClick={() =>
                    console.log("Inorganic Chemistry clicked")
                  }
                >
                  <BookOpen size={16} />

                  Start Practice

                  <ArrowRight size={15} />
                </button>

              </div>

            </div>


            {/* ================= CHEMICAL BONDING ================= */}

            <div className="chemistry-chapter-card">

              <div className="chemistry-card-top">

                <div className="chemistry-chapter-icon">
                  <Layers3 size={24} />
                </div>

                <span className="chemistry-chapter-number">
                  04
                </span>

              </div>


              <div className="chemistry-card-content">

                <h3>
                  Chemical Bonding
                </h3>

                <p>
                  Ionic bonds, covalent bonds, molecular
                  geometry, hybridisation and VSEPR theory.
                </p>

                <button
                  className="chemistry-test-button"
                  onClick={() =>
                    console.log("Chemical Bonding clicked")
                  }
                >
                  <BookOpen size={16} />

                  Start Practice

                  <ArrowRight size={15} />
                </button>

              </div>

            </div>


            {/* ================= EQUILIBRIUM ================= */}

            <div className="chemistry-chapter-card">

              <div className="chemistry-card-top">

                <div className="chemistry-chapter-icon">
                  <Target size={24} />
                </div>

                <span className="chemistry-chapter-number">
                  05
                </span>

              </div>


              <div className="chemistry-card-content">

                <h3>
                  Equilibrium
                </h3>

                <p>
                  Chemical equilibrium, ionic equilibrium,
                  acids, bases, pH and solubility.
                </p>

                <button
                  className="chemistry-test-button"
                  onClick={() =>
                    console.log("Equilibrium clicked")
                  }
                >
                  <BookOpen size={16} />

                  Start Practice

                  <ArrowRight size={15} />
                </button>

              </div>

            </div>


            {/* ================= ELECTROCHEMISTRY ================= */}

            <div className="chemistry-chapter-card">

              <div className="chemistry-card-top">

                <div className="chemistry-chapter-icon">
                  <FlaskConical size={24} />
                </div>

                <span className="chemistry-chapter-number">
                  06
                </span>

              </div>


              <div className="chemistry-card-content">

                <h3>
                  Electrochemistry
                </h3>

                <p>
                  Electrochemical cells, conductance,
                  Nernst equation and redox reactions.
                </p>

                <button
                  className="chemistry-test-button"
                  onClick={() =>
                    console.log("Electrochemistry clicked")
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