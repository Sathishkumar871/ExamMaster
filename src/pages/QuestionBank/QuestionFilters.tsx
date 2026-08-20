import React, { useMemo } from "react";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Filter,
  GraduationCap,
  Layers3,
  RotateCcw,
  Sparkles,
  Tags,
  X,
} from "lucide-react";

import type { QuestionFiltersState } from "../QuestionBank";

import "./QuestionFilters.css";

// ============================================================
// PROPS
// ============================================================

interface QuestionFiltersProps {
  filters: QuestionFiltersState;

  onChange: (
    filters: QuestionFiltersState
  ) => void;

  onReset: () => void;
}

// ============================================================
// SELECT OPTIONS
// ============================================================

const SUBJECTS = [
  "Physics",
  "Chemistry",
  "Mathematics",
  "Biology",
  "English",
  "Computer Science",
];

const EXAM_TYPES = [
  "NEET",
  "JEE",
];

const ACADEMIC_YEARS = [
  "1st PUC",
  "2nd PUC",
];

const STATUSES = [
  "pending",
  "published",
  "approved",
  "rejected",
];

const AI_STATUSES = [
  "pending",
  "processing",
  "completed",
  "failed",
];

const TEST_CATEGORIES = [
  "subject",
  "daily",
  "mock",
];

// ============================================================
// FILTER COMPONENT
// ============================================================

