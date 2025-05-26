import React, { useEffect, useState } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";



function StudentDashboard() {
  const [userName, setUserName] = useState("");
  const [exams, setExams] = useState([]);
  const handleExamClick = (exam) => {
    if (exam.status === "ongoing") {
      navigate(`/test1`); // arahkan ke halaman ujian
    }
  };
  const navigate = useNavigate();
  

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("loggedInUser"));
    if (userData?.name) {
      setUserName(userData.name);
    }

    // Contoh data dummy, nantinya bisa kamu fetch dari API
    setExams([
      {
        title: "Session 1 TEC Exam",
        date: "12 Jan 2024",
        time: "14:00–16:30",
        status: "ongoing",
      },
    ]);
  }, []);

  const upcomingExams = exams.filter(
    (exam) => exam.status === "ongoing" || exam.status === "pending"
  );

  const previousExams = exams.filter((exam) => exam.status === "completed");

  return (
    <div className="exam-dashboard">
      <header className="dashboard-header">
        <div className="logo-title">
          <img src="/logoukdc.png" alt="" className="dashboard-logo" />
          <h1>TEC UKDC</h1>
        </div>
        <div className="user-info">
          <div>Halo</div>
          <strong>{userName}</strong>
        </div>
      </header>


      <div className="exam-section">
        <h2>Upcoming Exams</h2>
        <p>Daftar ujian yang akan datang.</p>
        <div className="exam-cards">
        {upcomingExams.map((exam, idx) => (
          <div
            key={idx}
            className={`exam-card ${exam.status === "ongoing" ? "dark" : "light"}`}
            onClick={() => handleExamClick(exam)}  // <-- Tambahkan ini
            style={{ cursor: exam.status === "ongoing" ? "pointer" : "default" }}
          >
            <strong>{exam.title}</strong>
            <div>{exam.date} ({exam.time})</div>
            <div className="exam-status">
              {exam.status === "ongoing" ? "Ongoing" : "Pending"}
            </div>
          </div>
        ))}
      </div>
      </div>

      {previousExams.length > 0 && (
        <div className="exam-section">
          <h2>Previous Exams</h2>
          <p>Ujian yang telah selesai.</p>
          <div className="exam-cards">
            {previousExams.map((exam, idx) => (
              <div
                key={idx}
                className={`exam-card ${exam.score >= 400 ? "border-blue" : "border-red"}`}
              >
                <strong>{exam.title}</strong>
                <div>Selesai pada: {exam.completedAt}</div>
                <div className="score-label">
                  Your score:{" "}
                  <span className={`score ${exam.score >= 400 ? "score-blue" : "score-red"}`}>
                    {exam.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
