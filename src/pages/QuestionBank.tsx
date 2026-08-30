import React, { useEffect, useMemo, useState } from "react";
import MathKeyboard from "../components/MathKeyboard";
import {
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Image as ImageIcon,
  Table2,
  Columns3,
  Rows3,
  Search,
  Upload,
  CheckCircle2,
  FileText,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Palette,
  Copy,
} from "lucide-react";
import "./QuestionBank.css";

// ============================================================
// TYPES
// ============================================================
interface TableData {
  headers: string[];
  rows: string[][];
  rowColors?: string[];
  columnColors?: string[];
}

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


  publishAt?: string | null;

  isPublished: boolean;

  tableData?: TableData | null;
  tableHeaders?: string[];
  tableRows?: string[][];
}
// ============================================================
// API
// ============================================================
const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api"
    : "https://exammaster-backend-up1y.onrender.com/api";
// ============================================================
// DEFAULT COLORS
// ============================================================

const TABLE_COLORS = [
  "",
  "#eef2ff",
  "#ecfeff",
  "#f0fdf4",
  "#fefce8",
  "#fff7ed",
  "#fdf2f8",
  "#f5f3ff",
  "#f1f5f9",
];

const OPTION_COLORS = [
  "",
  "#eff6ff",
  "#ecfdf5",
  "#fff7ed",
  "#fdf2f8",
  "#f5f3ff",
];

// ============================================================
// DEFAULT QUESTION
// ============================================================
const createEmptyQuestion = (
  lastQuestion: Question | null = null, 
  nextNumber: number = 1, 
  targetSubject: string = "Physics"
): Question => ({
  questionNumber: nextNumber,
  question: "",
  questionImage: "",
  options: ["", "", "", ""],
  correctAnswer: "",

  // Subject & Metadata carry over from previous question automatically
  subject: targetSubject,
  chapter: lastQuestion ? lastQuestion.chapter : "",
  examType: lastQuestion ? lastQuestion.examType : "JEE",
  testCategory: lastQuestion ? lastQuestion.testCategory : "mock",
  className: lastQuestion ? lastQuestion.className : "2nd PUC",

  testTitle: lastQuestion ? lastQuestion.testTitle : "JEE Mains Full Mock Test 1",
  testId: lastQuestion ? lastQuestion.testId : "JEE-MOCK-01",

  marksPerQuestion: lastQuestion ? lastQuestion.marksPerQuestion : 4,
  negativeMarks: lastQuestion ? lastQuestion.negativeMarks : 1,
  durationMinutes: lastQuestion ? lastQuestion.durationMinutes : 180,

  isPublished: false,

  tableData: null,
});

// ============================================================
// MAIN
// ============================================================

export default function QuestionBank() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [inlineEditingId, setInlineEditingId] =
    useState<string | null>(null);

  const [inlineQuestion, setInlineQuestion] =
    useState<Question | null>(null);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedExam, setSelectedExam] = useState("ALL");
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [selectedClassName, setSelectedClassName] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfClassName, setPdfClassName] = useState("2nd PUC");
  const [pdfExamType, setPdfExamType] = useState("JEE");
  const [pdfTestCategory, setPdfTestCategory] = useState("mock");
  const [pdfSubject, setPdfSubject] = useState("Physics");
  const [parsing, setParsing] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState("");
  
const [pdfPublishDate, setPdfPublishDate] = useState("");
const [pdfPublishTime, setPdfPublishTime] = useState("");
const [showTestManagement, setShowTestManagement] =
  useState(false);

  const [formData, setFormData] = useState<Question>(
    createEmptyQuestion()
  );

  const [selectedImageFile, setSelectedImageFile] =
  useState<File | null>(null);

const [imagePreviewUrl, setImagePreviewUrl] =
  useState("");

  // ============================================================
  // DRAG STATE
  // ============================================================


const [dragRowIndex, setDragRowIndex] = useState<number | null>(null);

const [dragColumnIndex, setDragColumnIndex] =
  useState<number | null>(null);

// ============================================================
// TABLE RESIZE STATE
// ============================================================

const [columnWidths, setColumnWidths] =
  useState<number[]>([]);

const [rowHeights, setRowHeights] =
  useState<number[]>([]);

const [resizingColumn, setResizingColumn] =
  useState<number | null>(null);

const [resizingRow, setResizingRow] =
  useState<number | null>(null);
  // ============================================================
// TABLE RESIZE LOGIC
// ============================================================

const startColumnResize = (
  e: React.MouseEvent,
  colIndex: number
) => {
  e.preventDefault();

  setResizingColumn(colIndex);

  const startX = e.clientX;
  const startWidth =
    columnWidths[colIndex] || 150;

  const handleMouseMove = (
    moveEvent: MouseEvent
  ) => {
    const deltaX =
      moveEvent.clientX - startX;

    const newWidth = Math.max(
      80,
      startWidth + deltaX
    );

    setColumnWidths((prev) => {
      const widths = [...prev];

      widths[colIndex] = newWidth;

      return widths;
    });
  };

  const handleMouseUp = () => {
    setResizingColumn(null);

    document.removeEventListener(
      "mousemove",
      handleMouseMove
    );

    document.removeEventListener(
      "mouseup",
      handleMouseUp
    );
  };

  document.addEventListener(
    "mousemove",
    handleMouseMove
  );

  document.addEventListener(
    "mouseup",
    handleMouseUp
  );
};

