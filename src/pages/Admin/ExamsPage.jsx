import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaFilter, FaAngleRight, FaAngleDoubleRight, FaAngleDoubleLeft, FaAngleLeft, FaPlus } from "react-icons/fa";
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

  const navigate = useNavigate();

  const getExams = async () => {
    try {
      const token = localStorage.getItem("jwtToken");

      const response = await axios.get(`${config.BACKEND_URL}/api/admin/exams`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setExams(response.data);
      setFinishedLoading(true);
    } catch (error) {
      console.error("Error fetching exams:", error);
      setFinishedLoading(true);
    }
  }

  const deleteExams = async (examId) => {
    try {
      const token = localStorage.getItem("jwtToken");

      const response = await axios.delete(`${config.BACKEND_URL}/api/admin/exams/${examId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.status === 200) {
        // seamless update
        // console.log("Successfully deleted student:", nim); // debug
        setShowConfirm(false);

        setExams((prevExams) =>
          prevExams.filter((exam) => exam.exam_id !== examId)
        );
      }
    } catch (e) {
      console.error("Error deleting exam:", e);
    }
  }

  useEffect(() => {
    // GET exams data
    getExams();
  }, []);

  const handleEdit = async (index) => {
    const token = localStorage.getItem("jwtToken");

    // needed for getting the student and questions IDs.
    const response = await axios.get(`${config.BACKEND_URL}/api/admin/exams/${index}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    navigate("/admin/exams/edit", { state: { exam: response.data, isEdit: true } });
  };

  const confirmDelete = (exam) => {
    setToDelete(exam);
    setShowConfirm(true);
  }

  const handleConfirmDelete = () => {
    const examID = toDelete.exam_id;

    console.log(toDelete);

    deleteExams(examID);
  }

  const getDaysAway = (targetDate) => {
    const currentDate = new Date();

    const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const currentMidnight = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

    const timeDifference = targetMidnight.getTime() - currentMidnight.getTime()
    const daysDifference = timeDifference / (1000 * 60 * 60 * 24); // div by 1000 milliseconds, 60 seconds, 60 minutes, 24 hours
    
    return daysDifference;
  }

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

  const refilterExams = (search) => {
    const s = search !== null ? search : searchTerm;

    return exams.filter((e) => {
      const search = s.toLowerCase();
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
  }

  const totalPages = Math.max(Math.ceil(filteredExams.length / itemsPerPage), 1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentExams = filteredExams.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="absolute bg-slate-50 w-full min-h-full h-auto">
      <Navbar />

      <main className="p-8">
        <h2 className="text-4xl mb-5 text-tec-darker font-bold">All Exams</h2>

        <div className="flex justify-between items-center mb-5">
          <button
            className="bg-tec-darker hover:bg-tec-dark text-white py-2 px-5 font-bold
              rounded-lg flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/admin/exams/add")}
          >
            <FaPlus /> Add an Exam
          </button>

          <div className="flex items-center flex-wrap gap-2">
            <div>
              <label htmlFor="items_per_page" className="font-medium">
                Show
              </label>
              <select
                value={itemsPerPage}
                id="items_per_page"
                className="text-tec-darker border-2 border-tec-darker hover:border-tec-light focus:outline-none
                focus:border-tec-light px-2 py-1 rounded-lg mx-1.5 font-medium"
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));

                  const newFilteredExams = refilterExams(null);

                  const newTotalPages = Math.max(Math.ceil(newFilteredExams.length / Number(e.target.value)), 1);

                  if (currentPage > newTotalPages) {  
                    setCurrentPage(newTotalPages);
                  }
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <label htmlFor="items_per_page" className="font-medium">items</label>
            </div>
            <input
              type="text"
              className="py-1 px-3 border-2 border-tec-darker rounded-lg w-60 hover:border-tec-light focus:outline-none
               focus:border-tec-light"
              placeholder="🔍 Search exams"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);

                const newFilteredExams = refilterExams(e.target.value);

                const newTotalPages = Math.max(Math.ceil(newFilteredExams.length / Number(e.target.value)), 1);

                if (currentPage > newTotalPages) {  
                  setCurrentPage(newTotalPages);
                }
              }}
            />
          </div>
        </div>

        <table className="w-full border-collapse mb-4">
          <thead>
            <tr className="bg-tec-darker text-white text-center font-bold">
              <th className="w-1/12 px-4 py-3 border-x-2 border-white border-l-tec-darker">ID</th>
              <th className="w-4/12 px-4 py-3 border-x-2 border-white">Title</th>
              <th className="w-4/12 px-4 py-3 border-x-2 border-white">Schedule</th>
              <th className="w-1/12 px-4 py-3 border-x-2 border-white">Students</th>
              <th className="w-1/12 px-4 py-3 border-x-2 border-white">Questions</th>
              <th className="w-1/12 px-4 py-3 border-x-2 border-white border-r-tec-darker">Actions</th>
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

                // Make the button unusable if the exam start date is at least 3 days away.
                const daysAway = getDaysAway(startDatetime);

                const isOdd = index % 2 === 1;

                return (
                  <tr
                    key={exam.exam_id}
                    className={`${isOdd ? "bg-slate-200" : "bg-white"} hover:bg-slate-300`}
                  >
                    <td className="px-4 py-2 border-2 border-slate-400 text-center">{exam.exam_id}</td>
                    <td className="px-4 py-2 border-2 border-slate-400">{exam.exam_title}</td>
                    <td className="px-4 py-2 border-2 border-slate-400">{dateString}</td>
                    <td className="px-4 py-2 border-2 border-slate-400 text-center">{exam.student_count}</td>
                    <td className="px-4 py-2 border-2 border-slate-400 text-center">{exam.question_count}</td>
                    <td className="px-4 py-2 border-2 border-slate-400 text-center">
                      <button
                        className="bg-amber-500 hover:bg-orange-600 mr-1 p-2 rounded-lg cursor-pointer"
                        onClick={() => handleEdit(exam.exam_id)}
                        title={`Edit this exam (ID ${exam.exam_id})`}
                      >
                        <FaEdit className="w-4 h-4 text-white" />
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 cursor-pointer disabled:cursor-not-allowed
                          p-2 rounded-lg disabled:bg-slate-500"
                        onClick={() => {
                          if (daysAway > 3) {
                            confirmDelete(exam)
                          }
                        }}
                        disabled={!(daysAway > 3)}
                        title={
                          daysAway < 0 ? (
                            `This exam has already ended.`
                          ) : daysAway < 3 ? (
                            `This exam is ${daysAway} day(s) away from the scheduled start date.`
                          ) : `Delete this exam (ID ${exam.exam_id})`
                        }
                      >
                        <FaTrash className="w-4 h-4 text-white" />
                      </button>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan="6" className="px-4 py-3 border-2 border-slate-400 text-center">
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
              {searchTerm === "" ? exams.length : `${filteredExams.length} (filtered out of ${exams.length} total entries)`}
            </p>

            <div className="flex gap-2 justify-center">
              <button
                className="text-tec-darker disabled:text-slate-500 font-semibold p-2 rounded-full w-8 h-8
                  flex items-center justify-center"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <FaAngleDoubleLeft className="w-5 h-5" />
              </button>
              <button
                className="text-tec-darker disabled:text-slate-500 font-semibold p-2 rounded-full w-8 h-8
                  flex items-center justify-center"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <FaAngleLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: Math.max(totalPages, 1) }, (_, i) => (
                <button
                  key={i + 1}
                  className={`${currentPage === i + 1 ?
                    "bg-tec-darker text-white font-bold" : "text-tec-darker font-semibold"} p-2 rounded-full
                    w-8 h-8 text-sm flex items-center justify-center`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="text-tec-darker disabled:text-slate-500 font-semibold p-2 rounded-full w-8 h-8
                  flex items-center justify-center"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <FaAngleRight className="w-5 h-5" />
              </button>
              <button
                className="text-tec-darker disabled:text-slate-500 font-semibold p-2 rounded-full w-8 h-8
                  flex items-center justify-center"
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
