import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

interface Props {
  open: boolean;
  onClose: () => void;
  refresh: () => void;
}

interface Question {
  _id: string;
  questionNumber: number;
  question: string;
  options: string[];
  correctAnswer: string;
  ansNumber: string;
  questionType: string;
  chapter: string;
  subject: string;
  status?: string;
  isPublished?: boolean;
}

const API = "http://localhost:5000/api";

const SUBJECTS = [
  "Physics",
  "Chemistry",
  "Biology (Botany)",
  "Biology (Zoology)",
  "Mathematics",
];

const TEST_TYPES = [
  {
    value: "daily",
    label: "Daily Test",
    icon: "📅",
  },
  {
    value: "weekly",
    label: "Weekly Test",
    icon: "📆",
  },
  {
    value: "mock",
    label: "Mock Test",
    icon: "📝",
  },
];

const CreateExamModal: React.FC<Props> = ({
  open,
  onClose,
  refresh,
}) => {
  const [loading, setLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  // ==============================
  // EXAM DETAILS
  // ==============================

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");

  const [duration, setDuration] = useState(180);
  const [totalQuestions, setTotalQuestions] = useState(10);

  const [testType, setTestType] = useState<
    "daily" | "weekly" | "mock"
  >("daily");

  // ==============================
  // QUESTIONS
  // ==============================

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<
    string[]
  >([]);

  // ==============================
  // TOKEN
  // ==============================

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("headToken") ||
      localStorage.getItem("staffToken") ||
      localStorage.getItem("teacherToken") ||
      ""
    );
  };

  // ==============================
  // LOAD QUESTIONS
  // ==============================

  const loadQuestions = async () => {
    try {
      setQuestionsLoading(true);

      const token = getToken();

      if (!token) {
        console.log("No authentication token found");
        return;
      }

      const res = await axios.get(
        `${API}/questions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.success && Array.isArray(res.data.questions)) {
        setQuestions(res.data.questions);
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.log("Question loading error:", error);
      setQuestions([]);
    } finally {
      setQuestionsLoading(false);
    }
  };

  // ==============================
  // LOAD WHEN MODAL OPENS
  // ==============================

  useEffect(() => {
    if (open) {
      loadQuestions();
    }
  }, [open]);

  // ==============================
  // RESET
  // ==============================

  const resetForm = () => {
    setTitle("");
    setSubject("");
    setChapter("");
    setDuration(180);
    setTotalQuestions(10);
    setTestType("daily");
    setSelectedQuestionIds([]);
  };

  // ==============================
  // SUBJECT CHANGE
  // ==============================

  const handleSubjectChange = (
    value: string
  ) => {
    setSubject(value);
    setChapter("");
    setSelectedQuestionIds([]);
  };

  // ==============================
  // AVAILABLE SUBJECT QUESTIONS
  // ==============================

  const subjectQuestions = useMemo(() => {
    if (!subject) {
      return [];
    }

    return questions.filter(
      (q) =>
        q.subject?.trim().toLowerCase() ===
        subject.trim().toLowerCase()
    );
  }, [questions, subject]);

  // ==============================
  // CHAPTER LIST
  // ==============================

  const chapters = useMemo(() => {
    const unique = new Set<string>();

    subjectQuestions.forEach((q) => {
      if (q.chapter?.trim()) {
        unique.add(q.chapter.trim());
      }
    });

    return Array.from(unique).sort();
  }, [subjectQuestions]);

  // ==============================
  // CHAPTER QUESTIONS
  // ==============================

  const chapterQuestions = useMemo(() => {
    if (!chapter) {
      return subjectQuestions;
    }

    return subjectQuestions.filter(
      (q) =>
        q.chapter?.trim().toLowerCase() ===
        chapter.trim().toLowerCase()
    );
  }, [subjectQuestions, chapter]);

  // ==============================
  // AVAILABLE COUNT
  // ==============================

  const availableCount =
    chapterQuestions.length;

  // ==============================
  // SELECT QUESTION
  // ==============================

  const toggleQuestion = (
    questionId: string
  ) => {
    setSelectedQuestionIds((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter(
          (id) => id !== questionId
        );
      }

      if (prev.length >= totalQuestions) {
        alert(
          `You can select only ${totalQuestions} questions.`
        );

        return prev;
      }

      return [...prev, questionId];
    });
  };

  // ==============================
  // AUTO SELECT QUESTIONS
  // ==============================

  const autoSelectQuestions = () => {
    if (chapterQuestions.length === 0) {
      alert("No questions available.");
      return;
    }

    const count = Math.min(
      totalQuestions,
      chapterQuestions.length
    );

    const shuffled = [...chapterQuestions]
      .sort(() => Math.random() - 0.5)
      .slice(0, count);

    setSelectedQuestionIds(
      shuffled.map((q) => q._id)
    );
  };

  // ==============================
  // CLEAR QUESTIONS
  // ==============================

  const clearSelectedQuestions = () => {
    setSelectedQuestionIds([]);
  };

  // ==============================
  // TOTAL QUESTIONS CHANGE
  // ==============================

  const handleTotalQuestionsChange = (
    value: number
  ) => {
    const safeValue = Math.max(1, value);

    setTotalQuestions(safeValue);

    setSelectedQuestionIds((prev) =>
      prev.slice(0, safeValue)
    );
  };

  // ==============================
  // CREATE EXAM
  // ==============================

  const createExam = async () => {
    if (!title.trim()) {
      alert("Please enter exam title.");
      return;
    }

    if (!subject) {
      alert("Please select subject.");
      return;
    }

    if (!chapter) {
      alert("Please select chapter/topic.");
      return;
    }

    if (availableCount === 0) {
      alert(
        "No questions available for this topic."
      );
      return;
    }

    if (totalQuestions > availableCount) {
      alert(
        `Only ${availableCount} questions are available in this topic.`
      );
      return;
    }

    if (
      selectedQuestionIds.length !==
      totalQuestions
    ) {
      alert(
        `Please select exactly ${totalQuestions} questions.`
      );
      return;
    }

    try {
      setLoading(true);

      const token = getToken();

      await axios.post(
        `${API}/exam/create`,
        {
          title: title.trim(),

          subject,

          chapter,

          duration,

          totalQuestions,

          testType,

          questionIds:
            selectedQuestionIds,

          status: "draft",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        "✅ Exam created successfully as Draft."
      );

      resetForm();

      refresh();

      onClose();
    } catch (error: any) {
      console.log(
        "Exam creation error:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Exam creation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // CLOSE
  // ==============================

  const handleClose = () => {
    if (loading) return;

    resetForm();
    onClose();
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl">

        {/* ==============================
            HEADER
        ============================== */}

        <div className="flex justify-between items-center p-6 border-b">

          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Create Exam
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Select subject, topic and questions
            </p>
          </div>

          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-red-500 text-2xl"
          >
            ✕
          </button>

        </div>

        <div className="p-6">

          {/* ==============================
              TEST TYPE
          ============================== */}

          <div className="mb-6">

            <label className="block font-semibold mb-3">
              Test Type
            </label>

            <div className="grid grid-cols-3 gap-3">

              {TEST_TYPES.map((type) => (

                <button
                  key={type.value}
                  type="button"
                  onClick={() =>
                    setTestType(
                      type.value as
                        | "daily"
                        | "weekly"
                        | "mock"
                    )
                  }
                  className={`p-4 rounded-xl border-2 text-center transition ${
                    testType === type.value
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >

                  <div className="text-2xl">
                    {type.icon}
                  </div>

                  <div className="font-semibold mt-1">
                    {type.label}
                  </div>

                </button>

              ))}

            </div>

          </div>

          {/* ==============================
              BASIC DETAILS
          ============================== */}

          <div className="grid md:grid-cols-2 gap-4 mb-6">

            <div>
              <label className="block font-medium mb-2">
                Exam Title
              </label>

              <input
                type="text"
                placeholder="Example: Physics Daily Test - 01"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                className="w-full border rounded-lg p-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">
                Subject
              </label>

              <select
                value={subject}
                onChange={(e) =>
                  handleSubjectChange(
                    e.target.value
                  )
                }
                className="w-full border rounded-lg p-3"
              >

                <option value="">
                  Select Subject
                </option>

                {SUBJECTS.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}

              </select>

            </div>

          </div>

          {/* ==============================
              CHAPTER
          ============================== */}

          <div className="grid md:grid-cols-3 gap-4 mb-6">

            <div>
              <label className="block font-medium mb-2">
                Topic / Chapter
              </label>

              <select
                value={chapter}
                onChange={(e) => {
                  setChapter(e.target.value);
                  setSelectedQuestionIds([]);
                }}
                disabled={!subject}
                className="w-full border rounded-lg p-3"
              >

                <option value="">
                  Select Topic
                </option>

                {chapters.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}

              </select>

            </div>

            <div>
              <label className="block font-medium mb-2">
                Duration (Minutes)
              </label>

              <input
                type="number"
                min={1}
                value={duration}
                onChange={(e) =>
                  setDuration(
                    Number(e.target.value)
                  )
                }
                className="w-full border rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">
                Questions Required
              </label>

              <input
                type="number"
                min={1}
                max={availableCount || undefined}
                value={totalQuestions}
                onChange={(e) =>
                  handleTotalQuestionsChange(
                    Number(e.target.value)
                  )
                }
                className="w-full border rounded-lg p-3"
              />
            </div>

          </div>

          {/* ==============================
              AVAILABLE QUESTION COUNT
          ============================== */}

          {subject && (

            <div className="grid grid-cols-3 gap-4 mb-6">

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-600">
                  Subject Questions
                </p>

                <p className="text-2xl font-bold text-blue-700">
                  {subjectQuestions.length}
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <p className="text-sm text-purple-600">
                  Topic Questions
                </p>

                <p className="text-2xl font-bold text-purple-700">
                  {availableCount}
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-600">
                  Selected
                </p>

                <p className="text-2xl font-bold text-green-700">
                  {selectedQuestionIds.length}
                  {" / "}
                  {totalQuestions}
                </p>
              </div>

            </div>

          )}

          {/* ==============================
              QUESTION CONTROLS
          ============================== */}

          {chapter && (

            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">

              <div>
                <h3 className="font-bold text-lg">
                  Select Questions
                </h3>

                <p className="text-sm text-gray-500">
                  {chapter} — {availableCount} questions available
                </p>
              </div>

              <div className="flex gap-2">

                <button
                  type="button"
                  onClick={autoSelectQuestions}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  ⚡ Auto Select
                </button>

                <button
                  type="button"
                  onClick={clearSelectedQuestions}
                  className="border px-4 py-2 rounded-lg"
                >
                  Clear
                </button>

              </div>

            </div>

          )}

          {/* ==============================
              QUESTIONS LIST
          ============================== */}

          {questionsLoading ? (

            <div className="text-center py-10">
              Loading questions...
            </div>

          ) : chapter && chapterQuestions.length > 0 ? (

            <div className="border rounded-xl overflow-hidden">

              <div className="max-h-[350px] overflow-y-auto">

                {chapterQuestions.map(
                  (question, index) => {

                    const selected =
                      selectedQuestionIds.includes(
                        question._id
                      );

                    return (

                      <div
                        key={question._id}
                        onClick={() =>
                          toggleQuestion(
                            question._id
                          )
                        }
                        className={`p-4 border-b cursor-pointer transition ${
                          selected
                            ? "bg-blue-50 border-blue-300"
                            : "hover:bg-gray-50"
                        }`}
                      >

                        <div className="flex gap-3">

                          <div>

                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() =>
                                toggleQuestion(
                                  question._id
                                )
                              }
                              onClick={(e) =>
                                e.stopPropagation()
                              }
                              className="w-5 h-5 mt-1"
                            />

                          </div>

                          <div className="flex-1">

                            <div className="text-xs text-gray-500 mb-1">
                              Question{" "}
                              {question.questionNumber ||
                                index + 1}
                            </div>

                            <p className="font-medium text-gray-800">
                              {question.question}
                            </p>

                            <div className="grid md:grid-cols-2 gap-2 mt-3 text-sm">

                              {question.options?.map(
                                (
                                  option,
                                  optionIndex
                                ) => (

                                  <div
                                    key={optionIndex}
                                    className="text-gray-600"
                                  >
                                    ({optionIndex + 1}){" "}
                                    {option}
                                  </div>

                                )
                              )}

                            </div>

                          </div>

                        </div>

                      </div>

                    );
                  }
                )}

              </div>

            </div>

          ) : chapter ? (

            <div className="border rounded-xl p-10 text-center text-gray-500">
              No questions found for this topic.
            </div>

          ) : (

            <div className="border rounded-xl p-10 text-center text-gray-500">
              Select subject and topic to view questions.
            </div>

          )}

          {/* ==============================
              SUMMARY
          ============================== */}

          <div className="mt-6 bg-gray-50 rounded-xl p-5">

            <h3 className="font-bold mb-3">
              Exam Summary
            </h3>

            <div className="grid md:grid-cols-4 gap-4 text-sm">

              <div>
                <span className="text-gray-500">
                  Type
                </span>

                <p className="font-semibold">
                  {
                    TEST_TYPES.find(
                      (x) =>
                        x.value === testType
                    )?.label
                  }
                </p>
              </div>

              <div>
                <span className="text-gray-500">
                  Subject
                </span>

                <p className="font-semibold">
                  {subject || "-"}
                </p>
              </div>

              <div>
                <span className="text-gray-500">
                  Topic
                </span>

                <p className="font-semibold">
                  {chapter || "-"}
                </p>
              </div>

              <div>
                <span className="text-gray-500">
                  Questions
                </span>

                <p className="font-semibold">
                  {selectedQuestionIds.length} /{" "}
                  {totalQuestions}
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* ==============================
            FOOTER
        ============================== */}

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">

          <button
            onClick={handleClose}
            disabled={loading}
            className="border rounded-lg px-5 py-2"
          >
            Cancel
          </button>

          <button
            onClick={createExam}
            disabled={
              loading ||
              !title.trim() ||
              !subject ||
              !chapter ||
              selectedQuestionIds.length !==
                totalQuestions
            }
            className="bg-green-600 disabled:bg-gray-400 text-white rounded-lg px-6 py-2 font-semibold"
          >
            {loading
              ? "Creating..."
              : "✅ Create Exam"}
          </button>

        </div>

      </div>

    </div>
  );
};

export default CreateExamModal;