import React, { useState, useEffect } from "react";
import "./QuestionBank.css";

interface QuestionItem {
  _id?: string;
  id?: string;

  subject?: string;
  chapter?: string;

  // Backend field
  question?: string;

  // Frontend compatibility
  questionText?: string;

  options: string[];
  correctAnswer: string;
  ansNumber: string;

  imageUrl?: string;

  difficulty?: string;
  testDate?: string;
  testTime?: string;
  testType?: string;

  testTitle?: string;
  isPublished?: boolean;
  status?: string;
}

const API_BASE =
  "https://exammaster-backend-up1y.onrender.com/api/questions";

export default function QuestionBank() {
  const [mode, setMode] = useState<"bulk" | "pdf">("bulk");

  // ==============================
  // DATABASE QUESTIONS
  // ==============================
  const [existingQuestions, setExistingQuestions] = useState<QuestionItem[]>(
    []
  );

  const [showAllTotalView, setShowAllTotalView] = useState(false);

  const [viewCategoryTab, setViewCategoryTab] = useState<
    "all" | "mock" | "daily"
  >("all");

  // ==============================
  // SEARCH
  // ==============================
  const [searchQuery, setSearchQuery] = useState("");

  // ==============================
  // PAGINATION
  // ==============================
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  // ==============================
  // BULK IMPORT
  // ==============================
  const [bulkQuestionsText, setBulkQuestionsText] = useState("");
  const [bulkAnswersText, setBulkAnswersText] = useState("");

  const [parsedQuestions, setParsedQuestions] = useState<QuestionItem[]>([]);

  // ==============================
  // PDF
  // ==============================
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [pdfLoading, setPdfLoading] = useState(false);

  const [publishTestType, setPublishTestType] = useState<
    "mock" | "daily"
  >("mock");

  const [publishTestTitle, setPublishTestTitle] = useState("");

  const [publishDate, setPublishDate] = useState("");

  const [publishTime, setPublishTime] = useState("");

  // ==============================
  // TIME
  // ==============================
  const [tHour, setTHour] = useState("10");
  const [tMin, setTMin] = useState("00");
  const [tAmPm, setTAmPm] = useState("AM");

  // ==============================
  // EDITING
  // ==============================
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  );

  const [editFormData, setEditFormData] =
    useState<QuestionItem | null>(null);

  // NEW IMAGE FOR EDIT
  const [editImageFile, setEditImageFile] = useState<File | null>(null);

  const [editImagePreview, setEditImagePreview] = useState<string>("");

  // ==============================
  // GENERAL
  // ==============================
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  // ============================================================
  // TOKEN
  // ============================================================

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("jwt") ||
      localStorage.getItem("staffToken") ||
      localStorage.getItem("teacherToken") ||
      localStorage.getItem("headToken")
    );
  };

  // ============================================================
  // QUESTION TEXT HELPER
  // ============================================================

  const getQuestionText = (q: QuestionItem) => {
    return q.question || q.questionText || "Question text unavailable";
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchExistingQuestions();
  }, []);

  // ============================================================
  // RESET PAGINATION
  // ============================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, viewCategoryTab]);

  // ============================================================
  // FETCH QUESTIONS
  // ============================================================

  const fetchExistingQuestions = async () => {
    try {
      const token = getToken();

      if (!token) {
        setMessage(
          "⚠️ Authentication token not found! Please login again."
        );
        return;
      }

      const res = await fetch(API_BASE, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        setMessage(
          "❌ Session Expired (401 Unauthorized). Please re-login!"
        );
        return;
      }

      const data = await res.json();

      console.log("QUESTION BANK RESPONSE:", data);

      if (data.success && Array.isArray(data.questions)) {
        // Normalize backend question field
        const normalizedQuestions = data.questions.map(
          (q: any): QuestionItem => ({
            ...q,

            question: q.question || q.questionText || "",

            questionText: q.question || q.questionText || "",

            options: Array.isArray(q.options) ? q.options : [],

            correctAnswer: q.correctAnswer || "",

            ansNumber: q.ansNumber
              ? String(q.ansNumber)
              : "",
          })
        );

        setExistingQuestions(normalizedQuestions);
      } else {
        setExistingQuestions([]);
      }
    } catch (err) {
      console.error("Question Load Error:", err);

      setMessage("❌ Failed to load questions");
    }
  };

  // ============================================================
  // BULK PARSER
  // ============================================================

  const processBulkImport = () => {
    if (!bulkQuestionsText.trim()) {
      setMessage(
        "⚠️ First, paste questions text into the box!"
      );
      return;
    }

    const rawAnsText = bulkAnswersText.trim();

    const answerKeyMap: {
      [key: number]: number;
    } = {};

    // --------------------------------------------
    // ANSWER KEY
    // --------------------------------------------

    if (rawAnsText) {
      const explicitPairs = [
        ...rawAnsText.matchAll(
          /(\d+)[\.\s\:\-\)]+(\d+)/g
        ),
      ];

      if (explicitPairs.length > 0) {
        explicitPairs.forEach((m) => {
          const qNum = parseInt(m[1]);
          const aNum = parseInt(m[2]);

          if (
            qNum &&
            aNum >= 1 &&
            aNum <= 4
          ) {
            answerKeyMap[qNum] = aNum;
          }
        });
      } else {
        const cleanNums = rawAnsText.match(/[1-4]/g);

        if (cleanNums) {
          cleanNums.forEach((numStr, index) => {
            answerKeyMap[index + 1] = parseInt(numStr);
          });
        }
      }
    }

    // --------------------------------------------
    // OPTION TOKEN
    // --------------------------------------------

    const text = bulkQuestionsText;

    const tokenRegex =
      /(?:\s|^)(?:\(([1-4]|[A-Da-d])\)|([1-4]|[A-Da-d])[\)]|([1-4]|[A-Da-d])\.(?!\d))\s*/g;

    interface TokenMatch {
      index: number;
      length: number;
      num: number;
    }

    const tokens: TokenMatch[] = [];

    let m;

    while ((m = tokenRegex.exec(text)) !== null) {
      const valStr =
        m[1] ||
        m[2] ||
        m[3];

      let num = parseInt(valStr);

      if (isNaN(num)) {
        num =
          valStr
            .toUpperCase()
            .charCodeAt(0) - 64;
      }

      tokens.push({
        index: m.index,
        length: m[0].length,
        num,
      });
    }

    // --------------------------------------------
    // QUESTION BLOCKS
    // --------------------------------------------

    const questionBlocks: {
      qText: string;
      options: string[];
    }[] = [];

    let currentCluster: TokenMatch[] = [];

    const pushClusterToQuestions = (
      fullText: string,
      cluster: TokenMatch[],
      out: {
        qText: string;
        options: string[];
      }[]
    ) => {
      if (cluster.length === 0) return;

      const firstOptIndex = cluster[0].index;

      const prevQEnd =
        (out as any)._lastEnd || 0;

      let rawQText = fullText
        .substring(
          prevQEnd,
          firstOptIndex
        )
        .trim();

      rawQText = rawQText
        .replace(
          /^(?:Q(?:uestion)?\s*\d*[\.\:\)]|\d+[\.\:\)])\s*/i,
          ""
        )
        .trim();

      const extractedOpts = [
        "",
        "",
        "",
      ];

      cluster.forEach(
        (optToken, idx) => {
          if (idx < 4) {
            const start =
              optToken.index +
              optToken.length;

            const end =
              idx <
              cluster.length - 1
                ? cluster[idx + 1].index
                : fullText.length;

            let optVal = fullText
              .substring(start, end)
              .trim();

            const nextQMatch =
              optVal.match(
                /\n?\s*(?:Q\d+|\d+)[\.\)]\s+/i
              );

            if (
              nextQMatch &&
              nextQMatch.index !== undefined
            ) {
              optVal = optVal
                .substring(
                  0,
                  nextQMatch.index
                )
                .trim();
            }

            extractedOpts[idx] =
              optVal;
          }
        }
      );

      (
        out as any
      )._lastEnd =
        cluster[
          cluster.length - 1
        ].index;

      if (rawQText) {
        out.push({
          qText: rawQText,
          options: extractedOpts,
        });
      }
    };

    // --------------------------------------------
    // BUILD CLUSTERS
    // --------------------------------------------

    for (
      let i = 0;
      i < tokens.length;
      i++
    ) {
      const token = tokens[i];

      if (
        token.num === 1 &&
        currentCluster.length >= 2
      ) {
        pushClusterToQuestions(
          text,
          currentCluster,
          questionBlocks
        );

        currentCluster = [token];
      } else {
        currentCluster.push(token);
      }
    }

    if (currentCluster.length >= 2) {
      pushClusterToQuestions(
        text,
        currentCluster,
        questionBlocks
      );
    }

    // --------------------------------------------
    // FINAL ITEMS
    // --------------------------------------------

    const finalItems: QuestionItem[] =
      questionBlocks.map(
        (block, idx) => {
          const qIndex = idx + 1;

          const ansNumber =
            answerKeyMap[qIndex]
              ? answerKeyMap[
                  qIndex
                ].toString()
              : "1";

          const correctText =
            block.options[
              parseInt(ansNumber) - 1
            ] ||
            block.options[0] ||
            "";

          return {
            id:
              "q_" +
              Date.now() +
              "_" +
              idx,

            subject: "General",

            chapter:
              publishTestTitle ||
              "General Practice Test",

            question:
              block.qText,

            questionText:
              block.qText,

            options:
              block.options,

            ansNumber,

            correctAnswer:
              correctText,

            imageUrl: "",

            difficulty: "Medium",

            testDate:
              publishDate ||
              new Date()
                .toISOString()
                .split("T")[0],

            testTime:
              publishTime ||
              "10:00",

            testType:
              publishTestType,
          };
        }
      );

    setParsedQuestions(finalItems);

    if (finalItems.length > 0) {
      setMessage(
        `⚡ Successfully parsed ${finalItems.length} questions! Review and save.`
      );
    } else {
      setMessage(
        "❌ No questions detected. Please check question format."
      );
    }
  };

  // ============================================================
  // PDF UPLOAD
  // ============================================================

  const handlePdfUpload = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!pdfFile) {
      setMessage(
        "⚠️ Please select a PDF file!"
      );
      return;
    }

    if (!publishTestTitle.trim()) {
      setMessage(
        "⚠️ Please enter a Test Title!"
      );
      return;
    }

    if (!publishDate) {
      setMessage(
        "⚠️ Please select the Test Date!"
      );
      return;
    }

    const token = getToken();

    if (!token) {
      setMessage(
        "⚠️ Authentication token missing! Please login again."
      );
      return;
    }

    const formData = new FormData();

    formData.append(
      "pdf",
      pdfFile
    );

    formData.append(
      "subject",
      "General"
    );

    formData.append(
      "chapter",
      publishTestTitle
    );

    formData.append(
      "testTitle",
      publishTestTitle
    );

    formData.append(
      "testType",
      publishTestType
    );

    formData.append(
      "publishDate",
      publishDate
    );

    formData.append(
      "publishTime",
      publishTime
    );

    try {
      setPdfLoading(true);

      setMessage(
        "⏳ Extracting questions from PDF..."
      );

      const res = await fetch(
        `${API_BASE}/generate-from-pdf`,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },

          body: formData,
        }
      );

      if (res.status === 401) {
        setMessage(
          "❌ Session Expired (401). Please re-login!"
        );
        return;
      }

      const data =
        await res.json();

      console.log(
        "PDF RESPONSE:",
        data
      );

      if (data.success) {
        setMessage(
          `🎉 Success! Published ${
            data.totalQuestions ||
            data.totalSaved ||
            0
          } questions!`
        );

        setPdfFile(null);

        setPublishTestTitle("");

        setPublishDate("");

        setPublishTime("");

        setTHour("10");

        setTMin("00");

        setTAmPm("AM");

        await fetchExistingQuestions();
      } else {
        setMessage(
          `❌ Error: ${
            data.message ||
            "Failed to process PDF"
          }`
        );
      }
    } catch (err) {
      console.error(
        "PDF ERROR:",
        err
      );

      setMessage(
        "❌ Network or Server error occurred"
      );
    } finally {
      setPdfLoading(false);
    }
  };

  // ============================================================
  // SAVE BULK QUESTIONS
  // ============================================================

  const saveBulkQuestions =
    async () => {
      const token = getToken();

      if (!token) {
        setMessage(
          "⚠️ Authentication token missing!"
        );
        return;
      }

      if (
        parsedQuestions.length === 0
      ) {
        setMessage(
          "⚠️ No parsed questions found!"
        );
        return;
      }

      setLoading(true);

      setMessage(
        "⏳ Saving questions..."
      );

      try {
        let successCount = 0;

        for (
          const item of parsedQuestions
        ) {
          const payload = {
            ...item,

            // IMPORTANT
            question:
              item.question ||
              item.questionText ||
              "",

            questionText:
              item.question ||
              item.questionText ||
              "",
          };

          const res =
            await fetch(
              API_BASE,
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",

                  Authorization:
                    `Bearer ${token}`,
                },

                body:
                  JSON.stringify(
                    payload
                  ),
              }
            );

          if (res.ok) {
            successCount++;
          } else {
            console.error(
              "Question save failed:",
              await res.text()
            );
          }
        }

        setMessage(
          `🚀 Successfully Saved ${successCount} Questions!`
        );

        setParsedQuestions([]);

        setBulkQuestionsText("");

        setBulkAnswersText("");

        await fetchExistingQuestions();
      } catch (err) {
        console.error(err);

        setMessage(
          "❌ Error saving questions"
        );
      } finally {
        setLoading(false);
      }
    };

  // ============================================================
  // DELETE SINGLE
  // ============================================================

  const handleDeleteExistingQuestion =
    async (qId: string) => {
      if (!qId) return;

      if (
        !window.confirm(
          "Are you sure you want to delete this question?"
        )
      ) {
        return;
      }

      const token = getToken();

      if (!token) return;

      try {
        const res =
          await fetch(
            `${API_BASE}/${qId}`,
            {
              method: "DELETE",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (res.ok) {
          setMessage(
            "🗑️ Question deleted successfully!"
          );

          await fetchExistingQuestions();
        } else {
          setMessage(
            "❌ Failed to delete question"
          );
        }
      } catch (err) {
        console.error(err);
      }
    };

  // ============================================================
  // DELETE ALL
  // ============================================================

  const handleDeleteAllQuestions =
    async () => {
      if (
        !window.confirm(
          "⚠️ WARNING: This will delete ALL stored questions and tests. Are you sure?"
        )
      ) {
        return;
      }

      const token = getToken();

      if (!token) return;

      try {
        const res =
          await fetch(
            `${API_BASE}/all`,
            {
              method: "DELETE",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (res.ok) {
          setMessage(
            "🗑️ All questions cleared successfully!"
          );

          setExistingQuestions([]);
        } else {
          setMessage(
            "❌ Failed to delete all questions"
          );
        }
      } catch (err) {
        console.error(err);
      }
    };

  // ============================================================
  // START EDITING
  // ============================================================

  const startEditing = (
    q: QuestionItem
  ) => {
    const id =
      q._id ||
      q.id ||
      null;

    setEditingQuestionId(id);

    const questionText =
      q.question ||
      q.questionText ||
      "";

    const options =
      Array.isArray(q.options)
        ? [...q.options]
        : ["", "", "", ""];

    // Make sure 4 options exist
    while (
      options.length < 4
    ) {
      options.push("");
    }

    const editData: QuestionItem = {
      ...q,

      question:
        questionText,

      questionText:
        questionText,

      options,

      ansNumber:
        q.ansNumber
          ? String(q.ansNumber)
          : "1",

      correctAnswer:
        q.correctAnswer ||
        options[
          parseInt(
            q.ansNumber || "1"
          ) - 1
        ] ||
        "",
    };

    setEditFormData(
      editData
    );

    // Existing image preview
    setEditImagePreview(
      q.imageUrl || ""
    );

    // Reset newly selected image
    setEditImageFile(null);
  };

  // ============================================================
  // EDIT IMAGE SELECT
  // ============================================================

  const handleEditImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    // Only image files
    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setMessage(
        "❌ Please select an image file."
      );

      e.target.value = "";

      return;
    }

    setEditImageFile(file);

    const previewUrl =
      URL.createObjectURL(
        file
      );

    setEditImagePreview(
      previewUrl
    );
  };

  // ============================================================
  // SAVE EDITED QUESTION
  // ============================================================

  const saveEditedQuestion =
    async () => {
      if (
        !editingQuestionId ||
        !editFormData
      ) {
        return;
      }

      const token = getToken();

      if (!token) {
        setMessage(
          "⚠️ Authentication token missing!"
        );
        return;
      }

      const questionText =
        editFormData.question ||
        editFormData.questionText ||
        "";

      if (!questionText.trim()) {
        setMessage(
          "⚠️ Question text cannot be empty."
        );
        return;
      }

      try {
        setLoading(true);

        setMessage(
          "⏳ Updating question..."
        );

        // IMPORTANT:
        // FormData required because image upload
        const formData =
          new FormData();

        formData.append(
          "question",
          questionText
        );

        // Keep compatibility
        formData.append(
          "questionText",
          questionText
        );

        formData.append(
          "subject",
          editFormData.subject ||
            "General"
        );

        formData.append(
          "chapter",
          editFormData.chapter ||
            "General"
        );

        formData.append(
          "ansNumber",
          editFormData.ansNumber ||
            "1"
        );

        // Options as JSON
        formData.append(
          "options",
          JSON.stringify(
            editFormData.options ||
              []
          )
        );

        // Calculate correct answer
        const answerIndex =
          Math.max(
            0,
            parseInt(
              editFormData.ansNumber ||
                "1"
            ) - 1
          );

        const correctAnswer =
          editFormData.options?.[
            answerIndex
          ] ||
          editFormData.correctAnswer ||
          "";

        formData.append(
          "correctAnswer",
          correctAnswer
        );

        formData.append(
          "difficulty",
          editFormData.difficulty ||
            "Medium"
        );

        if (
          editFormData.testType
        ) {
          formData.append(
            "testType",
            editFormData.testType
          );
        }

        if (
          editFormData.testDate
        ) {
          formData.append(
            "testDate",
            editFormData.testDate
          );
        }

        if (
          editFormData.testTime
        ) {
          formData.append(
            "testTime",
            editFormData.testTime
          );
        }

        // =====================================
        // NEW IMAGE
        // =====================================

        if (editImageFile) {
          formData.append(
            "image",
            editImageFile
          );
        }

        const res =
          await fetch(
            `${API_BASE}/${editingQuestionId}`,
            {
              method: "PUT",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },

              body: formData,
            }
          );

        const data =
          await res.json();

        console.log(
          "UPDATE RESPONSE:",
          data
        );

        if (res.ok && data.success) {
          setMessage(
            "✨ Question and image updated successfully!"
          );

          setEditingQuestionId(
            null
          );

          setEditFormData(
            null
          );

          setEditImageFile(
            null
          );

          setEditImagePreview(
            ""
          );

          await fetchExistingQuestions();
        } else {
          setMessage(
            `❌ ${
              data.message ||
              "Failed to update question"
            }`
          );
        }
      } catch (err) {
        console.error(
          "UPDATE ERROR:",
          err
        );

        setMessage(
          "❌ Error updating question"
        );
      } finally {
        setLoading(false);
      }
    };

  // ============================================================
  // CANCEL EDIT
  // ============================================================

  const cancelEdit = () => {
    setEditingQuestionId(
      null
    );

    setEditFormData(
      null
    );

    setEditImageFile(
      null
    );

    setEditImagePreview(
      ""
    );
  };

  // ============================================================
  // FILTER QUESTIONS
  // ============================================================

  const processedQuestions =
    existingQuestions.filter(
      (q) => {
        if (
          viewCategoryTab ===
            "mock" &&
          q.testType !== "mock" &&
          !q.chapter
            ?.toLowerCase()
            .includes("mock")
        ) {
          return false;
        }

        if (
          viewCategoryTab ===
            "daily" &&
          q.testType !== "daily" &&
          !q.chapter
            ?.toLowerCase()
            .includes("daily")
        ) {
          return false;
        }

        const question =
          getQuestionText(q);

        return (
          question
            .toLowerCase()
            .includes(
              searchQuery.toLowerCase()
            ) ||
          q.chapter
            ?.toLowerCase()
            .includes(
              searchQuery.toLowerCase()
            )
        );
      }
    );

  // ============================================================
  // PAGINATION
  // ============================================================

  const totalPages =
    Math.ceil(
      processedQuestions.length /
        itemsPerPage
    );

  const indexOfLastItem =
    currentPage *
    itemsPerPage;

  const indexOfFirstItem =
    indexOfLastItem -
    itemsPerPage;

  const currentQuestions =
    processedQuestions.slice(
      indexOfFirstItem,
      indexOfLastItem
    );

  // ============================================================
  // TIME SYNC
  // ============================================================

  useEffect(() => {
    let h = parseInt(
      tHour,
      10
    );

    if (
      tAmPm === "PM" &&
      h < 12
    ) {
      h += 12;
    }

    if (
      tAmPm === "AM" &&
      h === 12
    ) {
      h = 0;
    }

    const formattedHour =
      String(h).padStart(
        2,
        "0"
      );

    setPublishTime(
      `${formattedHour}:${tMin}`
    );
  }, [
    tHour,
    tMin,
    tAmPm,
  ]);

  // ============================================================
  // JSX
  // ============================================================

  return (
    <div className="question-bank-page">

      {/* =========================================
          STATS
      ========================================== */}

      <div className="qb-stats-banner">

        <div
          className="stat-pill clickable-pill"
          onClick={() =>
            setShowAllTotalView(
              !showAllTotalView
            )
          }
        >
          <span className="stat-label">
            📂 Database Explorer
          </span>

          <div className="stat-value">
            {existingQuestions.length} Total
          </div>
        </div>

        <div className="stat-pill glow-blue">
          <span className="stat-label">
            ⚡ Daily Practice
          </span>

          <div className="stat-value">
            {
              existingQuestions.filter(
                (q) =>
                  q.testType ===
                    "daily" ||
                  q.chapter
                    ?.toLowerCase()
                    .includes(
                      "daily"
                    )
              ).length
            }
          </div>
        </div>

        <div className="stat-pill glow-purple">
          <span className="stat-label">
            📝 Live Mock Tests
          </span>

          <div className="stat-value">
            {
              existingQuestions.filter(
                (q) =>
                  q.testType ===
                    "mock" ||
                  q.chapter
                    ?.toLowerCase()
                    .includes(
                      "mock"
                    )
              ).length
            }
          </div>
        </div>

      </div>

      {/* =========================================
          HEADER
      ========================================== */}

      <div className="qb-header">

        <div className="qb-header-text">

          <h1>
            🚀 Exam Command Center
          </h1>

          <p className="qb-subtitle">
            Publish tests, edit questions,
            options & images
          </p>

        </div>

        <div className="qb-mode-toggle">

          <button
            className={
              mode === "bulk" &&
              !showAllTotalView
                ? "active-tab"
                : "inactive-tab"
            }
            onClick={() => {
              setMode("bulk");
              setShowAllTotalView(
                false
              );
            }}
          >
            ⚡ Bulk Auto-Parser
          </button>

          <button
            className={
              mode === "pdf" &&
              !showAllTotalView
                ? "active-tab"
                : "inactive-tab"
            }
            onClick={() => {
              setMode("pdf");
              setShowAllTotalView(
                false
              );
            }}
          >
            📄 AI PDF Extractor
          </button>

        </div>

      </div>

      {/* =========================================
          MESSAGE
      ========================================== */}

      {message && (
        <div className="qb-message-banner animate-fade">
          {message}
        </div>
      )}

      {/* =========================================
          DATABASE EXPLORER
      ========================================== */}

      {showAllTotalView ? (

        <div className="manage-section animate-fade">

          <div className="explorer-top-flex">

            <div>
              <h3>
                🗄️ All Stored Tests & Questions
              </h3>

              <p className="explorer-sub">
                Edit questions, options,
                correct answers and images.
              </p>
            </div>

            <div className="explorer-actions">

              <button
                onClick={
                  handleDeleteAllQuestions
                }
                className="btn-danger-all"
              >
                🗑️ Delete All Data
              </button>

              <button
                onClick={
                  fetchExistingQuestions
                }
                className="btn-refresh"
              >
                🔄 Refresh
              </button>

              <button
                onClick={() =>
                  setShowAllTotalView(
                    false
                  )
                }
                className="btn-close-explorer"
              >
                ❌ Close
              </button>

            </div>

          </div>

          {/* CATEGORY */}

          <div className="category-tabs-scroll">

            <button
              onClick={() =>
                setViewCategoryTab(
                  "all"
                )
              }
              className={`cat-pill-btn ${
                viewCategoryTab ===
                "all"
                  ? "active"
                  : ""
              }`}
            >
              📁 All (
              {
                existingQuestions.length
              }
              )
            </button>

            <button
              onClick={() =>
                setViewCategoryTab(
                  "mock"
                )
              }
              className={`cat-pill-btn ${
                viewCategoryTab ===
                "mock"
                  ? "active"
                  : ""
              }`}
            >
              📝 Mock Tests
            </button>

            <button
              onClick={() =>
                setViewCategoryTab(
                  "daily"
                )
              }
              className={`cat-pill-btn ${
                viewCategoryTab ===
                "daily"
                  ? "active"
                  : ""
              }`}
            >
              ⚡ Daily Tests
            </button>

          </div>

          {/* SEARCH */}

          <div className="filter-grid-stack">

            <input
              type="text"
              placeholder="🔍 Search test or question..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
              className="search-input-box-premium"
            />

          </div>

          {/* EMPTY */}

          {processedQuestions.length ===
          0 ? (

            <div className="empty-warning-card">

              <p>
                ⚠️ No records match
                your criteria.
              </p>

            </div>

          ) : (

            <>

              <div className="parsed-list">

                {currentQuestions.map(
                  (q, idx) => {

                    const globalIdx =
                      indexOfFirstItem +
                      idx;

                    const qId =
                      q._id ||
                      q.id ||
                      "";

                    const isEditing =
                      editingQuestionId ===
                      qId;

                    const questionText =
                      getQuestionText(
                        q
                      );

                    return (

                      <div
                        className="parsed-editable-card premium-card"
                        key={
                          qId ||
                          globalIdx
                        }
                      >

                        {/* TOP */}

                        <div className="card-top-bar">

                          <div className="card-badge-group">

                            <span className="q-badge">
                              Q#
                              {globalIdx +
                                1}
                            </span>

                            <span className="chapter-tag">
                              📌{" "}
                              {q.chapter ||
                                q.testTitle ||
                                "Untitled Test"}
                            </span>

                            {q.testDate && (
                              <span className="date-tag">
                                📅{" "}
                                {q.testDate}
                              </span>
                            )}

                            {q.testTime && (
                              <span className="time-tag">
                                ⏰{" "}
                                {q.testTime}
                              </span>
                            )}

                          </div>

                          <div className="card-action-buttons">

                            {!isEditing ? (

                              <>
                                <button
                                  onClick={() =>
                                    startEditing(
                                      q
                                    )
                                  }
                                  className="btn-edit-sm"
                                >
                                  ✏️ Edit Question
                                </button>

                                <button
                                  onClick={() =>
                                    handleDeleteExistingQuestion(
                                      qId
                                    )
                                  }
                                  className="btn-delete-sm"
                                >
                                  🗑️ Delete
                                </button>
                              </>

                            ) : (

                              <div className="edit-action-group">

                                <button
                                  onClick={
                                    saveEditedQuestion
                                  }
                                  disabled={
                                    loading
                                  }
                                  className="btn-save-sm"
                                >
                                  {loading
                                    ? "⏳ Updating..."
                                    : "💾 Update Changes"}
                                </button>

                                <button
                                  onClick={
                                    cancelEdit
                                  }
                                  className="btn-cancel-sm"
                                >
                                  ❌ Cancel
                                </button>

                              </div>

                            )}

                          </div>

                        </div>

                        {/* =====================================
                            EDIT MODE
                        ====================================== */}

                        {isEditing &&
                        editFormData ? (

                          <div className="edit-form-inline">

                            {/* TEST TITLE */}

                            <div className="qb-input-group mb-2">

                              <label>
                                Test Title / Chapter
                              </label>

                              <input
                                type="text"
                                value={
                                  editFormData.chapter ||
                                  ""
                                }
                                onChange={(
                                  e
                                ) =>
                                  setEditFormData(
                                    {
                                      ...editFormData,
                                      chapter:
                                        e
                                          .target
                                          .value,
                                    }
                                  )
                                }
                                className="input-box"
                              />

                            </div>

                            {/* QUESTION */}

                            <div className="qb-input-group mb-2">

                              <label>
                                Question Text
                              </label>

                              <textarea
                                value={
                                  editFormData.question ||
                                  editFormData.questionText ||
                                  ""
                                }
                                onChange={(
                                  e
                                ) =>
                                  setEditFormData(
                                    {
                                      ...editFormData,

                                      question:
                                        e
                                          .target
                                          .value,

                                      questionText:
                                        e
                                          .target
                                          .value,
                                    }
                                  )
                                }
                                className="textarea-box"
                                rows={4}
                              />

                            </div>

                            {/* =================================
                                IMAGE UPLOAD
                            ================================== */}

                            <div className="qb-input-group mb-2">

                              <label>
                                🖼️ Question Image
                              </label>

                              <input
                                type="file"
                                accept="image/*"
                                onChange={
                                  handleEditImageChange
                                }
                                className="file-input-box-premium"
                              />

                              {editImagePreview && (

                                <div
                                  style={{
                                    marginTop:
                                      "12px",
                                    padding:
                                      "10px",
                                    border:
                                      "1px solid #ddd",
                                    borderRadius:
                                      "10px",
                                    background:
                                      "#fafafa",
                                  }}
                                >

                                  <p
                                    style={{
                                      marginBottom:
                                        "8px",
                                      fontWeight:
                                        600,
                                    }}
                                  >
                                    {editImageFile
                                      ? "🆕 New Image Preview"
                                      : "🖼️ Current Image"}
                                  </p>

                                  <img
                                    src={
                                      editImagePreview
                                    }
                                    alt="Question Preview"
                                    style={{
                                      maxWidth:
                                        "100%",
                                      maxHeight:
                                        "300px",
                                      objectFit:
                                        "contain",
                                      borderRadius:
                                        "8px",
                                      display:
                                        "block",
                                    }}
                                  />

                                </div>

                              )}

                            </div>

                            {/* OPTIONS */}

                            <div className="qb-input-group mb-2">

                              <label>
                                Options (1 to 4)
                              </label>

                              <div
                                className="edit-options-grid"
                                style={{
                                  display:
                                    "grid",
                                  gap:
                                    "8px",
                                }}
                              >

                                {editFormData.options.map(
                                  (
                                    opt,
                                    oI
                                  ) => (

                                    <div
                                      key={
                                        oI
                                      }
                                      style={{
                                        display:
                                          "flex",
                                        gap:
                                          "10px",
                                        alignItems:
                                          "center",
                                      }}
                                    >

                                      <span
                                        style={{
                                          fontWeight:
                                            700,
                                          minWidth:
                                            "30px",
                                        }}
                                      >
                                        (
                                        {oI +
                                          1}
                                        )
                                      </span>

                                      <input
                                        type="text"
                                        value={
                                          opt
                                        }
                                        onChange={(
                                          e
                                        ) => {

                                          const newOpts =
                                            [
                                              ...editFormData.options,
                                            ];

                                          newOpts[
                                            oI
                                          ] =
                                            e
                                              .target
                                              .value;

                                          const answerIndex =
                                            parseInt(
                                              editFormData.ansNumber ||
                                                "1"
                                            ) -
                                            1;

                                          setEditFormData(
                                            {
                                              ...editFormData,

                                              options:
                                                newOpts,

                                              correctAnswer:
                                                newOpts[
                                                  answerIndex
                                                ] ||
                                                "",
                                            }
                                          );

                                        }}
                                        className="input-box"
                                      />

                                    </div>

                                  )
                                )}

                              </div>

                            </div>

                            {/* ANSWER NUMBER */}

                            <div className="qb-input-group mb-2">

                              <label>
                                Correct Answer Option Number
                              </label>

                              <select
                                value={
                                  editFormData.ansNumber ||
                                  "1"
                                }
                                onChange={(
                                  e
                                ) => {

                                  const newAnswer =
                                    e
                                      .target
                                      .value;

                                  const answerIndex =
                                    parseInt(
                                      newAnswer
                                    ) -
                                    1;

                                  const correct =
                                    editFormData.options?.[
                                      answerIndex
                                    ] ||
                                    "";

                                  setEditFormData(
                                    {
                                      ...editFormData,

                                      ansNumber:
                                        newAnswer,

                                      correctAnswer:
                                        correct,
                                    }
                                  );
                                }}
                                className="select-box-premium"
                                style={{
                                  width:
                                    "180px",
                                }}
                              >

                                <option value="1">
                                  Option 1
                                </option>

                                <option value="2">
                                  Option 2
                                </option>

                                <option value="3">
                                  Option 3
                                </option>

                                <option value="4">
                                  Option 4
                                </option>

                              </select>

                            </div>

                          </div>

                        ) : (

                          /* =================================
                             VIEW MODE
                          ================================== */

                          <>

                            <p className="pq-text">

                              {questionText}

                            </p>

                            {/* IMAGE */}

                            {q.imageUrl && (

                              <div className="question-image-preview">

                                <img
                                  src={
                                    q.imageUrl
                                  }
                                  alt="Question Diagram"
                                />

                              </div>

                            )}

                            {/* OPTIONS */}

                            <div className="pq-options">

                              {(q.options ||
                                []
                              ).map(
                                (
                                  opt,
                                  oI
                                ) => (

                                  <div
                                    key={
                                      oI
                                    }
                                    className={`pq-opt ${
                                      q.ansNumber ===
                                      String(
                                        oI +
                                          1
                                      )
                                        ? "correct-opt"
                                        : ""
                                    }`}
                                  >

                                    <span className="opt-num">
                                      (
                                      {oI +
                                        1}
                                      )
                                    </span>

                                    {" "}

                                    {opt ||
                                      "Option unavailable"}

                                  </div>

                                )
                              )}

                            </div>

                          </>

                        )}

                      </div>

                    );
                  }
                )}

              </div>

              {/* PAGINATION */}

              {totalPages > 1 && (

                <div
                  className="pagination-container"
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "center",
                    alignItems:
                      "center",
                    gap:
                      "12px",
                    marginTop:
                      "20px",
                    padding:
                      "10px",
                  }}
                >

                  <button
                    onClick={() =>
                      setCurrentPage(
                        (prev) =>
                          Math.max(
                            prev -
                              1,
                            1
                          )
                      )
                    }
                    disabled={
                      currentPage ===
                      1
                    }
                    className="btn-refresh"
                  >
                    ◀ Previous
                  </button>

                  <span
                    style={{
                      fontWeight:
                        600,
                      fontSize:
                        "14px",
                    }}
                  >
                    Page{" "}
                    {currentPage}{" "}
                    of{" "}
                    {totalPages}
                  </span>

                  <button
                    onClick={() =>
                      setCurrentPage(
                        (prev) =>
                          Math.min(
                            prev +
                              1,
                            totalPages
                          )
                      )
                    }
                    disabled={
                      currentPage ===
                      totalPages
                    }
                    className="btn-refresh"
                  >
                    Next ▶
                  </button>

                </div>

              )}

            </>

          )}

        </div>

      ) : (

        /* =========================================
           MAIN CREATE AREA
        ========================================== */

        <>

          {mode === "bulk" ? (

            <div className="qb-bulk-section animate-fade">

              {/* TITLE + DATE */}

              <div className="qb-grid-2">

                <div className="qb-input-group">

                  <label>
                    📝 Test Title / Exam Name
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Grand Master Mock Test 01"
                    value={
                      publishTestTitle
                    }
                    onChange={(e) =>
                      setPublishTestTitle(
                        e.target.value
                      )
                    }
                    className="input-box-premium"
                  />

                </div>

                <div className="qb-input-group">

                  <label>
                    📅 Exam Date
                  </label>

                  <input
                    type="date"
                    value={
                      publishDate
                    }
                    onChange={(e) =>
                      setPublishDate(
                        e.target.value
                      )
                    }
                    className="input-box-premium"
                  />

                </div>

              </div>

              {/* TEXT */}

              <div className="qb-grid-2 mt-4">

                <div className="qb-input-group">

                  <label>
                    📝 Paste Questions Text Block
                  </label>

                  <textarea
                    rows={8}
                    placeholder="Paste your complete test questions block here..."
                    value={
                      bulkQuestionsText
                    }
                    onChange={(e) =>
                      setBulkQuestionsText(
                        e.target.value
                      )
                    }
                    className="textarea-box-premium"
                  />

                </div>

                <div className="qb-input-group">

                  <label>
                    🔑 Answer Key
                  </label>

                  <textarea
                    rows={8}
                    placeholder="1 3 2 4..."
                    value={
                      bulkAnswersText
                    }
                    onChange={(e) =>
                      setBulkAnswersText(
                        e.target.value
                      )
                    }
                    className="textarea-box-premium"
                  />

                </div>

              </div>

              {/* PARSE */}

              <div className="qb-action-row">

                <button
                  type="button"
                  onClick={
                    processBulkImport
                  }
                  className="btn-primary-glow"
                >
                  ⚡ Auto-Detect & Parse Questions
                </button>

              </div>

              {/* PARSED */}

              {parsedQuestions.length >
                0 && (

                <div className="parsed-preview-container animate-fade">

                  <h3>
                    📋 Parsed Ready Queue (
                    {
                      parsedQuestions.length
                    } Questions)
                  </h3>

                  <div className="qb-save-row">

                    <button
                      type="button"
                      onClick={
                        saveBulkQuestions
                      }
                      disabled={
                        loading
                      }
                      className="btn-success-glow"
                    >
                      {loading
                        ? "⏳ Uploading..."
                        : `💾 Publish ${parsedQuestions.length} Items`}
                    </button>

                  </div>

                </div>

              )}

            </div>

          ) : (

            /* =====================================
               PDF
            ====================================== */

            <div className="qb-pdf-section animate-fade">

              <form
                onSubmit={
                  handlePdfUpload
                }
                className="pdf-form-card premium-form"
              >

                <h3>
                  📄 AI PDF Question Extractor & Publisher
                </h3>

                <p className="pdf-sub">
                  Upload question sheets directly.
                </p>

                <div className="qb-grid-2">

                  <div className="qb-input-group">

                    <label>
                      Select Document File (.PDF)
                    </label>

                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) =>
                        setPdfFile(
                          e.target
                            .files?.[0] ||
                            null
                        )
                      }
                      className="file-input-box-premium"
                    />

                  </div>

                  <div className="qb-input-group">

                    <label>
                      📝 Test Title / Name
                    </label>

                    <input
                      type="text"
                      placeholder="e.g. National Level Mock Test 04"
                      value={
                        publishTestTitle
                      }
                      onChange={(e) =>
                        setPublishTestTitle(
                          e.target.value
                        )
                      }
                      className="input-box-premium"
                    />

                  </div>

                </div>

                <div className="qb-grid-3 mt-3">

                  <div className="qb-input-group">

                    <label>
                      Test Publishing Type
                    </label>

                    <select
                      value={
                        publishTestType
                      }
                      onChange={(e) =>
                        setPublishTestType(
                          e.target
                            .value as
                            | "mock"
                            | "daily"
                        )
                      }
                      className="select-box-premium"
                    >

                      <option value="mock">
                        📝 Mock Test
                      </option>

                      <option value="daily">
                        ⚡ Daily Test
                      </option>

                    </select>

                  </div>

                  <div className="qb-input-group">

                    <label>
                      📅 Scheduled Date
                    </label>

                    <input
                      type="date"
                      value={
                        publishDate
                      }
                      onChange={(e) =>
                        setPublishDate(
                          e.target.value
                        )
                      }
                      className="input-box-premium"
                    />

                  </div>

                  <div className="qb-input-group">

                    <label>
                      ⏰ Exam Start Time
                    </label>

                    <div
                      style={{
                        display:
                          "flex",
                        gap:
                          "6px",
                      }}
                    >

                      <select
                        value={
                          tHour
                        }
                        onChange={(e) =>
                          setTHour(
                            e.target
                              .value
                          )
                        }
                        className="select-box-premium"
                      >

                        {Array.from(
                          {
                            length: 12,
                          },
                          (_, i) =>
                            i + 1
                        ).map(
                          (h) => (
                            <option
                              key={
                                h
                              }
                              value={String(
                                h
                              )}
                            >
                              {h}
                            </option>
                          )
                        )}

                      </select>

                      <select
                        value={
                          tMin
                        }
                        onChange={(e) =>
                          setTMin(
                            e.target
                              .value
                          )
                        }
                        className="select-box-premium"
                      >

                        {[
                          "00",
                          "05",
                          "10",
                          "15",
                          "20",
                          "25",
                          "30",
                          "35",
                          "40",
                          "45",
                          "50",
                          "55",
                        ].map(
                          (m) => (
                            <option
                              key={
                                m
                              }
                              value={
                                m
                              }
                            >
                              {m}
                            </option>
                          )
                        )}

                      </select>

                      <select
                        value={
                          tAmPm
                        }
                        onChange={(e) =>
                          setTAmPm(
                            e.target
                              .value
                          )
                        }
                        className="select-box-premium"
                      >

                        <option value="AM">
                          AM
                        </option>

                        <option value="PM">
                          PM
                        </option>

                      </select>

                    </div>

                  </div>

                </div>

                <div className="qb-action-row mt-4">

                  <button
                    type="submit"
                    disabled={
                      pdfLoading
                    }
                    className="btn-primary-glow"
                  >
                    {pdfLoading
                      ? "⏳ Processing PDF..."
                      : "🚀 Upload & Publish Test"}
                  </button>

                </div>

              </form>

            </div>

          )}

        </>

      )}

    </div>
  );
}