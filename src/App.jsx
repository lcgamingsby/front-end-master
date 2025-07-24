import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ExamsPage from './pages/Admin/ExamsPage';
import AddExamPage from "./pages/Admin/AddExamPage";
import QuestionsPage from "./pages/Admin/QuestionsPage";
import AddQuestionPage from "./pages/Admin/AddQuestionPage";
import StudentsPage from "./pages/Admin/StudentsPage";
import AddStudentPage from "./pages/Admin/AddStudentPage";

import StudentDashboard from "./pages/StudentDashboard";
import ListeningTest from "./pages/ListeningTest";

import PublicRoute from "./pages/Components/PublicRoute";
import PrivateRoute from "./pages/Components/PrivateRoute";
import { UserProvider } from "./pages/Components/UserContext";
import ResetPasswordPage from "./pages/ResetPasswordPage";

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<PublicRoute />}>
            <Route index element={<LoginPage />} />
          </Route>
          <Route path="/admin" element={<PrivateRoute role="admin" />}>
            <Route index element={<AdminDashboard />} />
            <Route path="exams" element={<ExamsPage />} />
            <Route path="exams/add" element={<AddExamPage />} />
            <Route path="exams/edit" element={<AddExamPage />} />
            <Route path="questions" element={<QuestionsPage />} />
            <Route path="questions/add" element={<AddQuestionPage />} />
            <Route path="questions/edit" element={<AddQuestionPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="students/add" element={<AddStudentPage />} />
            <Route path="students/edit" element={<AddStudentPage />} />
            <Route path="reset" element={<ResetPasswordPage />} />
          </Route>
          <Route path="/student" element={<PrivateRoute role="mahasiswa" />}>
            <Route index element={<StudentDashboard/>} />
            <Route path="test" element={<ListeningTest/>} />
            <Route path="reset" element={<ResetPasswordPage />} />
          </Route>
        </Routes>
      </Router>
    </UserProvider>
  )
}

export default App
