import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { config } from "../../data/config";
import Navbar from "../Components/Navbar";
import Loading from "../Components/Loading";

const StudentLogDetailPage = () => {
  const { examID, nim } = useParams();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const res = await axios.get(
          `${config.BACKEND_URL}/api/admin/logs/${examID}/${nim}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLogs(res.data);
      } catch (err) {
        console.error("Error fetching student logs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();

    const interval = setInterval(fetchLogs, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval); // Cleanup on unmount
    
  }, [examID, nim]);

  if (loading) return <Loading />;

  

  return (
    <div className="absolute bg-slate-50 w-full min-h-full h-auto">
      <Navbar />
      <main className="p-8">
        <button
          className="mb-4 bg-slate-300 hover:bg-slate-400 text-black px-4 py-2 rounded-lg"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <h2 className="text-3xl mb-5 text-tec-darker font-bold">
          Logs for Student {nim} (Exam {examID})
        </h2>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-tec-darker text-white">
              <th className="px-4 py-2 border">Timestamp</th>
              <th className="px-4 py-2 border">Type</th>
              <th className="px-4 py-2 border">Activity</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-100"}>
                <td className="border px-4 py-2">{log.waktu}</td>
                <td className="border px-4 py-2">{log.tipeAktivitas}</td>
                <td className="border px-4 py-2">{log.aktivitas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default StudentLogDetailPage;