const startRowResize = (
  e: React.MouseEvent,
  rowIndex: number
) => {
  e.preventDefault();

  setResizingRow(rowIndex);

  const startY = e.clientY;
  const startHeight =
    rowHeights[rowIndex] || 55;

  const handleMouseMove = (
    moveEvent: MouseEvent
  ) => {
    const deltaY =
      moveEvent.clientY - startY;

    const newHeight = Math.max(
      35,
      startHeight + deltaY
    );

    setRowHeights((prev) => {
      const heights = [...prev];

      heights[rowIndex] = newHeight;

      return heights;
    });
  };

  const handleMouseUp = () => {
    setResizingRow(null);

    document.removeEventListener(
      "mousemove",
      handleMouseMove
    );

    document.removeEventListener(
      "mouseup",
      handleMouseUp
    );
  };

  document.addEventListener(
    "mousemove",
    handleMouseMove
  );

  document.addEventListener(
    "mouseup",
    handleMouseUp
  );
};
  // ============================================================
  // TOKEN
  // ============================================================

  const getToken = () => {
    return (
      localStorage.getItem("studentToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("teacherToken") ||
      ""
    );
  };

  // ============================================================
  // FETCH
  // ============================================================

  const fetchQuestions = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/questions`);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setQuestions(data.questions || []);
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error("QUESTION FETCH ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // ============================================================
  // TABLE HELPERS
  // ============================================================

  const createTable = (): TableData => ({
    headers: ["Column 1", "Column 2"],
    rows: [
      ["", ""],
      ["", ""],
    ],
    rowColors: ["", ""],
    columnColors: ["", ""],
  });

  const normalizeTable = (
    table?: TableData | null
  ): TableData | null => {
    if (!table) return null;

    const headers = Array.isArray(table.headers)
      ? [...table.headers]
      : [];

    const rows = Array.isArray(table.rows)
      ? table.rows.map((row) => {
          const copy = [...row];

          while (copy.length < headers.length) {
            copy.push("");
          }

          return copy.slice(0, headers.length);
        })
      : [];

    const rowColors = Array.isArray(table.rowColors)
      ? [...table.rowColors]
      : rows.map(() => "");

    const columnColors = Array.isArray(table.columnColors)
      ? [...table.columnColors]
      : headers.map(() => "");

    while (rowColors.length < rows.length) {
      rowColors.push("");
    }

    while (columnColors.length < headers.length) {
      columnColors.push("");
    }

    return {
      headers,
      rows,
      rowColors: rowColors.slice(0, rows.length),
      columnColors: columnColors.slice(0, headers.length),
    };
  };

  // ============================================================
  // FORM TABLE
  // ============================================================

  const addFormTable = () => {
    setFormData((prev) => ({
      ...prev,
      tableData: createTable(),
    }));
  };

  const removeFormTable = () => {
    setFormData((prev) => ({
      ...prev,
      tableData: null,
    }));
  };

  const updateFormHeader = (
    index: number,
    value: string
  ) => {
    setFormData((prev) => {
      if (!prev.tableData) return prev;

      const headers = [...prev.tableData.headers];
      headers[index] = value;

      return {
        ...prev,
        tableData: {
          ...prev.tableData,
          headers,
        },
      };
    });
  };

  const updateFormCell = (
    rowIndex: number,
    colIndex: number,
    value: string
  ) => {
    setFormData((prev) => {
      if (!prev.tableData) return prev;

      const rows = prev.tableData.rows.map((row) => [...row]);

      if (!rows[rowIndex]) return prev;

      rows[rowIndex][colIndex] = value;

      return {
        ...prev,
        tableData: {
          ...prev.tableData,
          rows,
        },
      };
    });
  };

  const addFormRow = () => {
    setFormData((prev) => {
      if (!prev.tableData) return prev;

      const headers = prev.tableData.headers;

      return {
        ...prev,
        tableData: {
          ...prev.tableData,
          rows: [
            ...prev.tableData.rows,
            headers.map(() => ""),
          ],
          rowColors: [
            ...(prev.tableData.rowColors || []),
            "",
          ],
        },
      };
    });
  };

  const deleteFormRow = (rowIndex: number) => {
    setFormData((prev) => {
      if (!prev.tableData) return prev;

      if (prev.tableData.rows.length <= 1) {
        return prev;
      }

      return {
        ...prev,
        tableData: {
          ...prev.tableData,
          rows: prev.tableData.rows.filter(
            (_, index) => index !== rowIndex
          ),
          rowColors:
            prev.tableData.rowColors?.filter(
              (_, index) => index !== rowIndex
            ),
        },
      };
    });
  };

  const addFormColumn = () => {
    setFormData((prev) => {
      if (!prev.tableData) return prev;

      return {
        ...prev,
        tableData: {
          ...prev.tableData,
          headers: [
            ...prev.tableData.headers,
            `Column ${prev.tableData.headers.length + 1}`,
          ],
          rows: prev.tableData.rows.map((row) => [
            ...row,
            "",
          ]),
          columnColors: [
            ...(prev.tableData.columnColors || []),
            "",
          ],
        },
      };
    });
  };

  const deleteFormColumn = (colIndex: number) => {
    setFormData((prev) => {
      if (!prev.tableData) return prev;

      if (prev.tableData.headers.length <= 1) {
        return prev;
      }

      return {
        ...prev,
        tableData: {
          ...prev.tableData,

          headers:
            prev.tableData.headers.filter(
              (_, index) => index !== colIndex
            ),

          rows: prev.tableData.rows.map((row) =>
            row.filter(
              (_, index) => index !== colIndex
            )
          ),

          columnColors:
            prev.tableData.columnColors?.filter(
              (_, index) => index !== colIndex
            ),
        },
      };
    });
  };

  // ============================================================
  // FORM ROW COLOR
  // ============================================================

  const updateFormRowColor = (
    rowIndex: number,
    color: string
  ) => {
    setFormData((prev) => {
      if (!prev.tableData) return prev;

      const rowColors = [
        ...(prev.tableData.rowColors || []),
      ];

      rowColors[rowIndex] = color;

      return {
        ...prev,
        tableData: {
          ...prev.tableData,
          rowColors,
        },
      };
    });
  };

  // ============================================================
  // FORM COLUMN COLOR
  // ============================================================

  const updateFormColumnColor = (
    colIndex: number,
    color: string
  ) => {
    setFormData((prev) => {
      if (!prev.tableData) return prev;

      const columnColors = [
        ...(prev.tableData.columnColors || []),
      ];

      columnColors[colIndex] = color;

      return {
        ...prev,
        tableData: {
          ...prev.tableData,
          columnColors,
        },
      };
    });
  };

  // ============================================================
  // FORM DRAG ROW
  // ============================================================

  const moveFormRow = (
    from: number,
    to: number
  ) => {
    setFormData((prev) => {
      if (!prev.tableData) return prev;

      if (from === to) return prev;

      const rows = prev.tableData.rows.map((r) => [...r]);

      const [movedRow] = rows.splice(from, 1);

      rows.splice(to, 0, movedRow);

      const rowColors = [
        ...(prev.tableData.rowColors || []),
      ];

      const [movedColor] = rowColors.splice(from, 1);

      rowColors.splice(to, 0, movedColor || "");

      return {
        ...prev,
        tableData: {
          ...prev.tableData,
          rows,
          rowColors,
        },
      };
    });
  };

  // ============================================================
  // FORM DRAG COLUMN
  // ============================================================

  const moveFormColumn = (
    from: number,
    to: number
  ) => {
    setFormData((prev) => {
      if (!prev.tableData) return prev;

      if (from === to) return prev;

      const headers = [...prev.tableData.headers];

      const [movedHeader] = headers.splice(from, 1);

      headers.splice(to, 0, movedHeader);

      const rows = prev.tableData.rows.map((row) => {
        const copy = [...row];

        const [movedCell] = copy.splice(from, 1);

        copy.splice(to, 0, movedCell);

        return copy;
      });

      const columnColors = [
        ...(prev.tableData.columnColors || []),
      ];

      const [movedColor] =
        columnColors.splice(from, 1);

      columnColors.splice(to, 0, movedColor || "");

      return {
        ...prev,
        tableData: {
          ...prev.tableData,
          headers,
          rows,
          columnColors,
        },
      };
    });
  };

  // ============================================================
  // INLINE TABLE
  // ============================================================

  const addInlineTable = () => {
    setInlineQuestion((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        tableData: createTable(),
      };
    });
  };

  const removeInlineTable = () => {
    setInlineQuestion((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        tableData: null,
      };
    });
  };

  const updateInlineHeader = (
    colIndex: number,
    value: string
  ) => {
    setInlineQuestion((prev) => {
      if (!prev?.tableData) return prev;

      const headers = [...prev.tableData.headers];

      headers[colIndex] = value;

      return {
        ...prev,
        tableData: {
          ...prev.tableData,
          headers,
        },
      };
    });
  };

  const updateInlineCell = (
    rowIndex: number,
    colIndex: number,
    value: string
  ) => {
    setInlineQuestion((prev) => {
      if (!prev?.tableData) return prev;

      const rows = prev.tableData.rows.map((row) => [
        ...row,
      ]);

      if (!rows[rowIndex]) return prev;

      rows[rowIndex][colIndex] = value;

      return {
        ...prev,
        tableData: {
          ...prev.tableData,
          rows,
        },
      };
    });
  };

  const addInlineRow = () => {
    setInlineQuestion((prev) => {
      if (!prev?.tableData) return prev;

      return {
        ...prev,
        tableData: {
          ...prev.tableData,
          rows: [
            ...prev.tableData.rows,
            prev.tableData.headers.map(() => ""),
          ],
          rowColors: [
            ...(prev.tableData.rowColors || []),
            "",
          ],
        },
      };
    });
  };

  const deleteInlineRow = (
    rowIndex: number
  ) => {
    setInlineQuestion((prev) => {
      if (!prev?.tableData) return prev;

      if (prev.tableData.rows.length <= 1) {
        return prev;
      }

      return {
        ...prev,
        tableData: {
          ...prev.tableData,

          rows: prev.tableData.rows.filter(
            (_, index) => index !== rowIndex
          ),

          rowColors:
            prev.tableData.rowColors?.filter(
              (_, index) => index !== rowIndex
            ),
        },
      };
    });
  };

  const addInlineColumn = () => {
    setInlineQuestion((prev) => {
      if (!prev?.tableData) return prev;

      return {
        ...prev,

        tableData: {
          ...prev.tableData,

          headers: [
            ...prev.tableData.headers,
            `Column ${prev.tableData.headers.length + 1}`,
          ],

          rows: prev.tableData.rows.map((row) => [
            ...row,
            "",
          ]),

          columnColors: [
            ...(prev.tableData.columnColors || []),
            "",
          ],
        },
      };
    });
  };

  const deleteInlineColumn = (
    colIndex: number
  ) => {
    setInlineQuestion((prev) => {
      if (!prev?.tableData) return prev;

      if (prev.tableData.headers.length <= 1) {
        return prev;
      }

      return {
        ...prev,

        tableData: {
          ...prev.tableData,

          headers:
            prev.tableData.headers.filter(
              (_, index) => index !== colIndex
            ),

          rows: prev.tableData.rows.map((row) =>
            row.filter(
              (_, index) => index !== colIndex
            )
          ),

          columnColors:
            prev.tableData.columnColors?.filter(
              (_, index) => index !== colIndex
            ),
        },
      };
    });
  };

  // ============================================================
  // INLINE COLORS
  // ============================================================

  const updateInlineRowColor = (
    rowIndex: number,
    color: string
  ) => {
    setInlineQuestion((prev) => {
      if (!prev?.tableData) return prev;

      const rowColors = [
        ...(prev.tableData.rowColors || []),
      ];

      rowColors[rowIndex] = color;

      return {
        ...prev,
        tableData: {
          ...prev.tableData,
          rowColors,
        },
      };
    });
  };

  const updateInlineColumnColor = (
    colIndex: number,
    color: string
  ) => {
    setInlineQuestion((prev) => {
      if (!prev?.tableData) return prev;

      const columnColors = [
        ...(prev.tableData.columnColors || []),
      ];

      columnColors[colIndex] = color;

      return {
        ...prev,
        tableData: {
          ...prev.tableData,
          columnColors,
        },
      };
    });
  };

  // ============================================================
  // INLINE MOVE ROW
  // ============================================================

  const moveInlineRow = (
    from: number,
    to: number
  ) => {
    setInlineQuestion((prev) => {
      if (!prev?.tableData) return prev;

      if (from === to) return prev;

      const rows = prev.tableData.rows.map((r) => [
        ...r,
      ]);

      const [movedRow] = rows.splice(from, 1);

      rows.splice(to, 0, movedRow);

      const rowColors = [
        ...(prev.tableData.rowColors || []),
      ];

      const [movedColor] =
        rowColors.splice(from, 1);

      rowColors.splice(to, 0, movedColor || "");

      return {
        ...prev,
        tableData: {
          ...prev.tableData,
          rows,
          rowColors,
        },
      };
    });
  };

  // ============================================================
  // INLINE MOVE COLUMN
  // ============================================================

  const moveInlineColumn = (
    from: number,
    to: number
  ) => {
    setInlineQuestion((prev) => {
      if (!prev?.tableData) return prev;

      if (from === to) return prev;

      const headers = [
        ...prev.tableData.headers,
      ];

      const [movedHeader] =
        headers.splice(from, 1);

      headers.splice(to, 0, movedHeader);

      const rows = prev.tableData.rows.map(
        (row) => {
          const copy = [...row];

          const [movedCell] =
            copy.splice(from, 1);

          copy.splice(to, 0, movedCell);

          return copy;
        }
      );

      const columnColors = [
        ...(prev.tableData.columnColors || []),
      ];

      const [movedColor] =
        columnColors.splice(from, 1);

      columnColors.splice(
        to,
        0,
        movedColor || ""
      );

      return {
        ...prev,
        tableData: {
          ...prev.tableData,
          headers,
          rows,
          columnColors,
        },
      };
    });
  };

  // ============================================================
  // OPTION COLOR STATE
  // ============================================================

  const [formOptionColors, setFormOptionColors] =
    useState<string[]>(["", "", "", ""]);

  const [inlineOptionColors, setInlineOptionColors] =
    useState<string[]>(["", "", "", ""]);

  // ============================================================
  // FORM OPTION
  // ============================================================

  const handleOptionChange = (
    index: number,
    value: string
  ) => {
    setFormData((prev) => {
      const options = [...prev.options];

      options[index] = value;

      return {
        ...prev,
        options,
      };
    });
  };

  // ============================================================
  // IMAGE
  // ============================================================
const updateQuestionImage = (value: string) => {
  setFormData((prev) => ({
    ...prev,
    questionImage: value,
    imageUrl: value,
  }));
};
  // ============================================================
  // SUBMIT
  // ============================================================
      const handleSubmit = async (
  e: React.FormEvent
) => {
  e.preventDefault();

  const token = getToken();

  try {
    let url = `${API_BASE_URL}/questions`;
    let method = "POST";

    if (editingId) {
      url = `${API_BASE_URL}/questions/${editingId}`;
      method = "PUT";
    }

    // ========================================================
    // CREATE FORMDATA
    // ========================================================

    const data = new FormData();

    // ========================================================
    // NORMAL FORM FIELDS
    // ========================================================

    Object.entries(formData).forEach(
      ([key, value]) => {
        // These fields are handled separately
        if (
          key === "questionImage" ||
          key === "imageUrl" ||
          key === "options" ||
          key === "tableData" ||
          key === "tableHeaders" ||
          key === "tableRows"
        ) {
          return;
        }

        if (
          value !== undefined &&
          value !== null
        ) {
          data.append(
            key,
            String(value)
          );
        }
      }
    );

    // ========================================================
    // OPTIONS
    // ========================================================

    data.append(
      "options",
      JSON.stringify(
        formData.options || []
      )
    );

    // ========================================================
    // TABLE HEADERS
    // ========================================================

    data.append(
      "tableHeaders",
      JSON.stringify(
        formData.tableHeaders || []
      )
    );

    // ========================================================
    // TABLE ROWS
    // ========================================================

    data.append(
      "tableRows",
      JSON.stringify(
        formData.tableRows || []
      )
    );

    // ========================================================
    // TABLE DATA
    // ========================================================

    data.append(
      "tableData",
      JSON.stringify(
        normalizeTable(
          formData.tableData
        )
      )
    );

    // ========================================================
    // OPTION COLORS
    // ========================================================

    data.append(
      "optionColors",
      JSON.stringify(
        formOptionColors
      )
    );

    // ========================================================
    // IMAGE FILE
    // ========================================================

    if (selectedImageFile) {
      data.append(
        "questionImage",
        selectedImageFile
      );
    }

    // ========================================================
    // IMAGE URL
    // ========================================================

    // If user pasted an external URL instead of uploading
    // a local image, send that URL.
    if (
      !selectedImageFile &&
      formData.questionImage &&
      !formData.questionImage.startsWith(
        "blob:"
      )
    ) {
      data.append(
        "imageUrl",
        formData.questionImage
      );
    }

    // ========================================================
    // API REQUEST
    // ========================================================

    const response = await fetch(url, {
      method,

      headers: {
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },

      body: data,
    });

    const result =
      await response.json();

    // ========================================================
    // SUCCESS
    // ========================================================

    if (response.ok) {
      alert(
        editingId
          ? "Question updated successfully!"
          : "Question added successfully as Draft!"
      );

      resetForm();

      setSelectedImageFile(null);
      setImagePreviewUrl("");

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

  const handleEdit = (q: Question) => {
    setEditingId(q._id || null);

    setFormData({
      ...createEmptyQuestion(),

      ...q,

      options:
        q.options?.length === 4
          ? [...q.options]
          : ["", "", "", ""],

      tableData: normalizeTable(
        q.tableData
      ),
    });

    setFormOptionColors(
      (q as any).optionColors || [
        "",
        "",
        "",
        "",
      ]
    );

    setShowAddForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ============================================================
  // INLINE EDIT
  // ============================================================

  const startInlineEdit = (
    q: Question
  ) => {
    setInlineEditingId(q._id || null);

    setInlineQuestion({
      ...q,

      options:
        q.options?.length === 4
          ? [...q.options]
          : ["", "", "", ""],

      tableData: normalizeTable(
        q.tableData
      ),
    });

    setInlineOptionColors(
      (q as any).optionColors || [
        "",
        "",
        "",
        "",
      ]
    );
  };

  const cancelInlineEdit = () => {
    setInlineEditingId(null);
    setInlineQuestion(null);
  };

  // ============================================================
  // INLINE FIELD
  // ============================================================

  const updateInlineField = (
    field: keyof Question,
    value: any
  ) => {
    setInlineQuestion((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const updateInlineOption = (
    index: number,
    value: string
  ) => {
    setInlineQuestion((prev) => {
      if (!prev) return prev;

      const options = [...prev.options];

      options[index] = value;

      return {
        ...prev,
        options,
      };
    });
  };

  // ============================================================
  // SAVE INLINE
  // ============================================================

  const saveInlineEdit = async () => {
    if (!inlineEditingId || !inlineQuestion) {
      return;
    }

    const token = getToken();

    try {
      const response = await fetch(
        `${API_BASE_URL}/questions/${inlineEditingId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",

            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },

          body: JSON.stringify({
            ...inlineQuestion,

            tableData: normalizeTable(
              inlineQuestion.tableData
            ),

            optionColors: inlineOptionColors,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(
          result.message ||
            result.error ||
            "Failed to update question"
        );

        return;
      }

      setQuestions((prev) =>
        prev.map((q) =>
          q._id === inlineEditingId
            ? {
                ...q,
                ...inlineQuestion,
                tableData: normalizeTable(
                  inlineQuestion.tableData
                ),
              }
            : q
        )
      );

      alert("Question saved successfully!");

      cancelInlineEdit();
    } catch (error) {
      console.error(
        "INLINE UPDATE ERROR:",
        error
      );

      alert("Unable to save question.");
    }
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

      const response = await fetch(
        `${API_BASE_URL}/questions/${id}`,
        {
          method: "DELETE",

          headers: {
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        setQuestions((prev) =>
          prev.filter(
            (q) => q._id !== id
          )
        );

        alert(
          result.message ||
            "Question deleted successfully!"
        );
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
// PUBLISH ONE TEST
// ============================================================

const handlePublishTest = async (
  testId: string
) => {
  if (!testId) {
    alert("Test ID is required.");
    return;
  }

  const testQuestions = questions.filter(
    (q) => q.testId === testId
  );

  if (testQuestions.length === 0) {
    alert(
      "No questions found for this Test ID."
    );
    return;
  }

  const firstQuestion = testQuestions[0];

  // ==========================================================
  // FUTURE MOCK TEST CHECK
  // ==========================================================

  if (
    firstQuestion.testCategory === "mock" &&
    (firstQuestion as any).publishAt
  ) {
    const publishAt = new Date(
      (firstQuestion as any).publishAt
    );

    if (
      !Number.isNaN(
        publishAt.getTime()
      ) &&
      publishAt.getTime() > Date.now()
    ) {
      alert(
        `This Mock Test is scheduled for ${publishAt.toLocaleString()} and cannot be published yet.`
      );
      return;
    }
  }

  // ==========================================================
  // CONFIRM
  // ==========================================================

  const confirmed = window.confirm(
    `Publish all ${testQuestions.length} questions of Test ID "${testId}"?`
  );

  if (!confirmed) {
    return;
  }

  // ==========================================================
  // API
  // ==========================================================

  try {
    const token = getToken();

    const response = await fetch(
      `${API_BASE_URL}/questions/publish-all`,
      {
        method: "PUT",

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

        body: JSON.stringify({
          testId,
        }),
      }
    );

    const result =
      await response.json();

    if (!response.ok) {
      alert(
        result.message ||
          "Failed to publish test."
      );
      return;
    }

    alert(
      result.message ||
        "Test published successfully!"
    );

    await fetchQuestions();
  } catch (error) {
    console.error(
      "PUBLISH TEST ERROR:",
      error
    );

    alert(
      "Unable to publish test."
    );
  }
};


// ============================================================
// PUBLISH ALL TESTS
// ============================================================

const handlePublishAll = async () => {
  // ==========================================================
  // GET UNIQUE TEST IDS
  // ==========================================================

  const testIds = Array.from(
    new Set(
      filteredQuestions
        .map((q) => q.testId)
        .filter(Boolean)
    )
  );

  if (testIds.length === 0) {
    alert(
      "No tests available to publish."
    );
    return;
  }

  // ==========================================================
  // FIND PUBLISHABLE TESTS
  // ==========================================================

  const publishableTestIds: string[] = [];
  const scheduledTestIds: string[] = [];
  const alreadyPublishedIds: string[] = [];

  testIds.forEach((testId) => {
    const testQuestions =
      filteredQuestions.filter(
        (q) => q.testId === testId
      );

    if (testQuestions.length === 0) {
      return;
    }

    const firstQuestion =
      testQuestions[0];

    // --------------------------------------------------------
    // ALREADY PUBLISHED
    // --------------------------------------------------------

    const allPublished =
      testQuestions.every(
        (q) => q.isPublished
      );

    if (allPublished) {
      alreadyPublishedIds.push(
        testId
      );
      return;
    }

    // --------------------------------------------------------
    // FUTURE MOCK TEST
    // --------------------------------------------------------

    if (
      firstQuestion.testCategory ===
        "mock" &&
      (firstQuestion as any).publishAt
    ) {
      const publishAt = new Date(
        (firstQuestion as any).publishAt
      );

      if (
        !Number.isNaN(
          publishAt.getTime()
        ) &&
        publishAt.getTime() >
          Date.now()
      ) {
        scheduledTestIds.push(
          testId
        );
        return;
      }
    }

    // --------------------------------------------------------
    // READY TO PUBLISH
    // --------------------------------------------------------

    publishableTestIds.push(
      testId
    );
  });

  // ==========================================================
  // NOTHING TO PUBLISH
  // ==========================================================

  if (
    publishableTestIds.length === 0
  ) {
    let message =
      "No tests are ready to publish.";

    if (
      scheduledTestIds.length > 0
    ) {
      message +=
        `\n\nScheduled Mock Tests skipped:\n${scheduledTestIds.join(
          "\n"
        )}`;
    }

    if (
      alreadyPublishedIds.length > 0
    ) {
      message +=
        `\n\nAlready Published:\n${alreadyPublishedIds.join(
          "\n"
        )}`;
    }

    alert(message);
    return;
  }

  // ==========================================================
  // CONFIRM
  // ==========================================================

  let confirmMessage =
    `Publish ${publishableTestIds.length} test(s)?\n\n`;

  confirmMessage +=
    publishableTestIds.join("\n");

  if (
    scheduledTestIds.length > 0
  ) {
    confirmMessage +=
      `\n\nScheduled Mock Tests will be skipped:\n${scheduledTestIds.join(
        "\n"
      )}`;
  }

  const confirmed =
    window.confirm(
      confirmMessage
    );

  if (!confirmed) {
    return;
  }

  // ==========================================================
  // PUBLISH TESTS ONE BY ONE
  // ==========================================================

  try {
    const token = getToken();

    let successCount = 0;
    const failedTests: string[] = [];

    for (
      const testId of publishableTestIds
    ) {
      try {
        const response =
          await fetch(
            `${API_BASE_URL}/questions/publish-all`,
            {
              method: "PUT",

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

              body: JSON.stringify({
                testId,
              }),
            }
          );

        if (response.ok) {
          successCount++;
        } else {
          failedTests.push(
            testId
          );
        }
      } catch {
        failedTests.push(
          testId
        );
      }
    }

    // ========================================================
    // FINAL MESSAGE
    // ========================================================

    let message =
      `Successfully published ${successCount} test(s).`;

    if (
      scheduledTestIds.length > 0
    ) {
      message +=
        `\n\nScheduled Mock Tests skipped: ${scheduledTestIds.length}.`;
    }

    if (
      alreadyPublishedIds.length > 0
    ) {
      message +=
        `\nAlready Published: ${alreadyPublishedIds.length}.`;
    }

    if (
      failedTests.length > 0
    ) {
      message +=
        `\nFailed: ${failedTests.join(
          ", "
        )}`;
    }

    alert(message);

    await fetchQuestions();
  } catch (error) {
    console.error(
      "PUBLISH ALL ERROR:",
      error
    );

    alert(
      "Unable to publish tests."
    );
  }
};



// ============================================================
// DELETE ONE TEST
// ============================================================

const handleDeleteTest = async (
  testId: string
) => {
  // ======================================================
  // TEST ID REQUIRED
  // ======================================================

  if (!testId) {
    alert(
      "Please select a Test ID to delete."
    );
    return;
  }

  // ======================================================
  // FIND QUESTIONS FOR THIS TEST
  // ======================================================

  const testQuestions = questions.filter(
    (q) => q.testId === testId
  );

  if (testQuestions.length === 0) {
    alert(
      "No questions found for this Test ID."
    );
    return;
  }

  // ======================================================
  // TEST INFO
  // ======================================================

  const firstQuestion =
    testQuestions[0];

  const testTitle =
    firstQuestion.testTitle ||
    "Untitled Test";

  const testCategory =
    firstQuestion.testCategory ||
    "";

  const subject =
    firstQuestion.subject ||
    "";

  // ======================================================
  // CONFIRM
  // ======================================================

  const confirmed = window.confirm(
    `WARNING!\n\n` +
      `Delete this complete test permanently?\n\n` +
      `Test: ${testTitle}\n` +
      `Test ID: ${testId}\n` +
      `Category: ${testCategory}\n` +
      `Subject: ${subject}\n` +
      `Questions: ${testQuestions.length}\n\n` +
      `This action cannot be undone.`
  );

  if (!confirmed) {
    return;
  }

  // ======================================================
  // DELETE API
  // ======================================================

  try {
    const token = getToken();

    const response = await fetch(
      `${API_BASE_URL}/questions/delete-all`,
      {
        method: "DELETE",

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

        body: JSON.stringify({
          testId,
        }),
      }
    );

    const result =
      await response.json();

    // ====================================================
    // SUCCESS
    // ====================================================

    if (response.ok) {
      alert(
        result.message ||
          `Test "${testId}" deleted successfully!`
      );

      setQuestions((prev) =>
        prev.filter(
          (q) => q.testId !== testId
        )
      );

      // Close any open inline editor
      if (inlineQuestion?.testId === testId) {
        cancelInlineEdit();
      }

      // Remove expanded state
      setExpandedId(null);
    } else {
      alert(
        result.message ||
          "Failed to delete test questions."
      );
    }
  } catch (error) {
    console.error(
      "DELETE TEST ERROR:",
      error
    );

    alert(
      "Unable to delete test questions."
    );
  }
};


// ============================================================
// DELETE ALL VISIBLE TESTS
// ============================================================

const handleDeleteAll = async () => {
  // ======================================================
  // GET UNIQUE TEST IDS
  // ======================================================

  const testIds = Array.from(
    new Set(
      filteredQuestions
        .map(
          (q) => q.testId
        )
        .filter(Boolean)
    )
  );

  if (testIds.length === 0) {
    alert(
      "No tests available to delete."
    );
    return;
  }

  // ======================================================
  // CONFIRM
  // ======================================================

  const confirmed = window.confirm(
    `WARNING!\n\n` +
      `This will permanently delete ALL ${testIds.length} visible test(s).\n\n` +
      `Every question belonging to these tests will be deleted.\n\n` +
      `This action cannot be undone.\n\n` +
      `Continue?`
  );

  if (!confirmed) {
    return;
  }

  // ======================================================
  // DELETE TESTS ONE BY ONE
  // ======================================================

  try {
    const token = getToken();

    let successCount = 0;
    let deletedQuestions = 0;

    const failedTests: string[] = [];

    for (
      const testId of testIds
    ) {
      try {
        const response =
          await fetch(
            `${API_BASE_URL}/questions/delete-all`,
            {
              method: "DELETE",

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

              body: JSON.stringify({
                testId,
              }),
            }
          );

        const result =
          await response.json();

        if (response.ok) {
          successCount++;

          deletedQuestions +=
            Number(
              result.deletedCount || 0
            );
        } else {
          failedTests.push(
            testId
          );
        }
      } catch (error) {
        console.error(
          `DELETE ERROR FOR ${testId}:`,
          error
        );

        failedTests.push(
          testId
        );
      }
    }

    // ======================================================
    // REFRESH DATA
    // ======================================================

    await fetchQuestions();

    // ======================================================
    // FINAL MESSAGE
    // ======================================================

    let message =
      `Successfully deleted ${successCount} test(s).`;

    if (
      deletedQuestions > 0
    ) {
      message +=
        `\nQuestions deleted: ${deletedQuestions}.`;
    }

    if (
      failedTests.length > 0
    ) {
      message +=
        `\n\nFailed tests:\n${failedTests.join(
          "\n"
        )}`;
    }

    alert(message);

    // Reset editor state if needed
    setExpandedId(null);
    cancelInlineEdit();

  } catch (error) {
    console.error(
      "DELETE ALL ERROR:",
      error
    );

    alert(
      "Unable to delete tests."
    );
  }
};


  // ============================================================
  // PDF
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

  if (!pdfSubject) {
    alert(
      "Please select a subject first!"
    );
    return;
  }

  // ======================================================
  // MOCK TEST SCHEDULE VALIDATION
  // ======================================================

  if (
    pdfTestCategory === "mock" &&
    (!pdfPublishDate ||
      !pdfPublishTime)
  ) {
    alert(
      "Please select Mock Test publish date and time."
    );
    return;
  }

  setParsing(true);

  try {
    const token = getToken();

    const data = new FormData();

    // ======================================================
    // PDF FILE
    // ======================================================

    data.append(
      "pdfFile",
      pdfFile
    );

    // ======================================================
    // CLASS
    // ======================================================

    data.append(
      "academicYear",
      pdfClassName
    );

    data.append(
      "className",
      pdfClassName
    );

    // ======================================================
    // EXAM TYPE
    // ======================================================

    data.append(
      "examType",
      pdfExamType
    );

    // ======================================================
    // TEST CATEGORY
    // ======================================================

    data.append(
      "testCategory",
      pdfTestCategory
    );

    // ======================================================
    // SUBJECT
    // ======================================================

    data.append(
      "subject",
      pdfSubject
    );

    // ======================================================
    // MOCK TEST PUBLISH DATE / TIME
    // ======================================================

    if (
      pdfTestCategory === "mock"
    ) {
      data.append(
        "publishDate",
        pdfPublishDate
      );

      data.append(
        "publishTime",
        pdfPublishTime
      );
    } else {
      // Daily / Subject
      data.append(
        "publishDate",
        ""
      );

      data.append(
        "publishTime",
        ""
      );
    }

    // ======================================================
    // API REQUEST
    // ======================================================

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

    // ======================================================
    // SUCCESS
    // ======================================================

    if (response.ok) {
      const count =
        result.parsedQuestions ??
        result.count ??
        result.questions?.length ??
        0;

      alert(
        `PDF processed successfully!\n\nQuestions Parsed: ${count}`
      );

      setShowPdfModal(false);
      setPdfFile(null);
      setPdfSubject("");
      setPdfPublishDate("");
      setPdfPublishTime("");

      await fetchQuestions();
    } else {
      alert(
        result.message ||
          result.error ||
          "Failed to parse PDF"
      );
    }
  } catch (error) {
    console.error(
      "PDF ERROR:",
      error
    );

    alert(
      "PDF upload failed. Check backend server."
    );
  } finally {
    setParsing(false);
  }
};


  // ============================================================
  // NEW / DUPLICATE QUESTION
  // ============================================================

  const getNextQuestionNumber = () => {
    if (!questions.length) return 1;
    return Math.max(...questions.map(q => Number(q.questionNumber) || 0)) + 1;
  };

  const startNewQuestion = () => {
    const nextNumber = getNextQuestionNumber();
    const lastQuestion = questions[questions.length - 1] || null;

    setEditingId(null);
    setFormData(
      createEmptyQuestion(
        lastQuestion,
        nextNumber,
        lastQuestion?.subject || "Physics"
      )
    );
    setFormOptionColors(["", "", "", ""]);
    setSelectedImageFile(null);
    setImagePreviewUrl("");
    setShowAddForm(true);

    window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 0);
  };

  const duplicateQuestion = (q: Question) => {
    const copy: Question = {
      ...q,
      _id: undefined,
      questionNumber: getNextQuestionNumber(),
      isPublished: false,
      questionImage: q.questionImage || "",
      options: q.options?.length === 4 ? [...q.options] : ["", "", "", ""],
      tableData: normalizeTable(q.tableData),
    };

    setEditingId(null);
    setFormData(copy);
    setFormOptionColors(
      (q as any).optionColors || ["", "", "", ""]
    );
    setSelectedImageFile(null);
    setImagePreviewUrl(q.questionImage || "");
    setShowAddForm(true);

    window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 0);
  };

  // ============================================================
  // RESET
  // ============================================================

  const resetForm = () => {
    setEditingId(null);
    setShowAddForm(false);

    setFormData(
      createEmptyQuestion()
    );

    setFormOptionColors([
      "",
      "",
      "",
      "",
    ]);
  };

  // ============================================================
  // FILTER
  // ============================================================
   // ============================================================
// FILTER + SEARCH
// ============================================================

const filteredQuestions = useMemo(() => {
  const search = searchTerm.toLowerCase().trim();

  return questions.filter((q) => {
    // --------------------------------------------------------
    // TABS
    // --------------------------------------------------------
    const matchesTab =
      activeTab === "ALL" ||
      q.testCategory === activeTab;

    // --------------------------------------------------------
    // EXAM
    // --------------------------------------------------------
    const matchesExam =
      selectedExam === "ALL" ||
      q.examType === selectedExam;

    // --------------------------------------------------------
    // SUBJECT
    // --------------------------------------------------------
    const matchesSubject =
      selectedSubject === "ALL" ||
      q.subject === selectedSubject;

    // --------------------------------------------------------
    // CLASS
    // --------------------------------------------------------
    const matchesClass =
      selectedClassName === "ALL" ||
      q.className === selectedClassName;

    // --------------------------------------------------------
    // SEARCH
    // --------------------------------------------------------

    if (!search) {
      return (
        matchesTab &&
        matchesExam &&
        matchesSubject &&
        matchesClass
      );
    }

    // Question Number
    const questionNumber =
      String(q.questionNumber ?? "").toLowerCase();

    // Question text
    const questionText =
      String(q.question ?? "").toLowerCase();

    // Chapter
    const chapter =
      String(q.chapter ?? "").toLowerCase();

    // Test title
    const testTitle =
      String(q.testTitle ?? "").toLowerCase();

    // Test ID
    const testId =
      String(q.testId ?? "").toLowerCase();

    // Subject
    const subject =
      String(q.subject ?? "").toLowerCase();

    // Exam
    const examType =
      String(q.examType ?? "").toLowerCase();

    // Class
    const className =
      String(q.className ?? "").toLowerCase();

    // Category
    const testCategory =
      String(q.testCategory ?? "").toLowerCase();

    const matchesSearch =
      questionNumber.includes(search) ||
      questionText.includes(search) ||
      chapter.includes(search) ||
      testTitle.includes(search) ||
      testId.includes(search) ||
      subject.includes(search) ||
      examType.includes(search) ||
      className.includes(search) ||
      testCategory.includes(search);

    return (
      matchesTab &&
      matchesExam &&
      matchesSubject &&
      matchesClass &&
      matchesSearch
    );
  });
}, [
  questions,
  activeTab,
  selectedExam,
  selectedSubject,
  selectedClassName,
  searchTerm,
]);
// ============================================================
// TABLE RENDER
// ============================================================

const renderTable = (
  table: TableData,
  editable: boolean,
  question?: Question
) => {
  if (!table?.headers?.length) {
    return null;
  }

  const rowColors = table.rowColors || [];
  const columnColors = table.columnColors || [];

  const isInline =
    !!question && question === inlineQuestion;

  return (
    <div className="qb-table-wrapper">

      {/* ======================================================
          TABLE TOOLBAR
      ====================================================== */}

      <div className="qb-table-toolbar">

        <div className="qb-table-title">
          <Table2 size={17} />

          <span>Question Table</span>

          {editable && (
            <small>
              Drag rows / columns
            </small>
          )}
        </div>

        {editable && (
          <div className="qb-table-actions">

            <button
              type="button"
              onClick={
                isInline
                  ? addInlineRow
                  : addFormRow
              }
            >
              <Rows3 size={15} />
              Add Row
            </button>

            <button
              type="button"
              onClick={
                isInline
                  ? addInlineColumn
                  : addFormColumn
              }
            >
              <Columns3 size={15} />
              Add Column
            </button>

            <button
              type="button"
              className="danger-light"
              onClick={
                isInline
                  ? removeInlineTable
                  : removeFormTable
              }
            >
              <Trash2 size={15} />
              Remove
            </button>

          </div>
        )}

      </div>

      {/* ======================================================
          TABLE SCROLL
      ====================================================== */}

      <div className="qb-table-scroll">

        <table
          className="qb-question-table"
          style={{
            tableLayout: "fixed",
            width: "max-content",
            minWidth: "100%",
          }}
        >

          {/* ==================================================
              COLUMN WIDTHS
          ================================================== */}

          <colgroup>

            {editable && (
              <col
                style={{
                  width: "52px",
                }}
              />
            )}

            {table.headers.map(
              (_, colIndex) => (
                <col
                  key={colIndex}
                  style={{
                    width: `${
                      columnWidths[colIndex] || 180
                    }px`,
                    minWidth: "80px",
                  }}
                />
              )
            )}

          </colgroup>

          {/* ==================================================
              HEADER
          ================================================== */}

          <thead>

            <tr>

              {editable && (
                <th className="qb-drag-head">
                  <GripVertical size={15} />
                </th>
              )}

              {table.headers.map(
                (header, colIndex) => (

                  <th
                    key={colIndex}
                    draggable={editable}
                    style={{
                      background:
                        columnColors[colIndex] ||
                        undefined,

                      width: `${
                        columnWidths[colIndex] || 180
                      }px`,

                      position: "relative",
                    }}

                    onDragStart={() => {
                      if (editable) {
                        setDragColumnIndex(
                          colIndex
                        );
                      }
                    }}

                    onDragOver={(e) => {
                      if (editable) {
                        e.preventDefault();
                      }
                    }}

                    onDrop={() => {

                      if (
                        editable &&
                        dragColumnIndex !== null &&
                        dragColumnIndex !== colIndex
                      ) {

                        if (isInline) {

                          moveInlineColumn(
                            dragColumnIndex,
                            colIndex
                          );

                        } else {

                          moveFormColumn(
                            dragColumnIndex,
                            colIndex
                          );

                        }

                        setDragColumnIndex(null);
                      }

                    }}
                  >

                    {editable ? (

                      <div className="qb-table-header-edit">

                        {/* COLUMN DRAG */}

                        <GripVertical
                          size={14}
                          className="drag-handle"
                        />

                        {/* HEADER INPUT */}

                        <input
              data-math-input="true"
                          value={header}
                          onChange={(e) =>
                            isInline
                              ? updateInlineHeader(
                                  colIndex,
                                  e.target.value
                                )
                              : updateFormHeader(
                                  colIndex,
                                  e.target.value
                                )
                          }
                        />

                        {/* COLUMN COLOR */}

                        <label
                          className="qb-color-picker"
                          title="Column color"
                        >
                          <Palette size={13} />

                          <input
              data-math-input="true"
                            type="color"
                            value={
                              columnColors[
                                colIndex
                              ] || "#ffffff"
                            }
                            onChange={(e) =>
                              isInline
                                ? updateInlineColumnColor(
                                    colIndex,
                                    e.target.value
                                  )
                                : updateFormColumnColor(
                                    colIndex,
                                    e.target.value
                                  )
                            }
                          />
                        </label>

                        {/* DELETE COLUMN */}

                        <button
                          type="button"
                          title="Delete column"
                          onClick={(e) => {

                            e.stopPropagation();

                            if (isInline) {

                              deleteInlineColumn(
                                colIndex
                              );

                            } else {

                              deleteFormColumn(
                                colIndex
                              );

                            }

                          }}
                        >
                          <X size={13} />
                        </button>

                        {/* COLUMN RESIZE */}

                        <span
                          className="qb-column-resize-handle"
                          title="Drag to resize column"

                          onMouseDown={(e) => {

                            e.preventDefault();
                            e.stopPropagation();

                            startColumnResize(
                              e,
                              colIndex
                            );

                          }}

                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        />

                      </div>

                    ) : (

                      <div className="qb-table-header-view">
                        {header}
                      </div>

                    )}

                  </th>

                )
              )}

            </tr>

          </thead>

          {/* ==================================================
              BODY
          ================================================== */}

          <tbody>

            {table.rows.map(
              (row, rowIndex) => {

                const rowColor =
                  rowColors[rowIndex] || "";

                return (

                  <tr
                    key={rowIndex}
                    draggable={editable}

                    style={{
                      background:
                        rowColor || undefined,

                      height: `${
                        rowHeights[rowIndex] || 52
                      }px`,
                    }}

                    onDragStart={() => {

                      if (editable) {
                        setDragRowIndex(
                          rowIndex
                        );
                      }

                    }}

                    onDragOver={(e) => {

                      if (editable) {
                        e.preventDefault();
                      }

                    }}

                    onDrop={() => {

                      if (
                        editable &&
                        dragRowIndex !== null &&
                        dragRowIndex !== rowIndex
                      ) {

                        if (isInline) {

                          moveInlineRow(
                            dragRowIndex,
                            rowIndex
                          );

                        } else {

                          moveFormRow(
                            dragRowIndex,
                            rowIndex
                          );

                        }

                        setDragRowIndex(null);
                      }

                    }}
                  >

                    {/* ==========================================
                        ROW CONTROL
                    ========================================== */}

                    {editable && (

                      <td className="qb-drag-cell">

                        <div className="qb-row-controls">

                          {/* ROW DRAG */}

                         <span title="Drag row">
                       <GripVertical
                     size={17}
                      className="drag-handle row-drag-handle"
                      />
                      </span>
                          {/* ROW COLOR */}

                          <label
                            className="qb-color-picker row"
                            title="Row color"
                          >

                            <Palette size={13} />

                            <input
              data-math-input="true"
                              type="color"
                              value={
                                rowColor ||
                                "#ffffff"
                              }

                              onChange={(e) =>
                                isInline
                                  ? updateInlineRowColor(
                                      rowIndex,
                                      e.target.value
                                    )
                                  : updateFormRowColor(
                                      rowIndex,
                                      e.target.value
                                    )
                              }
                            />

                          </label>

                        </div>

                        {/* ROW RESIZE HANDLE */}

                        <span
                          className="qb-row-resize-handle"
                          title="Drag to resize row"

                          onMouseDown={(e) => {

                            e.preventDefault();
                            e.stopPropagation();

                            startRowResize(
                              e,
                              rowIndex
                            );

                          }}

                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        />

                      </td>

                    )}

                    {/* ==========================================
                        CELLS
                    ========================================== */}

                    {table.headers.map(
                      (_, colIndex) => {

                        const cellColumnColor =
                          columnColors[
                            colIndex
                          ];

                        return (

                          <td
                            key={`${rowIndex}-${colIndex}`}

                            style={{
                              background:
                                cellColumnColor ||
                                rowColor ||
                                undefined,

                              height: `${
                                rowHeights[
                                  rowIndex
                                ] || 52
                              }px`,

                              position: "relative",
                            }}
                          >

                            {editable ? (

                              <div className="qb-cell-edit">

                                <input
              data-math-input="true"
                                  value={
                                    row[
                                      colIndex
                                    ] ?? ""
                                  }

                                  onChange={(e) =>
                                    isInline
                                      ? updateInlineCell(
                                          rowIndex,
                                          colIndex,
                                          e.target.value
                                        )
                                      : updateFormCell(
                                          rowIndex,
                                          colIndex,
                                          e.target.value
                                        )
                                  }
                                />

                                <span className="qb-cell-position">
                                  {rowIndex + 1}.
                                  {colIndex + 1}
                                </span>

                              </div>

                            ) : (

                              row[colIndex] || "—"

                            )}

                          </td>

                        );

                      }
                    )}

                  </tr>

                );

              }
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
};


// ============================================================
// OPTION RENDER
// ============================================================

const renderOptions = (
  options: string[],
  correctAnswer: string,
  editable: boolean,
  inline = false
) => {

  const colors = inline
    ? inlineOptionColors
    : formOptionColors;

  return (

    <div className="qb-inline-options">

      {options.map(
        (option, index) => {

          const letter =
            String.fromCharCode(
              65 + index
            );

          const isCorrect =
            option === correctAnswer;

          return (

            <div
              key={index}

              className={`qb-inline-option ${
                isCorrect
                  ? "correct"
                  : ""
              }`}

              style={{
                background:
                  colors[index] ||
                  undefined,
              }}
            >

              <span>
                {letter}
              </span>

              <input
              data-math-input="true"
                value={option}

                onChange={(e) => {

                  if (inline) {

                    updateInlineOption(
                      index,
                      e.target.value
                    );

                  } else {

                    handleOptionChange(
                      index,
                      e.target.value
                    );

                  }

                }}

                required
              />

              <label
                className="qb-option-color"
                title="Option color"
              >

                <Palette size={14} />

                <input
              data-math-input="true"
                  type="color"

                  value={
                    colors[index] ||
                    "#ffffff"
                  }

                  onChange={(e) => {

                    const newColors = [
                      ...colors,
                    ];

                    newColors[index] =
                      e.target.value;

                    if (inline) {

                      setInlineOptionColors(
                        newColors
                      );

                    } else {

                      setFormOptionColors(
                        newColors
                      );

                    }

                  }}
                />

              </label>

              {isCorrect && (
                <CheckCircle2
                  size={18}
                />
              )}

            </div>

          );

        }
      )}

    </div>
  );
};


// ============================================================
// INLINE EDITOR
// ============================================================

const renderInlineEditor = () => {

  if (!inlineQuestion) {
    return null;
  }

  return (

    <div className="qb-inline-editor">

      {/* ======================================================
          EDITOR HEADER
      ====================================================== */}

      <div className="qb-editor-header">

        <div>

          <span className="qb-editor-kicker">
            INLINE EDIT MODE
          </span>

          <h3>
            Question #
            {inlineQuestion.questionNumber}
          </h3>

        </div>

        <button
          type="button"
          className="qb-icon-btn"
          onClick={cancelInlineEdit}
        >
          <X size={18} />
        </button>

      </div>


      {/* ======================================================
          BASIC FIELDS
      ====================================================== */}

      <div className="qb-editor-grid">

        <div className="qb-field">

          <label>
            Question Number
          </label>

          <input
              data-math-input="true"
            type="number"

            value={
              inlineQuestion.questionNumber
            }

            onChange={(e) =>
              updateInlineField(
                "questionNumber",
                Number(e.target.value)
              )
            }
          />

        </div>


        <div className="qb-field">

          <label>
            Subject
          </label>

          <select
            value={
              inlineQuestion.subject
            }

            onChange={(e) =>
              updateInlineField(
                "subject",
                e.target.value
              )
            }
          >

            <option value="">
              Select Subject
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


        <div className="qb-field">

          <label>
            Chapter
          </label>

          <input
              data-math-input="true"
            value={
              inlineQuestion.chapter || ""
            }

            onChange={(e) =>
              updateInlineField(
                "chapter",
                e.target.value
              )
            }
          />

        </div>


        <div className="qb-field">

          <label>
            Correct Answer
          </label>

          <select
            value={
              inlineQuestion.correctAnswer || ""
            }

            onChange={(e) =>
              updateInlineField(
                "correctAnswer",
                e.target.value
              )
            }
          >

            <option value="">
              Select correct option
            </option>

            {inlineQuestion.options.map(
              (option, index) => (

                <option
                  key={index}
                  value={option}
                >
                  {String.fromCharCode(
                    65 + index
                  )}{" "}
                  — {option}
                </option>

              )
            )}

          </select>

        </div>

      </div>


      {/* ======================================================
          QUESTION TEXT
      ====================================================== */}

      <div className="qb-field full">

        <label>
          Question Text
        </label>

        <textarea
              data-math-input="true"
          rows={4}

          value={
            inlineQuestion.question || ""
          }

          onChange={(e) =>
            updateInlineField(
              "question",
              e.target.value
            )
          }
        />

      </div>


      {/* ======================================================
          IMAGE
      ====================================================== */}

      <div className="qb-field full">

        <label>
          Diagram / Image URL
        </label>

        <div className="qb-image-input">

          <ImageIcon size={17} />

          <input
              data-math-input="true"
            value={
              inlineQuestion.questionImage ||
              ""
            }

            placeholder="https://..."

            onChange={(e) =>
              updateInlineField(
                "questionImage",
                e.target.value
              )
            }
          />

        </div>

      </div>


      {/* IMAGE PREVIEW */}

      {inlineQuestion.questionImage && (

        <div className="qb-image-preview">

          <img
            src={
              inlineQuestion.questionImage
            }
            alt="Question diagram"
          />

          <button
            type="button"

            onClick={() =>
              updateInlineField(
                "questionImage",
                ""
              )
            }
          >
            Remove Image
          </button>

        </div>

      )}


      {/* ======================================================
          OPTIONS
      ====================================================== */}

      <div className="qb-section-title">

        <span>
          Answer Options
        </span>

      </div>

      {renderOptions(
        inlineQuestion.options,
        inlineQuestion.correctAnswer,
        true,
        true
      )}


      {/* ======================================================
          TABLE
      ====================================================== */}

      <div className="qb-section-title table-section-heading">

        <span>

          <Table2 size={18} />

          Table / Data

        </span>

        {!inlineQuestion.tableData && (

          <button
            type="button"
            className="qb-small-primary"
            onClick={addInlineTable}
          >

            <Plus size={14} />

            Add Table

          </button>

        )}

      </div>


      {inlineQuestion.tableData &&
        renderTable(
          inlineQuestion.tableData,
          true,
          inlineQuestion
        )}


      {/* ======================================================
          MATH / SCIENCE KEYBOARD
      ====================================================== */}

      <MathKeyboard />

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className="qb-inline-footer">

        <button
          type="button"
          className="qb-cancel-btn"
          onClick={cancelInlineEdit}
        >

          <X size={17} />

          Cancel

        </button>


        <button
          type="button"
          className="qb-save-btn"
          onClick={saveInlineEdit}
        >

          <Save size={17} />

          Save Changes

        </button>

      </div>

    </div>
  );
};
  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="question-bank-page">

      {/* HERO */}

      <div className="qb-hero">

        <div className="qb-hero-content">

          <div className="qb-brand-icon">
            <FileText size={26} />
          </div>

          <div>
            <span className="qb-eyebrow">
              EXAMMASTER AI
            </span>

            <h1>
              Master Question Bank
            </h1>

            <p>
              Create, edit, organize and
              publish your examination
              questions.
            </p>
          </div>

        </div>

        <div className="qb-header-actions">

          <button
            className="qb-btn green"
            onClick={
              handlePublishAll
            }
          >
            <CheckCircle2 size={17} />
            Publish All
          </button>

          <button
            className="qb-btn purple"
            onClick={() =>
              setShowPdfModal(true)
            }
          >
            <Upload size={17} />
            Upload PDF
          </button>

          <button
            className="qb-btn primary"
            onClick={() => {
              if (showAddForm) {
                resetForm();
              } else {
                startNewQuestion();
              }
            }}
          >
            {showAddForm ? (
              <>
                <X size={17} />
                Close
              </>
            ) : (
              <>
                <Plus size={17} />
                Add Question
              </>
            )}
          </button>

          <button
            className="qb-btn danger"
            onClick={
              handleDeleteAll
            }
          >
            <Trash2 size={17} />
            Delete All
          </button>

        </div>
      </div>

      {/* STATS */}

      <div className="qb-stats">

        <div className="qb-stat-card">
          <span>
            Total Questions
          </span>

          <strong>
            {questions.length}
          </strong>
        </div>

        <div className="qb-stat-card">
          <span>
            Published
          </span>

          <strong>
            {
              questions.filter(
                (q) =>
                  q.isPublished
              ).length
            }
          </strong>
        </div>

        <div className="qb-stat-card">
          <span>
            Drafts
          </span>

          <strong>
            {
              questions.filter(
                (q) =>
                  !q.isPublished
              ).length
            }
          </strong>
        </div>

        <div className="qb-stat-card">
          <span>
            Tables
          </span>

          <strong>
            {
              questions.filter(
                (q) =>
                  q.tableData &&
                  q.tableData.headers
                    ?.length
              ).length
            }
          </strong>
        </div>

        <div className="qb-stat-card">
          <span>
            Diagrams
          </span>

          <strong>
            {
              questions.filter(
                (q) =>
                  !!q.questionImage
              ).length
            }
          </strong>
        </div>

      </div>

      {/* TABS */}

      <div className="qb-tabs">

        {[
          {
            key: "ALL",
            label: "All Questions",
            count:
              questions.length,
          },
          {
            key: "mock",
            label: "Mock Tests",
            count:
              questions.filter(
                (q) =>
                  q.testCategory ===
                  "mock"
              ).length,
          },
          {
            key: "daily",
            label: "Daily Tests",
            count:
              questions.filter(
                (q) =>
                  q.testCategory ===
                  "daily"
              ).length,
          },
          {
            key: "subject",
            label: "Subject Tests",
            count:
              questions.filter(
                (q) =>
                  q.testCategory ===
                  "subject"
              ).length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            className={
              activeTab === tab.key
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab(
                tab.key
              )
            }
          >
            {tab.label}

            <span>
              {tab.count}
            </span>
          </button>
        ))}

      </div>

      {/* FILTER */}

      <div className="qb-filter-card">

        <div className="qb-filter">
          <label>
            Class
          </label>

          <select
            value={
              selectedClassName
            }
            onChange={(e) =>
              setSelectedClassName(
                e.target.value
              )
            }
          >
            <option value="ALL">
              All Classes
            </option>

            <option>
              1st PUC
            </option>

            <option>
              2nd PUC
            </option>
          </select>
        </div>

        <div className="qb-filter">
          <label>
            Exam
          </label>

          <select
            value={selectedExam}
            onChange={(e) =>
              setSelectedExam(
                e.target.value
              )
            }
          >
            <option value="ALL">
              All Exams
            </option>

            <option>
              JEE
            </option>

            <option>
              NEET
            </option>
          </select>
        </div>

        <div className="qb-filter">
          <label>
            Subject
          </label>

          <select
            value={
              selectedSubject
            }
            onChange={(e) =>
              setSelectedSubject(
                e.target.value
              )
            }
          >
            <option value="ALL">
              All Subjects
            </option>

            <option>
              Physics
            </option>

            <option>
              Chemistry
            </option>

            <option>
              Mathematics
            </option>

            <option>
              Botany
            </option>

            <option>
              Zoology
            </option>
          </select>
        </div>

        <div className="qb-search">

          <Search size={18} />

          <input
              data-math-input="true"
            placeholder="Search questions, chapters, test titles..."
            value={
              searchTerm
            }
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
          />

        </div>

        <button
          className="qb-refresh"
          onClick={
            fetchQuestions
          }
        >
          <RefreshCw size={18} />
        </button>

      </div>

      {/* ADD FORM */}

      {showAddForm && (
        <form
          className="qb-add-form"
          onSubmit={
            handleSubmit
          }
        >

          <div className="qb-form-header">

            <div>
              <span>
                QUESTION EDITOR
              </span>

              <h2>
                {editingId
                  ? "Edit Question"
                  : "Create New Question"}
              </h2>
            </div>

            <button
              type="button"
              onClick={
                resetForm
              }
              className="qb-icon-btn"
            >
              <X size={19} />
            </button>

          </div>

          <div className="qb-editor-grid">

            <div className="qb-field">
              <label>
                Question Number
              </label>

              <input
              data-math-input="true"
                type="number"
                value={
                  formData.questionNumber
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    questionNumber:
                      Number(
                        e.target.value
                      ),
                  })
                }
              />
            </div>

            <div className="qb-field">
              <label>
                Class
              </label>

              <select
                value={
                  formData.className
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    className:
                      e.target.value,
                  })
                }
              >
                <option>
                  1st PUC
                </option>

                <option>
                  2nd PUC
                </option>
              </select>
            </div>

            <div className="qb-field">
              <label>
                Exam
              </label>

              <select
                value={
                  formData.examType
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    examType:
                      e.target.value,
                  })
                }
              >
                <option>
                  JEE
                </option>

                <option>
                  NEET
                </option>
              </select>
            </div>

            <div className="qb-field">
              <label>
                Subject
              </label>

              <select
                value={
                  formData.subject
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subject:
                      e.target.value,
                  })
                }
              >
                <option>
                  Physics
                </option>

                <option>
                  Chemistry
                </option>

                <option>
                  Mathematics
                </option>

                <option>
                  Botany
                </option>

                <option>
                  Zoology
                </option>
              </select>
            </div>

            <div className="qb-field">
              <label>
                Test Category
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

            <div className="qb-field">
              <label>
                Chapter
              </label>

              <input
              data-math-input="true"
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
                placeholder="Kinematics"
              />
            </div>

            <div className="qb-field full">
              <label>
                Test Title
              </label>

              <input
              data-math-input="true"
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
              />
            </div>

          </div>

          <div className="qb-field full">

            <label>
              Question Text
            </label>

            <textarea
              data-math-input="true"
              rows={5}
              value={
                formData.question
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  question:
                    e.target.value,
                })
              }
              placeholder="Enter question..."
              required
            />

          </div>

          {/* IMAGE */}
                     <div className="qb-field full">
  <label>
    <ImageIcon size={15} />
    Question Diagram / Image (Upload or URL)
  </label>

  {/* Upload Image */}
  <div
    className="qb-image-upload"
    style={{ marginBottom: "10px" }}
  >
    <ImageIcon size={17} />

    <input
              data-math-input="true"
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        // IMPORTANT:
        // Do NOT save blob URL to database.
        // Keep the selected file for Cloudinary upload.
        setSelectedImageFile(file);

        // Preview only
        const previewUrl = URL.createObjectURL(file);
        setImagePreviewUrl(previewUrl);
      }}
    />
  </div>

  {/* Paste Image URL */}
  <div className="qb-image-input">
    <ImageIcon size={17} />

    <input
              data-math-input="true"
      type="text"
      value={formData.questionImage || ""}
      onChange={(e) => {
        updateQuestionImage(e.target.value);
        setImagePreviewUrl(e.target.value);
        setSelectedImageFile(null);
      }}
      placeholder="https://example.com/diagram.png"
    />
  </div>
