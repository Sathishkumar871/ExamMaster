import { BrowserRouter, Routes, Route } from "react-router-dom";

// ================= PAGES =================
import Home from "./pages/Home";
import Login from "./pages/Login";
import TeacherLogin from "./pages/TeacherLogin";
import Register from "./pages/Register";
import StaffRegister from "./pages/StaffRegister";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import StudentRegister from "./pages/StudentRegister";
import Exam from "./pages/Exam";
import Result from "./pages/Result";
import AnswerReview from "./pages/AnswerReview";
import Subjects from "./pages/Subjects";
import MockTests from "./pages/MockTests";
import DailyTest from "./pages/DailyTest";
import StudentComplaints from "./pages/StudentComplaints";
import Gallery from "./components/Gallery";
import AboutCollege from "./components/college/AboutCollege";
import Admission from "./components/college/Admissions";
import Faculty from "./components/college/Faculty";
import FAQ from "./components/college/FAQ";
import PrivacyPolicy from "./components/college/PrivacyPolicy";
import TermsConditions from "./components/college/TermsConditions";

// ================= TEACHER PAGES =================
import MentorDashboard from "./pages/MentorDashboard";
import MentorStudentProgress from "./pages/MentorStudentProgress";
import ProgressCard from "./pages/ProgressCard"; 
import TeacherDashboard from "./pages/TeacherDashboard";
import CreateDailyTest from "./pages/CreateDailyTest";
import DailyTestsManager from "./pages/DailyTestsManager";
import ExamManagement from "./pages/ExamManagement";
import StudentManagement from "./pages/StudentManagement";
import ResultsManagement from "./pages/ResultsManagement";
import QuestionBank from "./pages/QuestionBank";
import TeacherComplaints from "./pages/TeacherComplaints";
import StudentHistory from "./pages/StudentHistory";
import HealthEvaluation from "./pages/HealthEvaluation";
import FoodEvaluation from "./pages/FoodEvaluation";
import HostelEvaluation from "./pages/HostelEvaluation";
import AcademicEvaluation from "./pages/AcademicEvaluation";
import MentorActionPlan from "./pages/MentorActionPlan";

// ================= HEAD =================
import HeadDashboard from "./pages/HeadDashboard";

// ================= OTHER =================
import NotFound from "./pages/NotFound";

// ================= PROTECTED =================
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/teacher/login" element={<TeacherLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student/register" element={<StudentRegister />} />
        <Route path="/staff/register" element={<StaffRegister />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/about" element={<AboutCollege />} />
        <Route path="/admissions" element={<Admission />} />
        <Route path="/faculty" element={<Faculty />} />
        <Route path="/faq" element={<FAQ />} />
         <Route path="/privacy" element={<PrivacyPolicy />} />
         <Route path="/terms" element={<TermsConditions />} />

        {/* ================= STUDENT ROUTES ================= */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/subjects" element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
        <Route path="/student/daily-test" element={<ProtectedRoute><DailyTest /></ProtectedRoute>} />
        <Route path="/student/complaints" element={<ProtectedRoute><StudentComplaints /></ProtectedRoute>} />
         
        {/* MENTOR / STUDENT EVALUATION ROUTES */}
        <Route path="/mentor/student/:studentId/history" element={<ProtectedRoute><StudentHistory /></ProtectedRoute>} />
        <Route path="/mentor/evaluation/:studentId/health" element={<ProtectedRoute><HealthEvaluation /></ProtectedRoute>} />
        <Route path="/mentor/evaluation/:studentId/food" element={<ProtectedRoute><FoodEvaluation /></ProtectedRoute>} />
        <Route path="/mentor/evaluation/:studentId/hostel" element={<ProtectedRoute><HostelEvaluation /></ProtectedRoute>} />
        <Route path="/mentor/evaluation/:studentId/academic" element={<ProtectedRoute><AcademicEvaluation /></ProtectedRoute>} />
        <Route path="/mentor/evaluation/:studentId/action" element={<ProtectedRoute><MentorActionPlan /></ProtectedRoute>} />
        <Route path="/mentor/student/:studentId" element={<ProtectedRoute><MentorStudentProgress /></ProtectedRoute>} />
        <Route path="/mentor/student/:studentId/progress-card" element={<ProtectedRoute><ProgressCard /></ProtectedRoute>} />

        {/* ================= TEST ROUTES ================= */}
        <Route path="/mock-tests" element={<ProtectedRoute><MockTests /></ProtectedRoute>} />
        <Route path="/exam/:id" element={<ProtectedRoute><Exam /></ProtectedRoute>} />
        <Route path="/result" element={<ProtectedRoute><Result /></ProtectedRoute>} />
        <Route path="/review/:id" element={<ProtectedRoute><AnswerReview /></ProtectedRoute>} />

        {/* ================= TEACHER / MENTOR ROUTES ================= */}
        <Route path="/teacher/dashboard" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/mentor/dashboard" element={<ProtectedRoute><MentorDashboard /></ProtectedRoute>} />
        <Route path="/teacher/questions" element={<ProtectedRoute><QuestionBank /></ProtectedRoute>} />
        <Route path="/teacher/exams/create" element={<ProtectedRoute><CreateDailyTest /></ProtectedRoute>} />
        <Route path="/teacher/exams" element={<ProtectedRoute><DailyTestsManager /></ProtectedRoute>} />
        <Route path="/teacher/exam-management" element={<ProtectedRoute><ExamManagement /></ProtectedRoute>} />
        <Route path="/teacher/students" element={<ProtectedRoute><StudentManagement /></ProtectedRoute>} />
        <Route path="/teacher/results" element={<ProtectedRoute><ResultsManagement /></ProtectedRoute>} />
        <Route path="/teacher/complaints" element={<ProtectedRoute><TeacherComplaints /></ProtectedRoute>} />

        {/* ================= HEAD ROUTES ================= */}
        <Route path="/head/dashboard" element={<ProtectedRoute><HeadDashboard /></ProtectedRoute>} />
        <Route path="/question-bank" element={<ProtectedRoute><QuestionBank /></ProtectedRoute>} />
        <Route path="/create-exam" element={<ProtectedRoute><CreateDailyTest /></ProtectedRoute>} />

        {/* ================= 404 ================= */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;