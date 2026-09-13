import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  ArrowRightLeft,
  Award,
  BellRing,
  BookOpenCheck,
  Building2,
  Clock3,
  LibraryBig,
  BarChart3,
  MessageCircleWarning,
  CircleCheckBig,
  ChevronDown,
  ChevronRight,
  Copy,
  Files,
  GraduationCap,
  LayoutGrid,
  List,
  RotateCw,
  Search,
  ShieldCheck,
  History,
  MessageSquareText,
  SlidersHorizontal,
  UserRound,
  UserRoundCheck,
  UserRoundX,
  UserMinus,
  UserPlus,
  Trash2,
  UsersRound,
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
  createdAt?: string;
  updatedAt?: string;
}

interface Mentor extends Staff {
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  studentCount?: number;
  lastLoginAt?: string;
  createdAt?: string;
  mentorId?: string;
}

interface MentorHistory {
  _id: string;
  mentorId?: string;
  mentorName: string;
  role?: string;
  action:
    | "ACCEPTED"
    | "REJECTED"
    | "DEACTIVATED"
    | "REACTIVATED"
    | "DELETED"
    | "TRANSFERRED";
  reason?: string;
  performedBy?: string;
  performedByRole?: string;
  replacementMentorId?: string;
  replacementMentorName?: string;
  oldSection?: string;
  newSection?: string;
  transferredStudentCount?: number;
  transferredStudentIds?: string[];
  createdAt?: string;
}

interface StudentResult {
  _id?: string;
  examName?: string;
  testCategory?: string;
  subject?: string;
  chapter?: string;
  percentage?: number;
  marks?: number;
  status?: string;
  createdAt?: string;
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
  mentorCode?: string;
  mentorAssignedAt?: string;
  previousMentorId?: string;
  previousMentorName?: string;
  previousSection?: string;
  createdAt?: string;
  updatedAt?: string;
  resultCount?: number;
  averagePercentage?: number;
  passedResults?: number;
  failedResults?: number;
  results?: StudentResult[];
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

  const [mentors, setMentors] =
    useState<Mentor[]>([]);

  const [mentorHistory, setMentorHistory] =
    useState<MentorHistory[]>([]);

  const [mentorHistoryStats, setMentorHistoryStats] =
    useState({
      accepted: 0,
      rejected: 0,
      deactivated: 0,
      reactivated: 0,
      deleted: 0,
      transferred: 0,
    });

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
    "staff" | "mentors" | "students" | "feedback"
  >("staff");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [showHistoryModal, setShowHistoryModal] =
    useState(false);

  const [selectedHistoryEntry, setSelectedHistoryEntry] =
    useState<MentorHistory | null>(null);

  const [historyFilter, setHistoryFilter] =
    useState<
      | "ALL"
      | "ACCEPTED"
      | "REJECTED"
      | "DEACTIVATED"
      | "REACTIVATED"
      | "DELETED"
      | "TRANSFERRED"
    >("ALL");

  const [selectedMentorAccount, setSelectedMentorAccount] =
    useState<Mentor | null>(null);

  const [mentorSubTab, setMentorSubTab] =
    useState<"students" | "results" | "sections" | "complaints">("students");

  const [mentorSectionFilter, setMentorSectionFilter] =
    useState<string>("");

  const [mentorDetails, setMentorDetails] = useState<any | null>(null);
  const [mentorDetailsLoading, setMentorDetailsLoading] = useState(false);

  const [showMentorActionModal, setShowMentorActionModal] = useState(false);
  const [mentorActionType, setMentorActionType] = useState<"delete" | "transfer" | null>(null);
  const [mentorActionTarget, setMentorActionTarget] = useState<Mentor | null>(null);
  const [replacementMentorId, setReplacementMentorId] = useState("");
  const [mentorActionReason, setMentorActionReason] = useState("");
  const [transferSection, setTransferSection] = useState("");

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

