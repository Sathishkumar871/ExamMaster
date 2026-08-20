import "./QuestionPalette.css";

interface Props {
  totalQuestions: number;

  currentQuestion: number;

  answers: Record<number, string>;

  onSelectQuestion: (index: number) => void;
}

export default function QuestionPalette({
  totalQuestions,
  currentQuestion,
  answers,
  onSelectQuestion,
}: Props) {
  // ============================================================
  // ANSWERED COUNT
  // ============================================================

  const answeredCount = Object.keys(answers).length;

  const remainingCount =
    Math.max(0, totalQuestions - answeredCount);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="palette">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="palette-header">
        <h3>Questions</h3>

        <span className="palette-count">
          {answeredCount}/{totalQuestions}
        </span>
      </div>

      {/* ======================================================
          QUESTION GRID
      ====================================================== */}

      <div className="palette-grid">

        {Array.from({
          length: totalQuestions,
        }).map((_, index) => {

          const isCurrent =
            currentQuestion === index;

          const isAnswered =
            Boolean(answers[index]);

          let buttonClass =
            "palette-btn";

          if (isCurrent) {
            buttonClass += " active";
          } else if (isAnswered) {
            buttonClass += " answered";
          }

          return (
            <button
              type="button"
              key={index}
              className={buttonClass}
              onClick={() =>
                onSelectQuestion(index)
              }
              aria-label={`Question ${index + 1}${
                isAnswered
                  ? " answered"
                  : " not answered"
              }`}
            >
              {index + 1}
            </button>
          );
        })}

      </div>

      {/* ======================================================
          LEGEND
      ====================================================== */}

      <div className="palette-legend">

        <div className="legend-item">
          <span className="legend-dot answered-dot" />
          <span>Answered</span>
        </div>

        <div className="legend-item">
          <span className="legend-dot remaining-dot" />
          <span>Not Answered</span>
        </div>

        <div className="legend-item">
          <span className="legend-dot current-dot" />
          <span>Current</span>
        </div>

      </div>

      {/* ======================================================
          INFO
      ====================================================== */}

      <div className="palette-info">

        <p>
          <strong>Answered</strong>
          <span>{answeredCount}</span>
        </p>

        <p>
          <strong>Remaining</strong>
          <span>{remainingCount}</span>
        </p>

      </div>

    </div>
  );
}