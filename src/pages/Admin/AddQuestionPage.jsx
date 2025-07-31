import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { config } from "../../data/config";
import ProgressBar from "../Components/ProgressBar";
import Navbar from "../Components/Navbar";
import { FaChevronLeft } from "react-icons/fa";
import GrammarUnderline from "../Components/GrammarUnderline";

function AddQuestionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = location.state?.isEdit || false;
  const editQuestion = location.state?.question || null;

  const [type, setType] = useState(editQuestion != null ? editQuestion.question_type : "");
  const [questionText, setQuestionText] = useState(editQuestion != null ? editQuestion.question_text : "");
  const [answers, setAnswers] = useState(editQuestion != null ? [editQuestion.choice_a, editQuestion.choice_b, editQuestion.choice_c, editQuestion.choice_d] : ["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(editQuestion != null ? editQuestion.answer : null);
  const [audioFile, setAudioFile] = useState(null);

  const [uploadProgress, setUploadProgress] = useState(0);

  // Create-Update Questions
  // Read-Delete on QuestionsPage.jsx
  const createQuestion = async (question, onProgress) => {
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

  const updateQuestion = async (id, question, onProgress) => {
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
    formData.append("answer", correctAnswer);

    setUploadProgress(0);

    if (isEdit) {
      updateQuestion(editQuestion.question_id, formData, setUploadProgress);
    } else {
      createQuestion(formData, setUploadProgress);
    }
  };

  const displayFormattingExample = () => {
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

    console.log(parts);

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
            onClick={() => navigate("/admin/questions")}
          >
            <FaChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-4xl mb-5 text-tec-darker font-bold">{isEdit ? "Edit Question" : "New Question"}</h2>
        </div>

        <form className="mb-10" onSubmit={handleSubmit}  encType="multipart/form-data">
          <label className="text-sm text-tec-darker font-semibold select-none">QUESTION TYPE</label>
          <div className="flex gap-6 mb-2">
            {[{type: "grammar", text: "Grammar"}, {type: "reading", text: "Reading"}, {type: "listening", text: "Listening"}].map((option) => (
              <div className="cursor-pointer">
                <input
                  type="radio"
                  className="mr-2"
                  name="question_type"
                  value={option.type}
                  id={`question_type ${option.type}`}
                  checked={type === option.type}
                  required
                  onChange={() => setType(option.type)}
                /> <label key={option.type} for={`question_type ${option.type}`}>{option.text}</label>
              </div>
            ))}
          </div>

          {type === "listening" && (
            <>
              <label className="text-sm text-tec-darker font-semibold select-none">UPLOAD AUDIO (LISTENING)</label>
              <input
                type="file"
                name="file"
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
            <label className="text-sm text-tec-darker font-semibold select-none">QUESTION TEXT</label>
            <textarea
              placeholder="Text of the question"
              className="resize-y min-h-25 w-full px-3 py-2 mb-2 border-2 border-slate-300
                focus:outline-none hover:border-tec-light focus:border-tec-light rounded-lg"
              name="question_text"
              required
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />

            <li className="text-sm text-slate-600 font-semibold list-disc list-outside ml-4 mb-4">
              <ul>Use two underscores (__) to create an underline formatting for the grammar section (includes the letters from A to D).</ul>
            </li>
          </div>

          {type === "grammar" && (
            <div className="mb-2">
              <label className="text-sm text-slate-600 font-semibold select-none">FORMATTING PREVIEW</label>
              <div>
                {questionText ? (
                  <div className="text-base text-black font-medium p-2">
                    {displayFormattingExample()}
                  </div>
                ) : (
                  <p className="text-slate-400">-</p>
                )}
              </div>
            </div>
          )}

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

          <button
            className="bg-tec-darker hover:bg-tec-dark text-white py-2 px-5 font-bold rounded-lg flex
              items-center gap-2 mt-5 cursor-pointer"
            type="submit"
          >
            {isEdit ? "Save Changes" : "Add Question"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default AddQuestionPage;
