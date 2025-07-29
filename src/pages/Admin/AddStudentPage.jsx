import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../AdminStudents.css";
import axios from "axios";
import { config } from "../../data/config";
import Navbar from "../Components/Navbar";
import { FaChevronLeft, FaEye, FaEyeSlash } from "react-icons/fa";

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

  // Create-Update Students
  // Read-Delete on StudentsPage.jsx
  const createStudent = async (student) => {
    const token = localStorage.getItem("jwtToken");

    try {
      await axios.post(`${config.backendUrl}/api/admin/users`, student, {
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
      await axios.put(`${config.backendUrl}/api/admin/users/${nim}`, student, {
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
    <div className="absolute bg-slate-50 w-full min-h-full h-auto">
      <Navbar />

      <main className="p-8">
        <div className="flex gap-2 items-baseline">
          <button
            className="text-tec-darker hover:text-tec-light cursor-pointer"
            onClick={() => navigate("/admin/students")}
          >
            <FaChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-4xl mb-5 text-tec-darker font-bold">{isEdit ? "Edit Student" : "New Student"}</h2>
        </div>

        <form className="mb-10" onSubmit={handleSubmit}>
          <label className="text-sm text-tec-darker font-semibold select-none" htmlFor="nim">STUDENT NIM</label>
          <input
            type="number"
            name="nim"
            id="nim"
            className="w-full px-3 py-2 mb-4 border-2 border-slate-300 focus:outline-none hover:border-tec-light
              focus:border-tec-light rounded-lg appearance-none"
            value={form.nim}
            onChange={(e) => setForm({
              ...form,
              nim: e.target.value,
            })}
            disabled={isEdit}
            placeholder="Enter NIM"
            required
          />

          <label className="text-sm text-tec-darker font-semibold select-none" htmlFor="name">STUDENT NAME</label>
          <input
            type="text"
            name="name"
            id="name"
            className="w-full px-3 py-2 mb-4 border-2 border-slate-300 focus:outline-none hover:border-tec-light
              focus:border-tec-light rounded-lg"
            value={form.name}
            onChange={(e) => setForm({
              ...form,
              name: e.target.value,
            })}
            placeholder="Enter full name"
            required
          />

          <label className="text-sm text-tec-darker font-semibold select-none" htmlFor="email">EMAIL</label>
          <input
            type="email"
            name="email"
            id="email"
            className="w-full px-3 py-2 mb-4 border-2 border-slate-300 focus:outline-none hover:border-tec-light
              focus:border-tec-light rounded-lg"
            value={form.email}
            onChange={(e) => setForm({
              ...form,
              email: e.target.value,
            })}
            placeholder="Enter email"
            required
          />

          {isEdit ? null : (
            <>
              <label className="text-sm text-tec-darker font-semibold select-none" htmlFor="password">PASSWORD</label>
              <div className="flex gap-2 justify-between items-center mb-4">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  className="w-full px-3 py-2 border-2 border-slate-300 focus:outline-none hover:border-tec-light
                  focus:border-tec-light rounded-lg grow"
                  value={form.password}
                  onChange={(e) => setForm({
                    ...form,
                    password: e.target.value,
                  })}
                  placeholder="Enter password"
                  required={!isEdit}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="w-8 h-8"
                >
                  {showPassword ? <FaEyeSlash className="w-8 h-8 text-tec-darker" /> : <FaEye className="w-8 h-8 text-tec-darker" />}
                </span>
              </div>
            </>
          )}

          <button
            type="submit"
            className="bg-tec-darker hover:bg-tec-dark text-white py-2 px-5 font-bold
              rounded-lg flex items-center gap-2 mt-5"
          >
            {isEdit ? "Save Changes" : "Add Student"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default AddStudentPage;
