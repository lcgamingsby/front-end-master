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
  const sectionTimes = {
    listening: 35 * 60,
    grammar: 25 * 60,
    reading: 55 * 60,
  };

  const location = useLocation();
  const examID = location.state?.examID || 0;
  const examQuestions = location.state?.questions || [];
  const endDatetime = location.state?.endDatetime || "";
  const flagged = location.state?.flagged || [];
  const played = location.state?.hasPlayed || [];

  console.log(examQuestions);

  const navigate = useNavigate();
  const examSessionKey = `exam_session_${examID}`;

  const [flaggedQuestions, setFlaggedQuestions] = useState(flagged);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [listeningDone, setListeningDone] = useState(false);
  const [grammarDone, setGrammarDone] = useState(false);

  // Atur posisi awal ujian
  const [currentQuestion, setCurrentQuestion] = useState(() => {
    const savedSession = localStorage.getItem(examSessionKey);
    if (savedSession) {
      return JSON.parse(localStorage.getItem("currentQuestion")) || {
        index: 0,
        type: "listening",
      };
    } else {
      localStorage.setItem(examSessionKey, "started");
      return { index: 0, type: "listening" };
    }
  });

  const [selectedOption, setSelectedOption] = useState("");
  const [hasPlayed, setHasPlayed] = useState(played);
  const [playing, setPlaying] = useState(false);

  // Ambil waktu tersisa dari localStorage
  const [listeningTime, setListeningTime] = useState(() => {
    const saved = localStorage.getItem("remainingTime_listening");
    return saved ? parseInt(saved) : sectionTimes.listening;
  });
  const [grammarTime, setGrammarTime] = useState(() => {
    const saved = localStorage.getItem("remainingTime_grammar");
    return saved ? parseInt(saved) : sectionTimes.grammar;
  });
  const [readingTime, setReadingTime] = useState(() => {
    const saved = localStorage.getItem("remainingTime_reading");
    return saved ? parseInt(saved) : sectionTimes.reading;
  });

  const audioRef = useRef(null);

  useEffect(() => {
    const currentQ = examQuestions[currentQuestion.type][currentQuestion.index];
    const answer = answeredQuestions.find(a => a.question_id === currentQ.question_id);
    setSelectedOption(answer ? answer.answer : "");
  }, [currentQuestion, answeredQuestions]);

  // Simpan posisi terakhir
  useEffect(() => {
    localStorage.setItem("currentQuestion", JSON.stringify(currentQuestion));
  }, [currentQuestion]);

  // Blok refresh keyboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === "F5" ||
        (e.ctrlKey && e.key.toLowerCase() === "r") ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "r")
      ) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Atur audio untuk listening
  useEffect(() => {
    if (currentQuestion.type === "listening") {
      const newAudio = new Audio(
        `${config.BACKEND_URL}/audio/${
          examQuestions[currentQuestion.type][currentQuestion.index].audio_path
        }`
      );
      audioRef.current = newAudio;
      audioRef.current.load();
    } else {
      audioRef.current = null;
    }
    setPlaying(false);
  }, [currentQuestion]);

  const recoverExistingAnswers = async () => {
    const token = localStorage.getItem("jwtToken");
    const answerResponse = await axios.get(
      `${config.BACKEND_URL}/api/student/answers/${examID}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const answerArray =
      answerResponse.status === 200 && answerResponse.data.message === undefined
        ? answerResponse.data.map((v) => ({
            question_id: v.question_id,
            answer: v.answer,
          }))
        : [];
    setAnsweredQuestions(answerArray);
  };

  useEffect(() => {
    recoverExistingAnswers();
  }, []);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (currentQuestion.type === "listening") {
        setListeningTime((prev) => {
          const newTime = prev > 0 ? prev - 1 : 0;
          localStorage.setItem("remainingTime_listening", newTime);
          return newTime;
        });
      } else if (currentQuestion.type === "grammar") {
        setGrammarTime((prev) => {
          const newTime = prev > 0 ? prev - 1 : 0;
          localStorage.setItem("remainingTime_grammar", newTime);
          return newTime;
        });
      } else if (currentQuestion.type === "reading") {
        setReadingTime((prev) => {
          const newTime = prev > 0 ? prev - 1 : 0;
          localStorage.setItem("remainingTime_reading", newTime);
          return newTime;
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [currentQuestion.type]);

  useEffect(() => {
    if (
      (currentQuestion.type === "listening" && listeningTime === 0) ||
      (currentQuestion.type === "grammar" && grammarTime === 0) ||
      (currentQuestion.type === "reading" && readingTime === 0)
    ) {
      finishExam();
      alert("Time's up!");
    }
  }, [listeningTime, grammarTime, readingTime, currentQuestion.type]);

  // Finish exam
  const finishExam = async () => {
    const token = localStorage.getItem("jwtToken");
    await axios.put(
      `${config.BACKEND_URL}/api/student/exam/finish`,
      {
        nim: user.id,
        exam_id: examID,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // Reset semua data ujian
    localStorage.removeItem(examSessionKey);
    localStorage.removeItem("currentQuestion");
    localStorage.removeItem("remainingTime_listening");
    localStorage.removeItem("remainingTime_grammar");
    localStorage.removeItem("remainingTime_reading");

    navigate("/student");
  };

  // Flag
  const handleFlag = () => {
    if (
      !flaggedQuestions.includes(
        examQuestions[currentQuestion.type][currentQuestion.index].question_id
      )
    ) {
      setFlaggedQuestions((prev) => [
        ...prev,
        examQuestions[currentQuestion.type][currentQuestion.index].question_id,
      ]);
    } else {
      setFlaggedQuestions(
        flaggedQuestions.filter(
          (v) =>
            v !==
            examQuestions[currentQuestion.type][currentQuestion.index]
              .question_id
        )
      );
    }
  };

  // Play audio
  const handlePlayPause = () => {
    if (audioRef.current && !playing) {
      audioRef.current.play();
      setPlaying(true);
      setHasPlayed([
        ...hasPlayed,
        examQuestions[currentQuestion.type][currentQuestion.index].question_id,
      ]);
    }
  };

  // Answer click
  const handleOptionClick = async (index) => {
    const q = examQuestions[currentQuestion.type][currentQuestion.index];
    const token = localStorage.getItem("jwtToken");
    try {
      await axios.post(
        `${config.BACKEND_URL}/api/student/exam/${examID}`,
        {
          answer: index === selectedOption ? "" : index,
          question_id: q.question_id,
          nim: user.id,
          exam_id: examID,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (e) {
      console.error("Error answering:", e);
      return;
    }
    const otherAnswered = answeredQuestions.filter(
      (v) => v.question_id !== q.question_id
    );
    if (selectedOption !== index) {
      setSelectedOption(index);
      setAnsweredQuestions([
        ...otherAnswered,
        { question_id: q.question_id, answer: index },
      ]);
    } else {
      setSelectedOption("");
      setAnsweredQuestions([...otherAnswered]);
    }
  };

  // Navigasi
  const handleNext = () => {
    if (
      currentQuestion.index <
      examQuestions[currentQuestion.type].length - 1
    ) {
      const nextIndex = currentQuestion.index + 1;
      setCurrentQuestion({ type: currentQuestion.type, index: nextIndex });
    } else {
      if (currentQuestion.type === "listening") {
        setListeningDone(true);
        setCurrentQuestion({ type: "grammar", index: 0 });
      } else if (currentQuestion.type === "grammar") {
        setGrammarDone(true);
        setCurrentQuestion({ type: "reading", index: 0 });
      } else if (currentQuestion.type === "reading") {
        // Reset session sebelum navigasi
        localStorage.removeItem(examSessionKey);
        localStorage.removeItem("currentQuestion");
        localStorage.removeItem("remainingTime_listening");
        localStorage.removeItem("remainingTime_grammar");
        localStorage.removeItem("remainingTime_reading");
      
        navigate("/student/exam/finish", {
          state: {
            examID,
            questions: examQuestions,
            endDatetime,
            flagged: flaggedQuestions,
            hasPlayed,
          },
        });
      }
    }
  };

  const handlePrev = () => {
    if (currentQuestion.index > 0) {
      setCurrentQuestion({
        type: currentQuestion.type,
        index: currentQuestion.index - 1,
      });
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds / 60) % 60;
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

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

  const displayFormattingGrammar = () => {
    const letters = ["A", "B", "C", "D"];
    let letterIndex = 0;
    const regex = /__([^_]+?)__/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while (
      (match = regex.exec(
        examQuestions[currentQuestion.type][currentQuestion.index]
          .question_text
      )) !== null
    ) {
      if (match.index > lastIndex) {
        parts.push(
          <span>
            {examQuestions[currentQuestion.type][currentQuestion.index].question_text.slice(
              lastIndex,
              match.index
            )}
          </span>
        );
      }
      parts.push(
        <GrammarUnderline
          contentLetter={letters[letterIndex++] || "?"}
          text={match[1]}
        />
      );
      lastIndex = regex.lastIndex;
    }
    if (
      lastIndex <
      examQuestions[currentQuestion.type][currentQuestion.index].question_text
        .length
    ) {
      parts.push(
        <span>
          {examQuestions[currentQuestion.type][currentQuestion.index].question_text.slice(
            lastIndex
          )}
        </span>
      );
    }
    return <>{parts}</>;
  };

  const displayFormattingParagraphs = (str) => {
    const strArray = str.split("\n");
    let parts = [];

    strArray.forEach((v, i) => {
      parts.push((
        <span>{v}</span>
      ));

      if (i < strArray.length - 1) {
        parts.push(
          // Line break and an initial indent (like tabs)
          <br />,
          <span className="ml-16" />
        );
      }
    });

    return parts;
  }

  // Disable tombol berdasarkan posisi aktif
  const disabledListening = currentQuestion.type !== "listening";
  const disabledGrammar = currentQuestion.type !== "grammar";
  const disabledReading = currentQuestion.type !== "reading";

  console.log(examQuestions[currentQuestion.type][currentQuestion.index]);

  return (
    <div
      className="absolute bg-slate-50 w-full min-h-full h-auto"
      onContextMenu={(e) => {
        e.preventDefault();
        alert("Right clicking is disabled.");
      }}
    >
      <Navbar examMode={true} />
      <div className="flex flex-1 justify-between">
        <div className="w-2/12 max-w-55 m-4 flex flex-col gap-2">
          <div className="bg-tec-card p-2 rounded-xl flex justify-between text-tec-darker">
            <span>Time Remaining:</span>
            <b>
              {formatTime(
                currentQuestion.type === "listening"
                  ? listeningTime
                  : currentQuestion.type === "grammar"
                  ? grammarTime
                  : readingTime
              )}
            </b>
          </div>
          <div className="bg-slate-200 p-2 rounded-xl">
            {/* Listening */}
            <div className="font-bold pb-2 text-tec-darker">Listening</div>
            <div className="grid grid-cols-5 gap-2">
              {examQuestions.listening.map((v, i) => {
                const flagged = flaggedQuestions.includes(v.question_id);
                const answered = answeredQuestions.some(
                  (a) => a.question_id === v.question_id
                );
                const current =
                  currentQuestion.index === i &&
                  currentQuestion.type === "listening";
                const cssState = current
                  ? flagged
                    ? "bg-amber-500 text-white"
                    : answered
                    ? "bg-sky-500 text-white"
                    : "bg-tec-darker text-white"
                  : flagged
                  ? "bg-amber-200 text-amber-800 hover:bg-amber-300"
                  : answered
                  ? "bg-sky-200 text-blue-800 hover:bg-sky-300"
                  : "bg-white text-tec-darker hover:bg-tec-card";
                return (
                  <button
                    key={i}
                    disabled={disabledListening}
                    className={`flex w-8 h-8 items-center justify-center rounded-lg font-bold ${cssState} ${
                      disabledListening ? "cursor-not-allowed opacity-50" : ""
                    }`}
                    onClick={() => {
                      if (disabledListening) return;
                      setCurrentQuestion({ type: "listening", index: i });
                    }}
                  >
                    {answered ? <FaCheck /> : <span>{i + 1}</span>}
                  </button>
                );
              })}
            </div>
            {/* Grammar */}
            <div className="font-bold pb-2 pt-4 text-tec-darker">Grammar</div>
            <div className="grid grid-cols-5 gap-2">
              {examQuestions.grammar.map((v, i) => {
                const flagged = flaggedQuestions.includes(v.question_id);
                const answered = answeredQuestions.some(
                  (a) => a.question_id === v.question_id
                );
                const current =
                  currentQuestion.index === i &&
                  currentQuestion.type === "grammar";
                const cssState = current
                  ? flagged
                    ? "bg-amber-500 text-white"
                    : answered
                    ? "bg-sky-500 text-white"
                    : "bg-tec-darker text-white"
                  : flagged
                  ? "bg-amber-200 text-amber-800 hover:bg-amber-300"
                  : answered
                  ? "bg-sky-200 text-blue-800 hover:bg-sky-300"
                  : "bg-white text-tec-darker hover:bg-tec-card";
                return (
                  <button
                    key={i}
                    disabled={disabledGrammar}
                    className={`flex w-8 h-8 items-center justify-center rounded-lg font-bold ${cssState} ${
                      disabledGrammar ? "cursor-not-allowed opacity-50" : ""
                    }`}
                    onClick={() => {
                      if (disabledGrammar) return;
                      setCurrentQuestion({ type: "grammar", index: i });
                    }}
                  >
                    {answered ? <FaCheck /> : <span>{i + 1}</span>}
                  </button>
                );
              })}
            </div>
            {/* Reading */}
            <div className="font-bold pb-2 pt-4 text-tec-darker">Reading</div>
            <div className="grid grid-cols-5 gap-2">
              {examQuestions.reading.map((v, i) => {
                const flagged = flaggedQuestions.includes(v.question_id);
                const answered = answeredQuestions.some(
                  (a) => a.question_id === v.question_id
                );
                const current =
                  currentQuestion.index === i &&
                  currentQuestion.type === "reading";
                const cssState = current
                  ? flagged
                    ? "bg-amber-500 text-white"
                    : answered
                    ? "bg-sky-500 text-white"
                    : "bg-tec-darker text-white"
                  : flagged
                  ? "bg-amber-200 text-amber-800 hover:bg-amber-300"
                  : answered
                  ? "bg-sky-200 text-blue-800 hover:bg-sky-300"
                  : "bg-white text-tec-darker hover:bg-tec-card";
                return (
                  <button
                    key={i}
                    disabled={disabledReading}
                    className={`flex w-8 h-8 items-center justify-center rounded-lg font-bold ${cssState} ${
                      disabledReading ? "cursor-not-allowed opacity-50" : ""
                    }`}
                    onClick={() => {
                      if (disabledReading) return;
                      setCurrentQuestion({ type: "reading", index: i });
                    }}
                  >
                    {answered ? <FaCheck /> : <span>{i + 1}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="grow w-9/12">
          {examQuestions[currentQuestion.type][currentQuestion.index].audio_path !== ""
            || examQuestions[currentQuestion.type][currentQuestion.index].batch_text !== "" ? (
              <div className="bg-blue-300 rounded-xl flex-1 m-5 p-5">
                {audioRef.current && (
                  <div className="gap-2 flex items-center">
                    <button
                      onClick={handlePlayPause}
                      disabled={hasPlayed.includes(
                        examQuestions[currentQuestion.type][currentQuestion.index]
                          .question_id
                      )}
                      className="w-8 h-8 rounded-full bg-tec-darker text-white flex items-center justify-center"
                    >
                      <FaPlay />
                    </button>
                    <p className="font-semibold text-tec-darker">
                      You may only play the audio once.
                    </p>
                  </div>
                )}

                {examQuestions[currentQuestion.type][currentQuestion.index].batch_text != "" ? (
                  <p className="text-justify font-medium select-none pl-2 pr-6 overflow-y-auto max-h-30">
                    <span className="ml-16" />
                    {displayFormattingParagraphs(examQuestions[currentQuestion.type][currentQuestion.index].batch_text)}
                  </p>
                ) : null}
              </div>
          ) : null}
          {/* Question Card */}
          <div className="bg-white rounded-xl flex-1 m-5 p-5 shadow-xl shadow-slate-400">
            <p className="text-justify font-medium select-none">
              {currentQuestion.type !== "grammar"
                ? examQuestions[currentQuestion.type][currentQuestion.index]
                    .question_text
                : displayFormattingGrammar()}
            </p>
            <div className="flex flex-col gap-2.5 my-5">
              {answerChoices.map((c) => (
                <button
                  key={c.value}
                  onClick={() => handleOptionClick(c.value)}
                  className={`text-center border-2 text-slate-900 rounded-lg p-1 font-semibold ${
                    selectedOption === c.value
                      ? "bg-gradient-to-r from-sky-500 to-sky-600 border-sky-800 text-white"
                      : "border-slate-900 hover:bg-sky-200"
                  }`}
                >
                  {c.text}
                </button>
              ))}
            </div>
            <div className="rounded-xl flex justify-between mt-5">
                {/* Previous */}
                <button
                    onClick={handlePrev}
                    className="flex items-center gap-2 bg-gradient-to-r from-slate-300 to-slate-400 text-tec-darker font-semibold px-4 py-2 rounded-full shadow hover:shadow-lg hover:from-slate-400 hover:to-slate-500 transition-all duration-200"
                >
                    <FaChevronLeft /> Previous
                </button>

                {/* Flag */}
                <button
                    onClick={handleFlag}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full shadow font-semibold transition-all duration-200 ${
                    flaggedQuestions.includes(
                        examQuestions[currentQuestion.type][currentQuestion.index].question_id
                    )
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                        : "bg-gradient-to-r from-amber-200 to-amber-300 text-amber-800 hover:from-amber-300 hover:to-amber-400"
                    }`}
                >
                    <FaFlag />
                    {flaggedQuestions.includes(
                    examQuestions[currentQuestion.type][currentQuestion.index].question_id
                    )
                    ? "Unflag"
                    : "Flag"}
                </button>

                {/* Next */}
                <button
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold px-4 py-2 rounded-full shadow hover:shadow-lg hover:from-sky-600 hover:to-sky-700 transition-all duration-200"
                >
                    {currentQuestion.index ===
                    examQuestions[currentQuestion.type].length - 1
                    ? "Next Section"
                    : "Next"}{" "}
                    <FaChevronRight />
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
  
export default StudentExam;
  
