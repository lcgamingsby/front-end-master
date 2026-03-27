import React, { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { config } from "../data/config";
import { FaChevronLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import { useUser } from "./Components/UserContext";
import ModalSuccess from "./Components/ModalSuccess";

function ForgotResetPasswordPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const nim = searchParams.get('nim');

  const [showWaitingResponse, setShowWaitingResponse] = useState(false);

  useEffect(() => {
    if ((token === null || nim === null) || (token?.length !== 64)) {
      navigate("/login");
    }
  }, []);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const passLengthLowest = config.PASSWORD_LENGTH_LOWEST;
  const passLengthHighest = config.PASSWORD_LENGTH_HIGHEST;

  const handleLogin = async (e) => {
    e.preventDefault();

    const validPassword = newPassword.length >= passLengthLowest && newPassword.length <= passLengthHighest;

    if (!validPassword) {
      alert(`Password baru harus memiliki antara ${passLengthLowest}-${passLengthHighest} karakter.`);
      return;
    }

    if (newPassword !== confirmPass) {
      alert("Password baru dan konfirmasi password baru harus sama.");
      return;
    }

    try {
      setShowWaitingResponse(false);

      const response = await axios.post(
        `${config.BACKEND_URL}/forgot/reset`,
        {
          nim: nim,
          token: token,
          new_password: newPassword,
        },
      );

      setShowWaitingResponse(true);
    } catch (e) {
      console.error("Error reset password:", e);

      if (e.response.status === 500) {
        alert("Ada yang bermasalah. Silahkan coba lagi.");
        return;
      } else if (e.response.status === 404 || e.response.status === 400) {
        alert(`Gagal mereset password, dengan error:
          \n${e.response.data.message}
          \n\nAnda perlu meminta link reset password baru.`);
        
        navigate("/forgot");
        return;
      }
    }

    alert("Password berhasil diubah! Silahkan login lagi.");
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-linear-135 from-tec-light to-tec-dark">
      <div className="bg-white py-10 px-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl text-center font-bold mb-2 text-tec-dark">
          Reset Password
        </h2>
        <p className="text-sm text-slate-500 mb-5">
          Masukkan password baru Anda, dengan jumlah {passLengthLowest}-{passLengthHighest} karakter.
        </p>
        <form onSubmit={handleLogin} className="text-left w-9/10 mx-auto">
          <label className="block mt-4 text-sm font-semibold text-slate-700">Password Baru</label>
          <div className="w-full flex items-center justify-between border border-gray-300 rounded-lg mt-1 mb-2 py-3 px-4 hover:border-tec-light">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              placeholder={`${passLengthLowest}-${passLengthHighest} karakter`}
              className="flex-grow max-w-11/12 outline-none"
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={passLengthLowest}
              maxLength={passLengthHighest}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="text-tec-dark hover:text-tec-light cursor-pointer"
            >
              {showNewPassword ? (
                <FaEyeSlash className="w-6 h-6" />
              ) : (
                <FaEye className="w-6 h-6" />
              )}
            </button>
          </div>

          <label className="block mt-4 text-sm font-semibold text-slate-700">
            Konfirmasi Password Baru
          </label>
          <div
            className="w-full flex items-center justify-between border border-gray-300
              rounded-lg mt-1 mb-2 py-3 px-4 hover:border-tec-light"
          >
            <input
              type={showConfirmPass ? "text" : "password"}
              value={confirmPass}
              placeholder="Masukkan ulang password baru"
              className="flex-grow max-w-11/12 outline-none"
              onChange={(e) => setConfirmPass(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPass(!showConfirmPass)}
              className="text-tec-dark hover:text-tec-light cursor-pointer"
            >
              {showConfirmPass ? (
                <FaEyeSlash className="w-6 h-6" />
              ) : (
                <FaEye className="w-6 h-6" />
              )}
            </button>
          </div>

          <button type="submit" className="w-full p-3 bg-tec-light text-white text-lg
            font-semibold rounded-lg cursor-pointer transition mt-3 hover:bg-sky-400"
          >
            Reset
          </button>
        </form>
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

export default ForgotResetPasswordPage;