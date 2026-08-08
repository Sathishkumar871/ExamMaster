import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  Heart,
  Utensils,
  Home,
  ShieldAlert,
  BookOpen,
  Award,
  Printer,
  ArrowLeft
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

import "./ProgressCard.css";

interface ProgressCardProps {
  student?: any;
  onClose?: () => void;
  logoUrl?: string;         
  backgroundUrl?: string;  
}

export default function ProgressCard({
  student: propStudent,
  onClose,
  logoUrl = "https://res.cloudinary.com/dlkborjdl/image/upload/v1785332958/images_i0oy4a.jpg",
  backgroundUrl = "https://res.cloudinary.com/dlkborjdl/image/upload/v1785383712/IMG_20260730_091436_lkmtde.jpg"
}: ProgressCardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { studentId } = useParams();

  const [studentData, setStudentData] = useState<any>(
    location.state?.student || propStudent || null
  );
  const [loading, setLoading] = useState<boolean>(!studentData);

  useEffect(() => {
    if (!studentData && studentId) {
      fetchStudentProgress();
    }
  }, [studentId]);

  const fetchStudentProgress = async () => {
    try {
      const token = localStorage.getItem("staffToken") || localStorage.getItem("teacherToken");
      const response = await axios.get(
        `http://localhost:5000/api/mentor/student/${studentId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setStudentData({
        ...response.data.student,
        feedback: response.data.feedback,
        results: response.data.results || []
      });
    } catch (error) {
      console.error("Error fetching progress card data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ display: "flex", height: "100vh", justifyContent: "center", alignItems: "center", background: "#f1f5f9", color: "#713600", fontSize: "1.2rem", fontWeight: 600 }}>
        ✨ Loading Progress Card Report...
      </div>
    );
  }

  if (!studentData) {
    return (
      <div style={{ textAlign: "center", padding: "50px", color: "#713600" }}>
        <h3>No Student Data Found</h3>
        <button onClick={handleBack} className="back-btn" style={{ margin: "20px auto" }}>
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  const feedback = studentData?.feedback || {};
  const results: any[] = studentData?.results || [];

  // Text values to numerical score converter (Returns 0 if no data)
  const getValueScore = (val: any): number => {
    if (!val || val === "Not Updated" || val === "N/A") return 0;
    const str = val.toString().toLowerCase();
    
    if (str.includes("%")) return parseInt(str) || 0;
    if (str.includes("excel") || str.includes("completed") || str.includes("active") || str.includes("regular") || str.includes("high") || str.includes("fast")) return 100;
    if (str.includes("good") || str.includes("controlled") || str.includes("6-8") || str.includes("95")) return 85;
    if (str.includes("average") || str.includes("low")) return 60;
    if (str.includes("poor") || str.includes("irregular") || str.includes("inadequate")) return 30;
    
    return 0;
  };

  // Calculate category score average (Returns 0 if section data is missing)
  const calculateCategoryAverage = (categoryObj: any): number => {
    if (!categoryObj || typeof categoryObj !== "object") return 0;
    const values = Object.values(categoryObj).filter((v: any) => v && v !== "Not Updated" && v !== "N/A");
    if (values.length === 0) return 0;
    
    let totalScore = 0;
    values.forEach((val: any) => {
      totalScore += getValueScore(val);
    });
    return Math.round(totalScore / values.length);
  };

  return (
    <div className="progress-page-wrapper">
      
      {/* TOP NAVIGATION */}
      <div className="report-top-bar">
        <button onClick={handleBack} className="back-btn">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <button onClick={handlePrint} className="print-btn">
          <Printer size={16} /> Print A4 Report
        </button>
      </div>

      {/* STRICT SINGLE A4 SHEET */}
      <div 
        className="a4-report-sheet"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.93), rgba(255, 255, 255, 0.93)), url(${backgroundUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        
        {/* HEADER BRANDING */}
        <div className="student-header">
          <div className="institution-branding">
            <div className="logo-title-flex">
              <img 
                src={logoUrl} 
                alt="Logo" 
                className="college-logo" 
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { 
                  (e.target as HTMLElement).style.display = 'none'; 
                }} 
              />
              <div>
                <h2>STG PU COLLEGE </h2>
                <p>QUEST FOR EXCELLENCE</p>
              </div>
            </div>
            <div className="report-title-badge">Student Progress & Mentoring Report</div>
          </div>

          <div className="student-biodata-grid">
            <div className="bio-box">
              <p><b>Student Name:</b> {studentData?.name || "N/A"}</p>
              <p><b>Student ID:</b> {studentData?.studentId || "N/A"}</p>
              <p><b>Class / Course:</b> {studentData?.className || "N/A"}</p>
            </div>
            <div className="bio-box">
              <p><b>Section:</b> {studentData?.section || "N/A"}</p>
              <p><b>Academic Year:</b> 2025 - 2026</p>
              <p><b>Mentor Action Plan:</b> {studentData?.mentorActionPlan || feedback?.mentorActionPlan || "Improve consistency"}</p>
            </div>
          </div>
        </div>

        {/* FEEDBACK ANALYTICS - GRAPHS & PROGRESS BARS */}
        <div className="analytics-grid">
          
          {/* HEALTH */}
          <div className="progress-section-card">
            <div className="section-header">
              <Heart size={15} />
              <h3>Health & Wellbeing</h3>
              <b>{calculateCategoryAverage(feedback.health)}%</b>
            </div>
            <div className="bar">
              <div className="bar-fill" style={{ width: `${calculateCategoryAverage(feedback.health)}%` }}></div>
            </div>
            <p className="sub-text">Fitness: {feedback.health?.fitness || "N/A"} | Sleep: {feedback.health?.sleep || "N/A"}</p>
          </div>

          {/* FOOD */}
          <div className="progress-section-card">
            <div className="section-header">
              <Utensils size={15} />
              <h3>Food & Nutrition</h3>
              <b>{calculateCategoryAverage(feedback.food)}%</b>
            </div>
            <div className="bar">
              <div className="bar-fill" style={{ width: `${calculateCategoryAverage(feedback.food)}%` }}></div>
            </div>
            <p className="sub-text">Satisfaction: {feedback.food?.satisfaction || "N/A"} | Water: {feedback.food?.waterIntake || "N/A"}</p>
          </div>

          {/* HOSTEL */}
          <div className="progress-section-card">
            <div className="section-header">
              <Home size={15} />
              <h3>Hostel Life</h3>
              <b>{calculateCategoryAverage(feedback.hostel)}%</b>
            </div>
            <div className="bar">
              <div className="bar-fill" style={{ width: `${calculateCategoryAverage(feedback.hostel)}%` }}></div>
            </div>
            <p className="sub-text">Environment: {feedback.hostel?.roomEnvironment || "N/A"} | Cleanliness: {feedback.hostel?.cleanliness || "N/A"}</p>
          </div>

          {/* BEHAVIOR */}
          <div className="progress-section-card">
            <div className="section-header">
              <ShieldAlert size={15} />
              <h3>Behaviour & Discipline</h3>
              <b>{calculateCategoryAverage(feedback.behavior)}%</b>
            </div>
            <div className="bar">
              <div className="bar-fill" style={{ width: `${calculateCategoryAverage(feedback.behavior)}%` }}></div>
            </div>
            <p className="sub-text">Discipline: {feedback.behavior?.discipline || "N/A"} | Attendance: {feedback.behavior?.attendance || "N/A"}</p>
          </div>

          {/* ACADEMIC */}
          <div className="progress-section-card" style={{ gridColumn: "span 2" }}>
            <div className="section-header">
              <BookOpen size={15} />
              <h3>Academic Performance</h3>
              <b>{calculateCategoryAverage(feedback.academic)}%</b>
            </div>
            <div className="bar">
              <div className="bar-fill" style={{ width: `${calculateCategoryAverage(feedback.academic)}%` }}></div>
            </div>
            <p className="sub-text">
              Strong: {feedback.academic?.strongSubjects || "N/A"} | Weak: {feedback.academic?.weakSubjects || "N/A"} | Performance: {feedback.academic?.overallPerformance || "N/A"}
            </p>
          </div>

        </div>

        {/* EXAM RESULTS & PERFORMANCE CHART */}
        <div className="results-card">
          <h2><Award size={15} /> Exam Results & Performance Analytics</h2>
          {results.length === 0 ? (
            <p className="no-data-text">No Exam Records Found</p>
          ) : (
            <>
              {/* Graphical Bar Chart for Exams */}
              <div style={{ width: "100%", height: 180, marginBottom: "12px" }}>
                <ResponsiveContainer>
                  <BarChart data={results}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="examName" stroke="#444" fontSize={11} />
                    <YAxis domain={[0, 100]} stroke="#444" fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="percentage" fill="#713600" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Table Data */}
              <table>
                <thead>
                  <tr>
                    <th>Exam Name</th>
                    <th>Subject</th>
                    <th>Marks</th>
                    <th>Percentage</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.slice(0, 2).map((item: any, index: number) => (
                    <tr key={index}>
                      <td>{item.examName || "-"}</td>
                      <td>{item.subject || "-"}</td>
                      <td>{item.marks || 0} / {item.totalQuestions || 100}</td>
                      <td>{item.percentage || 0}%</td>
                      <td><span className="status-badge">{item.status || "-"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* SIGNATURE SECTION */}
        <div className="report-signatures">
          <div className="sig-box">
            <p>Mentor Signature</p>
          </div>
          <div className="sig-box">
            <img 
              src="https://res.cloudinary.com/dlkborjdl/image/upload/v1785498114/1000063843-removebg-preview_1_nygqrq.png" 
              alt="Principal Authority Signature" 
              className="signature-img"
            />
            <p>Principal / Authority</p>
          </div>
        </div>

      </div>
    </div>
  );
}