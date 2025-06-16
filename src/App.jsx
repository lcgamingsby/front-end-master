import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ExamsPage from './pages/Admin/ExamsPage';
import NewExamPage from "./pages/NewExamPage";
import QuestionsPage from "./pages/Admin/QuestionsPage";
import AddQuestionPage from "./pages/Admin/AddQuestionPage";
import StudentsPage from "./pages/Admin/StudentsPage";
import AddStudentPage from "./pages/Admin/AddStudentPage";

import StudentDashboard from "./pages/StudentDashboard";
import Test1 from "./pages/listeningtest"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/exams" element={<ExamsPage />} />
        <Route path="/admin/exams/new" element={<NewExamPage />} />
        <Route path="/admin/questions" element={<QuestionsPage />} />
        <Route path="/admin/questions/add" element={<AddQuestionPage />} />
        <Route path="/admin/questions/edit" element={<AddQuestionPage />} />
        <Route path="/admin/students" element={<StudentsPage />} />
        <Route path="/admin/students/add" element={<AddStudentPage />} />
        <Route path="/student" element={<StudentDashboard/>} />
        <Route path="/test1" element={<Test1/>} />
      </Routes>
    </Router>
  )
}

export default App
