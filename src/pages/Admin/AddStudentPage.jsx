// AddStudentPage.js
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../AdminStudents.css";
import axios from "axios";
import { config } from "../../data/config";

function AddStudentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const editStudent = location.state?.student || null;
  const isEdit = location.state?.isEdit || false;

  const [form, setForm] = useState(
    editStudent || {
      nim: "",
      name: "",
      email: "",
      password: "",
    }
  );

  console.log(editStudent, isEdit);

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEdit) {
      const updatedStudent = {
        name: form.name,
        email: form.email,
      }

      try {
        await axios.put(config.apiUrl + "/users/" + form.nim, updatedStudent);
        navigate("/admin/students");
      } catch (e) {
        console.error("Failed to update student:", e);
      }
    } else {
      const newStudent = {
        nim: form.nim,
        name: form.name,
        email: form.email,
        password: form.password,
      }

      try {
        await axios.post(config.apiUrl + "/users", newStudent);
        navigate("/admin/students");
      } catch (e) {
        console.error("Failed to add student:", e);
      }
    }
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
          <button className="nav-btn" onClick={() => navigate("/admin")}>Home</button>
          <button className="nav-btn" onClick={() => navigate("/admin/exams")}>Exams</button>
          <button className="nav-btn" onClick={() => navigate("/admin/questions")}>Questions</button>
          <button className="nav-btn active">Students</button>
        </nav>
        <div className="admin-info">
          <strong>ADMIN</strong>
          <span>JOHN DOE</span>
        </div>
      </header>

      <main className="admin-content">
        <button className="back-btn" onClick={() => navigate("/admin/students")}>&larr;</button>
        <h2 className="page-title">{isEdit ? "Edit Student" : "New Student"}</h2>

        <form className="student-form-modern" onSubmit={handleSubmit}>
          <div className="form-group w-4/5">
            <label>STUDENT NIM</label>
            <input
              type="text"
              name="nim"
              value={form.nim}
              onChange={handleChange}
              disabled={isEdit}
              placeholder="Enter NIM"
              required
              className="full-input"
            />
          </div>

          <div className="form-group w-4/5">
            <label>STUDENT NAME</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter full name"
              required
              className="full-input"
            />
          </div>

          <div className="form-group w-4/5">
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

          <div className="form-group ">
            <label>PASSWORD</label>
            <div className="password-wrapper flex gap-2 justify-between items-center w-4/5">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                required={!isEdit}
                className="full-input grow w-full"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle w-8 h-8"
              >
                {showPassword ? <EyeOff size={32} /> : <Eye size={32} />}
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
