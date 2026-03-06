import React, { useState } from "react";
import TecSchedule from "./Components/TecSchedule";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("jadwal"); // default = jadwal

  return (
    <div className="absolute w-full min-h-full h-auto bg-linear-135 from-tec-light to-tec-dark text-white">
      {/* Header */}
      <div className="flex sticky top-0 left-0 justify-between items-center px-10 mx-auto bg-white shadow-xl">
        <div className="flex items-center select-none">
          <img src="/logoukdc.png" alt="Logo" className="w-12 h-12 mr-3.5" />
          <h1 className="text-2xl text-tec-dark font-bold">TEC UKDC</h1>
        </div>
        <button
          className="bg-tec-dark hover:bg-tec-light text-white py-5 px-6 border-0 text-lg font-semibold
            transition-colors duration-150 cursor-pointer"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
      </div>

      {/* Main Content */}
      <div
        className="w-23/24 sm:max-w-5xl mx-auto my-15 bg-white py-10 rounded-xl shadow-lg
          text-slate-600 text-center"
      >
        <h2 className="font-bold text-tec-darker mb-5 text-2xl px-4 sm:px-10">
          INFORMASI TEC UKDC
        </h2>
        <p className="text-lg my-3 px-4 sm:px-10">
          Selamat datang di TEC (<i>Test of English Competence</i>) Online UKDC.
        </p>

        {/* Tombol Switch */}
        <div className="flex justify-center mt-6 space-x-4">
          <button
            onClick={() => setActiveTab("jadwal")}
            className={`px-6 py-2 rounded-lg font-semibold border transition-all duration-150 cursor-pointer ${
              activeTab === "jadwal"
                ? "bg-tec-dark text-white border-tec-dark"
                : "bg-white text-tec-dark border-tec-dark hover:bg-tec-light hover:text-white"
            }`}
          >
            Jadwal
          </button>
          <button
            onClick={() => setActiveTab("instruksi")}
            className={`px-6 py-2 rounded-lg font-semibold border transition-all duration-150 cursor-pointer ${
              activeTab === "instruksi"
                ? "bg-tec-dark text-white border-tec-dark"
                : "bg-white text-tec-dark border-tec-dark hover:bg-tec-light hover:text-white"
            }`}
          >
            Instruksi
          </button>
        </div>

        {/* Konten Berdasarkan Tab */}
        <div className="mt-3 text-left px-4 sm:px-10">
          {activeTab === "jadwal" ? (
            <TecSchedule />
          ) : (
            <div>
              <h3 className="text-xl font-bold text-tec-darker mb-4 text-center">
                📋 Langkah-langkah Pendaftaran TEC
              </h3>
              <ol className="list-decimal ml-6 space-y-3 text-base">
                <li>
                  Klik tombol <strong>Login</strong> di kanan atas halaman.
                </li>
                <li>
                  Jika belum memiliki akun, klik <strong>Daftar</strong> untuk
                  membuat akun baru.
                </li>
                <li>
                  Setelah berhasil mendaftar, lakukan <strong>Login</strong>{" "}
                  dengan akun yang baru dibuat.
                </li>
                <li>
                  Setelah login, tekan tombol{" "}
                  <strong className="text-green-600">Daftar (Hijau)</strong> di
                  sebelah kanan untuk memulai pendaftaran TEC.
                </li>
                <li>
                  Di halaman pendaftaran, pilih jenis ujian yang ingin diikuti:{" "}
                  <strong>Offline</strong> atau <strong>Online</strong>.
                </li>
                <li>
                  Unggah dokumen yang diminta(Dalam Bentuk PDF):
                  <ul className="list-disc ml-6 mt-2">
                    <li>
                      📸 <strong>Pas Foto 4x6</strong> memakai jas almamater,
                      background merah, tidak selfie, dan nama file sesuai nama
                      pendaftar.
                    </li>
                    <li>
                      🧾 <strong>Bukti Pembayaran</strong> (kwitansi resmi dari
                      BAK, bukan screenshot pembayaran online).
                    </li>
                    <li>
                      🪪 <strong>Foto Kartu Tanda Mahasiswa</strong>.
                    </li>
                  </ul>
                </li>
                <li>
                  Setelah semua data lengkap, klik tombol{" "}
                  <strong>Kirim / Submit</strong>.
                </li>
              </ol>

              <div className="mt-8">
                <p className="font-semibold text-tec-dark"> 
                  ⚠️ Briefing TEC diwajibkan bagi semua peserta.
                </p>
                <p className="mt-2">
                  Briefing akan diadakan pada hari yang sama pukul{" "}
                  <strong>11:30 di ruang AV lantai 3</strong>. Peserta yang tidak
                  hadir briefing{" "}
                  <strong>tidak diperkenankan mengikuti tes</strong>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
