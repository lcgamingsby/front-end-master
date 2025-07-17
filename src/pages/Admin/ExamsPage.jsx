import React, { useState, useEffect } from "react";
import "../../AdminExams.css";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaFilter, FaAngleRight, FaAngleDoubleRight, FaAngleDoubleLeft, FaAngleLeft } from "react-icons/fa";
import Navbar from "../Components/Navbar";
import { config } from "../../data/config";
import axios from "axios";
import Loading from "../Components/Loading";

function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [finishedLoading, setFinishedLoading] = useState(false);

  const navigate = useNavigate();

  const getExams = async () => {
    try {
      const token = localStorage.getItem("jwtToken");

      const response = await axios.get(`${config.backendUrl}/api/exams`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setExams(response.data);
      setFinishedLoading(true);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setFinishedLoading(true);
    }
  }

  useEffect(() => {
    // GET exams data
    getExams();
  }, []);

  const handleEdit = async (index) => {
    const token = localStorage.getItem("jwtToken");

    // needed for getting the student and questions IDs.
    const response = await axios.get(`${config.backendUrl}/api/exams/${index}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    navigate("/admin/exams/edit", { state: { exam: response.data, isEdit: true } });
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
    const startDatetime = new Date(exam.start_datetime);
    const endDatetime = new Date(exam.end_datetime);

    // JS date formatting is limited, can't use en-US for "d M Y"
    const startDate = startDatetime.toLocaleString("en-GB", {dateStyle: "medium"});
    const endDate = endDatetime.toLocaleString("en-GB", {dateStyle: "medium"});

    const startTime = startDatetime.toLocaleString("en-GB", {timeStyle: "short"});
    const endTime = endDatetime.toLocaleString("en-GB", {timeStyle: "short"});
    
    const schedule = (startDate == endDate 
      ? `${startDate} (${startTime} - ${endTime})`.toLowerCase()
      : `${startDate} (${startTime}) - ${endDate} (${endTime})`.toLowerCase()
    );

    return (
      exam.exam_title.toLowerCase().includes(search) ||
      schedule.includes(search) ||
      exam.exam_id.toString().includes(search)
    );
  });

  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentExams = filteredExams.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="admin-dashboard">
      <Navbar />

      <main className="admin-content">
        <h2 className="page-title">All Exams</h2>

        <div className="exam-actions">
          <button className="add-btn" onClick={() => navigate("/admin/exams/add")}>
            + Add an Exam
          </button>

          <div className="actions-right">
            <label className="show-label" htmlFor="items_per_page">Show {" "}</label>
            <select
              value={itemsPerPage}
              id="items_per_page"
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <label className="show-label" htmlFor="items_per_page">{" "} items</label>
            <input
              type="text"
              className="search-bar"
              placeholder="🔍Search exams"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <table className="exam-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Schedule</th>
              <th>Students</th>
              <th>Questions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {finishedLoading && currentExams.length > 0 ? (
              currentExams.map((exam, index) => {
                const startDatetime = new Date(exam.start_datetime);
                const endDatetime = new Date(exam.end_datetime);

                // JS date formatting is limited, can't use en-US for "d M Y"
                const startDate = startDatetime.toLocaleString("en-GB", {dateStyle: "medium"});
                const endDate = endDatetime.toLocaleString("en-GB", {dateStyle: "medium"});

                const startTime = startDatetime.toLocaleString("en-GB", {timeStyle: "short"});
                const endTime = endDatetime.toLocaleString("en-GB", {timeStyle: "short"});
                
                const dateString = (startDate === endDate 
                  ? `${startDate} (${startTime} - ${endTime})`
                  : `${startDate} (${startTime}) - ${endDate} (${endTime})`
                );

                return (
                  <tr key={exam.exam_id}>
                    <td>{exam.exam_id}</td>
                    <td>{exam.exam_title}</td>
                    <td>{dateString}</td>
                    <td>{exam.student_count}</td>
                    <td>{exam.question_count}</td>
                    <td>
                      <button className="edit-btn yellow" onClick={() => handleEdit(exam.exam_id)}><FaEdit /></button>
                      <button className="delete-btn red" onClick={() => handleDelete(exam.exam_id)}><FaTrash /></button>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan="6" className="no-data text-center">
                  {finishedLoading ? "No exams found." : (
                    <Loading text={"Loading exams..."} useSmall={true} />
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="table-footer">
          <p>
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredExams.length)} out of {" "}
            {searchTerm === "" ? exams.length : `${filteredExams.length} (filtered out of ${exams.length} total entries)`}
          </p>
        </div>

        <div className="pagination">
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
      </main>
    </div>
  );
}

export default ExamsPage;
