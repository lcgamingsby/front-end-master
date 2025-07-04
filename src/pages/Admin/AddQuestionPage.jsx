import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../AdminQuestions.css";
import axios from "axios";
import { config } from "../../data/config";

function AddQuestionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = location.state?.isEdit || false;
  const editQuestion = location.state?.question || null;

  const [type, setType] = useState(editQuestion != null ? editQuestion.question_type : "grammar");
  const [questionText, setQuestionText] = useState(editQuestion != null ? editQuestion.question_text : "");
  const [answers, setAnswers] = useState(editQuestion != null ? [editQuestion.choice_a, editQuestion.choice_b, editQuestion.choice_c, editQuestion.choice_d] : ["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(editQuestion != null ? editQuestion.answer : null);
  const [audioFile, setAudioFile] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();

    const form = e.target;

    console.log(form);

    const formData = new FormData(form);
    formData.append("answer", correctAnswer);

    console.log(formData);

    if (isEdit) {
      try {
        await axios.put(`${config.apiUrl}/questions/${editQuestion.question_id}`, formData)
      } catch (e) {
        console.error("Failed to update question:", e);
      }
    } else {
      try {
        await axios.post(`${config.apiUrl}/questions`, formData);
      } catch (e) {
        console.error("Failed to add question:", e);
      }
    }
    //navigate("admin/questions");
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
          <h2 className="form-title">{isEdit ? "Edit Question" : "New Question"}</h2>

          <form onSubmit={handleSave}  encType="multipart/form-data">
            <div className="form-group">
              <label>QUESTION TYPE</label>
              <div className="radio-group">
                {[{type: "grammar", text: "Grammar"}, {type: "reading", text: "Reading"}, {type: "listening", text: "Listening"}].map((option) => (
                  <label key={option.type}>
                    <input
                      type="radio"
                      name="question_type"
                      value={option.type}
                      checked={type === option.type}
                      onChange={() => setType(option.type)}
                    /> {option.text}
                  </label>
                ))}
              </div>
            </div>

            {type === "listening" && (
              <div className="form-group">
                <label>UPLOAD AUDIO (LISTENING)</label>
                <input
                  type="file"
                  name="file"
                  accept="audio/*"
                  onChange={(e) => setAudioFile(e.target.files[0])}
                />
              </div>
            )}

            <div className="form-group">
              <label>QUESTION TEXT</label>
              <textarea
                placeholder="Text of the question"
                name="question_text"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>ANSWERS</label>
              {answers.map((ans, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const letter_lower = letter.toLowerCase();

                return (
                <div key={idx} className="answer-option">
                  <input
                    type="text"
                    name={`choice_${letter_lower}`}
                    placeholder={`Answer ${letter}`}
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
                      checked={correctAnswer === letter_lower}
                      onChange={() => setCorrectAnswer(letter_lower)}
                    />
                    Set {letter} as the correct answer
                  </label>
                </div>
              )})}
            </div>

            <button className="add-btn">
              {isEdit ? "Save Changes" : "Add Question"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AddQuestionPage;
