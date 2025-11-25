import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaAngleLeft, FaAngleRight, FaChevronDown, FaChevronLeft, FaFilter } from "react-icons/fa";
import Navbar from "../Components/Navbar";
import axios from "axios";
import { config } from "../../data/config";
import GrammarUnderline from "../Components/GrammarUnderline";

function AddExamPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = location.state?.isEdit || false;
  const editExam = location.state?.exam || null;
  const oldExamMode = location.state?.mode || "online"

  const [selectedType, setSelectedType] = useState("All");
  const [examMode, setExamMode] = useState(oldExamMode);

  const [navQuestions, setNavQuestions] = useState({
    itemsPerPage: 10,
    currentPage: 1,
    searchTerm: "",
  });

  const [questions, setQuestions] = useState([]);
  const [students, setStudents] = useState([]);

  const [openedBatch, setOpenedBatch] = useState([]);

  const [form, setForm] = useState(() => ({
    exam_title: editExam?.exam_title || "",
    start_datetime: editExam?.start_datetime?.slice(0, 16) || "",
    end_datetime: editExam?.end_datetime?.slice(0, 16) || "",
    room_name: editExam?.room_name || "",
    quota: editExam?.total_quota || 0,
    questions: Array.isArray(editExam?.questions) ? editExam?.questions : [],
    students: Array.isArray(editExam?.students)
      ? editExam?.students.filter((s) => s && s.nim).map((s) => s.nim)
      : [],
  }));

  const getQuestions = async () => {
    try {
      const response = await axios.get(
        `${config.BACKEND_URL}/api/admin/questions`,
        { withCredentials: true },
      );

      setQuestions(response.data.map((b, index) => {
        const batchQuestions = b.questions.map((q, idx) => {
          return {
            ...q,
            answers: [q.choice_a, q.choice_b, q.choice_c, q.choice_d],
          };
        });

        return {...b, questions: batchQuestions};
      }));
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  }

  const getExamStudents = async (examId) => {
    try {
      const response = await axios.get(
        `${config.BACKEND_URL}/api/admin/exams/${examId}/students`,
        { withCredentials: true }
      );

      // ✅ Set hasil data students ke state
      setStudents(response.data || []);
    } catch (error) {
      console.error("Error fetching students for exam:", error);
    }
  };

  const createExam = async (exam) => {
    console.log(exam);

    if (examMode === "online") {
      const { students, ...examData } = exam;
      
      try {
        await axios.post(
          `${config.BACKEND_URL}/api/admin/exams`,
          examData,
          { withCredentials: true }
        );
      } catch (e) {
        console.error("Failed to create exam:", e);
      }
    } else {
      const cleanStudents = (form.students || []).filter(
        (nim) =>
          nim &&
          nim !== "undefined" &&
          typeof nim === "string" &&
          nim.trim() !== ""
      );

      try {
        await axios.post(
          `${config.BACKEND_URL}/api/admin/exams/offline`,
          {
            exam_title: form.exam_title,
            start_datetime: form.start_datetime,
            end_datetime: form.end_datetime,
            room_name: form.room_name,
            quota: parseInt(form.quota || 0),
            students: cleanStudents,
          },
          { withCredentials: true }
        );
      } catch (e) {
        console.error("Failed to create exam:", e);
      }
    }
  }

  const updateExam = async (id, exam) => {
    console.log(id, exam);

    if (examMode === "online") {
      try {
        await axios.put(
          `${config.BACKEND_URL}/api/admin/exams/${id}`,
          exam,
          { withCredentials: true },
        );
      } catch (e) {
        console.error("Failed to update exam:", e);
      }
    } else {
      const cleanStudents = (form.students || []).filter(
        (nim) =>
          nim &&
          nim !== "undefined" &&
          typeof nim === "string" &&
          nim.trim() !== ""
      );

      if (exam.quota <= 0) {
        console.error("Exam quota is not a valid number of students.");
        return;
      }

      try {
        await axios.put(
        `${config.BACKEND_URL}/api/admin/exams/offline/${id}`,
          {
            exam_title: exam.exam_title,
            start_datetime: exam.start_datetime,
            end_datetime: exam.end_datetime,
            room_name: exam.room_name,
            quota: exam.quota || 0,
            students: cleanStudents,
          },
          { withCredentials: true }
        );
      } catch (e) {
        console.error("Failed to update exam:", e);
      }
    }
  } 

  // Ambil data pertanyaan & students dari localStorage
  useEffect(() => {
    getQuestions();

    // Jika mode edit, ambil juga data students
    if (isEdit && editExam?.exam_id) {
      getExamStudents(editExam.exam_id);
    }
  }, [isEdit, editExam]);
  
  // Saat edit exam offline, isi form dengan data dari backend
  useEffect(() => {
    if (isEdit && editExam) {
      if (editExam.exam_id && editExam.room_name) {
        // mode offline
        setExamMode("offline");
        setForm({
          exam_id: editExam.exam_id,
          exam_title: editExam.exam_title,
          start_datetime: formatToLocalDateInput(editExam.start_datetime),
          end_datetime: formatToLocalDateInput(editExam.end_datetime),
          
          room_name: editExam.room_name,
          quota: editExam.total_quota || 0,
          students: editExam.students
            ? editExam.students
                .map((s) => {
                  if (!s) return null;
                  if (typeof s === "object" && s.nim) return String(s.nim);
                  if (typeof s === "string" || typeof s === "number") return String(s);
                  return null;
                })
                .filter(Boolean)
              : [],
          });
      } else {
        // mode online
        setExamMode("online");
        setForm({
          exam_id: editExam.exam_id,
          exam_title: editExam.exam_title,
          start_datetime: formatToLocalDateInput(editExam.start_datetime),
          end_datetime: formatToLocalDateInput(editExam.end_datetime),
          questions: editExam.questions || [],
          students: Array.from(
            new Set(
              (editExam.students || [])
                .map((s) => {
                  if (!s) return null;
                  if (typeof s === "object" && s.nim) return String(s.nim);
                  if (typeof s === "string" || typeof s === "number") return String(s);
                  return null;
                })
                .filter(Boolean)
            )
          )
        });
      }
    }
  }, [isEdit, editExam]);

  useEffect(() => {
    // Normalisasi ulang setiap kali editExam dimuat ulang
    setForm((prev) => ({
      ...prev,
      students: Array.from(new Set((prev.students || []).map(String))),
    }));
  }, [students]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEdit) {
        updateExam(editExam.exam_id, form);
      } else {
        createExam(form);
      }

      navigate("/admin/exams");
    } catch (err) {
      console.error("❌ Failed to submit exam:", err);
      alert("Failed to submit exam. Please check console or backend logs.");
    }
  };


  const formatToLocalDateInput = (dateString) => {
    if (!dateString) return "";

  // Data dari backend sudah dalam WIB (lokal),
  // jadi cukup ubah spasi jadi 'T' agar sesuai dengan format input datetime-local
  return dateString.replace(" ", "T").slice(0, 16);
  };


  // Filter pertanyaan berdasarkan jenis soal dan kata kunci
  const filteredQuestions = questions.filter((b) => {
    const search = navQuestions.searchTerm.toLowerCase();

    const matchSearch =
      b.batch_id.toString().includes(search) ||
      b.batch_text.toLowerCase().includes(search);

    const matchType =
      selectedType === "All" || b.batch_type.toLowerCase() === selectedType.toLowerCase();

    return matchSearch && matchType;
  });

  const refilterQuestions = (search, type) => {
    /*
      Functions identically to initial filteredQuestions if no arguments were given.
    */
    const s = search !== null && search !== undefined ? search : navQuestions.searchTerm;

    const t = type !== null && type !== undefined ? type : selectedType;

    return questions.filter((b) => {
      const search = s.toLowerCase();
      
      const matchType = t === "All" || b.batch_type.toLowerCase() === t.toLowerCase();

      const matchSearch =
        b.batch_id.toString().includes(search) ||
        b.batch_text.toLowerCase().includes(search);
      
      return matchSearch && matchType;
    });
  }

  const totalPagesQ = Math.max(Math.ceil(filteredQuestions.length / navQuestions.itemsPerPage), 1);
  const startIndexQ = (navQuestions.currentPage - 1) * navQuestions.itemsPerPage;
  const currentQuestions = filteredQuestions.slice(startIndexQ, startIndexQ + navQuestions.itemsPerPage);

  // Jika edit exam, tampilkan hanya students yang sudah ikut di exam
  const baseStudents = isEdit
    ? students.filter((s) => form.students.includes(String(s.nim)))
    : students;

  const formatText = (questionText) => {
    const letters = ["A", "B", "C", "D"];
    let letterIndex = 0;

    const regex = /__([^_]+?)__/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(questionText)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span>{questionText.slice(lastIndex, match.index)}</span>);
      }

      const letter = letters[letterIndex++] || "?";
      
      parts.push(
        <GrammarUnderline contentLetter={letter} text={match[1]} />
      )

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < questionText.length) {
      parts.push(<span>{questionText.slice(lastIndex)}</span>);
    }

    return (<>
      {parts}
    </>);
  }

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

        <div className="mb-4">
          <label className="text-sm text-tec-darker font-semibold select-none mr-2">
            EXAM TYPE
          </label>
          <select
            value={examMode}
            onChange={(e) => setExamMode(e.target.value)}
            disabled={isEdit && editExam}
            className="border-2 border-slate-300 rounded-lg px-3 py-2 focus:border-tec-light
              disabled:bg-slate-200 disabled:text-slate-900"
          >
            <option value="online">Online Exam</option>
            <option value="offline">Offline Exam</option>
          </select>
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

          {examMode === "offline" && (
            <>
              <div className="flex gap-4 mt-2">
                <div className="flex-1">
                  <label className="text-sm text-tec-darker font-semibold select-none" htmlFor="room_name">ROOM NAME</label>
                  <input
                    type="text"
                    id="room_name"
                    name="room_name"
                    placeholder="e.g. Lab A101"
                    className="w-full px-3 py-2 mb-4 border-2 border-slate-300 focus:outline-none hover:border-tec-light
                      focus:border-tec-light rounded-lg"
                    value={form.room_name}
                    onChange={(e) =>
                      setForm({ ...form, room_name: e.target.value })
                    }
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm text-tec-darker font-semibold select-none" htmlFor="quota">QUOTA</label>
                  <input
                    type="number"
                    id="quota"
                    name="quota"
                    placeholder="e.g. 30"
                    className="w-full px-3 py-2 mb-4 border-2 border-slate-300 focus:outline-none hover:border-tec-light
                      focus:border-tec-light rounded-lg"
                    value={form.quota}
                    onChange={(e) =>
                      setForm({ ...form, quota: e.target.value })
                    }
                  />
                </div>
              </div>
            </>
          )}

          {examMode === "online" && (
          <>
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
                  {<th className="w-1/12 px-4 py-3 border-x-2 border-white border-l-tec-darker">
                    <input
                    type="checkbox"
                    name="all_questions"
                    // centang jika SEMUA batch terpilih
                    checked={questions.length > 0 && questions.every(b => form.questions.includes(b.batch_id))}
                    // tampilkan state indeterminate jika sebagian terpilih
                    ref={el => {
                      if (!el) return;
                      const someSelected =
                        form.questions.length > 0 &&
                        !questions.every(b => form.questions.includes(b.batch_id));
                      el.indeterminate = someSelected;
                    }}
                    onChange={(e) => {
                      if (e.target.checked) {
                        // pilih semua batch
                        const allBatchIDs = questions.map(b => b.batch_id);
                        setForm(prev => ({ ...prev, questions: allBatchIDs }));
                      } else {
                        // kosongkan pilihan
                        setForm(prev => ({ ...prev, questions: [] }));
                      }
                    }}
                    disabled={questions.length === 0}
                  />
                  </th>}
                  <th className="w-1/12 px-4 py-3 border-x-2 border-white">Type</th>
                  <th className="w-5/12 px-4 py-3 border-x-2 border-white">Question</th>
                  <th className="w-5/12 px-4 py-3 border-x-2 border-white border-r-tec-darker">Answer Choices</th>
                </tr>
              </thead>
              {currentQuestions.length > 0 ? (
                currentQuestions.map((b, idx) => {
                  const batchText = b.batch_text.trim().length > 0 ? b.batch_text.trim() : "- No question batch text -"

                  return (
                    <>
                      <thead key={`batch-${b.batch_id}`}>
                        <tr className="bg-tec-dark text-white text-center font-semibold">
                          <td className="w-1/12 px-4 py-3 border-x-2 border-t-2 border-white border-l-tec-darker">
                            <input
                              type="checkbox"
                              checked={form.questions.includes(b.batch_id)}
                              onChange={() => {
                                setForm(prevForm => {
                                  const alreadySelected = prevForm.questions.includes(b.batch_id);
                                  const next = alreadySelected
                                    ? prevForm.questions.filter(id => id !== b.batch_id)
                                    : [...prevForm.questions, b.batch_id];
                                  return { ...prevForm, questions: next };
                                });
                              }}
                            />
                          </td>
                          <td className="w-1/12 px-4 py-3 border-x-2 border-t-2 border-white">
                            {b.batch_type[0].toUpperCase() + b.batch_type.slice(1)}
                          </td>
                          <td
                            className="w-5/12 px-4 py-3 border-x-2 border-t-2 border-white cursor-pointer text-left"
                            onClick={() => {
                              if (openedBatch.includes(b.batch_id)) {
                                const newOpened = openedBatch.filter((v, i) => v !== b.batch_id);

                                setOpenedBatch(newOpened);
                              } else {
                                const newOpened = [...openedBatch, b.batch_id].sort((a, b) => (a - b));

                                setOpenedBatch(newOpened);
                              }
                            }}
                            colSpan="2">
                            <div className="flex flex-1 justify-between">
                              <div>
                                <div className={`${b.batch_text.trim().length > 0 ? "" : "italic"}`}>
                                  {openedBatch.includes(b.batch_id) ? (
                                    batchText
                                  ) : (
                                    batchText.length > 200 ? batchText.slice(0, 260).trim() + "..." : batchText
                                  )}
                                </div>
                                {b.audio_path ? (
                                  <audio controls src={`${config.BACKEND_URL}/audio/${b.audio_path}`} />
                                ) : null}
                              </div>
                              <div className="mx-1">
                                <FaChevronDown className={`w-6 h-6 ${openedBatch.includes(b.batch_id) ? "rotate-180" : ""}`} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      </thead>
                      {openedBatch.includes(b.batch_id) ? (
                        b.questions.map((q, i) => {
                          let answerText = q.answers.join(", ");
                          let limit = 140;

                          const isOdd = i % 2 === 1;

                          const regex = /__([^_]+?)__/g;

                          // This will be used to determine the length of the question text
                          const questionText = q.question_text.replace(regex, (match, extract) => {
                            return `${extract}`;
                          }).trim();

                          // Get the number of characters removed by the regex up to a certain point
                          let removedChars = 0;
                          let match;

                          while ((match = regex.exec(q.question_text)) !== null) {
                            // console.log(match, match.index);
                            if (match.index <= limit + removedChars) {
                              if (match.index + match[0].length > limit + removedChars) {
                                removedChars += match[0].length - (limit + removedChars - match.index);
                              } else {
                                removedChars += match[0].length - match[1].length;
                              }
                            } else {
                              break;
                            }
                          }

                          return (
                            <tbody key={`question-${q.question_id}`}>
                              <tr className={`${isOdd ? "bg-slate-200" : "bg-white"} hover:bg-slate-300 text-sm`}>
                                <td className="px-4 py-1 border-2 border-slate-400 text-center">{q.question_id}</td>
                                <td className="px-4 py-1 border-2 border-slate-400 text-sm/8" colSpan="2">
                                  {
                                    questionText.length > limit ? (
                                      <>
                                        {formatText(q.question_text.slice(0, limit + removedChars).trim())}
                                        <span>...</span>
                                      </>
                                    ) : (
                                      formatText(q.question_text)
                                    )
                                  }
                                </td>
                                <td className="px-4 py-1 border-2 border-slate-400" colSpan="2">
                                  {answerText.length > limit ? answerText.slice(0, limit).trim() + "..." : answerText}
                                </td>
                              </tr>
                            </tbody>
                          )
                        }
                      )) : null}
                    </>
                  );
                })
              ) : null}
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
          </>
        )}

          {/* SHOW STUDENTS SECTION ONLY IN EDIT MODE */}
          {isEdit && (
            <>
              <h3 className="text-lg text-tec-dark font-semibold mt-4">
                ENROLLED STUDENTS{" "}
                {form.students.length > 0 && (
                  <span>({form.students.length})</span>
                )}
              </h3>

              <div className="flex items-center justify-between mt-2 mb-4 gap-4 flex-wrap text-sm">
                <div>
                  <label htmlFor="items-per-page-s" className="font-medium">Show</label>
                  <select>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <label htmlFor="items-per-page-s" className="font-medium">items</label>
                </div>
              </div>

              {/* TABLE OF STUDENTS (READ-ONLY IN EDIT MODE) */}
              <table className="w-full border-collapse mb-4 text-sm">
                <thead>
                  <tr className="bg-tec-darker text-white text-center font-bold">
                    <th className="w-1/12 px-4 py-3 border-x-2 border-white border-l-tec-darker">#</th>
                    <th className="w-2/12 px-4 py-3 border-x-2 border-white">NIM</th>
                    <th className="w-5/12 px-4 py-3 border-x-2 border-white">Full Name</th>
                    <th className="w-4/12 px-4 py-3 border-x-2 border-white border-r-tec-darker">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {baseStudents.length > 0 ? (
                    baseStudents.map((s, idx) => {
                      const isOdd = idx % 2 === 1;
                      return (
                        <tr key={s.nim} className={`${isOdd ? "bg-slate-200" : "bg-white"} hover:bg-slate-300`}>
                          <td className="px-4 py-2 border-2 border-slate-400 text-center">{idx + 1}</td>
                          <td className="px-4 py-2 border-2 border-slate-400 text-center">{s.nim}</td>
                          <td className="px-4 py-2 border-2 border-slate-400">{s.name}</td>
                          <td className="px-4 py-2 border-2 border-slate-400">{s.email}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan="4" className="text-center py-3">No students enrolled.</td></tr>
                  )}
                </tbody>
              </table>
            </>
          )}
          
          <button
            type="submit"
            className="bg-tec-darker hover:bg-tec-dark text-white py-2 px-5 font-bold
              rounded-lg flex items-center gap-2 mt-5 cursor-pointer"
          >
            {isEdit
              ? `Save Changes (${examMode === "online" ? "Online" : "Offline"})`
              : `Add ${examMode === "online" ? "Online" : "Offline"} Exam`}
          </button>
        </form>
      </main>
    </div>
  );
}

export default AddExamPage;
