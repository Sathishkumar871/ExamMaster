import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { ShieldCheck, UserCheck, KeyRound } from "lucide-react";
import "./FaceVerification.css";

interface Props {
  onVerified: () => void;
  onViolation: (count: number) => void;
}

export default function FaceVerification({
  onVerified,
  onViolation
}: Props) {
  const webcamRef = useRef<Webcam>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [scanCompleted, setScanCompleted] = useState(false);
  const [statusText, setStatusText] = useState("Initializing STG Secure Environment...");
  const [isVerified, setIsVerified] = useState(false);
  const [mentorOverrideActive, setMentorOverrideActive] = useState(false);
  const [mentorPin, setMentorPin] = useState("");
  const [mentorError, setMentorError] = useState("");

  // 1. MODEL LOADING
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        setStatusText("System Active. Aligning candidate face...");
      } catch (error) {
        console.log("Model Load Error", error);
        setStatusText("Failed to initialize verification system.");
      }
    };
    loadModels();
  }, []);

  // 2. FACE DETECTION SCAN (Automatic verification on success)
  useEffect(() => {
    if (!modelsLoaded || isVerified || mentorOverrideActive) return;

    const performScan = async () => {
      if (!webcamRef.current || !webcamRef.current.video) return;
      
      const video = webcamRef.current.video;
      if (video.readyState !== 4) return;

      try {
        const detections = await faceapi.detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
        );

        setScanCompleted(true);
        if (detections.length === 1) {
          setFaceDetected(true);
          setIsVerified(true);
          setStatusText("✅ Candidate Identity Verified - Entering Exam...");
          onVerified(); // Automatically proceeds to exam
        } else {
          setFaceDetected(false);
          setStatusText("⚠️ Face Not Detected. Use Mentor ID Override.");
          onViolation(1);
        }
      } catch (err) {
        console.log("Detection Error:", err);
        setScanCompleted(true);
      }
    };

    const interval = setInterval(performScan, 1500);
    return () => clearInterval(interval);
  }, [modelsLoaded, isVerified, mentorOverrideActive, onVerified, onViolation]);

  // Mentor Override Handler
  const handleMentorOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (mentorPin === "STG2026" || mentorPin === "mentor123") {
      setMentorOverrideActive(true);
      setIsVerified(true);
      setFaceDetected(true);
      setStatusText("🛡️ Verified via STG Authorized Mentor ID");
      onVerified();
    } else {
      setMentorError("Invalid Mentor Passcode.");
    }
  };

  return (
    <div className="stg-verification-wrapper">
      <div className="face-container vibrant-face-box">
        <div className="stg-brand-header">
          <span className="stg-badge">STG COLLEGE OF EXCELLENCE</span>
          <h2>Secure Examination Verification</h2>
        </div>

        <div className="webcam-box-wrapper">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: "user" }}
            className="webcam-preview"
          />
          <div className={`scan-indicator-frame ${faceDetected || mentorOverrideActive ? "secure" : "alert"}`} />
        </div>

        <div className="status-display-card">
          <h3 className={faceDetected || mentorOverrideActive ? "text-success" : "text-warning"}>
            {statusText}
          </h3>
        </div>

        {/* MENTOR ID CARD SECTION (Appears ONLY if face is NOT detected after scan) */}
        {scanCompleted && !faceDetected && !isVerified && (
          <div className="mentor-verification-panel">
            <div className="mentor-panel-header">
              <UserCheck size={16} style={{ color: "#ffc75f" }} />
              <span>Face Unidentified? Mentor ID Override</span>
            </div>
            <p className="mentor-instruction">
              STG Proctor: Please present your official College Mentor ID card or enter your secure passcode to authorize.
            </p>

            <form onSubmit={handleMentorOverride} className="mentor-form">
              <div className="input-group">
                <KeyRound size={14} />
                <input
                  type="password"
                  placeholder="Enter Mentor Passcode"
                  value={mentorPin}
                  onChange={(e) => setMentorPin(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="mentor-verify-btn">
                Authorize
              </button>
            </form>
            {mentorError && <p className="mentor-error-text">{mentorError}</p>}
          </div>
        )}

        {isVerified && (
          <div className="success-badge-box">
            <ShieldCheck size={18} style={{ color: "#f9f871" }} />
            <span>Identity Authenticated. Secure Session Active.</span>
          </div>
        )}
      </div>
    </div>
  );
}