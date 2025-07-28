import React, { useEffect, useState } from "react";
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
    <div className="absolute bg-slate-50 w-full min-h-full h-auto">
      <Navbar />

      <main className="px-8 py-12">
        {finishedLoading ? (
          <>
            <div className="flex gap-8 mb-10 text-tec-darker">
              <div
                className="flex-1 border-4 border-solid border-tec-darker motion-safe:transition-colors
                  motion-safe:duration-150 motion-safe:ease-out hover:bg-tec-darker hover:text-white
                  rounded-2xl p-6 text-center"
              >
                <div className="font-bold mb-2">Questions Made</div>
                <div className="text-5xl font-extrabold">{dashboardNumbers.questions_made}</div>
              </div>
              <div
                className="flex-1 border-4 border-solid border-tec-darker motion-safe:transition-colors
                  motion-safe:duration-150 motion-safe:ease-out hover:bg-tec-darker hover:text-white
                  rounded-2xl p-6 text-center"
              >
                <div className="font-bold mb-2">Unpublished Exam Scores</div>
                <div className="text-5xl font-extrabold">{dashboardNumbers.unpublished_scores}</div>
              </div>
              <div
                className="flex-1 border-4 border-solid border-tec-darker motion-safe:transition-colors
                  motion-safe:duration-150 motion-safe:ease-out hover:bg-tec-darker hover:text-white
                  rounded-2xl p-6 text-center"
              >
                <div className="font-bold mb-2">Upcoming Exams</div>
                <div className="text-5xl font-extrabold">{dashboardNumbers.upcoming_exams}</div>
              </div>
            </div>

            <section className="mt-5 mb-10 py-5 px-10 text-tec-darker">
              <h2 className="text-xl font-bold mb-1">Ongoing Exams</h2>
              <p className="text-slate-700">Keep track of students currently taking an exam.</p>
              <div className="flex flex-wrap gap-5 mt-5">
                {ongoingExams.length > 0 ? (
                  ongoingExams.map((exam) => (
                    <div key={exam.id} className="bg-tec-darker text-white rounded-xl p-5 w-80 shadow-lg">
                      <strong>{exam.title}</strong>
                      <div>
                        {exam.date} ({exam.time})
                      </div>
                      <div className="exam-status">Ongoing ({exam.remaining} left)</div>
                    </div>
                  ))
                ) : (
                  <div className="text-tec-darker rounded-xl p-5 w-full text-center">
                    <h3 className="text-2xl font-bold">- No Ongoing Exams -</h3>
                    <p>Check back later.</p>
                  </div>
                )}
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
