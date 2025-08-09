import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { config } from "../../data/config";
import ProgressBar from "../Components/ProgressBar";
import Navbar from "../Components/Navbar";
import { FaChevronLeft, FaPlus, FaTrash } from "react-icons/fa";
import GrammarUnderline from "../Components/GrammarUnderline";

function AddQuestionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = location.state?.isEdit || false;
  const editQuestion = location.state?.question || null;

  const [type, setType] = useState(editQuestion != null ? editQuestion.question_type : "");
  const [batchText, setBatchText] = useState(editQuestion != null ? editQuestion.question_text : "");
  const [audioFile, setAudioFile] = useState(null);

  const [questions, setQuestions] = useState([]);

  const [uploadProgress, setUploadProgress] = useState(0);

  // Create-Update Questions
  // Read-Delete on QuestionsPage.jsx
  const createQuestionBatch = async (question, onProgress) => {
    const token = localStorage.getItem("jwtToken");

    try {
      await axios.post(`${config.BACKEND_URL}/api/admin/questions`, question, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      });

      navigate("/admin/questions");
    } catch (e) {
      if (onProgress) onProgress(0);

      console.error("Failed to add question:", e);
    }
  }

  const updateQuestionBatch = async (id, question, onProgress) => {
    const token = localStorage.getItem("jwtToken");

    try {
      await axios.put(`${config.BACKEND_URL}/api/admin/questions/${id}`, question, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      });
      
      navigate("/admin/questions");
    } catch (e) {
      if (onProgress) onProgress(0);

      console.error("Failed to add question:", e);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    formData.append("questions", JSON.stringify(questions));

    setUploadProgress(0);

    if (questions.length === 0) {
      alert("Please add at least one question.");
      return;
    }

    if (isEdit) {
      updateQuestionBatch(editQuestion.question_id, formData, setUploadProgress);
    } else {
      createQuestionBatch(formData, setUploadProgress);
    }
  };

  const displayFormattingExample = (text) => {
    const letters = ["A", "B", "C", "D"];
    let letterIndex = 0;

    const regex = /__([^_]+?)__/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span>{text.slice(lastIndex, match.index)}</span>);
      }

      const letter = letters[letterIndex++] || "?";
      
      parts.push(
        <GrammarUnderline contentLetter={letter} text={match[1]} />
      )

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(<span>{text.slice(lastIndex)}</span>);
    }

    //console.log(parts);

    return (<>
      {parts}
    </>);
  }

  const addQuestion = () => {
    setQuestions([...questions, { question_text: "", choice_a: "", choice_b: "", choice_c: "", choice_d: "", answer: ""}]);
  }

  const handleReadCSVQuestions = (e) => {
    const file = e.target.files ? e.target.files[0] : null;

    if (file) {
      const filenameExtension = file.name.split(".").pop().toLowerCase();

      const allowedTypes = [
        "text/csv", // CSV
      ]

      // Check for file type and extension - Firefox workaround
      if (!allowedTypes.includes(file.type) && filenameExtension !== "csv") {
        alert("Please upload a valid CSV file.");
        e.target.value = "";
        return;
      }

      const reader = new FileReader();

      reader.onload = (event) => {
        const data = event.target.result;

        const toAdd = [];

        data.split("\n").forEach((line, idx) => {
          const [text, choice_a, choice_b, choice_c, choice_d, answer] = line.split(";").map(v => v.trim());

          if (idx === 0) {
            if (text !== "Text" || choice_a !== "ChoiceA" || choice_b !== "ChoiceB"
              || choice_c !== "ChoiceC" || choice_d !== "ChoiceD" || answer !== "Answer") {
                alert("Invalid CSV format. Please ensure the headers are correct: \nText;ChoiceA;ChoiceB;ChoiceC;ChoiceD;Answer");
                return;
            }
          } else {
            if (!text || !choice_a || !choice_b || !choice_c || !choice_d || !answer) {
              alert("Invalid CSV format. Please ensure all fields are filled.");
              return;
            }

            toAdd.push(
              {
                question_text: text.trim(),
                choice_a: choice_a.trim(),
                choice_b: choice_b.trim(),
                choice_c: choice_c.trim(),
                choice_d: choice_d.trim(),
                answer: answer.toLowerCase().trim(),
              }
            );
          }
        });

        if (toAdd.length > 0) {
          setQuestions([...questions, ...toAdd]);
        }
      }
      reader.readAsText(file);
      
    }
  }

  return (
    <div className="absolute bg-slate-50 w-full min-h-full h-auto">
      <Navbar />

      <main className="p-8">
        <div className="flex gap-2 items-baseline">
          <button
            className="text-tec-darker hover:text-tec-light cursor-pointer"
            onClick={() => navigate("/admin/questions")}
          >
            <FaChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-4xl mb-5 text-tec-darker font-bold">{isEdit ? "Edit Question Batch" : "New Question Batch"}</h2>
        </div>

        <form className="mb-10" onSubmit={handleSubmit}  encType="multipart/form-data">
          <label className="text-sm text-tec-darker font-semibold select-none">
            QUESTION BATCH TYPE <span className="text-red-600">*</span>
          </label>
          <div className="flex gap-6 mb-2">
            {[{type: "grammar", text: "Grammar"}, {type: "reading", text: "Reading"}, {type: "listening", text: "Listening"}].map((option) => (
              <div className="cursor-pointer">
                <input
                  type="radio"
                  className="mr-2"
                  name="batch_type"
                  value={option.type}
                  id={`batch_type ${option.type}`}
                  checked={type === option.type}
                  required
                  onChange={() => setType(option.type)}
                /> <label key={option.type} for={`batch_type ${option.type}`}>{option.text}</label>
              </div>
            ))}
          </div>

          {type === "listening" && (
            <>
              <label
                className="text-sm text-tec-darker font-semibold select-none"
                htmlFor="file"
              >
                UPLOAD AUDIO (LISTENING) <span className="text-red-600">*</span>
              </label>
              <input
                type="file"
                name="file"
                id="file"
                className="w-full px-3 py-1.5 mb-4 border-2 border-slate-300 focus:outline-none
                  hover:border-tec-light focus:border-tec-light rounded-lg file:bg-tec-darker
                  file:hover:bg-tec-dark file:text-white file:py-1 file:px-2.5 file:font-bold
                  file:rounded-lg file:text-sm file:mr-2"
                accept="audio/*"
                required
                onChange={(e) => setAudioFile(e.target.files[0])}
              />

              {uploadProgress > 0 && (
                <ProgressBar percentage={uploadProgress} />
              ) }
            </>
          )}

          <div className="mb-2">
            <label
              className="text-sm text-tec-darker font-semibold select-none"
              htmlFor="batch_text"
            >
              QUESTION BATCH TEXT {type !== "reading" ? "" : <span className="text-red-600">*</span>}
            </label>
            <textarea
              placeholder="Text of the question"
              className="resize-y min-h-25 w-full px-3 py-2 mb-2 border-2 border-slate-300
                focus:outline-none hover:border-tec-light focus:border-tec-light rounded-lg"
              name="batch_text"
              id="batch_text"
              required={type === "reading"}
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
            />

            {type === "grammar" && (
              <ul className="text-sm text-slate-600 font-semibold list-disc list-outside ml-4 mb-4">
                <li>
                  Use two underscores on each side (__like this__) to create an underline formatting for the {" "}
                  grammar section (includes the letters from A to D).
                </li>
              </ul>
            )}
          </div>

          {type === "grammar" && (
            <div className="mb-2">
              <label className="text-sm text-slate-600 font-semibold select-none">FORMATTING PREVIEW</label>
              <div>
                {batchText ? (
                  <div className="text-base text-black font-medium p-2 w-full overflow-hidden">
                    {displayFormattingExample(batchText)}
                  </div>
                ) : (
                  <p className="text-slate-400">-</p>
                )}
              </div>
            </div>
          )}

          <h3 className="text-lg text-tec-dark font-semibold">
            ADD QUESTIONS
          </h3>
          <div className="mt-2 mb-4">
            {questions.map((q, idx) => {
              return (
                <div className="grid grid-cols-12 gap-2 mb-2" key={idx}>
                  <div className="col-span-5 row-span-2">
                    <label
                      className="text-sm text-tec-darker font-semibold select-none"
                      htmlFor={`question_${idx}`}
                    >
                      QUESTION {idx + 1} TEXT {type === "listening" ? "" : <span className="text-red-600">*</span>}
                    </label>
                    <textarea
                      placeholder="Text of the question"
                      className="resize-y min-h-17 w-full px-3 py-2 mb-2 border-2 border-slate-300
                        focus:outline-none hover:border-tec-light focus:border-tec-light rounded-lg"
                      id={`question_${idx}`}
                      required={type !== "listening"}
                      value={q.question_text}
                      onChange={(e) => {
                        const newQuestions = [...questions];
                        newQuestions[idx].question_text = e.target.value;

                        setQuestions(newQuestions);
                      }}
                    />

                    {type === "grammar" && (
                      <>
                        <label className="text-sm text-slate-600 font-semibold select-none">FORMATTING PREVIEW</label>
                        <div>
                          {q.question_text ? (
                            <div className="text-black font-medium p-2 w-full overflow-hidden text-base/8">
                              {displayFormattingExample(q.question_text)}
                            </div>
                          ) : (
                            <p className="text-slate-400">-</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {["a", "b", "c", "d"].map((letter, idx2) => {
                    return (
                      <div className="col-span-3">
                        <label
                          className="text-sm text-tec-darker font-semibold select-none"
                          htmlFor={`choice_${letter}_${idx}`}
                        >
                          CHOICE {letter.toUpperCase()} <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          id={`choice_${letter}_${idx}`}
                          placeholder={`Answer ${letter.toUpperCase()}`}
                          required
                          className="w-full px-2 py-1.5 border-2 border-slate-300 focus:outline-none
                            hover:border-tec-light focus:border-tec-light rounded-lg"
                          value={q[`choice_${letter}`]}
                          onChange={(e) => {
                            const newQuestions = [...questions];
                            newQuestions[idx][`choice_${letter}`] = e.target.value;

                            setQuestions(newQuestions);
                          }}
                        />

                        <input
                          type="radio"
                          className="mr-2 mb-2"
                          required
                          id={`radio_answer_${letter}_${idx}`}
                          checked={q.answer === letter}
                          onChange={() => {
                            const newQuestions = [...questions];
                            newQuestions[idx].answer = letter;

                            setQuestions(newQuestions);
                          }}
                        />
                        <label htmlFor={`radio_answer_${letter}_${idx}`}>Set {letter.toUpperCase()} as the correct answer</label>
                      </div>
                    );
                  })}

                  <div className="col-start-12 row-start-1 row-span-2 p-2 flex items-start justify-start">
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-800 cursor-pointer"
                      onClick={() => {
                        const newQuestions = [...questions];
                        newQuestions.splice(idx, 1);
                        setQuestions(newQuestions);
                      }}
                      title="Delete this question"
                    >
                      <FaTrash className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              )
            })}

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="border-2 border-tec-darker hover:border-tec-dark text-tec-darker hover:text-tec-dark
                  py-2 px-5 font-bold rounded-lg flex items-center gap-2 cursor-pointer mb-5"
                onClick={addQuestion}
              >
                <FaPlus /> Add Question
              </button>

              <span className="mb-5">or upload all at once with</span>

              <div className="w-6/12">
                <input
                  type="file"
                  id="csv_file"
                  className="w-full px-3 py-1.5 block border-2 border-slate-300 focus:outline-none
                    hover:border-tec-light focus:border-tec-light rounded-lg file:bg-tec-darker
                    file:hover:bg-tec-dark file:text-white file:py-1 file:px-2.5 file:font-bold
                    file:rounded-lg file:text-sm file:mr-2"
                  onChange={handleReadCSVQuestions}
                />
                <label htmlFor="csv_file" className="text-sm text-slate-600 font-semibold select-none">
                  Accepted file extension: .csv
                </label>
              </div>
            </div>
          </div>

          {/*
            <div className="mb-2">
              <label className="text-sm text-tec-darker font-semibold select-none">ANSWERS</label>
              {answers.map((ans, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const letter_lower = letter.toLowerCase();

                return (
                <div key={idx} className="mb-3">
                  <input
                    type="text"
                    name={`choice_${letter_lower}`}
                    placeholder={`Answer ${letter}`}
                    required
                    className="w-full px-3 py-2 border-2 border-slate-300 focus:outline-none hover:border-tec-light
                    focus:border-tec-light rounded-lg"
                    value={ans}
                    onChange={(e) => {
                      const newAnswers = [...answers];
                      newAnswers[idx] = e.target.value;
                      setAnswers(newAnswers);
                    }}
                  />
                  
                  <input
                    type="radio"
                    className="mr-2 mb-2"
                    name="correct_answer"
                    required
                    id={`radio_answer_${letter_lower}`}
                    checked={correctAnswer === letter_lower}
                    onChange={() => setCorrectAnswer(letter_lower)}
                  />
                  <label htmlFor={`radio_answer_${letter_lower}`}>Set {letter} as the correct answer</label>
                </div>
              )})}
            </div>
          */}

          <button
            className="bg-tec-darker hover:bg-tec-dark text-white py-2 px-5 font-bold rounded-lg flex
              items-center gap-2 mt-5 cursor-pointer"
            type="submit"
          >
            {isEdit ? "Save Changes" : "Add Question Batch"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default AddQuestionPage;
