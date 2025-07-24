import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaAngleLeft, FaAngleRight, FaChevronLeft, FaFilter } from "react-icons/fa";
import Navbar from "../Components/Navbar";
import axios from "axios";
import { config } from "../../data/config";

function AddExamPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = location.state?.isEdit || false;
  const editExam = location.state?.exam || null;

  const [selectedType, setSelectedType] = useState("All");

  const [navQuestions, setNavQuestions] = useState({
    itemsPerPage: 10,
    currentPage: 1,
    searchTerm: "",
  });

  const [navStudents, setNavStudents] = useState({
    itemsPerPage: 10,
    currentPage: 1,
    searchTerm: "",
  });

  const [questions, setQuestions] = useState([]);
  const [students, setStudents] = useState([]);

  const [form, setForm] = useState(() => {
    if (editExam) {
      return {
        ...editExam,
        questions: Array.isArray(editExam.questions) ? editExam.questions : [],
        students: Array.isArray(editExam.students) ? editExam.students : [],
      }
    }
    
    return {
      exam_title: "",
      start_datetime: "",
      end_datetime: "",
      questions: [],
      students: [],
    };
  });

  const getQuestions = async (token) => {
    try {
      const response = await axios.get(`${config.backendUrl}/api/questions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setQuestions(response.data.map((q, index) => ({
        ...q, answers: [q.choice_a, q.choice_b, q.choice_c, q.choice_d]})
      ));
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  }

  const getStudents = async (token) => {
    try {
      const response = await axios.get(`${config.backendUrl}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  }

  const createExam = async (exam) => {
    const token = localStorage.getItem("jwtToken");

    try {
      await axios.post(`${config.backendUrl}/api/exams`, exam, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/admin/exams");
    } catch (e) {
      console.error("Failed to create exam:", e);
    }
    
    //console.log(exam);
  }

  const updateExam = async (id, exam) => {
    const token = localStorage.getItem("jwtToken");

    try {
      await axios.put(`${config.backendUrl}/api/exams/${id}`, exam, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/admin/exams");
    } catch (e) {
      console.error("Failed to update exam:", e);
    }
    
    //console.log(id, exam);
  } 

  // Ambil data pertanyaan & students dari localStorage
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");

    getQuestions(token);
    getStudents(token);
  }, []);

  //console.log(editExam, isEdit);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEdit) {
      updateExam(editExam.exam_id, form);
    } else {
      createExam(form);
    }
  }

  // Filter pertanyaan berdasarkan jenis soal dan kata kunci
  const filteredQuestions = questions.filter((q) => {
    const search = navQuestions.searchTerm.toLowerCase();

    const matchType = selectedType === "All" || q.question_type.toLowerCase() === selectedType.toLowerCase();
    const matchSearch =
      q.question_type.toLowerCase().includes(search) ||
      q.question_text.toLowerCase().includes(search) ||
      q.choice_a.includes(search) ||
      q.choice_b.includes(search) ||
      q.choice_c.includes(search) ||
      q.choice_d.includes(search);
    return matchType && matchSearch;
  });

  const refilterQuestions = (search, type) => {
    /*
      Functions identically to initial filteredQuestions if no arguments were given.
    */
    const s = search !== null && search !== undefined ? search : navQuestions.searchTerm;

    const t = type !== null && type !== undefined ? type : selectedType;

    return questions.filter((q) => {
      const search = s.toLowerCase();
      
      const matchType = t === "All" || q.question_type.toLowerCase() === t.toLowerCase();
      const matchSearch =
        q.question_type.toLowerCase().includes(search) ||
        q.question_text.toLowerCase().includes(search) ||
        q.choice_a.includes(search) ||
        q.choice_b.includes(search) ||
        q.choice_c.includes(search) ||
        q.choice_d.includes(search);
      
      return matchType && matchSearch;
    });
  }

  const totalPagesQ = Math.max(Math.ceil(filteredQuestions.length / navQuestions.itemsPerPage), 1);
  const startIndexQ = (navQuestions.currentPage - 1) * navQuestions.itemsPerPage;
  const currentQuestions = filteredQuestions.slice(startIndexQ, startIndexQ + navQuestions.itemsPerPage);

  const filteredStudents = students.filter((s) => {
    const search = navStudents.searchTerm.toLowerCase();
    
    return (
      s.name.toLowerCase().includes(search) ||
      s.nim.toLowerCase().includes(search) ||
      s.email.toLowerCase().includes(search)
    );
  });

  const refilterStudents = (search) => {
    const s = search !== null && search !== undefined ? search : navStudents.searchTerm;

    return students.filter((v) => {
      const search = s.toLowerCase();
      
      return (
        v.name.toLowerCase().includes(search) ||
        v.nim.toLowerCase().includes(search) ||
        v.email.toLowerCase().includes(search)
      );
    });
  }

  const totalPagesS = Math.max(Math.ceil(filteredStudents.length / navStudents.itemsPerPage), 1);
  const startIndexS = (navStudents.currentPage - 1) * navStudents.itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndexS, startIndexS + navStudents.itemsPerPage);

  return (
    <div className="absolute bg-slate-50 w-full min-h-full h-auto">
      <Navbar />

      <main className="p-8">
        <div className="flex gap-2 items-baseline">
          <button
            className="text-tec-darker hover:text-tec-light cursor-pointer"
            onClick={() => navigate("/admin/exams")}
          >
            <FaChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-4xl mb-5 text-tec-darker font-bold">{isEdit ? "Edit Exam" : "New Exam"}</h2>
        </div>

        {/* FORM EXAM INFO */}
        <form className="mb-10" onSubmit={handleSubmit}>
          <label className="text-sm text-tec-darker font-semibold select-none" htmlFor="exam_title">EXAM TITLE</label>
          <input
            type="text"
            placeholder="Title of the exam"
            name="exam_title"
            id="exam_title"
            className="w-full px-3 py-2 mb-4 border-2 border-slate-300 focus:outline-none hover:border-tec-light
              focus:border-tec-light rounded-lg"
            value={form.exam_title}
            required
            onChange={(e) => {
              setForm({
                ...form,
                exam_title: e.target.value,
              });
            }}
          />

          <div className="form-row flex gap-4 mt-4">
            <div className="flex-1">
              <label className="text-sm text-tec-darker font-semibold select-none" htmlFor="start_datetime">START SCHEDULE</label>
              <input
                type="datetime-local"
                name="start_datetime"
                id="start_datetime"
                className="w-full p-2.5 mb-4 border-2 border-slate-300 focus:outline-none hover:border-tec-light
                focus:border-tec-light rounded-lg"
                required
                value={form.start_datetime}
                onChange={(e) => {
                  setForm({
                    ...form,
                    start_datetime: e.target.value,
                  });
                }}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-tec-darker font-semibold select-none" htmlFor="end_datetime">END SCHEDULE</label>
              <input
                type="datetime-local"
                name="end_datetime"
                id="end_datetime"
                className="w-full p-2.5 mb-4 border-2 border-slate-300 focus:outline-none hover:border-tec-light
                focus:border-tec-light rounded-lg"
                required
                value={form.end_datetime}
                onChange={(e) => {
                  setForm({
                    ...form,
                    end_datetime: e.target.value,
                  });
                }}
              />
            </div>
          </div>

          {/* ADD QUESTIONS */}
          <h3 className="text-lg text-tec-dark font-semibold">
            ADD QUESTIONS {" "}
            {form.questions.length > 0 && (
              <span>({form.questions.length} selected)</span>
            )}
          </h3>
          <div className="flex items-center justify-between mt-2 mb-4 gap-4 flex-wrap text-sm">
            <div>
              <label htmlFor="items-per-page-q" className="font-medium">Show</label>
              <select
                value={navQuestions.itemsPerPage}
                id="items-per-page-q"
                className="text-tec-darker border-2 border-tec-darker hover:border-tec-light focus:outline-none
                  focus:border-tec-light px-2 py-1 rounded-lg mx-1.5 font-medium"
                onChange={(e) => {
                  let changes = {
                    itemsPerPage: Number(e.target.value),
                  }

                  const newFilteredQuestions = refilterQuestions(null, null);

                  const newTotalPages = Math.max(Math.ceil(newFilteredQuestions.length / Number(e.target.value)), 1);

                  if (navQuestions.currentPage > newTotalPages) {
                    changes.currentPage = newTotalPages;
                  }

                  setNavQuestions({
                    ...navQuestions,
                    ...changes,
                  });
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <label htmlFor="items-per-page-q" className="font-medium">items</label>
            </div>

            <select
              value={selectedType}
              className="text-tec-darker border-2 border-tec-darker hover:border-tec-light focus:outline-none
                focus:border-tec-light px-2 py-1 rounded-lg mx-1.5 font-medium"
              onChange={(e) => {
              setSelectedType(e.target.value);

              const newFilteredQuestions = refilterQuestions(null, e.target.value);

              // needs recalculated because filteredQuestions changed
              const newTotalPages = Math.max(Math.ceil(newFilteredQuestions.length / navQuestions.itemsPerPage), 1);

              if (navQuestions.currentPage > newTotalPages) {
                setNavQuestions({
                  ...navQuestions,
                  currentPage: newTotalPages,
                });
              }
              }}
            >
              <option value="All">All Types</option>
              <option value="Grammar">Grammar</option>
              <option value="Reading">Reading</option>
              <option value="Listening">Listening</option>
            </select>

            <input
              type="text"
              placeholder="🔍 Search questions"
              className="py-1 px-3 border-2 border-tec-darker rounded-lg w-60 hover:border-tec-light focus:outline-none
               focus:border-tec-light"
              value={navQuestions.searchTerm}
              onChange={(e) => {
                let changes = {
                  searchTerm: e.target.value,
                }

                const newFilteredQuestions = refilterQuestions(e.target.value, null);

                // needs recalculated because filteredQuestions changed
                const newTotalPages = Math.max(Math.ceil(newFilteredQuestions.length / navQuestions.itemsPerPage), 1);

                if (navQuestions.currentPage > newTotalPages) {
                  changes.currentPage = newTotalPages;
                }

                setNavQuestions({
                  ...navQuestions,
                  ...changes,
                });
              }}
            />
          </div>

          <table className="w-full border-collapse mb-4 text-sm">
            <thead>
              <tr className="bg-tec-darker text-white text-center font-bold">
                <th className="w-1/12 px-4 py-3 border-x-2 border-white border-l-tec-darker">
                  <input
                    type="checkbox"
                    name="all_questions"
                    checked={form.questions.length === questions.length && questions.length > 0}
                    onChange={() => {
                      const allQuestionIDs = questions.flatMap((q) => q.question_id);

                      setForm({
                        ...form,
                        questions: form.questions.length !== questions.length ? allQuestionIDs : [],
                      });
                    }}
                    disabled={questions.length === 0}
                  /></th>
                <th className="w-1/12 px-4 py-3 border-x-2 border-white">Type</th>
                <th className="w-5/12 px-4 py-3 border-x-2 border-white">Question</th>
                <th className="w-5/12 px-4 py-3 border-x-2 border-white border-r-tec-darker">Answer Choices</th>
              </tr>
            </thead>
            <tbody>
              {currentQuestions.length > 0 ? (
                currentQuestions.map((q, idx) => {
                  let answerText = q.answers.join(", ");

                  const isOdd = idx % 2 === 1;
                  
                  return (
                    <tr key={q.question_id} className={`${isOdd ? "bg-slate-200" : "bg-white"} hover:bg-slate-300`}>
                      <td className="px-4 py-2 border-2 border-slate-400 text-center">
                        <input
                          type="checkbox"
                          checked={form.questions.includes(q.question_id)}
                          onChange={() => {
                            setForm((prevForm) => {
                              const alreadySelected = prevForm.questions.includes(q.question_id);

                              return {
                              ...form,
                              questions: alreadySelected
                                ? prevForm.questions.filter((id) => id !== q.question_id)
                                : [...prevForm.questions, q.question_id],
                              };
                            });
                          }}
                        />
                      </td>
                      <td className="px-4 py-2 border-2 border-slate-400">{q.question_type[0].toUpperCase() + q.question_type.slice(1)}</td>
                      <td className="px-4 py-2 border-2 border-slate-400 text-ellipsis" title={q.question_text}>
                        {q.audio_path ? (
                          <audio controls src={`${config.backendUrl}/audio/${q.audio_path}`} />
                        ) : null}
                        {q.question_text.length > 128 ? q.question_text.slice(0, 128).trim() + "..." : q.question_text}
                      </td>
                      <td className="px-4 py-2 border-2 border-slate-400 text-ellipsis" title={answerText}>
                        {answerText.length > 128 ? answerText.slice(0, 128).trim() + "..." : answerText}
                      </td>
                    </tr>
                  );
                })
              ) : null}
            </tbody>
          </table>
          <div className="flex justify-between">
            <p className="text-slate-600 font-semibold">
              Showing {startIndexQ + 1} to {Math.min(startIndexQ + navQuestions.itemsPerPage, filteredQuestions.length)} {" "}
              out of {navQuestions.searchTerm === "" && selectedType === "All"
                ? filteredQuestions.length
                : `${filteredQuestions.length} (filtered out of ${questions.length} total entries)`}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                className="text-tec-darker disabled:text-slate-500 font-semibold p-2 rounded-full w-8 h-8
                  flex items-center justify-center"
                onClick={() => setNavQuestions({
                  ...navQuestions,
                  currentPage: 1,
                })}
                disabled={navQuestions.currentPage === 1}
              >
                <FaAngleDoubleLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="text-tec-darker disabled:text-slate-500 font-semibold p-2 rounded-full w-8 h-8
                  flex items-center justify-center"
                onClick={() => setNavQuestions((prev) => {
                  return {
                    ...navQuestions,
                    currentPage: Math.max(prev.currentPage - 1, 1)
                  }
                })}
                disabled={navQuestions.currentPage === 1}
              >
                <FaAngleLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: Math.max(totalPagesQ, 1) }, (_, i) => (
                <button
                  type="button"
                  key={i + 1}
                  className={`${navQuestions.currentPage === i + 1 ?
                    "bg-tec-darker text-white font-bold" : "text-tec-darker font-semibold"} p-2 rounded-full
                    w-8 h-8 text-sm flex items-center justify-center`}
                  onClick={() => setNavQuestions({
                      ...navQuestions,
                      currentPage: i + 1
                    }
                  )}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                className="text-tec-darker disabled:text-slate-500 font-semibold p-2 rounded-full w-8 h-8
                  flex items-center justify-center"
                onClick={() => setNavQuestions((prev) => {
                  return {
                    ...navQuestions,
                    currentPage: Math.min(prev.currentPage + 1, totalPagesQ)
                  }
                })}
                disabled={navQuestions.currentPage === totalPagesQ}
              >
                <FaAngleRight className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="text-tec-darker disabled:text-slate-500 font-semibold p-2 rounded-full w-8 h-8
                  flex items-center justify-center"
                onClick={() => setNavQuestions({
                  ...navQuestions,
                  currentPage: totalPagesQ,
                })}
                disabled={navQuestions.currentPage === totalPagesQ}
              >
                <FaAngleDoubleRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ADD STUDENTS */}
          <h3 className="text-lg text-tec-dark font-semibold mt-4">
            ADD STUDENTS {" "}
            {form.students.length > 0 && (
              <span>({form.students.length} selected)</span>
            )}
          </h3>
          <div className="flex items-center justify-between mt-2 mb-4 gap-4 flex-wrap text-sm">
            <div>
              <label htmlFor="items-per-page-s" className="font-medium">Show</label>
                <select
                  value={navStudents.itemsPerPage}
                  id="items-per-page-s"
                  className="text-tec-darker border-2 border-tec-darker hover:border-tec-light focus:outline-none
                    focus:border-tec-light px-2 py-1 rounded-lg mx-1.5 font-medium"
                  onChange={(e) => {
                    let changes = {
                      itemsPerPage: Number(e.target.value),
                    }

                    const newFilteredStudents = refilterStudents(null);

                    const newTotalPages = Math.max(Math.ceil(newFilteredStudents.length / Number(e.target.value)), 1);

                    if (navStudents.currentPage > newTotalPages) {
                      changes.currentPage = newTotalPages;
                    }

                    setNavStudents({
                      ...navStudents,
                      ...changes,
                    });
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              <label htmlFor="items-per-page-s" className="font-medium">items</label>
            </div>
            <input
              type="text"
              className="py-1 px-3 border-2 border-tec-darker rounded-lg w-60 hover:border-tec-light focus:outline-none
               focus:border-tec-light"
              placeholder="🔍 Search students"
              value={navStudents.searchTerm}
              onChange={(e) => {
                let changes = {
                  searchTerm: e.target.value
                }

                const newFilteredStudents = refilterStudents(e.target.value);

                const newTotalPages = Math.max(Math.ceil(newFilteredStudents.length / navStudents.itemsPerPage), 1);

                if (navStudents.currentPage > newTotalPages) {
                  changes.currentPage = newTotalPages;
                }

                setNavStudents({
                  ...navStudents,
                  ...changes
                });
              }}
            />
          </div>

          <table className="w-full border-collapse mb-4 text-sm">
            <thead>
              <tr className="bg-tec-darker text-white text-center font-bold">
                <th className="w-1/12 px-4 py-3 border-x-2 border-white border-l-tec-darker">
                  <input
                    type="checkbox"
                    name="all_students"
                    checked={form.students.length === students.length && students.length > 0}
                    onChange={() => {
                      const allStudentIDs = students.flatMap((s) => s.nim);

                      setForm({
                        ...form,
                        students: form.students.length !== students.length ? allStudentIDs : [],
                      });
                    }}
                    disabled={students.length === 0}
                  />
                </th>
                <th className="w-2/12 px-4 py-3 border-x-2 border-white">NIM</th>
                <th className="w-5/12 px-4 py-3 border-x-2 border-white">Full Name</th>
                <th className="w-4/12 px-4 py-3 border-x-2 border-white border-r-tec-darker">Email</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.length > 0 ? (
                currentStudents.map((s, idx) => {
                  const isOdd = idx % 2 === 1;
                  
                  return (
                    <tr key={s.nim} className={`${isOdd ? "bg-slate-200" : "bg-white"} hover:bg-slate-300`}>
                      <td className="px-4 py-2 border-2 border-slate-400 text-center">
                        <input
                            type="checkbox"
                            checked={form.students.includes(s.nim)}
                            onChange={() => {
                              setForm((prevForm) => {
                                const alreadySelected = prevForm.students.includes(s.nim);

                                return {
                                ...form,
                                students: alreadySelected
                                  ? prevForm.students.filter((id) => id !== s.nim)
                                  : [...prevForm.students, s.nim],
                                };
                              });
                            }}
                          />
                      </td>
                      <td className="px-4 py-2 border-2 border-slate-400 text-center">{s.nim}</td>
                      <td className="px-4 py-2 border-2 border-slate-400">{s.name}</td>
                      <td className="px-4 py-2 border-2 border-slate-400">{s.email}</td>
                    </tr>
                  )
                })
              ) : null}
            </tbody>
          </table>
          <div className="flex justify-between">
            <p className="text-slate-600 font-semibold">
              Showing {startIndexS + 1} to {Math.min(startIndexS + navStudents.itemsPerPage, filteredStudents.length)} out of {" "}
              {navStudents.searchTerm === ""
                ? students.length
                : `${filteredStudents.length} (filtered out of ${students.length} total entries)`}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                className="text-tec-darker disabled:text-slate-500 font-semibold p-2 rounded-full w-8 h-8
                  flex items-center justify-center"
                onClick={() => setNavStudents({
                  ...navStudents,
                  currentPage: 1,
                })}
                disabled={navStudents.currentPage === 1}
              >
                <FaAngleDoubleLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="text-tec-darker disabled:text-slate-500 font-semibold p-2 rounded-full w-8 h-8
                  flex items-center justify-center"
                onClick={() => setNavStudents((prev) => {
                  return {
                    ...navStudents,
                    currentPage: Math.max(prev.currentPage - 1, 1)
                  }
                })}
                disabled={navStudents.currentPage === 1}
              >
                <FaAngleLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: Math.max(totalPagesS, 1) }, (_, i) => (
                <button
                  type="button"
                  key={i + 1}
                  className={`${navStudents.currentPage === i + 1 ?
                    "bg-tec-darker text-white font-bold" : "text-tec-darker font-semibold"} p-2 rounded-full
                    w-8 h-8 text-sm flex items-center justify-center`}
                  onClick={() => setNavStudents({
                      ...navStudents,
                      currentPage: i + 1
                    }
                  )}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                className="text-tec-darker disabled:text-slate-500 font-semibold p-2 rounded-full w-8 h-8
                  flex items-center justify-center"
                onClick={() => setNavStudents((prev) => {
                  return {
                    ...navStudents,
                    currentPage: Math.min(prev.currentPage + 1, totalPagesS)
                  }
                })}
                disabled={navStudents.currentPage === totalPagesS}
              >
                <FaAngleRight className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="text-tec-darker disabled:text-slate-500 font-semibold p-2 rounded-full w-8 h-8
                  flex items-center justify-center"
                onClick={() => setNavStudents({
                  ...navStudents,
                  currentPage: totalPagesS,
                })}
                disabled={navStudents.currentPage === totalPagesS}
              >
                <FaAngleDoubleRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            className="bg-tec-darker hover:bg-tec-dark text-white py-2 px-5 font-bold
              rounded-lg flex items-center gap-2 mt-5"
          >
            {isEdit ? "Save Changes" : "Add Exam"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default AddExamPage;
