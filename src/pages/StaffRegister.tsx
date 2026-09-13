import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  Users,
  Lock,
  
} from "lucide-react";
import "./StaffRegister.css";

export default function StaffRegister() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [department, setDepartment] = useState("");
  const [deptSearch, setDeptSearch] = useState("");
  const [showDeptList, setShowDeptList] = useState(false);

  const [role, setRole] = useState("mentor");
  const [roleSearch, setRoleSearch] = useState("Mentor");
  const [showRoleList, setShowRoleList] = useState(false);

  const [classId, setClassId] = useState("");
  const [section, setSection] = useState("");

  const [agree, setAgree] = useState(true);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const deptRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  const departmentsList = [
    "Physics",
    "Chemistry",
    "Botany",
    "Zoology",
    "Mathematics",
  ];

  const rolesList = ["Head", "Mentor", "PET", "Parent"];

  const getSections = () => {
    if (classId === "INTER-FIRST-YEAR") {
      return [
        "J1",
        "J2",
        "J3",
        "J4",
        "J5",
        "J6",
        "J7",
        "J8",
        "J9",
        "J10",
      ];
    }

    if (classId === "INTER-SECOND-YEAR") {
      return [
        "S1",
        "S2",
        "S3",
        "S4",
        "S5",
        "S6",
        "S7",
        "S8",
        "S9",
        "S10",
      ];
    }

    return [];
  };

  const filteredDepartments = departmentsList.filter((dept) =>
    dept.toLowerCase().includes(deptSearch.toLowerCase())
  );

  const filteredRoles = rolesList.filter((r) =>
    r.toLowerCase().includes(roleSearch.toLowerCase())
  );

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (
        deptRef.current &&
        !deptRef.current.contains(event.target as Node)
      ) {
        setShowDeptList(false);
      }

      if (
        roleRef.current &&
        !roleRef.current.contains(event.target as Node)
      ) {
        setShowRoleList(false);
      }
    };

    document.addEventListener("mousedown", close);

    return () => {
      document.removeEventListener("mousedown", close);
    };
  }, []);

  const registerStaff = async (e: React.FormEvent) => {
    e.preventDefault();

    const isMentor = role.toLowerCase() === "mentor";

    if (
      !name.trim() ||
      !email.trim() ||
      !mobile.trim() ||
      !password.trim() ||
      !role ||
      !agree ||
      (isMentor && (!department || !classId || !section))
    ) {
      setMessage(
        !agree
          ? "Please accept the registration terms."
          : "Please complete all required fields."
      );
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        "https://exammaster-backend-up1y.onrender.com/api/staff/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            mobile,
            email,
            password,
            department: isMentor ? department : "",
            role: role.toLowerCase(),
            classId: isMentor ? classId : "",
            section: isMentor ? section : "",
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("Registration submitted successfully.");

        setTimeout(() => {
          navigate("/teacher/login");
        }, 2000);
      } else {
        setMessage(data.message || "Registration failed.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const selectRole = (selectedRole: string) => {
    const normalizedRole = selectedRole.toLowerCase();

    setRole(normalizedRole);
    setRoleSearch(selectedRole);
    setShowRoleList(false);

    if (normalizedRole !== "mentor") {
      setDepartment("");
      setDeptSearch("");
      setClassId("");
      setSection("");
    }
  };

  return (
    <div className="staff-register-page">
      {/* Background Decorations */}
      <div className="page-orb page-orb-one" />
      <div className="page-orb page-orb-two" />
      <div className="page-grid" />

      <div className="staff-register-shell">
        {/* =========================
            LEFT / FORM SIDE
        ========================== */}
        <section className="register-form-panel">
          <div className="mobile-top-brand">
            <div className="brand-mark">
              <GraduationCap size={22} strokeWidth={2.3} />
            </div>

            <div>
              <strong>ExamMaster</strong>
              <span>STG PU COLLEGE</span>
            </div>
          </div>

          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/teacher/login")}
          >
            <ArrowLeft size={16} />
            Back to Login
          </button>

          <div className="register-heading">
            <div className="heading-badge">
             
              FACULTY ACCESS
            </div>

            <h1>
              Staff
              <span> Registration</span>
            </h1>

            <p>
              Create your faculty profile and request secure access
              to the ExamMaster platform.
            </p>
          </div>

          <form
            className="staff-register-form"
            onSubmit={registerStaff}
          >
            {/* Full Name */}
            <div className="form-field full-width">
              <label>Full Name</label>

              <div className="input-shell">
                <User size={18} />
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-field">
              <label>Email Address</label>

              <div className="input-shell">
                <Mail size={18} />

                <input
                  type="email"
                  placeholder="Enter Gmail address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Mobile */}
            <div className="form-field">
              <label>Mobile Number</label>

              <div className="input-shell">
                <Phone size={18} />

                <input
                  type="tel"
                  placeholder="Enter mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-field full-width">
              <label>Password</label>

              <div className="input-shell password-shell">
                <Lock size={18} />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Role */}
            <div className="form-field full-width">
              <label>Staff Role</label>

              <div
                className="custom-select-wrapper"
                ref={roleRef}
              >
                <div className="input-shell">
                  <BriefcaseBusiness size={18} />

                  <input
                    type="text"
                    value={roleSearch}
                    placeholder="Select staff role"
                    onFocus={() => setShowRoleList(true)}
                    onChange={(e) => {
                      setRoleSearch(e.target.value);
                      setRole(e.target.value.toLowerCase());
                      setShowRoleList(true);
                    }}
                  />

                  <ChevronDown
                    size={17}
                    className={`select-chevron ${
                      showRoleList ? "rotate" : ""
                    }`}
                  />
                </div>

                {showRoleList && (
                  <div className="premium-dropdown">
                    {filteredRoles.length > 0 ? (
                      filteredRoles.map((r) => (
                        <button
                          type="button"
                          key={r}
                          className={`dropdown-option ${
                            role.toLowerCase() ===
                            r.toLowerCase()
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => selectRole(r)}
                        >
                          <span className="dropdown-option-icon">
                            <ShieldCheck size={15} />
                          </span>

                          <span>{r}</span>

                          {role.toLowerCase() ===
                            r.toLowerCase() && (
                            <Check
                              size={16}
                              className="option-check"
                            />
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="dropdown-empty">
                        No matching roles
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mentor fields */}
            {role === "mentor" && (
              <>
                {/* Class */}
                <div className="form-field">
                  <label>Class</label>

                  <div className="native-select-shell">
                    <GraduationCap size={18} />

                    <select
                      value={classId}
                      onChange={(e) => {
                        setClassId(e.target.value);
                        setSection("");
                      }}
                    >
                      <option value="">Select class</option>
                      <option value="INTER-FIRST-YEAR">
                        1st PUC
                      </option>
                      <option value="INTER-SECOND-YEAR">
                        2nd PUC
                      </option>
                    </select>

                    <ChevronDown size={17} />
                  </div>
                </div>

                {/* Department */}
                <div className="form-field">
                  <label>Department</label>

                  <div
                    className="custom-select-wrapper"
                    ref={deptRef}
                  >
                    <div className="input-shell">
                      <Users size={18} />

                      <input
                        type="text"
                        placeholder="Select department"
                        value={deptSearch}
                        onFocus={() => setShowDeptList(true)}
                        onChange={(e) => {
                          setDeptSearch(e.target.value);
                          setDepartment(e.target.value);
                          setShowDeptList(true);
                        }}
                      />

                      <ChevronDown
                        size={17}
                        className={`select-chevron ${
                          showDeptList ? "rotate" : ""
                        }`}
                      />
                    </div>

                    {showDeptList && (
                      <div className="premium-dropdown">
                        {filteredDepartments.length > 0 ? (
                          filteredDepartments.map((d) => (
                            <button
                              type="button"
                              key={d}
                              className={`dropdown-option ${
                                department === d
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() => {
                                setDepartment(d);
                                setDeptSearch(d);
                                setShowDeptList(false);
                              }}
                            >
                              <span className="dropdown-option-icon">
                                <GraduationCap size={15} />
                              </span>

                              <span>{d}</span>

                              {department === d && (
                                <Check
                                  size={16}
                                  className="option-check"
                                />
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="dropdown-empty">
                            No departments found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Section */}
                <div className="form-field full-width">
                  <label>Section</label>

                  <div className="native-select-shell">
                    <MapPin size={18} />

                    <select
                      value={section}
                      onChange={(e) =>
                        setSection(e.target.value)
                      }
                    >
                      <option value="">
                        Choose your section
                      </option>

                      {getSections().map((s) => (
                        <option key={s} value={s}>
                          Section {s}
                        </option>
                      ))}
                    </select>

                    <ChevronDown size={17} />
                  </div>
                </div>
              </>
            )}

            {/* Terms */}
            <label className="terms-row">
              <span
                className={`custom-checkbox ${
                  agree ? "checked" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) =>
                    setAgree(e.target.checked)
                  }
                />

                {agree && <Check size={13} strokeWidth={3} />}
              </span>

              <span>
                I agree to the{" "}
                <button type="button">Terms of Service</button>{" "}
                and{" "}
                <button type="button">Privacy Policy</button>.
              </span>
            </label>

            {/* Message */}
            {message && (
              <div
                className={`register-message ${
                  message.toLowerCase().includes("success")
                    ? "success"
                    : "error"
                }`}
              >
                <span className="message-dot" />
                {message}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >
              <span>
                {loading
                  ? "Submitting Registration..."
                  : "Submit Registration"}
              </span>

              {!loading && <ShieldCheck size={18} />}
            </button>

            <div className="login-note">
              Already have faculty access?
              <button
                type="button"
                onClick={() => navigate("/teacher/login")}
              >
                Sign in
              </button>
            </div>
          </form>
        </section>

        {/* =========================
            RIGHT / HERO SIDE
        ========================== */}
        <section className="register-hero-panel">
          <div className="hero-geometric geometric-one" />
          <div className="hero-geometric geometric-two" />
          <div className="hero-geometric geometric-three" />
          <div className="hero-geometric geometric-four" />

          <div className="hero-noise" />

          <div className="hero-content">
            <div className="hero-brand">
              <div className="hero-logo-mark">
                <GraduationCap size={28} strokeWidth={2.2} />
              </div>

              <div className="hero-brand-text">
                <strong>ExamMaster</strong>
                <span>STG PU COLLEGE</span>
              </div>
            </div>

            <div className="hero-copy">
              <div className="hero-small-badge">
                <span />
                SMART EXAMINATION PLATFORM
              </div>

              <h2>
                Welcome to
                <strong> ExamMaster</strong>
              </h2>

              <p>
                Empowering faculty with a secure and intelligent
                examination ecosystem built for modern
                education.
              </p>
            </div>

            <div className="hero-illustration">
              <div className="illustration-glow" />

              <div className="illustration-ring ring-one" />
              <div className="illustration-ring ring-two" />

              <div className="hero-shield">
                <GraduationCap
                  size={74}
                  strokeWidth={1.45}
                />
              </div>

              <div className="floating-card card-one">
                <ShieldCheck size={17} />
                <div>
                  <strong>Secure Access</strong>
                  <span>Faculty verified</span>
                </div>
              </div>

              <div className="floating-card card-two">
                <CalendarDays size={17} />
                <div>
                  <strong>Smart Exams</strong>
                  <span>Manage assessments</span>
                </div>
              </div>
            </div>

            <div className="hero-bottom">
              <div className="hero-stat">
                <strong>01</strong>
                <span>Faculty Registration</span>
              </div>

              <div className="hero-line" />

              <div className="hero-stat">
                <strong>02</strong>
                <span>Head Approval</span>
              </div>

              <div className="hero-line" />

              <div className="hero-stat">
                <strong>03</strong>
                <span>Secure Access</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}