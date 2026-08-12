import React from "react";
import {
  ShieldCheck,
  Lock,
  UserCheck,
  Database,
  GraduationCap,
  Mail,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./PrivacyPolicy.css";

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="privacy-page">

      {/* ================= HERO ================= */}

      <section className="privacy-hero">
        <div className="privacy-hero-glow" />

        <button
          className="privacy-back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <div className="privacy-hero-content">
          <div className="privacy-badge">
            <ShieldCheck size={17} />
            Privacy & Security
          </div>

          <div className="privacy-logo">
            <GraduationCap size={30} />
          </div>

          <h1>Privacy Policy</h1>

          <p>
            Your privacy matters to us. This policy explains how
            STG Pre-University College collects, uses and protects
            information when you use our website and examination platform.
          </p>

          <span className="privacy-updated">
            Last Updated: August 2026
          </span>
        </div>
      </section>


      {/* ================= CONTENT ================= */}

      <main className="privacy-container">

        {/* INTRODUCTION */}

        <section className="privacy-card">
          <div className="privacy-card-icon">
            <ShieldCheck size={23} />
          </div>

          <div>
            <span className="privacy-label">01</span>

            <h2>Introduction</h2>

            <p>
              STG Pre-University College respects the privacy of students,
              parents, teachers, staff and visitors who use our website
              and digital services.
            </p>

            <p>
              This Privacy Policy explains what information may be
              collected, why it is collected, how it may be used and
              the steps taken to protect it.
            </p>
          </div>
        </section>


        {/* INFORMATION WE COLLECT */}

        <section className="privacy-card">
          <div className="privacy-card-icon">
            <Database size={23} />
          </div>

          <div>
            <span className="privacy-label">02</span>

            <h2>Information We Collect</h2>

            <p>
              Depending on how you use our platform, we may collect
              information such as:
            </p>

            <ul>
              <li>Student name and student ID</li>
              <li>Email address</li>
              <li>Contact information</li>
              <li>Class, section and academic information</li>
              <li>Examination and assessment information</li>
              <li>Login and authentication information</li>
              <li>Questions, enquiries and support requests</li>
              <li>Information voluntarily submitted through forms</li>
            </ul>
          </div>
        </section>


        {/* HOW INFORMATION IS USED */}

        <section className="privacy-card">
          <div className="privacy-card-icon">
            <UserCheck size={23} />
          </div>

          <div>
            <span className="privacy-label">03</span>

            <h2>How We Use Information</h2>

            <p>
              Information collected through the platform may be used
              for legitimate college and educational purposes, including:
            </p>

            <ul>
              <li>Managing student accounts</li>
              <li>Providing examination services</li>
              <li>Maintaining examination records</li>
              <li>Displaying student academic information to authorised staff</li>
              <li>Providing educational services</li>
              <li>Responding to enquiries</li>
              <li>Improving the website and platform</li>
              <li>Maintaining platform security</li>
            </ul>
          </div>
        </section>


        {/* STUDENT DATA */}

        <section className="privacy-card highlight-card">
          <div className="privacy-card-icon">
            <GraduationCap size={23} />
          </div>

          <div>
            <span className="privacy-label">04</span>

            <h2>Student Information</h2>

            <p>
              Student information is intended to be accessed only by
              authorised users for educational and administrative purposes.
            </p>

            <p>
              Access to examination results, academic records and other
              student-related information may be restricted according to
              the user's role and permissions.
            </p>
          </div>
        </section>


        {/* LOGIN & SECURITY */}

        <section className="privacy-card">
          <div className="privacy-card-icon">
            <Lock size={23} />
          </div>

          <div>
            <span className="privacy-label">05</span>

            <h2>Account & Security</h2>

            <p>
              We take reasonable measures to protect accounts and
              information stored on our platform.
            </p>

            <ul>
              <li>Users should keep their login credentials confidential.</li>
              <li>Unauthorised access should be reported to the college.</li>
              <li>Users should log out when using shared devices.</li>
              <li>Access permissions may vary according to user role.</li>
            </ul>
          </div>
        </section>


        {/* COOKIES */}

        <section className="privacy-card">
          <div className="privacy-card-icon">
            <Database size={23} />
          </div>

          <div>
            <span className="privacy-label">06</span>

            <h2>Cookies & Local Storage</h2>

            <p>
              Our website or application may use browser storage,
              cookies or similar technologies to maintain login sessions,
              preferences and essential functionality.
            </p>

            <p>
              These technologies may help the platform remember
              authorised sessions and provide a smoother user experience.
            </p>
          </div>
        </section>


        {/* THIRD PARTY SERVICES */}

        <section className="privacy-card">
          <div className="privacy-card-icon">
            <ShieldCheck size={23} />
          </div>

          <div>
            <span className="privacy-label">07</span>

            <h2>Third-Party Services</h2>

            <p>
              Certain website functions may rely on third-party services
              such as hosting, cloud storage, email services, analytics,
              maps or communication services.
            </p>

            <p>
              Such services may process information according to their
              own privacy policies and applicable terms.
            </p>
          </div>
        </section>


        {/* DATA SHARING */}

        <section className="privacy-card">
          <div className="privacy-card-icon">
            <UserCheck size={23} />
          </div>

          <div>
            <span className="privacy-label">08</span>

            <h2>Sharing of Information</h2>

            <p>
              We do not intend to sell personal information for advertising
              purposes.
            </p>

            <p>
              Information may be shared with authorised college personnel
              when necessary for academic, administrative, examination,
              safety or support purposes, or when required by applicable law.
            </p>
          </div>
        </section>


        {/* DATA RETENTION */}

        <section className="privacy-card">
          <div className="privacy-card-icon">
            <Database size={23} />
          </div>

          <div>
            <span className="privacy-label">09</span>

            <h2>Data Retention</h2>

            <p>
              Information may be retained for as long as reasonably
              necessary to provide educational services, maintain
              academic records, meet administrative requirements or
              comply with applicable legal obligations.
            </p>
          </div>
        </section>


        {/* CHILDREN & STUDENTS */}

        <section className="privacy-card">
          <div className="privacy-card-icon">
            <GraduationCap size={23} />
          </div>

          <div>
            <span className="privacy-label">10</span>

            <h2>Students & Young Users</h2>

            <p>
              Our platform is designed for educational use. Student
              information should be submitted and managed responsibly
              by authorised users and college personnel.
            </p>

            <p>
              Parents or guardians may contact the college regarding
              questions about information associated with a student.
            </p>
          </div>
        </section>


        {/* YOUR RIGHTS */}

        <section className="privacy-card">
          <div className="privacy-card-icon">
            <UserCheck size={23} />
          </div>

          <div>
            <span className="privacy-label">11</span>

            <h2>Your Privacy Choices</h2>

            <p>
              If you believe that information associated with your account
              is inaccurate or you have a privacy-related concern, you
              may contact the college for assistance.
            </p>
          </div>
        </section>


        {/* CHANGES */}

        <section className="privacy-card">
          <div className="privacy-card-icon">
            <ShieldCheck size={23} />
          </div>

          <div>
            <span className="privacy-label">12</span>

            <h2>Changes to This Policy</h2>

            <p>
              STG Pre-University College may update this Privacy Policy
              from time to time to reflect changes to the website,
              educational services or applicable requirements.
            </p>

            <p>
              The latest version will be published on this page.
            </p>
          </div>
        </section>


        {/* CONTACT */}

        <section className="privacy-contact">

          <div className="privacy-contact-icon">
            <Mail size={24} />
          </div>

          <div>
            <span>Privacy Questions?</span>

            <h2>Contact STG Pre-University College</h2>

            <p>
              For privacy-related questions or concerns, please contact
              the college.
            </p>

            <a href="mailto:info@stgpuc.com">
              info@stgpuc.com
            </a>

            <a href="tel:+918951787788">
              +91 89517 87788
            </a>
          </div>

        </section>

      </main>


      {/* ================= FOOTER ================= */}

      <div className="privacy-bottom">

        <GraduationCap size={19} />

        <span>
          STG Pre-University College
        </span>

        <span className="privacy-dot">
          •
        </span>

        <span>
          Learn • Explore • Succeed
        </span>

      </div>

    </div>
  );
};

export default PrivacyPolicy;