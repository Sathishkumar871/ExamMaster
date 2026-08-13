import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StaffLogin.css";

export default function StaffLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loginStaff = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (!email || !mobile) {
      setError("Email and Mobile Number are required");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "https://exammaster-backend-up1y.onrender.com/api/staff/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            mobile,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Staff Login Failed");
        return;
      }

      localStorage.setItem("staffToken", data.token);
      localStorage.setItem("staff", JSON.stringify(data.staff));
      localStorage.setItem("role", "staff");

      navigate("/mentor/dashboard");
    } catch (error) {
      console.error(error);
      setError("Server Error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="staff-login-page">
      <form
        className="staff-login-card"
        onSubmit={loginStaff}
      >
        {/* HEADER */}
        <div className="staff-login-heading">
          <div className="staff-logo">
            👥
          </div>

          <h1>Staff Login</h1>

          <p>
            Secure access for academic staff
          </p>
        </div>

        {/* BADGE */}
        <div className="staff-badge">
          STAFF PORTAL
        </div>

        {/* INPUTS */}
        <div className="staff-inputs">
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
        </div>

        {/* ERROR */}
        {error && (
          <p className="staff-error">
            {error}
          </p>
        )}

        {/* LOGIN */}
        <button
          type="submit"
          className="staff-login-btn"
          disabled={loading}
        >
          {loading
            ? "Verifying..."
            : "Secure Staff Login"}
        </button>

        {/* REGISTER */}
        <button
          type="button"
          className="staff-register-btn"
          onClick={() => navigate("/staff/register")}
        >
          New Staff? Register Here
        </button>

        {/* BACK */}
        <button
          type="button"
          className="staff-back-btn"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>
      </form>
    </div>
  );
}