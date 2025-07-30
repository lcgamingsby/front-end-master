import React from "react";
import TecSchedule from "../TecSchedule";
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

      <div className="max-w-255 mx-auto my-25 bg-white p-10 rounded-xl shadow-lg text-slate-700 text-center">
        <h2 className="font-bold text-tec-dark mb-5 text-2xl">INFORMASI TEC UKDC</h2>
        <p className="text-lg my-3">Kursus ini dirancang untuk membantu peserta dan mahasiswa untuk mempelajari strategi dalam mengerjakan soal-soal TEC (Test of English Competence)</p>
        <br></br>
        <TecSchedule />   
      </div>
    </div>
  );
}

export default HomePage;