</div>

{/* Image Preview */}
{(imagePreviewUrl || formData.questionImage) && (
  <div className="qb-image-preview">
    <img
      src={imagePreviewUrl || formData.questionImage}
      alt="Question diagram"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />

    <button
      type="button"
      onClick={() => {
        setSelectedImageFile(null);
        setImagePreviewUrl("");
        updateQuestionImage("");
      }}
    >
      Remove
    </button>
  </div>
)}
          {/* OPTIONS */}

          <div className="qb-section-title">

            <span>
              Answer Options
            </span>

            <small>
              Choose colors for options
            </small>

          </div>

          {renderOptions(
            formData.options,
            formData.correctAnswer,
            true
          )}

          <div className="qb-field">

            <label>
              Correct Answer
            </label>

            <select
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
            >
              <option value="">
                Select Correct Answer
              </option>

              {formData.options.map(
                (option, index) => (
                  <option
                    key={index}
                    value={option}
                  >
                    {String.fromCharCode(
                      65 + index
                    )}{" "}
                    — {option}
                  </option>
                )
              )}

            </select>

          </div>

          {/* TABLE */}

          <div className="qb-section-title table-section-heading">

            <span>
              <Table2 size={18} />
              Question Table
            </span>

            {!formData.tableData && (
              <button
                type="button"
                className="qb-small-primary"
                onClick={
                  addFormTable
                }
              >
                <Plus size={14} />
                Add Table
              </button>
            )}

          </div>

          {formData.tableData &&
            renderTable(
              formData.tableData,
              true
            )}

          {/* MATH / SCIENCE KEYBOARD */}

          <MathKeyboard />

          {/* FOOTER */}

          <div className="qb-form-footer">

            <button
              type="button"
              className="qb-cancel-btn"
              onClick={
                resetForm
              }
            >
              <X size={17} />
              Cancel
            </button>

            <button
              type="submit"
              className="qb-save-btn"
            >
              <Save size={17} />

              {editingId
                ? "Update Question"
                : "Save as Draft"}
            </button>

          </div>

        </form>
      )}

      {/* RESULTS */}

      <div className="qb-results-header">

        <div>
          <span className="qb-eyebrow">
            QUESTION LIBRARY
          </span>

          <h2>
            Questions

            <small>
              {
                filteredQuestions.length
              }
            </small>
          </h2>
        </div>

      </div>     {/* ============================================================
    TEST MANAGEMENT BUTTON
============================================================ */}

