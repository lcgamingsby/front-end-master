import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../AdminQuestions.css";

function AddQuestionPage() {
  const navigate = useNavigate();
  const [type, setType] = useState("Grammar");
  const [questionText, setQuestionText] = useState("");
  const [answers, setAnswers] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    const index = localStorage.getItem("editQuestionIndex");
    if (index !== null) {
      const questions = JSON.parse(localStorage.getItem("questions")) || [];
      const q = questions[index];
      if (q) {
        setEditMode(true);
        setEditIndex(Number(index));
        setType(q.type);
        setQuestionText(q.question);
        setAnswers(q.answers.split(", ").map((a) => a.trim()));
        setCorrectAnswer(q.correctAnswer.charCodeAt(0) - 65);
      }
    }
  }, []);

  const handleSave = () => {
    /*
    const newQuestion = {
      id: Date.now(),
      type,
      audioURL: audioFile ? URL.createObjectURL(audioFile) : null,
      question: questionText,
      answers: answers.join(", "),
      correctAnswer: String.fromCharCode(65 + correctAnswer),
    };

    let existingQuestions = JSON.parse(localStorage.getItem("questions")) || [];

    if (editMode) {
      // replace the question at editIndex
      existingQuestions[editIndex] = { ...existingQuestions[editIndex], ...newQuestion };
      localStorage.removeItem("editQuestionIndex");
      alert("Question updated!");
    } else {
      existingQuestions.push(newQuestion);
      alert("Question added!");
    }

    localStorage.setItem("questions", JSON.stringify(existingQuestions));
    */
    navigate("/questions");
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="logo-title">
          <img src="/logoukdc.png" alt="Logo" className="dashboard-logo" />
          <span>
             <span className="tec">TEC</span> <span className="ukdc">UKDC</span>
          </span>
        </div>
        <nav className="admin-nav">
          <button className="nav-btn" onClick={() => navigate("/admin/")}>Home</button>
          <button className="nav-btn" onClick={() => navigate("/admin/exams")}>Exams</button>
          <button className="nav-btn active" onClick={() => navigate("/admin/questions")}>Questions</button>
          <button className="nav-btn" onClick={() => navigate("/admin/students")}>Students</button>
        </nav>
        <div className="admin-info">
          <strong>ADMIN</strong>
          <span>JOHN DOE</span>
        </div>
      </header>

      <main className="admin-content">
        <button className="back-btn" onClick={() => navigate("/admin/questions")}>← Back to Questions</button>

        <div className="form-section">
          <h2 className="form-title">{editMode ? "Edit Question" : "New Question"}</h2>

          <form onSubmit={handleSave} encType="multipart/form-data">
            <div className="form-group">
              <label>QUESTION TYPE</label>
              <div className="radio-group">
                {["Grammar", "Reading", "Listening"].map((option) => (
                  <label key={option}>
                    <input
                      type="radio"
                      name="type"
                      value={option}
                      checked={type === option}
                      onChange={() => setType(option)}
                    /> {option}
                  </label>
                ))}
              </div>
            </div>

            {type === "Listening" && (
              <div className="form-group">
                <label>UPLOAD AUDIO (LISTENING)</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setAudioFile(e.target.files[0])}
                />
              </div>
            )}

            <div className="form-group">
              <label>QUESTION TEXT</label>
              <textarea
                placeholder="Text of the question"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>ANSWERS</label>
              {answers.map((ans, idx) => (
                <div key={idx} className="answer-option">
                  <input
                    type="text"
                    placeholder={`Answer ${String.fromCharCode(65 + idx)}`}
                    value={ans}
                    onChange={(e) => {
                      const newAnswers = [...answers];
                      newAnswers[idx] = e.target.value;
                      setAnswers(newAnswers);
                    }}
                  />
                  <label>
                    <input
                      type="radio"
                      name="correct"
                      checked={correctAnswer === idx}
                      onChange={() => setCorrectAnswer(idx)}
                    />
                    Set {String.fromCharCode(65 + idx)} as the correct answer
                  </label>
                </div>
              ))}
            </div>

            <button className="add-btn">
              {editMode ? "Save Changes" : "Add Question"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AddQuestionPage;
