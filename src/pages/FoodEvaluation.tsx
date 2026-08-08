import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Utensils, 
  ArrowLeft, 
  Save, 
  Loader2, 
  CheckCircle2, 
  Calendar, 
  Smile, 
  Clock, 
  Droplets, 
  Activity, 
  AlertTriangle, 
  MessageSquare 
} from "lucide-react";
import "./FoodEvaluation.css"; // మీ CSS ఫైల్ పేరు

export default function FoodEvaluation() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("staffToken");

  const [loading, setLoading] = useState(false);
  const [food, setFood] = useState({
    satisfaction: "",
    mealPattern: "",
    waterIntake: "",
    nutritionQuality: "",
    concerns: [] as string[],
    feedback: "",
  });

  const updateField = (key: string, value: string) => {
    setFood({ ...food, [key]: value });
  };

  const toggleConcern = (item: string) => {
    if (food.concerns.includes(item)) {
      setFood({
        ...food,
        concerns: food.concerns.filter((x) => x !== item),
      });
    } else {
      setFood({
        ...food,
        concerns: [...food.concerns, item],
      });
    }
  };

  const saveFood = async () => {
    try {
      setLoading(true);
      await axios.put(
        "https://exammaster-backend-up1y.onrender.com/api/mentor/weekly-feedback",
        { studentId, food },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/mentor/evaluation/${studentId}/hostel`);
    } catch (error: any) {
      console.log(error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="evaluation-page-wrapper">
      <div className="evaluation-container">
        
        {/* TOP HEADER */}
        <div className="evaluation-header">
          <div className="header-left">
            <div className="header-icon-wrapper">
              <Utensils size={28} />
            </div>
            <div>
              <h1>Food & Nutrition Evaluation</h1>
              <p className="sub-title">
                Student ID: <span>{studentId}</span>
              </p>
            </div>
          </div>
          <div className="header-right">
            <div className="progress-pill">
              <CheckCircle2 size={16} /> Step 1 of 4
            </div>
            <div className="date-badge">
              <Calendar size={16} /> {currentDate}
            </div>
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="evaluation-grid-wrapper">
          
          {/* 1. Satisfaction */}
          <div className="evaluation-card">
            <h2>
              <Smile className="card-title-icon" size={22} />
              Mess / Canteen Food Satisfaction *
            </h2>
            <div className="option-grid">
              {["Excellent", "Good", "Average", "Poor"].map((item) => (
                <button
                  type="button"
                  key={item}
                  className={food.satisfaction === item ? "active-option" : "option"}
                  onClick={() => updateField("satisfaction", item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Meal Pattern */}
          <div className="evaluation-card">
            <h2>
              <Clock className="card-title-icon" size={22} />
              Meal Consumption Pattern *
            </h2>
            <div className="option-grid">
              {["Regularly", "Occasionally Skip", "Frequently Skip"].map((item) => (
                <button
                  type="button"
                  key={item}
                  className={food.mealPattern === item ? "active-option" : "option"}
                  onClick={() => updateField("mealPattern", item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Water Intake */}
          <div className="evaluation-card">
            <h2>
              <Droplets className="card-title-icon" size={22} />
              Water Intake *
            </h2>
            <div className="option-grid">
              {["Adequate", "Moderate", "Inadequate"].map((item) => (
                <button
                  type="button"
                  key={item}
                  className={food.waterIntake === item ? "active-option" : "option"}
                  onClick={() => updateField("waterIntake", item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Nutrition Quality */}
          <div className="evaluation-card">
            <h2>
              <Activity className="card-title-icon" size={22} />
              Nutrition Quality
            </h2>
            <div className="option-grid">
              {["Balanced Diet", "Mostly Healthy", "Needs Improvement", "Poor Nutrition"].map((item) => (
                <button
                  type="button"
                  key={item}
                  className={food.nutritionQuality === item ? "active-option" : "option"}
                  onClick={() => updateField("nutritionQuality", item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Concerns Checkboxes */}
          <div className="evaluation-card full-width-card">
            <h2>
              <AlertTriangle className="card-title-icon" size={22} />
              Food Related Concerns
            </h2>
            <div className="option-grid">
              {[
                "Plate & Glass Cleanliness",
                "Reduced Appetite",
                "Junk Food Habit",
                "Less Protein Intake",
                "Less Fruits & Veggies",
                "No Issues",
              ].map((item) => (
                <button
                  type="button"
                  key={item}
                  className={food.concerns.includes(item) ? "active-option" : "option"}
                  onClick={() => toggleConcern(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Feedback */}
          <div className="evaluation-card full-width-card">
            <h2>
              <MessageSquare className="card-title-icon" size={22} />
              Mentor Feedback & Observations
            </h2>
            <textarea
              placeholder="Write detailed observations regarding student's dietary habits here..."
              value={food.feedback}
              onChange={(e) => updateField("feedback", e.target.value)}
            />
          </div>

        </div>

        {/* STICKY BOTTOM ACTION BAR */}
        <div className="sticky-action-bar">
          <div className="action-bar-info">
            <span>Next: Hostel Evaluation</span>
            <p>Ensure all required fields marked with * are filled.</p>
          </div>
          <div className="action-buttons-group">
            <button 
              type="button" 
              className="back-btn" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={18} /> Back
            </button>
            <button 
              type="button" 
              className="save-btn" 
              onClick={saveFood}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Saving...
                </>
              ) : (
                "Next Evaluation →"
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}