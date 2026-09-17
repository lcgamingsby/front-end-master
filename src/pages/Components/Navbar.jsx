import React, { useState } from "react";
import { FaChevronDown, FaChevronUp, FaEdit, FaKey, FaList, FaSignOutAlt, FaStar } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import axios from "axios";
import { config } from "../../data/config";

function Navbar({ examMode = false }) {
    const navigate = useNavigate();
    const location = useLocation();

    const { user, setUser } = useUser();

    const [showExamDropdown, setShowExamDropdown] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);

    const handleLogout = async () => {
        try {
            const response = await axios.post(
                `${config.BACKEND_URL}/logout`,
                {},
                { withCredentials: true },
            );

            if (response.status >= 200 && response.status < 300) {
                setUser(undefined);
        
                navigate("/login");
            } else {
                console.error("Unexpected logout response:", e);
            }
        } catch (e) {
            console.error("Failed to log out:", e);
        }
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
                    <div className="relative">
                        <button
                            className={`${(location.pathname == "/admin/exams" || location.pathname == "/admin/registrations" || location.pathname == "/admin/scores")
                                ? "bg-tec-dark hover:bg-tec-light text-white"
                                : "text-tec-dark hover:bg-slate-200"}
                                py-5 px-6 border-0 font-semibold transition-colors
                                duration-150 cursor-pointer flex items-center gap-2`}
                            // onClick={() => navigate("/admin/exams")}
                            onClick={() => {
                                setShowExamDropdown(!showExamDropdown);
                            }}
                        >
                            Exams
                            {(showExamDropdown ? <FaChevronUp /> : <FaChevronDown />)}
                        </button>

                        {showExamDropdown ? (
                            <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-xl py-1 z-20">
                                <button
                                    className="block px-4 py-2 text-tec-dark hover:bg-slate-200 w-full text-left font-semibold cursor-pointer"
                                    onClick={() => navigate("/admin/exams")}
                                >
                                    <FaList className="inline" /> Exam List
                                </button>
                                <button
                                    className="block px-4 py-2 text-tec-dark hover:bg-slate-200 w-full text-left font-semibold cursor-pointer"
                                    onClick={() => navigate("/admin/scores")}
                                >
                                    <FaStar className="inline" /> Scores
                                </button>
                                <button
                                    className="block px-4 py-2 text-tec-dark hover:bg-slate-200 w-full text-left font-semibold cursor-pointer"
                                    onClick={() => navigate("/admin/registrations")}
                                >
                                    <FaEdit className="inline" /> Registrations
                                </button>
                            </div>
                        ) : null}
                    </div>
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
                className="text-right text-sm hover:bg-slate-200 py-3 px-2 text-tec-darker flex items-center gap-2 cursor-pointer"
                onClick={() => {
                    if (!examMode) {
                        setShowProfileDropdown(!showProfileDropdown);
                    }
                }}
            >
                <span>
                    <strong>{user.role == 'mahasiswa' ? "STUDENT" : "ADMIN"}</strong><br/>
                    <span>{user.name.length > 50 ? user.name.slice(0, 50 + 1).trim() + "..." : user.name}
                    </span>
                </span>
            {!examMode ? (showProfileDropdown ? <FaChevronUp /> : <FaChevronDown />) : null}
            </button>

            {showProfileDropdown && !examMode ? (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-xl py-1 z-20">
                    <button
                        className="block px-4 py-2 text-slate-600 hover:bg-slate-200 w-full text-left font-semibold cursor-pointer"
                        onClick={handleResetPassword}
                    >
                        <FaKey className="inline" /> Reset Password
                    </button>
                    <button
                        className="block px-4 py-2 text-red-600 hover:bg-red-200 w-full text-left font-semibold cursor-pointer"
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