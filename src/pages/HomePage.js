import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <div className="home-app-bar">
        <div className="home-logo-container">
          <img src="/logoukdc.png" alt="Logo" className="home-logo" />
          <h1 className="home-test-title">TEC UKDC</h1>
        </div>
        <button className="home-login-button" onClick={() => navigate("/login")}>
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
