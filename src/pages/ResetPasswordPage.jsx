import React, { useState } from "react";
import Navbar from "./Components/Navbar";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { config } from "../data/config";
import { useNavigate } from "react-router-dom";
import { useUser } from "./Components/UserContext";

function ResetPasswordPage() {
  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
  });

  const { user, setUser } = useUser();

  const [confirmPass, setConfirmPass] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const passLengthLowest = 6;
  const passLengthHighest = 12;

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.new_password.length < passLengthLowest
        || form.new_password.length > passLengthHighest) {
      alert("New password length must be in the range of 6-12 characters.");
      return;
    }

    if (form.new_password !== confirmPass) {
      alert("New password and confirm new password must be the same.");
      return;
    }

    try {
      const response = await axios.put(
        `${config.BACKEND_URL}/api/self/password`,
        form,
        { withCredentials: true },
      );
    } catch (e) {
      console.error("Error reset password:", e);

      if (e.response.status === 500) {
        alert("Something went wrong. Pleasde try again.");
        return;
      } else if (e.response.status === 404 || e.response.status === 400) {
        alert(`Failed to reset a password, with the error:\n${e.response.data.message}`);
        return;
      }
    }

    const role = user.role === "mahasiswa" ? "student" : user.role;

    //console.log(user);

    alert("Password successfully changed!");
    navigate(`/${role}`);
  }

  return (
    <div className="absolute bg-slate-50 w-full min-h-full h-auto">
      <Navbar />

      <main className="p-8">
        <h2 className="text-3xl md:text-4xl mb-5 text-tec-darker font-bold">
          Reset Password
        </h2>
        <p className="text-slate-700">
          While logged in, you <b>must</b> know your old password to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="text-left my-4 md:w-8/12 md:mx-auto">
          <label
            className="text-sm text-tec-darker font-semibold select-none"
            htmlFor="old_password"
          >
            OLD PASSWORD
          </label>
          <div className="flex gap-2 justify-between items-center mb-4">
            <input
              type={showOldPassword ? "text" : "password"}
              name="old_password"
              id="old_password"
              className="w-full px-3 py-2 border-2 border-slate-300 focus:outline-none hover:border-tec-light
              focus:border-tec-light rounded-lg grow"
              value={form.old_password}
              onChange={(e) => setForm({
                ...form,
                old_password: e.target.value,
              })}
              placeholder="Enter your old password"
              required="true"
            />
            <span
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="w-8 h-8"
            >
              {showOldPassword
                ? <FaEyeSlash className="w-8 h-8 text-tec-darker" />
                : <FaEye className="w-7.5 h-8 text-tec-darker" />
              }
            </span>
          </div>

          <label
            className="text-sm text-tec-darker font-semibold select-none"
            htmlFor="new_password"
          >
            NEW PASSWORD
          </label>
          <div className="flex gap-2 justify-between items-center mb-4">
            <input
              type={showNewPassword ? "text" : "password"}
              name="new_password"
              id="new_password"
              className="w-full px-3 py-2 border-2 border-slate-300 focus:outline-none hover:border-tec-light
              focus:border-tec-light rounded-lg grow"
              value={form.new_password}
              onChange={(e) => setForm({
                ...form,
                new_password: e.target.value,
              })}
              placeholder={`Enter your new password (${passLengthLowest}-${passLengthHighest} characters)`}
              required="true"
            />
            <span
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="w-8 h-8"
            >
              {showNewPassword
                ? <FaEyeSlash className="w-8 h-8 text-tec-darker" />
                : <FaEye className="w-7.5 h-8 text-tec-darker" />
              }
            </span>
          </div>

          <label
            className="text-sm text-tec-darker font-semibold select-none"
            htmlFor="confirm_password"
          >
            CONFIRM NEW PASSWORD
          </label>
          <div className="flex gap-2 justify-between items-center mb-4">
            <input
              type={showConfirmPass ? "text" : "password"}
              name="confirm_password"
              id="confirm_password"
              className="w-full px-3 py-2 border-2 border-slate-300 focus:outline-none hover:border-tec-light
              focus:border-tec-light rounded-lg grow"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="Re-enter your new password"
              required="true"
            />
            <span
              onClick={() => setShowConfirmPass(!showConfirmPass)}
              className="w-8 h-8"
            >
              {showConfirmPass
                ? <FaEyeSlash className="w-8 h-8 text-tec-darker" />
                : <FaEye className="w-7.5 h-8 text-tec-darker" />
              }
            </span>
          </div>

          <button
            type="submit"
            className="bg-tec-darker hover:bg-tec-dark text-white py-2 px-5 font-bold
              rounded-lg flex items-center gap-2 mt-5 cursor-pointer"
          >
            Reset Password
          </button>
        </form>
      </main>
    </div>
  );
}

export default ResetPasswordPage;