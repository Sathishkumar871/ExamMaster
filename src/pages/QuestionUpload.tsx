import {
  FormEvent,
  useState,
} from "react";

import "./QuestionUpload.css";

interface QuestionForm {
  question: string;
  options: string[];
  correctAnswer: string;
  testType: "daily" | "mock";
  subject: string;
  chapter: string;
}

const API_URL =
  "http://localhost:5000/api/questions";

export default function QuestionUpload() {

  const [form, setForm] =
    useState<QuestionForm>({
      question: "",

      options: [
        "",
        "",
        "",
        "",
      ],

      correctAnswer: "",

      testType: "daily",

      subject: "",

      chapter: "",
    });

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");


  // ==================================================
  // QUESTION
  // ==================================================

  const handleQuestionChange = (
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      question: value,
    }));
  };


  // ==================================================
  // OPTION
  // ==================================================

  const handleOptionChange = (
    index: number,
    value: string
  ) => {

    setForm((prev) => {

      const updatedOptions = [
        ...prev.options,
      ];

      updatedOptions[index] = value;

      return {
        ...prev,
        options: updatedOptions,
      };
    });
  };


  // ==================================================
  // TEST TYPE
  // ==================================================

  const handleTestTypeChange = (
    type: "daily" | "mock"
  ) => {

    setForm((prev) => ({
      ...prev,
      testType: type,
    }));
  };


  // ==================================================
  // SUBMIT
  // ==================================================

  const handleSubmit = async (
    e: FormEvent
  ) => {

    e.preventDefault();

    setMessage("");

    // ----------------------------------------------
    // VALIDATION
    // ----------------------------------------------

    if (!form.question.trim()) {
      setMessage(
        "Please enter question"
      );
      return;
    }

    if (
      form.options.some(
        (option) =>
          !option.trim()
      )
    ) {
      setMessage(
        "Please enter all 4 options"
      );
      return;
    }

    if (!form.correctAnswer) {
      setMessage(
        "Please select correct answer"
      );
      return;
    }

    try {

      setLoading(true);

      const response =
        await fetch(API_URL, {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(form),
        });


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to save"
        );
      }


      setMessage(
        form.testType === "daily"
          ? "✅ Daily Test question added successfully"
          : "✅ Mock Test question added successfully"
      );


      // ------------------------------------------
      // RESET QUESTION
      // ------------------------------------------

      setForm((prev) => ({
        ...prev,

        question: "",

        options: [
          "",
          "",
          "",
          "",
        ],

        correctAnswer: "",
      }));

    } catch (error) {

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );

    } finally {

      setLoading(false);

    }
  };


  return (
    <div className="upload-page">

      <div className="upload-card">

        <div className="upload-header">

          <span>
            EXAMMASTER
          </span>

          <h1>
            Add Question
          </h1>

          <p>
            Create Daily Test or Mock Test
            questions
          </p>

        </div>


        <form
          onSubmit={handleSubmit}
        >

          {/* =====================================
              TEST TYPE
          ===================================== */}

          <div className="form-group">

            <label>
              Test Type
            </label>

            <div className="test-type-buttons">

              <button
                type="button"
                className={
                  form.testType === "daily"
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  handleTestTypeChange(
                    "daily"
                  )
                }
              >
                📅 Daily Test
              </button>


              <button
                type="button"
                className={
                  form.testType === "mock"
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  handleTestTypeChange(
                    "mock"
                  )
                }
              >
                🎯 Mock Test
              </button>

            </div>

          </div>


          {/* =====================================
              QUESTION
          ===================================== */}

          <div className="form-group">

            <label>
              Question
            </label>

            <textarea
              value={form.question}
              onChange={(e) =>
                handleQuestionChange(
                  e.target.value
                )
              }
              placeholder="Enter question..."
              rows={5}
            />

          </div>


          {/* =====================================
              OPTIONS
          ===================================== */}

          <div className="form-group">

            <label>
              Options
            </label>

            <div className="options-input">

              {form.options.map(
                (option, index) => (

                  <input
                    key={index}
                    value={option}
                    onChange={(e) =>
                      handleOptionChange(
                        index,
                        e.target.value
                      )
                    }
                    placeholder={`Option ${
                      String.fromCharCode(
                        65 + index
                      )
                    }`}
                  />

                )
              )}

            </div>

          </div>


          {/* =====================================
              CORRECT ANSWER
          ===================================== */}

          <div className="form-group">

            <label>
              Correct Answer
            </label>

            <select
              value={
                form.correctAnswer
              }
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  correctAnswer:
                    e.target.value,
                }))
              }
            >

              <option value="">
                Select correct option
              </option>

              {form.options.map(
                (option, index) => (

                  option.trim() && (
                    <option
                      key={index}
                      value={option}
                    >
                      {String.fromCharCode(
                        65 + index
                      )}{" "}
                      - {option}
                    </option>
                  )

                )
              )}

            </select>

          </div>


          {/* =====================================
              SUBJECT
          ===================================== */}

          <div className="form-row">

            <div className="form-group">

              <label>
                Subject
              </label>

              <input
                value={form.subject}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    subject:
                      e.target.value,
                  }))
                }
                placeholder="Biology"
              />

            </div>


            <div className="form-group">

              <label>
                Chapter
              </label>

              <input
                value={form.chapter}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    chapter:
                      e.target.value,
                  }))
                }
                placeholder="Cell"
              />

            </div>

          </div>


          {/* =====================================
              MESSAGE
          ===================================== */}

          {message && (

            <div className="form-message">

              {message}

            </div>

          )}


          {/* =====================================
              SAVE
          ===================================== */}

          <button
            type="submit"
            className="save-button"
            disabled={loading}
          >

            {loading
              ? "Saving..."
              : form.testType === "daily"
              ? "Add to Daily Test"
              : "Add to Mock Test"}

          </button>

        </form>

      </div>

    </div>
  );
}