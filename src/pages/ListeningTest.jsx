import React, { useState, useEffect, useRef } from "react";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { useNavigate } from "react-router-dom";
import "../App.css";

//pertanyaan
const questions = [
  {
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctOption: 1,
  },
  {
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctOption: 2,
  },
];
//pertanyaan
const ListeningTest = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [score, setScore] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const navigate = useNavigate();


  const audioRef = useRef(new Audio(questions[currentQuestion].audio));

  useEffect(() => {
    audioRef.current.src = questions[currentQuestion].audio;
    audioRef.current.load();
    setPlaying(false);
  }, [currentQuestion]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio.pause();
    };
  }, []);

  useEffect(() => {
    const prevAnswer = userAnswers.find((ans) => ans.question === currentQuestion + 1);
    if (prevAnswer) {
      setSelectedOption(prevAnswer.selected);
    } else {
      setSelectedOption(null);
    }
  }, [currentQuestion, userAnswers]);
  

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleFlag = () => {
    if (!flaggedQuestions.includes(currentQuestion)) {
      setFlaggedQuestions((prev) => [...prev, currentQuestion]);
    }
  };  

  const handlePlayPause = () => {
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const handleOptionClick = (index) => {
    setSelectedOption(index);
  
    setUserAnswers((prev) => {
      const updated = prev.filter((a) => a.question !== currentQuestion + 1);
      return [...updated, { question: currentQuestion + 1, selected: index }];
    });
  
    if (!answeredQuestions.includes(currentQuestion)) {
      setAnsweredQuestions((prev) => [...prev, currentQuestion]);
    }
  };

  const handleNext = () => {
    const correct = questions[currentQuestion].correctOption;
  
    if (selectedOption !== null) {
      // Naikkan skor kalau benar
      if (selectedOption === correct) {
        setScore((prev) => prev + 10);
      }
  
      // Hapus flag kalau soal ini di-flag
      if (flaggedQuestions.includes(currentQuestion)) {
        setFlaggedQuestions((prev) =>
          prev.filter((q) => q !== currentQuestion)
        );
      }
  
      // Tambahkan ke daftar soal yang sudah dijawab
      if (!answeredQuestions.includes(currentQuestion)) {
        setAnsweredQuestions((prev) => [...prev, currentQuestion]);
      }
    }
  
    // Pindah ke soal berikutnya
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedOption(null);
      audioRef.current.pause();
    } else {
      setShowConfirmDialog(true);
    }
  };
  

  const handleFinishTest = () => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const testResult = {
      username: loggedInUser.name,
      score,
      userAnswers,
    };
  
    // Simpan ke localStorage
    localStorage.setItem("testResult", JSON.stringify(testResult));
  
    // Buat file CSV
    let csvContent = `Username,Score\n${testResult.username},${testResult.score}\n\n`;
    csvContent += "Question,Selected Option\n";
    testResult.userAnswers.forEach((ans) => {
      const optionLabel = String.fromCharCode(65 + ans.selected);
      csvContent += `${ans.question},${optionLabel}\n`;
    });
  
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `test_result_${testResult.username}.csv`;
    a.click();

    navigate("/student");
  };  
  

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatAudioTime = (duration) => {
    roundedDuration = Math.round(duration);

    const minutes = Math.floor(roundedDuration / 60);
    const seconds = Math.floor(roundedDuration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  return (
    <div className="app-container">
      {/* App Bar */}

      <div className="app-bar">
        <div className="logo-container">
          <img src="/logoukdc.png" alt="Logo" className="logo" />
          <h1 className="test-title">Listening Test</h1>
        </div>
        <span className="timer">⏳ {formatTime(timeLeft)}</span>
        {/* Menampilkan nama pengguna */}
        <span className="username">{loggedInUser ? loggedInUser.name : "Guest"}</span>
      </div>

      <div className="content">
        <div className="sidebar">
          <div className="section-title">Grammar</div>
          {[...Array(15)].map((_, i) => (
            <div key={i} className={`question-number ${i === 2 ? 'active' : ''}`}>{i+1}</div>
          ))}
          <div className="section-title">Reading</div>
          {[...Array(15)].map((_, i) => (
            <div key={i} className={`question-number ${i === 2 ? 'active' : ''}`}>{i+1}</div>
          ))}
          <div className="section-title">Listening</div>
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
                className={`question-number 
                  ${i === currentQuestion ? 'active' : ''}
                  ${flaggedQuestions.includes(i) ? 'flagged' : ''}
                  ${answeredQuestions.includes(i) ? 'answered' : ''}
                `}
              >
                {i + 1}
              </div>
            ))}
        </div>

        <Card className="card">
          <div className="audio-controls">
            <Button variant="contained" className="play-button" onClick={handlePlayPause}>
              {playing ? "Pause" : "Play"}
            </Button>
            <span className="audio-timer">{formatAudioTime(audioRef.current.currentTime)}/{formatAudioTime(audioRef.current.duration)}</span>
          </div>

          <p>{`Soal ${currentQuestion+1}: Lorem ipsum dolor sit amet consectetur?`}</p>

          <div className="options">
            {questions[currentQuestion].options.map((option, index) => (
              <Button
              key={index}
              variant={selectedOption === index ? "contained" : "outlined"}
              className={`option-button ${selectedOption === index ? "selected" : ""}`}
              onClick={() => handleOptionClick(index)}
            >
              {option}
            </Button>
            ))}
          </div>

          <div className="navigation-buttons">
            <Button variant="outlined" onClick={() => setCurrentQuestion((prev) => Math.max(prev-1, 0))}>
              Previous
            </Button>
            <Button
              className="flag-button"
              onClick={handleFlag}
            >
              Flag
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
            >
              {currentQuestion === questions.length-1 ? "Selesai" : "Next"}
            </Button>
          </div>
        </Card>
      </div>

      {/* Pop-up konfirmasi */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>Yakin ingin menyelesaikan tes?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)} color="secondary">
            Kembali
          </Button>
          <Button onClick={handleFinishTest} color="primary" variant="contained">
            Selesai
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pop-up hasil akhir */}
      <Dialog open={showResultDialog} onClose={() => setShowResultDialog(false)}>
        <DialogTitle>Hasil Tes</DialogTitle>
        <DialogContent>
          <p>Nilai kamu: <strong>{score}</strong></p>
          <ul>
            {userAnswers.map((answer, idx) => (
              <li key={idx}>
                Soal {answer.question}: Pilihan kamu - Option {String.fromCharCode(65 + answer.selected)}
              </li>
            ))}
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResultDialog(false)} variant="contained">Tutup</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ListeningTest;
