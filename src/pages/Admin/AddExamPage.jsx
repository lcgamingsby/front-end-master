// src/pages/AddExamPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../AdminExams.css";
import { FaFilter } from "react-icons/fa";
import Navbar from "../Components/Navbar";

function AddExamPage() {
  const navigate = useNavigate();

  const [selectedType, setSelectedType] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const [questions, setQuestions] = useState([]);
  const [students, setStudents] = useState([]);

  // Ambil data pertanyaan & students dari localStorage
  useEffect(() => {
    const storedQuestions = JSON.parse(localStorage.getItem("questions")) || [];
    setQuestions(storedQuestions);

    const savedStudents = JSON.parse(localStorage.getItem("students")) || [];
    setStudents(savedStudents);
  }, []);

  // Filter pertanyaan berdasarkan jenis soal dan kata kunci
  const filteredQuestions = questions.filter((q) => {
    const matchType = selectedType === "All" || q.type === selectedType;
    const matchSearch =
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answers.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="admin-dashboard">
      <Navbar />

      <main className="admin-content">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate("/admin/exams")}>←</button>
          <h2 className="page-title">New Exam</h2>
        </div>

        {/* FORM EXAM INFO */}
        <form className="exam-form">
          <label className="form-label">Exam Title</label>
          <input type="text" placeholder="Title of the exam" className="input-full" />

          <div className="form-row" style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <div style={{ flex: 1 }}>
              <label className="form-label">Start Schedule</label>
              <input type="datetime-local" className="input-full" />
            </div>
            <div style={{ flex: 1 }}>
              <label className="form-label">End Schedule</label>
              <input type="datetime-local" className="input-full" />
            </div>
          </div>
        </form>

        {/* ADD QUESTIONS */}
        <h3>ADD QUESTIONS</h3>
        <div className="table-controls">
          <label>Show
            <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select> items
          </label>

          <label>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              <option value="All">All Types</option>
              <option value="Grammar">Grammar</option>
              <option value="Reading">Reading</option>
              <option value="Listening">Listening</option>
            </select>
          </label>

          <input
            type="text"
            placeholder="🔍 Search questions"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <table className="exam-table">
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>Type</th>
              <th>Audio</th>
              <th>Question</th>
              <th>Answer Choices</th>
              <th>Correct Answer</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.slice(0, itemsPerPage).map((q) => (
              <tr key={q.id}>
                <td><input type="checkbox" /></td>
                <td>{q.type}</td>
                <td>
                  {q.audioURL ? (
                    <audio controls src={q.audioURL} />
                  ) : (
                    "-"
                  )}
                </td>
                <td className="truncate">{q.question}</td>
                <td className="truncate">{q.answers}</td>
                <td>{q.correctAnswer}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>Questions on this exam: {filteredQuestions.length}</p>

        {/* ADD STUDENTS */}
        <h3>ADD STUDENTS</h3>
        <div className="table-controls">
          <label>Show
            <select>
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select> items
          </label>
          <button className="filter-btn"><FaFilter /></button>
          <input type="text" placeholder="🔍 Search students" />
        </div>

        <table className="exam-table">
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>Full Name</th>
              <th>NIM</th>
              <th>Email</th>
              <th>Password</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td><input type="checkbox" /></td>
                <td>{s.fullName}</td>
                <td>{s.nim}</td>
                <td>{s.email}</td>
                <td>{s.password}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>Students participating this exam: {students.length}</p>

        <button className="add-btn">Add Exam</button>
      </main>
    </div>
  );
}

export default AddExamPage;
