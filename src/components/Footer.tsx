import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  ArrowUpRight,
  ChevronDown,
  GraduationCap,
  ShieldCheck,
  HelpCircle,
  Images,
  Users,
  Award,
  Building2,
} from "lucide-react";

import "./Footer.css";

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const [showContact, setShowContact] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const currentYear = new Date().getFullYear();

  const mobile = "8951787788";
  const email = "info@stgpuc.com";

  const whatsappMessage = encodeURIComponent(
    "Hi, I am enquiring about STG Pre-University College. Please share more information about the college, courses and admissions."
  );

  // ============================================================
  // CHECK STUDENT LOGIN
  // ============================================================

  const isStudentLoggedIn = () => {
    return !!localStorage.getItem("student");
  };

  // ============================================================
  // STUDENT PROTECTED NAVIGATION
  // ============================================================

  const handleStudentProtectedPage = (
    event: React.MouseEvent<HTMLAnchorElement>,
    path: string
  ) => {
    event.preventDefault();

    if (isStudentLoggedIn()) {
      navigate(path);
    } else {
      navigate("/login");
    }
  };

  // ============================================================
  // CONTACT TOGGLE
  // ============================================================

  const handleToggleContact = () => {
    const nextState = !showContact;

    setShowContact(nextState);

    if (nextState) {
      setTimeout(() => {
        document
          .getElementById("stg-contact-details")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);
    }
  };

  // ============================================================
  // MORE TOGGLE
  // ============================================================

  const handleToggleMore = () => {
    const nextState = !showMore;

    setShowMore(nextState);

    if (nextState) {
      setTimeout(() => {
        document
          .getElementById("stg-more-details")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);
    }
  };

  return (
    <footer className="stg-footer">

      {/* ========================================================
          FOOTER GLOW
      ======================================================== */}

      <div className="stg-footer-glow" />


      <div className="stg-footer-container">

        {/* ======================================================
            MINI PREMIUM FOOTER
        ====================================================== */}

        <div className="stg-footer-mini">

          <div className="stg-mini-brand">

            <div className="stg-mini-logo">
              <GraduationCap size={22} />
            </div>

            <div>
              <strong>
                STG Pre-University College
              </strong>

              <span>
                Learn • Explore • Succeed
              </span>
            </div>

          </div>


          <div className="stg-mini-actions">

            {/* CONTACT */}

            <button
              type="button"
              className={`stg-mini-btn ${
                showContact ? "active" : ""
              }`}
              onClick={handleToggleContact}
            >

              <Phone size={16} />

              Get in Touch

              <ChevronDown
                size={15}
                className={showContact ? "rotate" : ""}
              />

            </button>


            {/* MORE */}

            <button
              type="button"
              className={`stg-mini-btn ${
                showMore ? "active" : ""
              }`}
              onClick={handleToggleMore}
            >

              More

              <ChevronDown
                size={15}
                className={showMore ? "rotate" : ""}
              />

            </button>

          </div>

        </div>


        {/* ======================================================
            CONTACT DETAILS
        ====================================================== */}

        <div
          id="stg-contact-details"
          className={`stg-expand-panel ${
            showContact ? "open" : ""
          }`}
        >

          <div className="stg-expand-inner">

            <div className="stg-panel-heading">

              <span>
                CONTACT
              </span>

              <h2>
                Get in Touch
              </h2>

              <p>
                Have questions about admissions,
                courses or campus life?
                We're here to help.
              </p>

            </div>


            <div className="stg-contact-grid">

              {/* ADDRESS */}

              <a
                href="https://www.google.com/maps/search/?api=1&query=STG+Pre-University+College+Chinakurali+Pandavapura+Mandya+Karnataka+571455"
                target="_blank"
                rel="noopener noreferrer"
                className="stg-contact-card"
              >

                <div className="stg-contact-icon">
                  <MapPin size={20} />
                </div>

                <div className="stg-contact-info">

                  <span>
                    Campus
                  </span>

                  <strong>
                    STG Pre-University College
                  </strong>

                  <p>
                    Chinakurali, Pandavapura Taluk,
                    Mandya District - 571455
                  </p>

                </div>

                <ArrowUpRight size={16} />

              </a>


              {/* PHONE */}

              <a
                href={`tel:+91${mobile}`}
                className="stg-contact-card"
              >

                <div className="stg-contact-icon">
                  <Phone size={20} />
                </div>

                <div className="stg-contact-info">

                  <span>
                    Admissions & Enquiries
                  </span>

                  <strong>
                    +91 89517 87788
                  </strong>

                  <p>
                    Tap to call the college
                  </p>

                </div>

                <ArrowUpRight size={16} />

              </a>


              {/* EMAIL */}

              <a
                href={`mailto:${email}`}
                className="stg-contact-card"
              >

                <div className="stg-contact-icon">
                  <Mail size={20} />
                </div>

                <div className="stg-contact-info">

                  <span>
                    Email
                  </span>

                  <strong>
                    {email}
                  </strong>

                  <p>
                    Send us your enquiry
                  </p>

                </div>

                <ArrowUpRight size={16} />

              </a>


              {/* WHATSAPP */}

              <a
                href={`https://wa.me/91${mobile}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="stg-contact-card"
              >

                <div className="stg-contact-icon whatsapp-icon">
                  <MessageCircle size={20} />
                </div>

                <div className="stg-contact-info">

                  <span>
                    WhatsApp
                  </span>

                  <strong>
                    Chat with STG College
                  </strong>

                  <p>
                    Send an admission enquiry
                  </p>

                </div>

                <ArrowUpRight size={16} />

              </a>

            </div>


            {/* MAP */}

            <a
              href="https://www.google.com/maps/search/?api=1&query=STG+Pre-University+College+Chinakurali+Pandavapura+Mandya+Karnataka+571455"
              target="_blank"
              rel="noopener noreferrer"
              className="stg-map-banner"
            >

              <div className="stg-map-left">

                <div className="stg-map-icon">
                  <MapPin size={20} />
                </div>

                <div>

                  <strong>
                    Visit STG Campus
                  </strong>

                  <span>
                    Open location in Google Maps
                  </span>

                </div>

              </div>

              <ArrowUpRight size={20} />

            </a>

          </div>

        </div>


        {/* ======================================================
            MORE DETAILS
        ====================================================== */}

        <div
          id="stg-more-details"
          className={`stg-expand-panel ${
            showMore ? "open" : ""
          }`}
        >

          <div className="stg-expand-inner">

            <div className="stg-more-grid">

              {/* ==================================================
                  COLLEGE
              ================================================== */}

              <div className="stg-more-card">

                <div className="stg-more-icon">
                  <Building2 size={21} />
                </div>

                <h3>
                  College
                </h3>


                <Link to="/">
                  Home
                  <ArrowUpRight size={14} />
                </Link>


                <Link to="/about">
                  About College
                  <ArrowUpRight size={14} />
                </Link>


                <Link to="/courses">
                  Courses
                  <ArrowUpRight size={14} />
                </Link>


                <Link to="/faculty">
                  Faculty
                  <ArrowUpRight size={14} />
                </Link>


                <Link to="/admissions">
                  Admissions
                  <ArrowUpRight size={14} />
                </Link>

              </div>


              {/* ==================================================
                  STUDENTS
              ================================================== */}

              <div className="stg-more-card">

                <div className="stg-more-icon">
                  <Users size={21} />
                </div>

                <h3>
                  Students
                </h3>


                {/* STUDENT LOGIN */}

                <Link to="/login">
                  Student Login
                  <ArrowUpRight size={14} />
                </Link>


                {/* EXAMS */}

                <a
                  href="/exams"
                  onClick={(e) =>
                    handleStudentProtectedPage(e, "/exams")
                  }
                >
                  Exams
                  <ArrowUpRight size={14} />
                </a>


                {/* DAILY TESTS */}

                <a
                  href="/student/daily-test"
                  onClick={(e) =>
                    handleStudentProtectedPage(
                      e,
                      "/student/daily-test"
                    )
                  }
                >
                  Daily Tests
                  <ArrowUpRight size={14} />
                </a>


                {/* RESULTS */}

                <a
                  href="/results"
                  onClick={(e) =>
                    handleStudentProtectedPage(e, "/results")
                  }
                >
                  Results
                  <ArrowUpRight size={14} />
                </a>


                {/* QUESTION BANK */}

                <a
                  href="/question-bank"
                  onClick={(e) =>
                    handleStudentProtectedPage(
                      e,
                      "/question-bank"
                    )
                  }
                >
                  Question Bank
                  <ArrowUpRight size={14} />
                </a>

              </div>


              {/* ==================================================
                  GALLERY
              ================================================== */}

              <div className="stg-more-card gallery-card">

                <div className="stg-more-icon">
                  <Images size={21} />
                </div>

                <h3>
                  College Gallery
                </h3>

                <p>
                  Explore campus moments,
                  student achievements,
                  academic activities and
                  memorable events.
                </p>


                <Link
                  to="/gallery"
                  className="stg-gallery-btn"
                >

                  Explore Gallery

                  <ArrowUpRight size={15} />

                </Link>

              </div>


              {/* ==================================================
                  ACHIEVEMENTS
              ================================================== */}

              <div className="stg-more-card">

                <div className="stg-more-icon">
                  <Award size={21} />
                </div>

                <h3>
                  Achievements
                </h3>

                <p>
                  Discover student ranks,
                  academic achievements,
                  college activities and
                  special moments.
                </p>


                {/* STUDENTS SHOULD LOGIN */}

                <Link
                  to="/login"
                >
                  Students
                  <ArrowUpRight size={14} />
                </Link>

              </div>

            </div>


            {/* ====================================================
                POLICIES
            ==================================================== */}

            <div className="stg-policy-section">

              <div className="stg-policy-heading">

                <ShieldCheck size={19} />

                <div>

                  <strong>
                    Policies & Support
                  </strong>

                  <span>
                    Important information for
                    students and visitors.
                  </span>

                </div>

              </div>


              <div className="stg-policy-links">

                <Link to="/privacy">
                  <ShieldCheck size={15} />
                  Privacy Policy
                </Link>


                <Link to="/terms">
                  <ShieldCheck size={15} />
                  Terms & Conditions
                </Link>


                <Link to="/faq">
                  <HelpCircle size={15} />
                  Frequently Asked Questions
                </Link>

              </div>

            </div>


            {/* ====================================================
                FOOTER NOTE
            ==================================================== */}

            <div className="stg-more-bottom">

              <div>

                <strong>
                  STG Pre-University College
                </strong>

                <span>
                  Building knowledge,
                  confidence and character.
                </span>

              </div>

              <span>
                © {currentYear} STG Pre-University College
              </span>

            </div>

          </div>

        </div>


        {/* ======================================================
            COPYRIGHT
        ====================================================== */}

        <div className="stg-footer-mini-bottom" />

      </div>

    </footer>
  );
};

export default Footer;