import React, { useState, useEffect, useRef } from "react";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import { config } from "../../data/config";
import { FaCheck, FaChevronLeft, FaChevronRight, FaFlag, FaPlay } from "react-icons/fa";
import axios from "axios";
import { useUser } from "../Components/UserContext";
import GrammarUnderline from "../Components/GrammarUnderline";

const StudentExam = () => {
    const { user } = useUser();

    const location = useLocation();
    const examID = location.state?.examID || 0;
    const examQuestions = location.state?.questions || [];
    const endDatetime = location.state?.endDatetime || "";
    const flagged = location.state?.flagged || [];
    const played = location.state?.hasPlayed || [];

    const navigate = useNavigate();

    const recalculateTimeLeft = (dt) => {
        const currentDate = new Date();

        const timeDifference = dt.getTime() - currentDate.getTime();

        // remove milliseconds
        return Math.floor(timeDifference / 1000);
    }

    const endDate = new Date(endDatetime);

    const [flaggedQuestions, setFlaggedQuestions] = useState(flagged);
    const [answeredQuestions, setAnsweredQuestions] = useState([]);

    const [currentQuestion, setCurrentQuestion] = useState({
        index: 0,
        type: "grammar",
    });
    const [selectedOption, setSelectedOption] = useState("");
    const [hasPlayed, setHasPlayed] = useState(played);
    const [playing, setPlaying] = useState(false);
    const [timeLeft, setTimeLeft] = useState(recalculateTimeLeft(endDate));

    const audioRef = useRef(null);

    useEffect(() => {
        if (currentQuestion.type === "listening") {
            const newAudio = new Audio(`
                ${config.BACKEND_URL}/audio/${examQuestions[currentQuestion.type][currentQuestion.index].audio_path}
            `);
            audioRef.current = newAudio;
            audioRef.current.load();
        } else {
            audioRef.current = null;
        }
        
        setPlaying(false);
    }, [currentQuestion]);

    const recoverExistingAnswers = async () => {
        const token = localStorage.getItem("jwtToken");
        
        const answerResponse = await axios.get(`${config.BACKEND_URL}/api/student/answers/${examID}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

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

    useEffect(() => {
        recoverExistingAnswers();

        document.addEventListener("visibilitychange", function() {
            if (document.hidden) {
                console.log("Page is hidden.");

                // todo: send to backend
            } else {
                console.log("Page is visible.");
            }
        });
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (timeLeft === 0) {
            finishExam();

            alert("Time's up!");

            navigate("/student");
        }
    }, [timeLeft]);

    const finishExam = async (e) => {
        // used only when time's up
        const token = localStorage.getItem("jwtToken");

        const endRes = await axios.put(`${config.BACKEND_URL}/api/student/exam/finish`, {
            nim: user.id,
            exam_id: examID,
        }, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        });
    }

    const handleFlag = () => {
        if (!flaggedQuestions.includes(examQuestions[currentQuestion.type][currentQuestion.index].question_id)) {
            setFlaggedQuestions((prev) => [...prev, examQuestions[currentQuestion.type][currentQuestion.index].question_id]);
        } else {
            setFlaggedQuestions(flaggedQuestions.filter((v, i) => (
                v !== examQuestions[currentQuestion.type][currentQuestion.index].question_id
            )));
        }
    };

    const handlePlayPause = () => {
        if (audioRef.current) {
            if (!playing) {
                audioRef.current.play();
            }
            setPlaying(true);
            setHasPlayed([...hasPlayed, examQuestions[currentQuestion.type][currentQuestion.index].question_id]);
        }
    };

    const handleOptionClick = async (index) => {
        const q = examQuestions[currentQuestion.type][currentQuestion.index];

        // send answer to backend first
        try {
            const token = localStorage.getItem("jwtToken");

            const answerData = {
                "answer": (index === selectedOption ? "" : index),
                "question_id": q.question_id,
                "nim": user.id,
                "exam_id": examID,
            }

            console.log(answerData);

            await axios.post(`${config.BACKEND_URL}/api/student/exam/${examID}`, answerData, {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            });
        } catch (e) {
            console.error("Error answering question:", e);
            return
        }

        const otherAnswered = answeredQuestions.filter((v, i) => (
            v.question_id !== q.question_id
        ));

        if (selectedOption !== index) {
            setSelectedOption(index);

            setAnsweredQuestions([
                ...otherAnswered,
                {
                    question_id: q.question_id,
                    answer: index,
                }
            ]);
        } else {
            setSelectedOption("");

            setAnsweredQuestions([
                ...otherAnswered,
            ]);
        }
    };

    const handlePrev = () => {
        // send student's answer to the backend

        if (currentQuestion.index > 0) {
            const q = examQuestions[currentQuestion.type][currentQuestion.index - 1];
            const answered = answeredQuestions.map((v, i) => (
                v.question_id
            ));
            
            setCurrentQuestion({
                ...currentQuestion,
                index: currentQuestion.index - 1,
            });

            if (answered.includes(q.question_id)) {
                const answer = answeredQuestions.filter((v, i) => (
                    v.question_id === q.question_id
                ))[0];

                setSelectedOption(answer.answer);
            } else {
                setSelectedOption("");
            }

            if (audioRef.current) {
                audioRef.current.pause();
            }
        } else if (currentQuestion.index == 0) {
            if (currentQuestion.type != "grammar") {
                const type = currentQuestion.type === "listening"
                    ? "reading"
                    : "grammar";
                
                const q = examQuestions[type][examQuestions[type].length - 1];
                const answered = answeredQuestions.map((v, i) => (
                    v.question_id
                ));

                setCurrentQuestion({
                    type: type,
                    index: examQuestions[type].length - 1,
                });

                if (answered.includes(q.question_id)) {
                    const answer = answeredQuestions.filter((v, i) => (
                        v.question_id === q.question_id
                    ))[0];

                    setSelectedOption(answer.answer);
                } else {
                    setSelectedOption("");
                }
                
                if (audioRef.current) {
                    audioRef.current.pause();
                }
            }
        }
    }

    const handleNext = () => {
        // send student's answer to the backend
    
        if (currentQuestion.index < examQuestions[currentQuestion.type].length - 1) {
            const q = examQuestions[currentQuestion.type][currentQuestion.index + 1];
            const answered = answeredQuestions.map((v, i) => (
                v.question_id
            ));

            setCurrentQuestion({
                ...currentQuestion,
                index: currentQuestion.index + 1,
            });

            if (answered.includes(q.question_id)) {
                const answer = answeredQuestions.filter((v, i) => (
                    v.question_id === q.question_id
                ))[0];

                setSelectedOption(answer.answer);
            } else {
                setSelectedOption("");
            }
            
            if (audioRef.current) {
                audioRef.current.pause();
            }
        } else if (currentQuestion.index == examQuestions[currentQuestion.type].length - 1) {
            if (currentQuestion.type != "listening") {
                const type = currentQuestion.type === "grammar"
                    ? "reading"
                    : "listening";
                
                const q = examQuestions[type][0];
                const answered = answeredQuestions.map((v, i) => (
                    v.question_id
                ));

                setCurrentQuestion({
                    type: type,
                    index: 0,
                });

                if (answered.includes(q.question_id)) {
                    const answer = answeredQuestions.filter((v, i) => (
                        v.question_id === q.question_id
                    ))[0];

                    setSelectedOption(answer.answer);
                } else {
                    setSelectedOption("");
                }
                
                if (audioRef.current) {
                    audioRef.current.pause();
                }
            } else {
                navigate("/student/exam/finish", {
                    state: { 
                        examID: examID, 
                        questions: examQuestions,
                        endDatetime: endDatetime,
                        flagged: flaggedQuestions,
                        hasPlayed: hasPlayed,
                    }
                });
            }
        }
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor(seconds / 60) % 60;
        const secs = seconds % 60;
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatAudioTime = (duration) => {
        const roundedDuration = Math.round(duration);

        const minutes = Math.floor(roundedDuration / 60);
        const seconds = Math.floor(roundedDuration % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    const answerChoices = [
        {
            value: "a",
            text: examQuestions[currentQuestion.type][currentQuestion.index].choice_a,
        },
        {
            value: "b",
            text: examQuestions[currentQuestion.type][currentQuestion.index].choice_b,
        },
        {
            value: "c",
            text: examQuestions[currentQuestion.type][currentQuestion.index].choice_c,
        },
        {
            value: "d",
            text: examQuestions[currentQuestion.type][currentQuestion.index].choice_d,
        },
    ];
    
    const displayFormattingExample = () => {
        const letters = ["A", "B", "C", "D"];
        let letterIndex = 0;

        const regex = /__([^_]+?)__/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(examQuestions[currentQuestion.type][currentQuestion.index].question_text)) !== null) {
            if (match.index > lastIndex) {
            parts.push(<span>{examQuestions[currentQuestion.type][currentQuestion.index].question_text.slice(lastIndex, match.index)}</span>);
            }

            const letter = letters[letterIndex++] || "?";
            
            parts.push(
            <GrammarUnderline contentLetter={letter} text={match[1]} />
            )

            lastIndex = regex.lastIndex;
        }

        if (lastIndex < examQuestions[currentQuestion.type][currentQuestion.index].question_text.length) {
            parts.push(<span>{examQuestions[currentQuestion.type][currentQuestion.index].question_text.slice(lastIndex)}</span>);
        }

        return (<>
            {parts}
        </>);
    }

    return (
        <div
            className="absolute bg-slate-50 w-full min-h-full h-auto"
            onContextMenu={(e) => {
                e.preventDefault();

                alert("Right clicking is disabled.");
            }}
        >
            <Navbar examMode={true} />

            <div className="flex flex-1">
                <div className="w-55 m-4 flex flex-col gap-2">
                    <div className="bg-tec-card p-2 rounded-xl flex justify-between text-tec-darker">
                        <span className="text-left">Time Remaining:</span>
                        <b className="text-right">{formatTime(timeLeft)}</b>
                    </div>
                    <div className="bg-slate-200 p-2 rounded-xl">
                        <div className="font-bold pb-2 text-tec-darker">Grammar</div>
                        <div className="grid grid-cols-5 gap-2">
                            {examQuestions.grammar.map((v, i) => {
                                const flagged = flaggedQuestions.includes(v.question_id);
                                const answered = answeredQuestions.map((v, i) => (
                                    v.question_id
                                )).includes(v.question_id);

                                const current = currentQuestion.index === i && currentQuestion.type === "grammar";

                                const cssState = current ? (
                                    flagged ? "bg-amber-500 text-white"
                                    : (answered ? "bg-sky-500 text-white"
                                    : "bg-tec-darker text-white")
                                ) : (
                                    flagged ? "bg-amber-200 text-amber-800 hover:bg-amber-300"
                                    : (answered ? "bg-sky-200 text-blue-800 hover:bg-sky-300"
                                    : "bg-white text-tec-darker hover:bg-tec-card")
                                )

                                return (
                                    <button
                                        type="button"
                                        key={i}
                                        className={`flex w-8 h-8 items-center justify-center text-center rounded-lg 
                                            cursor-pointer font-bold ${cssState}`}
                                        onClick={() => {
                                            const q = examQuestions["grammar"][i];
                                            const answered = answeredQuestions.map((v, i) => (
                                                v.question_id
                                            ));

                                            setCurrentQuestion({
                                                type: "grammar",
                                                index: i,
                                            })

                                            if (answered.includes(q.question_id)) {
                                                const answer = answeredQuestions.filter((v, i) => (
                                                    v.question_id === q.question_id
                                                ))[0];

                                                setSelectedOption(answer.answer);
                                            } else {
                                                setSelectedOption("");
                                            }
                                            
                                            if (audioRef.current) {
                                                audioRef.current.pause();
                                            }
                                        }}
                                    >
                                        {answered ? (
                                            <FaCheck className="w-5 h-5 text-current" />
                                        ) : (
                                            <span>{i + 1}</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="font-bold pb-2 text-tec-darker">Reading</div>
                        <div className="grid grid-cols-5 gap-2">
                            {examQuestions.reading.map((v, i) => {
                                const flagged = flaggedQuestions.includes(v.question_id);
                                const answered = answeredQuestions.map((v, i) => (
                                    v.question_id
                                )).includes(v.question_id);

                                const current = currentQuestion.index === i && currentQuestion.type === "reading";

                                const cssState = current ? (
                                    flagged ? "bg-amber-500 text-white"
                                    : (answered ? "bg-sky-500 text-white"
                                    : "bg-tec-darker text-white")
                                ) : (
                                    flagged ? "bg-amber-200 text-amber-800 hover:bg-amber-300"
                                    : (answered ? "bg-sky-200 text-blue-800 hover:bg-sky-300"
                                    : "bg-white text-tec-darker hover:bg-tec-card")
                                )

                                return (
                                    <button
                                        type="button"
                                        key={i}
                                        className={`flex w-8 h-8 items-center justify-center text-center rounded-lg 
                                            cursor-pointer font-bold ${cssState}`}
                                        onClick={() => {
                                            const q = examQuestions["reading"][i];
                                            const answered = answeredQuestions.map((v, i) => (
                                                v.question_id
                                            ));

                                            setCurrentQuestion({
                                                type: "reading",
                                                index: i,
                                            })

                                            if (answered.includes(q.question_id)) {
                                                const answer = answeredQuestions.filter((v, i) => (
                                                    v.question_id === q.question_id
                                                ))[0];

                                                setSelectedOption(answer.answer);
                                            } else {
                                                setSelectedOption("");
                                            }
                                            
                                            if (audioRef.current) {
                                                audioRef.current.pause();
                                            }
                                        }}
                                    >
                                        {answered ? (
                                            <FaCheck className="w-5 h-5 text-current" />
                                        ) : (
                                            <span>{i + 1}</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="font-bold pb-2 text-tec-darker">Listening</div>
                        <div className="grid grid-cols-5 gap-2">
                            {examQuestions.listening.map((v, i) => {
                                const flagged = flaggedQuestions.includes(v.question_id);
                                const answered = answeredQuestions.map((v, i) => (
                                    v.question_id
                                )).includes(v.question_id);

                                const current = currentQuestion.index === i && currentQuestion.type === "listening";

                                const cssState = current ? (
                                    flagged ? "bg-amber-500 text-white"
                                    : (answered ? "bg-sky-500 text-white"
                                    : "bg-tec-darker text-white")
                                ) : (
                                    flagged ? "bg-amber-200 text-amber-800 hover:bg-amber-300"
                                    : (answered ? "bg-sky-200 text-blue-800 hover:bg-sky-300"
                                    : "bg-white text-tec-darker hover:bg-tec-card")
                                )

                                return (
                                    <button
                                        type="button"
                                        key={i}
                                        className={`flex w-8 h-8 items-center justify-center text-center rounded-lg 
                                            cursor-pointer font-bold ${cssState}`}
                                        onClick={() => {
                                            const q = examQuestions["listening"][i];
                                            const answered = answeredQuestions.map((v, i) => (
                                                v.question_id
                                            ));

                                            setCurrentQuestion({
                                                type: "listening",
                                                index: i,
                                            })

                                            if (answered.includes(q.question_id)) {
                                                const answer = answeredQuestions.filter((v, i) => (
                                                    v.question_id === q.question_id
                                                ))[0];

                                                setSelectedOption(answer.answer);
                                            } else {
                                                setSelectedOption("");
                                            }
                                            
                                            if (audioRef.current) {
                                                audioRef.current.pause();
                                            }
                                        }}
                                    >
                                        {answered ? (
                                            <FaCheck className="w-5 h-5 text-current" />
                                        ) : (
                                            <span>{i + 1}</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <Card className="flex-1 m-5 p-5">
                    {audioRef.current ? (
                        <>
                            <p className="font-semibold text-tec-darker">
                                You may only play the audio once.
                            </p>
                            <div className="mb-5 flex items-center">
                                <button
                                    type="button"
                                    className="w-8 h-8 rounded-full bg-tec-darker hover:bg-tec-dark text-white
                                        flex items-center justify-center disabled:bg-slate-300 disabled:text-slate-800
                                        cursor-pointer"
                                    onClick={handlePlayPause}
                                    disabled={hasPlayed.includes(
                                        examQuestions[currentQuestion.type][currentQuestion.index].question_id
                                    )}
                                    title="Play the audio"
                                >
                                    <FaPlay className="ml-0.5" />
                                </button>
                                <span className="ml-2.5 text-slate-600 font-semibold">
                                    {`${formatAudioTime(audioRef.current.currentTime)}/${formatAudioTime(audioRef.current.duration)}`}
                                </span>
                            </div>
                        </>
                    ) : null}

                    <p className="text-justify font-medium select-none">
                        {currentQuestion.type !== "grammar"
                            ? examQuestions[currentQuestion.type][currentQuestion.index].question_text
                            : displayFormattingExample()}
                    </p>

                    <div className="flex flex-col gap-2.5 my-5">
                        {answerChoices.map((c) => (
                            <button
                                key={c.value}
                                className={`text-center justify-start border-2 border-tec-light rounded-lg p-1
                                    font-semibold transition-colors ease-in-out duration-100 cursor-pointer
                                    ${selectedOption === c.value ? "bg-tec-light text-white"
                                        : "hover:bg-sky-200 hover:border-sky-200 text-tec-dark"}
                                    `}
                                onClick={() => handleOptionClick(c.value)}
                                title={selectedOption === c.value ? "Unselect this answer" : "Select this answer"}
                            >
                                {c.text}
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-between mt-5">
                        <button
                            className="bg-tec-card text-tec-darker font-semibold px-2 py-1 rounded-full cursor-pointer
                                hover:bg-tec-darker hover:text-white"
                            onClick={handlePrev}
                        >
                            <FaChevronLeft className="inline" /> Previous
                        </button>

                        <button
                            className="bg-amber-200 text-amber-800 hover:bg-amber-300 font-semibold px-2 py-1
                                rounded-full cursor-pointer w-24"
                            onClick={handleFlag}
                        >
                            <FaFlag className="inline" /> {" "}
                            {
                                flaggedQuestions.includes(examQuestions[currentQuestion.type][currentQuestion.index].question_id)
                                    ? "Unflag"
                                    : "Flag"
                            }
                        </button>

                        <button
                            className="bg-tec-card text-tec-darker font-semibold px-2 py-1 rounded-full cursor-pointer
                                hover:bg-tec-darker hover:text-white"
                            onClick={handleNext}
                        >
                            {currentQuestion.index === examQuestions["listening"].length - 1 && currentQuestion.type === "listening"
                            ? "Finish" : "Next"} {" "}
                            <FaChevronRight className="inline" />
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default StudentExam;