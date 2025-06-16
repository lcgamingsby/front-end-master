import React, { useEffect, useState } from "react";
import "../App.css"; // pastikan file CSS diimpor
import { useNavigate } from "react-router-dom";


function AdminDashboard() {
  const [adminName] = useState("");
  const [ongoingExams, setOngoingExams] = useState([]);
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };

  useEffect(() => {
    // Dummy data exam
    setOngoingExams([
      {
        id: 1,
        title: "Session 1 TEC Exam",
        date: "12 Jan 2024",
        time: "14:00–16:30",
        remaining: "00:45:00",
        status: "ongoing",
      },
    ]);
  }, []);

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
        <button className="nav-btn active">Home</button>
        <button className="nav-btn" onClick={() => navigate("/exams")}>Exams</button>

        <button className="nav-btn">Questions</button>
        <button className="nav-btn">Students</button>
      </nav>
        <div className="admin-info">
          <strong>{adminName}</strong>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="admin-content">
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-title">Questions Made</div>
            <div className="stat-value">123</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Unpublished Exam Scores</div>
            <div className="stat-value">456</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Upcoming Exams</div>
            <div className="stat-value">789</div>
          </div>
        </div>

        <section className="exam-section">
          <h2>Ongoing Exams</h2>
          <p>Lorem ipsum dolor sit amet consectetur adipiscing elit.</p>
          <div className="exam-cards">
            {ongoingExams.map((exam) => (
              <div key={exam.id} className="exam-card dark">
                <strong>{exam.title}</strong>
                <div>
                  {exam.date} ({exam.time})
                </div>
                <div className="exam-status">Ongoing ({exam.remaining} left)</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