export default function QuestionFilters({
  filters,
  onChange,
  onReset,
}: QuestionFiltersProps) {
  // ==========================================================
  // ACTIVE FILTER COUNT
  // ==========================================================

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (
      filters.subject !== "All"
    ) {
      count++;
    }

    if (
      filters.chapter !== "All"
    ) {
      count++;
    }

    if (
      filters.testCategory !== "All"
    ) {
      count++;
    }

    if (
      filters.examType !== "All"
    ) {
      count++;
    }

    if (
      filters.academicYear !== "All"
    ) {
      count++;
    }

    if (
      filters.status !== "All"
    ) {
      count++;
    }

    if (
      filters.aiStatus !== "All"
    ) {
      count++;
    }

    if (
      filters.testId !== "All"
    ) {
      count++;
    }

    if (
      filters.testTitle !== "All"
    ) {
      count++;
    }

    return count;
  }, [filters]);

  // ==========================================================
  // UPDATE
  // ==========================================================

  const updateFilter = (
    key: keyof QuestionFiltersState,
    value: string
  ) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  // ==========================================================
  // SELECT
  // ==========================================================

  const FilterSelect = ({
    icon,
    label,
    value,
    options,
    filterKey,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    options: string[];
    filterKey: keyof QuestionFiltersState;
  }) => {
    return (
      <label className="question-filter-field">
        <span className="question-filter-label">
          <span className="question-filter-label-icon">
            {icon}
          </span>

          {label}
        </span>

        <select
          value={value}
          onChange={(event) =>
            updateFilter(
              filterKey,
              event.target.value
            )
          }
        >
          <option value="All">
            All
          </option>

          {options.map(
            (option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            )
          )}
        </select>
      </label>
    );
  };

  // ==========================================================
  // CLEAR ONE FILTER
  // ==========================================================

  const clearFilter = (
    key: keyof QuestionFiltersState
  ) => {
    updateFilter(key, "All");
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="question-filters">
      {/* ======================================================
          FILTER HEADER
      ====================================================== */}

      <div className="question-filters-header">
        <div className="question-filters-title">
          <div className="question-filters-title-icon">
            <Filter size={16} />
          </div>

          <div>
            <strong>
              Smart Filters
            </strong>

            <span>
              Refine your question library
            </span>
          </div>
        </div>

        <div className="question-filters-header-actions">
          {activeFilterCount > 0 && (
            <span className="question-filter-count">
              {activeFilterCount} active
            </span>
          )}

          <button
            type="button"
            className="question-filter-reset"
            onClick={onReset}
            disabled={
              activeFilterCount === 0
            }
          >
            <RotateCcw size={13} />

            <span>
              Reset
            </span>
          </button>
        </div>
      </div>

      {/* ======================================================
          FILTER GRID
      ====================================================== */}

      <div className="question-filter-grid">
        <FilterSelect
          icon={
            <BookOpen size={13} />
          }
          label="Subject"
          value={filters.subject}
          options={SUBJECTS}
          filterKey="subject"
        />

        <FilterSelect
          icon={
            <Layers3 size={13} />
          }
          label="Chapter"
          value={filters.chapter}
          options={[]}
          filterKey="chapter"
        />

        <FilterSelect
          icon={
            <CalendarDays size={13} />
          }
          label="Test Type"
          value={
            filters.testCategory
          }
          options={
            TEST_CATEGORIES
          }
          filterKey="testCategory"
        />

        <FilterSelect
          icon={
            <GraduationCap size={13} />
          }
          label="Exam"
          value={
            filters.examType
          }
          options={EXAM_TYPES}
          filterKey="examType"
        />

        <FilterSelect
          icon={
            <BookOpen size={13} />
          }
          label="Academic Year"
          value={
            filters.academicYear
          }
          options={
            ACADEMIC_YEARS
          }
          filterKey="academicYear"
        />

        <FilterSelect
          icon={
            <CheckCircle2 size={13} />
          }
          label="Status"
          value={filters.status}
          options={STATUSES}
          filterKey="status"
        />

        <FilterSelect
          icon={
            <Sparkles size={13} />
          }
          label="AI Status"
          value={
            filters.aiStatus
          }
          options={AI_STATUSES}
          filterKey="aiStatus"
        />

        <FilterSelect
          icon={
            <Tags size={13} />
          }
          label="Test ID"
          value={filters.testId}
          options={[]}
          filterKey="testId"
        />
      </div>

      {/* ======================================================
          ACTIVE FILTER CHIPS
      ====================================================== */}

      {activeFilterCount > 0 && (
        <div className="question-active-filters">
          <span className="question-active-label">
            Active:
          </span>

          {filters.subject !==
            "All" && (
            <button
              type="button"
              onClick={() =>
                clearFilter(
                  "subject"
                )
              }
            >
              Subject:{" "}
              {filters.subject}
              <X size={11} />
            </button>
          )}

          {filters.chapter !==
            "All" && (
            <button
              type="button"
              onClick={() =>
                clearFilter(
                  "chapter"
                )
              }
            >
              Chapter:{" "}
              {filters.chapter}
              <X size={11} />
            </button>
          )}

          {filters.testCategory !==
            "All" && (
            <button
              type="button"
              onClick={() =>
                clearFilter(
                  "testCategory"
                )
              }
            >
              Test:{" "}
              {filters.testCategory}
              <X size={11} />
            </button>
          )}

          {filters.examType !==
            "All" && (
            <button
              type="button"
              onClick={() =>
                clearFilter(
                  "examType"
                )
              }
            >
              Exam:{" "}
              {filters.examType}
              <X size={11} />
            </button>
          )}

          {filters.academicYear !==
            "All" && (
            <button
              type="button"
              onClick={() =>
                clearFilter(
                  "academicYear"
                )
              }
            >
              Year:{" "}
              {filters.academicYear}
              <X size={11} />
            </button>
          )}

          {filters.status !==
            "All" && (
            <button
              type="button"
              onClick={() =>
                clearFilter(
                  "status"
                )
              }
            >
              Status:{" "}
              {filters.status}
              <X size={11} />
            </button>
          )}

          {filters.aiStatus !==
            "All" && (
            <button
              type="button"
              onClick={() =>
                clearFilter(
                  "aiStatus"
                )
              }
            >
              AI:{" "}
              {filters.aiStatus}
              <X size={11} />
            </button>
          )}

          {filters.testId !==
            "All" && (
            <button
              type="button"
              onClick={() =>
                clearFilter(
                  "testId"
                )
              }
            >
              Test ID:{" "}
              {filters.testId}
              <X size={11} />
            </button>
          )}
        </div>
      )}

      {/* ======================================================
          FILTER INFO
      ====================================================== */}

      <div className="question-filter-info">
        <CircleDot size={12} />

        <span>
          Filters update the question
          library automatically.
        </span>
      </div>
    </div>
  );
}