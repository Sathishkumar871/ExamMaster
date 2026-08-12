import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  GraduationCap,
  HelpCircle,
  Search,
  MessageCircle,
  Phone,
  BookOpen,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./FAQ.css";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    category: "Admissions",
    question: "How can I apply for admission at STG Pre-University College?",
    answer:
      "Students or parents can submit an admission enquiry through the Admissions page. You can provide the student's name, parent or guardian details, location, class, course and other basic information. The enquiry can then be shared with the college admission team through WhatsApp.",
  },
  {
    category: "Admissions",
    question: "Which classes can apply for admission?",
    answer:
      "STG Pre-University College provides admission information for students seeking admission into 1st PUC and 2nd PUC. Please contact the college admission team for the latest eligibility and availability details.",
  },
  {
    category: "Admissions",
    question: "What details are required for an admission enquiry?",
    answer:
      "The enquiry may include the student's name, parent or guardian name, mobile number, village or city, district, class or year, preferred course, subject or stream, previous school or college and any additional questions.",
  },
  {
    category: "Admissions",
    question: "Can I contact the college directly regarding admission?",
    answer:
      "Yes. You can contact the college admission team directly by phone or WhatsApp using the contact details provided on the website.",
  },
  {
    category: "Courses",
    question: "What courses or streams are available?",
    answer:
      "The college website provides information about the available academic streams and subjects. Students can visit the Courses section or contact the college for the latest course combinations and availability.",
  },
  {
    category: "Courses",
    question: "How do I know which subject combination is suitable for me?",
    answer:
      "Students can discuss their academic interests, future plans and preferred subjects with the college team before selecting a stream. The faculty can help students understand the available combinations.",
  },
  {
    category: "Faculty",
    question: "Where can I see the college faculty information?",
    answer:
      "You can visit the Faculty section of the website to view the college leadership, department heads and faculty members along with their subjects, qualifications and experience.",
  },
  {
    category: "Faculty",
    question: "Can I contact a particular faculty member?",
    answer:
      "Faculty contact details may be provided on the website where appropriate. For general academic enquiries, students and parents can contact the college administration or admission team.",
  },
  {
    category: "Students",
    question: "How can students login to the examination platform?",
    answer:
      "Students can use the Student Login option available on the website. After successful login, students can access the features available to their account.",
  },
  {
    category: "Students",
    question: "Where can students find Daily Tests?",
    answer:
      "After student login, students can access the Daily Tests section from the navigation menu or student dashboard.",
  },
  {
    category: "Students",
    question: "Can students view their examination results online?",
    answer:
      "Students can access result-related features through their student account when those features are enabled for their account.",
  },
  {
    category: "Examinations",
    question: "What is the purpose of the examination platform?",
    answer:
      "The platform is designed to help the college manage examinations, student assessments, question banks, daily tests and academic results in an organized digital environment.",
  },
  {
    category: "Examinations",
    question: "What is the Question Bank?",
    answer:
      "The Question Bank is an academic resource used to organize and manage examination questions by subjects, chapters and other academic categories.",
  },
  {
    category: "Campus",
    question: "Where is STG Pre-University College located?",
    answer:
      "STG Pre-University College is located at Chinakurali, Pandavapura Taluk, Mandya District - 571455.",
  },
  {
    category: "Campus",
    question: "How can I find the college location?",
    answer:
      "The Contact section of the website contains a Google Maps location link. You can use it to open the college location and get directions.",
  },
  {
    category: "Contact",
    question: "What is the college contact number?",
    answer:
      "The admissions and enquiries contact number listed on the website is +91 89517 87788.",
  },
  {
    category: "Contact",
    question: "Can I contact the college through WhatsApp?",
    answer:
      "Yes. The website provides a WhatsApp enquiry option. You can use it to send an admission or general college enquiry directly.",
  },
  {
    category: "Website",
    question: "How can I contact the college if my question is not listed here?",
    answer:
      "If your question is not answered in this FAQ section, you can use the Get in Touch section to call, email or WhatsApp the college team.",
  },
  {
    category: "Website",
    question: "Is the information on the website updated?",
    answer:
      "The website is intended to provide college information and digital services. For admission dates, course availability, fees and other time-sensitive information, please confirm the latest details with the college team.",
  },
];

const categories = [
  "All",
  "Admissions",
  "Courses",
  "Faculty",
  "Students",
  "Examinations",
  "Campus",
  "Contact",
  "Website",
];

