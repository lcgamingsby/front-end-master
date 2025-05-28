import React, { useState, useEffect } from "react";
import "../AdminQuestions.css";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaFilter } from "react-icons/fa";

function QuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedType, setSelectedType] = useState("All Types");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const storedQuestions = JSON.parse(localStorage.getItem("questions")) || [];
    setQuestions(storedQuestions);
  }, []);

  const filteredQuestions = questions.filter((q) => {
    const search = searchTerm.toLowerCase();
    const matchSearch =
      q.id.toString().includes(search) ||
      q.type.toLowerCase().includes(search) ||
      q.question.toLowerCase().includes(search) ||
      q.answers.toLowerCase().includes(search);

    const matchType =
      selectedType === "All Types" || q.type.toLowerCase() === selectedType.toLowerCase();

    return matchSearch && matchType;
  });

  const confirmDelete = (index) => {
    setDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmed = () => {
    const updated = [...questions];
    updated.splice(deleteIndex, 1);
    setQuestions(updated);
    localStorage.setItem("questions", JSON.stringify(updated));
    setShowDeleteModal(false);
  };

  const handleEdit = (index) => {
    localStorage.setItem("editQuestionIndex", index);
    navigate("/questions/edit");
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="logo-title">
          <img src="/logoukdc.png" alt="Logo" className="dashboard-logo" />
          <h1>TEC UKDC</h1>
        </div>
        <nav className="admin-nav">
          <button className="nav-btn" onClick={() => navigate("/admin")}>Home</button>
          <button className="nav-btn" onClick={() => navigate("/exams")}>Exams</button>
          <button className="nav-btn active" onClick={() => navigate("/questions")}>Questions</button>
          <button className="nav-btn" onClick={() => navigate("/students")}>Students</button>
        </nav>
        <div className="admin-info">
          <strong>ADMIN</strong>
          <span>JOHN DOE</span>
        </div>
      </header>

      <main className="admin-content">
        <h2 className="page-title">All Questions</h2>

        <div className="exam-actions">
          <div className="left-actions-column">
            <button className="add-btn" onClick={() => navigate("/questions/add")}>
              + Add a Question
            </button>

            <div className="items-per-page">
  <label>Show</label>
  <select
    className="dropdown-medium"
    value={itemsPerPage}
    onChange={(e) => setItemsPerPage(Number(e.target.value))}
  >
    <option value={10}>10</option>
    <option value={20}>20</option>
    <option value={50}>50</option>
  </select>
  <label>items</label>
</div>

          </div>

          <div className="right-actions horizontal-group">
            <div className="type-filter">
  <select
    className="dropdown-medium"
    value={selectedType}
    onChange={(e) => setSelectedType(e.target.value)}
  >
    <option value="All Types">All Types</option>
    <option value="Grammar">Grammar</option>
    <option value="Reading">Reading</option>
    <option value="Listening">Listening</option>
  </select>
</div>


            <div className="search-container">
              <input
                type="text"
                className="search-bar"
                placeholder="🔍 Search questions"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <table className="exam-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Audio</th>
              <th>Question</th>
              <th>Answer Choices</th>
              <th>Correct Answer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.slice(0, itemsPerPage).map((q, idx) => (
              <tr key={q.id}>
                <td>{q.id}</td>
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
                <td>
                  <button className="edit-btn yellow" onClick={() => handleEdit(idx)}><FaEdit /></button>
                  <button className="delete-btn red" onClick={() => confirmDelete(idx)}><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <span className="pagination-info">
            Showing 1 to {Math.min(itemsPerPage, filteredQuestions.length)} out of {filteredQuestions.length}
          </span>
          <div className="page-buttons">
            <button className="page-btn">«</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn">4</button>
            <button className="page-btn">»</button>
          </div>
        </div>
      </main>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <FaTrash className="modal-icon" />
              <h3>Confirm Deletion</h3>
            </div>
            <p>Are you sure to delete this question?</p>
            <div className="modal-buttons">
              <button className="modal-delete-btn" onClick={handleDeleteConfirmed}>
                <FaTrash /> Delete
              </button>
              <button className="modal-cancel-btn" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionsPage;
