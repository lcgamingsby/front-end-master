import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import { config } from "../../data/config";
import { FaBars, FaCheck, FaChevronLeft, FaChevronRight, FaFlag, FaPlay } from "react-icons/fa";
import axios from "axios";
import { useUser } from "../Components/UserContext";
import GrammarUnderline from "../Components/GrammarUnderline";
import { sendLog } from "../utils/log"; // ✅ tambahan

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

  const navigate = useNavigate();
  const storagePrefix = `${examID}_${user.id}`;
  const examSessionKey = `exam_session_${examID}_${storagePrefix}`;

  const [flaggedQuestions, setFlaggedQuestions] = useState(flagged);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [listeningDone, setListeningDone] = useState(false);
  const [grammarDone, setGrammarDone] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Atur posisi awal ujian
  const [currentQuestion, setCurrentQuestion] = useState(() => {
    const savedSession = localStorage.getItem(examSessionKey);
    const savedQuestion = localStorage.getItem(`currentQuestion_${storagePrefix}`);
  
    if (savedSession && savedQuestion) {
      try {
        return JSON.parse(savedQuestion) || { index: 0, type: "listening" };
      } catch {
        return { index: 0, type: "listening" };
      }
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
    const saved = localStorage.getItem(`remainingTime_listening_${storagePrefix}`);
    return saved ? parseInt(saved) : sectionTimes.listening;
  });
  const [grammarTime, setGrammarTime] = useState(() => {
    const saved = localStorage.getItem(`remainingTime_grammar_${storagePrefix}`);
    return saved ? parseInt(saved) : sectionTimes.grammar;
  });
  const [readingTime, setReadingTime] = useState(() => {
    const saved = localStorage.getItem(`remainingTime_reading_${storagePrefix}`);
    return saved ? parseInt(saved) : sectionTimes.reading;
  });


  const audioRef = useRef(null);
  const prevTypeRef = useRef(currentQuestion.type);

  

  // ✅ Logging aktivitas saat masuk & keluar halaman
  useEffect(() => {
    const logEnter = async () => {
      await sendLog({
        nim: user.id,
        idUjian: examID,
        tipeAktivitas: "enter_exam",
        aktivitas: "Masuk halaman ujian",
      });
    };
    logEnter();

    const handleBeforeUnload = async () => {
      const exitTime = Date.now();
      localStorage.setItem("lastExitTime", exitTime);
      await sendLog({
        nim: user.id,
        idUjian: examID,
        tipeAktivitas: "exit_exam",
        aktivitas: "Keluar dari halaman ujian",
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      handleBeforeUnload();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // ✅ Logging resume exam
  useEffect(() => {
    const lastExit = localStorage.getItem("lastExitTime");
    if (lastExit) {
      const duration = Math.floor((Date.now() - parseInt(lastExit, 10)) / 1000);
      if (duration > 0) {
        sendLog({
          nim: user.id,
          idUjian: examID,
          tipeAktivitas: "resume_exam",
          aktivitas: `Kembali ke halaman ujian setelah ${duration} detik`,
        });
      }
      localStorage.removeItem("lastExitTime");
    }
  }, []);

  // ✅ Logging tab aktif / tidak aktif
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        localStorage.setItem("lastExitTime", Date.now());
        await sendLog({
          nim: user.id,
          idUjian: examID,
          tipeAktivitas: "tab_hidden",
          aktivitas: "Berpindah tab atau minimize ujian",
        });
      } else {
        const lastExit = localStorage.getItem("lastExitTime");
        if (lastExit) {
          const duration = Math.floor((Date.now() - parseInt(lastExit, 10)) / 1000);
          await sendLog({
            nim: user.id,
            idUjian: examID,
            tipeAktivitas: "tab_active",
            aktivitas: `Kembali ke tab ujian setelah ${duration} detik`,
          });
          localStorage.removeItem("lastExitTime");
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Atur audio untuk listening
  useEffect(() => {
    const prevType = prevTypeRef.current;
    if (prevType === "listening" && currentQuestion.type === "grammar") {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
    if (
      currentQuestion.type === "listening" &&
      (prevType !== "listening" || !audioRef.current)
    ) {
      const newAudio = new Audio(
        `${config.BACKEND_URL}/audio/${
          examQuestions[currentQuestion.type][currentQuestion.index].audio_path
        }`
      );
      audioRef.current = newAudio;
      audioRef.current.load();
      setPlaying(false);
    }
    prevTypeRef.current = currentQuestion.type;
  }, [currentQuestion.type, currentQuestion.index]);

  useEffect(() => {
    const currentQ = examQuestions[currentQuestion.type][currentQuestion.index];
    const answer = answeredQuestions.find(a => a.question_id === currentQ.question_id);
    setSelectedOption(answer ? answer.answer : "");
  }, [currentQuestion, answeredQuestions]);

  useEffect(() => {
    localStorage.setItem(`currentQuestion_${storagePrefix}`, JSON.stringify(currentQuestion));
  }, [currentQuestion, storagePrefix]);

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
          localStorage.setItem(`remainingTime_listening_${storagePrefix}`, newTime);
          return newTime;
        });
      } else if (currentQuestion.type === "grammar") {
        setGrammarTime((prev) => {
          const newTime = prev > 0 ? prev - 1 : 0;
          localStorage.setItem(`remainingTime_grammar_${storagePrefix}`, newTime);
          return newTime;
        });
      } else if (currentQuestion.type === "reading") {
        setReadingTime((prev) => {
          const newTime = prev > 0 ? prev - 1 : 0;
          localStorage.setItem(`remainingTime_reading_${storagePrefix}`, newTime);
          return newTime;
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [currentQuestion.type, storagePrefix]);

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

    await sendLog({
      nim: user.id,
      idUjian: examID,
      tipeAktivitas: "finish",
      aktivitas: "Selesai ujian",
    });

    localStorage.removeItem(examSessionKey);
    localStorage.removeItem(`currentQuestion_${storagePrefix}`);
    localStorage.removeItem(`remainingTime_listening_${storagePrefix}`);
    localStorage.removeItem(`remainingTime_grammar_${storagePrefix}`);
    localStorage.removeItem(`remainingTime_reading_${storagePrefix}`);

    navigate("/student");
  };

  // Flag
  const handleFlag = async () => {
    const q = examQuestions[currentQuestion.type][currentQuestion.index];
    if (!flaggedQuestions.includes(q.question_id)) {
      setFlaggedQuestions((prev) => [...prev, q.question_id]);
      await sendLog({
        nim: user.id,
        idUjian: examID,
        //idSoal: q.question_id,
        tipeAktivitas: "flag",
        aktivitas: "Flag soal",
      });
    } else {
      setFlaggedQuestions(flaggedQuestions.filter((v) => v !== q.question_id));
      await sendLog({
        nim: user.id,
        idUjian: examID,
        //idSoal: q.question_id,
        tipeAktivitas: "flag",
        aktivitas: "Unflag soal",
      });
    }
  };

  // Play audio
  const handlePlayPause = async () => {
    const q = examQuestions[currentQuestion.type][currentQuestion.index];
    if (audioRef.current && !playing) {
      audioRef.current.play();
      setPlaying(true);
      setHasPlayed([...hasPlayed, q.question_id]);

      await sendLog({
        nim: user.id,
        idUjian: examID,
        //idSoal: q.question_id,
        tipeAktivitas: "listening",
        aktivitas: "Play audio soal",
      });
    }
  };

  const batchMap = {
    listening: 1,
    grammar: 2,
    reading: 3,
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
          tipeBatch: batchMap[currentQuestion.type],
        },
        
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      

      await sendLog({
        nim: user.id,
        idUjian: examID,
        //idSoal: q.question_id,
        tipeAktivitas: "answer",
        aktivitas: `Menjawab soal dengan pilihan ${index}`,
      });
    } catch (e) {
      console.error("Error answering:", e);
      return;
    }
    const otherAnswered = answeredQuestions.filter((v) => v.question_id !== q.question_id);
    if (selectedOption !== index) {
      setSelectedOption(index);
      setAnsweredQuestions([...otherAnswered, { question_id: q.question_id, answer: index }]);
    } else {
      setSelectedOption("");
      setAnsweredQuestions([...otherAnswered]);
    }
  };

  // Navigasi
  const handleNext = async () => {
    const q = examQuestions[currentQuestion.type][currentQuestion.index];
    await sendLog({
      nim: user.id,
      idUjian: examID,
      tipeAktivitas: "navigation",
      aktivitas: "Pindah soal berikutnya",
    });

    const currentSection = currentQuestion.type;
    const totalQuestions = examQuestions[currentSection].length;
    const answeredInSection = answeredQuestions.filter((a) =>
      examQuestions[currentSection].some((q) => q.question_id === a.question_id)
    ).length;

    // Masih ada soal di section ini
    if (currentQuestion.index < totalQuestions - 1) {
      setCurrentQuestion({ type: currentSection, index: currentQuestion.index + 1 });
      return;
    }

    // Sudah di soal terakhir section
    // 🔒 Cek apakah semua soal di section ini sudah dijawab
    if (answeredInSection < totalQuestions) {
      alert(`Kamu harus menjawab semua soal di bagian ${currentSection} sebelum lanjut ke section berikutnya.`);
      return;
    }

    // ✅ Semua sudah dijawab, baru pindah section
    if (currentSection === "listening") {
      setListeningDone(true);
      setCurrentQuestion({ type: "grammar", index: 0 });
    } else if (currentSection === "grammar") {
      setGrammarDone(true);
      setCurrentQuestion({ type: "reading", index: 0 });
    } else if (currentSection === "reading") {
      // Semua section selesai
      localStorage.removeItem(examSessionKey);
      localStorage.removeItem(`currentQuestion_${storagePrefix}`);
      localStorage.removeItem(`remainingTime_listening_${storagePrefix}`);
      localStorage.removeItem(`remainingTime_grammar_${storagePrefix}`);
      localStorage.removeItem(`remainingTime_reading_${storagePrefix}`);

      navigate("/student/exam/finish", {
        state: { examID, questions: examQuestions, endDatetime, flagged: flaggedQuestions, hasPlayed },
      });
    }
  };


  const handlePrev = async () => {
    const q = examQuestions[currentQuestion.type][currentQuestion.index];
    await sendLog({
      nim: user.id,
      idUjian: examID,
      //idSoal: q.question_id,
      tipeAktivitas: "navigation",
      aktivitas: "Pindah soal sebelumnya",
    });

    if (currentQuestion.index > 0) {
      setCurrentQuestion({ type: currentQuestion.type, index: currentQuestion.index - 1 });
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds / 60) % 60;
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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
      className="bg-slate-50 min-h-screen w-full"
      onContextMenu={(e) => {
        e.preventDefault();
        alert("Right clicking is disabled.");
      }}
    >
    <Navbar examMode={true} />

    {/* ✅ Layout Responsif */}
    <div className="flex flex-col lg:flex-row justify-between px-4 md:px-8 py-4 gap-4">
      {/* === Sidebar === */}
        <div
          className={`
            fixed lg:static top-0 left-0 z-40
            w-3/4 sm:w-2/3 md:w-1/2 lg:w-1/4
            h-full lg:h-auto
            bg-slate-100 lg:bg-transparent
            transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            transition-transform duration-300 ease-in-out
            flex flex-col gap-3 order-2 lg:order-1 p-4
          `}
        > 
        {/* Tombol tutup sidebar di mobile */}
        <div className="lg:hidden flex justify-end mb-2">
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-slate-800 font-bold text-xl"
          >
            ✕
          </button>
        </div>

        {/* Sisa isi sidebar (Time Remaining & daftar soal) tetap sama */}
        <div className="bg-tec-card p-3 rounded-xl flex justify-between text-tec-darker shadow">
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

        <div className="bg-slate-200 p-3 rounded-xl overflow-y-auto max-h-[60vh] md:max-h-[80vh]">
          {/* Listening */}
          <div className="font-bold pb-2 text-tec-darker">Listening</div>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
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
                  className={`flex w-8 h-8 items-center justify-center rounded-lg font-bold text-xs sm:text-base ${cssState} ${
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
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
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
                  className={`flex w-8 h-8 items-center justify-center rounded-lg font-bold text-xs sm:text-base ${cssState} ${
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
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
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
                  className={`flex w-8 h-8 items-center justify-center rounded-lg font-bold text-xs sm:text-base ${cssState} ${
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

      {/* === Soal dan Audio === */}
      <div className="flex-1 order-1 lg:order-2">
        {/* Tombol garis tiga hanya muncul di layar kecil */}
        <button
          className="lg:hidden fixed top-20 left-4 z-50 bg-sky-600 text-white p-2 rounded-lg shadow-lg"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <FaBars size={20} />
        </button>
        {/* Audio & Passage Section */}
        {examQuestions[currentQuestion.type][currentQuestion.index].audio_path !== "" ||
        examQuestions[currentQuestion.type][currentQuestion.index].batch_text !== "" ? (
          <div className="bg-blue-300 rounded-xl p-4 md:p-6 mb-4 shadow-md">
            {currentQuestion.type === "listening" && audioRef.current && (
              <div className="gap-2 flex items-center flex-wrap">
                <button
                  onClick={handlePlayPause}
                  disabled={hasPlayed.includes(
                    examQuestions[currentQuestion.type][currentQuestion.index].question_id
                  )}
                  className="w-10 h-10 rounded-full bg-tec-darker text-white flex items-center justify-center"
                >
                  <FaPlay />
                </button>
                <p className="font-semibold text-tec-darker text-sm sm:text-base">
                  You may only play the audio once.
                </p>
              </div>
            )}
            {examQuestions[currentQuestion.type][currentQuestion.index].batch_text && (
              <p className="text-justify font-medium select-none pl-2 pr-2 overflow-y-auto max-h-40 md:max-h-60 mt-2 text-sm sm:text-base">
                <span className="ml-8 sm:ml-16" />
                {displayFormattingParagraphs(
                  examQuestions[currentQuestion.type][currentQuestion.index].batch_text
                )}
              </p>
            )}
          </div>
        ) : null}

        {/* Question Card */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-md">
          <p className="text-justify font-medium select-none text-sm sm:text-base">
            {currentQuestion.type !== "grammar"
              ? examQuestions[currentQuestion.type][currentQuestion.index].question_text
              : displayFormattingGrammar()}
          </p>

          <div className="flex flex-col gap-2.5 my-5">
            {answerChoices.map((c) => (
              <button
                key={c.value}
                onClick={() => handleOptionClick(c.value)}
                className={`text-center border-2 text-slate-900 rounded-lg py-2 px-3 font-semibold text-sm sm:text-base ${
                  selectedOption === c.value
                    ? "bg-gradient-to-r from-sky-500 to-sky-600 border-sky-800 text-white"
                    : "border-slate-900 hover:bg-sky-200"
                }`}
              >
                {c.text}
              </button>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center flex-wrap gap-3">
            <button
              onClick={handlePrev}
              className="flex items-center gap-2 bg-slate-300 hover:bg-slate-400 text-tec-darker font-semibold px-4 py-2 rounded-full transition-all"
            >
              <FaChevronLeft /> Previous
            </button>

            <button
              onClick={handleFlag}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${
                flaggedQuestions.includes(
                  examQuestions[currentQuestion.type][currentQuestion.index].question_id
                )
                  ? "bg-amber-500 text-white hover:bg-amber-600"
                  : "bg-amber-200 text-amber-800 hover:bg-amber-300"
              }`}
            >
              <FaFlag />
              {flaggedQuestions.includes(
                examQuestions[currentQuestion.type][currentQuestion.index].question_id
              )
                ? "Unflag"
                : "Flag"}
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2 rounded-full transition-all"
            >
              {currentQuestion.index === examQuestions[currentQuestion.type].length - 1
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
  
