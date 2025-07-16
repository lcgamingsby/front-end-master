import React, { useEffect, useState } from "react";
import "../../App_old.css"; // pastikan file CSS diimpor
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import axios from "axios";
import { config } from "../../data/config";
import Loading from "../Components/Loading";

function AdminDashboard() {
  const [adminName] = useState("");
  const [ongoingExams, setOngoingExams] = useState([]);
  const [dashboardNumbers, setDashboardNumbers] = useState({
    questions_made: 0,
    unpublished_scores: 0,
    upcoming_exams: 0,
  });
  const [finishedLoading, setFinishedLoading] = useState(false);

  const getDashboardNumbers = async () => {
    const token = localStorage.getItem("jwtToken");

    const response = await axios.get(`${config.backendUrl}/api/admin`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setDashboardNumbers(response.data);

    setFinishedLoading(true);
  }

  useEffect(() => {
    // Dummy data exam
    /*
    setOngoingExams([
      {
        id: 1,
        title: "Session 1 TEC Exam",
        date: "12 Jan 2024",
        time: "14:00-16:30",
        remaining: "00:45:00",
        status: "ongoing",
      },
    ]);
    */

    getDashboardNumbers();
  }, []);

  return (
    <div className="admin-dashboard">
      <Navbar />

      <main className="admin-content">
        {finishedLoading ? (
          <>
            <div className="admin-stats">
              <div className="stat-card">
                <div className="stat-title">Questions Made</div>
                <div className="stat-value">{dashboardNumbers.questions_made}</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Unpublished Exam Scores</div>
                <div className="stat-value">{dashboardNumbers.unpublished_scores}</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Upcoming Exams</div>
                <div className="stat-value">{dashboardNumbers.upcoming_exams}</div>
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
          </>
        ): (
          <Loading />
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