const FAQ: React.FC = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFAQs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return faqData.filter((faq) => {
      const categoryMatch =
        activeCategory === "All" ||
        faq.category === activeCategory;

      const searchMatch =
        !query ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.category.toLowerCase().includes(query);

      return categoryMatch && searchMatch;
    });
  }, [search, activeCategory]);

  const toggleFAQ = (index: number) => {
    setOpenIndex((previous) =>
      previous === index ? null : index
    );
  };

  return (
    <div className="college-page faq-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="college-hero faq-hero">

        <div className="college-hero-overlay" />

        <div className="college-hero-content">

          <button
            type="button"
            className="college-back-btn"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <div className="college-hero-icon">
            <HelpCircle size={32} />
          </div>

          <span className="college-eyebrow">
            STG PRE-UNIVERSITY COLLEGE
          </span>

          <h1>
            Frequently Asked <span>Questions</span>
          </h1>

          <p>
            Find answers to common questions about admissions,
            courses, faculty, examinations, students and the
            college.
          </p>

        </div>
      </section>


      {/* =====================================================
          FAQ CONTENT
      ===================================================== */}

      <main className="college-page-container faq-container">

        {/* INTRO */}

        <section className="faq-intro">

          <div className="faq-intro-icon">
            <GraduationCap size={25} />
          </div>

          <div>
            <span>STG COLLEGE SUPPORT</span>

            <h2>
              How can we help you?
            </h2>

            <p>
              Search your question or select a category below
              to quickly find the information you need.
            </p>
          </div>

        </section>


        {/* SEARCH */}

        <div className="faq-search">

          <Search size={20} />

          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOpenIndex(null);
            }}
            placeholder="Search admissions, courses, exams, faculty..."
            aria-label="Search frequently asked questions"
          />

          {search && (
            <button
              type="button"
              className="faq-clear"
              onClick={() => setSearch("")}
            >
              Clear
            </button>
          )}

        </div>


        {/* CATEGORIES */}

        <div className="faq-categories">

          {categories.map((category) => (

            <button
              key={category}
              type="button"
              className={
                activeCategory === category
                  ? "active"
                  : ""
              }
              onClick={() => {
                setActiveCategory(category);
                setOpenIndex(null);
              }}
            >
              {category}
            </button>

          ))}

        </div>


        {/* FAQ COUNT */}

        <div className="faq-result-info">

          <span>
            {filteredFAQs.length} questions
          </span>

          {activeCategory !== "All" && (
            <span>
              • {activeCategory}
            </span>
          )}

        </div>


        {/* FAQ LIST */}

        <section className="faq-list">

          {filteredFAQs.length > 0 ? (

            filteredFAQs.map((faq, index) => {

              const isOpen = openIndex === index;

              return (
                <article
                  className={`faq-item ${
                    isOpen ? "open" : ""
                  }`}
                  key={`${faq.category}-${faq.question}`}
                >

                  <button
                    type="button"
                    className="faq-question"
                    onClick={() => toggleFAQ(index)}
                    aria-expanded={isOpen}
                  >

                    <div className="faq-question-left">

                      <span className="faq-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div>

                        <span className="faq-category">
                          {faq.category}
                        </span>

                        <h3>
                          {faq.question}
                        </h3>

                      </div>

                    </div>

                    <span className="faq-chevron">
                      <ChevronDown size={19} />
                    </span>

                  </button>


                  <div
                    className={`faq-answer-wrapper ${
                      isOpen ? "show" : ""
                    }`}
                  >

                    <div className="faq-answer">

                      <div className="faq-answer-line" />

                      <p>
                        {faq.answer}
                      </p>

                    </div>

                  </div>

                </article>
              );
            })

          ) : (

            <div className="faq-empty">

              <div className="faq-empty-icon">
                <Search size={25} />
              </div>

              <h3>
                No questions found
              </h3>

              <p>
                We couldn't find an FAQ matching your search.
                Try another keyword or choose a different
                category.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveCategory("All");
                }}
              >
                Show All Questions
              </button>

            </div>

          )}

        </section>


        {/* =================================================
            QUICK SUPPORT
        ================================================= */}

        <section className="faq-support">

          <div className="faq-support-icon">
            <MessageCircle size={24} />
          </div>

          <div className="faq-support-content">

            <span>
              STILL HAVE A QUESTION?
            </span>

            <h2>
              Talk to the STG College Team
            </h2>

            <p>
              If you couldn't find the answer you're looking
              for, contact the college team directly.
            </p>

          </div>


          <div className="faq-support-actions">

            <a
              href={`https://wa.me/918951787788?text=${encodeURIComponent(
                "Hi, I have a question about STG Pre-University College. Please help me."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={17} />
              WhatsApp
            </a>


            <a href="tel:+918951787788">
              <Phone size={17} />
              Call
            </a>

          </div>

        </section>


        {/* =================================================
            INFORMATION LINKS
        ================================================= */}

        <section className="faq-bottom-links">

          <button
            type="button"
            onClick={() => navigate("/admissions")}
          >
            <GraduationCap size={18} />

            <div>
              <strong>
                Admission Enquiry
              </strong>

              <span>
                Send your admission details
              </span>
            </div>
          </button>


          <button
            type="button"
            onClick={() => navigate("/courses")}
          >
            <BookOpen size={18} />

            <div>
              <strong>
                Explore Courses
              </strong>

              <span>
                View academic information
              </span>
            </div>
          </button>


          <button
            type="button"
            onClick={() => navigate("/privacy")}
          >
            <ShieldCheck size={18} />

            <div>
              <strong>
                Privacy Policy
              </strong>

              <span>
                Learn how website data is handled
              </span>
            </div>
          </button>

        </section>

      </main>
    </div>
  );
};

export default FAQ;