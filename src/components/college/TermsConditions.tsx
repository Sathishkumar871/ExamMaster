import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  FileText,
  UserCheck,
  GraduationCap,
  BookOpen,
  AlertCircle,
  Lock,
  Mail,
} from "lucide-react";

import "./TermsConditions.css";

const TermsConditions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="terms-page">

      {/* HEADER */}
      <header className="terms-header">

        <button
          type="button"
          className="terms-back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="terms-header-content">

          <div className="terms-main-icon">
            <FileText size={30} />
          </div>

          <div>
            <span className="terms-label">
              STG PU COLLEGE
            </span>

            <h1>Terms & Conditions</h1>

            <p>
              Rules and guidelines for using the STG college platform.
            </p>
          </div>

        </div>
      </header>


      {/* MAIN */}
      <main className="terms-container">

        {/* INTRO */}
        <section className="terms-hero-card">

          <div className="terms-hero-icon">
            <ShieldCheck size={25} />
          </div>

          <div>
            <h2>Welcome to STG Pre-University College</h2>

            <p>
              By accessing or using this website and its educational
              services, you agree to follow these Terms & Conditions.
              Please read them carefully before using the platform.
            </p>

            <span className="terms-updated">
              Last updated: August 2026
            </span>
          </div>

        </section>


        {/* 1 */}
        <section className="terms-section">

          <div className="terms-section-title">
            <GraduationCap size={21} />
            <h2>1. About the Platform</h2>
          </div>

          <p>
            The STG college platform is designed to support students,
            teachers, mentors and authorised college management with
            educational and administrative services.
          </p>

          <ul>
            <li>Student examination services</li>
            <li>Daily tests and practice activities</li>
            <li>Academic results and progress</li>
            <li>Question bank and learning resources</li>
            <li>Admission enquiries</li>
            <li>College information and communication</li>
          </ul>

        </section>


        {/* 2 */}
        <section className="terms-section">

          <div className="terms-section-title">
            <UserCheck size={21} />
            <h2>2. User Accounts</h2>
          </div>

          <p>
            Students, teachers, mentors and management users must
            provide accurate information when creating or using
            an account.
          </p>

          <ul>
            <li>Users must provide correct account information.</li>
            <li>Users must keep their login credentials secure.</li>
            <li>Passwords and OTPs must not be shared.</li>
            <li>Users are responsible for activity performed through their account.</li>
          </ul>

        </section>


        {/* 3 */}
        <section className="terms-section">

          <div className="terms-section-title">
            <BookOpen size={21} />
            <h2>3. Examination Rules</h2>
          </div>

          <p>
            Students using the examination platform must follow
            the examination instructions provided by the college.
          </p>

          <ul>
            <li>Students must attempt examinations honestly.</li>
            <li>Students should not share examination questions or answers improperly.</li>
            <li>Students must follow the examination time limits.</li>
            <li>Unauthorised assistance during examinations is not permitted.</li>
            <li>The college may review examination activity when required.</li>
          </ul>

        </section>


        {/* 4 */}
        <section className="terms-section">

          <div className="terms-section-title">
            <FileText size={21} />
            <h2>4. Academic Results</h2>
          </div>

          <p>
            Examination marks, results and academic information displayed
            on the platform are intended for educational and administrative
            purposes.
          </p>

          <p>
            If a student believes that a result or academic record is
            incorrect, the student should contact the authorised college
            teacher or management team for clarification.
          </p>

        </section>


        {/* 5 */}
        <section className="terms-section">

          <div className="terms-section-title">
            <Lock size={21} />
            <h2>5. Account Security</h2>
          </div>

          <p>
            Users must take reasonable steps to protect their account.
            The college platform should not be used to access another
            person's account or information without permission.
          </p>

          <div className="terms-highlight">
            <Lock size={20} />

            <span>
              Never share your password, OTP or account credentials
              with another person.
            </span>
          </div>

        </section>


        {/* 6 */}
        <section className="terms-section">

          <div className="terms-section-title">
            <AlertCircle size={21} />
            <h2>6. Prohibited Activities</h2>
          </div>

          <p>
            Users must not misuse the website, examination platform
            or college services.
          </p>

          <ul>
            <li>Attempting unauthorised access to accounts</li>
            <li>Uploading harmful or malicious content</li>
            <li>Attempting to damage or disrupt the platform</li>
            <li>Misusing another user's information</li>
            <li>Cheating or manipulating examination results</li>
            <li>Using the platform for unlawful purposes</li>
          </ul>

        </section>


        {/* 7 */}
        <section className="terms-section">

          <div className="terms-section-title">
            <ShieldCheck size={21} />
            <h2>7. College Content</h2>
          </div>

          <p>
            College-related content such as logos, photographs,
            educational materials, examination resources and
            website content may belong to STG Pre-University College
            or its respective owners.
          </p>

          <p>
            Such content should not be copied, reproduced or
            redistributed without appropriate permission.
          </p>

        </section>


        {/* 8 */}
        <section className="terms-section">

          <div className="terms-section-title">
            <GraduationCap size={21} />
            <h2>8. Student Responsibilities</h2>
          </div>

          <p>
            Students are expected to use the platform responsibly
            and follow the academic and administrative instructions
            provided by the college.
          </p>

          <ul>
            <li>Maintain respectful behaviour.</li>
            <li>Use educational resources appropriately.</li>
            <li>Follow college examination instructions.</li>
            <li>Keep account information secure.</li>
            <li>Report technical or account issues to the college.</li>
          </ul>

        </section>


        {/* 9 */}
        <section className="terms-section">

          <div className="terms-section-title">
            <ShieldCheck size={21} />
            <h2>9. Service Availability</h2>
          </div>

          <p>
            We aim to keep the website and educational services
            available and functional. However, temporary interruptions
            may occur due to maintenance, technical problems,
            hosting issues, network failures or other circumstances.
          </p>

        </section>


        {/* 10 */}
        <section className="terms-section">

          <div className="terms-section-title">
            <FileText size={21} />
            <h2>10. Changes to the Platform</h2>
          </div>

          <p>
            STG Pre-University College may update, improve, modify
            or discontinue certain website features or services when
            necessary.
          </p>

        </section>


        {/* 11 */}
        <section className="terms-section">

          <div className="terms-section-title">
            <ShieldCheck size={21} />
            <h2>11. Privacy</h2>
          </div>

          <p>
            Use of this platform is also subject to our Privacy Policy.
            Information about how user information is handled is
            explained separately in the Privacy Policy.
          </p>

          <button
            type="button"
            className="terms-link-btn"
            onClick={() => navigate("/privacy")}
          >
            View Privacy Policy
          </button>

        </section>


        {/* 12 */}
        <section className="terms-section">

          <div className="terms-section-title">
            <Mail size={21} />
            <h2>12. Contact & Support</h2>
          </div>

          <p>
            For questions regarding these Terms & Conditions,
            admissions, examinations or college services, please
            contact STG Pre-University College.
          </p>

          <div className="terms-contact-card">

            <strong>
              STG Pre-University College
            </strong>

            <span>
              Chinakurali, Pandavapura Taluk,
              Mandya District - 571455
            </span>

            <a href="tel:+918951787788">
              +91 89517 87788
            </a>

            <a href="mailto:info@stgpuc.com">
              info@stgpuc.com
            </a>

          </div>

        </section>


        {/* FINAL */}
        <section className="terms-final-card">

          <ShieldCheck size={24} />

          <div>
            <h3>Thank You</h3>

            <p>
              Thank you for using the STG Pre-University College
              educational platform responsibly.
            </p>
          </div>

        </section>


        {/* BOTTOM */}
        <div className="terms-bottom">

          <span>
            STG Pre-University College
          </span>

          <span>
            Terms & Conditions
          </span>

        </div>

      </main>
    </div>
  );
};

export default TermsConditions;