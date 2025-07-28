import React, { useState } from "react";
import { FaChevronDown, FaChevronUp, FaKey, FaSignOutAlt } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";

function Navbar({ examMode = false }) {
    const navigate = useNavigate();
    const location = useLocation();

    const { user, setUser } = useUser();

    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("jwtToken");
        setUser(null);
        navigate("/login");
    }

    const handleResetPassword = () => {
        const role = user.role === "mahasiswa" ? "student" : user.role;

        navigate(`/${role}/reset`);
    }

    return (
    <div className="flex gap-1 md:gap-2 justify-between items-center px-10 mx-auto bg-white shadow-xl sticky top-0 left-0 z-10">
        <div className="flex justify-start items-center gap-8">
            <div className="flex items-center select-none">
                <img src="/logoukdc.png" alt="Logo" className="w-12 h-12 mr-3.5" />
                <h1 className="text-2xl text-tec-dark font-bold">TEC UKDC</h1>
            </div>
            {user.role === "admin" ? (
                <div className="flex items-center select-none gap-1">
                    <button
                        className={`${location.pathname == "/admin" ? "bg-tec-dark hover:bg-tec-light text-white"
                            : "text-tec-dark hover:bg-slate-200"} py-5 px-6 border-0 font-semibold transition-colors
                            duration-150 cursor-pointer`}
                        onClick={() => navigate("/admin")}
                    >
                        Home
                    </button>
                    <button
                        className={`${location.pathname == "/admin/exams" ? "bg-tec-dark hover:bg-tec-light text-white"
                            : "text-tec-dark hover:bg-slate-200"} py-5 px-6 border-0 font-semibold transition-colors
                            duration-150 cursor-pointer`}
                        onClick={() => navigate("/admin/exams")}
                    >
                        Exams
                    </button>
                    <button
                        className={`${location.pathname == "/admin/questions" ? "bg-tec-dark hover:bg-tec-light text-white"
                            : "text-tec-dark hover:bg-slate-200"} py-5 px-6 border-0 font-semibold transition-colors
                            duration-150 cursor-pointer`}
                        onClick={() => navigate("/admin/questions")}
                    >
                        Questions
                    </button>
                    <button
                        className={`${location.pathname == "/admin/students" ? "bg-tec-dark hover:bg-tec-light text-white"
                            : "text-tec-dark hover:bg-slate-200"} py-5 px-6 border-0 font-semibold transition-colors
                            duration-150 cursor-pointer`}
                        onClick={() => navigate("/admin/students")}
                    >
                        Students
                    </button>
                </div>
            ) : null}
        </div>
        <div className="relative">
            <button
                className="text-right text-sm hover:bg-slate-200 py-3 px-2 text-tec-darker flex items-center gap-2"
                onClick={() => {
                    if (!examMode) {
                        setShowDropdown(!showDropdown)
                    }
                }}
            >
                <span>
                    <strong>{user.role == 'mahasiswa' ? "STUDENT" : "ADMIN"}</strong><br/>
                    <span>{user.name.length > 50 ? user.name.slice(0, 50 + 1).trim() + "..." : user.name}
                    </span>
                </span>
            {!examMode ? (showDropdown ? <FaChevronUp /> : <FaChevronDown />) : null}
            </button>

            {showDropdown && !examMode ? (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-xl py-1 z-20">
                    {/*
                    <button
                        className="block px-4 py-2 text-slate-600 hover:bg-slate-200 w-full text-left font-semibold"
                        onClick={handleResetPassword}
                    >
                        <FaKey className="inline" /> Reset Password
                    </button>
                    */}
                    <button
                        className="block px-4 py-2 text-red-600 hover:bg-red-200 w-full text-left font-semibold"
                        onClick={handleLogout}>
                        <FaSignOutAlt className="inline" /> Sign Out
                    </button>
                </div>
            ) : null}
        </div>
    </div>
    );
}

export default Navbar;