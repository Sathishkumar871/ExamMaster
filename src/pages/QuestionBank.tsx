import React, { useEffect, useState } from "react";

interface Question {
  _id?: string;
  questionNumber: number;
  question: string;
  questionImage?: string;
  options: string[];
  correctAnswer: string;
  subject: string;
  chapter: string;
  examType: string;
  testCategory: string;
  className: string;
  testTitle: string;
  testId: string;
  marksPerQuestion: number;
  negativeMarks: number;
  durationMinutes: number;
  isPublished: boolean;
}

const API_BASE_URL = "http://localhost:5000/api";

export default function QuestionBank() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [showAddForm, setShowAddForm] =
    useState<boolean>(false);

  const [showPdfModal, setShowPdfModal] =
    useState<boolean>(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  // ============================================================
  // FILTERS
  // ============================================================

  const [activeTab, setActiveTab] =
    useState<string>("ALL");

  const [selectedExam, setSelectedExam] =
    useState<string>("ALL");

  const [selectedSubject, setSelectedSubject] =
    useState<string>("ALL");

  const [selectedClassName, setSelectedClassName] =
    useState<string>("ALL");

  const [searchTerm, setSearchTerm] =
    useState<string>("");

  // ============================================================
  // PDF STATE
  // ============================================================

  const [pdfFile, setPdfFile] =
    useState<File | null>(null);

  const [pdfClassName, setPdfClassName] =
    useState<string>("2nd PUC");

  const [pdfExamType, setPdfExamType] =
    useState<string>("JEE");

  const [pdfTestCategory, setPdfTestCategory] =
    useState<string>("mock");

  const [parsing, setParsing] =
    useState<boolean>(false);

  // ============================================================
  // FORM DATA
  // ============================================================

  const [formData, setFormData] =
    useState<Question>({
      questionNumber: 1,
      question: "",
      questionImage: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      subject: "Physics",
      chapter: "",
      examType: "JEE",
      testCategory: "mock",
      className: "2nd PUC",
      testTitle: "JEE Mains Full Mock Test 1",
      testId: "JEE-MOCK-01",
      marksPerQuestion: 4,
      negativeMarks: 1,
      durationMinutes: 180,
      isPublished: false,
    });

  // ============================================================
  // TOKEN
  // ============================================================

  const getToken = () => {
    return (
      localStorage.getItem("studentToken") ||
      localStorage.getItem("token") ||
      ""
    );
  };

  // ============================================================
  // FETCH QUESTIONS
  // ============================================================

  const fetchQuestions = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/questions`
      );

      if (!response.ok) {
        throw new Error(
          `HTTP Error: ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        "QUESTIONS RESPONSE:",
        data
      );

      if (data.success) {
        setQuestions(
          data.questions || []
        );
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error(
        "QUESTION FETCH ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // ============================================================
  // OPTION CHANGE
  // ============================================================

  const handleOptionChange = (
    index: number,
    value: string
  ) => {
    const newOptions = [
      ...formData.options,
    ];

    newOptions[index] = value;

    setFormData({
      ...formData,
      options: newOptions,
    });
  };

  // ============================================================
  // ADD / UPDATE QUESTION
  // ============================================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const token = getToken();

    try {
      let url =
        `${API_BASE_URL}/questions`;

      let method = "POST";

      if (editingId) {
        url =
          `${API_BASE_URL}/questions/${editingId}`;

        method = "PUT";
      }

      const response = await fetch(
        url,
        {
          method,

          headers: {
            "Content-Type":
              "application/json",

            ...(token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : {}),
          },

          body:
            JSON.stringify(formData),
        }
      );

      const result =
        await response.json();

      console.log(
        "QUESTION SAVE RESPONSE:",
        result
      );

      if (response.ok) {
        alert(
          editingId
            ? "Question updated successfully!"
            : "Question added successfully as Draft!"
        );

        resetForm();

        await fetchQuestions();
      } else {
        alert(
          result.message ||
            result.error ||
            "Operation failed"
        );
      }
    } catch (error) {
      console.error(
        "QUESTION SAVE ERROR:",
        error
      );

      alert(
        "Network or server error occurred."
      );
    }
  };

  // ============================================================
  // EDIT
  // ============================================================

  const handleEdit = (
    q: Question
  ) => {
    setEditingId(
      q._id || null
    );

    setFormData({
      questionNumber:
        q.questionNumber || 1,

      question:
        q.question || "",

      questionImage:
        q.questionImage || "",

      options:
        q.options?.length === 4
          ? q.options
          : ["", "", "", ""],

      correctAnswer:
        q.correctAnswer || "",

      subject:
        q.subject || "Physics",

      chapter:
        q.chapter || "",

      examType:
        q.examType || "JEE",

      testCategory:
        q.testCategory || "mock",

      className:
        q.className || "2nd PUC",

      testTitle:
        q.testTitle || "",

      testId:
        q.testId || "",

      marksPerQuestion:
        q.marksPerQuestion || 4,

      negativeMarks:
        q.negativeMarks || 1,

      durationMinutes:
        q.durationMinutes || 180,

      isPublished:
        q.isPublished ?? false,
    });

    setShowAddForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (
    id?: string
  ) => {
    if (!id) return;

    if (
      !window.confirm(
        "Are you sure you want to delete this question?"
      )
    ) {
      return;
    }

    try {
      const token = getToken();

      const response =
        await fetch(
          `${API_BASE_URL}/questions/${id}`,
          {
            method: "DELETE",

            headers: {
              ...(token
                ? {
                    Authorization:
                      `Bearer ${token}`,
                  }
                : {}),
            },
          }
        );

      const result =
        await response.json();

      if (response.ok) {
        alert(
          result.message ||
            "Question deleted successfully!"
        );

        await fetchQuestions();
      } else {
        alert(
          result.message ||
            "Failed to delete question"
        );
      }
    } catch (error) {
      console.error(
        "DELETE ERROR:",
        error
      );
    }
  };

  // ============================================================
  // PUBLISH ALL
  // ============================================================

  const handlePublishAll = async () => {
    if (
      !window.confirm(
        "Are you sure you want to publish ALL questions?"
      )
    ) {
      return;
    }

    try {
      const token = getToken();

      const response =
        await fetch(
          `${API_BASE_URL}/questions/publish-all`,
          {
            method: "PUT",

            headers: {
              ...(token
                ? {
                    Authorization:
                      `Bearer ${token}`,
                  }
                : {}),
            },
          }
        );

      const result =
        await response.json();

      if (response.ok) {
        alert(
          result.message ||
            "All questions published successfully!"
        );

        await fetchQuestions();
      } else {
        alert(
          result.message ||
            "Failed to publish questions"
        );
      }
    } catch (error) {
      console.error(
        "PUBLISH ALL ERROR:",
        error
      );
    }
  };

  // ============================================================
  // DELETE ALL
  // ============================================================

  const handleDeleteAll = async () => {
    if (
      !window.confirm(
        "⚠️ WARNING: This will delete ALL questions permanently! Are you sure?"
      )
    ) {
      return;
    }

    try {
      const token = getToken();

      const response =
        await fetch(
          `${API_BASE_URL}/questions/delete-all`,
          {
            method: "DELETE",

            headers: {
              ...(token
                ? {
                    Authorization:
                      `Bearer ${token}`,
                  }
                : {}),
            },
          }
        );

      const result =
        await response.json();

      if (response.ok) {
        alert(
          result.message ||
            "All questions deleted successfully!"
        );

        await fetchQuestions();
      } else {
        alert(
          result.message ||
            "Failed to delete questions"
        );
      }
    } catch (error) {
      console.error(
        "DELETE ALL ERROR:",
        error
      );
    }
  };

  // ============================================================
  // PDF SUBMIT - FIXED
  // ============================================================

  const handlePdfSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!pdfFile) {
      alert(
        "Please select a PDF file first!"
      );
      return;
    }

    setParsing(true);

    try {
      const token = getToken();

      const data = new FormData();

      // IMPORTANT:
      // Backend:
      // upload.single("pdfFile")
      data.append(
        "pdfFile",
        pdfFile
      );

      data.append(
        "academicYear",
        pdfClassName
      );

      data.append(
        "className",
        pdfClassName
      );

      data.append(
        "examType",
        pdfExamType
      );

      data.append(
        "testCategory",
        pdfTestCategory
      );

      console.log(
        "================================"
      );

      console.log(
        "PDF UPLOAD STARTED"
      );

      console.log(
        "File:",
        pdfFile.name
      );

      console.log(
        "Class:",
        pdfClassName
      );

      console.log(
        "Exam Type:",
        pdfExamType
      );

      console.log(
        "Test Category:",
        pdfTestCategory
      );

      console.log(
        "================================"
      );

      // IMPORTANT:
      // Backend route:
      // router.post(
      //   "/parse-pdf",
      //   upload.single("pdfFile"),
      //   ...
      // )

      const response =
        await fetch(
          `${API_BASE_URL}/questions/parse-pdf`,
          {
            method: "POST",

            headers: {
              ...(token
                ? {
                    Authorization:
                      `Bearer ${token}`,
                  }
                : {}),
            },

            body: data,
          }
        );

      const result =
        await response.json();

      console.log(
        "PDF PARSE RESPONSE:",
        result
      );

      if (response.ok) {
        const count =
          result.parsedQuestions ??
          result.count ??
          result.questions?.length ??
          0;

        alert(
          `PDF processed successfully!\n\n` +
            `Questions Parsed: ${count}\n` +
            `Exam Type: ${
              result.examType ||
              pdfExamType
            }\n` +
            `Class: ${
              result.academicYear ||
              pdfClassName
            }\n` +
            `Test Type: ${pdfTestCategory}`
        );

        setShowPdfModal(
          false
        );

        setPdfFile(null);

        await fetchQuestions();
      } else {
        console.error(
          "PDF PARSE ERROR:",
          result
        );

        alert(
          result.message ||
            result.error ||
            "Failed to parse PDF"
        );
      }
    } catch (error) {
      console.error(
        "PDF PARSE ERROR:",
        error
      );

      alert(
        "PDF upload failed. Please check whether backend server is running."
      );
    } finally {
      setParsing(false);
    }
  };

  // ============================================================
  // RESET FORM
  // ============================================================

  const resetForm = () => {
    setEditingId(null);

    setShowAddForm(false);

    setFormData({
      questionNumber: 1,
      question: "",
      questionImage: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      subject: "Physics",
      chapter: "",
      examType: "JEE",
      testCategory: "mock",
      className: "2nd PUC",
      testTitle:
        "JEE Mains Full Mock Test 1",
      testId: "JEE-MOCK-01",
      marksPerQuestion: 4,
      negativeMarks: 1,
      durationMinutes: 180,
      isPublished: false,
    });
  };

  // ============================================================
  // FILTER
  // ============================================================

  const filteredQuestions =
    questions.filter((q) => {
      const matchesTab =
        activeTab === "ALL" ||
        q.testCategory ===
          activeTab;

      const matchesExam =
        selectedExam === "ALL" ||
        q.examType ===
          selectedExam;

      const matchesSubject =
        selectedSubject === "ALL" ||
        q.subject ===
          selectedSubject;

      const matchesClass =
        selectedClassName ===
          "ALL" ||
        q.className ===
          selectedClassName;

      const search =
        searchTerm.toLowerCase();

      const matchesSearch =
        q.question
          ?.toLowerCase()
          .includes(search) ||
        q.chapter
          ?.toLowerCase()
          .includes(search) ||
        q.testTitle
          ?.toLowerCase()
          .includes(search);

      return (
        matchesTab &&
        matchesExam &&
        matchesSubject &&
        matchesClass &&
        matchesSearch
      );
    });

  // ============================================================
  // UI
  // ============================================================

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "1350px",
        margin: "0 auto",
        fontFamily:
          "Segoe UI, sans-serif",
        background:
          "#f8fafc",
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: "25px",
          background:
            "#ffffff",
          padding: "20px",
          borderRadius:
            "12px",
          boxShadow:
            "0 2px 4px rgba(0,0,0,0.05)",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              color:
                "#1e293b",
              fontSize:
                "24px",
            }}
          >
            🎯 Master Question Bank
            & PDF Parser
          </h1>

          <p
            style={{
              margin:
                "5px 0 0 0",
              color:
                "#64748b",
              fontSize:
                "14px",
            }}
          >
            Manage drafts, test
            categories and upload
            question paper PDFs.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={
              handlePublishAll
            }
            style={{
              background:
                "#16a34a",
              color: "#fff",
              padding:
                "10px 16px",
              border: "none",
              borderRadius:
                "8px",
              cursor:
                "pointer",
              fontWeight:
                "600",
            }}
          >
            🚀 Publish All
          </button>

          <button
            onClick={
              handleDeleteAll
            }
            style={{
              background:
                "#dc2626",
              color: "#fff",
              padding:
                "10px 16px",
              border: "none",
              borderRadius:
                "8px",
              cursor:
                "pointer",
              fontWeight:
                "600",
            }}
          >
            🗑️ Delete All
          </button>

          <button
            onClick={() =>
              setShowPdfModal(
                true
              )
            }
            style={{
              background:
                "#7c3aed",
              color: "#fff",
              padding:
                "10px 16px",
              border: "none",
              borderRadius:
                "8px",
              cursor:
                "pointer",
              fontWeight:
                "600",
            }}
          >
            📄 Upload PDF
          </button>

          <button
            onClick={() => {
              if (
                showAddForm
              ) {
                resetForm();
              } else {
                setShowAddForm(
                  true
                );
              }
            }}
            style={{
              background:
                "#2563eb",
              color: "#fff",
              padding:
                "10px 16px",
              border: "none",
              borderRadius:
                "8px",
              cursor:
                "pointer",
              fontWeight:
                "600",
            }}
          >
            {showAddForm
              ? "Close Form"
              : "+ Add Question"}
          </button>
        </div>
      </div>

      {/* TABS */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom:
            "20px",
          borderBottom:
            "2px solid #e2e8f0",
          paddingBottom:
            "10px",
          flexWrap: "wrap",
        }}
      >
        {[
          {
            key: "ALL",
            label: `All Questions (${questions.length})`,
          },
          {
            key: "mock",
            label: `Mock Tests (${
              questions.filter(
                (q) =>
                  q.testCategory ===
                  "mock"
              ).length
            })`,
          },
          {
            key: "daily",
            label: `Daily Tests (${
              questions.filter(
                (q) =>
                  q.testCategory ===
                  "daily"
              ).length
            })`,
          },
          {
            key: "subject",
            label: `Subject Tests (${
              questions.filter(
                (q) =>
                  q.testCategory ===
                  "subject"
              ).length
            })`,
          },
        ].map(
          (tab) => (
            <button
              key={
                tab.key
              }
              onClick={() =>
                setActiveTab(
                  tab.key
                )
              }
              style={{
                padding:
                  "10px 20px",
                borderRadius:
                  "8px",
                border:
                  "none",
                cursor:
                  "pointer",
                fontWeight:
                  "600",
                fontSize:
                  "14px",
                background:
                  activeTab ===
                  tab.key
                    ? "#2563eb"
                    : "#ffffff",
                color:
                  activeTab ===
                  tab.key
                    ? "#ffffff"
                    : "#64748b",
              }}
            >
              {tab.label}
            </button>
          )
        )}
      </div>

      {/* PDF MODAL */}

      {showPdfModal && (
        <div
          style={{
            position:
              "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height:
              "100%",
            background:
              "rgba(0,0,0,0.5)",
            display:
              "flex",
            justifyContent:
              "center",
            alignItems:
              "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background:
                "#fff",
              padding:
                "30px",
              borderRadius:
                "12px",
              width:
                "480px",
              maxWidth:
                "90%",
              boxShadow:
                "0 10px 25px rgba(0,0,0,0.1)",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                color:
                  "#1e293b",
              }}
            >
              📄 Upload Question
              Paper PDF
            </h3>

            <p
              style={{
                fontSize:
                  "13px",
                color:
                  "#64748b",
                marginBottom:
                  "15px",
              }}
            >
              Select Class, Exam Type
              and Test Type before
              uploading.
            </p>

            <form
              onSubmit={
                handlePdfSubmit
              }
            >
              <div
                style={{
                  marginBottom:
                    "12px",
                }}
              >
                <label
                  style={{
                    fontSize:
                      "12px",
                    fontWeight:
                      "700",
                    color:
                      "#475569",
                    display:
                      "block",
                    marginBottom:
                      "4px",
                  }}
                >
                  CLASS NAME
                </label>

                <select
                  value={
                    pdfClassName
                  }
                  onChange={(e) =>
                    setPdfClassName(
                      e.target.value
                    )
                  }
                  style={{
                    width:
                      "100%",
                    padding:
                      "9px",
                    borderRadius:
                      "6px",
                    border:
                      "1px solid #cbd5e1",
                  }}
                >
                  <option value="1st PUC">
                    1st PUC
                  </option>

                  <option value="2nd PUC">
                    2nd PUC
                  </option>
                </select>
              </div>

              <div
                style={{
                  marginBottom:
                    "12px",
                }}
              >
                <label
                  style={{
                    fontSize:
                      "12px",
                    fontWeight:
                      "700",
                    color:
                      "#475569",
                    display:
                      "block",
                    marginBottom:
                      "4px",
                  }}
                >
                  EXAM TYPE
                </label>

                <select
                  value={
                    pdfExamType
                  }
                  onChange={(e) =>
                    setPdfExamType(
                      e.target.value
                    )
                  }
                  style={{
                    width:
                      "100%",
                    padding:
                      "9px",
                    borderRadius:
                      "6px",
                    border:
                      "1px solid #cbd5e1",
                  }}
                >
                  <option value="JEE">
                    JEE Mains
                  </option>

                  <option value="NEET">
                    NEET UG
                  </option>
                </select>
              </div>

              <div
                style={{
                  marginBottom:
                    "12px",
                }}
              >
                <label
                  style={{
                    fontSize:
                      "12px",
                    fontWeight:
                      "700",
                    color:
                      "#475569",
                    display:
                      "block",
                    marginBottom:
                      "4px",
                  }}
                >
                  TEST TYPE
                </label>

                <select
                  value={
                    pdfTestCategory
                  }
                  onChange={(e) =>
                    setPdfTestCategory(
                      e.target.value
                    )
                  }
                  style={{
                    width:
                      "100%",
                    padding:
                      "9px",
                    borderRadius:
                      "6px",
                    border:
                      "1px solid #cbd5e1",
                  }}
                >
                  <option value="mock">
                    Mock Test
                  </option>

                  <option value="daily">
                    Daily Test
                  </option>

                  <option value="subject">
                    Subject Test
                  </option>
                </select>
              </div>

              <div
                style={{
                  marginBottom:
                    "15px",
                }}
              >
                <label
                  style={{
                    fontSize:
                      "12px",
                    fontWeight:
                      "700",
                    color:
                      "#475569",
                    display:
                      "block",
                    marginBottom:
                      "4px",
                  }}
                >
                  SELECT PDF FILE
                </label>

                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => {
                    const file =
                      e.target.files?.[0] ||
                      null;

                    setPdfFile(
                      file
                    );
                  }}
                  style={{
                    width:
                      "100%",
                    padding:
                      "8px",
                    border:
                      "1px dashed #cbd5e1",
                    borderRadius:
                      "6px",
                    boxSizing:
                      "border-box",
                  }}
                  required
                />

                {pdfFile && (
                  <p
                    style={{
                      fontSize:
                        "12px",
                      color:
                        "#475569",
                      marginTop:
                        "6px",
                    }}
                  >
                    Selected:{" "}
                    {
                      pdfFile.name
                    }
                  </p>
                )}
              </div>

              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "flex-end",
                  gap:
                    "10px",
                  marginTop:
                    "20px",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowPdfModal(
                      false
                    );
                    setPdfFile(
                      null
                    );
                  }}
                  disabled={
                    parsing
                  }
                  style={{
                    background:
                      "#e2e8f0",
                    border:
                      "none",
                    padding:
                      "8px 16px",
                    borderRadius:
                      "6px",
                    cursor:
                      "pointer",
                    fontWeight:
                      "600",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    parsing
                  }
                  style={{
                    background:
                      "#7c3aed",
                    color:
                      "#fff",
                    border:
                      "none",
                    padding:
                      "8px 16px",
                    borderRadius:
                      "6px",
                    cursor:
                      parsing
                        ? "not-allowed"
                        : "pointer",
                    fontWeight:
                      "600",
                    opacity:
                      parsing
                        ? 0.7
                        : 1,
                  }}
                >
                  {parsing
                    ? "Processing PDF..."
                    : "Extract & Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
            {/* ======================================================
          FILTERS
      ====================================================== */}

      <div
        style={{
          background: "#ffffff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow:
            "0 2px 4px rgba(0,0,0,0.05)",
          marginBottom: "25px",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px",
        }}
      >
        {/* CLASS */}

        <div>
          <label
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "#475569",
              display: "block",
              marginBottom: "5px",
            }}
          >
            CLASS NAME
          </label>

          <select
            value={selectedClassName}
            onChange={(e) =>
              setSelectedClassName(
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border:
                "1px solid #cbd5e1",
              background: "#f8fafc",
            }}
          >
            <option value="ALL">
              All Classes
            </option>

            <option value="1st PUC">
              1st PUC
            </option>

            <option value="2nd PUC">
              2nd PUC
            </option>
          </select>
        </div>

        {/* EXAM */}

        <div>
          <label
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "#475569",
              display: "block",
              marginBottom: "5px",
            }}
          >
            EXAM TYPE
          </label>

          <select
            value={selectedExam}
            onChange={(e) =>
              setSelectedExam(
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border:
                "1px solid #cbd5e1",
              background: "#f8fafc",
            }}
          >
            <option value="ALL">
              All Exams
            </option>

            <option value="JEE">
              JEE Mains
            </option>

            <option value="NEET">
              NEET UG
            </option>
          </select>
        </div>

        {/* SUBJECT */}

        <div>
          <label
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "#475569",
              display: "block",
              marginBottom: "5px",
            }}
          >
            SUBJECT
          </label>

          <select
            value={selectedSubject}
            onChange={(e) =>
              setSelectedSubject(
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border:
                "1px solid #cbd5e1",
              background: "#f8fafc",
            }}
          >
            <option value="ALL">
              All Subjects
            </option>

            <option value="Physics">
              Physics
            </option>

            <option value="Chemistry">
              Chemistry
            </option>

            <option value="Mathematics">
              Mathematics
            </option>

            <option value="Botany">
              Botany
            </option>

            <option value="Zoology">
              Zoology
            </option>
          </select>
        </div>

        {/* SEARCH */}

        <div>
          <label
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "#475569",
              display: "block",
              marginBottom: "5px",
            }}
          >
            SEARCH KEYWORD
          </label>

          <input
            type="text"
            placeholder="Search questions or test titles..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border:
                "1px solid #cbd5e1",
              background: "#f8fafc",
              boxSizing:
                "border-box",
            }}
          />
        </div>
      </div>

      {/* ======================================================
          ADD / EDIT FORM
      ====================================================== */}

      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: "#ffffff",
            padding: "25px",
            borderRadius: "12px",
            boxShadow:
              "0 4px 25px rgba(0,0,0,0.06)",
            marginBottom: "30px",
            border:
              "1px solid #e2e8f0",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              color: "#1e293b",
              borderBottom:
                "1px solid #f1f5f9",
              paddingBottom: "10px",
            }}
          >
            {editingId
              ? "✏️ Edit Question"
              : "➕ Add New Question Manually"}
          </h3>

          {/* BASIC INFO */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px",
              marginBottom: "15px",
            }}
          >
            {/* CLASS */}

            <div>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Class Name:
              </label>

              <select
                value={formData.className}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    className:
                      e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  padding: "9px",
                  marginTop: "5px",
                  borderRadius: "6px",
                  border:
                    "1px solid #cbd5e1",
                }}
              >
                <option value="1st PUC">
                  1st PUC
                </option>

                <option value="2nd PUC">
                  2nd PUC
                </option>
              </select>
            </div>

            {/* EXAM */}

            <div>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Exam Type:
              </label>

              <select
                value={formData.examType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    examType:
                      e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  padding: "9px",
                  marginTop: "5px",
                  borderRadius: "6px",
                  border:
                    "1px solid #cbd5e1",
                }}
              >
                <option value="JEE">
                  JEE
                </option>

                <option value="NEET">
                  NEET
                </option>
              </select>
            </div>

            {/* TEST CATEGORY */}

            <div>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Test Category:
              </label>

              <select
                value={
                  formData.testCategory
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    testCategory:
                      e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  padding: "9px",
                  marginTop: "5px",
                  borderRadius: "6px",
                  border:
                    "1px solid #cbd5e1",
                }}
              >
                <option value="mock">
                  Mock Test
                </option>

                <option value="daily">
                  Daily Test
                </option>

                <option value="subject">
                  Subject Test
                </option>
              </select>
            </div>

            {/* SUBJECT */}

            <div>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Subject:
              </label>

              <select
                value={formData.subject}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subject:
                      e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  padding: "9px",
                  marginTop: "5px",
                  borderRadius: "6px",
                  border:
                    "1px solid #cbd5e1",
                }}
              >
                <option value="Physics">
                  Physics
                </option>

                <option value="Chemistry">
                  Chemistry
                </option>

                <option value="Mathematics">
                  Mathematics
                </option>

                <option value="Botany">
                  Botany
                </option>

                <option value="Zoology">
                  Zoology
                </option>
              </select>
            </div>
          </div>

          {/* TITLE / CHAPTER */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "2fr 1fr",
              gap: "15px",
              marginBottom: "15px",
            }}
          >
            <div>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Test Title:
              </label>

              <input
                type="text"
                value={
                  formData.testTitle
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    testTitle:
                      e.target.value,
                  })
                }
                required
                style={{
                  width: "100%",
                  padding: "9px",
                  marginTop: "5px",
                  borderRadius: "6px",
                  border:
                    "1px solid #cbd5e1",
                  boxSizing:
                    "border-box",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Chapter Name:
              </label>

              <input
                type="text"
                value={
                  formData.chapter
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    chapter:
                      e.target.value,
                  })
                }
                placeholder="e.g. Kinematics"
                style={{
                  width: "100%",
                  padding: "9px",
                  marginTop: "5px",
                  borderRadius: "6px",
                  border:
                    "1px solid #cbd5e1",
                  boxSizing:
                    "border-box",
                }}
              />
            </div>
          </div>

          {/* QUESTION */}

          <div
            style={{
              marginBottom: "15px",
            }}
          >
            <label
              style={{
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              Question Text:
            </label>

            <textarea
              rows={3}
              value={formData.question}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  question:
                    e.target.value,
                })
              }
              required
              style={{
                width: "100%",
                padding: "9px",
                marginTop: "5px",
                borderRadius: "6px",
                border:
                  "1px solid #cbd5e1",
                boxSizing:
                  "border-box",
              }}
            />
          </div>

          {/* IMAGE */}

          <div
            style={{
              marginBottom: "15px",
            }}
          >
            <label
              style={{
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              Question Image URL
              (Optional):
            </label>

            <input
              type="text"
              value={
                formData.questionImage
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  questionImage:
                    e.target.value,
                })
              }
              placeholder="https://example.com/diagram.png"
              style={{
                width: "100%",
                padding: "9px",
                marginTop: "5px",
                borderRadius: "6px",
                border:
                  "1px solid #cbd5e1",
                boxSizing:
                  "border-box",
              }}
            />
          </div>

          {/* OPTIONS */}

          <div
            style={{
              marginBottom: "15px",
            }}
          >
            <label
              style={{
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              Options:
            </label>

            {formData.options.map(
              (opt, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom:
                      "8px",
                    alignItems:
                      "center",
                  }}
                >
                  <span
                    style={{
                      fontWeight:
                        "bold",
                      width: "20px",
                    }}
                  >
                    {String.fromCharCode(
                      65 + idx
                    )}
                  </span>

                  <input
                    type="text"
                    value={opt}
                    onChange={(e) =>
                      handleOptionChange(
                        idx,
                        e.target.value
                      )
                    }
                    required
                    style={{
                      width: "100%",
                      padding:
                        "8px",
                      borderRadius:
                        "6px",
                      border:
                        "1px solid #cbd5e1",
                    }}
                  />
                </div>
              )
            )}
          </div>

          {/* CORRECT ANSWER */}

          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <label
              style={{
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              Correct Answer:
            </label>

            <input
              type="text"
              value={
                formData.correctAnswer
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  correctAnswer:
                    e.target.value,
                })
              }
              required
              style={{
                width: "100%",
                padding: "9px",
                marginTop: "5px",
                borderRadius: "6px",
                border:
                  "1px solid #cbd5e1",
                boxSizing:
                  "border-box",
              }}
            />
          </div>

          {/* BUTTONS */}

          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <button
              type="submit"
              style={{
                background:
                  "#16a34a",
                color: "#fff",
                padding:
                  "10px 20px",
                border: "none",
                borderRadius:
                  "6px",
                cursor:
                  "pointer",
                fontWeight:
                  "600",
              }}
            >
              {editingId
                ? "Update Question"
                : "Save as Draft"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              style={{
                background:
                  "#e2e8f0",
                color:
                  "#334155",
                padding:
                  "10px 16px",
                border: "none",
                borderRadius:
                  "6px",
                cursor:
                  "pointer",
                fontWeight:
                  "600",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ======================================================
          QUESTIONS LIST
      ====================================================== */}

      <h3
        style={{
          color: "#1e293b",
          marginBottom: "15px",
        }}
      >
        📋 Filtered Results (
        {filteredQuestions.length})
      </h3>

      {loading ? (
        <p>
          Loading questions...
        </p>
      ) : filteredQuestions.length ===
        0 ? (
        <div
          style={{
            background: "#fff",
            padding: "40px",
            textAlign:
              "center",
            borderRadius:
              "12px",
            color:
              "#64748b",
          }}
        >
          No questions found
          matching your filter
          criteria.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "1fr",
            gap: "15px",
          }}
        >
          {filteredQuestions.map(
            (q, index) => (
              <div
                key={
                  q._id ||
                  index
                }
                style={{
                  background:
                    "#ffffff",
                  padding:
                    "20px",
                  borderRadius:
                    "12px",
                  boxShadow:
                    "0 2px 5px rgba(0,0,0,0.04)",
                  border:
                    "1px solid #e2e8f0",
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "flex-start",
                  gap:
                    "20px",
                }}
              >
                {/* QUESTION CONTENT */}

                <div
                  style={{
                    flex: 1,
                  }}
                >
                  {/* TAGS */}

                  <div
                    style={{
                      display:
                        "flex",
                      gap: "8px",
                      marginBottom:
                        "8px",
                      alignItems:
                        "center",
                      flexWrap:
                        "wrap",
                    }}
                  >
                    <span
                      style={{
                        background:
                          "#f3e8ff",
                        color:
                          "#6b21a8",
                        padding:
                          "2px 8px",
                        borderRadius:
                          "4px",
                        fontSize:
                          "11px",
                        fontWeight:
                          "700",
                      }}
                    >
                      {q.className ||
                        "2nd PUC"}
                    </span>

                    <span
                      style={{
                        background:
                          q.examType ===
                          "JEE"
                            ? "#e0e7ff"
                            : "#dcfce7",
                        color:
                          q.examType ===
                          "JEE"
                            ? "#3730a3"
                            : "#166534",
                        padding:
                          "2px 8px",
                        borderRadius:
                          "4px",
                        fontSize:
                          "11px",
                        fontWeight:
                          "700",
                      }}
                    >
                      {q.examType}
                    </span>

                    <span
                      style={{
                        background:
                          "#f1f5f9",
                        color:
                          "#475569",
                        padding:
                          "2px 8px",
                        borderRadius:
                          "4px",
                        fontSize:
                          "11px",
                        fontWeight:
                          "700",
                        textTransform:
                          "uppercase",
                      }}
                    >
                      {q.testCategory}{" "}
                      Test
                    </span>

                    <span
                      style={{
                        background:
                          "#fef3c7",
                        color:
                          "#92400e",
                        padding:
                          "2px 8px",
                        borderRadius:
                          "4px",
                        fontSize:
                          "11px",
                        fontWeight:
                          "700",
                      }}
                    >
                      {q.subject}
                    </span>

                    <span
                      style={{
                        background:
                          q.isPublished
                            ? "#dcfce7"
                            : "#fee2e2",
                        color:
                          q.isPublished
                            ? "#166534"
                            : "#991b1b",
                        padding:
                          "2px 8px",
                        borderRadius:
                          "4px",
                        fontSize:
                          "11px",
                        fontWeight:
                          "700",
                      }}
                    >
                      {q.isPublished
                        ? "🟢 Published"
                        : "🟠 Draft"}
                    </span>

                    {q.testTitle && (
                      <span
                        style={{
                          background:
                            "#e0f2fe",
                          color:
                            "#0369a1",
                          padding:
                            "2px 8px",
                          borderRadius:
                            "4px",
                          fontSize:
                            "11px",
                          fontWeight:
                            "600",
                        }}
                      >
                        📁{" "}
                        {
                          q.testTitle
                        }
                      </span>
                    )}
                  </div>

                  {/* QUESTION */}

                  <h4
                    style={{
                      margin:
                        "0 0 10px 0",
                      color:
                        "#1e293b",
                      fontSize:
                        "16px",
                    }}
                  >
                    Q
                    {q.questionNumber ||
                      index + 1}
                    .{" "}
                    {q.question}
                  </h4>

                  {/* IMAGE */}

                  {q.questionImage && (
                    <div
                      style={{
                        marginBottom:
                          "12px",
                      }}
                    >
                      <img
                        src={
                          q.questionImage
                        }
                        alt="Question Diagram"
                        style={{
                          maxWidth:
                            "250px",
                          maxHeight:
                            "150px",
                          borderRadius:
                            "6px",
                          border:
                            "1px solid #cbd5e1",
                        }}
                      />
                    </div>
                  )}

                  {/* OPTIONS */}

                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "1fr 1fr",
                      gap: "8px",
                      marginTop:
                        "10px",
                    }}
                  >
                    {q.options?.map(
                      (
                        opt,
                        optIdx
                      ) => {
                        const isCorrect =
                          opt ===
                          q.correctAnswer;

                        return (
                          <div
                            key={
                              optIdx
                            }
                            style={{
                              fontSize:
                                "13px",
                              padding:
                                "6px 10px",
                              background:
                                isCorrect
                                  ? "#dcfce7"
                                  : "#f8fafc",
                              border:
                                `1px solid ${
                                  isCorrect
                                    ? "#86efac"
                                    : "#e2e8f0"
                                }`,
                              borderRadius:
                                "6px",
                              color:
                                isCorrect
                                  ? "#166534"
                                  : "#334155",
                            }}
                          >
                            <strong>
                              {String.fromCharCode(
                                65 +
                                  optIdx
                              )}
                              .
                            </strong>{" "}
                            {opt}{" "}
                            {isCorrect &&
                              "✓ (Correct)"}
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* ACTIONS */}

                <div
                  style={{
                    display:
                      "flex",
                    flexDirection:
                      "column",
                    gap: "8px",
                    minWidth:
                      "90px",
                  }}
                >
                  <button
                    onClick={() =>
                      handleEdit(q)
                    }
                    style={{
                      background:
                        "#eab308",
                      color:
                        "#fff",
                      border:
                        "none",
                      padding:
                        "8px 12px",
                      borderRadius:
                        "6px",
                      cursor:
                        "pointer",
                      fontWeight:
                        "600",
                      fontSize:
                        "13px",
                    }}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(
                        q._id
                      )
                    }
                    style={{
                      background:
                        "#ef4444",
                      color:
                        "#fff",
                      border:
                        "none",
                      padding:
                        "8px 12px",
                      borderRadius:
                        "6px",
                      cursor:
                        "pointer",
                      fontWeight:
                        "600",
                      fontSize:
                        "13px",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}