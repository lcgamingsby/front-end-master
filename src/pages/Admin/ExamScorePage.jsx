import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { config } from "../../data/config";
import Loading from "../Components/Loading";

function ExamScoresPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get(
          `${config.BACKEND_URL}/api/admin/exams`,
          { withCredentials: true },
        );
        setExams(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching exams:", err);
        setExams([]);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  // ✅ Format tanggal agar lebih mudah dibaca
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="absolute bg-slate-50 w-full min-h-full h-auto">
      <Navbar />
      {loading ? (
        <Loading />
      ) : (
        <main className="p-8">
          <h2 className="text-4xl mb-5 text-tec-darker font-bold">Exam Scores</h2>
          <table className="w-full border-collapse mb-4">
            <thead>
              <tr className="bg-tec-darker text-white text-center font-bold">
                <th className="w-1/12 px-4 py-3 border-x-2 border-white border-l-tec-darker">Exam ID</th>
                <th className="w-5/12 px-4 py-3 border-x-2 border-white">Title</th>
                <th className="w-4/12 px-4 py-3 border-x-2 border-white">Schedule</th>
                <th className="w-2/12 px-4 py-3 border-x-2 border-white border-r-tec-darker">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam, i) => {
                const isOdd = i % 2 === 1;

                return (
                  <tr
                    key={exam.exam_id}
                    className={`${isOdd ? "bg-slate-200" : "bg-white"} hover:bg-slate-300 text-sm`}
                  >
                    <td className="px-4 py-2 border-2 border-slate-400 text-center">{exam.exam_id}</td>
                    <td className="px-4 py-2 border-2 border-slate-400">{exam.exam_title}</td>
                    <td className="px-4 py-2 border-2 border-slate-400">
                      {formatDate(exam.start_datetime)} - {formatDate(exam.end_datetime)}
                    </td>
                    <td className="px-4 py-2 border-2 border-slate-400 text-center">
                      <button
                        className="bg-tec-darker hover:bg-tec-dark text-white px-4 py-2 rounded-lg cursor-pointer"
                        onClick={() => navigate(`/admin/scores/${exam.exam_id}`)}
                      >
                        View Scores
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </main>
      )}
    </div>
  );
}

export default ExamScoresPage;
