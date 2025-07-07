import React, { useState, useEffect } from "react";
import "../../AdminQuestions.css";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaFilter } from "react-icons/fa";
import { config } from "../../data/config";

function QuestionsPage() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedType, setSelectedType] = useState("All Types");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [finishedLoading, setFinishedLoading] = useState(false);

  const userData = JSON.parse(localStorage.getItem("loggedInUser"));

  useEffect(() => {
    // GET questions data
    fetch(config.apiUrl + "/questions")
    .then((response) => response.json())
    .then((data) => {
      setQuestions(data.map((q, index) => ({
        ...q, answers: [q.choice_a, q.choice_b, q.choice_c, q.choice_d]})
      ));
      setFinishedLoading(true);
    })
  }, []);

  const filteredQuestions = questions.filter((q) => {
    const search = searchTerm.toLowerCase();
    const matchSearch =
      q.question_id.toString().includes(search) ||
      q.question_type.toLowerCase().includes(search) ||
      q.question_text.toLowerCase().includes(search) ||
      q.choice_a.includes(search) ||
      q.choice_b.includes(search) ||
      q.choice_c.includes(search) ||
      q.choice_d.includes(search);

    const matchType =
      selectedType === "All Types" || q.question_type.toLowerCase() === selectedType.toLowerCase();

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

  const handleEdit = (question) => {
    console.log(question);

    navigate("/admin/questions/edit", { state: { question: question, isEdit: true } });
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
          <button className="nav-btn active" onClick={() => navigate("/admin/questions")}>Questions</button>
          <button className="nav-btn" onClick={() => navigate("/admin/students")}>Students</button>
        </nav>
        <div className="admin-info">
          <strong>ADMIN</strong><br/>
          <span>{userData.name.length > 50 ? userData.name.slice(0, 50 + 1).trim() + "..." : userData.name}</span>
        </div>
      </header>

      <main className="admin-content">
        <h2 className="page-title">All Questions</h2>

        <div className="exam-actions">
          <div className="left-actions-column">
            <button className="add-btn" onClick={() => navigate("/admin/questions/add")}>
              + Add a Question
            </button>

            <div className="items-per-page">
              <label>Show</label>
              <select
                className="dropdown-medium"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  const newTotalPages = Math.ceil(filteredStudents.length / Number(e.target.value));

                  if (currentPage > newTotalPages) {
                    setCurrentPage(newTotalPages);
                  }
                }}
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
            {filteredQuestions.slice(0, itemsPerPage).map((q, idx) => {
              let answerText = q.answers.join(", ");

              return (
                <tr key={q.question_id}>
                  <td>{q.question_id}</td>
                  <td>{q.question_type}</td>
                  <td>
                    {q.audio_path ? (
                      <audio controls src={`${config.audioUrl}/${q.audio_path}`} />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="truncate" title={q.question_text}>{q.question_text.length > 100 ? q.question_text.slice(0, 100).trim() + "..." : q.question_text}</td>
                  <td className="truncate" title={answerText}>{answerText.length > 100 ? answerText.slice(0, 100).trim() + "..." : answerText}</td>
                  <td>{q.answer}</td>
                  <td>
                    <button className="edit-btn yellow" onClick={() => handleEdit(q)}><FaEdit /></button>
                    <button className="delete-btn red" onClick={() => confirmDelete(q)}><FaTrash /></button>
                  </td>
                </tr>
            )})}
          </tbody>
        </table>

        <div className="pagination">
          <span className="pagination-info">
            Showing 1 to {Math.min(itemsPerPage, filteredQuestions.length)} out of {questions.length}
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