      // ======================================================
      // MENTOR MANAGEMENT
      // ======================================================
      // Expected backend: GET /api/head/mentors
      // The endpoint should return active/inactive mentor accounts.
      try {
        const mentorResponse = await fetch(
          `${API_BASE_URL}/api/head/mentors`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const mentorData = await mentorResponse
          .json()
          .catch(() => ({}));

        if (mentorResponse.ok && mentorData?.success) {
          const loadedMentors = Array.isArray(mentorData.mentors)
            ? mentorData.mentors
            : Array.isArray(mentorData.staff)
              ? mentorData.staff
              : [];
          setMentors(loadedMentors);
        }
      } catch (mentorError) {
        console.warn("Mentor list unavailable:", mentorError);
      }

      // ======================================================
      // MENTOR APPROVAL / SECURITY HISTORY
      // ======================================================
      // Expected backend: GET /api/head/mentor-history
      
try {
  const historyResponse = await fetch(
    `${API_BASE_URL}/api/head/mentor-history`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const historyData = await historyResponse
    .json()
    .catch(() => ({}));

  if (historyResponse.ok && historyData?.success) {
    const loadedHistory: MentorHistory[] = Array.isArray(
      historyData.history
    )
      ? historyData.history
      : [];

    setMentorHistory(loadedHistory);

    setMentorHistoryStats({
      accepted:
        Number(historyData.stats?.accepted) ||
        loadedHistory.filter(
          (x: MentorHistory) =>
            x.action === "ACCEPTED"
        ).length,

      rejected:
        Number(historyData.stats?.rejected) ||
        loadedHistory.filter(
          (x: MentorHistory) =>
            x.action === "REJECTED"
        ).length,

      deactivated:
        Number(historyData.stats?.deactivated) ||
        loadedHistory.filter(
          (x: MentorHistory) =>
            x.action === "DEACTIVATED"
        ).length,

      reactivated:
        Number(historyData.stats?.reactivated) ||
        loadedHistory.filter(
          (x: MentorHistory) =>
            x.action === "REACTIVATED"
        ).length,

      deleted:
        Number(historyData.stats?.deleted) ||
        loadedHistory.filter(
          (x: MentorHistory) =>
            x.action === "DELETED"
        ).length,

      transferred:
        Number(historyData.stats?.transferred) ||
        loadedHistory.filter(
          (x: MentorHistory) =>
            x.action === "TRANSFERRED"
        ).length,
    });
  }
 } catch (historyError) {
  console.warn(
    "Mentor history unavailable:",
    historyError
  );
}

    } catch (error: any) {
      console.error("HEAD DASHBOARD LOAD ERROR:", error);
      setMessage(error?.message || "Unable to load head dashboard.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadHeadData();

    const liveSyncTimer = window.setInterval(() => {
      loadHeadData();
    }, 5000);

    return () => {
      window.clearInterval(liveSyncTimer);
    };

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
  // DEACTIVATE / REACTIVATE MENTOR ACCOUNT
  // ==========================================================

  const changeMentorAccess = async (
    mentor: Mentor,
    action: "deactivate" | "reactivate"
  ) => {
    const token = getToken();

    if (!token) {
      setMessage("Staff login required.");
      return;
    }

    const label = action === "deactivate" ? "DEACTIVATE" : "REACTIVATE";

    if (!window.confirm(`${label} mentor account?\n\nMentor: ${mentor.name}`)) {
      return;
    }

    const reason = window.prompt(
      `Enter the reason for ${action === "deactivate" ? "deactivation" : "reactivation"}:`
    );

    if (reason === null || !reason.trim()) {
      setMessage("Reason is required for this security action.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/head/mentors/${encodeURIComponent(mentor._id)}/${action}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: reason.trim(),
            revokeSessions: action === "deactivate",
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || `Unable to ${action} mentor account.`);
      }

      setMessage(
        action === "deactivate"
          ? "Mentor account deactivated successfully."
          : "Mentor account reactivated successfully."
      );

      if (selectedMentorAccount?._id === mentor._id) {
        setSelectedMentorAccount(null);
        setMentorDetails(null);
      }

      await loadHeadData();
    } catch (error: any) {
      console.error("MENTOR ACCESS ERROR:", error);
      setMessage(error?.message || `Unable to ${action} mentor account.`);
    }
  };

  // ==========================================================
  // OPEN MENTOR DETAILS
  // ==========================================================

  const openMentorDetails = async (mentor: Mentor) => {
    setSelectedMentorAccount(mentor);
    setMentorSectionFilter("");
    setMentorSubTab("students");
    setMentorDetails(null);
    setMentorDetailsLoading(true);

    try {
      const token = getToken();
      const response = await fetch(
        `${API_BASE_URL}/api/head/mentors/${encodeURIComponent(mentor._id)}/details`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to load mentor details.");
      }

      setMentorDetails(data);
    } catch (error: any) {
      console.error("MENTOR DETAILS ERROR:", error);
      setMessage(error?.message || "Unable to load mentor details.");
    } finally {
      setMentorDetailsLoading(false);
    }
  };

  // ==========================================================
  // OPEN DELETE / TRANSFER MODAL
  // ==========================================================

  const openMentorAction = (mentor: Mentor, action: "delete" | "transfer") => {
    setMentorActionTarget(mentor);
    setMentorActionType(action);
    setReplacementMentorId("");
    setMentorActionReason("");
    setTransferSection("");
    setShowMentorActionModal(true);
  };

    // ==========================================================
  // EXECUTE DELETE / TRANSFER
  // ==========================================================

  const executeMentorAction = async () => {
    if (!mentorActionTarget || !mentorActionType) {
      return;
    }

    const token = getToken();

    if (!token) {
      setMessage("Staff login required.");
      return;
    }

    if (!mentorActionReason.trim()) {
      setMessage(
        "Reason is required for this security action."
      );
      return;
    }

    const isDelete =
      mentorActionType === "delete";

    // Replacement mentor is required only when
    // transferring students.
    if (
      !isDelete &&
      !replacementMentorId
    ) {
      setMessage(
        "Please select a replacement mentor."
      );
      return;
    }

    if (
      !isDelete &&
      replacementMentorId ===
        mentorActionTarget._id
    ) {
      setMessage(
        "Old mentor and replacement mentor cannot be the same."
      );
      return;
    }

    try {
      const endpoint = isDelete
        ? `${API_BASE_URL}/api/head/mentors/${encodeURIComponent(
            mentorActionTarget._id
          )}`
        : `${API_BASE_URL}/api/head/mentors/${encodeURIComponent(
            mentorActionTarget._id
          )}/transfer`;

      const response =
        await fetch(endpoint, {
          method: isDelete
            ? "DELETE"
            : "PATCH",

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            ...(isDelete
              ? {}
              : {
                  replacementMentorId,
                  section:
                    transferSection
                      .trim() ||
                    undefined,
                }),

            reason:
              mentorActionReason.trim(),
          }),
        });

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (
        !response.ok ||
        !data?.success
      ) {
        throw new Error(
          data?.message ||
            `Unable to ${
              isDelete
                ? "delete"
                : "transfer"
            } mentor.`
        );
      }

      setShowMentorActionModal(false);

      setMentorActionTarget(null);

      setMentorActionType(null);

      setReplacementMentorId("");

      setMentorActionReason("");

      setTransferSection("");

      setMessage(
        isDelete
          ? `Mentor ${mentorActionTarget.name} deleted successfully.`
          : `Students transferred from ${mentorActionTarget.name} successfully.`
      );

      setSelectedMentorAccount(null);

      setMentorDetails(null);

      await loadHeadData();

    } catch (error: any) {
      console.error(
        "MENTOR ACTION ERROR:",
        error
      );

      setMessage(
        error?.message ||
          "Mentor action failed."
      );
    }
  };


  // ==========================================================
  // CHANGE STUDENT SECTION / MENTOR
  // ==========================================================

