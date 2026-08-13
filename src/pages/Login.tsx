import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  loginStudent
} from "../services/api";

import "./Auth.css";

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e: any) => {

    e.preventDefault();

    try {

      const data = await loginStudent({
        email,
        password
      });

      console.log(
        "LOGIN RESPONSE:",
        data
      );

      // =====================================
      // LOGIN SUCCESS
      // =====================================

      if (data.success && data.token) {

        // =====================================
        // CLEAR OLD MANAGEMENT / STAFF SESSION
        // =====================================

        localStorage.removeItem("teacher");
        localStorage.removeItem("teacherToken");

        localStorage.removeItem("staff");
        localStorage.removeItem("staffToken");

        // =====================================
        // SAVE STUDENT TOKEN
        // =====================================

        localStorage.setItem(
          "token",
          data.token
        );

        localStorage.setItem(
          "studentToken",
          data.token
        );

        // =====================================
        // ⭐ SAVE STUDENT ROLE
        // =====================================

        localStorage.setItem(
          "role",
          "student"
        );

        // =====================================
        // SAVE STUDENT DATA
        // =====================================

        localStorage.setItem(
          "student",
          JSON.stringify(
            data.student
          )
        );

        // =====================================
        // SAVE STUDENT ID
        // =====================================

        localStorage.setItem(
          "studentId",
          data.student.studentId
        );

        // =====================================
        // GO TO STUDENT DASHBOARD
        // =====================================

        navigate("/dashboard");

      } else {

        alert(
          data.message ||
          "Login Failed"
        );

      }

    } catch (error) {

      console.log(
        "Login Error:",
        error
      );

      alert(
        "Login Error"
      );

    }

  };

  return (

    <div className="auth-page">

      <form
        className="auth-card"
        onSubmit={submit}
      >

        <h1>
          Student Login
        </h1>

        <input
          type="email"
          placeholder="Gmail"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          required
        />

        <button type="submit">
          Login
        </button>

        <p>

          New Student?

          {" "}

          <span
            onClick={() =>
              navigate(
                "/student/register"
              )
            }
            style={{
              cursor: "pointer"
            }}
          >
            Register
          </span>

        </p>

      </form>

    </div>

  );

}