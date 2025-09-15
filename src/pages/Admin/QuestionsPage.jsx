import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaFilter, FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight, FaPlus, FaChevronDown } from "react-icons/fa";
import { config } from "../../data/config";
import axios from "axios";
import ModalConfirmDelete from "../Components/ModalConfirmDelete";
import Navbar from "../Components/Navbar";
import Loading from "../Components/Loading";
import GrammarUnderline from "../Components/GrammarUnderline";

function QuestionsPage() {
  const navigate = useNavigate();

  const [questionBatches, setQuestionBatches] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [showConfirm, setShowConfirm] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [finishedLoading, setFinishedLoading] = useState(false);

  const [openedBatch, setOpenedBatch] = useState([]);

  // Read-Delete Questions
  // Create-Update on AddQuestionPage.jsx
  const getQuestions = async () => {
    try {
      const token = localStorage.getItem("jwtToken");

      const response = await axios.get(`${config.BACKEND_URL}/api/admin/questions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setQuestionBatches(response.data.map((b, index) => {
        const batchQuestions = b.questions.map((q, idx) => {
          return {
            ...q,
            answers: [q.choice_a, q.choice_b, q.choice_c, q.choice_d],
          };
        });

        return {...b, questions: batchQuestions};
      }));
      setFinishedLoading(true);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setFinishedLoading(true);
    }
  }

  const deleteQuestion = async (questionId) => {
    try {
      const token = localStorage.getItem("jwtToken");

      const response = await axios.delete(`${config.BACKEND_URL}/api/admin/questions/${questionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setShowConfirm(false);
        

        setQuestionBatches((prevQuestions) =>
          prevQuestions.filter((question) => question.question_id !== questionId)
        );
        await getQuestions();
      }
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  }

  useEffect(() => {
    // GET questions data
    getQuestions();
  }, []);

  // console.log(questionBatches);
  // console.log(openedBatch);

  const filteredBatches = questionBatches.filter((b) => {
    const search = searchTerm.toLowerCase();
    const matchSearch = false;
    /*
    const matchSearch =
      q.question_id.toString().includes(search) ||
      q.question_type.toLowerCase().includes(search) ||
      q.question_text.toLowerCase().includes(search) ||
      q.choice_a.includes(search) ||
      q.choice_b.includes(search) ||
      q.choice_c.includes(search) ||
      q.choice_d.includes(search);
    */

    const matchType =
      selectedType === "All Types" || q.question_type.toLowerCase() === selectedType.toLowerCase();

    return matchType;
  });

  const refilterBatches = (search, type) => {
    const s = search !== null ? search : searchTerm;

    const t = type !== null ? type : selectedType;

    return questionBatches.filter((q) => {
      const search = s.toLowerCase();
      
      const matchType = t === "All Types" || q.question_type.toLowerCase() === t.toLowerCase();
      const matchSearch = false;
      /*
        const matchSearch =
          q.question_type.toLowerCase().includes(search) ||
          q.question_text.toLowerCase().includes(search) ||
          q.choice_a.includes(search) ||
          q.choice_b.includes(search) ||
          q.choice_c.includes(search) ||
          q.choice_d.includes(search);
      */
      
      return matchType;
    });
  }

  const totalPages = Math.max(Math.ceil(filteredBatches.length / itemsPerPage), 1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentQuestionBatches = filteredBatches.slice(startIndex, startIndex + itemsPerPage);

  const confirmDelete = (index) => {
    setToDelete(index);
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    const questionID = toDelete.batch_id;

    deleteQuestion(questionID);
  };

  const handleEdit = (question) => {
    // console.log(question);

    navigate("/admin/questions/edit", { state: { question: question, isEdit: true } });
  };

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
        <h2 className="text-4xl mb-5 text-tec-darker font-bold">All Question Batches</h2>

        <div className="flex justify-between items-center mb-5">
          <button
            className="bg-tec-darker hover:bg-tec-dark text-white py-2 px-5 font-bold
              rounded-lg flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/admin/questions/add")}
          >
            <FaPlus /> Add a Question Batch
          </button>

          <div className="flex items-center flex-wrap gap-2">
            <select
              className="text-tec-darker border-2 border-tec-darker hover:border-tec-light focus:outline-none
                focus:border-tec-light px-2 py-1 rounded-lg mx-1.5 font-medium"
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);

                const newFilteredQuestions = refilterBatches(null, e.target.value);

                // needs recalculated because filteredBatches changed
                const newTotalPages = Math.max(Math.ceil(newFilteredQuestions.length / itemsPerPage), 1);

                if (currentPage > newTotalPages) {
                  setCurrentPage(newTotalPages);
                }
              }}
            >
              <option value="All Types">All Types</option>
              <option value="Grammar">Grammar</option>
              <option value="Reading">Reading</option>
              <option value="Listening">Listening</option>
            </select>

            <div>
              <label htmlFor="items_per_page" className="font-medium">Show</label>
              <select
                id="items_per_page"
                className="text-tec-darker border-2 border-tec-darker hover:border-tec-light focus:outline-none
                focus:border-tec-light px-2 py-1 rounded-lg mx-1.5 font-medium"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));

                  const newFilteredQuestions = refilterBatches(null, null);

                  const newTotalPages = Math.max(Math.ceil(newFilteredQuestions.length / Number(e.target.value)), 1);

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
              placeholder="🔍 Search questions"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);

                const newFilteredQuestions = refilterBatches(e.target.value, null);

                const newTotalPages = Math.max(Math.ceil(newFilteredQuestions.length / itemsPerPage), 1);

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
              <th className="w-1/12 px-4 py-3 border-x-2 border-white">Type</th>
              <th className="w-5/12 px-4 py-3 border-x-2 border-white">Batch/Question Text</th>
              <th className="w-4/12 px-4 py-3 border-x-2 border-white">Answer Choices</th>
              <th className="w-1/12 px-4 py-3 border-x-2 border-white border-r-tec-darker">Actions</th>
            </tr>
          </thead>
          {
            finishedLoading && currentQuestionBatches.length > 0 ? (
              currentQuestionBatches.map((b, idx) => {
                const batchText = b.batch_text.trim().length > 0 ? b.batch_text.trim() : "- No question batch text -"

                return (
                  <>
                    <thead key={`batch-${b.batch_id}`}>
                      <tr className="bg-tec-dark text-white text-center font-semibold">
                        <td className="w-1/12 px-4 py-3 border-x-2 border-t-2 border-white border-l-tec-darker">
                          {b.batch_id}
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
                          colSpan="2"
                        >
                          <div className="flex flex-1 justify-between">
                            <div>
                              <div className={`${b.batch_text.trim().length > 0 ? "" : "italic"} mb-1`}>
                                {openedBatch.includes(b.batch_id) ? (
                                  batchText
                                ) : (
                                  batchText.length > 200 ? batchText.slice(0, 200).trim() + "..." : batchText
                                )}
                              </div>
                              {b.audio_path ? (
                                <audio controls src={`${config.BACKEND_URL}/audio/${b.audio_path}`} />
                              ) : null}
                            </div>
                            <div className="mx-1">
                              <FaChevronDown className={`w-6 h-6 motion-safe:transition duration-200 ease-in ${openedBatch.includes(b.batch_id) ? "rotate-180" : ""}`} />
                            </div>
                          </div>
                        </td>
                        <td className="w-1/12 px-4 py-1 border-x-2 border-t-2 border-white border-r-tec-darker">
                          <button
                            className="bg-amber-500 hover:bg-orange-600 mr-1 p-2 rounded-lg cursor-pointer"
                            onClick={() => handleEdit(b)}
                          >
                            <FaEdit className="w-4 h-4 text-white" />
                          </button>
                          <button
                            className="bg-red-500 hover:bg-red-600 cursor-pointer disabled:cursor-not-allowed
                              p-2 rounded-lg disabled:bg-slate-500"
                            onClick={() => confirmDelete(b)}
                          >
                            <FaTrash className="w-4 h-4 text-white" />
                          </button>
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
                          //console.log(match, match.index);
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
            ) : (
              <tbody>
                <tr>
                  <td colSpan="5" className="px-4 py-3 border-2 border-slate-400 text-center">
                    {finishedLoading ? "No questions found." : (
                      <Loading text={"Loading questions..."} useSmall={true} />
                    )}
                  </td>
                </tr>
              </tbody>
            )
          }
          {/*
            finishedLoading && currentQuestionBatches.length > 0 ? (
              currentQuestionBatches.map((q, idx) => {
              let answerText = q.answers.join(", ");
              let limit = 112;

              const isOdd = idx % 2 === 1;

              const regex = /__([^_]+?)__/g;

              // This will be used to determine the length of the question text
              const questionText = q.question_text.replace(regex, (match, extract) => {
                return `${extract}`;
              }).trim();

              // Get the number of characters removed by the regex up to a certain point
              let removedChars = 0;
              let match;

              while ((match = regex.exec(q.question_text)) !== null) {
                console.log(match, match.index);
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
                <tr
                  key={q.question_id}
                  className={`${isOdd ? "bg-slate-200" : "bg-white"} hover:bg-slate-300`}
                >
                  <td className="px-4 py-2 border-2 border-slate-400 text-center">{q.question_id}</td>
                  <td className="px-4 py-2 border-2 border-slate-400">{q.question_type[0].toUpperCase() + q.question_type.slice(1)}</td>
                  <td className="px-4 py-2 border-2 border-slate-400 text-justify text-ellipsis text-base/8" title={questionText}>
                    {q.audio_path ? (
                      <audio controls src={`${config.BACKEND_URL}/audio/${q.audio_path}`} />
                    ) : null}
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
                  <td className="px-4 py-2 border-2 border-slate-400 text-justify text-ellipsis" title={answerText}>
                    {answerText.length > 85 ? answerText.slice(0, 85).trim() + "..." : answerText}
                  </td>
                  <td className="px-4 py-2 border-2 border-slate-400 text-center">
                    <button
                      className="bg-amber-500 hover:bg-orange-600 mr-1 p-2 rounded-lg cursor-pointer"
                      onClick={() => handleEdit(q)}
                    >
                      <FaEdit className="w-4 h-4 text-white" />
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 cursor-pointer disabled:cursor-not-allowed
                        p-2 rounded-lg disabled:bg-slate-500"
                      onClick={() => confirmDelete(q)}
                    >
                      <FaTrash className="w-4 h-4 text-white" />
                    </button>
                  </td>
                </tr>
            )})) : (
              <tr>
                <td colSpan="5" className="px-4 py-3 border-2 border-slate-400 text-center">
                  {finishedLoading ? "No questions found." : (
                    <Loading text={"Loading questions..."} useSmall={true} />
                  )}
                </td>
              </tr>
            )
          */}
        </table>

        <div className="flex justify-between">
          <p className="text-slate-600 font-semibold">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredBatches.length)} out of {" "}
              {searchTerm === "" && selectedType === "All Types"
                ? questionBatches.length
                : `${filteredBatches.length} (filtered out of ${questionBatches.length} total entries)`}
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
          message="Are you sure you want to delete this question? This action cannot be undone."
        />
      )}
    </div>
  );
}

export default QuestionsPage;
