import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { students, admins } from "../data/users";
import "../App_old.css";
import axios from "axios";
import { config } from "../data/config";

function LoginPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(config.backendUrl + "/login", {
        username: name,
        password: password,
      });

      if (response.status === 200 && response.data.token) {
        localStorage.setItem("jwtToken", response.data.token);

        if (response.data.user) {
          localStorage.setItem("loggedInUser", JSON.stringify(response.data.user));
          // Redirect based on role
          if (response.data.user.role === "admin") {
            navigate("/admin");
          } else if (response.data.user.role === "mahasiswa") {
            navigate("/student");
          } else {
            navigate("/");
          }
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Akun tidak ada atau belum terdaftar. Silakan coba lagi.");
    }
  };

  // Redirect if already logged in
  const loggedInUser = localStorage.getItem("loggedInUser");

  if (loggedInUser) {
    const user = JSON.parse(loggedInUser);
    if (user.role === "admin") {
      navigate("/admin");
    } else if (user.role === "mahasiswa") {
      navigate("/student");
    } else {
      navigate("/");
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username atau E-mail"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Masuk</button>
        </form>
        <p className="note">Gunakan akun yang telah terdaftar.</p>
      </div>
    </div>
  );
}

export default LoginPage;