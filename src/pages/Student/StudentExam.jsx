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

  const [readingInstructions, setReadingInstructions] = useState(false);
  const [instructionsTime, setInstructionsTime] = useState(0);
  const [readingIndex, setReadingIndex] = useState(0);
  const [instructionsSeen, setInstructionsSeen] = useState(() => {
    const saved = localStorage.getItem("seenInstructions");
    return saved ? saved.split(",").map(v => v.trim()).filter(v => v !== "").map(v => parseInt(v)) : [];
  });
  const instructionsStartIndex = {
    "listening": 0,
    "grammar": 3,
    "reading": 5
  };
  const instructions = [
    // LISTENING
    {
      question_id: 0,
      instructions: `In this section, you will hear short conversations between two people. After each
        conversation, you will hear a question about the conversation. The conversations and questions
        will not be repeated. After you hear a question, read the four possible answers and choose the
        best answer.`
    },
    {
      question_id: 1,
      instructions: `In this section, you will hear longer conversations. After each conversation, you
        will hear several questions. The conversations will not be repeated. After you hear a question,
        read the four possible answers and choose the best answer.`
    },
    {
      question_id: 2,
      instructions: `In this section, you will hear several talks. After each talk, you will hear some
        questions. The talks and questions will not be repeated. After you hear a question, read the
        four possible answers and choose the best answer.`
    },
    // GRAMMAR
    {
      question_id: 3,
      instructions: `The first 15 questions are incomplete sentences. Beneath each sentence you will
        see four words or phrases. Choose the one word or phrase that best completes the sentence.`
    },
    {
      question_id: 4,
      instructions: `In the next 25 questions, each sentence has four underlined words or phrases. The
        four underlined parts of the sentence are marked (A), (B), (C), (D). Identify the one
        underlined word or phrase that must be changed in order for the sentence to be correct.`
    },
    // READING
    {
      question_id: 5,
      instructions: `In this section you will read several passages. Each one is followed by a number
        of questions about it. You are to choose the one best answer to each question. Answer all
        questions about the information in a passage on the basis of what is stated or implied in that
        passage.`
    }
  ];

  console.log(instructions[readingIndex], readingIndex);

  function getFirstUniqueEntries(arr, key) {
    const seen = new Map();

    for (const item of arr) {
      if (!seen.has(item[key])) {
        seen.set(item[key], item);
      }
    }

    return Array.from(seen.values());
  }

  const indexThreshold = {
    "listening": getFirstUniqueEntries(examQuestions["listening"], "batch_id").map(v => v.batch_id),
    "grammar": getFirstUniqueEntries(examQuestions["grammar"], "batch_id").map(v => v.batch_id),
    // only need the first section for reading
    "reading": [getFirstUniqueEntries(examQuestions["reading"], "batch_id").map(v => v.batch_id)[0]],
  }

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

  useEffect(() => {
    const currentQ = examQuestions[currentQuestion.type][currentQuestion.index];
    const batchId = currentQ.batch_id; // Use batch_id as unique identifier

    if (!instructionsSeen.includes(batchId) && indexThreshold[currentQuestion.type].includes(batchId)) {
      setReadingInstructions(true);
      setInstructionsTime(15);
      setReadingIndex(
        instructionsStartIndex[currentQuestion.type]
        + Math.max(indexThreshold[currentQuestion.type].indexOf(currentQ.question_id), 0)
      );
    }
  }, [instructionsSeen, currentQuestion]);

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
    const answerResponse = await axios.get(
      `${config.BACKEND_URL}/api/student/answers/${examID}`,
      { withCredentials: true },
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
      if (readingInstructions) {
        setInstructionsTime((prev) => {
          const newTime = prev > 0 ? prev - 1 : 0;
          return newTime;
        })
      } else {
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
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [readingInstructions, currentQuestion.type, storagePrefix]);

  useEffect(() => {
    if (readingInstructions) {
      if (instructionsTime === 0) {
        setReadingInstructions(false);
        setInstructionsTime(0);
        const currentQ = examQuestions[currentQuestion.type][currentQuestion.index];
        setInstructionsSeen([...instructionsSeen, currentQ.batch_id]); // Save batch_id

        localStorage.setItem("seenInstructions", [...instructionsSeen, currentQ.batch_id]);
      }
    } else {
      if (
        (currentQuestion.type === "listening" && listeningTime === 0) ||
        (currentQuestion.type === "grammar" && grammarTime === 0) ||
        (currentQuestion.type === "reading" && readingTime === 0)
      ) {
        if (currentQuestion.type == "reading") {
          finishExam();
          alert("Time's up!");
        } else {
          alert("Time's up! Moving to the next section.");
          if (currentQuestion.type === "listening") {
            setListeningDone(true);
            setCurrentQuestion({ type: "grammar", index: 0 });
          } else if (currentQuestion.type === "grammar") {
            setGrammarDone(true);
            setCurrentQuestion({ type: "reading", index: 0 });
          }
        }
      }
    }
  }, [readingInstructions, instructionsTime, listeningTime, grammarTime, readingTime, currentQuestion.type]);

  // Finish exam
  const finishExam = async () => {
    await axios.put(
      `${config.BACKEND_URL}/api/student/exam/finish`,
      {
        nim: user.id,
        exam_id: examID,
      },
      { withCredentials: true },
    );

    await sendLog({
      nim: user.id,
      idUjian: examID,
      tipeAktivitas: "finish",
      aktivitas: "Selesai ujian",
    });

    localStorage.removeItem("seenInstructions");
    localStorage.removeItem(examSessionKey);
    localStorage.removeItem(`currentQuestion_${storagePrefix}`);
    localStorage.removeItem(`remainingTime_listening_${storagePrefix}`);
    localStorage.removeItem(`remainingTime_grammar_${storagePrefix}`);
    localStorage.removeItem(`remainingTime_reading_${storagePrefix}`);

    navigate("/student", { state: { finished: true } });
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
      setHasPlayed([...hasPlayed, q.audio_path]);

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
        { withCredentials: true },
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
      alert(`All questions in the ${currentSection} section must be answered before moving to the next section.`);
      return;
    }

    // Cek apakah ada soal yang diberi flag
    if (flaggedQuestions.length > 0) {
      alert(`Please remove flags in the ${currentSection} section before moving to the next section.`);
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

  //console.log(examQuestions[currentQuestion.type][currentQuestion.index]);
  //console.log(currentQuestion.type, examQuestions[currentQuestion.type][currentQuestion.index].question_id);
  console.log(instructionsSeen);

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
            fixed lg:static top-0 left-0 z-5
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
            {readingInstructions ? formatTime(instructionsTime) : 
              formatTime(
                currentQuestion.type === "listening"
                  ? listeningTime
                  : currentQuestion.type === "grammar"
                  ? grammarTime
                  : readingTime
              )
            }
          </b>
        </div>

        <div className="bg-slate-200 p-3 rounded-xl overflow-y-auto max-h-[60vh] md:max-h-[70vh]">
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
                  disabled={disabledListening || readingInstructions}
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
                  disabled={disabledGrammar || readingInstructions}
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
                  disabled={disabledReading || readingInstructions}
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
        {/* Question Card */}
        {readingInstructions ? (
          <div className="bg-blue-300 rounded-xl p-4 md:p-6 mb-4 shadow-md">
            <p className="text-justify font-medium select-none pl-2 pr-2 overflow-y-auto max-h-40
              md:max-h-60 mt-2 text-sm sm:text-base"
            >
              You are given 15 seconds to read this instruction.<br/><br/>
              {instructions[readingIndex].instructions}
            </p>
          </div>
        ) : (
          <>
            {/* Tombol garis tiga hanya muncul di layar kecil */}
            <button
              className="lg:hidden fixed top-20 left-4 z-5 bg-sky-600 text-white p-2 rounded-lg shadow-lg"
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
                        examQuestions[currentQuestion.type][currentQuestion.index].audio_path
                      )}
                      className="w-10 h-10 rounded-full bg-tec-darker hover:bg-tec-dark disabled:bg-slate-500
                      text-white flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                      title={
                        hasPlayed.includes(
                          examQuestions[currentQuestion.type][currentQuestion.index].audio_path
                        ) ? "This audio is already played." : (
                          playing && !hasPlayed.includes(
                            examQuestions[currentQuestion.type][currentQuestion.index].audio_path
                          ) ? "An audio is already playing for a different section." : ""
                        )
                      }
                    >
                      <FaPlay />
                    </button>
                    <p className="font-semibold text-tec-darker text-sm sm:text-base">
                      You may only play the audio once.
                    </p>
                  </div>
                )}
                {examQuestions[currentQuestion.type][currentQuestion.index].batch_text && (
                  <p className="text-justify font-medium select-none pl-2 pr-2 overflow-y-auto
                    max-h-40 md:max-h-60 mt-2 text-sm sm:text-base"
                  >
                    <span className="ml-8 sm:ml-16" />
                    {displayFormattingParagraphs(
                      examQuestions[currentQuestion.type][currentQuestion.index].batch_text
                    )}
                  </p>
                )}
              </div>
            ) : null}
          
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-md">
              <p className="text-justify font-medium select-none text-sm/4 sm:text-base/8">
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
          </>
        )}
      </div>
    </div>
  </div>
  );
};
  
export default StudentExam;
  
