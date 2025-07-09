import React from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="absolute w-full min-h-full h-auto bg-linear-135 from-tec-light to-tec-dark text-white">
      <div className="flex justify-between items-center px-10 mx-auto bg-white shadow-lg">
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

      <div className="max-w-xl mx-auto my-15 bg-white p-10 rounded-xl shadow-lg text-slate-700 text-center">
        <h2 className="font-bold text-tec-dark mb-5 text-2xl">Informasi Tes TEC</h2>
        <p className="text-lg my-3">🗓 Jadwal: Setiap Senin & Kamis</p>
        <p className="text-lg my-3">💰 Biaya: Rp 150.000</p>
        <p className="text-lg my-3">👩‍🏫 Pengajar: Dosen Bahasa Inggris Berpengalaman</p>
        <p className="text-lg my-3">📍 Lokasi: Ruang Lab Bahasa 2</p>
      </div>
    </div>
  );
}

export default HomePage;
