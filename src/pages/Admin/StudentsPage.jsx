import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaSearch, FaFilter, FaAngleRight, FaAngleDoubleRight, FaAngleDoubleLeft, FaAngleLeft, FaPlus } from "react-icons/fa";
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

      const response = await axios.get(config.BACKEND_URL + "/api/admin/users", {
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

      const response = await axios.delete(config.BACKEND_URL + "/api/admin/users/" + nim, {
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

  const filteredStudents = students.filter((s) => {
    const search = searchTerm.toLowerCase();

    return (
      s.name.toLowerCase().includes(search) ||
      s.nim.toLowerCase().includes(search) ||
      s.email.toLowerCase().includes(search)
    );
  });

  const refilterStudents = (search) => {
    const s = search !== null && search !== undefined ? search : searchTerm;

    return students.filter((v) => {
      const search = s.toLowerCase();
      
      return (
        v.name.toLowerCase().includes(search) ||
        v.nim.toLowerCase().includes(search) ||
        v.email.toLowerCase().includes(search)
      );
    });
  }

  const totalPages = Math.max(Math.ceil(filteredStudents.length / itemsPerPage), 1);
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
    <div className="absolute bg-slate-50 w-full min-h-full h-auto">
      <Navbar />

      <main className="p-8">
        <h2 className="text-4xl mb-5 text-tec-darker font-bold">All Students</h2>
        <div className="flex justify-between items-center mb-5">
          <button
            className="bg-tec-darker hover:bg-tec-dark text-white py-2 px-5 font-bold
              rounded-lg flex items-center gap-2"
            onClick={() => navigate("/admin/students/add")}
          >
            <FaPlus /> Add a Student
          </button>

          <div className="flex items-center flex-wrap gap-2">
            <div>
              <label htmlFor="items_per_page" className="font-medium">Show</label>
              <select
                value={itemsPerPage}
                id="items_per_page"
                className="text-tec-darker border-2 border-tec-darker hover:border-tec-light focus:outline-none
                  focus:border-tec-light px-2 py-1 rounded-lg mx-1.5 font-medium"
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));

                  const newFilteredStudents = refilterStudents(null);
                  
                  const newTotalPages = Math.max(Math.ceil(newFilteredStudents.length / Number(e.target.value)), 1);

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
              placeholder="🔍Search students"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);

                const newFilteredStudents = refilterStudents(e.target.value);

                const newTotalPages = Math.max(Math.ceil(newFilteredStudents.length / itemsPerPage), 1);

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
              <th className="w-2/12 px-4 py-3 border-x-2 border-white border-l-tec-darker">NIM</th>
              <th className="w-5/12 px-4 py-3 border-x-2 border-white">Full Name</th>
              <th className="w-4/12 px-4 py-3 border-x-2 border-white">Email</th>
              <th className="w-1/12 px-4 py-3 border-x-2 border-white border-r-tec-darker">Actions</th>
            </tr>
          </thead>
          <tbody>
            {finishedLoading && currentStudents.length > 0 ? (
              currentStudents.map((student, index) => {
                const isOdd = index % 2 === 1;

                return (
                  <tr
                    key={student.nim}
                    className={`${isOdd ? "bg-slate-200" : "bg-white"} hover:bg-slate-300`}
                  >
                    <td className="px-4 py-2 border-2 border-slate-400 text-center">{student.nim}</td>
                    <td className="px-4 py-2 border-2 border-slate-400">{student.name}</td>
                    <td className="px-4 py-2 border-2 border-slate-400">{student.email}</td>
                    <td className="px-4 py-2 border-2 border-slate-400 text-center">
                      <button
                        className="bg-amber-500 hover:bg-orange-600 mr-1 p-2 rounded-lg cursor-pointer"
                        onClick={() => handleEdit(student)}
                      >
                        <FaEdit className="w-4 h-4 text-white" />
                      </button>
                      
                      <button
                        className="bg-red-500 hover:bg-red-600 cursor-pointer disabled:cursor-not-allowed
                          p-2 rounded-lg disabled:bg-slate-500"
                        onClick={() => confirmDelete(student)}
                      >
                        <FaTrash className="w-4 h-4 text-white" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="px-4 py-3 border-2 border-slate-400 text-center">
                  {finishedLoading ? "No students found." : (
                    <Loading text={"Loading students..."} useSmall={true} />
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex justify-between">
          <p className="text-slate-600 font-semibold">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredStudents.length)} out of {" "}
            {searchTerm === "" ? students.length : `${filteredStudents.length} (filtered out of ${students.length} total entries)`}
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
            {Array.from({ length: totalPages }, (_, i) => (
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
