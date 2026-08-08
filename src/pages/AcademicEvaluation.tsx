import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function AcademicEvaluation() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [ratings, setRatings] = useState<any>({});
  
  const questions = [
    "Attendance",
    "Subject Understanding",
    "Exam Performance",
    "Homework Completion",
    "Learning Interest"
  ];

  const changeRating = (question: string, value: number) => {
    setRatings({
      ...ratings,
      [question]: value
    });
  };

  // Enterprise Professional Theme Styles
  const styles = {
    pageWrapper: {
      minHeight: "100vh",
      background: "#f4f5f7",
      padding: "48px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    container: {
      width: "100%",
      maxWidth: "720px",
      padding: "40px",
      background: "#ffffff",
      borderRadius: "12px",
      boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
      border: "1px solid #e5e7eb",
      color: "#1f2937",
    },
    headerSection: {
      borderBottom: "1px solid #e5e7eb",
      paddingBottom: "24px",
      marginBottom: "28px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    titleGroup: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "6px",
    },
    title: {
      fontSize: "24px",
      fontWeight: "700",
      color: "#111827",
      margin: "0",
      letterSpacing: "-0.3px",
    },
    subtitle: {
      fontSize: "14px",
      color: "#6b7280",
      margin: "0",
      fontWeight: "400",
    },
    studentBadge: {
      fontSize: "12px",
      fontWeight: "600",
      color: "#374151",
      background: "#f3f4f6",
      border: "1px solid #e5e7eb",
      padding: "6px 14px",
      borderRadius: "6px",
      letterSpacing: "0.2px",
    },
    questionCard: {
      background: "#fafafa",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      padding: "20px 24px",
      marginBottom: "16px",
      display: "flex",
      flexDirection: "column" as const,
      gap: "12px",
      transition: "border-color 0.15s ease",
    },
    questionHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    questionTitle: {
      fontSize: "15px",
      fontWeight: "600",
      color: "#374151",
      margin: "0",
    },
    statusLabel: (isRated: boolean) => ({
      fontSize: "12px",
      fontWeight: "500",
      color: isRated ? "#059669" : "#9ca3af",
      background: isRated ? "#ecfdf5" : "transparent",
      padding: "2px 8px",
      borderRadius: "4px",
    }),
    starsWrapper: {
      display: "flex",
      gap: "8px",
    },
    starBtn: (isSelected: boolean) => ({
      background: isSelected ? "#fffbeb" : "#ffffff",
      border: isSelected ? "1px solid #f59e0b" : "1px solid #d1d5db",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "18px",
      width: "38px",
      height: "38px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.15s ease",
      boxShadow: isSelected ? "0 1px 3px rgba(245, 158, 11, 0.15)" : "none",
    }),
    actionSection: {
      marginTop: "32px",
      display: "flex",
      justifyContent: "flex-end",
    },
    continueBtn: {
      padding: "12px 28px",
      background: "#111827",
      color: "#ffffff",
      border: "none",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
      transition: "background-color 0.15s ease",
    },
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        
        <div style={styles.headerSection}>
          <div style={styles.titleGroup}>
            <h1 style={styles.title}>Academic Evaluation</h1>
            <p style={styles.subtitle}>Assess and record student performance metrics</p>
          </div>
          <div style={styles.studentBadge}>
            ID: {studentId}
          </div>
        </div>

        {questions.map((q) => {
          const currentRating = ratings[q] || 0;
          return (
            <div key={q} style={styles.questionCard}>
              <div style={styles.questionHeader}>
                <h3 style={styles.questionTitle}>{q}</h3>
                <span style={styles.statusLabel(currentRating > 0)}>
                  {currentRating > 0 ? `${currentRating}/5 Rated` : "Pending"}
                </span>
              </div>
              
              <div style={styles.starsWrapper}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const isSelected = currentRating >= star;
                  return (
                    <button
                      key={star}
                      onClick={() => changeRating(q, star)}
                      style={styles.starBtn(isSelected)}
                    >
                      {isSelected ? "⭐" : "☆"}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div style={styles.actionSection}>
          <button
            style={styles.continueBtn}
            onClick={() => {
              navigate(`/mentor/evaluation/${studentId}/action`);
            }}
          >
            Continue Assessment
          </button>
        </div>

      </div>
    </div>
  );
}