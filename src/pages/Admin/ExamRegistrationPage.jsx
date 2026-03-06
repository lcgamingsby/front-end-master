import { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import axios from "axios";
import { config } from "../../data/config";
import Loading from "../Components/Loading";
import { useNavigate } from "react-router-dom";

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

      <main className="px-8 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-tec-darker">
            Daftar Pendaftaran Ujian
          </h2>
          <button
            onClick={() => navigate("/admin")}
            className="bg-tec-darker text-white px-4 py-2 rounded-md hover:bg-tec-light transition"
          >
            ← Kembali
          </button>
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
                    <th className="py-2 px-4">Tipe Ujian</th>
                    <th className="py-2 px-4">Bukti Pembayaran</th>
                    <th className="py-2 px-4">Status</th>
                    <th className="py-2 px-4 text-center">Aksi</th>
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
                          Lihat Bukti
                        </a>
                      </td>
                      <td className="py-2 px-4 capitalize">{reg.status}</td>
                      <td className="py-2 px-4 text-center">
                        {reg.status === "pending" ? (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleVerification(reg.id, "approved")}
                              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleVerification(reg.id, "rejected")}
                              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span
                            className={`font-semibold ${
                              reg.status === "approved"
                                ? "text-green-700"
                                : reg.status === "rejected"
                                ? "text-red-700"
                                : "text-gray-600"
                            }`}
                          >
                            {reg.status}
                          </span>
                        )}
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
