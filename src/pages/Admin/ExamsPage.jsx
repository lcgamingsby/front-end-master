import React, { useState, useEffect } from "react";
import "../../AdminExams.css";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaFilter } from "react-icons/fa";

function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    date: "",
    time: "",
    students: "",
  });
  const [editIndex, setEditIndex] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const userData = JSON.parse(localStorage.getItem("loggedInUser"));

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const newExam = {
      id: Number(formData.id),
      title: formData.title,
      date: formData.date,
      time: formData.time,
      students: Number(formData.students),
    };

    if (editIndex !== null) {
      const updatedExams = [...exams];
      updatedExams[editIndex] = newExam;
      setExams(updatedExams);
    } else {
      setExams([...exams, newExam]);
    }

    setFormData({ id: "", title: "", date: "", time: "", students: "" });
    setShowForm(false);
    setEditIndex(null);
  };

  const handleEdit = (index) => {
    const exam = exams[index];
    setFormData({ ...exam });
    setEditIndex(index);
    setShowForm(true);
  };

  const handleDelete = (index) => {
    const confirm = window.confirm("Yakin ingin menghapus ujian ini?");
    if (confirm) {
      const updatedExams = exams.filter((_, i) => i !== index);
      setExams(updatedExams);
    }
  };

  const filteredExams = exams.filter((exam) => {
    const search = searchTerm.toLowerCase();
    const schedule = `${exam.date} ${exam.time}`.toLowerCase();
    return (
      exam.title.toLowerCase().includes(search) ||
      schedule.includes(search) ||
      exam.id.toString().includes(search)
    );
  });

  const displayedExams = filteredExams.slice(0, itemsPerPage);

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
          <button className="nav-btn" onClick={() => navigate("/admin/")}>Home</button>
          <button className="nav-btn active">Exams</button>
          <button className="nav-btn" onClick={() => navigate("/admin/questions")}>Questions</button>
          <button className="nav-btn" onClick={() => navigate("/admin/students")}>Students</button>
        </nav>
        <div className="admin-info">
          <strong>ADMIN</strong><br/>
          <span>{userData.name.length > 50 ? userData.name.slice(0, 50 + 1).trim() + "..." : userData.name}</span>
        </div>
      </header>

      <main className="admin-content">
        <h2 className="page-title">All Exams</h2>

        <div className="exam-actions">
          <button className="add-btn" onClick={() => navigate("/admin/exams/new")}>
            + Add an Exam
          </button>

          <div className="actions-right">
            <label className="show-label">
              Show
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              items
            </label>
            <button className="filter-btn"><FaFilter /></button>
            <input
              type="text"
              className="search-bar"
              placeholder="🔍Search exams"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {showForm && (
          <form className="exam-form" onSubmit={handleSubmit}>
            <input
              type="number"
              placeholder="ID"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              required
              disabled={editIndex !== null}
            />
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Date (e.g. 01 Jan 2024)"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Students"
              value={formData.students}
              onChange={(e) => setFormData({ ...formData, students: e.target.value })}
              required
            />
            <button type="submit" className="add-btn">
              {editIndex !== null ? "Update" : "Simpan"}
            </button>
          </form>
        )}

        <table className="exam-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Schedule</th>
              <th>Students</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedExams.map((exam, index) => (
              <tr key={exam.id}>
                <td>{exam.id}</td>
                <td>{exam.title}</td>
                <td>{exam.date} ({exam.time})</td>
                <td>{exam.students}</td>
                <td>
                  <button className="edit-btn yellow" onClick={() => handleEdit(index)}><FaEdit /></button>
                  <button className="delete-btn red" onClick={() => handleDelete(index)}><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="table-footer">
          <p>
            Showing 1 to {Math.min(itemsPerPage, filteredExams.length)} out of {filteredExams.length}
          </p>
        </div>

        <div className="pagination">
          <button className="page-btn">«</button>
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">3</button>
          <button className="page-btn">»</button>
        </div>
      </main>
    </div>
  );
}

export default ExamsPage;
