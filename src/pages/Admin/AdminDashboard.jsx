import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import axios from "axios";
import { config } from "../../data/config";
import Loading from "../Components/Loading";

function AdminDashboard() {
  const [ongoingExams, setOngoingExams] = useState([]);
  const [dashboardNumbers, setDashboardNumbers] = useState({
    questions_made: 0,
    unpublished_scores: 0,
    upcoming_exams: 0,
  });
  const [finishedLoading, setFinishedLoading] = useState(false);

  const getDashboardNumbers = async () => {
    const token = localStorage.getItem("jwtToken");

    const response = await axios.get(`${config.BACKEND_URL}/api/admin/home`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setDashboardNumbers(response.data);

    setFinishedLoading(true);
  }

  const getOngoingExams = async () => {
    try {
      const token = localStorage.getItem("jwtToken");

      const response = await axios.get(`${config.BACKEND_URL}/api/admin/home/ongoing`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // console.log(response.data, typeof response.data);

      setOngoingExams(response.data.map((e, index) => {
        const start = new Date(e.start_datetime);
        const end = new Date(e.end_datetime);
        const now = new Date();

        const isOngoing = now >= start && now <= end;

        // console.log(e.exam_id, isOngoing, now >= start, now <= end);

        return {
          ...e,
          status: isOngoing ? "ongoing" : "pending",
        }
      }));
      setFinishedLoading(true);
    } catch (error) {
      console.error("Error fetching exams:", error);
      setFinishedLoading(true);
    }
  }

  useEffect(() => {
    getDashboardNumbers();
    getOngoingExams();
  }, []);

  return (
    <div className="absolute bg-slate-50 w-full min-h-full h-auto">
      <Navbar />

      <main className="px-8 py-12">
        {finishedLoading ? (
          <>
            <div className="flex gap-8 mb-5 text-tec-darker">
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

            <section className="mt-2 mb-5 py-5 px-10 text-tec-darker">
              <h2 className="text-xl font-bold mb-1">Ongoing Exams</h2>
              <p className="text-slate-700">Keep track of students currently taking an exam.</p>
              <div className="flex flex-wrap gap-5 mt-5">
                {ongoingExams.length > 0 ? (
                  ongoingExams.map((exam, idx) => {
                    const startDatetime = new Date(exam.start_datetime);
                    const endDatetime = new Date(exam.end_datetime);

                    // JS date formatting is limited, can't use en-US for "d M Y"
                    const startDate = startDatetime.toLocaleString("en-GB", {dateStyle: "medium"});
                    const endDate = endDatetime.toLocaleString("en-GB", {dateStyle: "medium"});

                    const startTime = startDatetime.toLocaleString("en-GB", {timeStyle: "short"});
                    const endTime = endDatetime.toLocaleString("en-GB", {timeStyle: "short"});

                    const dateString = (startDate === endDate 
                      ? `${startDate} (${startTime} - ${endTime})`
                      : `${startDate} (${startTime}) - ${endDate} (${endTime})`
                    );

                    return (
                      <div
                        key={idx}
                        className={`rounded-xl p-5 w-80 shadow-lg  ${exam.status === "ongoing"
                          ? "bg-tec-darker text-white cursor-pointer"
                          : "bg-tec-card text-tec-darker"}
                        `}
                        onClick={() => {
                          if (exam.status === "ongoing") {
                            handleExamClick(exam)
                          }
                        }}
                      >
                        <h3 className="font-bold">{exam.exam_title}</h3>
                        <p>{dateString}</p>
                        <p className="mt-2.5 font-semibold">
                          {exam.status === "ongoing" ? "Ongoing" : "Pending"}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-tec-darker rounded-xl p-5 w-full text-center">
                    <h3 className="text-2xl font-bold">- No Upcoming Exams -</h3>
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
