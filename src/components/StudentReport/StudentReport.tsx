
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  RefreshCw,
  Share2,
  Users,
  X,
} from "lucide-react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import "./StudentReport.css";

// ============================================================
// TYPES
// ============================================================

export interface StudentReportStudent {
  studentId: string;
  name: string;
  className: string;
  section: string;
  classId?: string;
}

export interface StudentReportOwner {
  name?: string;
  section?: string;
  email?: string;
}

export interface StudentResult {
  _id?: string;

  studentId?: string;
  studentName?: string;

  examName?: string;
  subject?: string;
  chapter?: string;

  totalQuestions?: number;
  attemptedQuestions?: number;
  unansweredQuestions?: number;
  correctAnswers?: number;
  wrongAnswers?: number;

  marks?: number;
  percentage?: number;

  grade?: string;
  status?: string;

  timeTaken?: number;

  testCategory?: string;

  createdAt?: string;
  submittedAt?: string;
}

// ============================================================
// PROPS
// ============================================================

interface StudentReportProps {
  students: StudentReportStudent[];

  owner?: StudentReportOwner;

  apiBaseUrl: string;

  open: boolean;

  onOpenChange: (
    open: boolean
  ) => void;

  title?: string;
}

// ============================================================
// INTERNAL REPORT TYPE
// ============================================================

interface StudentReportData
  extends StudentReportStudent {
  results: StudentResult[];
  loading: boolean;
  error?: string;
}

// ============================================================
// COMPONENT
// ============================================================

