import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

// ============================================================
// LAZY LOADED PAGES
// ============================================================

// ================= PUBLIC / AUTH =================
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const TeacherLogin = lazy(() => import("./pages/TeacherLogin"));
const StaffLogin = lazy(() => import("./pages/StaffLogin"));
const Register = lazy(() => import("./pages/Register"));
const StaffRegister = lazy(() => import("./pages/StaffRegister"));
const StudentRegister = lazy(() => import("./pages/StudentRegister"));

// ================= STUDENT =================
const Profile = lazy(() => import("./pages/Profile"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Exam = lazy(() => import("./pages/Exam"));
const SubjectsExam = lazy(() => import("./pages/SubjectsExam"));
const Result = lazy(() => import("./pages/Result"));
const ExamHistory = lazy(() => import("./pages/ExamHistory"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const AnswerReview = lazy(() => import("./pages/AnswerReview"));
const AcademicHelp = lazy(() => import("./pages/student/AcademicHelp"));
const StudyPlanner = lazy(() => import("./pages/student/StudyPlanner"));
const MockTests = lazy(() => import("./pages/MockTests"));
const AIExamStrategy = lazy(() => import("./pages/student/AIExamStrategy"));
const JEEMockTest = lazy(() => import("./pages/JEEMockTest"));
const DailyTest = lazy(() => import("./pages/DailyTest"));
const StudentComplaints = lazy(() => import("./pages/StudentComplaints"));

// ================= COLLEGE =================
const Gallery = lazy(() => import("./components/college/Gallery"));
const AboutCollege = lazy(() => import("./components/college/AboutCollege"));
const Admission = lazy(() => import("./components/college/Admissions"));
const Faculty = lazy(() => import("./components/college/Faculty"));
const FAQ = lazy(() => import("./components/college/FAQ"));
const PrivacyPolicy = lazy(
  () => import("./components/college/PrivacyPolicy")
);
const TermsConditions = lazy(
  () => import("./components/college/TermsConditions")
);

// ================= MENTOR / TEACHER =================
const MentorDashboard = lazy(() => import("./pages/MentorDashboard"));
const MentorStudentProgress = lazy(
  () => import("./pages/MentorStudentProgress")
);
const ProgressCard = lazy(() => import("./pages/ProgressCard"));
const TeacherDashboard = lazy(() => import("./pages/TeacherDashboard"));
const CreateDailyTest = lazy(() => import("./pages/CreateDailyTest"));
const DailyTestsManager = lazy(() => import("./pages/DailyTestsManager"));
const ExamManagement = lazy(() => import("./pages/ExamManagement"));
const StudentManagement = lazy(() => import("./pages/StudentManagement"));
const ResultsManagement = lazy(() => import("./pages/ResultsManagement"));
const QuestionBank = lazy(() => import("./pages/QuestionBank"));
const TeacherComplaints = lazy(() => import("./pages/TeacherComplaints"));
const StudentHistory = lazy(() => import("./pages/StudentHistory"));
const HealthEvaluation = lazy(() => import("./pages/HealthEvaluation"));
const FoodEvaluation = lazy(() => import("./pages/FoodEvaluation"));
const HostelEvaluation = lazy(() => import("./pages/HostelEvaluation"));
const AcademicEvaluation = lazy(() => import("./pages/AcademicEvaluation"));
const MentorActionPlan = lazy(() => import("./pages/MentorActionPlan"));

// ================= HEAD =================
const HeadDashboard = lazy(() => import("./pages/HeadDashboard"));

// ================= SUBJECTS =================
const Physics = lazy(() => import("./pages/subjects/Physics"));
const Chemistry = lazy(() => import("./pages/subjects/Chemistry"));
const Botany = lazy(() => import("./pages/subjects/Botany"));
const Zoology = lazy(() => import("./pages/subjects/Zoology"));
const Mathematics = lazy(() => import("./pages/subjects/Mathematics"));

// ================= 404 =================
const NotFound = lazy(() => import("./pages/NotFound"));

// ================= PROTECTED =================
import ProtectedRoute from "./ProtectedRoute";

// ============================================================
// LOADING SCREEN
// ============================================================
   function PremiumPageLoader() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0b1120",
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        overflow: "hidden",
      }}
    >
      {/* Premium Loader */}
      <div
        style={{
          position: "relative",
          width: "58px",
          height: "58px",
          marginBottom: "24px",
        }}
      >
        {/* Outer Ring */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2px solid rgba(245, 158, 11, 0.12)",
            borderTopColor: "#f59e0b",
            animation: "loaderRotate 0.9s linear infinite",
          }}
        />

        {/* Inner Ring */}
        <div
          style={{
            position: "absolute",
            inset: "8px",
            borderRadius: "50%",
            border: "1px solid rgba(245, 158, 11, 0.18)",
            borderBottomColor: "#d97706",
            animation: "loaderRotateReverse 1.2s linear infinite",
          }}
        />

        {/* Center */}
        <div
          style={{
            position: "absolute",
            inset: "17px",
            borderRadius: "50%",
            background: "#f59e0b",
            boxShadow: "0 0 18px rgba(245, 158, 11, 0.4)",
            animation: "centerPulse 1.1s ease-in-out infinite",
          }}
        />
      </div>

      {/* Brand */}
      <div
        style={{
          color: "#f8fafc",
          fontSize: "17px",
          fontWeight: 700,
          letterSpacing: "2.8px",
          fontFamily:
            "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        EXAM<span style={{ color: "#f59e0b" }}>MASTER</span>
      </div>

      {/* Loading Text */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginTop: "11px",
          color: "rgba(255,255,255,0.42)",
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.7px",
        }}
      >
        Loading
        <span
          style={{
            display: "inline-flex",
            marginLeft: "2px",
          }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                opacity: 0.2,
                color: "#f59e0b",
                animation: "dotFade 1s infinite",
                animationDelay: `${i * 0.18}s`,
              }}
            >
              .
            </span>
          ))}
        </span>
      </div>

      {/* Small Progress Line */}
      <div
        style={{
          width: "130px",
          height: "2px",
          marginTop: "16px",
          borderRadius: "20px",
          background: "rgba(255,255,255,0.07)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "-35%",
            width: "35%",
            height: "100%",
            borderRadius: "20px",
            background: "#f59e0b",
            boxShadow: "0 0 8px rgba(245,158,11,0.5)",
            animation: "progressMove 0.8s ease-in-out infinite",
          }}
        />
      </div>

      <style>
        {`
          @keyframes loaderRotate {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes loaderRotateReverse {
            from {
              transform: rotate(360deg);
            }
            to {
              transform: rotate(0deg);
            }
          }

          @keyframes centerPulse {
            0%,
            100% {
              transform: scale(0.8);
              opacity: 0.75;
            }

            50% {
              transform: scale(1);
              opacity: 1;
            }
          }

          @keyframes dotFade {
            0%,
            70%,
            100% {
              opacity: 0.2;
            }

            35% {
              opacity: 1;
            }
          }

          @keyframes progressMove {
            0% {
              left: -35%;
            }

            100% {
              left: 100%;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
            }
          }
        `}
      </style>
    </div>
  );
}

