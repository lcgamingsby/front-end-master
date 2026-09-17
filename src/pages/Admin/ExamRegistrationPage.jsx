import { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import axios from "axios";
import { config } from "../../data/config";
import Loading from "../Components/Loading";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft } from "react-icons/fa";

function ExamRegistrationPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const fetchRegistrations = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await axios.get(
        `${config.BACKEND_URL}/api/admin/registrations`,
        { withCredentials: true },
      );

      // pastikan hasilnya array
      const data = Array.isArray(res.data) ? res.data : [];
      setRegistrations(data);
    } catch (err) {
      console.error("Gagal memuat data pendaftaran:", err);
      setMessage("Gagal memuat data.");
      setRegistrations([]); // pastikan tidak null
    } finally {
      setLoading(false);
    }
  };


  const handleVerification = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("jwtToken");
      await axios.post(`${config.BACKEND_URL}/api/admin/registrations/verify`,
        { id, status: newStatus },
        { withCredentials: true },
      );
      setMessage(`Pendaftaran #${id} diperbarui menjadi ${newStatus}.`);
      fetchRegistrations();
    } catch (err) {
      console.error("Gagal memperbarui status:", err);
      setMessage("Terjadi kesalahan saat memperbarui status.");
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  return (
    <div className="absolute bg-slate-50 w-full min-h-full h-auto">
      <Navbar />

      <main className="p-8">
        <div className="flex gap-2 items-baseline">
          <button
            className="text-tec-darker hover:text-tec-light cursor-pointer"
            onClick={() => navigate("/admin/exams")}
          >
            <FaChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-4xl mb-5 text-tec-darker font-bold">Exam Registrations</h2>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className="bg-white shadow-md rounded-xl p-6">
            {message && (
              <p className="text-green-700 font-semibold mb-4">{message}</p>
            )}
            {registrations.length > 0 ? (
              <table className="min-w-full border border-gray-300 text-left text-sm">
                <thead className="bg-tec-darker text-white">
                  <tr>
                    <th className="py-2 px-4">ID</th>
                    <th className="py-2 px-4">NIM</th>
                    <th className="py-2 px-4">Exam Type</th>
                    <th className="py-2 px-4">Payment Proof</th>
                    <th className="py-2 px-4">Status</th>
                    <th className="py-2 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="border-b hover:bg-gray-100">
                      <td className="py-2 px-4">{reg.id}</td>
                      <td className="py-2 px-4">{reg.nim}</td>
                      <td className="py-2 px-4 capitalize">{reg.exam_type}</td>
                      <td className="py-2 px-4">
                        <a
                          href={`${config.BACKEND_URL}/uploads/${reg.payment_proof}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          View File
                        </a>
                      </td>
                      <td className="py-2 px-4 capitalize text-center flex items-center justify-center">
                        <div
                          className={`font-semibold px-2 py-1 rounded-full w-30 ${
                            reg.status === "approved"
                              ? "bg-green-700 text-white"
                              : reg.status === "rejected"
                              ? "bg-red-700 text-white"
                              : ""
                          }`}
                        >
                          {reg.status === "approved"
                            ? `✓ ${reg.status}`
                            : reg.status === "rejected"
                            ? `✗ ${reg.status}`
                            : reg.status}
                        </div>
                      </td>
                      <td className="py-2 px-4 text-center">
                        {reg.status === "pending" ? (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleVerification(reg.id, "approved")}
                              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleVerification(reg.id, "rejected")}
                              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-gray-600 py-4">
                Belum ada data pendaftaran ujian.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default ExamRegistrationPage;
