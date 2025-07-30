import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { config } from "../data/config";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function RegisterPage() {
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState("");
  const [nim, setNim] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Helper: validasi email domain
  const isValidEmail = (val) =>
    /^[a-zA-Z0-9._%+-]+@student\.ukdc\.ac\.id$/i.test(val.trim());

  // Helper: validasi password 6-12
  const isValidPassword = (val) => val.length >= 6 && val.length <= 12;

  // Helper: form ready?
  const formValid =
    name.trim().length > 0 &&
    nim.trim().length > 0 &&
    /^[0-9]+$/.test(nim) &&
    isValidEmail(email) &&
    isValidPassword(password);

  // input NIM: hanya angka
  const handleNimChange = (e) => {
    const v = e.target.value;
    if (/^[0-9]*$/.test(v)) setNim(v);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formValid) return;

    try {
      const payload = {
        name: name.trim(),
        nim: nim.trim(),
        email: email.trim().toLowerCase(),
        password, // min 6, max 12
      };

      // Dummy register endpoint — ganti sesuai backend kamu
      const res = await axios.post(`${config.backendUrl}register`, payload);

      if (res.status === 201 || res.status === 200) {
        alert("Akun berhasil dibuat. Silakan login.");
        navigate("/login");
      } else {
        alert("Gagal membuat akun. Coba lagi nanti.");
      }
    } catch (err) {
      console.error("Register failed:", err);
      const msg =
        err?.response?.data?.message ||
        "Terjadi kesalahan saat membuat akun. Coba lagi.";
      alert(msg);
    }
  };

  return (
    <div className="flex items-center justify-center w-screen min-h-screen bg-linear-135 from-tec-light to-tec-dark">
      <div className="bg-white py-10 px-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h2 className="mb-5 text-2xl text-tec-dark font-bold">Buat Akun</h2>

        <form onSubmit={handleSubmit} className="text-left">
          {/* Nama */}
          <label className="block text-sm font-semibold text-slate-700">Nama</label>
          <input
            type="text"
            value={name}
            placeholder="Nama lengkap"
            className="w-full py-3 px-4 my-2 border border-gray-300 rounded-lg text-lg outline-none hover:border-tec-light"
            onChange={(e) => setName(e.target.value)}
          />

          {/* NIM / NPM */}
          <label className="block mt-4 text-sm font-semibold text-slate-700">
            NPM/NIM
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={nim}
            placeholder="Hanya angka"
            className="w-full py-3 px-4 my-2 border border-gray-300 rounded-lg text-lg outline-none hover:border-tec-light"
            onChange={handleNimChange}
            maxLength={20}
          />
          <p className="text-xs mt-1">
            {nim && !/^[0-9]+$/.test(nim) && (
              <span className="text-red-600">Hanya boleh angka.</span>
            )}
          </p>

          {/* Email */}
          <label className="block mt-4 text-sm font-semibold text-slate-700">Email</label>
          <input
            type="email"
            value={email}
            placeholder="nama@student.ukdc.ac.id"
            className="w-full py-3 px-4 my-2 border border-gray-300 rounded-lg text-lg outline-none hover:border-tec-light"
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="text-xs mt-1">
            {email &&
              (isValidEmail(email) ? (
                <span className="text-emerald-600">Format email valid.</span>
              ) : (
                <span className="text-red-600">Wajib domain @student.ukdc.ac.id</span>
              ))}
          </p>

          {/* Password */}
          <label className="block mt-4 text-sm font-semibold text-slate-700">Password</label>
          <div className="w-full flex items-center justify-between border border-gray-300 rounded-lg my-2 px-4">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder="6–12 karakter"
              className="flex-grow py-3 text-lg outline-none"
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              maxLength={12}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-2"
            >
              {showPassword ? (
                <FaEyeSlash className="text-tec-dark w-5 h-5" />
              ) : (
                <FaEye className="text-tec-dark w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-xs mt-1">
            {password.length > 0 &&
              !(password.length >= 6 && password.length <= 12) && (
                <span className="text-red-600">Panjang password 6–12 karakter.</span>
              )}
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={!formValid}
            className={`w-full p-3 text-white text-lg font-semibold rounded-lg cursor-pointer transition mt-4
              ${formValid ? "bg-tec-light hover:bg-sky-400" : "bg-slate-300 cursor-not-allowed"}`}
          >
            Bikin Akun
          </button>

          {/* Link ke login */}
          <p className="mt-3 text-sm text-slate-500 text-center">
            Sudah punya akun?{" "}
            <span
              role="button"
              tabIndex={0}
              onClick={() => navigate("/login")}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && navigate("/login")
              }
              className="text-tec-light font-semibold cursor-pointer hover:opacity-90"
            >
              Masuk di sini
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
