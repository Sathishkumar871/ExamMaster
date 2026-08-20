import React, { useEffect, useRef, useState } from "react";
import {
  Bell,
  Bot,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  X,
} from "lucide-react";

import "./HeadBell.css";

interface HeadBellProps {
  issueCount?: number;
  onOpen?: () => void;
}

export default function HeadBell({
  issueCount = 0,
  onOpen,
}: HeadBellProps) {
  const [open, setOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  // ============================================================
  // CLOSE WHEN CLICKING OUTSIDE
  // ============================================================

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        bellRef.current &&
        !bellRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  // ============================================================
  // OPEN AI ISSUE PANEL
  // ============================================================

  const handleIssueClick = () => {
    setOpen(false);
    onOpen?.();
  };

  // ============================================================
  // BELL CLICK
  // ============================================================

  const handleBellClick = () => {
    setOpen((current) => !current);
  };

  const hasIssues = issueCount > 0;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className="head-bell-wrapper"
      ref={bellRef}
    >
      {/* ======================================================
          BELL BUTTON
      ====================================================== */}

      <button
        type="button"
        className={`head-bell-button ${
          hasIssues ? "has-alerts" : ""
        } ${open ? "is-open" : ""}`}
        onClick={handleBellClick}
        aria-label="Head notifications"
        aria-expanded={open}
      >
        <Bell size={19} />

        {hasIssues && (
          <span className="head-bell-badge">
            {issueCount > 99
              ? "99+"
              : issueCount}
          </span>
        )}
      </button>

      {/* ======================================================
          NOTIFICATION PANEL
      ====================================================== */}

      {open && (
        <div className="head-bell-panel">
          {/* PANEL HEADER */}

          <div className="head-bell-panel-header">
            <div className="head-bell-panel-title">
              <div className="head-bell-panel-icon">
                <Bell size={17} />
              </div>

              <div>
                <strong>
                  Notifications
                </strong>

                <span>
                  Question Bank activity
                </span>
              </div>
            </div>

            <button
              type="button"
              className="head-bell-close"
              onClick={() =>
                setOpen(false)
              }
              aria-label="Close notifications"
            >
              <X size={16} />
            </button>
          </div>

          {/* ==================================================
              AI ISSUE ITEM
          ================================================== */}

          <div
            className={`head-bell-notification ${
              hasIssues
                ? "has-issues"
                : "no-issues"
            }`}
            onClick={
              hasIssues
                ? handleIssueClick
                : undefined
            }
            role={
              hasIssues
                ? "button"
                : undefined
            }
            tabIndex={
              hasIssues
                ? 0
                : undefined
            }
          >
            <div className="head-bell-notification-icon">
              {hasIssues ? (
                <CircleAlert
                  size={19}
                />
              ) : (
                <CheckCircle2
                  size={19}
                />
              )}
            </div>

            <div className="head-bell-notification-content">
              <strong>
                {hasIssues
                  ? "AI Issues Detected"
                  : "No AI Issues"}
              </strong>

              <span>
                {hasIssues
                  ? `${issueCount} question${
                      issueCount === 1
                        ? ""
                        : "s"
                    } require review`
                  : "All checked questions are clear"}
              </span>
            </div>

            {hasIssues && (
              <ChevronRight
                size={17}
                className="head-bell-arrow"
              />
            )}
          </div>

          {/* ==================================================
              AI STATUS
          ================================================== */}

          <div className="head-bell-ai-status">
            <div className="head-bell-ai-icon">
              <Bot size={16} />
            </div>

            <div>
              <strong>
                AI Review System
              </strong>

              <span>
                Monitoring questions automatically
              </span>
            </div>

            <span className="head-bell-online-dot" />
          </div>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <div className="head-bell-footer">
            <span>
              Final approval belongs to Head
            </span>
          </div>
        </div>
      )}
    </div>
  );
}