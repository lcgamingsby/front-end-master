import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { config } from "../data/config";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useUser } from "./Components/UserContext";

function LoginPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { setUser } = useUser();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${config.BACKEND_URL}/login`, {
        username: name,
        password: password,
      }, { withCredentials: true });

      if (response.status === 200) {
        const userRes = await axios.get(
          `${config.BACKEND_URL}/api/me`,
          { withCredentials: true }
        );

        setUser(userRes.data);

        if (userRes.data.role === "admin") {
          navigate("/admin");
        } else if (userRes.data.role === "mahasiswa") {
          navigate("/student");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Username/email atau password salah. Silakan coba lagi.");
    }
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-linear-135 from-tec-light to-tec-dark">
      <div className="bg-white py-10 px-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h2 className="mb-5 text-2xl text-tec-dark font-bold">Login</h2>
        <form onSubmit={handleLogin} className="w-9/10 mx-auto text-left">
          <label className="block text-sm font-semibold text-slate-700">Username/E-mail</label>
          <input
            type="text"
            placeholder="Username atau E-mail"
            value={name}
            className="w-full py-3 px-4 mt-1 mb-3 border border-gray-300 rounded-lg text-lg outline-none
              hover:border-tec-light"
            onChange={(e) => setName(e.target.value)}
          />

          <label className="block text-sm font-semibold text-slate-700">Password</label>
          <div className="grid grid-cols-1 justify-start w-full">
            <div
              className="py-3 px-4 mt-1 mb-3 border border-gray-300 rounded-lg text-lg outline-none
                flex items-center justify-between hover:border-tec-light"
            >
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                className="flex-grow max-w-11/12 outline-none"
                
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-tec-dark hover:text-tec-light cursor-pointer"
              >
                {showPassword ? (
                  <FaEyeSlash className="w-6 h-6" />
                ) : (
                  <FaEye className="w-6 h-6" />
                )}
              </button>
              
            </div>
            <Link to="/forgot" className="text-left text-tec-light font-semibold hover:opacity-90">
                Lupa password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full p-3 bg-tec-light text-white text-lg font-semibold rounded-lg
              cursor-pointer transition mt-3 hover:bg-sky-400"
          >
            Masuk
          </button>
        </form>
        <p className="note mt-3 text-sm text-slate-500">
          Belum punya akun?{" "}
          <Link to="/register" className="text-tec-light font-semibold hover:opacity-90">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;