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
  X,
  Send,
  Sparkles,
  Bot,
  Lightbulb,
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

  // ASK QUESTION
  const [isAskOpen, setIsAskOpen] = useState(false);
  const [userQuestion, setUserQuestion] = useState("");
  const [askedAnswer, setAskedAnswer] = useState<FAQItem | null>(null);
  const [noAnswer, setNoAnswer] = useState(false);

  const filteredFAQs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return faqData.filter((faq) => {
      const categoryMatch =
        activeCategory === "All" || faq.category === activeCategory;

      const searchMatch =
        !query ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.category.toLowerCase().includes(query);

      return categoryMatch && searchMatch;
    });
  }, [search, activeCategory]);

  const toggleFAQ = (index: number) => {
    setOpenIndex((previous) => (previous === index ? null : index));
  };

  // =====================================================
  // SMART QUESTION MATCHING
  // =====================================================

  const findBestAnswer = (question: string): FAQItem | null => {
    const query = question
      .toLowerCase()
      .replace(/[?.,!]/g, "")
      .trim();

    if (!query) return null;

    const words = query
      .split(/\s+/)
      .filter((word) => word.length > 2);

    let bestMatch: FAQItem | null = null;
    let bestScore = 0;

    faqData.forEach((faq) => {
      const searchableText =
        `${faq.question} ${faq.answer} ${faq.category}`.toLowerCase();

      let score = 0;

      words.forEach((word) => {
        if (searchableText.includes(word)) {
          score += 1;
        }
      });

      // Important phrase matches
      if (
        query.includes("admission") &&
        searchableText.includes("admission")
      ) {
        score += 4;
      }

      if (
        query.includes("course") &&
        searchableText.includes("course")
      ) {
        score += 4;
      }

      if (
        query.includes("faculty") &&
        searchableText.includes("faculty")
      ) {
        score += 4;
      }

      if (
        query.includes("teacher") &&
        searchableText.includes("faculty")
      ) {
        score += 3;
      }

      if (
        query.includes("daily test") &&
        searchableText.includes("daily tests")
      ) {
        score += 5;
      }

      if (
        query.includes("question bank") &&
        searchableText.includes("question bank")
      ) {
        score += 5;
      }

      if (
        query.includes("exam") &&
        searchableText.includes("examination")
      ) {
        score += 3;
      }

      if (
        query.includes("result") &&
        searchableText.includes("result")
      ) {
        score += 4;
      }

      if (
        query.includes("login") &&
        searchableText.includes("login")
      ) {
        score += 4;
      }

      if (
        query.includes("whatsapp") &&
        searchableText.includes("whatsapp")
      ) {
        score += 5;
      }

      if (
        query.includes("phone") ||
        query.includes("contact")
      ) {
        if (searchableText.includes("contact")) {
          score += 4;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = faq;
      }
    });

    return bestScore >= 1 ? bestMatch : null;
  };

  const handleAskQuestion = () => {
    const answer = findBestAnswer(userQuestion);

    if (answer) {
      setAskedAnswer(answer);
      setNoAnswer(false);
    } else {
      setAskedAnswer(null);
      setNoAnswer(true);
    }
  };

  const clearAskQuestion = () => {
    setUserQuestion("");
    setAskedAnswer(null);
    setNoAnswer(false);
  };

  const openAskModal = () => {
    clearAskQuestion();
    setIsAskOpen(true);
  };

  const closeAskModal = () => {
    setIsAskOpen(false);
    clearAskQuestion();
  };

  return (
    <div className="college-page faq-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="college-hero faq-hero">

        <div className="college-hero-overlay" />

        <div className="college-hero-glow glow-one" />
        <div className="college-hero-glow glow-two" />

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

          <button
            type="button"
            className="hero-ask-button"
            onClick={openAskModal}
          >
            <Sparkles size={17} />
            Ask a Question
            <span className="hero-ask-arrow">→</span>
          </button>

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

          <button
            type="button"
            className="faq-intro-ask"
            onClick={openAskModal}
          >
            <Sparkles size={17} />
            Ask Question
          </button>

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


      {/* =====================================================
          FLOATING ASK QUESTION BUTTON
      ===================================================== */}

      <button
        type="button"
        className="floating-ask-button"
        onClick={openAskModal}
        aria-label="Ask a question"
      >
        <span className="floating-ask-icon">
          <Sparkles size={19} />
        </span>

        <span className="floating-ask-text">
          Ask a Question
        </span>
      </button>


      {/* =====================================================
          ASK QUESTION MODAL
      ===================================================== */}

      {isAskOpen && (

        <div
          className="ask-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeAskModal();
            }
          }}
        >

          <div className="ask-modal">

            {/* MODAL HEADER */}

            <div className="ask-modal-header">

              <div className="ask-modal-brand">

                <div className="ask-modal-icon">
                  <Bot size={23} />
                </div>

                <div>
                  <span>
                    STG COLLEGE ASSIST
                  </span>

                  <h2>
                    Ask Your Question
                  </h2>
                </div>

              </div>

              <button
                type="button"
                className="ask-close-button"
                onClick={closeAskModal}
                aria-label="Close"
              >
                <X size={20} />
              </button>

            </div>


            {/* MODAL BODY */}

            <div className="ask-modal-body">

              <div className="ask-welcome">

                <div className="ask-welcome-icon">
                  <Lightbulb size={19} />
                </div>

                <div>
                  <strong>
                    What would you like to know?
                  </strong>

                  <p>
                    Ask about admissions, courses, exams,
                    students, faculty or the campus.
                  </p>
                </div>

              </div>


              {/* QUESTION INPUT */}

              <div className="ask-input-wrapper">

                <textarea
                  value={userQuestion}
                  onChange={(e) => {
                    setUserQuestion(e.target.value);

                    if (askedAnswer || noAnswer) {
                      setAskedAnswer(null);
                      setNoAnswer(false);
                    }
                  }}
                  placeholder="Example: How can I apply for admission?"
                  rows={4}
                  autoFocus
                />

                <span className="ask-character-count">
                  {userQuestion.length}/300
                </span>

              </div>


              {/* SUGGESTIONS */}

              <div className="ask-suggestions">

                <span>
                  Try asking:
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setUserQuestion(
                      "How can I apply for admission?"
                    )
                  }
                >
                  Admission
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setUserQuestion(
                      "What courses are available?"
                    )
                  }
                >
                  Courses
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setUserQuestion(
                      "Where can students find Daily Tests?"
                    )
                  }
                >
                  Daily Tests
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setUserQuestion(
                      "What is the college contact number?"
                    )
                  }
                >
                  Contact
                </button>

              </div>


              {/* ASK BUTTON */}

              <button
                type="button"
                className="ask-submit-button"
                onClick={handleAskQuestion}
                disabled={!userQuestion.trim()}
              >
                <Send size={17} />
                Find My Answer
              </button>


              {/* ANSWER */}

              {askedAnswer && (

                <div className="ask-result success-result">

                  <div className="ask-result-top">

                    <div className="ask-result-icon">
                      <Sparkles size={18} />
                    </div>

                    <div>
                      <span>
                        BEST MATCH • {askedAnswer.category}
                      </span>

                      <h3>
                        {askedAnswer.question}
                      </h3>
                    </div>

                  </div>

                  <div className="ask-result-answer">
                    <p>
                      {askedAnswer.answer}
                    </p>
                  </div>

                </div>

              )}


              {/* NO ANSWER */}

              {noAnswer && (

                <div className="ask-result no-answer-result">

                  <div className="ask-result-top">

                    <div className="ask-result-icon">
                      <MessageCircle size={18} />
                    </div>

                    <div>
                      <span>
                        WE COULDN'T FIND A MATCH
                      </span>

                      <h3>
                        Let the STG College Team help you
                      </h3>
                    </div>

                  </div>

                  <p>
                    We couldn't find a matching answer in
                    our FAQ database. You can contact the
                    college directly and ask your question.
                  </p>

                  <div className="no-answer-actions">

                    <a
                      href={`https://wa.me/918951787788?text=${encodeURIComponent(
                        `Hi STG College, I have a question: ${userQuestion}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle size={16} />
                      Ask on WhatsApp
                    </a>

                    <a href="tel:+918951787788">
                      <Phone size={16} />
                      Call College
                    </a>

                  </div>

                </div>

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default FAQ;