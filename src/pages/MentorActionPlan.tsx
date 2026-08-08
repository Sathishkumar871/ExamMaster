import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Target, 
  Users, 
  MessageSquare, 
  AlertTriangle, 
  FileText, 
  ArrowRight, 
  Loader2, 
  Calendar, 
  CheckCircle2,
  Sparkles,
  ShieldAlert
} from "lucide-react";
import "./Evaluation.css";

export default function MentorActionPlan() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("staffToken");
  const [loading, setLoading] = useState(false);

  const currentDate = new Date().toISOString().split("T")[0];
  const currentWeek = "2026-W30";

  // Action plan & behavioral evaluation state
  const [planData, setPlanData] = useState({
    behaviour: "",            // Excellent, Good, Average, Poor
    facultyInteraction: "",   // Active, Moderate, Hesitant, Poor
    peerRelationship: "",     // Friendly, Good, Average, Isolated
    disciplinaryIssues: "",   // Yes / No
    disciplinaryDetails: "",  // Details if Yes
    notes: ""                 // Mentor Personal Feedback / Action Plan
  });

  const completedFields = [
    planData.behaviour, 
    planData.facultyInteraction, 
    planData.peerRelationship, 
    planData.disciplinaryIssues
  ].filter(Boolean).length;

  const isComplete = completedFields === 4;

  const updateField = (key: string, value: string) => {
    setPlanData({
      ...planData,
      [key]: value,
    });
  };

  const submitPlan = async () => {
    try {
      setLoading(true);

      // Backend API call (replace endpoint as per your project)
      await axios.put(
        "https://exammaster-backend-up1y.onrender.com/api/mentor/weekly-feedback",
        {
          studentId,
          actionPlan: planData,
          week: currentWeek,
          date: currentDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Student Evaluation Completed Successfully!");
      navigate(`/mentor/student/${studentId}/progress`);
    } catch (error: any) {
      console.log(error.response?.data || error.message);
      alert("Update Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="evaluation-page-wrapper">
      <div className="evaluation-container">
        
        {/* HEADER SECTION */}
        <div className="evaluation-header">
          <div className="header-left">
            <div className="header-icon-wrapper" style={{ background: "#fef3c7", color: "#d97706" }}>
              <Target size={26} />
            </div>
            <div>
              <h1>Mentor Action Plan & Behaviour</h1>
              <p className="sub-title">Student ID: <span>{studentId}</span></p>
            </div>
          </div>
          <div className="header-right">
            <div className="progress-pill">
              <Sparkles size={14} /> {completedFields}/4 Completed
            </div>
            <div className="date-badge">
              <Calendar size={14} /> {currentDate}
            </div>
          </div>
        </div>

        {/* 2x2 METRICS GRID */}
        <div className="evaluation-grid-wrapper">
          
          {/* 1. CLASSROOM BEHAVIOUR */}
          <div className="evaluation-card">
            <h2>
              <Target size={16} className="card-title-icon" /> Classroom Behaviour
            </h2>
            <div className="option-grid">
              {["Excellent", "Good", "Average", "Poor"].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={planData.behaviour === item ? "active-option" : "option"}
                  onClick={() => updateField("behaviour", item)}
                >
                  {planData.behaviour === item && <CheckCircle2 size={14} />}
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* 2. INTERACTION WITH FACULTY */}
          <div className="evaluation-card">
            <h2>
              <MessageSquare size={16} className="card-title-icon" /> Interaction with Faculty
            </h2>
            <div className="option-grid">
              {["Active", "Moderate", "Hesitant", "Poor"].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={planData.facultyInteraction === item ? "active-option" : "option"}
                  onClick={() => updateField("facultyInteraction", item)}
                >
                  {planData.facultyInteraction === item && <CheckCircle2 size={14} />}
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* 3. PEER RELATIONSHIP */}
          <div className="evaluation-card">
            <h2>
              <Users size={16} className="card-title-icon" /> Peer Relationship
            </h2>
            <div className="option-grid">
              {["Friendly", "Good", "Average", "Isolated"].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={planData.peerRelationship === item ? "active-option" : "option"}
                  onClick={() => updateField("peerRelationship", item)}
                >
                  {planData.peerRelationship === item && <CheckCircle2 size={14} />}
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* 4. DISCIPLINARY ISSUES REPORTED */}
          <div className="evaluation-card">
            <h2>
              <AlertTriangle size={16} className="card-title-icon" /> Disciplinary Issues Reported
            </h2>
            <div className="option-grid">
              {["Yes", "No"].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={planData.disciplinaryIssues === item ? "active-option" : "option"}
                  onClick={() => updateField("disciplinaryIssues", item)}
                >
                  {planData.disciplinaryIssues === item && <CheckCircle2 size={14} />}
                  {item}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* CONDITIONAL DISCIPLINARY DETAILS TEXTAREA (If Yes) */}
        {planData.disciplinaryIssues === "Yes" && (
          <div className="evaluation-card full-width-card" style={{ borderColor: "#fca5a5", background: "#fff5f5" }}>
            <h2>
              <ShieldAlert size={16} style={{ color: "#dc2626" }} /> Specify Disciplinary Details
            </h2>
            <textarea
              placeholder="Provide details regarding the disciplinary issues reported..."
              value={planData.disciplinaryDetails}
              onChange={(e) => updateField("disciplinaryDetails", e.target.value)}
              style={{ borderColor: "#fca5a5" }}
            />
          </div>
        )}

        {/* MENTOR PERSONAL FEEDBACK / ACTION PLAN TEXTAREA */}
        <div className="evaluation-card full-width-card">
          <h2>
            <FileText size={16} className="card-title-icon" /> Mentor Personal Feedback & Action Plan
          </h2>
          <textarea
            placeholder="Write mentor action plan, guidance provided, or overall feedback for the student..."
            value={planData.notes}
            onChange={(e) => updateField("notes", e.target.value)}
          />
        </div>

        {/* STICKY BOTTOM ACTION BAR */}
        <div className="sticky-action-bar">
          <div className="action-bar-info">
            <span>Ready to complete?</span>
            <p>{isComplete ? "All core parameters evaluated successfully." : "Please select all 4 core options to complete."}</p>
          </div>
          <button
            className="save-btn"
            disabled={loading || !isComplete}
            onClick={submitPlan}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Submitting...
              </>
            ) : (
              <>
                Complete Evaluation <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}