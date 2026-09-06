import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Lock,
  ArrowLeft,
  Save,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Trash2,
  X,
  FileText,
  Plus,
  Edit3,
} from "lucide-react";
import "./Profile.css";

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

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

interface StudentStorageData {
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  studentId?: string;
  id?: string;
  _id?: string;

  role?: string;
  userRole?: string;
  userType?: string;
  type?: string;
}

interface MessageState {
  type: "success" | "error" | "";
  text: string;
}

// ============================================================
// STORAGE HELPERS
// ============================================================

function readStudentFromStorage(): StudentStorageData | null {
  try {
    const userStr =
      localStorage.getItem("user") ||
      localStorage.getItem("student");

    if (!userStr) {
      return null;
    }

    const parsed: unknown = JSON.parse(userStr);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return null;
    }

    return parsed as StudentStorageData;
  } catch (error) {
    console.error(
      "Unable to parse student data:",
      error
    );

    return null;
  }
}

function getStoredRole(
  student: StudentStorageData | null
): string {
  return String(
    student?.role ||
      student?.userRole ||
      student?.userType ||
      student?.type ||
      ""
  )
    .trim()
    .toLowerCase();
}

function isStudentSession(
  student: StudentStorageData | null
): boolean {
  const studentToken =
    localStorage.getItem("studentToken");

  const role = getStoredRole(student);

  if (!student && !studentToken) {
    return false;
  }

  if (role === "student") {
    return true;
  }

  if (studentToken) {
    return true;
  }

  return false;
}

// ============================================================
// COMPONENT
// ============================================================

