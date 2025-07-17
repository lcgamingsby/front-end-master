// src/pages/AddExamPage.js
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../AdminExams.css";
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaAngleLeft, FaAngleRight, FaFilter } from "react-icons/fa";
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
      q.question_id.toString().includes(search) ||
      q.question_type.toLowerCase().includes(search) ||
      q.question_text.toLowerCase().includes(search) ||
      q.choice_a.includes(search) ||
      q.choice_b.includes(search) ||
      q.choice_c.includes(search) ||
      q.choice_d.includes(search);
    return matchType && matchSearch;
  });

  const totalPagesQ = Math.ceil(filteredQuestions.length / navQuestions.itemsPerPage);
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

  const totalPagesS = Math.ceil(filteredStudents.length / navStudents.itemsPerPage);
  const startIndexS = (navStudents.currentPage - 1) * navStudents.itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndexS, startIndexS + navStudents.itemsPerPage);

  return (
    <div className="admin-dashboard">
      <Navbar />

      <main className="admin-content">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate("/admin/exams")}>←</button>
          <h2 className="page-title">New Exam</h2>
        </div>

        {/* FORM EXAM INFO */}
        <form className="exam-form" onSubmit={handleSubmit}>
          <label className="form-label">Exam Title</label>
          <input
            type="text"
            placeholder="Title of the exam"
            name="exam_title"
            className="input-full"
            value={form.exam_title}
            onChange={(e) => {
              setForm({
                ...form,
                exam_title: e.target.value,
              });
            }}
          />

          <div className="form-row" style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <div style={{ flex: 1 }}>
              <label className="form-label">Start Schedule</label>
              <input
                type="datetime-local"
                name="start_datetime"
                className="input-full"
                value={form.start_datetime}
                onChange={(e) => {
                  setForm({
                    ...form,
                    start_datetime: e.target.value,
                  });
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="form-label">End Schedule</label>
              <input
                type="datetime-local"
                name="end_datetime"
                className="input-full"
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
          <h3>
            ADD QUESTIONS {" "}
            {form.questions.length > 0 && (
              <span>({form.questions.length} selected)</span>
            )}
          </h3>
          <div className="table-controls">
            <label>Show
              <select
                value={navQuestions.itemsPerPage}
                onChange={(e) => setNavQuestions({
                  ...navQuestions,
                  itemsPerPage: Number(e.target.value),
                })}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select> items
            </label>

            <label>
              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                <option value="All">All Types</option>
                <option value="Grammar">Grammar</option>
                <option value="Reading">Reading</option>
                <option value="Listening">Listening</option>
              </select>
            </label>

            <input
              type="text"
              placeholder="🔍 Search questions"
              value={navQuestions.searchTerm}
              onChange={(e) => setNavQuestions({...navQuestions, searchTerm: e.target.value})}
            />
          </div>

          <table className="exam-table">
            <thead>
              <tr>
                <th>
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
                <th>Type</th>
                <th>Question</th>
                <th>Answer Choices</th>
              </tr>
            </thead>
            <tbody>
              {currentQuestions.length > 0 ? (
                currentQuestions.map((q) => {
                  let answerText = q.answers.join(", ");
                  
                  return (
                    <tr key={q.question_id}>
                      <td>
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
                    </tr>
                  );
                })
              ) : null}
            </tbody>
          </table>
          <div className="pagination">
            <p className="pagination-info">
              Showing {startIndexQ + 1} to {Math.min(startIndexQ + navQuestions.itemsPerPage, filteredQuestions.length)} {" "}
              out of {questions.length} questions
            </p>
            <div className="page-buttons">
              <button
                type="button"
                className="page-btn"
                onClick={() => setNavQuestions({
                  ...navQuestions,
                  currentPage: 1,
                })}
                disabled={navQuestions.currentPage === 1}
              >
                <FaAngleDoubleLeft />
              </button>
              <button
                type="button"
                className="page-btn"
                onClick={() => setNavQuestions((prev) => {
                  return {
                    ...navQuestions,
                    currentPage: Math.max(prev.currentPage - 1, 1)
                  }
                })}
                disabled={navQuestions.currentPage === 1}
              >
                <FaAngleLeft />
              </button>
              {Array.from({ length: totalPagesQ }, (_, i) => (
                <button
                  type="button"
                  key={i + 1}
                  className={`page-btn ${navQuestions.currentPage === i + 1 ? "active" : ""}`}
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
                className="page-btn"
                onClick={() => setNavQuestions((prev) => {
                  return {
                    ...navQuestions,
                    currentPage: Math.min(prev.currentPage + 1, totalPagesQ)
                  }
                })}
                disabled={navQuestions.currentPage === totalPagesQ}
              >
                <FaAngleRight />
              </button>
              <button
                type="button"
                className="page-btn"
                onClick={() => setNavQuestions({
                  ...navQuestions,
                  currentPage: totalPagesQ,
                })}
                disabled={navQuestions.currentPage === totalPagesQ}
              >
                <FaAngleDoubleRight />
              </button>
            </div>
          </div>

          {/* ADD STUDENTS */}
          <h3>
            ADD STUDENTS {" "}
            {form.students.length > 0 && (
              <span>({form.students.length} selected)</span>
            )}
          </h3>
          <div className="table-controls">
            <label>Show
              <select
                value={navStudents.itemsPerPage}
                onChange={(e) => setNavStudents({
                  ...navStudents,
                  itemsPerPage: Number(e.target.value),
                })}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select> items
            </label>
            <input
              type="text"
              placeholder="🔍 Search students"
              value={navStudents.searchTerm}
              onChange={(e) => setNavStudents({...navStudents, searchTerm: e.target.value})}
            />
          </div>

          <table className="exam-table">
            <thead>
              <tr>
                <th>
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
                <th>NIM</th>
                <th>Full Name</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.length > 0 ? (
                currentStudents.map((s) => (
                  <tr key={s.nim}>
                    <td>
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
                    <td>{s.nim}</td>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                  </tr>
                ))
              ) : null}
            </tbody>
          </table>
          <div className="pagination">
            <p className="pagination-info">
              Showing {startIndexS + 1} to {Math.min(startIndexS + navStudents.itemsPerPage, filteredStudents.length)} {" "}
              out of {students.length}
            </p>
            <div className="page-buttons">
              <button
                type="button"
                className="page-btn"
                onClick={() => setNavStudents({
                  ...navStudents,
                  currentPage: 1,
                })}
                disabled={navStudents.currentPage === 1}
              >
                <FaAngleDoubleLeft />
              </button>
              <button
                type="button"
                className="page-btn"
                onClick={() => setNavStudents((prev) => {
                  return {
                    ...navStudents,
                    currentPage: Math.max(prev.currentPage - 1, 1)
                  }
                })}
                disabled={navStudents.currentPage === 1}
              >
                <FaAngleLeft />
              </button>
              {Array.from({ length: totalPagesS }, (_, i) => (
                <button
                  type="button"
                  key={i + 1}
                  className={`page-btn ${navStudents.currentPage === i + 1 ? "active" : ""}`}
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
                className="page-btn"
                onClick={() => setNavStudents((prev) => {
                  return {
                    ...navStudents,
                    currentPage: Math.min(prev.currentPage + 1, totalPagesS)
                  }
                })}
                disabled={navStudents.currentPage === totalPagesS}
              >
                <FaAngleRight />
              </button>
              <button
                type="button"
                className="page-btn"
                onClick={() => setNavStudents({
                  ...navStudents,
                  currentPage: totalPagesS,
                })}
                disabled={navStudents.currentPage === totalPagesS}
              >
                <FaAngleDoubleRight />
              </button>
            </div>
          </div>
          
          <button type="submit" className="add-btn">Add Exam</button>
        </form>
      </main>
    </div>
  );
}

export default AddExamPage;
