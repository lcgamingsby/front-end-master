import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import axios from "axios";
import { config } from "../../data/config";
import Loading from "../Components/Loading";
import { useUser } from "../Components/UserContext";

function StudentDashboard() {
  const { user } = useUser();

  const [exams, setExams] = useState([]);
  const [finishedLoading, setFinishedLoading] = useState(false);

  const handleExamClick = async (exam) => { 
    try {
      const token = localStorage.getItem("jwtToken");

      const startRes = await axios.put(`${config.backendUrl}/api/student/exam/start`, {
        nim: user.id,
        exam_id: exam.exam_id,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (startRes.status !== 200) {
        console.log("Unable to start exam");
        return
      }

      console.log("start exam passed");

      const response = await axios.get(`${config.backendUrl}/api/student/exam/${exam.exam_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // filter questions for each category than randomly sort them
      const grammar = response.data.filter((q) => {
        return q.question_type.toLowerCase() === "grammar";
      }).sort(() => (0.5 - Math.random()));

      const reading = response.data.filter((q) => {
        return q.question_type.toLowerCase() === "reading";
      }).sort(() => (0.5 - Math.random()));

      const listening = response.data.filter((q) => {
        return q.question_type.toLowerCase() === "listening";
      }).sort(() => (0.5 - Math.random()));

      if (response.status === 200) {
        navigate(`/student/exam`, { 
          state: { 
            examID: exam.exam_id, 
            questions: {
              grammar: grammar,
              reading: reading,
              listening: listening,
            },
            endDatetime: exam.end_datetime,
          }
        }); // arahkan ke halaman ujian
      }
    } catch (e) {
      console.error("Error starting exam:", e);
    }
  };

  const navigate = useNavigate();

  const getUpcomingExams = async () => {
    try {
      const token = localStorage.getItem("jwtToken");

      const response = await axios.get(`${config.backendUrl}/api/student/home`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // console.log(response.data, typeof response.data);

      setExams(response.data.map((e, index) => {
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
    getUpcomingExams();
  }, []);

  return (
    <div className="absolute bg-slate-50 w-full min-h-full h-auto">
      <Navbar />

      {finishedLoading ? (
        <main className="px-8 py-12">
          <h2 className="text-xl text-tec-darker font-bold">Upcoming Exams</h2>
          <p>Lists the exams you will take in the future.</p>
          <div className="flex flex-wrap gap-5 mt-5">
            {exams.length > 0 ? (
              exams.map((exam, idx) => {
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
        </main>
      ) : (
        <Loading />
      )}
    </div>
  );
}

export default StudentDashboard;
