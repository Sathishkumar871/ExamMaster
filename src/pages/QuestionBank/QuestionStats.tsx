import React from "react";
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileQuestion,
  Clock3,
  Sparkles,
} from "lucide-react";

import "./QuestionStats.css";

interface QuestionStatsProps {
  total: number;
  subject: number;
  daily: number;
  mock: number;
  published: number;
  pending: number;
  rejected: number;
  aiIssues: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
  type:
    | "total"
    | "subject"
    | "daily"
    | "mock"
    | "published"
    | "pending"
    | "rejected"
    | "ai";
}

function StatCard({
  icon,
  label,
  value,
  description,
  type,
}: StatCardProps) {
  return (
    <div
      className={`question-stat-card question-stat-${type}`}
    >
      <div className="question-stat-top">
        <div className="question-stat-icon">
          {icon}
        </div>

        <span className="question-stat-label">
          {label}
        </span>
      </div>

      <div className="question-stat-value">
        {value.toLocaleString()}
      </div>

      <div className="question-stat-description">
        {description}
      </div>
    </div>
  );
}

export default function QuestionStats({
  total,
  subject,
  daily,
  mock,
  published,
  pending,
  rejected,
  aiIssues,
}: QuestionStatsProps) {
  return (
    <section className="question-stats-grid">
      {/* TOTAL */}

      <StatCard
        type="total"
        icon={<FileQuestion size={19} />}
        label="Total Questions"
        value={total}
        description="Complete question library"
      />

      {/* SUBJECT */}

      <StatCard
        type="subject"
        icon={<BookOpen size={19} />}
        label="Subject Questions"
        value={subject}
        description="Chapter & subject based"
      />

      {/* DAILY */}

      <StatCard
        type="daily"
        icon={<CalendarDays size={19} />}
        label="Daily Tests"
        value={daily}
        description="Daily practice questions"
      />

      {/* MOCK */}

      <StatCard
        type="mock"
        icon={<ClipboardList size={19} />}
        label="Mock Tests"
        value={mock}
        description="Full exam practice"
      />

      {/* PUBLISHED */}

      <StatCard
        type="published"
        icon={<CheckCircle2 size={19} />}
        label="Published"
        value={published}
        description="Available to students"
      />

      {/* PENDING */}

      <StatCard
        type="pending"
        icon={<Clock3 size={19} />}
        label="Pending Review"
        value={pending}
        description="Waiting for approval"
      />

      {/* REJECTED */}

      <StatCard
        type="rejected"
        icon={<AlertCircle size={19} />}
        label="Rejected"
        value={rejected}
        description="Needs correction"
      />

      {/* AI */}

      <StatCard
        type="ai"
        icon={<Sparkles size={19} />}
        label="AI Issues"
        value={aiIssues}
        description="Questions requiring attention"
      />
    </section>
  );
}