import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import axios from "axios";
import { config } from "../../data/config";
import { FaDownload } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";


function ExamScoresPage() {
  const [scores, setScores] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const getScores = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await axios.get(`${config.BACKEND_URL}/api/admin/scores`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setScores(res.data);
    } catch (e) {
      console.error("Error fetching scores:", e);
    }
  };

  const getLogs = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await axios.get(`${config.BACKEND_URL}/api/admin/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data);
    } catch (e) {
      console.error("Error fetching logs:", e);
    }
  };

  useEffect(() => {
    Promise.all([getScores(), getLogs()]).then(() => setLoading(false));
  }, []);

  const exportCSV = (data, filename) => {
    const csvContent = [
      Object.keys(data[0]).join(","), // header
      ...data.map(row => Object.values(row).join(",")) // rows
    ].join("\n");
  
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const navigate = useNavigate();

  

  if (loading) return <p className="p-8">Loading...</p>;

  return (
    <div className="absolute bg-slate-50 w-full min-h-full h-auto">
      <Navbar />
      <main className="p-8">
        <button
            className="mb-4 bg-slate-300 hover:bg-slate-400 text-black px-4 py-2 rounded-lg"
            onClick={() => navigate("/admin/scores")}
          >
            ← Back
          </button>

          <h2 className="text-4xl mb-5 text-tec-darker font-bold">
            Exam Scores Details
          </h2>

        {/* Scores Table */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-2xl font-semibold text-tec-darker">Scores</h3>
            <button
              className="flex items-center gap-2 bg-tec-darker hover:bg-tec-dark text-white px-4 py-2 rounded-lg"
              onClick={() => exportToFile(scores, "exam_scores.xlsx")}
            >
              <FaDownload /> Export Scores
            </button>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-tec-darker text-white">
                <th className="px-4 py-2 border">Student ID</th>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Score</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-100"}>
                  <td className="border px-4 py-2">{s.nim}</td>
                  <td className="border px-4 py-2">{s.name}</td>
                  <td className="border px-4 py-2">{s.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Logs Table */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-2xl font-semibold text-tec-darker">Activity Logs</h3>
            <button
              className="flex items-center gap-2 bg-tec-darker hover:bg-tec-dark text-white px-4 py-2 rounded-lg"
              onClick={() => exportToFile(logs, "exam_logs.xlsx")}
            >
              <FaDownload /> Export Logs
            </button>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-tec-darker text-white">
                <th className="px-4 py-2 border">Timestamp</th>
                <th className="px-4 py-2 border">Student ID</th>
                <th className="px-4 py-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-100"}>
                  <td className="border px-4 py-2">{l.timestamp}</td>
                  <td className="border px-4 py-2">{l.nim}</td>
                  <td className="border px-4 py-2">{l.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default ExamScoresPage;