// ============================================================
// APP
// ============================================================
function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PremiumPageLoader />}>
        <Routes>
          {/* =====================================================
              PUBLIC ROUTES
          ====================================================== */}

          <Route
            path="/"
            element={<Home />}
          />

          {/* =====================================================
              SUBJECT ROUTES
          ====================================================== */}

          <Route
            path="/subjects/physics"
            element={
              <ProtectedRoute>
                <Physics />
              </ProtectedRoute>
            }
          />

          <Route
            path="/subjects/chemistry"
            element={
              <ProtectedRoute>
                <Chemistry />
              </ProtectedRoute>
            }
          />

          <Route
            path="/subjects/botany"
            element={
              <ProtectedRoute>
                <Botany />
              </ProtectedRoute>
            }
          />

          <Route
            path="/subjects/zoology"
            element={
              <ProtectedRoute>
                <Zoology />
              </ProtectedRoute>
            }
          />

          <Route
            path="/subjects/mathematics"
            element={
              <ProtectedRoute>
                <Mathematics />
              </ProtectedRoute>
            }
          />

          {/* =====================================================
              LOGIN ROUTES
          ====================================================== */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/teacher/login"
            element={<TeacherLogin />}
          />

          <Route
            path="/staff/login"
            element={<StaffLogin />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/student/register"
            element={<StudentRegister />}
          />

          <Route
            path="/staff/register"
            element={<StaffRegister />}
          />

          {/* =====================================================
              COLLEGE ROUTES
          ====================================================== */}

          <Route
            path="/gallery"
            element={<Gallery />}
          />

          <Route
            path="/about"
            element={<AboutCollege />}
          />

          <Route
            path="/admissions"
            element={<Admission />}
          />

          <Route
            path="/faculty"
            element={<Faculty />}
          />

          <Route
            path="/faq"
            element={<FAQ />}
          />

          <Route
            path="/privacy"
            element={<PrivacyPolicy />}
          />

          <Route
            path="/terms"
            element={<TermsConditions />}
          />

          {/* =====================================================
              STUDENT ROUTES
          ====================================================== */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/study-materials"
            element={
              <ProtectedRoute>
                <AcademicHelp />
              </ProtectedRoute>
            }
          />
                    <Route
                 path="/study-planner"
                 element={
               <ProtectedRoute>
               <StudyPlanner />
           </ProtectedRoute>
             }
                 />
               <Route 
               path="/exam-strategy" 
             element={ 
              <ProtectedRoute> 
             <AIExamStrategy /> 
            </ProtectedRoute> 
            } 
            />
          {/* =====================================================
              DAILY TEST
          ====================================================== */}

          <Route
            path="/student/daily-test"
            element={
              <ProtectedRoute>
                <DailyTest />
              </ProtectedRoute>
            }
          />

          {/* =====================================================
              MOCK TEST
          ====================================================== */}

          <Route
            path="/mock-tests"
            element={
              <ProtectedRoute>
                <MockTests />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/mock-test"
            element={
              <ProtectedRoute>
                <MockTests />
              </ProtectedRoute>
            }
          />

          {/* =====================================================
              JEE MOCK TEST
          ====================================================== */}

          <Route
            path="/jee-mock-tests"
            element={
              <ProtectedRoute>
                <JEEMockTest />
              </ProtectedRoute>
            }
          />

          {/* =====================================================
              STUDENT COMPLAINTS
          ====================================================== */}

          <Route
            path="/student/complaints"
            element={
              <ProtectedRoute>
                <StudentComplaints />
              </ProtectedRoute>
            }
          />

          {/* =====================================================
              MENTOR / STUDENT EVALUATION
          ====================================================== */}

          <Route
            path="/mentor/student/:studentId/history"
            element={
              <ProtectedRoute>
                <StudentHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mentor/evaluation/:studentId/health"
            element={
              <ProtectedRoute>
                <HealthEvaluation />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mentor/evaluation/:studentId/food"
            element={
              <ProtectedRoute>
                <FoodEvaluation />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mentor/evaluation/:studentId/hostel"
            element={
              <ProtectedRoute>
                <HostelEvaluation />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mentor/evaluation/:studentId/academic"
            element={
              <ProtectedRoute>
                <AcademicEvaluation />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mentor/evaluation/:studentId/action"
            element={
              <ProtectedRoute>
                <MentorActionPlan />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mentor/student/:studentId"
            element={
              <ProtectedRoute>
                <MentorStudentProgress />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mentor/student/:studentId/progress-card"
            element={
              <ProtectedRoute>
                <ProgressCard />
              </ProtectedRoute>
            }
          />

          {/* =====================================================
              NORMAL EXAM
          ====================================================== */}

          <Route
            path="/exam/:id"
            element={
              <ProtectedRoute>
                <Exam />
              </ProtectedRoute>
            }
          />

          {/* =====================================================
              SUBJECT EXAM
          ====================================================== */}

          <Route
            path="/subjects/:subject/exam/:id"
            element={
              <ProtectedRoute>
                <SubjectsExam />
              </ProtectedRoute>
            }
          />

          {/* =====================================================
              RESULT
          ====================================================== */}

          <Route
            path="/result"
            element={
              <ProtectedRoute>
                <Result />
              </ProtectedRoute>
            }
          />

          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <ExamHistory />
              </ProtectedRoute>
            }
          />

          {/* =====================================================
              ANSWER REVIEW
          ====================================================== */}

          <Route
            path="/review/:id"
            element={
              <ProtectedRoute>
                <AnswerReview />
              </ProtectedRoute>
            }
          />

          {/* =====================================================
              TEACHER / MENTOR ROUTES
          ====================================================== */}

          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mentor/dashboard"
            element={
              <ProtectedRoute>
                <MentorDashboard />
              </ProtectedRoute>
            }
          />

          {/* =====================================================
              QUESTION BANK
          ====================================================== */}

          <Route
            path="/teacher/questions"
            element={
              <ProtectedRoute>
                <QuestionBank />
              </ProtectedRoute>
            }
          />

          <Route
            path="/question-bank"
            element={
              <ProtectedRoute>
                <QuestionBank />
              </ProtectedRoute>
            }
          />

          {/* =====================================================
              TEACHER EXAMS
          ====================================================== */}

          <Route
            path="/teacher/exams/create"
            element={
              <ProtectedRoute>
                <CreateDailyTest />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/exams"
            element={
              <ProtectedRoute>
                <DailyTestsManager />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/exam-management"
            element={
              <ProtectedRoute>
                <ExamManagement />
              </ProtectedRoute>
            }
          />

          {/* =====================================================
              STUDENT MANAGEMENT
          ====================================================== */}

          <Route
            path="/teacher/students"
            element={
              <ProtectedRoute>
                <StudentManagement />
              </ProtectedRoute>
            }
          />

          {/* =====================================================
              RESULTS MANAGEMENT
          ====================================================== */}

          <Route
            path="/teacher/results"
            element={
              <ProtectedRoute>
                <ResultsManagement />
              </ProtectedRoute>
            }
          />

          {/* =====================================================
              TEACHER COMPLAINTS
          ====================================================== */}

          <Route
            path="/teacher/complaints"
            element={
              <ProtectedRoute>
                <TeacherComplaints />
              </ProtectedRoute>
            }
          />

          {/* =====================================================
              HEAD ROUTES
          ====================================================== */}

          <Route
            path="/head/dashboard"
            element={
              <ProtectedRoute>
                <HeadDashboard />
              </ProtectedRoute>
            }
          />

          {/* =====================================================
              CREATE EXAM
          ====================================================== */}

          <Route
            path="/create-exam"
            element={
              <ProtectedRoute>
                <CreateDailyTest />
              </ProtectedRoute>
            }
          />

          {/* =====================================================
              404
          ====================================================== */}

          <Route
            path="*"
            element={<NotFound />}
          />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;