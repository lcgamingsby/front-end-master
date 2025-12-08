import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import axios from "axios";
import { config } from "../../data/config";
import { FaDownload } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import Loading from "../Components/Loading";

function ExamScoreDetailPage() {
  const [scores, setScores] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { examID } = useParams();
  const navigate = useNavigate();
  
  const getScores = async () => {
    try {
      const res = await axios.get(
        `${config.BACKEND_URL}/api/admin/scores/${examID}`, 
        { withCredentials: true }
      );
      setScores(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Error fetching scores:", e);
    }
  };

  const getLogs = async () => {
    try {
      const res = await axios.get(
        `${config.BACKEND_URL}/api/admin/logs/${examID}`,
        { withCredentials: true }
      );
      console.log(res.data);

      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Error fetching logs:", e);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      await Promise.all([getScores(), getLogs()]);
      if (isMounted) setLoading(false);
    };
    loadData();

    const interval = setInterval(() => {
      //console.log("Refreshing data...");
      loadData();
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [examID]);

  useEffect(() => {
    const ws = new WebSocket(`${config.BACKEND_WS_URL}/ws`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "exam_update" && data.examID === examID) {
        getScores();
        getLogs();
      }
    };
    return () => ws.close();
  }, [examID]);

  const exportCSV = (data, filename) => {
    if (!data || data.length === 0) return;

    const customOrder = [
      "nim",
      "name",
      "listening",
      "grammar",
      "reading",
      "score",
    ]

    //console.log(data);
    const csvContent = [
      "NIM,Name,Listening Score,Grammar Score,Reading Score,Total Score",
      ...data.map((row) => [
        row.nim,
        row.name,
        row.listening,
        row.grammar,
        row.reading,
        row.score,
      ].join(",")), // rows
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  // ✅ Fungsi format tanggal agar tampil WIB & lebih rapi
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

  // Group logs by student
  const groupedLogs = (logs || []).reduce((acc, log) => {
    if (!acc[log.nim]) acc[log.nim] = [];
    acc[log.nim].push(log);
    return acc;
  }, {});

  const lastLogs = Object.keys(groupedLogs).map((nim) => ({
    nim,
    last: groupedLogs[nim][0], // karena backend ORDER BY waktu DESC
  }));

  return (
    <div className="absolute bg-slate-50 w-full min-h-full h-auto">
      <Navbar />
      {loading ? (
        <Loading />
      ) : (
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
                onClick={() => exportCSV(scores, "exam_scores.csv")}
              >
                <FaDownload /> Export Scores
              </button>
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-tec-darker text-white">
                  <th className="px-4 py-2 border w-3/12">NPM</th>
                  <th className="px-4 py-2 border w-4/12">Nama</th>
                  <th className="px-4 py-2 border w-1/12">Listening</th>
                  <th className="px-4 py-2 border w-1/12">Grammar</th>
                  <th className="px-4 py-2 border w-1/12">Reading</th>
                  <th className="px-4 py-2 border w-2/12">Total Score</th>
                </tr>
              </thead>
              <tbody>
                {(scores || []).map((s, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-100"}>
                    <td className="border px-4 py-2">{s.nim}</td>
                    <td className="border px-4 py-2">{s.name}</td>
                    <td className="border px-4 py-2">{s.listening}</td>
                    <td className="border px-4 py-2">{s.grammar}</td>
                    <td className="border px-4 py-2">{s.reading}</td>
                    <td className="border px-4 py-2">{s.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Logs Summary */}
          <div>
            <h3 className="text-2xl font-semibold text-tec-darker mb-3">
              Latest Activity per Student
            </h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-tec-darker text-white">
                  <th className="px-4 py-2 border">NPM</th>
                  <th className="px-4 py-2 border">Latest Timestamp</th>
                  <th className="px-4 py-2 border">Latest Activity</th>
                  <th className="px-4 py-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {(lastLogs || []).map((entry, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-100"}>
                    <td className="border px-4 py-2">{entry.nim}</td>
                    {/* ✅ Format waktu di sini */}
                    <td className="border px-4 py-2">
                      {formatDate(entry.last.waktu)}
                    </td>
                    <td className="border px-4 py-2">{entry.last.aktivitas}</td>
                    <td className="border px-4 py-2">
                      <div className="flex gap-4">
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                          onClick={() => navigate(`/admin/logs/${examID}/${entry.nim}`)}
                        >
                          View Details
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                          onClick={() => setDeleteTarget(entry.nim)}
                        >
                          Delete Logs
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Popup Konfirmasi Hapus */}
          {deleteTarget && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 w-[400px]">
                <h3 className="text-xl font-bold text-tec-darker mb-4">
                  Konfirmasi Hapus
                </h3>
                <p className="mb-6">
                  Apakah Anda yakin ingin menghapus semua log aktivitas untuk student{" "}
                  <span className="font-semibold">{deleteTarget}</span>?
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
                    onClick={() => setDeleteTarget(null)}
                  >
                    Batal
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                    onClick={async () => {
                      try {
                        await axios.delete(
                          `${config.BACKEND_URL}/api/admin/logs/${examID}/${deleteTarget}`,
                          { withCredentials: true },
                        );
                        setDeleteTarget(null);
                        getLogs();
                      } catch (err) {
                        console.error("Error deleting logs:", err);
                        alert("Failed to delete logs");
                      }
                    }}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
}

export default ExamScoreDetailPage;
