import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { students, admins } from "../data/users";
import "../App.css";

function LoginPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    const admin = admins.find(user => user.name === name && user.password === password);
    const student = students.find(user => user.name === name && user.password === password);

    if (admin) {
      localStorage.setItem("loggedInUser", JSON.stringify({ ...admin, role: "admin" }));
      navigate("/admin");
    } else if (student) {
      localStorage.setItem("loggedInUser", JSON.stringify({ ...student, role: "student" }));
      navigate("/student");
    } else {
      alert("Akun belum terdaftar / tidak ada");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Login</h2>
        <form>
          <input
            type="text"
            placeholder="Nama"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="password"
            placeholder="Kata Sandi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handleLogin}>Masuk</button>
        </form>
        <p className="note">Gunakan akun yang telah terdaftar.</p>
      </div>
    </div>
  );
}

export default LoginPage;