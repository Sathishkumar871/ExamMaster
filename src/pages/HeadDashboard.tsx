import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  FileText,
  GraduationCap,
  LayoutGrid,
  List,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import StudentReport from "../components/StudentReport/StudentReport";

import "./HeadDashboard.css";

// ============================================================
// API
// ============================================================

const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://exammaster-backend-up1y.onrender.com";

// ============================================================
// TYPES
// ============================================================

interface Staff {
  _id: string;
  name: string;
  mobile: string;
  role: string;
  department?: string;
  section?: string;
}

interface Student {
  _id: string;
  name: string;
  studentId: string;
  email?: string;
  password?: string;
  className?: string;
  classId?: string;
  section?: string;
  mentorName?: string;
  mentorId?: string;
}

interface Feedback {
  _id: string;

  studentId?: string;
  studentName?: string;

  className?: string;
  section?: string;

  assignedDepartment?: string;

  status?:
    | "PENDING"
    | "IN_PROGRESS"
    | "RESOLVED"
    | "ESCALATED";

  mentorActionPlan?: string;

  managementActionPlan?: string;
  directorActionPlan?: string;
  wardenActionPlan?: string;
  headActionPlan?: string;

  updatedBy?: string;
  updatedByRole?: string;

  resolvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SectionGroup {
  section: string;
  mentorName: string;
  students: Student[];
}

interface YearGroup {
  year: string;
  sections: SectionGroup[];
}

interface ReportStudent {
  studentId: string;
  name: string;
  className: string;
  section: string;
  classId?: string;
  mentorName?: string;
  mentorId?: string;
}

type StudentSort =
  | "name-asc"
  | "name-desc"
  | "id-asc"
  | "id-desc"
  | "class-asc"
  | "section-asc";

type DirectoryView =
  | "cards"
  | "table";

// ============================================================
// COMPONENT
// ============================================================

export default function HeadDashboard() {
  const navigate = useNavigate();

  // ==========================================================
  // DATA
  // ==========================================================

  const [pendingStaff, setPendingStaff] =
    useState<Staff[]>([]);

  const [students, setStudents] =
    useState<Student[]>([]);

  const [feedback, setFeedback] =
    useState<Feedback[]>([]);

  const [dashboardStats, setDashboardStats] =
    useState({
      totalStudents: 0,
      totalFeedback: 0,
    });

  // ==========================================================
  // COMMON UI
  // ==========================================================

  const [activeTab, setActiveTab] = useState<
    "staff" | "students" | "feedback"
  >("staff");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [showNotifications, setShowNotifications] =
    useState(false);

  // ==========================================================
  // STUDENT DIRECTORY FILTERS
  // ==========================================================

  const [searchQuery, setSearchQuery] =
    useState("");

  const [selectedYear, setSelectedYear] =
    useState("");

  const [selectedSection, setSelectedSection] =
    useState("");

  const [selectedMentor, setSelectedMentor] =
    useState("");

  const [sortBy, setSortBy] =
    useState<StudentSort>("name-asc");

  const [directoryView, setDirectoryView] =
    useState<DirectoryView>("cards");

  const [showAdvancedFilters, setShowAdvancedFilters] =
    useState(false);

  // ==========================================================
  // EXPANSION
  // ==========================================================

  const [expandedYears, setExpandedYears] =
    useState<Record<string, boolean>>({});

  const [expandedSections, setExpandedSections] =
    useState<Record<string, boolean>>({});

  // ==========================================================
  // SELECTION
  // ==========================================================

  const [selectedStudentIds, setSelectedStudentIds] =
    useState<Set<string>>(
      new Set()
    );

  // ==========================================================
  // REPORT
  // ==========================================================

  const [showStudentReport, setShowStudentReport] =
    useState(false);

  const [reportStudents, setReportStudents] =
    useState<ReportStudent[]>([]);

  // ==========================================================
  // PROFILE
  // ==========================================================

  const [selectedProfileStudent, setSelectedProfileStudent] =
    useState<Student | null>(null);

  // ==========================================================
  // TOKEN
  // ==========================================================

  const getToken = () => {
    return (
      localStorage.getItem("staffToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("teacherToken") ||
      localStorage.getItem("userToken") ||
      ""
    );
  };

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  const loadHeadData = async () => {
    try {
      setLoading(true);
      setMessage("");

      const token = getToken();

      if (!token) {
        setMessage(
          "Staff login required."
        );
        return;
      }

      // ======================================================
      // HEAD DASHBOARD
      // ======================================================

      const dashResponse = await fetch(
        `${API_BASE_URL}/api/head/dashboard`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      const dashData =
        await dashResponse
          .json()
          .catch(() => ({}));

      if (!dashResponse.ok) {
        throw new Error(
          dashData?.message ||
            "Unable to load head dashboard."
        );
      }

      if (dashData?.success) {
        const dashboard =
          dashData.dashboard || {};

        const loadedStudents =
          Array.isArray(
            dashData.students
          )
            ? dashData.students
            : [];

        // ====================================================
        // HEAD COMPLAINTS
        // ====================================================
        //
        // Preferred:
        // dashData.headComplaints
        //
        // Fallback:
        // filter dashData.feedback
        // using assignedDepartment === "head"
        //
        // ====================================================

        const loadedHeadComplaints: Feedback[] =
          Array.isArray(
            dashData.headComplaints
          )
            ? dashData.headComplaints
            : Array.isArray(
                dashData.feedback
              )
            ? dashData.feedback.filter(
                (item: Feedback) =>
                  String(
                    item.assignedDepartment ||
                      ""
                  )
                    .toLowerCase()
                    .trim() === "head"
              )
            : [];

        setDashboardStats({
          totalStudents:
            Number(
              dashboard.totalStudents
            ) ||
            loadedStudents.length,

          totalFeedback:
            Number(
              dashboard.totalHeadComplaints
            ) ||
            loadedHeadComplaints.length,
        });

        setStudents(
          loadedStudents
        );

        setFeedback(
          loadedHeadComplaints
        );
      }

      // ======================================================
      // PENDING STAFF
      // ======================================================

      const staffResponse =
        await fetch(
          `${API_BASE_URL}/api/head/pending-staff`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
          }
        );

      const staffData =
        await staffResponse
          .json()
          .catch(() => ({}));

      if (!staffResponse.ok) {
        throw new Error(
          staffData?.message ||
            "Unable to load pending staff."
        );
      }

      if (staffData?.success) {
        setPendingStaff(
          Array.isArray(
            staffData.staff
          )
            ? staffData.staff
            : []
        );
      }
    } catch (error: any) {
      console.error(
        "Head Dashboard Error:",
        error
      );

      setMessage(
        error?.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadHeadData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================================
  // REPORT-SAFE DATA
  // ==========================================================

  const allReportStudents =
    useMemo<ReportStudent[]>(() => {
      return students.map(
        (student) => ({
          studentId:
            student.studentId,

          name:
            student.name,

          className:
            student.className ||
            "",

          section:
            student.section ||
            "",

          classId:
            student.classId,

          mentorName:
            student.mentorName ||
            "",

          mentorId:
            student.mentorId,
        })
      );
    }, [students]);

  // ==========================================================
  // APPROVE STAFF
  // ==========================================================

  const approveStaff = async (
    id: string
  ) => {
    try {
      const token =
        getToken();

      const response =
        await fetch(
          `${API_BASE_URL}/api/head/approve/${id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
          }
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to approve staff."
        );
      }

      if (data?.success) {
        setMessage(
          "Staff Approved Successfully"
        );

        await loadHeadData();
      }
    } catch (error: any) {
      console.error(
        error
      );

      setMessage(
        error?.message ||
          "Unable to approve staff."
      );
    }
  };

  // ==========================================================
  // REJECT STAFF
  // ==========================================================

  const rejectStaff = async (
    id: string
  ) => {
    try {
      const token =
        getToken();

      const response =
        await fetch(
          `${API_BASE_URL}/api/head/reject/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
          }
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to reject staff."
        );
      }

      if (data?.success) {
        setMessage(
          "Staff Rejected Successfully"
        );

        await loadHeadData();
      }
    } catch (error: any) {
      console.error(
        error
      );

      setMessage(
        error?.message ||
          "Unable to reject staff."
      );
    }
  };

  // ==========================================================
  // RESOLVE HEAD COMPLAINT
  // ==========================================================

  const resolveComplaint = async (
    studentId: string
  ) => {
    try {
      if (!studentId) {
        setMessage(
          "Student ID not available for this complaint."
        );
        return;
      }

      const token =
        getToken();

      if (!token) {
        setMessage(
          "Staff login required."
        );
        return;
      }

      const actionPlan =
        window.prompt(
          "Enter Head resolution / comment:"
        );

      if (
        actionPlan === null
      ) {
        return;
      }

      const trimmedActionPlan =
        actionPlan.trim();

      if (!trimmedActionPlan) {
        setMessage(
          "Head resolution comment is required."
        );
        return;
      }

      const response =
        await fetch(
          `${API_BASE_URL}/department-feedback/student/${encodeURIComponent(
            studentId
          )}/resolve`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              headActionPlan:
                trimmedActionPlan,

              actionPlan:
                trimmedActionPlan,
            }),
          }
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to resolve complaint."
        );
      }

      if (data?.success) {
        setMessage(
          "Complaint resolved successfully."
        );

        await loadHeadData();
      } else {
        throw new Error(
          data?.message ||
            "Complaint resolution failed."
        );
      }
    } catch (error: any) {
      console.error(
        "HEAD RESOLVE COMPLAINT ERROR:",
        error
      );

      setMessage(
        error?.message ||
          "Unable to resolve complaint."
      );
    }
  };

  // ==========================================================
  // UNIQUE YEARS
  // ==========================================================

  const uniqueYears =
    useMemo(() => {
      return Array.from(
        new Set(
          students
            .map(
              (student) =>
                student.className
                  ?.trim()
            )
            .filter(Boolean)
        )
      ).sort((a, b) =>
        String(a).localeCompare(
          String(b),
          undefined,
          {
            numeric: true,
            sensitivity:
              "base",
          }
        )
      );
    }, [students]);

  // ==========================================================
  // UNIQUE SECTIONS
  // ==========================================================

  const uniqueSections =
    useMemo(() => {
      const source =
        selectedYear
          ? students.filter(
              (student) =>
                student.className ===
                selectedYear
            )
          : students;

      return Array.from(
        new Set(
          source
            .map(
              (student) =>
                student.section
                  ?.trim()
            )
            .filter(Boolean)
        )
      ).sort((a, b) =>
        String(a).localeCompare(
          String(b),
          undefined,
          {
            numeric: true,
            sensitivity:
              "base",
          }
        )
      );
    }, [
      students,
      selectedYear,
    ]);

  // ==========================================================
  // UNIQUE MENTORS
  // ==========================================================

  const uniqueMentors =
    useMemo(() => {
      return Array.from(
        new Set(
          students
            .map(
              (student) =>
                student.mentorName
                  ?.trim()
            )
            .filter(Boolean)
        )
      ).sort(
        (a, b) =>
          String(a).localeCompare(
            String(b),
            undefined,
            {
              sensitivity:
                "base",
            }
          )
      );
    }, [students]);

  // ==========================================================
  // FILTER + SORT
  // ==========================================================

  const filteredStudents =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      const result =
        students.filter(
          (student) => {
            const name =
              (
                student.name ||
                ""
              ).toLowerCase();

            const studentId =
              (
                student.studentId ||
                ""
              ).toLowerCase();

            const email =
              (
                student.email ||
                ""
              ).toLowerCase();

            const mentor =
              (
                student.mentorName ||
                ""
              ).toLowerCase();

            const className =
              (
                student.className ||
                ""
              ).toLowerCase();

            const section =
              (
                student.section ||
                ""
              ).toLowerCase();

            const matchesSearch =
              !query ||
              name.includes(
                query
              ) ||
              studentId.includes(
                query
              ) ||
              email.includes(
                query
              ) ||
              mentor.includes(
                query
              ) ||
              className.includes(
                query
              ) ||
              section.includes(
                query
              );

            const matchesYear =
              !selectedYear ||
              student.className ===
                selectedYear;

            const matchesSection =
              !selectedSection ||
              student.section ===
                selectedSection;

            const matchesMentor =
              !selectedMentor ||
              (
                student.mentorName ||
                ""
              ) ===
                selectedMentor;

            return (
              matchesSearch &&
              matchesYear &&
              matchesSection &&
              matchesMentor
            );
          }
        );

      return [
        ...result,
      ].sort(
        (a, b) => {
          switch (
            sortBy
          ) {
            case "name-desc":
              return (
                b.name || ""
              ).localeCompare(
                a.name || ""
              );

            case "id-asc":
              return (
                a.studentId || ""
              ).localeCompare(
                b.studentId || "",
                undefined,
                {
                  numeric:
                    true,
                  sensitivity:
                    "base",
                }
              );

            case "id-desc":
              return (
                b.studentId || ""
              ).localeCompare(
                a.studentId || "",
                undefined,
                {
                  numeric:
                    true,
                  sensitivity:
                    "base",
                }
              );

            case "class-asc":
              return (
                a.className ||
                ""
              ).localeCompare(
                b.className ||
                  "",
                undefined,
                {
                  numeric:
                    true,
                  sensitivity:
                    "base",
                }
              );

            case "section-asc":
              return (
                (
                  a.section ||
                  ""
                ).localeCompare(
                  b.section ||
                    "",
                  undefined,
                  {
                    numeric:
                      true,
                    sensitivity:
                      "base",
                  }
                )
              );

            case "name-asc":
            default:
              return (
                a.name || ""
              ).localeCompare(
                b.name || ""
              );
          }
        }
      );
    }, [
      students,
      searchQuery,
      selectedYear,
      selectedSection,
      selectedMentor,
      sortBy,
    ]);

  // ==========================================================
  // GROUPED STUDENTS
  // ==========================================================

  const groupedStudents =
    useMemo<YearGroup[]>(
      () => {
        const yearMap =
          new Map<
            string,
            Map<
              string,
              SectionGroup
            >
          >();

        filteredStudents.forEach(
          (student) => {
            const year =
              student.className?.trim() ||
              "Unknown Year";

            const section =
              student.section?.trim() ||
              "Unassigned";

            if (
              !yearMap.has(
                year
              )
            ) {
              yearMap.set(
                year,
                new Map<
                  string,
                  SectionGroup
                >()
              );
            }

            const sectionMap =
              yearMap.get(
                year
              )!;

            if (
              !sectionMap.has(
                section
              )
            ) {
              sectionMap.set(
                section,
                {
                  section,
                  mentorName:
                    student.mentorName?.trim() ||
                    "Not Assigned",
                  students: [],
                }
              );
            }

            const currentSection =
              sectionMap.get(
                section
              )!;

            if (
              student.mentorName &&
              student.mentorName.trim()
            ) {
              currentSection.mentorName =
                student.mentorName.trim();
            }

            currentSection.students.push(
              student
            );
          }
        );

        return Array.from(
          yearMap.entries()
        )
          .sort(
            (
              [yearA],
              [yearB]
            ) =>
              yearA.localeCompare(
                yearB,
                undefined,
                {
                  numeric:
                    true,
                  sensitivity:
                    "base",
                }
              )
          )
          .map(
            ([
              year,
              sectionMap,
            ]) => ({
              year,
              sections:
                Array.from(
                  sectionMap.values()
                )
                  .sort(
                    (
                      sectionA,
                      sectionB
                    ) =>
                      sectionA.section.localeCompare(
                        sectionB.section,
                        undefined,
                        {
                          numeric:
                            true,
                          sensitivity:
                            "base",
                        }
                      )
                  )
                  .map(
                    (
                      section
                    ) => ({
                      ...section,
                      students: [
                        ...section.students,
                      ].sort(
                        (
                          a,
                          b
                        ) =>
                          (
                            a.name ||
                            ""
                          ).localeCompare(
                            b.name ||
                              ""
                          )
                      ),
                    })
                  ),
            })
          );
      },
      [filteredStudents]
    );

  // ==========================================================
  // DIRECTORY STATS
  // ==========================================================

  const totalSections =
    useMemo(() => {
      return groupedStudents.reduce(
        (
          total,
          year
        ) =>
          total +
          year.sections.length,
        0
      );
    }, [groupedStudents]);

  const selectedCount =
    selectedStudentIds.size;

  const allFilteredSelected =
    filteredStudents.length >
      0 &&
    filteredStudents.every(
      (student) =>
        selectedStudentIds.has(
          student._id
        )
    );

  // ==========================================================
  // FEEDBACK
  // ==========================================================

  const getDaysDifference = (
    createdAt?: string
  ) => {
    if (!createdAt) {
      return 0;
    }

    const date =
      new Date(
        createdAt
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return 0;
    }

    return Math.ceil(
      (
        Date.now() -
        date.getTime()
      ) /
        (
          1000 *
          60 *
          60 *
          24
        )
    );
  };

  // ==========================================================
  // ACTIVE HEAD COMPLAINTS
  // ==========================================================

  const activeFeedback =
    useMemo(() => {
      return feedback
        .filter(
          (item) => {
            const department =
              String(
                item.assignedDepartment ||
                  ""
              )
                .toLowerCase()
                .trim();

            // ==================================================
            // ONLY HEAD COMPLAINTS
            // ==================================================

            if (
              department !==
              "head"
            ) {
              return false;
            }

            // ==================================================
            // RESOLVED COMPLAINTS HIDE FROM ACTIVE LIST
            // ==================================================

            if (
              item.status ===
              "RESOLVED"
            ) {
              return false;
            }

            // ==================================================
            // ONLY RECENT 15 DAYS
            // ==================================================

            return (
              getDaysDifference(
                item.createdAt
              ) <= 15
            );
          }
        )
        .sort(
          (a, b) => {
            const dateA =
              a.createdAt
                ? new Date(
                    a.createdAt
                  ).getTime()
                : 0;

            const dateB =
              b.createdAt
                ? new Date(
                    b.createdAt
                  ).getTime()
                : 0;

            return (
              dateB - dateA
            );
          }
        );
    }, [feedback]);

  // ==========================================================
  // YEAR TOGGLE
  // ==========================================================

  const toggleYear = (
    year: string
  ) => {
    setExpandedYears(
      (previous) => ({
        ...previous,
        [year]:
          previous[year] ===
          false,
      })
    );
  };

  // ==========================================================
  // SECTION TOGGLE
  // ==========================================================

  const toggleSection = (
    key: string
  ) => {
    setExpandedSections(
      (previous) => ({
        ...previous,
        [key]:
          previous[key] ===
          false,
      })
    );
  };

  // ==========================================================
  // EXPAND ALL
  // ==========================================================

  const expandAllDirectory =
    () => {
      const years: Record<
        string,
        boolean
      > = {};

      const sections: Record<
        string,
        boolean
      > = {};

      groupedStudents.forEach(
        (year) => {
          years[year.year] =
            true;

          year.sections.forEach(
            (section) => {
              sections[
                `${year.year}__${section.section}`
              ] = true;
            }
          );
        }
      );

      setExpandedYears(
        years
      );

      setExpandedSections(
        sections
      );
    };

  // ==========================================================
  // COLLAPSE ALL
  // ==========================================================

  const collapseAllDirectory =
    () => {
      const years: Record<
        string,
        boolean
      > = {};

      const sections: Record<
        string,
        boolean
      > = {};

      groupedStudents.forEach(
        (year) => {
          years[year.year] =
            false;

          year.sections.forEach(
            (section) => {
              sections[
                `${year.year}__${section.section}`
              ] = false;
            }
          );
        }
      );

      setExpandedYears(
        years
      );

      setExpandedSections(
        sections
      );
    };

  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  const clearDirectoryFilters =
    () => {
      setSearchQuery("");
      setSelectedYear("");
      setSelectedSection("");
      setSelectedMentor("");
      setSortBy(
        "name-asc"
      );
    };

  // ==========================================================
  // SELECT SINGLE STUDENT
  // ==========================================================

  const toggleStudentSelection = (
    studentId: string
  ) => {
    setSelectedStudentIds(
      (previous) => {
        const next =
          new Set(
            previous
          );

        if (
          next.has(
            studentId
          )
        ) {
          next.delete(
            studentId
          );
        } else {
          next.add(
            studentId
          );
        }

        return next;
      }
    );
  };

  // ==========================================================
  // SELECT ALL FILTERED
  // ==========================================================

  const toggleSelectAllFiltered =
    () => {
      setSelectedStudentIds(
        (previous) => {
          const next =
            new Set(
              previous
            );

          if (
            allFilteredSelected
          ) {
            filteredStudents.forEach(
              (student) => {
                next.delete(
                  student._id
                );
              }
            );
          } else {
            filteredStudents.forEach(
              (student) => {
                next.add(
                  student._id
                );
              }
            );
          }

          return next;
        }
      );
    };

  // ==========================================================
  // CLEAR SELECTION
  // ==========================================================

  const clearSelection =
    () => {
      setSelectedStudentIds(
        new Set()
      );
    };

  // ==========================================================
  // SELECT YEAR
  // ==========================================================

  const selectYearStudents = (
    year: YearGroup
  ) => {
    setSelectedStudentIds(
      (previous) => {
        const next =
          new Set(
            previous
          );

        const yearStudents =
          year.sections.flatMap(
            (section) =>
              section.students
          );

        const everySelected =
          yearStudents.every(
            (student) =>
              next.has(
                student._id
              )
          );

        yearStudents.forEach(
          (student) => {
            if (
              everySelected
            ) {
              next.delete(
                student._id
              );
            } else {
              next.add(
                student._id
              );
            }
          }
        );

        return next;
      }
    );
  };

  // ==========================================================
  // SELECT SECTION
  // ==========================================================

  const selectSectionStudents = (
    sectionStudents: Student[]
  ) => {
    setSelectedStudentIds(
      (previous) => {
        const next =
          new Set(
            previous
          );

        const everySelected =
          sectionStudents.every(
            (student) =>
              next.has(
                student._id
              )
          );

        sectionStudents.forEach(
          (student) => {
            if (
              everySelected
            ) {
              next.delete(
                student._id
              );
            } else {
              next.add(
                student._id
              );
            }
          }
        );

        return next;
      }
    );
  };

  // ==========================================================
  // REPORT FOR SELECTED
  // ==========================================================

  const openSelectedReport =
    () => {
      if (
        selectedStudentIds.size ===
        0
      ) {
        setMessage(
          "Please select at least one student."
        );
        return;
      }

      const selected =
        allReportStudents.filter(
          (student) => {
            const original =
              students.find(
                (item) =>
                  item.studentId ===
                  student.studentId
              );

            return (
              original &&
              selectedStudentIds.has(
                original._id
              )
            );
          }
        );

      setReportStudents(
        selected
      );

      setShowStudentReport(
        true
      );
    };

  // ==========================================================
  // REPORT FOR ALL
  // ==========================================================

  const openAllStudentsReport =
    () => {
      if (
        students.length ===
        0
      ) {
        setMessage(
          "No students available for the report."
        );
        return;
      }

      setReportStudents(
        allReportStudents
      );

      setShowStudentReport(
        true
      );
    };

  // ==========================================================
  // INDIVIDUAL REPORT
  // ==========================================================

  const openIndividualReport =
    (
      student: Student
    ) => {
      const converted: ReportStudent =
        {
          studentId:
            student.studentId,

          name:
            student.name,

          className:
            student.className ||
            "",

          section:
            student.section ||
            "",

          classId:
            student.classId,

          mentorName:
            student.mentorName ||
            "",

          mentorId:
            student.mentorId,
        };

      setReportStudents(
        [converted]
      );

      setShowStudentReport(
        true
      );
    };

  // ==========================================================
  // COPY STUDENT ID
  // ==========================================================

  const copyStudentId =
    async (
      studentId: string
    ) => {
      try {
        await navigator.clipboard.writeText(
          studentId
        );

        setMessage(
          `Student ID ${studentId} copied.`
        );
      } catch {
        setMessage(
          "Unable to copy Student ID."
        );
      }
    };

  // ==========================================================
  // CSV EXPORT
  // ==========================================================

  const exportStudentsCSV =
    () => {
      if (
        filteredStudents.length ===
        0
      ) {
        setMessage(
          "No students available to export."
        );
        return;
      }

      const headers = [
        "Student ID",
        "Name",
        "Class",
        "Section",
        "Mentor",
        "Email",
      ];

      const rows =
        filteredStudents.map(
          (student) => [
            student.studentId,
            student.name,
            student.className ||
              "",
            student.section ||
              "",
            student.mentorName ||
              "",
            student.email ||
              "",
          ]
        );

      const escapeCSV =
        (value: string) =>
          `"${String(
            value ?? ""
          ).replaceAll(
            '"',
            '""'
          )}"`;

      const csv = [
        headers.map(
          escapeCSV
        ),
        ...rows.map(
          (row) =>
            row.map(
              escapeCSV
            )
        ),
      ]
        .map(
          (row) =>
            row.join(",")
        )
        .join("\n");

      const blob =
        new Blob(
          [csv],
          {
            type:
              "text/csv;charset=utf-8;",
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href =
        url;

      link.download =
        "STG_Student_Directory.csv";

      document.body.appendChild(
        link
      );

      link.click();

      document.body.removeChild(
        link
      );

      URL.revokeObjectURL(
        url
      );

      setMessage(
        "Student directory exported successfully."
      );
    };

  // ==========================================================
  // PROFILE
  // ==========================================================

  const openStudentProfile =
    (
      student: Student
    ) => {
      setSelectedProfileStudent(
        student
      );
    };

  // ==========================================================
  // RETURN
  // ==========================================================

  return (
    <div className="head-dashboard-container">

      {/* ====================================================
          BACKGROUND
      ==================================================== */}

      <div className="head-dashboard-glow head-dashboard-glow-one" />

      <div className="head-dashboard-glow head-dashboard-glow-two" />

      {/* ====================================================
          HEADER
      ==================================================== */}

      <header className="dashboard-header">

        <div className="welcome-text">

          <div className="head-brand-line">

            <div className="head-brand-icon">
              <GraduationCap
                size={21}
              />
            </div>

            <span>
              EXAMMASTER • Director
            </span>

          </div>

          <h1>
            Welcome Director 
          </h1>

          <p>
            Manage academic operations,
            students, staff and
            institutional performance
            from one place.
          </p>

        </div>

        <div className="header-actions-wrapper">

          <div className="quick-action-buttons">

            <button
              type="button"
              className="premium-btn btn-primary"
              onClick={() =>
                navigate(
                  "/create-exam"
                )
              }
            >
              📝 Create Exam
            </button>

            <button
              type="button"
              className="premium-btn btn-secondary"
              onClick={() =>
                navigate(
                  "/question-bank"
                )
              }
            >
              📚 Question Bank
            </button>

            <button
              type="button"
              className="premium-btn btn-report"
              onClick={
                openAllStudentsReport
              }
              disabled={
                students.length ===
                0
              }
            >
              <FileText
                size={16}
              />

              <span>
                All Students Report
              </span>

            </button>

          </div>

          <div className="notification-wrapper">

            <button
              type="button"
              className="notification-bell-btn"
              onClick={() =>
                setShowNotifications(
                  (value) =>
                    !value
                )
              }
            >

              <Bell
                size={19}
              />

              {pendingStaff.length >
                0 && (
                <span className="notification-badge">
                  {
                    pendingStaff.length
                  }
                </span>
              )}

            </button>

            {showNotifications && (

              <div className="notification-dropdown">

                <h4>
                  Notifications
                </h4>

                {pendingStaff.length ===
                0 ? (

                  <p className="no-notif">
                    No new notifications
                  </p>

                ) : (

                  pendingStaff.map(
                    (staff) => (

                      <div
                        key={
                          staff._id
                        }
                        className="notif-item"
                        onClick={() => {
                          setActiveTab(
                            "staff"
                          );

                          setShowNotifications(
                            false
                          );
                        }}
                      >

                        <p className="notif-title">
                          New Staff Request
                        </p>

                        <p className="notif-desc">
                          {
                            staff.name
                          }{" "}
                          (
                          {
                            staff.role
                          }
                          )
                        </p>

                      </div>

                    )
                  )

                )}

              </div>

            )}

          </div>

        </div>

      </header>

      {/* ====================================================
          STATS
      ==================================================== */}

      <div className="stats-grid">

        <div className="stat-box">

          <div className="stat-icon blue">
            <Users
              size={21}
            />
          </div>

          <div>

            <h3>
              Total Students
            </h3>

            <p>
              {
                dashboardStats.totalStudents
              }
            </p>

          </div>

        </div>

        <div className="stat-box">

          <div className="stat-icon red">
            ⚠️
          </div>

          <div>

            <h3>
              Active Complaints
            </h3>

            <p>
              {
                activeFeedback.length
              }
            </p>

          </div>

        </div>

        <div className="stat-box">

          <div className="stat-icon gold">
            <BookOpen
              size={21}
            />
          </div>

          <div>

            <h3>
              Years / Classes
            </h3>

            <p>
              {
                uniqueYears.length
              }
            </p>

          </div>

        </div>

        <div className="stat-box">

          <div className="stat-icon green">
            <ShieldCheck
              size={21}
            />
          </div>

          <div>

            <h3>
              Sections
            </h3>

            <p>
              {
                new Set(
                  students
                    .map(
                      (
                        student
                      ) =>
                        `${student.className || ""}__${student.section || ""}`
                    )
                ).size
              }
            </p>

          </div>

        </div>

      </div>

      {/* ====================================================
          MESSAGE
      ==================================================== */}

      {message && (

        <div className="alert-banner">

          <span>
            {message}
          </span>

          <button
            type="button"
            onClick={() =>
              setMessage("")
            }
          >
            ×
          </button>

        </div>

      )}

      {/* ====================================================
          TABS
      ==================================================== */}

      <div className="tabs-container">

        <button
          type="button"
          className={`tab-button ${
            activeTab ===
            "staff"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setActiveTab(
              "staff"
            )
          }
        >
          Staff Approvals
          <span>
            {
              pendingStaff.length
            }
          </span>
        </button>

        <button
          type="button"
          className={`tab-button ${
            activeTab ===
            "students"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setActiveTab(
              "students"
            )
          }
        >
          Student Directory
          <span>
            {
              students.length
            }
          </span>
        </button>

        <button
          type="button"
          className={`tab-button ${
            activeTab ===
            "feedback"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setActiveTab(
              "feedback"
            )
          }
        >
          Mentor Complaints
          <span>
            {
              activeFeedback.length
            }
          </span>
        </button>

      </div>

      {/* ====================================================
          STAFF
      ==================================================== */}

      {activeTab ===
        "staff" && (

        <section className="content-card">

          <div className="section-heading">

            <div>

              <span>
                STAFF MANAGEMENT
              </span>

              <h2>
                Pending Staff Approvals
              </h2>

            </div>

            <span className="heading-count">
              {
                pendingStaff.length
              }{" "}
              Pending
            </span>

          </div>

          {pendingStaff.length ===
          0 ? (

            <p className="empty-text">
              No Pending Requests Found
            </p>

          ) : (

            <div className="grid-list">

              {pendingStaff.map(
                (staff) => (

                  <div
                    key={
                      staff._id
                    }
                    className="item-card"
                  >

                    <div className="item-info">

                      <h3>
                        {
                          staff.name
                        }
                      </h3>

                      <p>
                        <strong>
                          Role:
                        </strong>{" "}
                        {
                          staff.role
                        }
                      </p>

                      <p>
                        <strong>
                          Mobile:
                        </strong>{" "}
                        {
                          staff.mobile
                        }
                      </p>

                      <p>
                        <strong>
                          Department:
                        </strong>{" "}
                        {
                          staff.department ||
                          "N/A"
                        }
                      </p>

                      <p>
                        <strong>
                          Section:
                        </strong>{" "}
                        {
                          staff.section ||
                          "N/A"
                        }
                      </p>

                    </div>

                    <div className="action-buttons">

                      <button
                        type="button"
                        onClick={() =>
                          approveStaff(
                            staff._id
                          )
                        }
                        className="btn-approve"
                      >
                        Accept
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          rejectStaff(
                            staff._id
                          )
                        }
                        className="btn-reject"
                      >
                        Reject
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      )}

      {/* ====================================================
          STUDENT DIRECTORY
      ==================================================== */}

      {activeTab ===
        "students" && (

        <section className="content-card head-student-directory">

          {/* ==================================================
              DIRECTORY HERO
          ================================================== */}

          <div className="student-directory-hero">

            <div className="student-directory-title">

              <div className="directory-icon-large">
                <Users
                  size={24}
                />
              </div>

              <div>

                <span>
                  ACADEMIC COMMAND CENTER
                </span>

                <h2>
                  Student Directory
                </h2>

                <p>
                  Manage every student,
                  organized by year,
                  section and mentor.
                </p>

              </div>

            </div>

            <div className="directory-hero-actions">

              <button
                type="button"
                className="directory-top-btn"
                onClick={
                  loadHeadData
                }
              >
                <RefreshCw
                  size={15}
                  className={
                    loading
                      ? "head-spin"
                      : ""
                  }
                />
                Refresh
              </button>

            </div>

          </div>

          {/* ==================================================
              MINI STATS
          ================================================== */}

          <div className="directory-mini-stats">

            <div className="directory-mini-stat">
              <span>
                TOTAL
              </span>

              <strong>
                {
                  students.length
                }
              </strong>

              <small>
                Students
              </small>
            </div>

            <div className="directory-mini-stat">
              <span>
                FILTERED
              </span>

              <strong>
                {
                  filteredStudents.length
                }
              </strong>

              <small>
                Current view
              </small>
            </div>

            <div className="directory-mini-stat">
              <span>
                YEARS
              </span>

              <strong>
                {
                  uniqueYears.length
                }
              </strong>

              <small>
                Academic classes
              </small>
            </div>

            <div className="directory-mini-stat">
              <span>
                MENTORS
              </span>

              <strong>
                {
                  uniqueMentors.length
                }
              </strong>

              <small>
                Assigned mentors
              </small>
            </div>

            <div className="directory-mini-stat selected-stat">
              <span>
                SELECTED
              </span>

              <strong>
                {
                  selectedCount
                }
              </strong>

              <small>
                For bulk report
              </small>
            </div>

          </div>

          {/* ==================================================
              FILTER PANEL
          ================================================== */}

          <div className="directory-control-panel">

            <div className="directory-primary-controls">

              <div className="directory-search-large">

                <Search
                  size={17}
                />

                <input
                  type="text"
                  value={
                    searchQuery
                  }
                  onChange={(
                    event
                  ) =>
                    setSearchQuery(
                      event.target.value
                    )
                  }
                  placeholder="Search by name, Student ID, email, class, section or mentor..."
                />

                {searchQuery && (

                  <button
                    type="button"
                    onClick={() =>
                      setSearchQuery(
                        ""
                      )
                    }
                    className="search-clear-btn"
                  >
                    <X
                      size={14}
                    />
                  </button>

                )}

              </div>

              <button
                type="button"
                className={`advanced-filter-btn ${
                  showAdvancedFilters
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setShowAdvancedFilters(
                    (value) =>
                      !value
                  )
                }
              >

                <SlidersHorizontal
                  size={15}
                />

                Filters

              </button>

              <div className="directory-view-switcher">

                <button
                  type="button"
                  className={
                    directoryView ===
                    "cards"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setDirectoryView(
                      "cards"
                    )
                  }
                  title="Card view"
                >
                  <LayoutGrid
                    size={15}
                  />
                </button>

                <button
                  type="button"
                  className={
                    directoryView ===
                    "table"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setDirectoryView(
                      "table"
                    )
                  }
                  title="Table view"
                >
                  <List
                    size={15}
                  />
                </button>

              </div>

            </div>

            {showAdvancedFilters && (

              <div className="directory-filter-grid">

                <div className="directory-filter-item">

                  <label>
                    Year / Class
                  </label>

                  <select
                    value={
                      selectedYear
                    }
                    onChange={(
                      event
                    ) => {

                      setSelectedYear(
                        event.target.value
                      );

                      setSelectedSection(
                        ""
                      );
                    }}
                  >

                    <option value="">
                      All Years / Classes
                    </option>

                    {uniqueYears.map(
                      (
                        year
                      ) => (
                        <option
                          key={
                            year
                          }
                          value={
                            year
                          }
                        >
                          {
                            year
                          }
                        </option>
                      )
                    )}

                  </select>

                </div>

                <div className="directory-filter-item">

                  <label>
                    Section
                  </label>

                  <select
                    value={
                      selectedSection
                    }
                    onChange={(
                      event
                    ) =>
                      setSelectedSection(
                        event.target.value
                      )
                    }
                  >

                    <option value="">
                      All Sections
                    </option>

                    {uniqueSections.map(
                      (
                        section
                      ) => (
                        <option
                          key={
                            section
                          }
                          value={
                            section
                          }
                        >
                          Section{" "}
                          {
                            section
                          }
                        </option>
                      )
                    )}

                  </select>

                </div>

                <div className="directory-filter-item">

                  <label>
                    Mentor
                  </label>

                  <select
                    value={
                      selectedMentor
                    }
                    onChange={(
                      event
                    ) =>
                      setSelectedMentor(
                        event.target.value
                      )
                    }
                  >

                    <option value="">
                      All Mentors
                    </option>

                    {uniqueMentors.map(
                      (
                        mentor
                      ) => (
                        <option
                          key={
                            mentor
                          }
                          value={
                            mentor
                          }
                        >
                          {
                            mentor
                          }
                        </option>
                      )
                    )}

                  </select>

                </div>

                <div className="directory-filter-item">

                  <label>
                    Sort Students
                  </label>

                  <select
                    value={
                      sortBy
                    }
                    onChange={(
                      event
                    ) =>
                      setSortBy(
                        event.target.value as StudentSort
                      )
                    }
                  >

                    <option value="name-asc">
                      Name A → Z
                    </option>

                    <option value="name-desc">
                      Name Z → A
                    </option>

                    <option value="id-asc">
                      Student ID ↑
                    </option>

                    <option value="id-desc">
                      Student ID ↓
                    </option>

                    <option value="class-asc">
                      Class
                    </option>

                    <option value="section-asc">
                      Section
                    </option>

                  </select>

                </div>

                <div className="directory-filter-actions">

                  <button
                    type="button"
                    onClick={
                      clearDirectoryFilters
                    }
                  >
                    Reset Filters
                  </button>

                </div>

              </div>

            )}

          </div>

          {/* ==================================================
              BULK ACTION BAR
          ================================================== */}

          <div className="directory-bulk-bar">

            <div className="bulk-left">

              <label className="bulk-select-all">

                <input
                  type="checkbox"
                  checked={
                    allFilteredSelected
                  }
                  onChange={
                    toggleSelectAllFiltered
                  }
                />

                <span>
                  Select all visible
                </span>

              </label>

              <span className="bulk-divider">
                |
              </span>

              <span className="bulk-selected-text">

                <strong>
                  {
                    selectedCount
                  }
                </strong>{" "}
                selected

              </span>

            </div>

            <div className="bulk-actions">

              {selectedCount >
                0 && (

                <button
                  type="button"
                  className="bulk-clear-btn"
                  onClick={
                    clearSelection
                  }
                >
                  <X
                    size={14}
                  />
                  Clear
                </button>

              )}

              <button
                type="button"
                className="bulk-report-btn"
                disabled={
                  selectedCount ===
                  0
                }
                onClick={
                  openSelectedReport
                }
              >
                <FileText
                  size={14}
                />
                Report{" "}
                {
                  selectedCount > 0
                    ? `(${selectedCount})`
                    : ""
                }
              </button>

            </div>

          </div>

          {/* ==================================================
              DIRECTORY TOOLBAR
          ================================================== */}

          <div className="directory-secondary-toolbar">

            <div className="directory-result-label">

              <strong>
                {
                  filteredStudents.length
                }
              </strong>

              <span>
                students found
              </span>

              {(selectedYear ||
                selectedSection ||
                selectedMentor ||
                searchQuery) && (

                <span className="active-filter-badge">
                  Filters active
                </span>

              )}

            </div>

            <div className="directory-expand-actions">

              <button
                type="button"
                onClick={
                  expandAllDirectory
                }
              >
                <ChevronDown
                  size={14}
                />
                Expand All
              </button>

              <button
                type="button"
                onClick={
                  collapseAllDirectory
                }
              >
                <ChevronRight
                  size={14}
                />
                Collapse All
              </button>

            </div>

          </div>

          {/* ==================================================
              EMPTY STATE
          ================================================== */}

          {filteredStudents.length ===
          0 ? (

            <div className="empty-directory-state premium-empty">

              <div className="empty-directory-icon">
                <Search
                  size={29}
                />
              </div>

              <h3>
                No students found
              </h3>

              <p>
                No student matches your
                current search or filters.
              </p>

              <button
                type="button"
                onClick={
                  clearDirectoryFilters
                }
              >
                Clear Filters
              </button>

            </div>

          ) : (

            <>

              {/* ==============================================
                  CARD VIEW
              ============================================== */}

              {directoryView ===
                "cards" && (

                <div className="year-group-list">

                  {groupedStudents.map(
                    (
                      yearGroup
                    ) => {

                      const yearOpen =
                        expandedYears[
                          yearGroup.year
                        ] !==
                        false;

                      const yearStudentCount =
                        yearGroup.sections.reduce(
                          (
                            total,
                            section
                          ) =>
                            total +
                            section.students
                              .length,
                          0
                        );

                      const yearSelected =
                        yearGroup.sections
                          .flatMap(
                            (
                              section
                            ) =>
                              section.students
                          )
                          .every(
                            (
                              student
                            ) =>
                              selectedStudentIds.has(
                                student._id
                              )
                          );

                      return (

                        <div
                          key={
                            yearGroup.year
                          }
                          className="year-group premium-year-group"
                        >

                          {/* YEAR HEADER */}

                          <div className="premium-year-header">

                            <button
                              type="button"
                              className="year-header-main"
                              onClick={() =>
                                toggleYear(
                                  yearGroup.year
                                )
                              }
                            >

                              <div className="year-icon premium">
                                <GraduationCap
                                  size={21}
                                />
                              </div>

                              <div className="year-title-block">

                                <span>
                                  ACADEMIC YEAR / CLASS
                                </span>

                                <h3>
                                  {
                                    yearGroup.year
                                  }
                                </h3>

                              </div>

                              <div className="year-header-counts">

                                <span>
                                  {
                                    yearGroup.sections
                                      .length
                                  }{" "}
                                  Sections
                                </span>

                                <strong>
                                  {
                                    yearStudentCount
                                  }{" "}
                                  Students
                                </strong>

                              </div>

                              {yearOpen ? (
                                <ChevronDown
                                  size={18}
                                />
                              ) : (
                                <ChevronRight
                                  size={18}
                                />
                              )}

                            </button>

                            <button
                              type="button"
                              className={`year-select-btn ${
                                yearSelected
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() =>
                                selectYearStudents(
                                  yearGroup
                                )
                              }
                              title="Select all students in this year"
                            >

                              {yearSelected ? (
                                <Check
                                  size={14}
                                />
                              ) : (
                                <span />
                              )}

                            </button>

                          </div>

                          {yearOpen && (

                            <div className="section-group-list premium-section-list">

                              {yearGroup.sections.map(
                                (
                                  sectionGroup
                                ) => {

                                  const sectionKey =
                                    `${yearGroup.year}__${sectionGroup.section}`;

                                  const sectionOpen =
                                    expandedSections[
                                      sectionKey
                                    ] !==
                                    false;

                                  const sectionSelected =
                                    sectionGroup.students.length >
                                      0 &&
                                    sectionGroup.students.every(
                                      (
                                        student
                                      ) =>
                                        selectedStudentIds.has(
                                          student._id
                                        )
                                    );

                                  return (

                                    <div
                                      key={
                                        sectionKey
                                      }
                                      className="section-group premium-section-group"
                                    >

                                      {/* SECTION HEADER */}

                                      <div className="premium-section-header">

                                        <button
                                          type="button"
                                          className="section-header-main"
                                          onClick={() =>
                                            toggleSection(
                                              sectionKey
                                            )
                                          }
                                        >

                                          <div className="section-letter premium">
                                            {
                                              sectionGroup.section
                                                .slice(
                                                  0,
                                                  1
                                                )
                                                .toUpperCase()
                                            }
                                          </div>

                                          <div className="section-heading-info">

                                            <span>
                                              SECTION
                                            </span>

                                            <h4>
                                              Section{" "}
                                              {
                                                sectionGroup.section
                                              }
                                            </h4>

                                          </div>

                                          <div className="premium-mentor-box">

                                            <span>
                                              MENTOR
                                            </span>

                                            <strong>
                                              {
                                                sectionGroup.mentorName
                                              }
                                            </strong>

                                          </div>

                                          <div className="premium-section-student-count">

                                            <Users
                                              size={13}
                                            />

                                            {
                                              sectionGroup
                                                .students
                                                .length
                                            }

                                          </div>

                                          {sectionOpen ? (
                                            <ChevronDown
                                              size={16}
                                            />
                                          ) : (
                                            <ChevronRight
                                              size={16}
                                            />
                                          )}

                                        </button>

                                        <button
                                          type="button"
                                          className={`section-select-btn ${
                                            sectionSelected
                                              ? "selected"
                                              : ""
                                          }`}
                                          onClick={() =>
                                            selectSectionStudents(
                                              sectionGroup.students
                                            )
                                          }
                                        >

                                          {sectionSelected ? (
                                            <Check
                                              size={13}
                                            />
                                          ) : (
                                            <span />
                                          )}

                                        </button>

                                      </div>

                                      {/* STUDENTS */}

                                      {sectionOpen && (

                                        <div className="section-student-grid premium-student-grid">

                                          {sectionGroup.students.map(
                                            (
                                              student,
                                              index
                                            ) => {

                                              const selected =
                                                selectedStudentIds.has(
                                                  student._id
                                                );

                                              return (

                                                <article
                                                  key={
                                                    student._id
                                                  }
                                                  className={`head-student-card premium-student-card ${
                                                    selected
                                                      ? "selected-student-card"
                                                      : ""
                                                  }`}
                                                >

                                                  <div className="student-card-selection-row">

                                                    <label className="student-check-wrap">

                                                      <input
                                                        type="checkbox"
                                                        checked={
                                                          selected
                                                        }
                                                        onChange={() =>
                                                          toggleStudentSelection(
                                                            student._id
                                                          )
                                                        }
                                                      />

                                                      <span className="custom-check">
                                                        {selected && (
                                                          <Check
                                                            size={11}
                                                          />
                                                        )}
                                                      </span>

                                                    </label>

                                                    <span className="student-number">
                                                      {String(
                                                        index +
                                                          1
                                                      ).padStart(
                                                        2,
                                                        "0"
                                                      )}
                                                    </span>

                                                  </div>

                                                  <div className="premium-student-identity">

                                                    <div className="head-student-avatar premium-avatar">

                                                      {student.name
                                                        ?.trim()
                                                        .slice(
                                                          0,
                                                          2
                                                        )
                                                        .toUpperCase() ||
                                                        "ST"}

                                                    </div>

                                                    <div className="premium-student-name-wrap">

                                                      <h5>
                                                        {
                                                          student.name
                                                        }
                                                      </h5>

                                                      <p>
                                                        {
                                                          student.studentId
                                                        }
                                                      </p>

                                                    </div>

                                                  </div>

                                                  <div className="student-academic-pills">

                                                    <span>
                                                      {
                                                        student.className ||
                                                        "N/A"
                                                      }
                                                    </span>

                                                    <span>
                                                      Sec{" "}
                                                      {
                                                        student.section ||
                                                        "N/A"
                                                      }
                                                    </span>

                                                  </div>

                                                  <div className="premium-student-email">

                                                    {student.email
                                                      ? student.email
                                                      : "No email available"}

                                                  </div>

                                                  <div className="premium-card-mentor">

                                                    <span>
                                                      MENTOR
                                                    </span>

                                                    <strong>
                                                      {
                                                        student.mentorName ||
                                                        sectionGroup.mentorName ||
                                                        "Not Assigned"
                                                      }
                                                    </strong>

                                                  </div>

                                                  <div className="student-card-actions">

                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        openStudentProfile(
                                                          student
                                                        )
                                                      }
                                                    >
                                                      <UserRound
                                                        size={13}
                                                      />
                                                      Profile
                                                    </button>

                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        openIndividualReport(
                                                          student
                                                        )
                                                      }
                                                    >
                                                      <FileText
                                                        size={13}
                                                      />
                                                      Report
                                                    </button>

                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        copyStudentId(
                                                          student.studentId
                                                        )
                                                      }
                                                    >
                                                      <Copy
                                                        size={13}
                                                      />
                                                      ID
                                                    </button>

                                                  </div>

                                                </article>

                                              );
                                            }
                                          )}

                                        </div>

                                      )}

                                    </div>

                                  );
                                }
                              )}

                            </div>

                          )}

                        </div>

                      );
                    }
                  )}

                </div>

              )}

              {/* ==============================================
                  TABLE VIEW
              ============================================== */}

              {directoryView ===
                "table" && (

                <div className="student-table-shell">

                  <div className="student-table-scroll">

                    <table className="student-directory-table">

                      <thead>

                        <tr>

                          <th className="table-check-col">
                            <input
                              type="checkbox"
                              checked={
                                allFilteredSelected
                              }
                              onChange={
                                toggleSelectAllFiltered
                              }
                            />
                          </th>

                          <th>
                            #
                          </th>

                          <th>
                            Student
                          </th>

                          <th>
                            Student ID
                          </th>

                          <th>
                            Class
                          </th>

                          <th>
                            Section
                          </th>

                          <th>
                            Mentor
                          </th>

                          <th>
                            Email
                          </th>

                          <th>
                            Actions
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {filteredStudents.map(
                          (
                            student,
                            index
                          ) => {

                            const selected =
                              selectedStudentIds.has(
                                student._id
                              );

                            return (

                              <tr
                                key={
                                  student._id
                                }
                                className={
                                  selected
                                    ? "selected-row"
                                    : ""
                                }
                              >

                                <td>

                                  <input
                                    type="checkbox"
                                    checked={
                                      selected
                                    }
                                    onChange={() =>
                                      toggleStudentSelection(
                                        student._id
                                      )
                                    }
                                  />

                                </td>

                                <td>
                                  {
                                    index +
                                      1
                                  }
                                </td>

                                <td>

                                  <div className="table-student-cell">

                                    <div className="table-avatar">
                                      {student.name
                                        ?.slice(
                                          0,
                                          2
                                        )
                                        .toUpperCase() ||
                                        "ST"}
                                    </div>

                                    <div>

                                      <strong>
                                        {
                                          student.name
                                        }
                                      </strong>

                                      <span>
                                        {
                                          student.email ||
                                          "No email"
                                        }
                                      </span>

                                    </div>

                                  </div>

                                </td>

                                <td>

                                  <button
                                    type="button"
                                    className="table-id-btn"
                                    onClick={() =>
                                      copyStudentId(
                                        student.studentId
                                      )
                                    }
                                  >

                                    {
                                      student.studentId
                                    }

                                    <Copy
                                      size={12}
                                    />

                                  </button>

                                </td>

                                <td>
                                  {
                                    student.className ||
                                    "N/A"
                                  }
                                </td>

                                <td>
                                  {
                                    student.section ||
                                    "N/A"
                                  }
                                </td>

                                <td>

                                  <span className="table-mentor-chip">
                                    {
                                      student.mentorName ||
                                      "Not Assigned"
                                    }
                                  </span>

                                </td>

                                <td>

                                  <span className="table-email">
                                    {
                                      student.email ||
                                      "—"
                                    }
                                  </span>

                                </td>

                                <td>

                                  <div className="table-action-buttons">

                                    <button
                                      type="button"
                                      onClick={() =>
                                        openStudentProfile(
                                          student
                                        )
                                      }
                                      title="Student profile"
                                    >
                                      <UserRound
                                        size={14}
                                      />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        openIndividualReport(
                                          student
                                        )
                                      }
                                      title="Student report"
                                    >
                                      <FileText
                                        size={14}
                                      />
                                    </button>

                                  </div>

                                </td>

                              </tr>

                            );
                          }
                        )}

                      </tbody>

                    </table>

                  </div>

                </div>

              )}

            </>

          )}

        </section>

      )}

      {/* ====================================================
          MENTOR COMPLAINTS
      ==================================================== */}

      {activeTab ===
        "feedback" && (

        <section className="content-card">

          <div className="section-heading">

            <div>

              <span>
                MENTOR COMPLAINTS
              </span>

              <h2>
                Mentor Complaints
              </h2>

              <p>
                Complaints raised by mentors
                and sent directly to the Head.
              </p>

            </div>

            <span className="heading-count">
              {
                activeFeedback.length
              }{" "}
              Active
            </span>

          </div>

          {activeFeedback.length ===
          0 ? (

            <div className="premium-empty">

              <p className="empty-text">
                No Active Mentor Complaints
              </p>

            </div>

          ) : (

            <div className="grid-list">

              {activeFeedback.map(
                (fb) => (

                  <div
                    key={
                      fb._id
                    }
                    className="item-card"
                  >

                    {/* ========================================
                        COMPLAINT HEADER
                    ======================================== */}

                    <div className="feedback-header">

                      <span className="mentor-name">

                        From:
                        {" "}
                        Mentor

                      </span>

                      <span className="badge pending">

                        {fb.status ===
                        "IN_PROGRESS"
                          ? "🔄 In Progress"
                          : "⏳ Pending"}

                      </span>

                    </div>

                    {/* ========================================
                        STUDENT + COMPLAINT
                    ======================================== */}

                    <div className="feedback-body">

                      <p>
                        <strong>
                          Student:
                        </strong>{" "}
                        {
                          fb.studentName ||
                          "Unknown Student"
                        }
                      </p>

                      <p>
                        <strong>
                          Student ID:
                        </strong>{" "}
                        {
                          fb.studentId ||
                          "N/A"
                        }
                      </p>

                      <p>
                        <strong>
                          Class:
                        </strong>{" "}
                        {
                          fb.className ||
                          "N/A"
                        }
                      </p>

                      <p>
                        <strong>
                          Section:
                        </strong>{" "}
                        {
                          fb.section ||
                          "N/A"
                        }
                      </p>

                      <p>
                        <strong>
                          Sent To:
                        </strong>{" "}
                        HEAD
                      </p>

                      <p>
                        <strong>
                          Mentor Complaint:
                        </strong>{" "}
                        {
                          fb.mentorActionPlan ||
                          "No mentor complaint/comment provided."
                        }
                      </p>

                    </div>

                    {/* ========================================
                        HEAD RESPONSE
                    ======================================== */}

                    {fb.headActionPlan && (

                      <div className="feedback-body">

                        <p>
                          <strong>
                            Head Response:
                          </strong>{" "}
                          {
                            fb.headActionPlan
                          }
                        </p>

                      </div>

                    )}

                    {/* ========================================
                        FOOTER
                    ======================================== */}

                    <div className="feedback-item-footer">

                      <span className="feedback-footer">

                        {fb.createdAt
                          ? new Date(
                              fb.createdAt
                            ).toLocaleDateString(
                              "en-IN"
                            )
                          : ""}

                      </span>

                      {fb.status !==
                        "RESOLVED" && (

                        <button
                          type="button"
                          onClick={() =>
                            resolveComplaint(
                              fb.studentId ||
                                ""
                            )
                          }
                          className="btn-resolve"
                          disabled={
                            !fb.studentId
                          }
                        >

                          <Check
                            size={15}
                          />

                          Resolve & Comment

                        </button>

                      )}

                      {fb.status ===
                        "RESOLVED" && (

                        <span className="badge resolved">
                          ✓ Resolved
                        </span>

                      )}

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      )}

      {/* ====================================================
          STUDENT PROFILE MODAL
      ==================================================== */}

      {selectedProfileStudent && (

        <div
          className="student-profile-overlay"
          onMouseDown={(
            event
          ) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedProfileStudent(
                null
              );
            }

          }}
        >

          <div className="student-profile-modal">

            <div className="student-profile-modal-header">

              <div>

                <span>
                  STUDENT PROFILE
                </span>

                <h3>
                  Student Information
                </h3>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedProfileStudent(
                    null
                  )
                }
              >
                <X
                  size={18}
                />
              </button>

            </div>

            <div className="student-profile-main">

              <div className="profile-large-avatar">

                {selectedProfileStudent.name
                  ?.trim()
                  .slice(
                    0,
                    2
                  )
                  .toUpperCase() ||
                  "ST"}

              </div>

              <div>

                <h4>
                  {
                    selectedProfileStudent.name
                  }
                </h4>

                <p>
                  {
                    selectedProfileStudent.studentId
                  }
                </p>

              </div>

            </div>

            <div className="student-profile-grid">

              <div>

                <span>
                  CLASS / YEAR
                </span>

                <strong>
                  {
                    selectedProfileStudent.className ||
                    "N/A"
                  }
                </strong>

              </div>

              <div>

                <span>
                  SECTION
                </span>

                <strong>
                  {
                    selectedProfileStudent.section ||
                    "N/A"
                  }
                </strong>

              </div>

              <div>

                <span>
                  MENTOR
                </span>

                <strong>
                  {
                    selectedProfileStudent.mentorName ||
                    "Not Assigned"
                  }
                </strong>

              </div>

              <div>

                <span>
                  EMAIL
                </span>

                <strong>
                  {
                    selectedProfileStudent.email ||
                    "No email available"
                  }
                </strong>

              </div>

            </div>

            <div className="student-profile-actions">

              <button
                type="button"
                onClick={() =>
                  copyStudentId(
                    selectedProfileStudent.studentId
                  )
                }
              >
                <Copy
                  size={14}
                />
                Copy Student ID
              </button>

              <button
                type="button"
                onClick={() => {

                  const student =
                    selectedProfileStudent;

                  setSelectedProfileStudent(
                    null
                  );

                  openIndividualReport(
                    student
                  );

                }}
              >
                <FileText
                  size={14}
                />
                View Performance Report
              </button>

            </div>

          </div>

        </div>

      )}

      {/* ====================================================
          REPORT
      ==================================================== */}

      <StudentReport
        students={
          reportStudents
        }
        owner={{
          name: "Head",
          section:
            reportStudents.length ===
            students.length
              ? "All Sections"
              : "Selected Students",
        }}
        apiBaseUrl={
          API_BASE_URL
        }
        open={
          showStudentReport
        }
        onOpenChange={
          setShowStudentReport
        }
        title="Head • Student Performance Report"
      />

      {/* ====================================================
          LOADING
      ==================================================== */}

      {loading && (

        <div className="head-loading-indicator">

          <RefreshCw
            size={15}
            className="head-spin"
          />

          <span>
            Updating dashboard...
          </span>

        </div>

      )}

    </div>
  );
}