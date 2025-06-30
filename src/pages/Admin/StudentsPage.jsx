import React, { useState, useEffect } from "react";
import "../../AdminStudents.css";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaSearch, FaFilter } from "react-icons/fa";
import { config } from "../../data/config";
import axios from "axios";

function StudentsPage() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [finishedLoading, setFinishedLoading] = useState(false);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    fetch(config.apiUrl + "/users/count")
    .then((response) => response.json())
    .then((data) => {
      setTotalStudents(data.count);
    });

    fetch(config.apiUrl + "/users/page/1")
    .then((response) => response.json())
    .then((data) => {
      setStudents(data);
      setFinishedLoading(true);
    })
  }, []);

  console.log(students, typeof students);

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  const confirmDelete = (student) => {
    setStudentToDelete(student);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    const studentNIM = studentToDelete.nim;

    try {
      await axios.delete(config.apiUrl + "/users/" + studentNIM);
      
      // reload page after deletion
      navigate("/admin/students");
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  const handleEdit = (student) => {
    navigate("/admin/students/add", { state: { student: student, isEdit: true } });
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
        <h2 className="page-title">All Students</h2>
        <div className="exam-actions">
          <button className="add-btn" onClick={() => navigate("/admin/students/add")}>
            + Add a Student
          </button>

          <div className="filter-search">
            <div className="dropdown-container">
              <label>Show</label>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>items</span>
            </div>

            <button className="filter-btn"><FaFilter /> <span>▼</span></button>

            <div className="search-container">
              <input
                type="text"
                className="search-bar"
                placeholder="🔍Search students"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <table className="exam-table">
          <thead>
            <tr>
              <th>NIM</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Password</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {finishedLoading && currentStudents.length > 0 ? (
              currentStudents.map((student) => (
                <tr key={student.nim}>
                  <td>{student.nim}</td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.password}</td>
                  <td>
                    <button className="edit-btn yellow" onClick={() => handleEdit(student)}><FaEdit /></button>
                    <button className="delete-btn red" onClick={() => confirmDelete(student)}><FaTrash /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data text-center">
                  {finishedLoading ? "No students found." : "Loading students..."}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="pagination">
          <p className="pagination-info">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredStudents.length)} out of {totalStudents}
          </p>
          <div className="page-buttons">
            <button className="page-btn" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>«</button>
            <button className="page-btn" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button className="page-btn" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>›</button>
            <button className="page-btn" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>»</button>
          </div>
        </div>

        {showConfirm && (
          <div className="confirm-overlay">
            <div className="confirm-modal">
              <div className="confirm-icon">
                <FaTrash size={20} color="#fff" />
              </div>
              <div className="confirm-content">
                <h3>Confirm Deletion</h3>
                <p>Are you sure to delete this student?</p>
              </div>
              <div className="confirm-buttons">
                <button className="confirm-delete" onClick={handleConfirmDelete}>
                  <FaTrash /> Delete
                </button>
                <button className="confirm-cancel" onClick={() => setShowConfirm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default StudentsPage;
