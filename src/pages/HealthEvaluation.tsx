import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { 
  HeartPulse, 
  Moon, 
  Brain, 
  Activity, 
  FileText, 
  ArrowRight, 
  ArrowLeft,
  Loader2, 
  Calendar, 
  CheckCircle2,
  
} from "lucide-react";
import "./Evaluation.css";

export default function HealthEvaluation() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("staffToken");
  const [loading, setLoading] = useState(false);

  const currentDate = new Date().toISOString().split("T")[0];
  const currentWeek = "2026-W30";

  const [health, setHealth] = useState({
    status: "",
    sleep: "",
    stress: "",
    fitness: "",
    notes: "",
  });

  const completedFields = [health.status, health.sleep, health.stress, health.fitness].filter(Boolean).length;
  const isComplete = completedFields === 4;

  const updateField = (key: string, value: string) => {
    setHealth({
      ...health,
      [key]: value,
    });
  };

  const saveHealth = async () => {
    try {
      setLoading(true);

      await axios.put(
        "https://exammaster-backend-up1y.onrender.com/api/mentor/weekly-feedback",
        {
          studentId,
          health,
          week: currentWeek,
          date: currentDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate(`/mentor/evaluation/${studentId}/food`);
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
        
        {/* TOP HEADER SECTION */}
        <div className="evaluation-header">
          <div className="header-left">
            <div className="header-icon-wrapper">
              <HeartPulse size={26} />
            </div>
            <div>
              <h1>Health & Wellbeing Evaluation</h1>
              <p className="sub-title">Student ID: <span>{studentId}</span></p>
            </div>
          </div>
          <div className="header-right">
            <div className="progress-pill">
               {completedFields}/4 Completed
            </div>
            <div className="date-badge">
              <Calendar size={14} /> {currentDate}
            </div>
          </div>
        </div>

        {/* 2x2 METRICS GRID */}
        <div className="evaluation-grid-wrapper">
          
          {/* 1. GENERAL HEALTH */}
          <div className="evaluation-card">
            <h2>
              <HeartPulse size={16} className="card-title-icon" /> General Health Status
            </h2>
            <div className="option-grid">
              {["Excellent", "Good", "Fair", "Poor"].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={health.status === item ? "active-option" : "option"}
                  onClick={() => updateField("status", item)}
                >
                  {health.status === item && <CheckCircle2 size={14} />}
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* 2. SLEEP DURATION */}
          <div className="evaluation-card">
            <h2>
              <Moon size={16} className="card-title-icon" /> Sleep Duration
            </h2>
            <div className="option-grid">
              {["Less than 5 Hours", "5-6 Hours", "6-8 Hours", "More than 8 Hours"].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={health.sleep === item ? "active-option" : "option"}
                  onClick={() => updateField("sleep", item)}
                >
                  {health.sleep === item && <CheckCircle2 size={14} />}
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* 3. STRESS LEVEL */}
          <div className="evaluation-card">
            <h2>
              <Brain size={16} className="card-title-icon" /> Stress Level
            </h2>
            <div className="option-grid">
              {["Low", "Medium", "High"].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={health.stress === item ? "active-option" : "option"}
                  onClick={() => updateField("stress", item)}
                >
                  {health.stress === item && <CheckCircle2 size={14} />}
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* 4. FITNESS LEVEL */}
          <div className="evaluation-card">
            <h2>
              <Activity size={16} className="card-title-icon" /> Physical Activity
            </h2>
            <div className="option-grid">
              {["Regular", "Ocassional", "Rare", "Never"].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={health.fitness === item ? "active-option" : "option"}
                  onClick={() => updateField("fitness", item)}
                >
                  {health.fitness === item && <CheckCircle2 size={14} />}
                  {item}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* FULL WIDTH MENTOR NOTES */}
        <div className="evaluation-card full-width-card">
          <h2>
            <FileText size={16} className="card-title-icon" /> Mentor Notes & Observations (Optional)
          </h2>
          <textarea
            placeholder="Type specific observations about health, physical condition, or advice given..."
            value={health.notes}
            onChange={(e) => updateField("notes", e.target.value)}
          />
        </div>

        {/* STICKY BOTTOM ACTION BAR WITH BACK & NEXT */}
        <div className="sticky-action-bar">
          <div className="action-bar-info">
            <span>Ready to proceed?</span>
            <p>{isComplete ? "All health parameters evaluated successfully." : "Please select all 4 core options to continue."}</p>
          </div>
          <div className="action-buttons-group">
            <button
              type="button"
              className="back-btn"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              type="button"
              className="save-btn"
              disabled={loading}
              onClick={saveHealth}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Saving...
                </>
              ) : (
                <>
                  Save & Continue <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}