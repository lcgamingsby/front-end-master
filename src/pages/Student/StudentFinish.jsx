import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import { config } from "../../data/config";
import { FaChevronLeft } from "react-icons/fa";
import axios from "axios";
import { useUser } from "../Components/UserContext";
import { getRefreshToken } from "../../data/helper";

const StudentFinish = () => {
    const { user } = useUser();

    const location = useLocation();
    const examID = location.state?.examID || 0;
    const examQuestions = location.state?.questions || [];
    const endDatetime = location.state?.endDatetime || "";
    const flagged = location.state?.flagged || [];
    const played = location.state?.hasPlayed || [];
    const displayTime = location.state?.displayTime || 0;

    const storagePrefix = `${examID}_${user.id}`;

    const navigate = useNavigate();

    // const recalculateTimeLeft = (dt) => {
    //     const currentDate = new Date();

    //     const timeDifference = dt.getTime() - currentDate.getTime();

    //     // remove milliseconds
    //     return Math.floor(timeDifference / 1000);
    // }

    // const endDate = new Date(endDatetime);
    const [timeLeft, setTimeLeft] = useState(displayTime);

    const [flaggedQuestions, setFlaggedQuestions] = useState(flagged);
    const [hasPlayed, setHasPlayed] = useState(played);

    const [answeredQuestions, setAnsweredQuestions] = useState([]);

    const recoverExistingAnswers = async () => {
        const answerResponse = await axios.get(
            `${config.BACKEND_URL}/api/student/answers/${examID}`, 
            { withCredentials: true },
        );

        const answerArray = (answerResponse.status === 200 && answerResponse.data.message === undefined)
            ? answerResponse.data.map((v, i) => {
                return {
                    question_id: v.question_id,
                    answer: v.answer,
                };
            })
            : [];
        
        setAnsweredQuestions(answerArray);
    }

    const handleFinishExam = async (e) => {
        if (flaggedQuestions.length > 0) {
            alert("You cannot finish the exam with questions flagged.")
            return
        };

        if (confirm("Are you sure to end this exam now?")) {
            // Reset semua data ujian
            localStorage.removeItem("seenInstructions");
            localStorage.removeItem(`exam_session_${examID}_${storagePrefix}`);
            localStorage.removeItem(`currentQuestion_${storagePrefix}`);
            localStorage.removeItem(`remainingTime_listening_${storagePrefix}`);
            localStorage.removeItem(`remainingTime_grammar_${storagePrefix}`);
            localStorage.removeItem(`remainingTime_reading_${storagePrefix}`);

            try {
                const endRes = await axios.put(
                    `${config.BACKEND_URL}/api/student/exam/finish`,
                    {
                        nim: user.id,
                        exam_id: examID,
                    },
                    { withCredentials: true },
                );
            
                if (endRes.status === 200) {
                    for (let i = 0; i < config.MAX_REFRESH_RETRIES; i++) {
                        try {
                            // 2. Hitung skor otomatis
                            await axios.post(
                            `${config.BACKEND_URL}/api/student/exam/submit/${user.id}/${examID}`,
                            {},
                            { withCredentials: true },
                            );
                        } catch (err) {
                            console.error("Gagal menghitung nilai:", err);

                            const res = await getRefreshToken();

                            if (res.status !== 200) {
                                console.error("Unable to refresh token: ", res.message);
                            }
                        }
                    }
                
                    navigate("/student", { state: { finished: true } });
                }
            } catch (err) {
                console.error("Gagal menyelesaikan ujian:", err);

                if (err.response?.status === 401) {
                    for (let i = 0; i < config.MAX_REFRESH_RETRIES; i++) {
                        try {
                        const res = await getRefreshToken();
            
                        if (res.status === 200) {
                            // re-run this function
                            handleExamClick(e);
                            // no need to loop after a success
                            break;
                        } else {
                            console.error("Unable to refresh token: ", res.message);
                        }
                        } catch (refreshErr) {
                        console.error("Token refresh failed:", refreshErr);
                        }
                    }
                }
            }
        }
    }

    useEffect(() => {
        recoverExistingAnswers();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                const newTime = prev > 0 ? prev - 1 : 0;
                localStorage.setItem(`remainingTime_reading_${storagePrefix}`, newTime);
                return newTime;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor(seconds / 60) % 60;
        const secs = seconds % 60;
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const returnToExam = () => {
        navigate("/student/exam", {
            state: {
                examID: examID,
                questions: examQuestions,
                endDatetime: endDatetime,
                flagged: flaggedQuestions,
                hasPlayed: hasPlayed
            },
        });
    }

    return (
        <div className="absolute bg-slate-50 w-full min-h-full h-auto">
            <Navbar examMode={true} />

            <main className="px-8 py-12">
                <div className="flex gap-2 items-baseline">
                    <button
                        className="text-tec-darker hover:text-tec-light cursor-pointer"
                        onClick={() => returnToExam()}
                    >
                        <FaChevronLeft className="w-6 h-6" />
                    </button>
                    <h2 className="text-4xl mb-5 text-tec-darker font-bold">Confirm Finishing Exam</h2>
                </div>
                <div className="bg-tec-card p-2 rounded-xl flex justify-between text-tec-darker sm:w-3/4 md:w-1/3">
                    <span className="text-left">Time Remaining:</span>
                    <b className="text-right">{formatTime(timeLeft)}</b>
                </div>

                <div className="my-4 font-semibold text-tec-darker text-justify">
                    {flaggedQuestions.length === 0 
                        ? "Make sure you have answered every question on the exam."
                        : "You cannot finish the exam with questions flagged."}
                </div>
                <table className="w-9/12 mx-auto border-collapse mb-4">
                    <thead>
                        <tr className="bg-tec-darker text-white text-center font-bold">
                            <th className="w-1/12 px-4 py-3 border-x-2 border-white border-l-tec-darker">No.</th>
                            <th className="w-11/12 px-4 py-3 border-x-2 border-white">Answer</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="bg-tec-darker text-white text-center font-bold">
                            <th colSpan={2} className="px-4 py-3 border-x-2 border-t-2 border-white border-l-tec-darker">Grammar</th>
                        </tr>
                        {examQuestions.grammar.map((v, i) => {
                            const flagged = flaggedQuestions.includes(v.question_id);
                            const answered = answeredQuestions.map((v, i) => (
                                v.question_id
                            )).includes(v.question_id);

                            const isOdd = i % 2 === 1;

                            return (
                                <tr
                                    key={v.question_id}
                                    className={`${isOdd ? "bg-slate-200" : "bg-white"} hover:bg-slate-300`}
                                >
                                    <td className="px-4 py-2 border-2 border-slate-400">{i + 1}</td>
                                    <td className="px-4 py-2 border-2 border-slate-400">
                                        {flagged ? (
                                            answered ? (
                                                <p>Answer saved, <span className="text-amber-500 font-semibold">Question flagged</span></p>
                                            ) : (
                                                <p className="text-amber-500 font-semibold">Question flagged</p>
                                            )
                                        ) : (
                                            answered ? (
                                                <p>Answer saved</p>
                                            ) : (
                                                <p className="text-red-600 font-semibold">Not yet answered</p>
                                            )
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        <tr className="bg-tec-darker text-white text-center font-bold">
                            <th colSpan={2} className="px-4 py-3 border-x-2 border-t-2 border-white border-l-tec-darker">Reading</th>
                        </tr>
                        {examQuestions.reading.map((v, i) => {
                            const flagged = flaggedQuestions.includes(v.question_id);
                            const answered = answeredQuestions.map((v, i) => (
                                v.question_id
                            )).includes(v.question_id);

                            const prevQuestions = examQuestions.grammar.length;

                            const isOdd = (i + prevQuestions) % 2 === 1;

                            return (
                                <tr
                                    key={v.question_id}
                                    className={`${isOdd ? "bg-slate-200" : "bg-white"} hover:bg-slate-300`}
                                >
                                    <td className="px-4 py-2 border-2 border-slate-400">{i + 1}</td>
                                    <td className="px-4 py-2 border-2 border-slate-400">
                                        {flagged ? (
                                            answered ? (
                                                <p>Answer saved, <span className="text-amber-500 font-semibold">Question flagged</span></p>
                                            ) : (
                                                <p className="text-amber-500 font-semibold">Question flagged</p>
                                            )
                                        ) : (
                                            answered ? (
                                                <p>Answer saved</p>
                                            ) : (
                                                <p className="text-red-600 font-semibold">Not yet answered</p>
                                            )
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        <tr className="bg-tec-darker text-white text-center font-bold">
                            <th colSpan={2} className="px-4 py-3 border-x-2 border-t-2 border-white border-l-tec-darker">Listening</th>
                        </tr>
                        {examQuestions.listening.map((v, i) => {
                            const flagged = flaggedQuestions.includes(v.question_id);
                            const answered = answeredQuestions.map((v, i) => (
                                v.question_id
                            )).includes(v.question_id);

                            const prevQuestions = examQuestions.grammar.length + examQuestions.reading.length;

                            const isOdd = (i + prevQuestions) % 2 === 1;

                            return (
                                <tr
                                    key={v.question_id}
                                    className={`${isOdd ? "bg-slate-200" : "bg-white"} hover:bg-slate-300`}
                                >
                                    <td className="px-4 py-2 border-2 border-slate-400">{i + 1}</td>
                                    <td className="px-4 py-2 border-2 border-slate-400">
                                        {flagged ? (
                                            answered ? (
                                                <p>Answer saved, <span className="text-amber-500 font-semibold">Question flagged</span></p>
                                            ) : (
                                                <p className="text-amber-500 font-semibold">Question flagged</p>
                                            )
                                        ) : (
                                            answered ? (
                                                <p>Answer saved</p>
                                            ) : (
                                                <p className="text-red-600 font-semibold">Not yet answered</p>
                                            )
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                
                <div className="w-9/12 mx-auto flex justify-end">
                    <button
                        type="submit"
                        className="bg-tec-darker hover:bg-tec-dark text-white py-2 px-5 font-bold
                        rounded-lg cursor-pointer"
                        onClick={handleFinishExam}
                    >
                        Finish Exam
                    </button>
                </div>
            </main>
        </div>
    );
};

export default StudentFinish;