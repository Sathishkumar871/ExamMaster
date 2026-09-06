
import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  GraduationCap,
  BookOpen,
  Award,
  Crown,
  Building2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./Faculty.css";

/* =========================================================
   FACULTY INTERFACE
========================================================= */

interface FacultyMember {
  _id: string;
  name: string;
  designation: string;
  role: "ceo" | "principal" | "department-head" | "teacher";
  department: string;
  subject: string;
  qualification: string;
  experience?: string;
  image: string;
  email?: string;
  phone?: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
}

/* =========================================================
   API URL
========================================================= */

const API_URL =
  "https://exammaster-backend-up1y.onrender.com/api/faculty";

/* =========================================================
   FACULTY PAGE
========================================================= */

const Faculty: React.FC = () => {
  const navigate = useNavigate();

  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ========================================================
     FETCH FACULTY
  ======================================================== */

  useEffect(() => {
    const controller = new AbortController();

    const fetchFaculty = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch faculty: ${response.status}`
          );
        }

        const data = await response.json();

        if (!controller.signal.aborted) {
          setFaculty(
            Array.isArray(data?.faculty)
              ? data.faculty
              : []
          );
        }
      } catch (err) {
        if (
          err instanceof DOMException &&
          err.name === "AbortError"
        ) {
          return;
        }

        if (!controller.signal.aborted) {
          setError(
            "Unable to load faculty information."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchFaculty();

    return () => {
      controller.abort();
    };
  }, []);

  /* ========================================================
     ORGANIZE FACULTY DATA
     
     Instead of repeatedly doing:
     find()
     find()
     filter()
     filter()
     
     we process the faculty array once.
  ======================================================== */

  const {
    ceo,
    principal,
    hods,
    teachers,
    departments,
  } = useMemo(() => {
    let ceo: FacultyMember | undefined;
    let principal: FacultyMember | undefined;

    const hods: FacultyMember[] = [];
    const teachers: FacultyMember[] = [];

    const departmentSet = new Set<string>();

    for (const member of faculty) {
      switch (member.role) {
        case "ceo":
          ceo = member;
          break;

        case "principal":
          principal = member;
          break;

        case "department-head":
          hods.push(member);

          if (
            member.department &&
            member.department !== "Administration"
          ) {
            departmentSet.add(member.department);
          }

          break;

        case "teacher":
          teachers.push(member);

          if (
            member.department &&
            member.department !== "Administration"
          ) {
            departmentSet.add(member.department);
          }

          break;

        default:
          break;
      }
    }

    return {
      ceo,
      principal,
      hods,
      teachers,
      departments: Array.from(departmentSet),
    };
  }, [faculty]);

  /* ========================================================
     DEPARTMENT DATA
     
     Build department maps once instead of filtering
     teachers/HODs every time the JSX renders.
  ======================================================== */

  const departmentData = useMemo(() => {
    const hodMap = new Map<string, FacultyMember>();
    const teacherMap = new Map<
      string,
      FacultyMember[]
    >();

    for (const hod of hods) {
      if (hod.department) {
        hodMap.set(hod.department, hod);
      }
    }

    for (const teacher of teachers) {
      if (!teacher.department) continue;

      const existing =
        teacherMap.get(teacher.department);

      if (existing) {
        existing.push(teacher);
      } else {
        teacherMap.set(teacher.department, [teacher]);
      }
    }

    return {
      hodMap,
      teacherMap,
    };
  }, [hods, teachers]);

  /* ========================================================
     LOADING SCREEN
  ======================================================== */

  if (loading) {
    return (
      <div className="faculty-loading-page">
        <div className="faculty-loader">
          <div className="faculty-loader-icon">
            <GraduationCap size={30} />
          </div>

          <h3>Loading Faculty</h3>

          <p>
            Preparing our academic team...
          </p>

          <div className="faculty-loader-bar">
            <span />
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================
     ERROR SCREEN
  ======================================================== */

  if (error) {
    return (
      <div className="faculty-error-page">
        <div className="faculty-error-content">
          <Building2 size={40} />

          <h2>
            Faculty information unavailable
          </h2>

          <p>{error}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* ========================================================
     MAIN PAGE
  ======================================================== */

  return (
    <div className="college-page faculty-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="college-hero faculty-hero">
        <div
          className="college-hero-overlay"
          aria-hidden="true"
        />

        <div className="college-hero-content">

          <button
            type="button"
            className="college-back-btn"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <div
            className="college-hero-icon"
            aria-hidden="true"
          >
            <GraduationCap size={32} />
          </div>

          <span className="college-eyebrow">
            STG PRE-UNIVERSITY COLLEGE
          </span>

          <h1>
            Our <span>Faculty</span>
          </h1>

          <p>
            Meet the academic leaders and educators
            who guide our students towards knowledge,
            confidence and success.
          </p>
        </div>
      </section>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="college-page-container">

        {/* ===================================================
            FOUNDER / CEO
        =================================================== */}

        {ceo && (
          <section className="faculty-ceo-section">

            <div className="section-heading">
              <span>LEADERSHIP</span>

              <h2>
                Vision Behind <em>STG</em>
              </h2>

              <p>
                Leadership that inspires excellence,
                innovation and a strong educational
                foundation.
              </p>
            </div>

            <article className="ceo-card">

              <div
                className="ceo-glow"
                aria-hidden="true"
              />

              <div className="ceo-image-wrap">

                <div
                  className="ceo-crown"
                  aria-hidden="true"
                >
                  <Crown size={20} />
                </div>

                <img
                  src={ceo.image}
                  alt={ceo.name}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  width="600"
                  height="600"
                />
              </div>

              <div className="ceo-content">

                <div className="ceo-badge">
                  <Sparkles size={14} />
                  FOUNDER
                </div>

                <h2>{ceo.name}</h2>

                <h3>{ceo.designation}</h3>

                <p className="ceo-description">
                  {ceo.description}
                </p>

                {ceo.qualification && (
                  <div className="ceo-qualification">
                    <GraduationCap size={17} />

                    <span>
                      {ceo.qualification}
                    </span>
                  </div>
                )}
              </div>
            </article>
          </section>
        )}

        {/* ===================================================
            PRINCIPAL
        =================================================== */}

        {principal && (
          <section className="faculty-principal-section">

            <div className="section-heading">

              <span>
                ACADEMIC LEADERSHIP
              </span>

              <h2>
                Leading With <em>Purpose</em>
              </h2>

              <p>
                Our Principal works closely with
                faculty and students to build a
                disciplined and supportive academic
                environment.
              </p>
            </div>

            <article className="principal-card">

              <div className="principal-image">

                <img
                  src={principal.image}
                  alt={principal.name}
                  loading="lazy"
                  decoding="async"
                  width="600"
                  height="600"
                />

                <div className="principal-image-badge">
                  <GraduationCap size={16} />
                  PRINCIPAL
                </div>
              </div>

              <div className="principal-content">

                <span className="principal-label">
                  PRINCIPAL
                </span>

                <h2>{principal.name}</h2>

                {principal.subject && (
                  <p className="principal-subject">
                    {principal.subject}
                  </p>
                )}

                <p>
                  {principal.description}
                </p>

                {principal.qualification && (
                  <div className="principal-qualification">

                    <GraduationCap size={16} />

                    <span>
                      {principal.qualification}
                    </span>

                  </div>
                )}
              </div>
            </article>
          </section>
        )}

        {/* ===================================================
            ACADEMIC DEPARTMENTS
        =================================================== */}

        <section className="faculty-departments">

          <div className="section-heading">

            <span>
              ACADEMIC DEPARTMENTS
            </span>

            <h2>
              Meet Our <em>Educators</em>
            </h2>

            <p>
              Experienced educators dedicated to
              helping every student achieve their
              academic potential.
            </p>
          </div>

          {/* =================================================
              DEPARTMENT LOOP
          ================================================= */}

          {departments.map((department) => {

            const hod =
              departmentData.hodMap.get(
                department
              );

            const departmentTeachers =
              departmentData.teacherMap.get(
                department
              ) ?? [];

            return (
              <section
                className="faculty-department"
                key={department}
              >

                {/* ===========================================
                    DEPARTMENT HEADER
                =========================================== */}

                <div className="department-header">

                  <div className="department-title">

                    <div
                      className="department-icon"
                      aria-hidden="true"
                    >
                      <BookOpen size={22} />
                    </div>

                    <div>
                      <span>
                        ACADEMIC DEPARTMENT
                      </span>

                      <h2>{department}</h2>
                    </div>

                  </div>
                </div>

                {/* ===========================================
                    HOD
                =========================================== */}

                {hod && (
                  <>
                    <div className="subject-head-label">

                      <div>HOD</div>

                      <span>
                        Academic Leadership
                      </span>

                    </div>

                    <article className="department-head-card">

                      <div className="department-head-image">

                        <img
                          src={hod.image}
                          alt={hod.name}
                          loading="lazy"
                          decoding="async"
                          width="500"
                          height="500"
                        />

                        <div className="head-photo-badge">
                          <Award size={14} />
                          HOD
                        </div>

                      </div>

                      <div className="department-head-content">

                        <span>
                          {hod.designation}
                        </span>

                        <h3>{hod.name}</h3>

                        {hod.subject && (
                          <strong>
                            {hod.subject}
                          </strong>
                        )}

                        <p>
                          {hod.description}
                        </p>

                        {hod.qualification && (
                          <div className="head-qualification">

                            <GraduationCap size={15} />

                            <span>
                              {hod.qualification}
                            </span>

                          </div>
                        )}

                      </div>

                      <ChevronRight
                        className="head-arrow"
                        aria-hidden="true"
                      />

                    </article>
                  </>
                )}

                {/* ===========================================
                    TEACHERS HEADER
                =========================================== */}

                {departmentTeachers.length > 0 && (
                  <div className="teachers-heading">

                    <div>

                      <span>
                        FACULTY TEAM
                      </span>

                      <h3>
                        {department} Teachers
                      </h3>

                    </div>

                    <span className="teacher-count">
                      {departmentTeachers.length}{" "}
                      Teachers
                    </span>

                  </div>
                )}

                {/* ===========================================
                    TEACHER GRID
                =========================================== */}

                {departmentTeachers.length > 0 && (
                  <div className="faculty-grid">

                    {departmentTeachers.map(
                      (teacher) => (
                        <article
                          className="faculty-card"
                          key={teacher._id}
                        >

                          {/* TEACHER IMAGE */}

                          <div className="faculty-image-wrap">

                            <img
                              src={teacher.image}
                              alt={teacher.name}
                              className="faculty-image"
                              loading="lazy"
                              decoding="async"
                              width="500"
                              height="500"
                            />

                            <div
                              className="faculty-image-overlay"
                              aria-hidden="true"
                            />

                            {teacher.subject && (
                              <span className="faculty-subject-badge">
                                {teacher.subject}
                              </span>
                            )}

                          </div>

                          {/* TEACHER CONTENT */}

                          <div className="faculty-card-content">

                            <span className="faculty-designation">
                              {teacher.designation}
                            </span>

                            <h3>
                              {teacher.name}
                            </h3>

                            <p className="faculty-description">
                              {teacher.description}
                            </p>

                            {teacher.qualification && (
                              <div className="faculty-meta">

                                <div>
                                  <GraduationCap
                                    size={15}
                                  />

                                  <span>
                                    {teacher.qualification}
                                  </span>
                                </div>

                              </div>
                            )}

                          </div>
                        </article>
                      )
                    )}

                  </div>
                )}

              </section>
            );
          })}

        </section>

        {/* ===================================================
            EMPTY STATE
        =================================================== */}

        {faculty.length === 0 && (
          <section className="faculty-empty">

            <Building2 size={45} />

            <h2>
              Faculty information coming soon
            </h2>

            <p>
              Our faculty information will be
              available here shortly.
            </p>

          </section>
        )}

        {/* ===================================================
            CTA
        =================================================== */}

        <section className="faculty-cta">

          <div
            className="faculty-cta-icon"
            aria-hidden="true"
          >
            <GraduationCap size={25} />
          </div>

          <div>

            <span>
              STG PRE-UNIVERSITY COLLEGE
            </span>

            <h2>
              Learn from educators who care.
            </h2>

            <p>
              Explore our academic programs and
              discover the right learning path for
              your future.
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/admissions")
            }
          >
            Admission Enquiry

            <ChevronRight size={18} />
          </button>

        </section>

      </main>
    </div>
  );
};

export default Faculty;

