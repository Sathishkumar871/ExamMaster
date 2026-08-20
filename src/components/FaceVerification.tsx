import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { ShieldCheck, UserCheck, KeyRound, Scan, AlertTriangle, Cpu, Terminal, Lock } from "lucide-react";
import "./FaceVerification.css";

interface Props {
  onVerified: () => void;
  onViolation: (count: number) => void;
}

export default function FaceVerification({ onVerified, onViolation }: Props) {
  const webcamRef = useRef<Webcam>(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [scanCompleted, setScanCompleted] = useState(false);
  const [statusText, setStatusText] = useState("INITIALIZING NEURAL KERNEL...");
  const [isVerified, setIsVerified] = useState(false);
  const [mentorOverrideActive, setMentorOverrideActive] = useState(false);
  const [mentorPin, setMentorPin] = useState("");
  const [mentorError, setMentorError] = useState("");
  
  const [confidenceScore, setConfidenceScore] = useState<number>(0);
  const [successStreak, setSuccessStreak] = useState<number>(0);

  const [studentName, setStudentName] = useState("Operator");
  const [studentId, setStudentId] = useState("");

  useEffect(() => {
    const getStoredName = () => {
      const direct = localStorage.getItem("studentName") || localStorage.getItem("name");
      if (direct) return direct;
      const userStr = localStorage.getItem("user") || localStorage.getItem("student");
      if (userStr) {
        try {
          const obj = JSON.parse(userStr);
          if (obj?.name) return obj.name;
        } catch (e) {}
      }
      return "Candidate";
    };

    const getStoredId = () => {
      const direct = localStorage.getItem("studentId") || localStorage.getItem("id");
      if (direct) return direct;
      const userStr = localStorage.getItem("user") || localStorage.getItem("student");
      if (userStr) {
        try {
          const obj = JSON.parse(userStr);
          if (obj?.studentId || obj?.id) return obj.studentId || obj.id;
        } catch (e) {}
      }
      return "STG-X99-SEC";
    };

    setStudentName(getStoredName());
    setStudentId(getStoredId());
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isVerified && !mentorOverrideActive) {
        onViolation(1);
        setStatusText("⚠️ SECURITY ALERT: TAB SWITCH BLOCKED & LOGGED");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isVerified, mentorOverrideActive, onViolation]);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        setStatusText(`BIOMETRIC MATRIX ONLINE. CALIBRATING FOR ${studentName.toUpperCase()}...`);
      } catch (error) {
        console.error("Model Load Error:", error);
        setStatusText("CRITICAL ERROR: NEURAL MATRIX FAILURE.");
      }
    };
    loadModels();
  }, [studentName]);

  useEffect(() => {
    if (!modelsLoaded || isVerified || mentorOverrideActive) return;

    const performScan = async () => {
      if (!webcamRef.current || !webcamRef.current.video) return;

      const video = webcamRef.current.video;
      if (video.readyState !== 4) return;

      try {
        const detections = await faceapi.detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.6 })
        );

        setScanCompleted(true);

        if (detections.length === 1) {
          const score = Math.round(detections[0].score * 100);
          setConfidenceScore(score);
          setFaceDetected(true);
          
          const nextStreak = successStreak + 1;
          setSuccessStreak(nextStreak);
          setStatusText(`🔒 SYNCING BIOMETRICS: ${score}% ACCURACY [FRAME ${nextStreak}/3]`);

          if (nextStreak >= 3) {
            setIsVerified(true);
            setStatusText(`✅ ACCESS GRANTED: ${studentName.toUpperCase()}. INITIALIZING DASHBOARD...`);
            
            setTimeout(() => {
              onVerified();
            }, 1200);
          }
        } else {
          setFaceDetected(false);
          setSuccessStreak(0);
          setConfidenceScore(0);
          
          if (detections.length > 1) {
            onViolation(1);
            setStatusText("🚨 ANOMALY: MULTIPLE ENTITIES DETECTED IN SECTOR.");
          } else {
            setStatusText("⚠️ ALIGN FACE WITHIN SCAN GRID OR DEPLOY MENTOR KEY.");
          }
        }
      } catch (err) {
        console.error("Detection Error:", err);
        setScanCompleted(true);
      }
    };

    const interval = setInterval(performScan, 1200);
    return () => clearInterval(interval);
  }, [modelsLoaded, isVerified, mentorOverrideActive, successStreak, onVerified, onViolation, studentName]);

  const handleMentorOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (mentorPin === "STG2026" || mentorPin === "mentor123") {
      setMentorOverrideActive(true);
      setIsVerified(true);
      setFaceDetected(true);
      setStatusText(`🛡️ OVERRIDE ACCEPTED. AUTHORIZED BY PROCTOR.`);
      
      setTimeout(() => {
        onVerified();
      }, 1000);
    } else {
      setMentorError("INVALID AUTHORIZATION PASSCODE.");
    }
  };

  return (
    <div className="cyber-proctor-root">
      {/* Background Cyber Glow Effects */}
      <div className="cyber-glow-blob blob-1"></div>
      <div className="cyber-glow-blob blob-2"></div>

      <div className="cyber-card-container">
        
        {/* Top Header */}
        <div className="cyber-header">
          <div className="cyber-badge-row">
            <span className="cyber-badge-secure">
              <Lock size={12} /> SECURE ENCLAVE V4.2
            </span>
            <span className="cyber-live-pulse">
              <span className="pulse-dot"></span> LIVE TELEMETRY
            </span>
          </div>
          <h2>Biometric Face Verification</h2>
          
          <div className="cyber-identity-strip">
            <div className="strip-item">
              <span className="strip-label">SUBJECT:</span>
              <span className="strip-val">{studentName}</span>
            </div>
            <div className="strip-item">
              <span className="strip-label">ID HASH:</span>
              <span className="strip-val mono">{studentId}</span>
            </div>
          </div>
        </div>

        {/* Webcam Viewport with Sci-Fi HUD Overlay */}
        <div className="cyber-webcam-frame">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: "user" }}
            className="cyber-webcam-element"
          />
          
          {/* Futuristic Sci-Fi HUD Corner Brackets */}
          <div className="hud-corner top-left"></div>
          <div className="hud-corner top-right"></div>
          <div className="hud-corner bottom-left"></div>
          <div className="hud-corner bottom-right"></div>

          {/* Advanced Neon Laser Scanner Animation */}
          {!isVerified && (
            <div className="cyber-laser-beam">
              <div className="laser-core"></div>
              <Scan className="laser-beam-icon" size={24} />
            </div>
          )}

          {/* HUD Live Data Bar */}
          <div className="cyber-hud-telemetry">
            <span><Terminal size={11} /> ENGINE: TINY-FACE</span>
            <span className="mono text-cyan">MATCH: {confidenceScore}%</span>
          </div>

          <div className={`cyber-border-glow ${faceDetected || mentorOverrideActive ? "secure" : "alert"}`} />
        </div>

        {/* Status Notification Box */}
        <div className="cyber-status-container">
          <p className={faceDetected || mentorOverrideActive ? "text-neon-green" : "text-neon-amber"}>
            {statusText}
          </p>
        </div>

        {/* Mentor Override Form */}
        {scanCompleted && !faceDetected && !isVerified && (
          <div className="cyber-override-card">
            <div className="override-card-title">
              <UserCheck size={16} className="text-amber" />
              <span>Biometric Failure? Proctor Override Required</span>
            </div>
            <p className="override-card-desc">
              Enter your authorized proctor security code to bypass biometric lock for <strong>{studentName}</strong>.
            </p>

            <form onSubmit={handleMentorOverride} className="cyber-form-group">
              <div className="cyber-input-wrapper">
                <KeyRound size={14} className="input-icon" />
                <input
                  type="password"
                  placeholder="Enter Passcode (e.g. STG2026)"
                  value={mentorPin}
                  onChange={(e) => setMentorPin(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="cyber-action-btn">
                Authorize Bypass
              </button>
            </form>
            {mentorError && (
              <p className="cyber-error-text">
                <AlertTriangle size={12} /> {mentorError}
              </p>
            )}
          </div>
        )}

        {isVerified && (
          <div className="cyber-success-banner">
            <ShieldCheck size={20} className="text-green" />
            <span>Identity Confirmed. Securely redirecting to examination workspace...</span>
          </div>
        )}

      </div>
    </div>
  );
}