export default function Profile() {
  const navigate = useNavigate();

  // ==========================================================
  // INITIAL SESSION
  // ==========================================================

  const initialStudent = useMemo(
    () => readStudentFromStorage(),
    []
  );

  const initialAccess = useMemo(
    () => isStudentSession(initialStudent),
    [initialStudent]
  );

  // ==========================================================
  // PROFILE STATES
  // ==========================================================

  const [name, setName] = useState(
    initialStudent?.name ||
      initialStudent?.fullName ||
      ""
  );

  const [email, setEmail] = useState(
    initialStudent?.email || ""
  );

  const [phone, setPhone] = useState(
    initialStudent?.phone ||
      initialStudent?.mobile ||
      ""
  );

  const [studentId, setStudentId] = useState(
    initialStudent?.studentId ||
      initialStudent?.id ||
      initialStudent?._id ||
      ""
  );

  // ==========================================================
  // PASSWORD
  // ==========================================================

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  // ==========================================================
  // DELETE ACCOUNT
  // ==========================================================

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [deletePassword, setDeletePassword] =
    useState("");

  const [deleteError, setDeleteError] =
    useState("");

  const [deletingAccount, setDeletingAccount] =
    useState(false);

  // ==========================================================
  // NOTES
  // ==========================================================

  const [notes, setNotes] = useState<Note[]>([]);

  const [showNotesModal, setShowNotesModal] =
    useState(false);

  const [noteTitle, setNoteTitle] =
    useState("");

  const [noteContent, setNoteContent] =
    useState("");

  const [editingNoteId, setEditingNoteId] =
    useState<string | null>(null);

  // ==========================================================
  // UI
  // ==========================================================

  const [updatingProfile, setUpdatingProfile] =
    useState(false);

  const [updatingPassword, setUpdatingPassword] =
    useState(false);

  const [message, setMessage] =
    useState<MessageState>({
      type: "",
      text: "",
    });

  const [pwdMessage, setPwdMessage] =
    useState<MessageState>({
      type: "",
      text: "",
    });

  // ==========================================================
  // LOAD NOTES
  // ==========================================================

  useEffect(() => {
    if (!initialAccess) {
      return;
    }

    const savedNotes =
      localStorage.getItem(
        "studentStudyNotes"
      );

    if (!savedNotes) {
      return;
    }

    try {
      const parsedNotes: unknown =
        JSON.parse(savedNotes);

      if (Array.isArray(parsedNotes)) {
        setNotes(parsedNotes as Note[]);
      }
    } catch (error) {
      console.error(
        "Error loading study notes:",
        error
      );
    }
  }, [initialAccess]);

  // ==========================================================
  // ACCESS REDIRECT
  // ==========================================================

  useEffect(() => {
    if (initialAccess) {
      return;
    }

    const hasAnySession =
      Boolean(
        localStorage.getItem("user") ||
          localStorage.getItem("student") ||
          localStorage.getItem("studentToken")
      );

    navigate(
      hasAnySession
        ? "/dashboard"
        : "/login",
      { replace: true }
    );
  }, [initialAccess, navigate]);

  // ==========================================================
  // TOKEN
  // ==========================================================

  const getToken = useCallback(() => {
    return (
      localStorage.getItem("studentToken") ||
      localStorage.getItem("token") ||
      ""
    );
  }, []);

  // ==========================================================
  // UPDATE PROFILE
  // ==========================================================

  const handleUpdateProfile = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!initialAccess) {
      navigate("/dashboard", {
        replace: true,
      });
      return;
    }

    const token = getToken();

    if (!token) {
      navigate("/login", {
        replace: true,
      });
      return;
    }

    setUpdatingProfile(true);

    setMessage({
      type: "",
      text: "",
    });

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/students/update-profile`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            studentId,
            name: name.trim(),
            phone: phone.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to update profile."
        );
      }

      const storageKey =
        localStorage.getItem("user")
          ? "user"
          : "student";

      const existingStorage =
        localStorage.getItem(storageKey);

      if (existingStorage) {
        try {
          const existingStudent =
            JSON.parse(existingStorage);

          existingStudent.name =
            name.trim();

          existingStudent.phone =
            phone.trim();

          localStorage.setItem(
            storageKey,
            JSON.stringify(existingStudent)
          );
        } catch (error) {
          console.error(
            "Unable to update local student data:",
            error
          );
        }
      }

      setName(name.trim());
      setPhone(phone.trim());

      setMessage({
        type: "success",
        text:
          "Profile updated successfully!",
      });

      window.dispatchEvent(
        new Event("authChanged")
      );
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Something went wrong.",
      });
    } finally {
      setUpdatingProfile(false);
    }
  };

  // ==========================================================
  // CHANGE PASSWORD
  // ==========================================================

  const handleChangePassword = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!initialAccess) {
      navigate("/dashboard", {
        replace: true,
      });
      return;
    }

    setPwdMessage({
      type: "",
      text: "",
    });

    if (!currentPassword.trim()) {
      setPwdMessage({
        type: "error",
        text:
          "Please enter your current password.",
      });

      return;
    }

    if (newPassword.length < 6) {
      setPwdMessage({
        type: "error",
        text:
          "Password must be at least 6 characters long.",
      });

      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdMessage({
        type: "error",
        text:
          "New passwords do not match.",
      });

      return;
    }

    const token = getToken();

    if (!token) {
      navigate("/login", {
        replace: true,
      });
      return;
    }

    setUpdatingPassword(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/students/change-password`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            studentId,
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to change password."
        );
      }

      setPwdMessage({
        type: "success",
        text:
          "Password changed successfully!",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(
        "Password change error:",
        error
      );

      setPwdMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to change password.",
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  // ==========================================================
  // SAVE NOTE
  // ==========================================================

  const handleSaveNote = () => {
    if (!initialAccess) {
      navigate("/dashboard", {
        replace: true,
      });
      return;
    }

    const cleanTitle =
      noteTitle.trim();

    const cleanContent =
      noteContent.trim();

    if (!cleanTitle) {
      return;
    }

    if (!cleanContent) {
      return;
    }

    let updatedNotes: Note[];

    if (editingNoteId) {
      updatedNotes = notes.map(
        (note) =>
          note.id === editingNoteId
            ? {
                ...note,
                title: cleanTitle,
                content: cleanContent,
                date:
                  new Date().toLocaleDateString(),
              }
            : note
      );
    } else {
      const newNote: Note = {
        id: `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        title: cleanTitle,
        content: cleanContent,
        date:
          new Date().toLocaleDateString(),
      };

      updatedNotes = [
        newNote,
        ...notes,
      ];
    }

    setNotes(updatedNotes);

    localStorage.setItem(
      "studentStudyNotes",
      JSON.stringify(updatedNotes)
    );

    closeNotesModal();
  };

  // ==========================================================
  // EDIT NOTE
  // ==========================================================

  const handleEditNote = (
    note: Note
  ) => {
    if (!initialAccess) {
      navigate("/dashboard", {
        replace: true,
      });
      return;
    }

    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setShowNotesModal(true);
  };

  // ==========================================================
  // DELETE NOTE
  // ==========================================================

  const handleDeleteNote = (
    id: string
  ) => {
    if (!initialAccess) {
      navigate("/dashboard", {
        replace: true,
      });
      return;
    }

    const updatedNotes =
      notes.filter(
        (note) => note.id !== id
      );

    setNotes(updatedNotes);

    localStorage.setItem(
      "studentStudyNotes",
      JSON.stringify(updatedNotes)
    );
  };

  // ==========================================================
  // CLOSE NOTES MODAL
  // ==========================================================

  const closeNotesModal = () => {
    setShowNotesModal(false);
    setEditingNoteId(null);
    setNoteTitle("");
    setNoteContent("");
  };

  // ==========================================================
  // DELETE ACCOUNT
  // ==========================================================

  const handleDeleteAccount = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!initialAccess) {
      navigate("/dashboard", {
        replace: true,
      });
      return;
    }

    if (!deletePassword.trim()) {
      setDeleteError(
        "Please enter your password."
      );
      return;
    }

    const token = getToken();

    if (!token) {
      navigate("/login", {
        replace: true,
      });
      return;
    }

    setDeletingAccount(true);
    setDeleteError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/students/delete-account`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            studentId,
            password: deletePassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to delete account."
        );
      }

      localStorage.clear();

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Account deletion error:",
        error
      );

      setDeleteError(
        error instanceof Error
          ? error.message
          : "Failed to delete account. Check your password."
      );

      setDeletingAccount(false);
    }
  };

  // ==========================================================
  // NOT AUTHORIZED
  // ==========================================================

  if (!initialAccess) {
    return (
      <div
        className="prof-loading"
        role="status"
        aria-live="polite"
      >
        <div
          className="loading-spinner"
          aria-hidden="true"
        />

        <p>
          Redirecting...
        </p>
      </div>
    );
  }

  // ==========================================================
  // MAIN PAGE
  // ==========================================================

  return (
    <div className="prof-page">
      <main
        className="prof-container"
        aria-labelledby="profile-page-title"
      >
        {/* ====================================================
            TOP HEADER
        ==================================================== */}

        <header className="prof-top-bar">
          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
            className="prof-back-btn"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft
              size={16}
              aria-hidden="true"
            />

            <span>
              Back to Dashboard
            </span>
          </button>

          <div className="prof-heading">
            <span className="prof-heading-label">
              ACCOUNT CENTER
            </span>

            <h1 id="profile-page-title">
              Student Profile &amp; Settings
            </h1>

            <p>
              Manage your account, security and
              personal study notes.
            </p>
          </div>
        </header>

        {/* ====================================================
            MAIN GRID
        ==================================================== */}

        <div className="prof-grid">
          {/* ==================================================
              PROFILE CARD
          ================================================== */}

          <section
            className="prof-card profile-main-card"
            aria-labelledby="profile-details-title"
          >
            <div className="prof-card-header">
              <div
                className="prof-avatar"
                aria-hidden="true"
              >
                <User size={30} />
              </div>

              <div className="profile-identity">
                <h2 id="profile-details-title">
                  {name || "Student"}
                </h2>

                <span>
                  Student ID:{" "}
                  {studentId || "N/A"}
                </span>
              </div>
            </div>

            {message.text && (
              <div
                className={`prof-alert ${message.type}`}
                role={
                  message.type === "error"
                    ? "alert"
                    : "status"
                }
                aria-live="polite"
              >
                {message.type ===
                "success" ? (
                  <CheckCircle2
                    size={17}
                    aria-hidden="true"
                  />
                ) : (
                  <AlertCircle
                    size={17}
                    aria-hidden="true"
                  />
                )}

                <span>
                  {message.text}
                </span>
              </div>
            )}

            <form
              onSubmit={handleUpdateProfile}
              className="prof-form"
            >
              {/* Full Name */}

              <div className="prof-input-group">
                <label htmlFor="profile-name">
                  Full Name
                </label>

                <div className="prof-input-wrapper">
                  <User
                    size={17}
                    aria-hidden="true"
                  />

                  <input
                    id="profile-name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value
                      )
                    }
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              {/* Email */}

              <div className="prof-input-group">
                <label htmlFor="profile-email">
                  Email Address
                  <span>
                    Cannot be changed
                  </span>
                </label>

                <div className="prof-input-wrapper disabled">
                  <Mail
                    size={17}
                    aria-hidden="true"
                  />

                  <input
                    id="profile-email"
                    name="email"
                    type="email"
                    value={email}
                    disabled
                    readOnly
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Phone */}

              <div className="prof-input-group">
                <label htmlFor="profile-phone">
                  Phone Number
                </label>

                <div className="prof-input-wrapper">
                  <Phone
                    size={17}
                    aria-hidden="true"
                  />

                  <input
                    id="profile-phone"
                    name="phone"
                    type="tel"
                    value={phone}
                    onChange={(event) =>
                      setPhone(
                        event.target.value
                      )
                    }
                    placeholder="Enter phone number"
                    autoComplete="tel"
                    inputMode="tel"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="prof-submit-btn"
                disabled={updatingProfile}
                aria-busy={updatingProfile}
              >
                <Save
                  size={17}
                  aria-hidden="true"
                />

                <span>
                  {updatingProfile
                    ? "Saving..."
                    : "Save Changes"}
                </span>
              </button>
            </form>
          </section>

          {/* ==================================================
              RIGHT COLUMN
          ================================================== */}

          <div className="prof-right-column">
            {/* ================================================
                SECURITY
            ================================================ */}

            <section
              className="prof-card security-card"
              aria-labelledby="security-title"
            >
              <div className="prof-card-title">
                <div
                  className="section-icon security-icon"
                  aria-hidden="true"
                >
                  <ShieldCheck size={20} />
                </div>

                <div>
                  <h2 id="security-title">
                    Security &amp; Password
                  </h2>

                  <p>
                    Keep your account protected.
                  </p>
                </div>
              </div>

              {pwdMessage.text && (
                <div
                  className={`prof-alert ${pwdMessage.type}`}
                  role={
                    pwdMessage.type ===
                    "error"
                      ? "alert"
                      : "status"
                  }
                  aria-live="polite"
                >
                  {pwdMessage.type ===
                  "success" ? (
                    <CheckCircle2
                      size={17}
                      aria-hidden="true"
                    />
                  ) : (
                    <AlertCircle
                      size={17}
                      aria-hidden="true"
                    />
                  )}

                  <span>
                    {pwdMessage.text}
                  </span>
                </div>
              )}

              <form
                onSubmit={handleChangePassword}
                className="prof-form"
              >
                <div className="prof-input-group">
                  <label htmlFor="current-password">
                    Current Password
                  </label>

                  <div className="prof-input-wrapper">
                    <Lock
                      size={17}
                      aria-hidden="true"
                    />

                    <input
                      id="current-password"
                      name="currentPassword"
                      type="password"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(event) =>
                        setCurrentPassword(
                          event.target.value
                        )
                      }
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </div>

                <div className="prof-input-group">
                  <label htmlFor="new-password">
                    New Password
                  </label>

                  <div className="prof-input-wrapper">
                    <Lock
                      size={17}
                      aria-hidden="true"
                    />

                    <input
                      id="new-password"
                      name="newPassword"
                      type="password"
                      placeholder="Create a new password"
                      value={newPassword}
                      onChange={(event) =>
                        setNewPassword(
                          event.target.value
                        )
                      }
                      autoComplete="new-password"
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                <div className="prof-input-group">
                  <label htmlFor="confirm-password">
                    Confirm New Password
                  </label>

                  <div className="prof-input-wrapper">
                    <Lock
                      size={17}
                      aria-hidden="true"
                    />

                    <input
                      id="confirm-password"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value
                        )
                      }
                      autoComplete="new-password"
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="prof-submit-btn secondary"
                  disabled={
                    updatingPassword
                  }
                  aria-busy={
                    updatingPassword
                  }
                >
                  <Lock
                    size={17}
                    aria-hidden="true"
                  />

                  <span>
                    {updatingPassword
                      ? "Updating..."
                      : "Update Password"}
                  </span>
                </button>
              </form>
            </section>

            {/* ================================================
                DANGER ZONE
            ================================================ */}

            <section
              className="prof-card danger-zone"
              aria-labelledby="danger-title"
            >
              <div className="danger-heading">
                <div>
                  <span>
                    ACCOUNT SECURITY
                  </span>

                  <h2 id="danger-title">
                    Danger Zone
                  </h2>
                </div>

                <div
                  className="danger-icon"
                  aria-hidden="true"
                >
                  <Trash2 size={19} />
                </div>
              </div>

              <p>
                Permanently deleting your account
                will remove your account data and
                exam history.
              </p>

              <button
                type="button"
                onClick={() => {
                  setDeleteError("");
                  setDeletePassword("");
                  setShowDeleteModal(
                    true
                  );
                }}
                className="prof-delete-btn"
              >
                <Trash2
                  size={17}
                  aria-hidden="true"
                />

                <span>
                  Delete Account
                </span>
              </button>
            </section>
          </div>

          {/* ==================================================
              STUDY NOTES
          ================================================== */}

          <section
            className="prof-card notes-card"
            aria-labelledby="notes-title"
          >
            <div className="notes-header">
              <div className="notes-heading">
                <div
                  className="notes-icon"
                  aria-hidden="true"
                >
                  <FileText size={21} />
                </div>

                <div>
                  <span>
                    PERSONAL LEARNING
                  </span>

                  <h2 id="notes-title">
                    My Study Notes
                  </h2>

                  <p>
                    Save formulas, concepts and
                    important revision points.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="add-note-btn"
                onClick={() => {
                  setEditingNoteId(null);
                  setNoteTitle("");
                  setNoteContent("");
                  setShowNotesModal(true);
                }}
              >
                <Plus
                  size={17}
                  aria-hidden="true"
                />

                <span>
                  Add New Note
                </span>
              </button>
            </div>

            {/* =================================================
                EMPTY NOTES
            ================================================= */}

            {notes.length === 0 ? (
              <div className="empty-notes">
                <div
                  className="empty-notes-icon"
                  aria-hidden="true"
                >
                  <FileText size={30} />
                </div>

                <h3>
                  No study notes yet
                </h3>

                <p>
                  Create your first note and keep
                  important concepts ready for revision.
                </p>

                <button
                  type="button"
                  className="empty-add-note"
                  onClick={() => {
                    setEditingNoteId(null);
                    setNoteTitle("");
                    setNoteContent("");
                    setShowNotesModal(true);
                  }}
                >
                  <Plus
                    size={16}
                    aria-hidden="true"
                  />

                  <span>
                    Create Your First Note
                  </span>
                </button>
              </div>
            ) : (
              <div className="notes-list">
                {notes.map((note) => (
                  <article
                    className="study-note"
                    key={note.id}
                  >
                    <div className="study-note-content">
                      <div className="note-heading">
                        <FileText
                          size={16}
                          aria-hidden="true"
                        />

                        <h3>
                          {note.title}
                        </h3>
                      </div>

                      <p>
                        {note.content}
                      </p>

                      <span className="note-date">
                        Updated {note.date}
                      </span>
                    </div>

                    <div className="note-actions">
                      <button
                        type="button"
                        onClick={() =>
                          handleEditNote(
                            note
                          )
                        }
                        title="Edit note"
                        aria-label={`Edit note: ${note.title}`}
                      >
                        <Edit3
                          size={16}
                          aria-hidden="true"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteNote(
                            note.id
                          )
                        }
                        title="Delete note"
                        aria-label={`Delete note: ${note.title}`}
                      >
                        <Trash2
                          size={16}
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ======================================================
            NOTES MODAL
        ====================================================== */}

        {showNotesModal && (
          <div
            className="prof-modal-overlay"
            role="presentation"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeNotesModal();
              }
            }}
          >
            <div
              className="prof-modal notes-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="notes-modal-title"
            >
              <div className="prof-modal-header">
                <div>
                  <span className="modal-eyebrow">
                    PERSONAL NOTES
                  </span>

                  <h2 id="notes-modal-title">
                    {editingNoteId
                      ? "Edit Study Note"
                      : "Create Study Note"}
                  </h2>

                  <p className="modal-small-text">
                    Keep your important learning
                    points organized.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeNotesModal
                  }
                  className="prof-close-btn"
                  aria-label="Close study note dialog"
                >
                  <X
                    size={20}
                    aria-hidden="true"
                  />
                </button>
              </div>

              <div className="note-form">
                <div className="prof-input-group">
                  <label htmlFor="note-title">
                    Note Title
                  </label>

                  <div className="prof-input-wrapper">
                    <FileText
                      size={17}
                      aria-hidden="true"
                    />

                    <input
                      id="note-title"
                      type="text"
                      value={noteTitle}
                      onChange={(event) =>
                        setNoteTitle(
                          event.target.value
                        )
                      }
                      placeholder="Example: Kirchhoff's Laws"
                      autoFocus
                      maxLength={100}
                    />
                  </div>
                </div>

                <div className="prof-input-group">
                  <label htmlFor="note-content">
                    Your Note
                  </label>

                  <textarea
                    id="note-content"
                    className="note-textarea"
                    value={noteContent}
                    onChange={(event) =>
                      setNoteContent(
                        event.target.value
                      )
                    }
                    placeholder="Write your important concept, formula or revision point..."
                    rows={7}
                    maxLength={3000}
                  />
                </div>

                <div className="note-modal-actions">
                  <button
                    type="button"
                    className="prof-cancel-btn"
                    onClick={
                      closeNotesModal
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="note-save-btn"
                    onClick={
                      handleSaveNote
                    }
                    disabled={
                      !noteTitle.trim() ||
                      !noteContent.trim()
                    }
                  >
                    <Save
                      size={16}
                      aria-hidden="true"
                    />

                    <span>
                      {editingNoteId
                        ? "Save Note"
                        : "Create Note"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================
            DELETE ACCOUNT MODAL
        ====================================================== */}

        {showDeleteModal && (
          <div
            className="prof-modal-overlay"
            role="presentation"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setShowDeleteModal(
                  false
                );
              }
            }}
          >
            <div
              className="prof-modal delete-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-modal-title"
            >
              <div className="prof-modal-header">
                <div>
                  <span className="modal-eyebrow danger-eyebrow">
                    PERMANENT ACTION
                  </span>

                  <h2 id="delete-modal-title">
                    Delete Your Account?
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowDeleteModal(
                      false
                    )
                  }
                  className="prof-close-btn"
                  aria-label="Close delete account dialog"
                >
                  <X
                    size={20}
                    aria-hidden="true"
                  />
                </button>
              </div>

              <p className="delete-description">
                This action is permanent and cannot
                be undone. Your account data and exam
                history may be permanently removed.
              </p>

              {deleteError && (
                <div
                  className="prof-alert error"
                  role="alert"
                  aria-live="assertive"
                >
                  <AlertCircle
                    size={17}
                    aria-hidden="true"
                  />

                  <span>
                    {deleteError}
                  </span>
                </div>
              )}

              <form
                onSubmit={
                  handleDeleteAccount
                }
              >
                <div className="prof-input-group">
                  <label htmlFor="delete-password">
                    Enter Your Password
                  </label>

                  <div className="prof-input-wrapper">
                    <Lock
                      size={17}
                      aria-hidden="true"
                    />

                    <input
                      id="delete-password"
                      name="deletePassword"
                      type="password"
                      placeholder="Enter your current password"
                      value={deletePassword}
                      onChange={(event) =>
                        setDeletePassword(
                          event.target.value
                        )
                      }
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </div>

                <div className="prof-modal-actions">
                  <button
                    type="button"
                    onClick={() =>
                      setShowDeleteModal(
                        false
                      )
                    }
                    className="prof-cancel-btn"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="prof-confirm-delete-btn"
                    disabled={
                      deletingAccount
                    }
                    aria-busy={
                      deletingAccount
                    }
                  >
                    <Trash2
                      size={16}
                      aria-hidden="true"
                    />

                    <span>
                      {deletingAccount
                        ? "Deleting..."
                        : "Permanently Delete"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}