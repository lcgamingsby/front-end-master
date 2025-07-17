// AddStudentPage.js
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../AdminStudents.css";
import axios from "axios";
import { config } from "../../data/config";
import Navbar from "../Components/Navbar";
import { FaChevronLeft } from "react-icons/fa";

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

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Create-Update Students
  // Read-Delete on StudentsPage.jsx
  const createStudent = async (student) => {
    const token = localStorage.getItem("jwtToken");

    try {
      await axios.post(`${config.backendUrl}/api/users/`, student, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // navigate to students page after adding
      navigate("/admin/students");
    } catch (e) {
      console.error("Failed to add student:", e);
    }
  }

  const updateStudent = async (nim, student) => {
    const token = localStorage.getItem("jwtToken");

    try {
      await axios.put(`${config.backendUrl}/api/users/${nim}`, student, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // navigate to students page after updating
      navigate("/admin/students");
    } catch (e) {
      console.error("Failed to update student:", e);
    }
  }



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEdit) {
      const updatedStudent = {
        name: form.name,
        email: form.email,
      }

      updateStudent(form.nim, updatedStudent);
    } else {
      const newStudent = {
        nim: form.nim,
        name: form.name,
        email: form.email,
        password: form.password,
      }
      
      createStudent(newStudent);
    }
  };

  return (
    <div className="admin-dashboard">
      <Navbar />

      <main className="admin-content">
        <div className="flex gap-2">
          <button className="back-btn" onClick={() => navigate("/admin/students")}>
            <FaChevronLeft />
          </button>
          <h2 className="page-title">{isEdit ? "Edit Student" : "New Student"}</h2>
        </div>

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
