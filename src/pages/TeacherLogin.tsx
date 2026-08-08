import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TeacherLogin.css";

export default function TeacherLogin() {
  const navigate = useNavigate();

  const [portalType, setPortalType] = useState<"management" | "staff">("management");
  const [staffRole, setStaffRole] = useState<"head" | "mentor">("head");

  const [teacherId, setTeacherId] = useState("");
  const [accessCode, setAccessCode] = useState("");

  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loginUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (portalType === "management" || (portalType === "staff" && staffRole === "head")) {
      if (!teacherId || !accessCode) {
        setError("Teacher ID and Access Code are required");
        return;
      }
    } else {
      if (!email || !mobile) {
        setError("Email and Mobile Number are required");
        return;
      }
    }

    try {
      setLoading(true);

      let requestBody;
      let apiURL;

      if (portalType === "management") {
        apiURL = "http://localhost:5000/api/teacher/login";
        requestBody = { teacherId, accessCode };
      } else {
        apiURL = "http://localhost:5000/api/staff/login";
        if (staffRole === "head") {
          requestBody = { teacherId, accessCode };
        } else {
          requestBody = { email, mobile };
        }
      }

      const response = await fetch(apiURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
     if (data.success) {
  if (portalType === "management") {
    localStorage.setItem("teacherToken", data.token);
    localStorage.setItem("teacher", JSON.stringify(data.teacher));
    localStorage.setItem("role", "teacher");

    navigate("/teacher/dashboard");
  } else {
    localStorage.setItem("staffToken", data.token);
    localStorage.setItem("staff", JSON.stringify(data.staff));

    if (staffRole === "head") {
      localStorage.setItem("role", "head");
      navigate("/head/dashboard");
    } else {
      localStorage.setItem("role", "mentor");
      navigate("/mentor/dashboard");
    }
  }
}
       else {
        setError(data.message || "Login Failed");
      }
    } catch (error) {
      console.log(error);
      setError("Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="teacher-login-page">
      <form className="teacher-login-card" onSubmit={loginUser}>
        <div style={{ textAlign: "center", marginBottom: "15px" }}>
          <h1 style={{ fontSize: "24px", color: "#1a1a1a", marginBottom: "5px" }}>👨‍💼 System Login</h1>
          <p style={{ color: "#666", fontSize: "14px" }}>Select your portal to continue</p>
        </div>

        {/* Main Portal Switcher */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "20px",
            background: "#f4f6f8",
            padding: "4px",
            borderRadius: "10px",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setPortalType("management");
              setError("");
            }}
            style={{
              flex: 1,
              backgroundColor: portalType === "management" ? "#ffffff" : "transparent",
              color: portalType === "management" ? "#0066ff" : "#555",
              border: "none",
              padding: "10px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              boxShadow: portalType === "management" ? "0 4px 12px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.3s ease",
            }}
          >
            Management
          </button>

          <button
            type="button"
            onClick={() => {
              setPortalType("staff");
              setError("");
            }}
            style={{
              flex: 1,
              backgroundColor: portalType === "staff" ? "#ffffff" : "transparent",
              color: portalType === "staff" ? "#0066ff" : "#555",
              border: "none",
              padding: "10px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              boxShadow: portalType === "staff" ? "0 4px 12px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.3s ease",
            }}
          >
            Staff Portal
          </button>
        </div>

        {/* Premium Sub-Options if Staff is Selected */}
        {portalType === "staff" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginBottom: "20px",
            }}
          >
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Select Staff Role:
            </span>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => {
                  setStaffRole("head");
                  setError("");
                }}
                style={{
                  flex: 1,
                  backgroundColor: staffRole === "head" ? "#eef2ff" : "#fafafa",
                  color: staffRole === "head" ? "#4f46e5" : "#444",
                  border: staffRole === "head" ? "2px solid #4f46e5" : "1px solid #e5e7eb",
                  padding: "10px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  textAlign: "center",
                  transition: "all 0.2s ease",
                }}
              >
                👑 Head (ID & Code)
              </button>

              <button
                type="button"
                onClick={() => {
                  setStaffRole("mentor");
                  setError("");
                }}
                style={{
                  flex: 1,
                  backgroundColor: staffRole === "mentor" ? "#eef2ff" : "#fafafa",
                  color: staffRole === "mentor" ? "#4f46e5" : "#444",
                  border: staffRole === "mentor" ? "2px solid #4f46e5" : "1px solid #e5e7eb",
                  padding: "10px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  textAlign: "center",
                  transition: "all 0.2s ease",
                }}
              >
                🎓 Mentor (Email & Mobile)
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Form Inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {(portalType === "management" || (portalType === "staff" && staffRole === "head")) ? (
            <>
              <input
                type="text"
                placeholder="Enter Teacher ID"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
              />

              <input
                type="password"
                placeholder="Enter Access Code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
              />
            </>
          ) : (
            <>
              <input
                type="email"
                placeholder="Enter Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="text"
                placeholder="Enter Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </>
          )}
        </div>

        {error && <p className="error" style={{ marginTop: "10px" }}>{error}</p>}

        <button
          disabled={loading}
          type="submit"
          style={{
            marginTop: "15px",
            width: "100%",
            padding: "12px",
            backgroundColor: "#4f46e5",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "15px",
            boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
          }}
        >
          {loading ? "Verifying..." : "Secure Login"}
        </button>

        <button
          type="button"
          className="register-link-btn"
          onClick={() => navigate("/staff/register")}
          style={{ marginTop: "10px", background: "none", border: "none", color: "#4f46e5", cursor: "pointer", width: "100%", fontWeight: "500" }}
        >
          New Staff Register Here
        </button>
      </form>
    </div>
  );
}