// AddStudentPage.js
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import "../AdminStudents.css";

function AddStudentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const editStudent = location.state?.student || null;
  const isEdit = location.state?.isEdit || false;

  const [form, setForm] = useState(
    editStudent || {
      nim: "",
      fullName: "",
      email: "",
      password: "",
    }
  );

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const stored = JSON.parse(localStorage.getItem("students") || "[]");

    if (isEdit) {
      const updatedList = stored.map((s) =>
        s.id === editStudent.id ? { ...form, id: editStudent.id } : s
      );
      localStorage.setItem("students", JSON.stringify(updatedList));
    } else {
      const newStudent = {
        id: stored.length + 1,
        ...form,
      };
      localStorage.setItem("students", JSON.stringify([...stored, newStudent]));
    }

    navigate("/students");
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="logo-title">
          <img src="/logoukdc.png" alt="Logo" className="dashboard-logo" />
          <span>
             <span className="tec">TEC</span> <span className="ukdc">UKDC</span>
          </span>
        </div>
        <nav className="admin-nav">
          <button className="nav-btn" onClick={() => navigate("/")}>Home</button>
          <button className="nav-btn" onClick={() => navigate("/exams")}>Exams</button>
          <button className="nav-btn" onClick={() => navigate("/questions")}>Questions</button>
          <button className="nav-btn active">Students</button>
        </nav>
        <div className="admin-info">
          <strong>ADMIN</strong>
          <span>JOHN DOE</span>
        </div>
      </header>

      <main className="admin-content">
        <button className="back-btn" onClick={() => navigate("/students")}>&larr;</button>
        <h2 className="page-title">{isEdit ? "Edit Student" : "New Student"}</h2>

        <form className="student-form-modern" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>STUDENT NIM</label>
            <input
              type="text"
              name="nim"
              value={form.nim}
              onChange={handleChange}
              placeholder="Enter NIM"
              required
              className="full-input"
            />
          </div>

          <div className="form-group">
            <label>STUDENT NAME</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Enter full name"
              required
              className="full-input"
            />
          </div>

          <div className="form-group">
            <label>EMAIL</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
              className="full-input"
            />
          </div>

          <div className="form-group">
            <label>PASSWORD</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
                className="full-input password-field"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>
          </div>

          <button type="submit" className="submit-btn">
            {isEdit ? "Save Changes" : "Add Student"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default AddStudentPage;
