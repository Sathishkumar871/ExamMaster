import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  GraduationCap,
  Target,
  Users,
} from "lucide-react";

import "./AboutCollege.css";

const AboutCollege: React.FC = () => {
  return (
    <main className="college-page">

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="college-hero">

        <div className="college-hero-content">

          <span className="college-eyebrow">
            STG PRE-UNIVERSITY COLLEGE
          </span>

          <h1>
            Building Knowledge,
            <span> Confidence & Character</span>
          </h1>

          <p>
            STG Pre-University College is committed to creating
            a supportive academic environment where students
            can learn, practise, grow and prepare confidently
            for their future.
          </p>

          <div className="college-hero-buttons">

            <Link
              to="/courses"
              className="college-primary-btn"
            >
              Explore Courses
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/admissions"
              className="college-secondary-btn"
            >
              Admission Enquiry
            </Link>

          </div>

        </div>

      </section>


      {/* =====================================================
          INTRODUCTION
      ====================================================== */}

      <section className="college-section">

        <div className="section-heading">

          <span>
            ABOUT STG
          </span>

          <h2>
            About Our College
          </h2>

          <p>
            A student-focused educational environment designed
            to support academic learning, discipline and
            personal development.
          </p>

        </div>


        <div className="about-grid">

          {/* COLLEGE */}

          <div className="about-card">

            <div className="about-icon">
              <Building2 size={25} />
            </div>

            <h3>
              Our College
            </h3>

            <p>
              STG Pre-University College provides students
              with a structured learning environment where
              academic knowledge, practical understanding and
              confidence are encouraged.
            </p>

          </div>


          {/* MISSION */}

          <div className="about-card">

            <div className="about-icon">
              <Target size={25} />
            </div>

            <h3>
              Our Mission
            </h3>

            <p>
              Our mission is to help students develop strong
              academic foundations, responsible habits,
              confidence and a positive approach towards
              learning.
            </p>

          </div>


          {/* STUDENT DEVELOPMENT */}

          <div className="about-card">

            <div className="about-icon">
              <GraduationCap size={25} />
            </div>

            <h3>
              Student Development
            </h3>

            <p>
              Education goes beyond examinations. We encourage
              communication, discipline, knowledge, confidence
              and overall student development.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          LEARNING EXPERIENCE
      ====================================================== */}

      <section className="college-highlight">

        <div className="highlight-content">

          <span>
            LEARN • PRACTICE • WIN
          </span>

          <h2>
            A smarter learning journey
            for every student.
          </h2>

          <p>
            Our digital examination platform helps students
            practise questions, attempt tests and understand
            their academic progress in a structured way.
          </p>

          <Link
            to="/login"
            className="college-primary-btn"
          >
            Student Login
            <ArrowRight size={18} />
          </Link>

        </div>


        <div className="highlight-stats">

          <div className="highlight-stat">

            <div className="stat-icon">
              <BookOpen size={22} />
            </div>

            <strong>
              Academic
            </strong>

            <span>
              Learning
            </span>

          </div>


          <div className="highlight-stat">

            <div className="stat-icon">
              <Users size={22} />
            </div>

            <strong>
              Student
            </strong>

            <span>
              Support
            </span>

          </div>


          <div className="highlight-stat">

            <div className="stat-icon">
              <Award size={22} />
            </div>

            <strong>
              Future
            </strong>

            <span>
              Focused
            </span>

          </div>

        </div>

      </section>


      {/* =====================================================
          WHY STG
      ====================================================== */}

      <section className="college-section why-section">

        <div className="section-heading">

          <span>
            WHY STG
          </span>

          <h2>
            Supporting Students Beyond Academics
          </h2>

          <p>
            Our goal is to create an environment where
            students can learn with confidence and prepare
            themselves for their next stage.
          </p>

        </div>


        <div className="why-grid">

          <div className="why-card">

            <GraduationCap size={23} />

            <h3>
              Quality Education
            </h3>

            <p>
              Focused academic learning and concept-based
              understanding.
            </p>

          </div>


          <div className="why-card">

            <BookOpen size={23} />

            <h3>
              Regular Practice
            </h3>

            <p>
              Practice-oriented learning through examinations,
              tests and question-based preparation.
            </p>

          </div>


          <div className="why-card">

            <Users size={23} />

            <h3>
              Student Support
            </h3>

            <p>
              A supportive environment that encourages
              students to ask questions and improve.
            </p>

          </div>


          <div className="why-card">

            <Award size={23} />

            <h3>
              Future Focus
            </h3>

            <p>
              Helping students build the academic foundation
              required for their future education.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          CAMPUS INFORMATION
      ====================================================== */}

      <section className="college-location">

        <div className="location-content">

          <span className="college-eyebrow">
            OUR LOCATION
          </span>

          <h2>
            STG Pre-University College
          </h2>

          <p>
            Chinakurali, Pandavapura Taluk,
            Mandya District - 571455,
            Karnataka.
          </p>

          <a
            href="https://www.google.com/maps/search/?api=1&query=STG+Pre-University+College+Chinakurali+Pandavapura+Mandya+Karnataka+571455"
            target="_blank"
            rel="noopener noreferrer"
            className="college-primary-btn"
          >
            View Campus Location
            <ArrowRight size={18} />
          </a>

        </div>

      </section>


      {/* =====================================================
          ADMISSION CTA
      ====================================================== */}

      <section className="college-cta">

        <div>

          <span>
            START YOUR JOURNEY
          </span>

          <h2>
            Interested in joining STG?
          </h2>

          <p>
            Submit an admission enquiry and our college team
            can help you with course and admission information.
          </p>

        </div>

        <Link
          to="/admissions"
          className="college-primary-btn"
        >
          Admission Enquiry
          <ArrowRight size={18} />
        </Link>

      </section>

    </main>
  );
};

export default AboutCollege;