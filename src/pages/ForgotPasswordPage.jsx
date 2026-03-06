import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { config } from "../data/config";
import { FaChevronLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import { useUser } from "./Components/UserContext";
import ModalSuccess from "./Components/ModalSuccess";
import Loading from "./Components/Loading";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [showWaitingResponse, setShowWaitingResponse] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (email === "" || !isValidEmail(email)) {
      alert("Please provide a valid e-mail.");
      return;
    } else {
      setShowWaitingResponse(true);

      const response = await axios.post(`${config.BACKEND_URL}/forgot`, {
        email: email,
      });

      setShowWaitingResponse(false);

      if (response.status >= 200 && response.status < 300) {
        setShowModal(true);
      }
    }
  };

  const isValidEmail = (val) =>
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val.trim());

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-linear-135 from-tec-light to-tec-dark">
      <div className="bg-white py-10 px-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <div className="flex items-center justify-between gap-2 mb-2 text-tec-dark">
          <Link
            to="/login"
            className="text-tec-dark hover:text-tec-light cursor-pointer"
          >
            <FaChevronLeft className="h-6 w-6" />
          </Link>
          <h2 className="text-2xl text-center font-bold grow">
            Lupa Password
          </h2>
        </div>
        <p className="text-sm text-slate-500 mb-5">
          Masukkan email Anda dibawah dan kami akan mengirimkan link untuk mengubah password Anda.
        </p>
        <form onSubmit={handleSubmit} className="text-left w-9/10 mx-auto">
          <label className="block mt-4 text-sm font-semibold text-slate-700">E-mail</label>
          <input
            type="email"
            value={email}
            placeholder="misal: email.saya@gmail.com"
            className="w-full py-3 px-4 mt-1 mb-3 border border-gray-300 rounded-lg text-lg outline-none hover:border-tec-light"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <p className="text-xs mt-1">
            {email &&
              (isValidEmail(email) ? (
                <span className="text-emerald-600">Format email valid.</span>
              ) : (
                <span className="text-red-600">Format email tidak sesuai.</span>
              ))}
          </p>

          <button type="submit" className="w-full p-3 bg-tec-light text-white text-lg
            font-semibold rounded-lg cursor-pointer transition mt-3 hover:bg-sky-400"
          >
            Reset
          </button>
        </form>
        <p className="note mt-3 text-sm text-slate-500">
          Belum punya akun?{" "}
          <Link to="/register" className="text-tec-light font-semibold hover:opacity-90">
            Daftar di sini
          </Link>
        </p>
      </div>

      { showWaitingResponse ? (
        <div className="z-10 fixed inset-0 cursor-wait bg-slate-300/75 flex items-center align-middle">
          <Loading
            text="Creating your email. Please wait."
            color="sky-300"
          />
        </div>
      ) : null}

      <ModalSuccess
        isOpen={showModal}
        openModal={setShowModal}
        title="E-mail Sent"
        message={`A link to reset your password has been sent to your e-mail. You may need to
          check your spam folder.`}
        action="Return to Login page"
        onClose={() => {
          navigate("/login");
        }}
      />
    </div>
  );
}

export default ForgotPasswordPage;