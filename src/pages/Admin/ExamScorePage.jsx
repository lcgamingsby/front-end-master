import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { config } from "../../data/config";

function ExamScoresPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const res = await axios.get(`${config.BACKEND_URL}/api/admin/exams`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExams(res.data);
      } catch (err) {
        console.error("Error fetching exams:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  if (loading) return <p className="p-8">Loading...</p>;

  return (
    <div className="absolute bg-slate-50 w-full min-h-full h-auto">
      <Navbar />
      <main className="p-8">
        <h2 className="text-4xl mb-5 text-tec-darker font-bold">Exam Scores</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-tec-darker text-white">
              <th className="px-4 py-2 border">Exam ID</th>
              <th className="px-4 py-2 border">Title</th>
              <th className="px-4 py-2 border">Schedule</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam, i) => (
              <tr key={exam.exam_id} className={i % 2 === 0 ? "bg-white" : "bg-slate-100"}>
                <td className="border px-4 py-2">{exam.exam_id}</td>
                <td className="border px-4 py-2">{exam.exam_title}</td>
                <td className="border px-4 py-2">
                  {exam.start_datetime} - {exam.end_datetime}
                </td>
                <td className="border px-4 py-2 text-center">
                  <button
                    className="bg-tec-darker hover:bg-tec-light text-white px-4 py-2 rounded-lg"
                    onClick={() => navigate(`/admin/scores/${exam.exam_id}`)}
                  >
                    View Scores
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}

export default ExamScoresPage;
