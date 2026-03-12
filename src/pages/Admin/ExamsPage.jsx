import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaAngleRight, FaAngleDoubleRight, FaAngleDoubleLeft, FaAngleLeft, FaPlus } from "react-icons/fa";
import Navbar from "../Components/Navbar";
import { config } from "../../data/config";
import axios from "axios";
import Loading from "../Components/Loading";
import ModalConfirmDelete from "../Components/ModalConfirmDelete";

function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [finishedLoading, setFinishedLoading] = useState(false);

  // NEW: mode untuk pilih online/offline
  const [examMode, setExamMode] = useState("online");

  const navigate = useNavigate();

  const getExams = async () => {
    try {
      const endpoint =
        examMode === "online"
          ? `${config.BACKEND_URL}/api/admin/exams`
          : `${config.BACKEND_URL}/api/admin/exams/offline`;
      

      const response = await axios.get(
        endpoint,
        { withCredentials: true }
      );

      if (response.status === 200 && response.data.length > 0) {
        setExams(response.data);
      } else {
        setExams([]);
      }
      setFinishedLoading(true);
    } catch (error) {
      console.error("Error fetching exams:", error);
      setFinishedLoading(true);
    }
  };

  const deleteExams = async (examID) => {
    try {
      const endpoint =
        examMode === "online"
          ? `${config.BACKEND_URL}/api/admin/exams/${examID}`
          : `${config.BACKEND_URL}/api/admin/exams/offline/${examID}`;
          

      const response = await axios.delete(
        endpoint,
        { withCredentials: true },
      );

      if (response.status === 200) {
        setShowConfirm(false);
        setExams((prevExams) =>
          prevExams.filter((exam) => exam.exam_id !== examID)
        );
      }
    } catch (e) {
      console.error("Error deleting exam:", e);
    }
  };

  // Konversi UTC dari server → waktu lokal browser
  function formatLocalDatetime(datetimeStr) {
    if (!datetimeStr) return "-";
    const date = new Date(datetimeStr);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }


  useEffect(() => {
    getExams();
  }, [examMode]); // refresh saat mode berubah

  const handleEdit = async (examID) => {
  // Jangan ubah examID jadi number — biarkan string
    const endpoint =
      examMode === "online"
        ? `${config.BACKEND_URL}/api/admin/exams/${examID}`
        : `${config.BACKEND_URL}/api/admin/exams/offline/${examID}`;

    try {
      const response = await axios.get(
        endpoint,
        { withCredentials: true },
      );

      navigate(
        examMode === "online"
          ? "/admin/exams/edit"
          : "/admin/exams/edit-offline",
        {
          state: { exam: response.data, mode: examMode, isEdit: true },
        }
      );
    } catch (err) {
      console.error("Failed to load exam for edit:", err);
      alert("Failed to load exam data. Please check backend logs.");
    }
  };


  const confirmDelete = (exam) => {
    setToDelete(exam);
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    const examID = toDelete.exam_id;
    deleteExams(examID);
  };

  const getDaysAway = (targetDate) => {
    const currentDate = new Date();
    const targetMidnight = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate()
    );
    const currentMidnight = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );
    const timeDifference = targetMidnight.getTime() - currentMidnight.getTime();
    return timeDifference / (1000 * 60 * 60 * 24);
  };

  const filteredExams = exams.filter((exam) =>
    exam.exam_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(Math.ceil(filteredExams.length / itemsPerPage), 1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentExams = filteredExams.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="absolute bg-slate-50 w-full min-h-full h-auto">
      <Navbar />

      <main className="p-8">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-4xl text-tec-darker font-bold">All Exams</h2>

          <div className="flex items-center gap-3">
            {/* Pilih jenis data yang ditampilkan */}
            <label className="font-semibold text-tec-darker">Show:</label>
            <select
              value={examMode}
              onChange={(e) => {
                setExamMode(e.target.value);
                // reset page number for no visual bug
                setCurrentPage(1);
              }}
              className="border-2 border-slate-400 rounded-lg px-3 py-1.5 font-semibold text-tec-darker hover:border-tec-light focus:border-tec-light focus:outline-none"
            >
              <option value="online">Online Exams</option>
              <option value="offline">Offline Exams</option>
            </select>

            {/* Tombol selalu menuju add exam online */}
            <button
              className="bg-tec-darker hover:bg-tec-dark text-white py-2 px-5 font-bold
                rounded-lg flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/admin/exams/add")}
            >
              <FaPlus /> Add Exam
            </button>
          </div>
        </div>


        <table className="w-full border-collapse mb-4 text-sm">
          <thead>
            <tr className="bg-tec-darker text-white text-center font-bold">
              <th className="w-1/12 px-4 py-3 border-x-2 border-white">ID</th>
              <th className="w-4/12 px-4 py-3 border-x-2 border-white">Title</th>
              <th className="w-4/12 px-4 py-3 border-x-2 border-white">
                Schedule
              </th>

              {examMode === "online" ? (
                <>
                  <th className="w-1/12 px-4 py-3 border-x-2 border-white">
                    Students
                  </th>
                  <th className="w-1/12 px-4 py-3 border-x-2 border-white">
                    Questions
                  </th>
                </>
              ) : (
                <>
                  <th className="w-1/12 px-4 py-3 border-x-2 border-white">
                    Students
                  </th>
                  <th className="w-2/12 px-4 py-3 border-x-2 border-white">
                    Quota (Available)
                  </th>
                </>
              )}

              <th className="w-1/12 px-4 py-3 border-x-2 border-white border-r-tec-darker">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {finishedLoading && currentExams.length > 0 ? (
              currentExams.map((exam, index) => {
                const startDatetime = new Date(exam.start_datetime);
                const endDatetime = new Date(exam.end_datetime);
                const startDate = startDatetime.toLocaleString("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                });
                const endDate = endDatetime.toLocaleString("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                });

                const dateString =
                  startDate === endDate
                    ? startDate
                    : `${startDate} - ${endDate}`;

                const daysAway = getDaysAway(startDatetime);
                const isOdd = index % 2 === 1;

                // Determine if the exam can be deleted (if it's not less than 3 days away from the exam date)
                const deleteDisabled = daysAway <= 3;

                return (
                  <tr
                    key={exam.exam_id}
                    className={`${isOdd ? "bg-slate-200" : "bg-white"} hover:bg-slate-300`}
                  >
                    <td className="px-4 py-2 border-2 border-slate-400 text-center">
                      {exam.exam_id}
                    </td>
                    <td className="px-4 py-2 border-2 border-slate-400">
                      {exam.exam_title}
                    </td>
                    <td className="px-4 py-2 border-2 border-slate-400">
                      {dateString}
                    </td>

                    {examMode === "online" ? (
                      <>
                        <td className="px-4 py-2 border-2 border-slate-400 text-center">
                          {exam.student_count}
                        </td>
                        <td className="px-4 py-2 border-2 border-slate-400 text-center">
                          {exam.question_count}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-2 border-2 border-slate-400 text-center">
                          {exam.student_count || 0}
                        </td>
                        <td className="px-4 py-2 border-2 border-slate-400 text-center">
                          {exam.total_quota}/{exam.available_quota}
                        </td>
                      </>
                    )}

                    <td className="px-4 py-2 border-2 border-slate-400 text-center">
                      <button
                        className="bg-amber-500 hover:bg-orange-600 mr-1 p-2 rounded-lg cursor-pointer"
                        onClick={() => handleEdit(exam.exam_id)}
                        title="Edit this exam"
                      >
                        <FaEdit className="w-4 h-4 text-white" />
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 cursor-pointer disabled:cursor-not-allowed
                          p-2 rounded-lg disabled:bg-slate-500"
                        onClick={() => confirmDelete(exam)}
                        disabled={deleteDisabled}
                        title={deleteDisabled ?
                          "Cannot delete this exam (less than 3 days away from the start date)"
                          : "Delete this exam"
                        }
                      >
                        <FaTrash className="w-4 h-4 text-white" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="px-4 py-3 border-2 border-slate-400 text-center">
                  {finishedLoading ? "No exams found." : (
                    <Loading text={"Loading exams..."} useSmall={true} />
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex justify-between">
          <p className="text-slate-600 font-semibold">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredExams.length)} out of {" "}
              {searchTerm === ""
                ? exams.length
                : `${filteredExams.length} (filtered out of ${exams.length} total entries)`}
          </p>

          <div className="flex gap-2 justify-center">
            <button
              className="text-tec-darker disabled:text-slate-500 font-semibold p-2 rounded-full w-8 h-8
                flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <FaAngleDoubleLeft className="w-5 h-5" />
            </button>
            <button
              className="text-tec-darker disabled:text-slate-500 font-semibold p-2 rounded-full w-8 h-8
                flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <FaAngleLeft className="w-5 h-5" />
            </button>
            {Array.from(
              { length: totalPages },
              (_, i) => {
                const displaySize = 5;
                let lowerLimit = currentPage - 2;
                let upperLimit = currentPage + 2;

                if (currentPage < 3) {
                  lowerLimit = 1;
                  upperLimit = displaySize;
                }

                if (currentPage > totalPages - 2) {
                  lowerLimit = totalPages + 1 - displaySize;
                  upperLimit = totalPages;
                }

                console.log(i + 1, lowerLimit, upperLimit);

                if (i + 1 < Math.max(1, lowerLimit) || i + 1 > Math.min(totalPages, upperLimit)) {
                  return;
                }

                return (
                  <button
                    key={i + 1}
                    className={`${currentPage === i + 1 ?
                      "bg-tec-darker text-white font-bold" : "text-tec-darker font-semibold"} p-2
                      rounded-full w-8 h-8 text-sm flex items-center justify-center cursor-pointer
                      disabled:cursor-not-allowed`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                );
              }
            )}
            <button
              className="text-tec-darker disabled:text-slate-500 font-semibold p-2 rounded-full w-8 h-8
                flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <FaAngleRight className="w-5 h-5" />
            </button>
            <button
              className="text-tec-darker disabled:text-slate-500 font-semibold p-2 rounded-full w-8 h-8
                flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <FaAngleDoubleRight className="w-5 h-5" />
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
          message="Are you sure you want to delete this exam? This action cannot be undone."
        />
      )}
    </div>
  );
}

export default ExamsPage;
