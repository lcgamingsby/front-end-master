import React from "react";
import { useNavigate } from "react-router-dom";
import "../App_old.css";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-linear-135 from-tec-light to-tec-dark text-white">
      <div className="flex justify-between items-center py-5 px-10 bg-white shadow-lg">
        <div className="flex items-center">
          <img src="/logoukdc.png" alt="Logo" className="w-12 h-12 mr-3.5" />
          <h1 className="text-2xl text-tec-dark">TEC UKDC</h1>
        </div>
        <button className="bg-tec-light text-white py-3 px-6 border-0 text-lg font-semibold transition-colors duration-300 cursor-pointer" onClick={() => navigate("/login")}>
          Login
        </button>
      </div>

      <div className="home-content">
        <h2>Informasi Tes TEC</h2>
        <p>🗓 Jadwal: Setiap Senin & Kamis</p>
        <p>💰 Biaya: Rp 150.000</p>
        <p>👩‍🏫 Pengajar: Dosen Bahasa Inggris Berpengalaman</p>
        <p>📍 Lokasi: Ruang Lab Bahasa 2</p>
      </div>
    </div>
  );
}

export default HomePage;