<div
  style={{
    marginBottom: "16px",
  }}
>
  <button
    type="button"
    className="qb-btn primary"
    onClick={() =>
      setShowTestManagement(
        (prev) => !prev
      )
    }
  >
    <FileText size={17} />

    Test Management

    <ChevronDown
      size={17}
      style={{
        marginLeft: "4px",
        transform:
          showTestManagement
            ? "rotate(180deg)"
            : "rotate(0deg)",
        transition:
          "transform 0.25s ease",
      }}
    />
  </button>
</div>


{/* ============================================================
    TEST MANAGEMENT PANEL
============================================================ */}

{showTestManagement && (
  <div
    style={{
      marginBottom: "20px",
      padding: "16px",
      borderRadius: "14px",
      border: "1px solid #e2e8f0",
      background: "#f8fafc",
      animation:
        "qbTestPanelOpen 0.25s ease",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "14px",
      }}
    >
      <div>
        <strong
          style={{
            display: "block",
            fontSize: "17px",
          }}
        >
          Test Management
        </strong>

        <span
          style={{
            fontSize: "12px",
            color: "#64748b",
          }}
        >
          Manage tests by Test ID
        </span>
      </div>
    </div>

    {Array.from(
      new Map(
        filteredQuestions.map((q) => [
          q.testId,
          q,
        ])
      ).values()
    ).map((test) => {
      const testQuestions =
        filteredQuestions.filter(
          (q) =>
            q.testId ===
            test.testId
        );

      const allPublished =
        testQuestions.every(
          (q) =>
            q.isPublished
        );

      const publishAt =
        test.publishAt;

      return (
        <div
          key={test.testId}
          style={{
            padding: "14px",
            marginBottom: "10px",
            borderRadius: "12px",
            background: "#ffffff",
            border:
              "1px solid #e2e8f0",
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "14px",
            flexWrap: "wrap",
          }}
        >
          {/* TEST INFO */}

          <div
            style={{
              flex: 1,
              minWidth: "260px",
            }}
          >
            <strong
              style={{
                display: "block",
                fontSize: "15px",
                marginBottom: "5px",
              }}
            >
              {test.testTitle ||
                "Untitled Test"}
            </strong>

            <div
              style={{
                fontSize: "13px",
                color: "#475569",
              }}
            >
              Test ID:{" "}
              <strong>
                {test.testId}
              </strong>
            </div>

            <div
              style={{
                fontSize: "13px",
                color: "#64748b",
                marginTop: "3px",
              }}
            >
              {test.testCategory}
              {" • "}
              {test.subject}
              {" • "}
              {test.className}
              {" • "}
              {testQuestions.length} Questions
            </div>

            {test.testCategory ===
              "mock" &&
              publishAt && (
                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  Publish Time:{" "}
                  {new Date(
                    publishAt
                  ).toLocaleString()}
                </div>
              )}

            <div
              style={{
                marginTop: "5px",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              Status:{" "}
              {allPublished
                ? "Published"
                : "Draft"}
            </div>
          </div>

          {/* TEST ACTIONS */}

          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              className="qb-btn green"
              disabled={
                allPublished
              }
              onClick={() =>
                handlePublishTest(
                  test.testId
                )
              }
            >
              <CheckCircle2
                size={16}
              />

              {allPublished
                ? "Published"
                : "Publish Test"}
            </button>

            <button
              type="button"
              className="qb-btn danger"
              onClick={() =>
                handleDeleteTest(
                  test.testId
                )
              }
            >
              <Trash2
                size={16}
              />

              Delete Test
            </button>
          </div>
        </div>
      );
    })}
  </div>
)}


      {/* LOADING */}

      {loading ? (
        <div className="qb-empty">

          <RefreshCw
            className="spin"
            size={30}
          />

          <h3>
            Loading questions...
          </h3>

        </div>
      ) : filteredQuestions.length ===
        0 ? (
        <div className="qb-empty">

          <FileText size={40} />

          <h3>
            No questions found
          </h3>

          <p>
            Try changing your
            filters or create a
            new question.
          </p>

        </div>
      ) : (
        <div className="qb-question-list">

          {filteredQuestions.map(
            (q, index) => {

              const isInlineEditing =
                inlineEditingId ===
                q._id;

              const isExpanded =
                expandedId ===
                q._id;

              if (
                isInlineEditing
              ) {
                return (
                  <React.Fragment
                    key={
                      q._id ||
                      index
                    }
                  >
                    {renderInlineEditor()}
                  </React.Fragment>
                );
              }

              return (
                <article
                  className="qb-question-card"
                  key={
                    q._id ||
                    index
                  }
                >

                  {/* CARD TOP */}

                  <div className="qb-card-top">

                    <div className="qb-question-number">
                      Q
                      {q.questionNumber ||
                        index + 1}
                    </div>

                    <div className="qb-card-meta">

                      <span className="tag class">
                        {q.className}
                      </span>

                      <span className="tag exam">
                        {q.examType}
                      </span>

                      <span className="tag subject">
                        {q.subject}
                      </span>

                      <span className="tag category">
                        {q.testCategory}
                      </span>

                      <span
                        className={`tag status ${
                          q.isPublished
                            ? "published"
                            : "draft"
                        }`}
                      >
                        {q.isPublished
                          ? "Published"
                          : "Draft"}
                      </span>

                      {q.tableData && (
                        <span className="tag table">
                          <Table2
                            size={12}
                          />
                          Table
                        </span>
                      )}

                      {q.questionImage && (
                        <span className="tag image">
                          <ImageIcon
                            size={12}
                          />
                          Diagram
                        </span>
                      )}

                    </div>

                    <div className="qb-card-actions">

                      <button
                        className="card-edit"
                        onClick={() =>
                          startInlineEdit(
                            q
                          )
                        }
                      >
                        <Edit3
                          size={15}
                        />
                        Inline Edit
                      </button>

                      <button
                        className="card-edit-form"
                        onClick={() =>
                          duplicateQuestion(q)
                        }
                        title="Duplicate question"
                      >
                        <Copy size={15} />
                        Duplicate
                      </button>

                      <button
                        className="card-edit-form"
                        onClick={() =>
                          handleEdit(
                            q
                          )
                        }
                      >
                        <Edit3
                          size={15}
                        />
                        Full Edit
                      </button>

                      <button
                        className="card-delete"
                        onClick={() =>
                          handleDelete(
                            q._id
                          )
                        }
                      >
                        <Trash2
                          size={15}
                        />
                      </button>

                      <button
                        className="card-expand"
                        onClick={() =>
                          setExpandedId(
                            isExpanded
                              ? null
                              : q._id ||
                                  null
                          )
                        }
                      >
                        {isExpanded ? (
                          <ChevronUp
                            size={17}
                          />
                        ) : (
                          <ChevronDown
                            size={17}
                          />
                        )}
                      </button>

                    </div>

                  </div>

                  {/* BODY */}

                  <div className="qb-question-body">

                    <h3>
                      {q.question}
                    </h3>

                    {q.chapter && (
                      <div className="qb-chapter">
                        Chapter:{" "}
                        {q.chapter}
                      </div>
                    )}

                    {/* IMAGE */}

                    {q.questionImage && (
                      <div className="qb-card-image">

                        <img
                          src={
                            q.questionImage
                          }
                          alt="Question diagram"
                        />

                      </div>
                    )}

                    {/* TABLE */}

                    {q.tableData &&
                      q.tableData
                        .headers
                        ?.length >
                        0 && (
                        <div className="qb-display-table">

                          {renderTable(
                            q.tableData,
                            false,
                            q
                          )}

                        </div>
                      )}

                    {/* OPTIONS */}

                    <div className="qb-display-options">

                      {q.options?.map(
                        (
                          option,
                          optIndex
                        ) => {

                          const isCorrect =
                            option ===
                            q.correctAnswer;

                          const optionColors =
                            (q as any)
                              .optionColors ||
                            [];

                          return (
                            <div
                              key={
                                optIndex
                              }
                              className={`qb-display-option ${
                                isCorrect
                                  ? "correct"
                                  : ""
                              }`}
                              style={{
                                background:
                                  optionColors[
                                    optIndex
                                  ] ||
                                  undefined,
                              }}
                            >

                              <span>
                                {String.fromCharCode(
                                  65 +
                                    optIndex
                                )}
                              </span>

                              <div>
                                {
                                  option
                                }
                              </div>

                              {isCorrect && (
                                <CheckCircle2
                                  size={
                                    17
                                  }
                                />
                              )}

                            </div>
                          );
                        }
                      )}

                    </div>

                    {/* EXTRA */}

                    {isExpanded && (
                      <div className="qb-extra-info">

                        <div>
                          <span>
                            Test Title
                          </span>

                          <strong>
                            {
                              q.testTitle
                            }
                          </strong>
                        </div>

                        <div>
                          <span>
                            Test ID
                          </span>

                          <strong>
                            {
                              q.testId
                            }
                          </strong>
                        </div>

                        <div>
                          <span>
                            Marks
                          </span>

                          <strong>
                            +
                            {
                              q.marksPerQuestion
                            }
                          </strong>
                        </div>

                        <div>
                          <span>
                            Negative
                          </span>

                          <strong>
                            -
                            {
                              q.negativeMarks
                            }
                          </strong>
                        </div>

                        <div>
                          <span>
                            Duration
                          </span>

                          <strong>
                            {
                              q.durationMinutes
                            }{" "}
                            min
                          </strong>
                        </div>

                      </div>
                    )}

                  </div>

                </article>
              );
            }
          )}

        </div>
      )}

      {/* ============================================================
    PDF MODAL
============================================================ */}

{showPdfModal && (
  <div className="qb-modal-backdrop">

    <div className="qb-pdf-modal">

      {/* ========================================================
          MODAL HEADER
      ======================================================== */}

      <div className="qb-modal-header">

        <div>
          <span>
            PDF IMPORT
          </span>

          <h2>
            Upload Question Paper
          </h2>
        </div>

        <button
          type="button"
          className="qb-icon-btn"
          onClick={() => {
            setShowPdfModal(false);
            setPdfFile(null);
            setPdfSubject("");
            setPdfExamType("JEE");
          }}
        >
          <X size={19} />
        </button>

      </div>


      {/* ========================================================
          FORM
      ======================================================== */}

      <form onSubmit={handlePdfSubmit}>

        {/* ======================================================
            CLASS NAME
        ====================================================== */}

        <div className="qb-field">

          <label>
            Class Name
          </label>

          <select
            value={pdfClassName}
            onChange={(e) =>
              setPdfClassName(e.target.value)
            }
          >

            <option value="1st PUC">
              1st PUC
            </option>

            <option value="2nd PUC">
              2nd PUC
            </option>

          </select>

        </div>


        {/* ======================================================
            TEST TYPE
        ====================================================== */}

        <div className="qb-field">

          <label>
            Test Type
          </label>

          <select
            value={pdfTestCategory}
            onChange={(e) => {

              const value =
                e.target.value as
                  | "mock"
                  | "daily"
                  | "subject";

              setPdfTestCategory(value);

              /*
               * SUBJECT TEST
               * Exam Type becomes Not Applicable
               */
              if (value === "subject") {
                setPdfExamType("");
              }

              /*
               * MOCK / DAILY TEST
               * Exam Type becomes available
               */
              else {
                setPdfExamType(
                  pdfExamType || "JEE"
                );
              }

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


        {/* ======================================================
            EXAM TYPE
        ====================================================== */}

        <div className="qb-field">

          <label>
            Exam Type
          </label>

          <select
            value={pdfExamType}
            disabled={
              pdfTestCategory === "subject"
            }
            onChange={(e) =>
              setPdfExamType(
                e.target.value as
                  | "JEE"
                  | "NEET"
                  | ""
              )
            }
          >

            {pdfTestCategory === "subject" ? (

              <option value="">
                Not Applicable
              </option>

            ) : (

              <>
                <option value="JEE">
                  JEE Mains
                </option>

                <option value="NEET">
                  NEET UG
                </option>
              </>

            )}

          </select>

        </div>


        {/* ======================================================
            SUBJECT
        ====================================================== */}

        <div className="qb-field">

  <label>
    Subject
  </label>

  <select
    value={pdfSubject}
    onChange={(e) =>
      setPdfSubject(
        e.target.value
      )
    }
  >

    <option value="">
      Select Subject
    </option>

    <option value="Physics">
      Physics
    </option>

    <option value="Chemistry">
      Chemistry
    </option>

    <option value="Botany">
      Botany
    </option>

    <option value="Zoology">
      Zoology
    </option>

    <option value="Mathematics">
      Mathematics
    </option>

  </select>

</div>


{/* ======================================================
    MOCK TEST SCHEDULE
====================================================== */}

{pdfTestCategory === "mock" && (
  <>
    <div className="qb-field">

      <label>
        Publish Date
      </label>

      <input
        type="date"
        value={pdfPublishDate}
        onChange={(e) =>
          setPdfPublishDate(
            e.target.value
          )
        }
        required
      />

    </div>

    <div className="qb-field">

      <label>
        Publish Time
      </label>

      <input
        type="time"
        value={pdfPublishTime}
        onChange={(e) =>
          setPdfPublishTime(
            e.target.value
          )
        }
        required
      />

    </div>
  </>
)}


{/* ======================================================
    PDF UPLOAD
====================================================== */}


        <div className="qb-upload-box">

          <Upload size={28} />

          <strong>
            Select PDF
          </strong>

          <span>
            Question paper PDF
          </span>

          <input
            data-math-input="true"
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) =>
              setPdfFile(
                e.target.files?.[0] || null
              )
            }
          />

          {pdfFile && (
            <div className="selected-file">
              {pdfFile.name}
            </div>
          )}

        </div>


        {/* ======================================================
            FOOTER
        ====================================================== */}

        <div className="qb-modal-footer">

          {/* CANCEL */}

          <button
            type="button"
            className="qb-cancel-btn"
            disabled={parsing}
            onClick={() => {
              setShowPdfModal(false);
              setPdfFile(null);
              setPdfSubject("");
              setPdfExamType("JEE");
            }}
          >
            Cancel
          </button>


          {/* EXTRACT & SAVE */}

          <button
            type="submit"
            className="qb-save-btn"
            disabled={
              parsing || !pdfFile
            }
          >

            {parsing ? (

              <>
                <RefreshCw
                  size={16}
                  className="spin"
                />

                Processing...
              </>

            ) : (

              <>
                <Upload
                  size={16}
                />

                Extract & Save
              </>

            )}

          </button>

        </div>

      </form>

    </div>

  </div>
)}

</div>
);
  }