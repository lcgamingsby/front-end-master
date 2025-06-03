import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import ExamsPage from './pages/ExamsPage';
import NewExamPage from "./pages/NewExamPage";
import QuestionsPage from "./pages/QuestionsPage";
import AddQuestionPage from "./pages/AddQuestionPage";
import StudentsPage from "./pages/StudentsPage";
import AddStudentPage from "./pages/AddStudentPage";

import StudentDashboard from "./pages/StudentDashboard";
import Test1 from "./pages/listeningtest"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/exams" element={<ExamsPage />} />
        <Route path="/exams/new" element={<NewExamPage />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/questions/add" element={<AddQuestionPage />} />
        <Route path="/questions/edit" element={<AddQuestionPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/add-student" element={<AddStudentPage />} />
        <Route path="/student" element={<StudentDashboard/>} />
        <Route path="/test1" element={<Test1/>} />
      </Routes>
    </Router>
  );
}

export default App;