  const changeStudentSection = async (student: Student) => {
    const token = getToken();
    if (!token) {
      setMessage("Staff login required.");
      return;
    }

    const newSection = window.prompt(
      `Current section: ${student.section || "Not Assigned"}\nEnter new section:`
    );

    if (newSection === null || !newSection.trim()) return;

    const newMentor = window.prompt(
      `Current mentor: ${student.mentorName || "Not Assigned"}\nEnter replacement Mentor ID (leave blank to keep current mentor):`
    );

    const reason = window.prompt(
      "Enter reason for section / mentor change:"
    );

    if (reason === null || !reason.trim()) {
      setMessage("Reason is required for section change.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/head/students/${encodeURIComponent(student.studentId)}/change-section`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newSection: newSection.trim(),
            newMentorId: newMentor?.trim() || undefined,
            reason: reason.trim(),
          }),
        }
      );

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to change student section.");
      }

      setMessage("Student section updated successfully.");
      await loadHeadData();
      if (selectedMentorAccount) {
        await openMentorDetails(selectedMentorAccount);
      }
    } catch (error: any) {
      console.error("CHANGE STUDENT SECTION ERROR:", error);
      setMessage(error?.message || "Unable to change student section.");
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
  // MENTOR COUNTS
  // ==========================================================

  const activeMentors = useMemo(
    () =>
      mentors.filter(
        (mentor) =>
          !mentor.status || mentor.status === "ACTIVE"
      ),
    [mentors]
  );

  const inactiveMentors = useMemo(
    () =>
      mentors.filter(
        (mentor) => mentor.status && mentor.status !== "ACTIVE"
      ),
    [mentors]
  );

  const liveMentorCount = activeMentors.length;

  const openOverview = (target: "staff" | "mentors" | "students" | "feedback") => {
    setActiveTab(target);
    setShowHistoryModal(false);
    setSelectedMentorAccount(null);
    setMentorSectionFilter("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openHistoryFromOverview = (
    filter:
      | "ALL"
      | "ACCEPTED"
      | "REJECTED"
      | "DEACTIVATED"
      | "REACTIVATED"
      | "DELETED"
      | "TRANSFERRED"
  ) => {
    setActiveTab("staff");
    setHistoryFilter(filter);
    setShowHistoryModal(true);
    setSelectedMentorAccount(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
              STG PU COLLEGE • Director
            </span>

          </div>

          <h1>
            Welcome, Director
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
              className="directory-top-btn"
              onClick={loadHeadData}
            >
              <RotateCw size={15} className={loading ? "head-spin" : ""} />
              Refresh
            </button>

            <button
              type="button"
              className="directory-top-btn question-bank-header-btn"
              onClick={() => navigate("/question-bank")}
            >
              <LibraryBig size={15} />
              Question Bank
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

              <BellRing
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
          DASHBOARD OVERVIEW
      ==================================================== */}

      <section className="content-card dashboard-overview-card">
        <div className="section-heading">
          <div>
            <span>DASHBOARD OVERVIEW</span>
            <h2>College Administration Overview</h2>
            <p>
              {activeTab === "staff"
                ? "Staff approvals selected — overview shows approval totals and history actions."
                : activeTab === "mentors"
                  ? "Mentor management selected — overview shows live accounts, assignment totals and section coverage."
                  : activeTab === "students"
                    ? "Student directory selected — overview follows the current student filters and selection."
                    : "Mentor complaints selected — overview shows complaint status totals."}
            </p>
          </div>

          <div className="section-heading-actions">
            
           
            
             
              
              
              
           
          </div>
        </div>

        {activeTab === "staff" && (
          <div className="stats-grid">
            <button type="button" className="stat-box overview-stat-button active" onClick={() => { setHistoryFilter("ALL"); setShowHistoryModal(true); }}>
              <div className="stat-icon premium-icon blue"><History size={21} /></div>
              <div><h3>Total History</h3><p>{mentorHistory.length}</p><small>Open complete Staff History</small></div>
            </button>
            <button type="button" className="stat-box overview-stat-button" onClick={() => openHistoryFromOverview("ACCEPTED")}>
              <div className="stat-icon premium-icon green"><CircleCheckBig size={21} /></div>
              <div><h3>Accepted</h3><p>{mentorHistoryStats.accepted}</p><small>Open Accepted history</small></div>
            </button>
            <button type="button" className="stat-box overview-stat-button" onClick={() => openHistoryFromOverview("REJECTED")}>
              <div className="stat-icon premium-icon red"><X size={21} /></div>
              <div><h3>Rejected</h3><p>{mentorHistoryStats.rejected}</p><small>Open Rejected history</small></div>
            </button>
            <button type="button" className="stat-box overview-stat-button" onClick={() => openOverview("staff")}><div className="stat-icon premium-icon gold"><UsersRound size={21} /></div><div><h3>Pending</h3><p>{pendingStaff.length}</p><small>Open pending staff approvals</small></div></button>
            <button type="button" className="stat-box overview-stat-button" onClick={() => openOverview("mentors")}><div className="stat-icon premium-icon blue"><UserRoundCheck size={21} /></div><div><h3>Live Mentors</h3><p>{liveMentorCount}</p><small>Open Mentor Management</small></div></button>
            <button type="button" className="stat-box overview-stat-button" onClick={() => { setHistoryFilter("DEACTIVATED"); setShowHistoryModal(true); }}><div className="stat-icon premium-icon green"><CircleCheckBig size={21} /></div><div><h3>Deactivated</h3><p>{mentorHistoryStats.deactivated}</p><small>Open deactivation history</small></div></button>
            <button type="button" className="stat-box overview-stat-button" onClick={() => { setHistoryFilter("REACTIVATED"); setShowHistoryModal(true); }}><div className="stat-icon premium-icon blue"><RotateCw size={21} /></div><div><h3>Reactivated</h3><p>{mentorHistoryStats.reactivated}</p><small>Open reactivation history</small></div></button>
          </div>
        )}

        {activeTab === "mentors" && (
          <div className="stats-grid">
            <button type="button" className="stat-box overview-stat-button active" onClick={() => openOverview("mentors")}>
              <div className="stat-icon premium-icon green"><UserRoundCheck size={21} /></div>
              <div><h3>Live Mentors</h3><p>{liveMentorCount}</p><small>Open live mentor accounts</small></div>
            </button>
            <div className="stat-box"><div className="stat-icon premium-icon gold"><UsersRound size={21} /></div><div><h3>Total Mentors</h3><p>{mentors.length}</p><small>All mentor accounts</small></div></div>
            <div className="stat-box"><div className="stat-icon premium-icon red"><UserRoundX size={21} /></div><div><h3>Inactive Mentors</h3><p>{inactiveMentors.length}</p><small>Inactive / suspended</small></div></div>
            <div className="stat-box"><div className="stat-icon premium-icon blue"><UsersRound size={21} /></div><div><h3>Assigned Students</h3><p>{students.filter((s) => !!s.mentorId || !!s.mentorName).length}</p><small>Students with mentor assignment</small></div></div>
            <div className="stat-box"><div className="stat-icon premium-icon red"><Files size={21} /></div><div><h3>Active Complaints</h3><p>{activeFeedback.length}</p><small>Complaints currently open</small></div></div>
            <div className="stat-box"><div className="stat-icon premium-icon gold"><LibraryBig size={21} /></div><div><h3>Sections Covered</h3><p>{new Set(activeMentors.map((m) => `${m.department || ""}__${m.section || ""}`)).size}</p><small>Active mentor sections</small></div></div>
          </div>
        )}

        {activeTab === "students" && (
          <div className="stats-grid">
            <div className="stat-box"><div className="stat-icon premium-icon blue"><UsersRound size={21} /></div><div><h3>Total Students</h3><p>{students.length}</p><small>All students</small></div></div>
            <div className="stat-box"><div className="stat-icon premium-icon green"><Search size={21} /></div><div><h3>Filtered Students</h3><p>{filteredStudents.length}</p><small>Current directory result</small></div></div>
            <div className="stat-box"><div className="stat-icon premium-icon gold"><LibraryBig size={21} /></div><div><h3>Years / Classes</h3><p>{uniqueYears.length}</p><small>Current directory data</small></div></div>
            <div className="stat-box"><div className="stat-icon premium-icon blue"><ShieldCheck size={21} /></div><div><h3>Sections</h3><p>{new Set(filteredStudents.map((s) => `${s.className || ""}__${s.section || ""}`)).size}</p><small>Current filtered sections</small></div></div>
            <div className="stat-box"><div className="stat-icon premium-icon green"><UserRoundCheck size={21} /></div><div><h3>Mentors</h3><p>{new Set(filteredStudents.map((s) => s.mentorId || s.mentorName).filter(Boolean)).size}</p><small>Mentors represented in result</small></div></div>
            <div className="stat-box"><div className="stat-icon premium-icon gold"><CircleCheckBig size={21} /></div><div><h3>Selected</h3><p>{selectedCount}</p><small>For performance report</small></div></div>
          </div>
        )}

        {activeTab === "feedback" && (
          <div className="stats-grid">
            <div className="stat-box"><div className="stat-icon premium-icon red"><MessageCircleWarning size={21} /></div><div><h3>Active</h3><p>{activeFeedback.length}</p><small>Currently visible complaints</small></div></div>
            <div className="stat-box"><div className="stat-icon premium-icon gold"><History size={21} /></div><div><h3>Pending</h3><p>{feedback.filter((f) => f.status === "PENDING").length}</p><small>Awaiting resolution</small></div></div>
            <div className="stat-box"><div className="stat-icon premium-icon blue"><RotateCw size={21} /></div><div><h3>In Progress</h3><p>{feedback.filter((f) => f.status === "IN_PROGRESS").length}</p><small>Being handled</small></div></div>
            <div className="stat-box"><div className="stat-icon premium-icon green"><CircleCheckBig size={21} /></div><div><h3>Resolved</h3><p>{feedback.filter((f) => f.status === "RESOLVED").length}</p><small>Completed complaints</small></div></div>
            <div className="stat-box"><div className="stat-icon premium-icon red"><ShieldCheck size={21} /></div><div><h3>Escalated</h3><p>{feedback.filter((f) => f.status === "ESCALATED").length}</p><small>Escalated cases</small></div></div>
            <div className="stat-box"><div className="stat-icon premium-icon gold"><Files size={21} /></div><div><h3>Total Complaints</h3><p>{feedback.length}</p><small>All Head complaint records</small></div></div>
          </div>
        )}
      </section>

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
          MAIN TABS
      ==================================================== */}

      <div className="tabs-container">

        <button
          type="button"
          className={`tab-button ${activeTab === "staff" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("staff");
            setHistoryFilter("ALL");
            setSelectedMentorAccount(null);
            window.scrollTo({ top: document.querySelector(".tabs-container")?.getBoundingClientRect().top ? window.scrollY + (document.querySelector(".tabs-container")?.getBoundingClientRect().top || 0) - 100 : 0, behavior: "smooth" });
          }}
        >
          Staff Approvals
          <span>{pendingStaff.length}</span>
        </button>

        <button
          type="button"
          className={`tab-button ${activeTab === "mentors" ? "active" : ""}`}
          onClick={() => openOverview("mentors")}
        >
          Mentor Management
          <span>{liveMentorCount}</span>
        </button>

        <button
          type="button"
          className={`tab-button ${activeTab === "students" ? "active" : ""}`}
          onClick={() => openOverview("students")}
        >
          Student Directory
          <span>{students.length}</span>
        </button>

        <button
          type="button"
          className={`tab-button ${activeTab === "feedback" ? "active" : ""}`}
          onClick={() => openOverview("feedback")}
        >
          Mentor Complaints
          <span>{activeFeedback.length}</span>
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

            <div className="section-heading-actions">
              <span className="heading-count">
                {pendingStaff.length}{" "}Pending
              </span>

              <button
                type="button"
                className="directory-top-btn"
                onClick={() => { setHistoryFilter("ALL"); setShowHistoryModal(true); }}
              >
                <History size={15} />
                History
              </button>
            </div>

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

                      <p>
                        <strong>
                          Request Date:
                        </strong>{" "}
                        {
                          staff.createdAt
                            ? new Date(staff.createdAt).toLocaleString("en-IN")
                            : "N/A"
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
          MENTOR MANAGEMENT
      ==================================================== */}

      {activeTab === "mentors" && (
        <section className="content-card">

          <div className="section-heading">
            <div>
              <span>MENTOR MANAGEMENT</span>
              <h2>Mentor Management</h2>
              <p>
                Live mentors, account status, assignments, performance, sections and mentor complaints.
              </p>
            </div>

            <span className="heading-count">
              {liveMentorCount} Live Mentors
            </span>
          </div>

          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-icon premium-icon blue"><UserRoundCheck size={21} /></div>
              <div><h3>Mentors Live</h3><p>{liveMentorCount}</p></div>
            </div>
            <div className="stat-box">
              <div className="stat-icon premium-icon gold"><UsersRound size={21} /></div>
              <div><h3>Total Mentors</h3><p>{mentors.length}</p></div>
            </div>
            <div className="stat-box">
              <div className="stat-icon premium-icon red"><UserRoundX size={21} /></div>
              <div><h3>Inactive</h3><p>{inactiveMentors.length}</p></div>
            </div>
            <div className="stat-box">
              <div className="stat-icon premium-icon green"><UsersRound size={21} /></div>
              <div><h3>Total Students</h3><p>{students.length}</p></div>
            </div>
          </div>

          {mentors.length === 0 ? (
            <div className="premium-empty">
              <p className="empty-text">No mentor accounts found.</p>
            </div>
          ) : (
            <div className="grid-list">
              {mentors.map((mentor) => {
                const mentorStudents = students.filter((student) =>
                  mentor._id === student.mentorId ||
                  (!!mentor.name && student.mentorName?.trim().toLowerCase() === mentor.name.trim().toLowerCase())
                );

                const mentorComplaints = feedback.filter((fb) =>
                  !!fb.studentId && mentorStudents.some((student) => student.studentId === fb.studentId)
                );

                const active = !mentor.status || mentor.status === "ACTIVE";

                return (
                  <article key={mentor._id} className={`item-card premium-card-mentor ${active ? "is-active" : "is-inactive"}`}>
                    <div className="premium-mentor-box">
                      <div className="premium-mentor-topline">
                        <div className="premium-mentor-identity">
                          <div className="head-student-avatar premium-avatar mentor-avatar">
                            {mentor.name?.charAt(0)?.toUpperCase() || "M"}
                          </div>
                          <div className="premium-mentor-title">
                            <div className="premium-mentor-kicker">MENTOR ACCOUNT</div>
                            <button type="button" className="mentor-name-link premium-mentor-name" onClick={() => openMentorDetails(mentor)}>
                              {mentor.name}
                            </button>
                            <div className="premium-mentor-subline">
                              <span><Building2 size={14} /> {mentor.department || "Department not assigned"}</span>
                              <span><BookOpenCheck size={14} /> Section {mentor.section || "N/A"}</span>
                            </div>
                          </div>
                        </div>

                        <span className={`mentor-status-pill ${active ? "active" : "inactive"}`}>
                          <span className="mentor-status-dot" />
                          {active ? "LIVE" : mentor.status || "INACTIVE"}
                        </span>
                      </div>

                      <div className="premium-mentor-metrics">
                        <div className="mentor-metric-card">
                          <div className="mentor-metric-icon students"><UsersRound size={18} /></div>
                          <div><span>Students</span><strong>{mentor.studentCount ?? mentorStudents.length}</strong></div>
                        </div>
                        <div className="mentor-metric-card">
                          <div className="mentor-metric-icon complaints"><MessageSquareText size={18} /></div>
                          <div><span>Complaints</span><strong>{mentorComplaints.length}</strong></div>
                        </div>
                        <div className="mentor-metric-card">
                          <div className="mentor-metric-icon login"><Clock3 size={18} /></div>
                          <div><span>Last Login</span><strong>{mentor.lastLoginAt ? new Date(mentor.lastLoginAt).toLocaleDateString("en-IN") : "Never"}</strong></div>
                        </div>
                      </div>

                      <div className="premium-mentor-meta">
                        <span><History size={13} /> Joined {mentor.createdAt ? new Date(mentor.createdAt).toLocaleDateString("en-IN") : "N/A"}</span>
                        <span><ShieldCheck size={13} /> {active ? "Account access enabled" : "Account access restricted"}</span>
                      </div>

                      <div className="premium-mentor-actions">
                        <button type="button" className="mentor-action primary" onClick={() => openMentorDetails(mentor)}>
                          <span className="mentor-action-icon"><UserRound size={16} /></span>
                          <span><strong>Open Mentor</strong><small>View complete profile</small></span>
                        </button>

                        {active ? (
                          <button type="button" className="mentor-action warning" onClick={() => changeMentorAccess(mentor, "deactivate")}>
                            <span className="mentor-action-icon"><UserMinus size={16} /></span>
                            <span><strong>Deactivate</strong><small>Restrict account access</small></span>
                          </button>
                        ) : (
                          <button type="button" className="mentor-action success" onClick={() => changeMentorAccess(mentor, "reactivate")}>
                            <span className="mentor-action-icon"><UserPlus size={16} /></span>
                            <span><strong>Reactivate</strong><small>Restore account access</small></span>
                          </button>
                        )}

                        {mentorStudents.length > 0 && active && (
                          <button type="button" className="mentor-action neutral" onClick={() => openMentorAction(mentor, "transfer")}>
                            <span className="mentor-action-icon"><ArrowRightLeft size={16} /></span>
                            <span><strong>Transfer</strong><small>Move assigned students</small></span>
                          </button>
                        )}

                        <button type="button" className="mentor-action danger" onClick={() => openMentorAction(mentor, "delete")}>
                          <span className="mentor-action-icon"><Trash2 size={16} /></span>
                          <span><strong>Delete</strong><small>Secure removal flow</small></span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {selectedMentorAccount && (
            <div className="content-card mentor-detail-card" style={{ marginTop: 24 }}>
              <div className="section-heading">
                <div>
                  <span>SELECTED MENTOR</span>
                  <h2>{selectedMentorAccount.name}</h2>
                  <p>
                    {selectedMentorAccount.department || "N/A"} • {selectedMentorAccount.section || "N/A"}
                  </p>
                  <p className="mentor-detail-meta">
                    <strong>Status:</strong>{" "}
                    {(!selectedMentorAccount.status || selectedMentorAccount.status === "ACTIVE")
                      ? "LIVE / ACTIVE"
                      : selectedMentorAccount.status}
                    <span> • </span>
                    <strong>Students:</strong> {mentorDetails?.stats?.studentCount ?? selectedMentorAccount.studentCount ?? 0}
                    <span> • </span>
                    <strong>Joined:</strong>{" "}
                    {selectedMentorAccount.createdAt
                      ? new Date(selectedMentorAccount.createdAt).toLocaleString("en-IN")
                      : "N/A"}
                    <span> • </span>
                    <strong>Last Login:</strong>{" "}
                    {selectedMentorAccount.lastLoginAt
                      ? new Date(selectedMentorAccount.lastLoginAt).toLocaleString("en-IN")
                      : "N/A"}
                  </p>
                </div>

                <div className="section-heading-actions">
                  <button
                    type="button"
                    className="directory-top-btn"
                    onClick={() => openMentorAction(selectedMentorAccount, "transfer")}
                  >
                    <ArrowRightLeft size={15} /> Transfer Students
                  </button>
                  <button
                    type="button"
                    className="directory-top-btn"
                    onClick={() => {
                      setSelectedMentorAccount(null);
                      setMentorSectionFilter("");
                      setMentorDetails(null);
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>

              {mentorDetailsLoading ? (
                <div className="premium-empty">
                  <RotateCw size={20} className="head-spin" />
                  <p className="empty-text">Loading complete mentor details...</p>
                </div>
              ) : (
                <>
                  <div className="stats-grid">
                    <div className="stat-box">
                      <div className="stat-icon premium-icon blue"><UsersRound size={21} /></div>
                      <div><h3>Students</h3><p>{mentorDetails?.stats?.studentCount ?? selectedMentorAccount.studentCount ?? 0}</p></div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-icon premium-icon gold"><BarChart3 size={21} /></div>
                      <div><h3>Results</h3><p>{mentorDetails?.stats?.resultCount ?? 0}</p></div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-icon premium-icon green"><Award size={21} /></div>
                      <div><h3>Average</h3><p>{Number(mentorDetails?.stats?.averagePercentage || 0).toFixed(1)}%</p></div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-icon premium-icon green"><CircleCheckBig size={21} /></div>
                      <div><h3>Pass Rate</h3><p>{Number(mentorDetails?.stats?.passRate || 0).toFixed(1)}%</p></div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-icon premium-icon blue"><Activity size={21} /></div>
                      <div><h3>Highest</h3><p>{Number(mentorDetails?.stats?.highestPercentage || 0).toFixed(1)}%</p></div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-icon premium-icon red"><UserRoundX size={21} /></div>
                      <div><h3>Lowest</h3><p>{Number(mentorDetails?.stats?.lowestPercentage || 0).toFixed(1)}%</p></div>
                    </div>
                  </div>

                  <div className="tabs-container">
                    <button
                      type="button"
                      className={`tab-button ${mentorSubTab === "students" ? "active" : ""}`}
                      onClick={() => setMentorSubTab("students")}
                    >
                      Student Directory
                    </button>
                    <button
                      type="button"
                      className={`tab-button ${mentorSubTab === "results" ? "active" : ""}`}
                      onClick={() => setMentorSubTab("results")}
                    >
                      Results & Performance
                    </button>
                    <button
                      type="button"
                      className={`tab-button ${mentorSubTab === "sections" ? "active" : ""}`}
                      onClick={() => setMentorSubTab("sections")}
                    >
                      Sections
                    </button>
                    <button
                      type="button"
                      className={`tab-button ${mentorSubTab === "complaints" ? "active" : ""}`}
                      onClick={() => setMentorSubTab("complaints")}
                    >
                      Mentor Complaints
                    </button>
                  </div>

                  {(() => {
                    const mentorAllStudents: Student[] = Array.isArray(mentorDetails?.students)
                      ? mentorDetails.students
                      : students.filter((student) =>
                          selectedMentorAccount._id === student.mentorId ||
                          (!!selectedMentorAccount.name &&
                            student.mentorName?.trim().toLowerCase() === selectedMentorAccount.name.trim().toLowerCase())
                        );

                    const mentorSections = Array.isArray(mentorDetails?.sections)
                      ? mentorDetails.sections
                      : [];

                    const mentorStudents = mentorAllStudents.filter((student) =>
                      !mentorSectionFilter || student.section?.trim() === mentorSectionFilter
                    );

                    const mentorComplaints = feedback.filter((fb) =>
                      !!fb.studentId && mentorStudents.some((student) => student.studentId === fb.studentId)
                    );

                    const mentorResults: StudentResult[] = Array.isArray(mentorDetails?.results)
                      ? mentorDetails.results
                      : mentorStudents.flatMap((student) => student.results || []);

                    const filteredResults = mentorSectionFilter
                      ? mentorResults.filter((result: any) =>
                          mentorStudents.some((student) =>
                            (student.results || []).some((item) => item._id === result._id)
                          )
                        )
                      : mentorResults;

                    return (
                      <>
                        <div className="directory-control-panel" style={{ marginTop: 18 }}>
                          <div className="directory-filter-grid">
                            <div className="directory-filter-item">
                              <label>Section Filter</label>
                              <select
                                value={mentorSectionFilter}
                                onChange={(event) => setMentorSectionFilter(event.target.value)}
                              >
                                <option value="">All Sections ({mentorAllStudents.length})</option>
                                {Array.from(
                                  new Set(
                                    mentorAllStudents
                                      .map((student) => student.section?.trim())
                                      .filter(Boolean)
                                  )
                                ).map((section) => (
                                  <option key={String(section)} value={String(section)}>
                                    Section {String(section)} ({mentorAllStudents.filter((student) => student.section?.trim() === String(section)).length})
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="directory-filter-item">
                              <label>Matching Students</label>
                              <div className="item-card" style={{ padding: "12px 14px" }}>
                                <strong>{mentorStudents.length}</strong> matching students
                              </div>
                            </div>

                            <div className="directory-filter-item">
                              <label>Matching Complaints</label>
                              <div className="item-card" style={{ padding: "12px 14px" }}>
                                <strong>{mentorComplaints.length}</strong> complaints
                              </div>
                            </div>
                          </div>
                        </div>

                        {mentorSubTab === "students" && (
                          <div className="grid-list">
                            {mentorStudents.length === 0 ? (
                              <p className="empty-text">No students assigned to this mentor.</p>
                            ) : (
                              mentorStudents.map((student) => (
                                <div key={student._id} className="item-card">
                                  <div className="item-info">
                                    <h3>{student.name}</h3>
                                    <p><strong>Student ID:</strong> {student.studentId}</p>
                                    <p><strong>Class:</strong> {student.className || "N/A"}</p>
                                    <p><strong>Section:</strong> {student.section || "N/A"}</p>
                                    <p><strong>Mentor:</strong> {student.mentorName || selectedMentorAccount.name}</p>
                                    <p><strong>Results:</strong> {student.resultCount ?? student.results?.length ?? 0}</p>
                                    <p><strong>Average:</strong> {Number(student.averagePercentage || 0).toFixed(1)}%</p>
                                    <p><strong>Pass / Fail:</strong> {student.passedResults ?? 0} / {student.failedResults ?? 0}</p>
                                    <p><strong>Student Date:</strong> {student.createdAt ? new Date(student.createdAt).toLocaleString("en-IN") : "N/A"}</p>
                                  </div>
                                  <div className="action-buttons">
                                    <button type="button" className="btn-approve" onClick={() => openStudentProfile(student)}>
                                      View Student
                                    </button>
                                    <button type="button" className="btn-approve" onClick={() => openIndividualReport(student)}>
                                      Report
                                    </button>
                                    <button type="button" className="btn-reject" onClick={() => changeStudentSection(student)}>
                                      Change Section
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}

                        {mentorSubTab === "results" && (
                          <div className="grid-list">
                            {filteredResults.length === 0 ? (
                              <p className="empty-text">No results found for this mentor.</p>
                            ) : (
                              filteredResults.map((result: any, index: number) => {
                                const resultStudent = mentorStudents.find((student) =>
                                  (student.results || []).some((item) => item._id === result._id)
                                );

                                return (
                                  <div key={result._id || `${result.examName}-${index}`} className="item-card">
                                    <div className="feedback-header">
                                      <span className="mentor-name">{resultStudent?.name || "Student"}</span>
                                      <span className="badge pending">{result.status || "RESULT"}</span>
                                    </div>
                                    <div className="feedback-body">
                                      <p><strong>Student ID:</strong> {resultStudent?.studentId || "N/A"}</p>
                                      <p><strong>Exam:</strong> {result.examName || "N/A"}</p>
                                      <p><strong>Test Category:</strong> {result.testCategory || "N/A"}</p>
                                      <p><strong>Subject:</strong> {result.subject || "N/A"}</p>
                                      <p><strong>Chapter:</strong> {result.chapter || "N/A"}</p>
                                      <p><strong>Marks:</strong> {result.marks ?? 0}</p>
                                      <p><strong>Percentage:</strong> {Number(result.percentage || 0).toFixed(1)}%</p>
                                      <p><strong>Date:</strong> {result.createdAt ? new Date(result.createdAt).toLocaleString("en-IN") : "N/A"}</p>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}

                        {mentorSubTab === "sections" && (
                          <div className="grid-list">
                            {mentorSections.length === 0 ? (
                              <p className="empty-text">No section summary available.</p>
                            ) : (
                              mentorSections.map((section: any) => (
                                <div key={`${section.section}-${section.studentCount}`} className="item-card">
                                  <div className="item-info">
                                    <h3>Section {section.section || "N/A"}</h3>
                                    <p><strong>Students:</strong> {section.studentCount ?? 0}</p>
                                    <p><strong>Results:</strong> {section.resultCount ?? 0}</p>
                                    <p><strong>Mentor:</strong> {selectedMentorAccount.name}</p>
                                  </div>
                                  <div className="action-buttons">
                                    <button
                                      type="button"
                                      className="btn-approve"
                                      onClick={() => setMentorSectionFilter(String(section.section || ""))}
                                    >
                                      View Section
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}

                        {mentorSubTab === "complaints" && (
                          <div className="grid-list">
                            {mentorComplaints.length === 0 ? (
                              <p className="empty-text">No complaints for this mentor's students.</p>
                            ) : (
                              mentorComplaints.map((fb) => (
                                <div key={fb._id} className="item-card">
                                  <div className="feedback-header">
                                    <span className="mentor-name">{fb.studentName || "Student"}</span>
                                    <span className="badge pending">{fb.status || "PENDING"}</span>
                                  </div>
                                  <div className="feedback-body">
                                    <p><strong>Student ID:</strong> {fb.studentId || "N/A"}</p>
                                    <p><strong>Class:</strong> {fb.className || "N/A"}</p>
                                    <p><strong>Section:</strong> {fb.section || "N/A"}</p>
                                    <p><strong>Mentor Complaint:</strong> {fb.mentorActionPlan || "No complaint/comment provided."}</p>
                                    <p><strong>Complaint Date:</strong> {fb.createdAt ? new Date(fb.createdAt).toLocaleString("en-IN") : "N/A"}</p>
                                    {fb.resolvedAt && (
                                      <p><strong>Resolved Date:</strong> {new Date(fb.resolvedAt).toLocaleString("en-IN")}</p>
                                    )}
                                  </div>
                                  {fb.studentId && fb.status !== "RESOLVED" && (
                                    <div className="action-buttons">
                                      <button type="button" className="btn-approve" onClick={() => resolveComplaint(fb.studentId as string)}>
                                        Resolve
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </>
              )}
            </div>
          )}

          {showMentorActionModal && mentorActionTarget && (
            <div
              className="modal-overlay"
              role="dialog"
              aria-modal="true"
              onClick={() => setShowMentorActionModal(false)}
            >
              <div
                className="content-card history-modal-card"
                style={{ maxWidth: 680, width: "calc(100% - 32px)" }}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="section-heading">
                  <div>
                    <span>{mentorActionType === "delete" ? "SECURE MENTOR DELETE" : "MENTOR STUDENT TRANSFER"}</span>
                    <h2>
                      {mentorActionType === "delete" ? "Delete Mentor & Transfer Students" : "Transfer Students"}
                    </h2>
                    <p>
                      Old mentor: <strong>{mentorActionTarget.name}</strong>
                    </p>
                  </div>
                  <button type="button" className="directory-top-btn" onClick={() => setShowMentorActionModal(false)}>
                    Close
                  </button>
                </div>

                <div style={{ display: "grid", gap: 16 }}>
                  <div className="directory-filter-item">
                    <label>Replacement Mentor</label>
                    <select
                      value={replacementMentorId}
                      onChange={(event) => setReplacementMentorId(event.target.value)}
                    >
                      <option value="">Select replacement mentor</option>
                      {activeMentors
                        .filter((mentor) => mentor._id !== mentorActionTarget._id)
                        .map((mentor) => (
                          <option key={mentor._id} value={mentor._id}>
                            {mentor.name} — {mentor.department || "Department N/A"} / {mentor.section || "Section N/A"} — {mentor.studentCount ?? 0} students
                          </option>
                        ))}
                    </select>
                  </div>

                  {mentorActionType === "transfer" && (
                    <div className="directory-filter-item">
                      <label>Optional Section</label>
                      <select value={transferSection} onChange={(event) => setTransferSection(event.target.value)}>
                        <option value="">Transfer all students</option>
                        {Array.from(
                          new Set(
                            students
                              .filter((student) => student.mentorId === mentorActionTarget._id || student.mentorName === mentorActionTarget.name)
                              .map((student) => student.section?.trim())
                              .filter(Boolean)
                          )
                        ).map((section) => (
                          <option key={String(section)} value={String(section)}>
                            Section {String(section)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="directory-filter-item">
                    <label>Security Reason</label>
                    <textarea
                      value={mentorActionReason}
                      onChange={(event) => setMentorActionReason(event.target.value)}
                      rows={4}
                      placeholder="Enter why this mentor is being removed / students transferred..."
                      style={{ width: "100%", boxSizing: "border-box", resize: "vertical" }}
                    />
                  </div>

                  <div className="item-card" style={{ background: "#fffaf0" }}>
                    <strong>Important:</strong> students are transferred before mentor deletion. The old mentor record remains in the database with history so the Head can see who replaced whom.
                  </div>

                  <div className="action-buttons">
                    <button type="button" className="btn-reject" onClick={() => setShowMentorActionModal(false)}>
                      Cancel
                    </button>
                    <button type="button" className="btn-approve" onClick={executeMentorAction}>
                      {mentorActionType === "delete" ? "Transfer & Delete Mentor" : "Transfer Students"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </section>
      )}

      {/* ====================================================
          APPROVAL HISTORY MODAL
      ==================================================== */}

      {showHistoryModal && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowHistoryModal(false)}
        >
          <div
            className="content-card history-modal-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="section-heading">
              <div>
                <span>STAFF APPROVAL HISTORY</span>
                <h2>History</h2>
                <p>All staff/mentor approval and account-security actions with date and time.</p>
              </div>
              <button
                type="button"
                className="directory-top-btn"
                onClick={() => setShowHistoryModal(false)}
              >
                Close
              </button>
            </div>

            <div className="stats-grid">
              <div className="stat-box"><div className="stat-icon premium-icon green"><CircleCheckBig size={21} /></div><div><h3>Accepted</h3><p>{mentorHistoryStats.accepted}</p></div></div>
              <div className="stat-box"><div className="stat-icon premium-icon red"><X size={21} /></div><div><h3>Rejected</h3><p>{mentorHistoryStats.rejected}</p></div></div>
              <div className="stat-box"><div className="stat-icon premium-icon gold"><UserRoundX size={21} /></div><div><h3>Deactivated</h3><p>{mentorHistoryStats.deactivated}</p></div></div>
              <div className="stat-box"><div className="stat-icon premium-icon blue"><RotateCw size={21} /></div><div><h3>Reactivated</h3><p>{mentorHistoryStats.reactivated}</p></div></div>
              <div className="stat-box"><div className="stat-icon premium-icon blue"><Trash2 size={21} /></div><div><h3>Deleted</h3><p>{mentorHistoryStats.deleted}</p></div></div>
              <div className="stat-box"><div className="stat-icon premium-icon green"><History size={21} /></div><div><h3>Transferred</h3><p>{mentorHistoryStats.transferred}</p></div></div>
            </div>

            <div className="item-card">
              <h3>Total History Records: {mentorHistory.length}</h3>
            </div>

            {(() => {
              const visibleHistory = historyFilter === "ALL"
                ? mentorHistory
                : mentorHistory.filter((entry) => entry.action === historyFilter);

              return visibleHistory.length === 0 ? (
                <div className="premium-empty">
                  <p className="empty-text">No {historyFilter === "ALL" ? "" : historyFilter.toLowerCase() + " "}history records found.</p>
                </div>
              ) : (
                <div className="grid-list">
                  {visibleHistory.map((entry) => (
                    <button
                      key={entry._id}
                      type="button"
                      className="item-card history-click-card"
                      onClick={() => setSelectedHistoryEntry(entry)}
                    >
                      <div className="feedback-header">
                        <span className="mentor-name">{entry.mentorName}</span>
                        <span className="badge pending">{entry.action}</span>
                      </div>
                      <div className="feedback-body">
                        <p><strong>Reason:</strong> {entry.reason || "Not provided"}</p>
                        <p><strong>Performed by:</strong> {entry.performedBy || "N/A"}{entry.performedByRole ? ` (${entry.performedByRole})` : ""}</p>
                        <p><strong>Date &amp; Time:</strong> {entry.createdAt ? new Date(entry.createdAt).toLocaleString("en-IN") : "N/A"}</p>
                        {entry.replacementMentorName && (
                          <p><strong>Replacement Mentor:</strong> {entry.replacementMentorName}</p>
                        )}
                        {entry.oldSection && (
                          <p><strong>Old Section:</strong> {entry.oldSection}</p>
                        )}
                        {entry.newSection && (
                          <p><strong>New Section:</strong> {entry.newSection}</p>
                        )}
                        {typeof entry.transferredStudentCount === "number" && (
                          <p><strong>Transferred Students:</strong> {entry.transferredStudentCount}</p>
                        )}
                        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
                          Click to open complete history record
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {selectedHistoryEntry && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedHistoryEntry(null)}
        >
          <div
            className="content-card history-modal-card"
            style={{ maxWidth: 760, width: "calc(100% - 32px)" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="section-heading">
              <div>
                <span>STAFF AUDIT RECORD</span>
                <h2>{selectedHistoryEntry.mentorName}</h2>
                <p>Complete action history and security details.</p>
              </div>
              <button
                type="button"
                className="directory-top-btn"
                onClick={() => setSelectedHistoryEntry(null)}
              >
                Close
              </button>
            </div>

            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-icon premium-icon blue"><History size={21} /></div>
                <div><h3>Action</h3><p>{selectedHistoryEntry.action}</p></div>
              </div>
              <div className="stat-box">
                <div className="stat-icon premium-icon gold"><UserRound size={21} /></div>
                <div><h3>Role</h3><p>{selectedHistoryEntry.role || "N/A"}</p></div>
              </div>
              <div className="stat-box">
                <div className="stat-icon premium-icon green"><ShieldCheck size={21} /></div>
                <div><h3>Performed By</h3><p>{selectedHistoryEntry.performedBy || "N/A"}</p></div>
              </div>
              <div className="stat-box">
                <div className="stat-icon premium-icon blue"><RotateCw size={21} /></div>
                <div><h3>Date &amp; Time</h3><p>{selectedHistoryEntry.createdAt ? new Date(selectedHistoryEntry.createdAt).toLocaleString("en-IN") : "N/A"}</p></div>
              </div>
            </div>

            <div className="item-card">
              <div className="feedback-body">
                <p><strong>Staff / Mentor:</strong> {selectedHistoryEntry.mentorName}</p>
                <p><strong>Mentor ID:</strong> {selectedHistoryEntry.mentorId || "N/A"}</p>
                <p><strong>Reason:</strong> {selectedHistoryEntry.reason || "Not provided"}</p>
                <p><strong>Performed By Role:</strong> {selectedHistoryEntry.performedByRole || "N/A"}</p>
                {selectedHistoryEntry.replacementMentorName && (
                  <p><strong>Replacement Mentor:</strong> {selectedHistoryEntry.replacementMentorName}</p>
                )}
                {selectedHistoryEntry.oldSection && (
                  <p><strong>Old Section:</strong> {selectedHistoryEntry.oldSection}</p>
                )}
                {selectedHistoryEntry.newSection && (
                  <p><strong>New Section:</strong> {selectedHistoryEntry.newSection}</p>
                )}
                {typeof selectedHistoryEntry.transferredStudentCount === "number" && (
                  <p><strong>Transferred Student Count:</strong> {selectedHistoryEntry.transferredStudentCount}</p>
                )}
              </div>
            </div>

            <div className="item-card" style={{ background: "#fffaf0" }}>
              <strong>Security Audit:</strong> This record is retained as part of the mentor/staff administrative history.
            </div>
          </div>
        </div>
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
                <UsersRound
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
                <RotateCw
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
                <Files
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
                                <CircleCheckBig
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

                                            <UsersRound
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
                                            <CircleCheckBig
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
                                                          <CircleCheckBig
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

                                                      <small>
                                                        Updated:{" "}
                                                        {
                                                          student.updatedAt
                                                            ? new Date(student.updatedAt).toLocaleString("en-IN")
                                                            : student.createdAt
                                                              ? new Date(student.createdAt).toLocaleString("en-IN")
                                                              : "N/A"
                                                        }
                                                      </small>

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
                                                      <Files
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
                                      <Files
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

      {false && activeTab ===
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

                          <CircleCheckBig
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
                <Files
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

          <RotateCw
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