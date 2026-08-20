import "./QuestionCard.css";

interface Props {
  question: any;

  questionNumber: number;

  totalQuestions: number;

  selectedAnswer: string;

  onSelectAnswer: (answer: string) => void;

  onPrevious: () => void;

  onNext: () => void;

  isFirst: boolean;

  isLast: boolean;
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  onPrevious,
  onNext,
  isFirst,
  isLast,
}: Props) {
  // ============================================================
  // SAFETY
  // ============================================================

  if (!question) {
    return (
      <div className="question-card">
        <div className="question-body">
          <h3>Question not available.</h3>
        </div>
      </div>
    );
  }

  const options = Array.isArray(question.options)
    ? question.options
    : [];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="question-card">

      {/* ======================================================
          QUESTION HEADER
      ====================================================== */}

      <div className="question-top">
        <h2>
          Question {questionNumber} / {totalQuestions}
        </h2>
      </div>

      {/* ======================================================
          QUESTION BODY
      ====================================================== */}

      <div className="question-body">

        <h3>
          {question.question}
        </h3>

        {/* ====================================================
            OPTIONS
        ==================================================== */}

        <div className="options">

          {options.map(
            (option: string, index: number) => {

              const isSelected =
                selectedAnswer === option;

              return (
                <label
                  key={`${question.questionId || question._id || "question"}-${index}`}
                  className={
                    isSelected
                      ? "option selected"
                      : "option"
                  }
                >

                  {/* RADIO */}

                  <input
                    type="radio"
                    name={`question-${question.questionId || question._id}`}
                    value={option}
                    checked={isSelected}
                    onChange={() =>
                      onSelectAnswer(option)
                    }
                  />

                  {/* OPTION LETTER */}

                  <span className="option-letter">
                    {String.fromCharCode(65 + index)}
                  </span>

                  {/* OPTION TEXT */}

                  <span className="option-text">
                    {option}
                  </span>

                </label>
              );
            }
          )}

        </div>
      </div>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className="question-footer">

        {/* PREVIOUS */}

        <button
          type="button"
          className="prev-btn"
          disabled={isFirst}
          onClick={onPrevious}
        >
          ← Previous
        </button>

        {/* NEXT / FINISH */}

        <button
          type="button"
          className="next-btn"
          onClick={onNext}
        >
          {isLast ? "Finish" : "Next →"}
        </button>

      </div>

    </div>
  );
}