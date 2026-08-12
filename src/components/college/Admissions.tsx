import React, { useState } from "react";
import {
  GraduationCap,
  MapPin,
  Phone,
  MessageCircle,
  User,
  BookOpen,
  School,
  Send,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./Admission.css";
const Admission: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    studentName: "",
    parentName: "",
    mobile: "",
    village: "",
    district: "",
    className: "",
    course: "",
    subject: "",
    previousCollege: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const mobile = "8951787788";

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const message = `
STG Pre-University College - Admission Enquiry

Student Name: ${formData.studentName}
Parent / Guardian Name: ${formData.parentName}
Mobile: ${formData.mobile}

Village / City: ${formData.village}
District: ${formData.district}

Class / Year: ${formData.className}
Course: ${formData.course}
Preferred Subject: ${formData.subject}

Previous School / College: ${formData.previousCollege}

Additional Message:
${formData.message}

Please contact me regarding admission at STG Pre-University College.
    `.trim();

    const whatsappUrl = `https://wa.me/91${mobile}?text=${encodeURIComponent(
      message
    )}`;

    setSubmitted(true);

    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="college-page admission-page">

      {/* =====================================================
          TOP HERO
      ===================================================== */}

      <section className="college-hero admission-hero">

        <div className="college-hero-overlay" />

        <div className="college-hero-content">

          <button
            className="college-back-btn"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <div className="college-hero-icon">
            <GraduationCap size={32} />
          </div>

          <span className="college-eyebrow">
            STG PRE-UNIVERSITY COLLEGE
          </span>

          <h1>
            Admission <span>Enquiry</span>
          </h1>

          <p>
            Start your journey with STG Pre-University College.
            Share your details and our college team will contact you.
          </p>

        </div>
      </section>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="college-page-container">

        <div className="admission-layout">

          {/* =================================================
              LEFT INFORMATION
          ================================================= */}

          <aside className="admission-info">

            <div className="info-card premium-info-card">

              <div className="info-card-icon">
                <School size={24} />
              </div>

              <span className="info-label">
                ADMISSIONS
              </span>

              <h2>
                Join STG Pre-University College
              </h2>

              <p>
                Fill in the enquiry form with your basic details.
                Your enquiry will be shared with the college
                admission team through WhatsApp.
              </p>

            </div>


            <div className="info-card">

              <div className="info-row">
                <div className="info-small-icon">
                  <MapPin size={18} />
                </div>

                <div>
                  <span>Campus</span>
                  <strong>
                    Chinakurali, Pandavapura Taluk,
                    Mandya District - 571455
                  </strong>
                </div>
              </div>


              <div className="info-row">

                <div className="info-small-icon">
                  <Phone size={18} />
                </div>

                <div>
                  <span>Admissions</span>
                  <strong>
                    +91 89517 87788
                  </strong>
                </div>

              </div>


              <div className="info-row">

                <div className="info-small-icon">
                  <MessageCircle size={18} />
                </div>

                <div>
                  <span>WhatsApp</span>
                  <strong>
                    Admission Enquiry
                  </strong>
                </div>

              </div>

            </div>


            {/* QUICK WHATSAPP */}

            <a
              href={`https://wa.me/91${mobile}?text=${encodeURIComponent(
                "Hi, I would like to enquire about admission at STG Pre-University College."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="quick-whatsapp"
            >

              <MessageCircle size={21} />

              <div>
                <strong>
                  Chat with Admission Team
                </strong>

                <span>
                  WhatsApp your enquiry directly
                </span>
              </div>

            </a>

          </aside>


          {/* =================================================
              FORM
          ================================================= */}

          <section className="admission-form-card">

            <div className="form-heading">

              <div className="form-heading-icon">
                <User size={22} />
              </div>

              <div>

                <span>
                  STUDENT INFORMATION
                </span>

                <h2>
                  Admission Enquiry Form
                </h2>

                <p>
                  Please provide accurate information so the
                  college team can contact you.
                </p>

              </div>

            </div>


            <form onSubmit={handleSubmit}>

              {/* STUDENT */}

              <div className="form-section-title">
                <User size={17} />
                Student & Parent Details
              </div>

              <div className="form-grid">

                <div className="form-group">

                  <label>
                    Student Name *
                  </label>

                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    placeholder="Enter student name"
                    required
                  />

                </div>


                <div className="form-group">

                  <label>
                    Parent / Guardian Name *
                  </label>

                  <input
                    type="text"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleChange}
                    placeholder="Enter parent / guardian name"
                    required
                  />

                </div>


                <div className="form-group">

                  <label>
                    Mobile Number *
                  </label>

                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="Enter mobile number"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    required
                  />

                </div>

              </div>


              {/* LOCATION */}

              <div className="form-section-title">
                <MapPin size={17} />
                Location Details
              </div>


              <div className="form-grid">

                <div className="form-group">

                  <label>
                    Village / City *
                  </label>

                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    placeholder="Your village / city"
                    required
                  />

                </div>


                <div className="form-group">

                  <label>
                    District *
                  </label>

                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="Your district"
                    required
                  />

                </div>

              </div>


              {/* EDUCATION */}

              <div className="form-section-title">
                <BookOpen size={17} />
                Academic Details
              </div>


              <div className="form-grid">

                <div className="form-group">

                  <label>
                    Class / Year *
                  </label>

                  <select
                    name="className"
                    value={formData.className}
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Select class / year
                    </option>

                    <option value="1st PUC">
                      1st PUC
                    </option>

                    <option value="2nd PUC">
                      2nd PUC
                    </option>

                  </select>

                </div>


                <div className="form-group">

                  <label>
                    Course *
                  </label>

                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Select course
                    </option>

                    <option value="Science">
                      Science
                    </option>

                    <option value="Commerce">
                      Commerce
                    </option>

                    <option value="Arts">
                      Arts
                    </option>

                  </select>

                </div>


                <div className="form-group">

                  <label>
                    Preferred Subject / Stream
                  </label>

                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Example: PCMB, PCMC, Commerce..."
                  />

                </div>


                <div className="form-group">

                  <label>
                    Previous School / College
                  </label>

                  <input
                    type="text"
                    name="previousCollege"
                    value={formData.previousCollege}
                    onChange={handleChange}
                    placeholder="Enter previous school / college"
                  />

                </div>

              </div>


              {/* MESSAGE */}

              <div className="form-group">

                <label>
                  Additional Message
                </label>

                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Any questions or information you want to share..."
                  rows={5}
                />

              </div>


              {/* SUBMIT */}

              <button
                type="submit"
                className="admission-submit-btn"
              >

                <Send size={19} />

                Send Admission Enquiry

              </button>


              <p className="form-note">
                Your enquiry will open in WhatsApp and can be
                reviewed by the college admission team.
              </p>

            </form>


            {/* SUCCESS */}

            {submitted && (

              <div className="admission-success">

                <CheckCircle2 size={24} />

                <div>

                  <strong>
                    Enquiry Prepared Successfully
                  </strong>

                  <span>
                    Your admission enquiry has been prepared
                    for WhatsApp.
                  </span>

                </div>

              </div>

            )}

          </section>

        </div>

      </main>

    </div>
  );
};

export default Admission;