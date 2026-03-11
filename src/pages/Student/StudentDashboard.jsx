import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import axios from "axios";
import { config } from "../../data/config";
import Loading from "../Components/Loading";
import { useUser } from "../Components/UserContext";
import ModalFinished from "../Components/ModalFinished";
import { getRefreshToken } from "../../data/helper";

function StudentDashboard() {
  const { user } = useUser();
  const location = useLocation();
  const finishedExam = location.state?.finished || false;

  const [exams, setExams] = useState([]);
  const [finishedLoading, setFinishedLoading] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false); // ✅ toggle modal
  const [examType, setExamType] = useState("online"); // ✅ new state
  const [paymentProof, setPaymentProof] = useState(null); // ✅ new state
  const [uploading, setUploading] = useState(false); // ✅ state upload progress
  const [message, setMessage] = useState("");
  const [offlineExamList, setOfflineExamList] = useState([]); // daftar ujian offline dengan kuota
  const [selectedOfflineExam, setSelectedOfflineExam] = useState(""); // id ujian offline yang dipilih
  const [quota, setQuota] = useState(null); // ✅ untuk simpan kuota offline
  const [offlineExams, setOfflineExams] = useState([]);
  const [onlineExamList, setOnlineExamList] = useState([]);
  const [selectedOnlineExam, setSelectedOnlineExam] = useState("");

  const [modalFinishedOpen, setModalFinishedOpen] = useState(finishedExam);

  const navigate = useNavigate();


  const handleExamClick = async (exam) => { 
    try {
      const startRes = await axios.put(`${config.BACKEND_URL}/api/student/exam/start`, {
          nim: user.id,
          exam_id: exam.exam_id,
        }, { withCredentials: true },
      );

      if (startRes.status !== 200) {
        return;
      }

      const response = await axios.get(
        `${config.BACKEND_URL}/api/student/exam/${exam.exam_id}`,
        { withCredentials: true },
      );

      const grammar = response.data.filter((q) => q.batch_type.toLowerCase() === "grammar");
      const reading = response.data.filter((q) => q.batch_type.toLowerCase() === "reading");
      const listening = response.data.filter((q) => q.batch_type.toLowerCase() === "listening");

      if (response.status === 200) {
        navigate(`/student/exam`, { 
          state: { 
            examID: exam.exam_id, 
            questions: { grammar, reading, listening },
            endDatetime: exam.end_datetime,
          }
        });
      }
    } catch (e) {
      console.error("Error starting exam:", e);

      // chances are most non-200 statuses are about expired token for jwt, so we refresh them
      if (e.response?.status === 401) {
        for (let i = 0; i < config.MAX_REFRESH_RETRIES; i++) {
          try {
            const res = await getRefreshToken();

            if (res.status === 200) {
              // re-run this function
              handleExamClick(exam);
              // no need to loop after a success
              break;
            } else {
              console.error("Unable to refresh token: ", res.message);
            }
          } catch (refreshErr) {
            console.error("Token refresh failed:", refreshErr);
          }
        }
      }
    }
  };

  const getUpcomingExams = async () => {
    try {
      const response = await axios.get(
        `${config.BACKEND_URL}/api/student/home`,
        { withCredentials: true },
      );

      // Pastikan response.data itu array
      const examData = Array.isArray(response.data) ? response.data : [];

      const mappedExams = examData.map((e) => {
        const start = new Date(e.start_datetime || e.jadwalMulai);
        const end = new Date(e.end_datetime || e.jadwalSelesai);
        const now = new Date();
        const isOngoing = now >= start && now <= end;

        return {
          exam_id: e.exam_id || e.idUjian || e.id,  // fallback supaya aman
          exam_title: e.exam_title || e.namaUjian || "Ujian Tanpa Nama",
          start_datetime: start.toISOString(),
          end_datetime: end.toISOString(),
          exam_type: e.exam_type || (e.idUjian ? "online" : "offline"),
          status: isOngoing ? "ongoing" : "pending",
        };
      });

      setExams(mappedExams);
      setFinishedLoading(true);
    } catch (error) {
      console.error("❌ Error fetching exams:", error);

      if (e.response?.status === 401) {
        for (let i = 0; i < config.MAX_REFRESH_RETRIES; i++) {
          try {
            const res = await getRefreshToken();

            if (res.status === 200) {
              // re-run this function
              getUpcomingExams();
              // no need to loop after a success
              break;
            } else {
              console.error("Unable to refresh token: ", res.message);
            }
          } catch (refreshErr) {
            console.error("Token refresh failed:", refreshErr);
          }
        }
      }

      setExams([]);
      setFinishedLoading(true);
    }
  };


  useEffect(() => {
    getUpcomingExams();
    getOfflineExams();
    if (examType === "online") {
      fetchOnlineExamList();
    }
  }, []);

  const fetchOfflineExamList = async () => {
    try {
      const res = await axios.get(
        `${config.BACKEND_URL}/api/student/offline/available`,
        { withCredentials: true },
      );
      setOfflineExamList(res.data);
    } catch (err) {
      console.error("Gagal ambil daftar ujian offline:", err);
      setOfflineExamList([]);
    }
  };


  // ✅ Fungsi daftar ujian
  const handleRegisterExam = async (e) => {
  e.preventDefault();
  setUploading(true);
  setMessage("");

  try {
    const token = localStorage.getItem("jwtToken");
    const formData = new FormData();

    // Data umum
    formData.append("nim", user.id);
    formData.append("exam_type", examType);

    // Kalau ujian offline, tambahkan ID ujian offline
    if (examType === "offline" && selectedOfflineExam) {
      formData.append("exam_id", selectedOfflineExam);
    }

    if (examType === "online" && selectedOnlineExam) {
      formData.append("exam_id", selectedOnlineExam);
    }

    // Tambahkan bukti pembayaran
    if (paymentProof) {
      formData.append("payment_proof", paymentProof);
    }

    // Kirim POST ke backend
    const res = await axios.post(
      `${config.BACKEND_URL}/api/exam/register`,
      formData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        }
      },
    );

    setMessage(res.data.message || "Pendaftaran berhasil!");
    setShowRegisterForm(false);

    // Refresh data ujian setelah daftar
    getUpcomingExams();
    getOfflineExams();

    } catch (err) {
      console.error("❌ Gagal daftar ujian:", err);
      setMessage(err.response?.data?.message || "Gagal daftar ujian.");
    } finally {
      setUploading(false);
    }
  };

  const getOfflineExams = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await axios.get(
        `${config.BACKEND_URL}/api/student/offline`, 
        { withCredentials: true },
      );

      setOfflineExams(
        response.data.map((e) => {
          const start = new Date(e.start_datetime);
          const end = new Date(e.end_datetime);
          const now = new Date();
          const isOngoing = now >= start && now <= end;
          return { ...e, status: isOngoing ? "ongoing" : "pending" };
        })
      );
    } catch (error) {
      console.error("Error fetching offline exams:", error);
    }
  };

  const fetchOnlineExamList = async () => {
    try {
      const res = await axios.get(
        `${config.BACKEND_URL}/api/student/online/available`,
        { withCredentials: true },
      );
      setOnlineExamList(res.data);
    } catch (err) {
      console.error("Gagal ambil daftar ujian online:", err);
      setOnlineExamList([]);
    }
  };

  //console.log(finishedExam);

  return (
    <div className="absolute bg-slate-50 w-full min-h-full h-auto">
      <Navbar />

      {finishedLoading ? (
        <main className="px-8 py-12">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl text-tec-darker font-bold">Upcoming Exams</h2>
              <p>Lists the exams you will take in the future.</p>
            </div>

            {/* ✅ Tombol Daftar Ujian */}
            <button
              onClick={() => setShowRegisterForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Daftar Ujian
            </button>
          </div>

          {/* ✅ Modal Form Daftar */}
          {showRegisterForm && (
            <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-2xl shadow-lg w-96">
                <h3 className="text-lg font-semibold mb-4 text-center">Form Pendaftaran Ujian</h3>
                <form onSubmit={handleRegisterExam}>
                  <label className="block mb-2 font-medium">Tipe Ujian</label>
                  <select
                    value={examType}
                    onChange={(e) => {
                      const type = e.target.value;
                      setExamType(type);
                      if (type === "offline") {
                        fetchOfflineExamList();
                        setOnlineExamList([]);
                      } else if (type === "online") {
                        fetchOnlineExamList(); // ✅ panggil langsung
                        setOfflineExamList([]);
                        setSelectedOfflineExam("");
                        setQuota(null);
                      } else {
                        setOfflineExamList([]);
                        setOnlineExamList([]);
                      }
                    }}
                    className="border rounded w-full mb-4 p-2"
                  >
                    <option value="">-- Pilih Tipe Ujian --</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>

                  {/* ✅ tampilkan kuota jika tipe = offline */}
                  {examType === "offline" && (
                    <>
                      <label className="block mb-2 font-medium">Pilih Ujian Offline</label>
                      <select
                        value={selectedOfflineExam}
                        onChange={(e) => setSelectedOfflineExam(e.target.value)}
                        className="border rounded w-full mb-4 p-2"
                        required
                      >
                        <option value="">-- Pilih Ujian Offline --</option>
                        {Array.isArray(offlineExamList) && offlineExamList.length > 0 ? (
                          offlineExamList.map((exam) => (
                            <option
                              key={exam.exam_id}
                              value={exam.exam_id}
                              disabled={exam.quota_available <= 0}
                            >
                              {exam.exam_title} — Kuota: {exam.quota_available}/{exam.quota_total}{" "}
                              {exam.quota_available <= 0 ? "(Penuh)" : ""}
                            </option>
                          ))
                        ) : (
                          <option disabled>⚠️ Tidak ada ujian offline tersedia</option>
                        )}
                      </select>

                      {/* tampilkan detail kuota */}
                      {selectedOfflineExam && (
                        <div className="mb-4 text-sm text-gray-700 bg-gray-100 p-2 rounded">
                          {(() => {
                            const selected = offlineExamList.find(
                              (exam) => exam.exam_id === selectedOfflineExam
                            );
                            return selected ? (
                              <>
                                Kuota tersedia:{" "}
                                <span className="font-semibold text-green-700">
                                  {selected.quota_available}
                                </span>{" "}
                                dari {selected.quota_total} <br />
                                Ruangan:{" "}
                                <span className="font-semibold">
                                  {selected.room || selected.room_name || "-"}
                                </span>
                                <br />
                                Jadwal:{" "}
                                {new Date(selected.start_datetime).toLocaleString("id-ID")}
                              </>
                            ) : null;
                          })()}
                        </div>
                      )}
                    </>
                  )}

                  {/* ✅ Jika tipe ujian = online */}
                  {examType === "online" && (
                    <>
                      <label className="block mb-2 font-medium">Pilih Ujian Online</label>
                      <select
                        value={selectedOnlineExam}
                        onChange={(e) => setSelectedOnlineExam(e.target.value)}
                        className="border rounded w-full mb-4 p-2"
                        required
                      >
                        <option value="">-- Pilih Ujian Online --</option>
                        {Array.isArray(onlineExamList) && onlineExamList.length > 0 ? (
                          onlineExamList.map((exam) => (
                            <option key={exam.idUjian} value={exam.idUjian}>
                              {exam.namaUjian} —{" "}
                              {new Date(exam.jadwalMulai).toLocaleString("id-ID")}
                            </option>
                          ))
                        ) : (
                          <option disabled>⚠️ Tidak ada ujian online tersedia</option>
                        )}
                      </select>
                    </>
                  )}

                  <label className="block mb-2 font-medium">Upload Bukti Pembayaran, 1 Gambar atau 1 PDF</label>
                  <div className="border border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50">
                    <p className="text-sm text-gray-600 mb-2">
                      {paymentProof ? (
                        <>
                          <span className="font-semibold text-green-700">File dipilih:</span>{" "}
                          {paymentProof.name}
                        </>
                      ) : (
                        "Belum ada file dipilih"
                      )}
                    </p>

                    {/* tombol custom */}
                    <label
                      htmlFor="paymentUpload"
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 cursor-pointer"
                    >
                      Pilih File
                    </label>

                    {/* input file asli tapi disembunyikan */}
                    <input
                      id="paymentUpload"
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => setPaymentProof(e.target.files[0])}
                      className="hidden"
                      required
                    />
                  </div>

                  {paymentProof && paymentProof.type.startsWith("image/") && (
                    <img
                      src={URL.createObjectURL(paymentProof)}
                      alt="Preview"
                      className="mt-3 w-40 h-auto rounded-lg shadow"
                    />
                  )}

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRegisterForm(false)}
                      className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      disabled={uploading}
                    >
                      {uploading ? "Mengirim..." : "Kirim"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {message && (
            <p className="mt-4 text-center text-green-700 font-semibold">{message}</p>
          )}

          {/* Existing Exam Cards */}
          <div className="flex flex-wrap gap-5 mt-5">
            {exams.length > 0 ? (
              exams.map((exam, idx) => {
                const startDatetime = new Date(exam.start_datetime);
                const endDatetime = new Date(exam.end_datetime);

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
                      if (exam.status === "ongoing") handleExamClick(exam);
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
          {/* ✅ Daftar Ujian Offline */}
          <div className="mt-10">
            <h2 className="text-xl text-tec-darker font-bold mb-3">Offline Exams</h2>
            <p>These are offline exams you have been registered for.</p>

            <div className="flex flex-wrap gap-5 mt-5">
              {offlineExams.length > 0 ? (
                offlineExams.map((exam, idx) => {
                  const startDatetime = new Date(exam.start_datetime);
                  const endDatetime = new Date(exam.end_datetime);

                  const startDate = startDatetime.toLocaleString("en-GB", { dateStyle: "medium" });
                  const endDate = endDatetime.toLocaleString("en-GB", { dateStyle: "medium" });
                  const startTime = startDatetime.toLocaleString("en-GB", { timeStyle: "short" });
                  const endTime = endDatetime.toLocaleString("en-GB", { timeStyle: "short" });

                  const dateString =
                    startDate === endDate
                      ? `${startDate} (${startTime} - ${endTime})`
                      : `${startDate} (${startTime}) - ${endDate} (${endTime})`;

                  return (
                    <div
                    key={idx}
                    className={`rounded-xl p-5 w-80 shadow-lg ${
                      exam.status === "ongoing"
                        ? "bg-tec-darker text-white"
                        : "bg-tec-card text-tec-darker"
                    }`}
                  >
                    <h3 className="font-bold">{exam.exam_title}</h3>
                    <p>{dateString}</p>
                    <p className="font-medium mt-1">Room: {exam.room_name}</p>
                    <p className="mt-2.5 font-semibold">
                      {exam.status === "ongoing" ? "Ongoing" : "Pending"}
                    </p>
                  </div>
                  );
                })
              ) : (
                <div className="text-tec-darker rounded-xl p-5 w-full text-center">
                  <h3 className="text-2xl font-bold">- No Offline Exams -</h3>
                  <p>You're not registered in any offline exam yet.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      ) : (
        <Loading />
      )}

      {modalFinishedOpen ? (
        <ModalFinished
          isOpen={modalFinishedOpen}
          openModal={setModalFinishedOpen}
          title="Ujian Selesai"
          message="Terima kasih sudah mengikuti ujian hari ini.
          Hasil akan segera diberitahukan dalam beberapa hari kerja." />
      ) : null}
    </div>
  );
}

export default StudentDashboard;
