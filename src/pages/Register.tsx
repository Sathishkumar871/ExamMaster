import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerStudent } from "../services/api";
import "./Auth.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    classId: "",
    className: "",
    academicYear: "", 
    section: ""       
  });

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const submit = async (e: any) => {
    e.preventDefault();

    try {
      const data = await registerStudent(form);
      alert(data.message);

      if (data.success) {
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
      alert("Register Error");
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Create Account</h1>

        <input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Gmail"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        {/* Class Selection */}
        <select
          name="classId"
          value={form.classId}
          onChange={(e) => {
            const value = e.target.value;
            const text = e.target.options[e.target.selectedIndex].text;
            setForm({
              ...form,
              classId: value,
              className: text
            });
          }}
          required
        >
          <option value="">Select Class</option>
          <option value="INTER-FIRST-YEAR">Inter First Year</option>
          <option value="INTER-SECOND-YEAR">Inter Second Year</option>
        </select>

        {/* Academic Year Selection */}
        <select
          name="academicYear"
          value={form.academicYear}
          onChange={handleChange}
          required
        >
          <option value="">Select Academic Year</option>
          <option value="1st PUC">1st PUC</option>
          <option value="2nd PUC">2nd PUC</option>
        </select>

        {/* Section Input */}
        <input
          name="section"
          placeholder="Section (e.g., A, B)"
          value={form.section}
          onChange={handleChange}
          required
        />

        <button type="submit">Register</button>
      </form>
    </div>
  );
}