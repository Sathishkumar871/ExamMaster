import { useEffect, useRef } from "react";

interface Props {
  timeLeft: number;

  setTimeLeft: React.Dispatch<
    React.SetStateAction<number>
  >;

  onTimeOver: () => void;
}

export default function Timer({
  timeLeft,
  setTimeLeft,
  onTimeOver,
}: Props) {
  // ============================================================
  // PREVENT MULTIPLE TIME-OVER CALLS
  // ============================================================

  const timeOverCalled = useRef(false);

  // ============================================================
  // TIMER
  // ============================================================

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!timeOverCalled.current) {
        timeOverCalled.current = true;
        onTimeOver();
      }

      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [timeLeft, setTimeLeft, onTimeOver]);

  // ============================================================
  // FORMAT TIME
  // ============================================================

  const safeTime = Math.max(0, timeLeft);

  const minutes = Math.floor(
    safeTime / 60
  );

  const seconds = safeTime % 60;

  // ============================================================
  // TIMER CLASS
  // ============================================================

  const isDanger =
    safeTime <= 60;

  const isWarning =
    safeTime <= 300 &&
    safeTime > 60;

  let timerClass = "timer-box";

  if (isDanger) {
    timerClass += " timer-danger";
  } else if (isWarning) {
    timerClass += " timer-warning";
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className={timerClass}>
      <span className="timer-icon">
        ⏰
      </span>

      <div className="timer-content">
        <span className="timer-label">
          Time Remaining
        </span>

        <h3>
          {String(minutes).padStart(2, "0")}:
          {String(seconds).padStart(2, "0")}
        </h3>
      </div>
    </div>
  );
}