export default function StudentReport({
  students,
  owner,
  apiBaseUrl,
  open,
  onOpenChange,
  title = "Section Performance Report",
}: StudentReportProps) {
  // ==========================================================
  // STATES
  // ==========================================================

  const [reports, setReports] = useState<
    StudentReportData[]
  >([]);

  const [loading, setLoading] =
    useState(false);

  const [pdfLoading, setPdfLoading] =
    useState(false);

  const [shareLoading, setShareLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [expandedStudents, setExpandedStudents] =
    useState<Record<string, boolean>>({});

  // ==========================================================
  // TOKEN
  // ==========================================================

  const token =
    localStorage.getItem("staffToken") || "";

  // ==========================================================
  // LOAD RESULTS
  // ==========================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!students.length) {
      setReports([]);
      return;
    }

    loadReports();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, students]);

  // ==========================================================
  // LOAD ALL STUDENT RESULTS
  // ==========================================================

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const cleanBase =
        apiBaseUrl.replace(/\/+$/, "");

      const headers: Record<
        string,
        string
      > = {
        "Content-Type":
          "application/json",
      };

      if (token) {
        headers.Authorization =
          `Bearer ${token}`;
      }

      const loaded: StudentReportData[] =
        await Promise.all(
          students.map(
            async (student) => {
              try {
                const response =
                  await fetch(
                    `${cleanBase}/api/results/student/${encodeURIComponent(
                      student.studentId
                    )}`,
                    {
                      method: "GET",
                      headers,
                    }
                  );

                const data =
                  await response.json();

                if (!response.ok) {
                  throw new Error(
                    data?.message ||
                      "Unable to load student results."
                  );
                }

                const raw =
                  data?.results ??
                  data?.data ??
                  data;

                let results: StudentResult[] =
                  [];

                if (
                  Array.isArray(raw)
                ) {
                  results = raw;
                } else if (
                  raw &&
                  typeof raw ===
                    "object"
                ) {
                  results = [raw];
                }

                results.sort(
                  (a, b) =>
                    new Date(
                      b.createdAt ||
                        b.submittedAt ||
                        0
                    ).getTime() -
                    new Date(
                      a.createdAt ||
                        a.submittedAt ||
                        0
                    ).getTime()
                );

                return {
                  ...student,
                  results,
                  loading: false,
                };
              } catch (err: any) {
                console.error(
                  `Result load failed for ${student.studentId}`,
                  err
                );

                return {
                  ...student,
                  results: [],
                  loading: false,
                  error:
                    err?.message ||
                    "Unable to load results.",
                };
              }
            }
          )
        );

      setReports(loaded);

      const expanded: Record<
        string,
        boolean
      > = {};

      loaded.forEach((student) => {
        expanded[student.studentId] =
          true;
      });

      setExpandedStudents(expanded);
    } catch (err: any) {
      console.error(
        "Student report loading error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load report."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // HELPERS
  // ==========================================================

  const numberValue = (
    value: unknown
  ) => {
    const n = Number(value);

    return Number.isFinite(n)
      ? n
      : 0;
  };

  const formatDate = (
    value?: string
  ) => {
    if (!value) {
      return "N/A";
    }

    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "N/A";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getInitials = (
    name: string
  ) => {
    if (!name) {
      return "ST";
    }

    const parts =
      name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0]
        .slice(0, 2)
        .toUpperCase();
    }

    return `${parts[0][0]}${
      parts[parts.length - 1][0]
    }`.toUpperCase();
  };

  const toggleStudent = (
    studentId: string
  ) => {
    setExpandedStudents(
      (previous) => ({
        ...previous,
        [studentId]:
          !previous[studentId],
      })
    );
  };

  // ==========================================================
  // TOTAL EXAMS
  // ==========================================================

  const totalExams = useMemo(() => {
    return reports.reduce(
      (sum, student) =>
        sum + student.results.length,
      0
    );
  }, [reports]);

  // ==========================================================
  // SECTION AVERAGE
  // ==========================================================

  const sectionAverage = useMemo(() => {
    const allResults =
      reports.flatMap(
        (student) =>
          student.results
      );

    if (!allResults.length) {
      return 0;
    }

    const total =
      allResults.reduce(
        (sum, result) =>
          sum +
          numberValue(
            result.percentage
          ),
        0
      );

    return Number(
      (
        total /
        allResults.length
      ).toFixed(2)
    );
  }, [reports]);

  // ==========================================================
  // SUBJECT SUMMARY
  // ==========================================================

  const subjectSummary =
    useMemo(() => {
      const map: Record<
        string,
        {
          exams: number;
          percentage: number;
        }
      > = {};

      reports.forEach(
        (student) => {
          student.results.forEach(
            (result) => {
              const subject =
                result.subject?.trim() ||
                "General";

              if (!map[subject]) {
                map[subject] = {
                  exams: 0,
                  percentage: 0,
                };
              }

              map[subject].exams +=
                1;

              map[
                subject
              ].percentage +=
                numberValue(
                  result.percentage
                );
            }
          );
        }
      );

      return Object.entries(map)
        .map(
          ([
            subject,
            value,
          ]) => ({
            subject,
            exams: value.exams,
            average: Number(
              (
                value.percentage /
                value.exams
              ).toFixed(2)
            ),
          })
        )
        .sort((a, b) =>
          a.subject.localeCompare(
            b.subject
          )
        );
    }, [reports]);

  // ==========================================================
  // BUILD PDF
  // ==========================================================

  const buildPDF = () => {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth =
      pdf.internal.pageSize.getWidth();

    const pageHeight =
      pdf.internal.pageSize.getHeight();

    const reportDate =
      new Date().toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );

    // ========================================================
    // PAGE 1 HEADER
    // ========================================================

    pdf.setFillColor(
      43,
      32,
      26
    );

    pdf.rect(
      0,
      0,
      pageWidth,
      42,
      "F"
    );

    pdf.setTextColor(
      255,
      255,
      255
    );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(21);

    pdf.text(
      "EXAMMASTER",
      14,
      15
    );

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(8.5);

    pdf.text(
      "MENTOR • SECTION PERFORMANCE REPORT",
      14,
      22
    );

    pdf.setFontSize(8);

    pdf.text(
      `Report Date: ${reportDate}`,
      pageWidth - 14,
      15,
      {
        align: "right",
      }
    );

    pdf.text(
      `Section: ${
        owner?.section ||
        "N/A"
      }`,
      pageWidth - 14,
      22,
      {
        align: "right",
      }
    );

    // ========================================================
    // REPORT TITLE
    // ========================================================

    pdf.setTextColor(
      55,
      43,
      35
    );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(16);

    pdf.text(
      title,
      14,
      53
    );

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(9);

    pdf.text(
      `Mentor: ${
        owner?.name ||
        "Mentor"
      }`,
      14,
      61
    );

    pdf.text(
      `Section: ${
        owner?.section ||
        "N/A"
      }`,
      14,
      67
    );

    // ========================================================
    // SUMMARY CARDS
    // ========================================================

    const summaryCards = [
      {
        label:
          "TOTAL STUDENTS",
        value: String(
          reports.length
        ),
      },
      {
        label:
          "TOTAL EXAMS",
        value: String(
          totalExams
        ),
      },
      {
        label:
          "SECTION AVERAGE",
        value: `${sectionAverage}%`,
      },
    ];

    const cardWidth = 56;
    const cardGap = 6;

    summaryCards.forEach(
      (card, index) => {
        const x =
          14 +
          index *
            (cardWidth +
              cardGap);

        pdf.setFillColor(
          248,
          243,
          238
        );

        pdf.roundedRect(
          x,
          74,
          cardWidth,
          27,
          4,
          4,
          "F"
        );

        pdf.setTextColor(
          112,
          83,
          61
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(7);

        pdf.text(
          card.label,
          x +
            cardWidth /
              2,
          82,
          {
            align:
              "center",
          }
        );

        pdf.setTextColor(
          46,
          35,
          29
        );

        pdf.setFontSize(14);

        pdf.text(
          card.value,
          x +
            cardWidth /
              2,
          94,
          {
            align:
              "center",
          }
        );
      }
    );

    // ========================================================
    // SECTION SUBJECT SUMMARY
    // ========================================================

    if (
      subjectSummary.length
    ) {
      pdf.setTextColor(
        55,
        43,
        35
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(12);

      pdf.text(
        "Subject-wise Section Summary",
        14,
        113
      );

      autoTable(pdf, {
        startY: 118,

        head: [
          [
            "SUBJECT",
            "TOTAL EXAMS",
            "SECTION AVERAGE",
          ],
        ],

        body:
          subjectSummary.map(
            (item) => [
              item.subject,
              String(
                item.exams
              ),
              `${item.average}%`,
            ]
          ),

        theme: "grid",

        margin: {
          left: 14,
          right: 14,
          bottom: 20,
        },

        styles: {
          font:
            "helvetica",
          fontSize: 8.5,
          cellPadding: 3,
          textColor: [
            45,
            37,
            32,
          ],
          lineColor: [
            220,
            212,
            205,
          ],
          lineWidth: 0.25,
        },

        headStyles: {
          fillColor: [
            67,
            50,
            41,
          ],
          textColor: [
            255,
            255,
            255,
          ],
          fontStyle:
            "bold",
          halign:
            "center",
        },

        alternateRowStyles: {
          fillColor: [
            250,
            247,
            244,
          ],
        },

        columnStyles: {
          1: {
            halign:
              "center",
          },

          2: {
            halign:
              "center",
          },
        },
      });
    }

    // ========================================================
    // EACH STUDENT
    // ========================================================

    reports.forEach(
      (
        student,
        index
      ) => {
        pdf.addPage();

        // ----------------------------------------------------
        // STUDENT HEADER
        // ----------------------------------------------------

        pdf.setFillColor(
          43,
          32,
          26
        );

        pdf.roundedRect(
          14,
          14,
          pageWidth - 28,
          30,
          5,
          5,
          "F"
        );

        pdf.setTextColor(
          255,
          255,
          255
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(13);

        pdf.text(
          `${String(
            index + 1
          ).padStart(
            2,
            "0"
          )}. ${
            student.name ||
            "Student"
          }`,
          21,
          26
        );

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(8);

        pdf.text(
          `ID: ${
            student.studentId ||
            "N/A"
          }`,
          21,
          34
        );

        pdf.text(
          `Class: ${
            student.className ||
            "N/A"
          } • Section: ${
            student.section ||
            owner?.section ||
            "N/A"
          }`,
          pageWidth - 21,
          34,
          {
            align:
              "right",
          }
        );

        // ----------------------------------------------------
        // SUBJECT TABLE
        // ----------------------------------------------------

        pdf.setTextColor(
          53,
          42,
          35
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(12);

        pdf.text(
          "Subject-wise Performance",
          14,
          55
        );

        if (
          !student.results
            .length
        ) {
          pdf.setFont(
            "helvetica",
            "normal"
          );

          pdf.setFontSize(9);

          pdf.setTextColor(
            120,
            106,
            97
          );

          pdf.text(
            student.error ||
              "No results available for this student.",
            14,
            64
          );

          return;
        }

        autoTable(pdf, {
          startY: 60,

          head: [
            [
              "SUBJECT",
              "EXAM",
              "DATE",
              "MARKS",
              "%",
              "GRADE",
              "STATUS",
            ],
          ],

          body:
            student.results.map(
              (
                result
              ) => [
                result.subject ||
                  "General",
                result.examName ||
                  "Exam",
                formatDate(
                  result.createdAt ||
                    result.submittedAt
                ),
                String(
                  numberValue(
                    result.marks
                  )
                ),
                `${numberValue(
                  result.percentage
                )}%`,
                result.grade ||
                  "-",
                result.status ||
                  "-",
              ]
            ),

          theme: "grid",

          margin: {
            left: 14,
            right: 14,
            bottom: 20,
          },

          styles: {
            font:
              "helvetica",
            fontSize: 7.5,
            cellPadding: 3,
            textColor: [
              45,
              37,
              32,
            ],
            lineColor: [
              220,
              212,
              205,
            ],
            lineWidth:
              0.2,
          },

          headStyles: {
            fillColor: [
              67,
              50,
              41,
            ],
            textColor: [
              255,
              255,
              255,
            ],
            fontStyle:
              "bold",
            fontSize: 7,
            halign:
              "center",
          },

          alternateRowStyles: {
            fillColor: [
              250,
              247,
              244,
            ],
          },

          columnStyles: {
            0: {
              cellWidth: 27,
            },

            1: {
              cellWidth: 57,
            },

            2: {
              cellWidth: 23,
              halign:
                "center",
            },

            3: {
              cellWidth: 17,
              halign:
                "center",
            },

            4: {
              cellWidth: 17,
              halign:
                "center",
            },

            5: {
              cellWidth: 16,
              halign:
                "center",
            },

            6: {
              cellWidth: 22,
              halign:
                "center",
            },
          },
        });

        // ----------------------------------------------------
        // STUDENT AVERAGE
        // ----------------------------------------------------

        const average =
          student.results.length
            ? Number(
                (
                  student.results.reduce(
                    (
                      sum,
                      result
                    ) =>
                      sum +
                      numberValue(
                        result.percentage
                      ),
                    0
                  ) /
                  student.results
                    .length
                ).toFixed(2)
              )
            : 0;

        const finalY =
          (pdf as any)
            .lastAutoTable
            ?.finalY ||
          70;

        pdf.setFillColor(
          248,
          243,
          238
        );

        pdf.roundedRect(
          14,
          finalY + 10,
          pageWidth - 28,
          23,
          4,
          4,
          "F"
        );

        pdf.setTextColor(
          105,
          78,
          59
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(8);

        pdf.text(
          "STUDENT AVERAGE",
          21,
          finalY + 20
        );

        pdf.setTextColor(
          45,
          35,
          29
        );

        pdf.setFontSize(13);

        pdf.text(
          `${average}%`,
          pageWidth - 21,
          finalY + 20,
          {
            align:
              "right",
          }
        );
      }
    );

    // ========================================================
    // FOOTERS
    // ========================================================

    const pageCount =
      pdf.getNumberOfPages();

    for (
      let page = 1;
      page <= pageCount;
      page++
    ) {
      pdf.setPage(page);

      pdf.setDrawColor(
        220,
        212,
        205
      );

      pdf.line(
        14,
        pageHeight - 14,
        pageWidth - 14,
        pageHeight - 14
      );

      pdf.setTextColor(
        110,
        100,
        95
      );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(7.5);

      pdf.text(
        "EXAMMASTER • Mentor Section Performance Report",
        14,
        pageHeight - 8
      );

      pdf.text(
        `Page ${page} of ${pageCount}`,
        pageWidth - 14,
        pageHeight - 8,
        {
          align:
            "right",
        }
      );
    }

    return pdf;
  };

  // ==========================================================
  // DOWNLOAD
  // ==========================================================

  const handleDownload =
    () => {
      try {
        if (!reports.length) {
          alert(
            "No report data available."
          );
          return;
        }

        setPdfLoading(true);

        const pdf =
          buildPDF();

        const safeSection =
          (
            owner?.section ||
            "NA"
          )
            .replace(
              /[^a-zA-Z0-9]+/g,
              "-"
            )
            .replace(
              /^-|-$/g,
              ""
            );

        pdf.save(
          `EXAMMASTER-Section-${safeSection}-Performance-Report.pdf`
        );
      } catch (err) {
        console.error(
          "PDF generation error:",
          err
        );

        alert(
          "Unable to create PDF."
        );
      } finally {
        setPdfLoading(false);
      }
    };

  // ==========================================================
  // SHARE
  // ==========================================================

  const handleShare =
    async () => {
      try {
        if (!reports.length) {
          alert(
            "No report data available."
          );
          return;
        }

        setShareLoading(true);

        const pdf =
          buildPDF();

        const safeSection =
          (
            owner?.section ||
            "NA"
          )
            .replace(
              /[^a-zA-Z0-9]+/g,
              "-"
            )
            .replace(
              /^-|-$/g,
              ""
            );

        const fileName =
          `EXAMMASTER-Section-${safeSection}-Performance-Report.pdf`;

        const blob =
          pdf.output(
            "blob"
          );

        const file =
          new File(
            [blob],
            fileName,
            {
              type:
                "application/pdf",
            }
          );

        // Native mobile / browser file share
        if (
          navigator.share &&
          navigator.canShare &&
          navigator.canShare({
            files: [file],
          })
        ) {
          await navigator.share({
            title:
              "EXAMMASTER Section Performance Report",

            text:
              `Section ${
                owner?.section ||
                "N/A"
              } student performance report.`,

            files: [file],
          });

          return;
        }

        // WhatsApp fallback
        const message =
          `EXAMMASTER - Mentor Section Performance Report\n\n` +
          `Mentor: ${
            owner?.name ||
            "Mentor"
          }\n` +
          `Section: ${
            owner?.section ||
            "N/A"
          }\n` +
          `Total Students: ${
            reports.length
          }\n` +
          `Total Exams: ${totalExams}\n` +
          `Section Average: ${
            sectionAverage
          }%\n\n` +
          `Please attach the downloaded PDF to this WhatsApp message.`;

        window.open(
          `https://wa.me/?text=${encodeURIComponent(
            message
          )}`,
          "_blank",
          "noopener,noreferrer"
        );
      } catch (err: any) {
        if (
          err?.name ===
          "AbortError"
        ) {
          return;
        }

        console.error(
          "Share error:",
          err
        );

        alert(
          "Unable to share report."
        );
      } finally {
        setShareLoading(
          false
        );
      }
    };

  // ==========================================================
  // CLOSE
  // ==========================================================

  const close = () => {
    if (
      pdfLoading ||
      shareLoading
    ) {
      return;
    }

    onOpenChange(false);
  };

  // ==========================================================
  // NOT OPEN
  // ==========================================================

  if (!open) {
    return null;
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      className="student-report-overlay"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          close();
        }
      }}
    >
      <section className="student-report-modal">

        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="student-report-header">

          <div>

            <span className="student-report-eyebrow">
              EXAMMASTER • MENTOR
            </span>

            <h2>
              {title}
            </h2>

            <p>
              {owner?.name ||
                "Mentor"}{" "}
              • Section{" "}
              {owner?.section ||
                "N/A"}
            </p>

          </div>

          <button
            type="button"
            className="student-report-close"
            onClick={close}
            disabled={
              pdfLoading ||
              shareLoading
            }
          >
            <X size={19} />
          </button>

        </header>

        {/* ==================================================
            CONTENT
        ================================================== */}

        <div className="student-report-content">

          {/* =================================================
              SUMMARY
          ================================================= */}

          <div className="student-report-summary">

            <div className="student-report-stat">
              <Users size={17} />

              <div>
                <span>
                  TOTAL STUDENTS
                </span>

                <strong>
                  {reports.length ||
                    students.length}
                </strong>
              </div>
            </div>

            <div className="student-report-stat">
              <FileText size={17} />

              <div>
                <span>
                  TOTAL EXAMS
                </span>

                <strong>
                  {totalExams}
                </strong>
              </div>
            </div>

            <div className="student-report-stat">
              <span>
                SECTION AVERAGE
              </span>

              <strong>
                {sectionAverage}%
              </strong>
            </div>

          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (

            <div className="student-report-loading">

              <RefreshCw
                size={28}
                className="student-report-spin"
              />

              <h3>
                Loading student results...
              </h3>

              <p>
                Collecting subject-wise
                performance for all
                section students.
              </p>

            </div>

          ) : error ? (

            <div className="student-report-error">

              <FileText
                size={25}
              />

              <h3>
                Unable to load report
              </h3>

              <p>
                {error}
              </p>

              <button
                type="button"
                onClick={
                  loadReports
                }
              >
                Try Again
              </button>

            </div>

          ) : (

            <>

              {/* ===========================================
                  SUBJECT SUMMARY
              =========================================== */}

              {subjectSummary.length >
                0 && (
                <section className="student-report-block">

                  <div className="student-report-block-heading">

                    <div>
                      <span>
                        SECTION ANALYSIS
                      </span>

                      <h3>
                        Subject-wise Average
                      </h3>
                    </div>

                  </div>

                  <div className="student-report-subject-grid">

                    {subjectSummary.map(
                      (
                        item
                      ) => (
                        <div
                          key={
                            item.subject
                          }
                          className="student-report-subject-card"
                        >

                          <span>
                            {
                              item.subject
                            }
                          </span>

                          <strong>
                            {
                              item.average
                            }%
                          </strong>

                          <small>
                            {
                              item.exams
                            }{" "}
                            exam
                            {item.exams !==
                            1
                              ? "s"
                              : ""}
                          </small>

                        </div>
                      )
                    )}

                  </div>

                </section>
              )}

              {/* ===========================================
                  STUDENTS
              =========================================== */}

              <section className="student-report-block">

                <div className="student-report-block-heading">

                  <div>
                    <span>
                      STUDENT PERFORMANCE
                    </span>

                    <h3>
                      Subject-wise Results
                    </h3>
                  </div>

                  <p>
                    {
                      reports.length
                    }{" "}
                    Students
                  </p>

                </div>

                <div className="student-report-list">

                  {reports.map(
                    (
                      student,
                      index
                    ) => {

                      const average =
                        student
                          .results
                          .length
                          ? Number(
                              (
                                student.results.reduce(
                                  (
                                    sum,
                                    result
                                  ) =>
                                    sum +
                                    numberValue(
                                      result.percentage
                                    ),
                                  0
                                ) /
                                student
                                  .results
                                  .length
                              ).toFixed(
                                2
                              )
                            )
                          : 0;

                      const isExpanded =
                        Boolean(
                          expandedStudents[
                            student
                              .studentId
                          ]
                        );

                      return (
                        <article
                          key={
                            student.studentId
                          }
                          className="student-report-student"
                        >

                          <button
                            type="button"
                            className="student-report-student-head"
                            onClick={() =>
                              toggleStudent(
                                student.studentId
                              )
                            }
                          >

                            <div className="student-report-student-info">

                              <div className="student-report-avatar">
                                {
                                  getInitials(
                                    student.name
                                  )
                                }
                              </div>

                              <div>

                                <strong>
                                  {String(
                                    index +
                                      1
                                  ).padStart(
                                    2,
                                    "0"
                                  )}{" "}
                                  {
                                    student.name
                                  }
                                </strong>

                                <span>
                                  {
                                    student.studentId
                                  }{" "}
                                  •{" "}
                                  {
                                    student.className
                                  }{" "}
                                  • Section{" "}
                                  {
                                    student.section ||
                                    owner?.section ||
                                    "N/A"
                                  }
                                </span>

                              </div>

                            </div>

                            <div className="student-report-student-average">

                              <div>
                                <span>
                                  Average
                                </span>

                                <strong>
                                  {
                                    average
                                  }%
                                </strong>
                              </div>

                              {isExpanded ? (
                                <ChevronUp
                                  size={
                                    18
                                  }
                                />
                              ) : (
                                <ChevronDown
                                  size={
                                    18
                                  }
                                />
                              )}

                            </div>

                          </button>

                          {isExpanded && (
                            <div className="student-report-student-body">

                              {student
                                .results
                                .length ===
                              0 ? (

                                <div className="student-report-empty-result">

                                  <FileText
                                    size={
                                      20
                                    }
                                  />

                                  <span>
                                    No results available for this student.
                                  </span>

                                </div>

                              ) : (

                                <div className="student-report-table-wrap">

                                  <table className="student-report-table">

                                    <thead>
                                      <tr>
                                        <th>
                                          Subject
                                        </th>

                                        <th>
                                          Exam
                                        </th>

                                        <th>
                                          Date
                                        </th>

                                        <th>
                                          Marks
                                        </th>

                                        <th>
                                          %
                                        </th>

                                        <th>
                                          Grade
                                        </th>

                                        <th>
                                          Status
                                        </th>
                                      </tr>
                                    </thead>

                                    <tbody>

                                      {student.results.map(
                                        (
                                          result,
                                          resultIndex
                                        ) => (

                                          <tr
                                            key={
                                              result._id ||
                                              `${student.studentId}-${resultIndex}`
                                            }
                                          >

                                            <td>
                                              {
                                                result.subject ||
                                                "General"
                                              }
                                            </td>

                                            <td>
                                              {
                                                result.examName ||
                                                "Exam"
                                              }
                                            </td>

                                            <td>
                                              {formatDate(
                                                result.createdAt ||
                                                  result.submittedAt
                                              )}
                                            </td>

                                            <td>
                                              {numberValue(
                                                result.marks
                                              )}
                                            </td>

                                            <td>
                                              {numberValue(
                                                result.percentage
                                              )}
                                              %
                                            </td>

                                            <td>
                                              {
                                                result.grade ||
                                                "-"
                                              }
                                            </td>

                                            <td>
                                              <span
                                                className={
                                                  result.status
                                                    ?.toUpperCase() ===
                                                  "PASS"
                                                    ? "student-report-status pass"
                                                    : "student-report-status fail"
                                                }
                                              >
                                                {
                                                  result.status ||
                                                  "-"
                                                }
                                              </span>
                                            </td>

                                          </tr>

                                        )
                                      )}

                                    </tbody>

                                  </table>

                                </div>

                              )}

                            </div>
                          )}

                        </article>
                      );
                    }
                  )}

                </div>

              </section>

            </>
          )}

        </div>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <footer className="student-report-footer">

          <button
            type="button"
            className="student-report-download"
            onClick={
              handleDownload
            }
            disabled={
              loading ||
              pdfLoading ||
              shareLoading ||
              !reports.length
            }
          >

            {pdfLoading ? (
              <RefreshCw
                size={17}
                className="student-report-spin"
              />
            ) : (
              <Download size={17} />
            )}

            <span>
              {pdfLoading
                ? "Creating PDF..."
                : "Download PDF"}
            </span>

          </button>

          <button
            type="button"
            className="student-report-share"
            onClick={
              handleShare
            }
            disabled={
              loading ||
              pdfLoading ||
              shareLoading ||
              !reports.length
            }
          >

            {shareLoading ? (
              <RefreshCw
                size={17}
                className="student-report-spin"
              />
            ) : (
              <Share2 size={17} />
            )}

            <span>
              {shareLoading
                ? "Preparing..."
                : "Share Report"}
            </span>

          </button>

        </footer>

      </section>
    </div>
  );
}

