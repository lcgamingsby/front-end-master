import React, { useState, useEffect } from "react";
import "../../AdminQuestions.css";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaFilter, FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight } from "react-icons/fa";
import { config } from "../../data/config";
import axios from "axios";
import ModalConfirmDelete from "../Components/ModalConfirmDelete";
import Navbar from "../Components/Navbar";
import Loading from "../Components/Loading";

function QuestionsPage() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [showConfirm, setShowConfirm] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [finishedLoading, setFinishedLoading] = useState(false);

  // Read-Delete Questions
  // Create-Update on AddQuestionPage.jsx
  const getQuestions = async () => {
    try {
      const token = localStorage.getItem("jwtToken");

      const response = await axios.get(`${config.backendUrl}/api/questions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setQuestions(response.data.map((q, index) => ({
        ...q, answers: [q.choice_a, q.choice_b, q.choice_c, q.choice_d]})
      ));
      setFinishedLoading(true);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setFinishedLoading(true);
    }
  }

  const deleteQuestion = async (questionId) => {
    try {
      const token = localStorage.getItem("jwtToken");

      const response = await axios.delete(`${config.backendUrl}/api/questions/${questionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setShowConfirm(false);

        setQuestions((prevQuestions) =>
          prevQuestions.filter((question) => question.question_id !== questionId)
        );
      }
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  }

  useEffect(() => {
    // GET questions data
    getQuestions();
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

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentQuestions = filteredQuestions.slice(startIndex, startIndex + itemsPerPage);

  const confirmDelete = (index) => {
    setToDelete(index);
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    const questionID = toDelete.question_id;

    deleteQuestion(questionID);
  };

  const handleEdit = (question) => {
    // console.log(question);

    navigate("/admin/questions/edit", { state: { question: question, isEdit: true } });
  };

  return (
    <div className="admin-dashboard">
      <Navbar />

      <main className="admin-content">
        <h2 className="page-title">All Questions</h2>

        <div className="exam-actions">
          <div className="left-actions-column">
            <button className="add-btn" onClick={() => navigate("/admin/questions/add")}>
              + Add a Question
            </button>

            <div className="items-per-page">
              <label htmlFor="items_per_page">Show {" "}</label>
              <select
                className="dropdown-medium"
                id="items_per_page"
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
              <label htmlFor="items_per_page">{" "} items</label>
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
              <th>Question</th>
              <th>Answer Choices</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {finishedLoading && currentQuestions.length > 0 ? (
              currentQuestions.map((q, idx) => {
              let answerText = q.answers.join(", ");

              return (
                <tr key={q.question_id}>
                  <td>{q.question_id}</td>
                  <td>{q.question_type[0].toUpperCase() + q.question_type.slice(1)}</td>
                  <td className="truncate" title={q.question_text}>
                    {q.audio_path ? (
                      <audio controls src={`${config.backendUrl}/audio/${q.audio_path}`} />
                    ) : null}
                    {q.question_text.length > 80 ? q.question_text.slice(0, 80).trim() + "..." : q.question_text}
                  </td>
                  <td className="truncate" title={answerText}>
                    {answerText.length > 60 ? answerText.slice(0, 60).trim() + "..." : answerText}
                  </td>
                  <td>
                    <button className="edit-btn yellow" onClick={() => handleEdit(q)}><FaEdit /></button>
                    <button className="delete-btn red" onClick={() => confirmDelete(q)}><FaTrash /></button>
                  </td>
                </tr>
            )})) : (
              <tr>
                <td colSpan="5" className="no-data text-center">
                  {finishedLoading ? "No questions found." : (
                    <Loading text={"Loading questions..."} useSmall={true} />
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="pagination">
          <span className="pagination-info">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredQuestions.length)} out of {" "}
              {searchTerm === "" && selectedType === "All Types"
                ? questions.length
                : `${filteredQuestions.length} (filtered out of ${questions.length} total entries)`}
          </span>
          <div className="page-buttons">
            <button className="page-btn" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
              <FaAngleDoubleLeft />
            </button>
            <button className="page-btn" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>
              <FaAngleLeft />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button className="page-btn" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>
              <FaAngleRight />
            </button>
            <button className="page-btn" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
              <FaAngleDoubleRight />
            </button>
          </div>
        </div>
      </main>

      {showConfirm && (
        <ModalConfirmDelete
          isOpen={showConfirm}
          openModal={setShowConfirm}
          onTrue={handleConfirmDelete}
          title="Confirm Deletion"
          message="Are you sure you want to delete this question? This action cannot be undone."
        />
      )}
    </div>
  );
}

export default QuestionsPage;
