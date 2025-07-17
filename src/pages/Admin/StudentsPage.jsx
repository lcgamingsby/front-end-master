import React, { useState, useEffect } from "react";
import "../../AdminStudents.css";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaSearch, FaFilter, FaAngleRight, FaAngleDoubleRight, FaAngleDoubleLeft, FaAngleLeft } from "react-icons/fa";
import { config } from "../../data/config";
import axios from "axios";
import ModalConfirmDelete from "../Components/ModalConfirmDelete";
import Navbar from "../Components/Navbar";
import Loading from "../Components/Loading";

function StudentsPage() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [finishedLoading, setFinishedLoading] = useState(false);

  // Read-Delete Students
  // Create-Update on AddStudentPage.jsx
  const getStudents = async () => {
    try {
      const token = localStorage.getItem("jwtToken");

      const response = await axios.get(config.backendUrl + "/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStudents(response.data);
      setFinishedLoading(true);
    } catch (error) {
      console.error("Error fetching students:", error);
      setFinishedLoading(true);
    }
  }

  const deleteStudent = async (nim) => {
    try {
      const token = localStorage.getItem("jwtToken");

      const response = await axios.delete(config.backendUrl + "/api/users/" + nim, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.status === 200) {
        // seamless update
        // console.log("Successfully deleted student:", nim); // debug
        setShowConfirm(false);

        setStudents((prevStudents) =>
          prevStudents.filter((student) => student.nim !== nim)
        );
      }
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  }

  useEffect(() => {
    // GET students data
    getStudents();
  }, []);

  // console.log(students, typeof students);

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  const confirmDelete = (student) => {
    setToDelete(student);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    const studentNIM = toDelete.nim;

    deleteStudent(studentNIM);
  };

  const handleEdit = (student) => {
    navigate("/admin/students/edit", { state: { student: student, isEdit: true } });
  };

  return (
    <div className="admin-dashboard">
      <Navbar />

      <main className="admin-content">
        <h2 className="page-title">All Students</h2>
        <div className="exam-actions">
          <button className="add-btn" onClick={() => navigate("/admin/students/add")}>
            + Add a Student
          </button>

          <div className="filter-search">
            <div className="dropdown-container">
              <label htmlFor="items_per_page">Show {" "}</label>
              <select
                value={itemsPerPage}
                id="items_per_page"
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
                  <td>
                    <button className="edit-btn yellow" onClick={() => handleEdit(student)}><FaEdit /></button>
                    <button className="delete-btn red" onClick={() => confirmDelete(student)}><FaTrash /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data text-center">
                  {finishedLoading ? "No students found." : (
                    <Loading text={"Loading students..."} useSmall={true} />
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="pagination">
          <p className="pagination-info">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredStudents.length)} out of {students.length}
          </p>
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

        {showConfirm && (
          <ModalConfirmDelete
            isOpen={showConfirm}
            openModal={setShowConfirm}
            onTrue={handleConfirmDelete}
            title="Confirm Deletion"
            message="Are you sure you want to delete this student? This action cannot be undone."
          />
        )}
      </main>
    </div>
  );
}

export default StudentsPage;
