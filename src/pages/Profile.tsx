import { useEffect, useState } from "react";
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

const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://exammaster-backend-up1y.onrender.com";

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

export default function Profile() {
  const navigate = useNavigate();

  // ============================================================
  // PROFILE STATES
  // ============================================================

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [studentId, setStudentId] = useState("");

  // ============================================================
  // PASSWORD STATES
  // ============================================================

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ============================================================
  // DELETE ACCOUNT STATES
  // ============================================================

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  // ============================================================
  // NOTES STATES
  // ============================================================

  const [notes, setNotes] = useState<Note[]>([]);
  const [showNotesModal, setShowNotesModal] = useState(false);

  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // ============================================================
  // UI STATES
  // ============================================================

  const [loading, setLoading] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const [pwdMessage, setPwdMessage] = useState({
    type: "",
    text: "",
  });

  // ============================================================
  // LOAD PROFILE + NOTES
  // ============================================================

  useEffect(() => {
    fetchProfileData();

    const savedNotes = localStorage.getItem("studentStudyNotes");

    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes);

        if (Array.isArray(parsedNotes)) {
          setNotes(parsedNotes);
        }
      } catch (error) {
        console.error("Error loading study notes:", error);
      }
    }
  }, []);

  // ============================================================
  // FETCH PROFILE FROM LOCAL STORAGE
  // ============================================================

  const fetchProfileData = () => {
    try {
      const studentStr =
        localStorage.getItem("user") ||
        localStorage.getItem("student");

      if (studentStr) {
        const student = JSON.parse(studentStr);

        setName(
          student.name ||
            student.fullName ||
            ""
        );

        setEmail(student.email || "");

        setPhone(
          student.phone ||
            student.mobile ||
            ""
        );

        setStudentId(
          student.studentId ||
            student.id ||
            student._id ||
            ""
        );
      }
    } catch (err) {
      console.error(
        "Error reading user data from local storage",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UPDATE PROFILE
  // ============================================================

  const handleUpdateProfile = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setUpdatingProfile(true);

    setMessage({
      type: "",
      text: "",
    });

    const token =
      localStorage.getItem("studentToken") ||
      localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/students/update-profile`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            studentId,
            name,
            phone,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update profile"
        );
      }

      const studentStr =
        localStorage.getItem("user") ||
        localStorage.getItem("student");

      if (studentStr) {
        const student = JSON.parse(studentStr);

        student.name = name;
        student.phone = phone;

        if (localStorage.getItem("user")) {
          localStorage.setItem(
            "user",
            JSON.stringify(student)
          );
        } else {
          localStorage.setItem(
            "student",
            JSON.stringify(student)
          );
        }
      }

      setMessage({
        type: "success",
        text: "Profile updated successfully!",
      });

      window.dispatchEvent(
        new Event("authChanged")
      );
    } catch (err: any) {
      setMessage({
        type: "error",
        text:
          err.message ||
          "Something went wrong!",
      });
    } finally {
      setUpdatingProfile(false);
    }
  };

  // ============================================================
  // CHANGE PASSWORD
  // ============================================================

  const handleChangePassword = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setPwdMessage({
      type: "",
      text: "",
    });

    if (newPassword !== confirmPassword) {
      setPwdMessage({
        type: "error",
        text: "New passwords do not match!",
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

    setUpdatingPassword(true);

    const token =
      localStorage.getItem("studentToken") ||
      localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/students/change-password`,
        {
          method: "PUT",

          headers: {
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
          data.message ||
            "Failed to change password"
        );
      }

      setPwdMessage({
        type: "success",
        text: "Password changed successfully!",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPwdMessage({
        type: "error",
        text:
          err.message ||
          "Failed to change password.",
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  // ============================================================
  // SAVE NOTE
  // ============================================================

  const handleSaveNote = () => {
    const cleanTitle = noteTitle.trim();
    const cleanContent = noteContent.trim();

    if (!cleanTitle) {
      return;
    }

    if (!cleanContent) {
      return;
    }

    // EDIT EXISTING NOTE
    if (editingNoteId) {
      const updatedNotes = notes.map(
        (note) =>
          note.id === editingNoteId
            ? {
                ...note,
                title: cleanTitle,
                content: cleanContent,
                date: new Date().toLocaleDateString(),
              }
            : note
      );

      setNotes(updatedNotes);

      localStorage.setItem(
        "studentStudyNotes",
        JSON.stringify(updatedNotes)
      );
    }

    // CREATE NEW NOTE
    else {
      const newNote: Note = {
        id: `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,

        title: cleanTitle,

        content: cleanContent,

        date: new Date().toLocaleDateString(),
      };

      const updatedNotes = [
        newNote,
        ...notes,
      ];

      setNotes(updatedNotes);

      localStorage.setItem(
        "studentStudyNotes",
        JSON.stringify(updatedNotes)
      );
    }

    setNoteTitle("");
    setNoteContent("");
    setEditingNoteId(null);
    setShowNotesModal(false);
  };

  // ============================================================
  // EDIT NOTE
  // ============================================================

  const handleEditNote = (note: Note) => {
    setEditingNoteId(note.id);

    setNoteTitle(note.title);

    setNoteContent(note.content);

    setShowNotesModal(true);
  };

  // ============================================================
  // DELETE NOTE
  // ============================================================

  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter(
      (note) => note.id !== id
    );

    setNotes(updatedNotes);

    localStorage.setItem(
      "studentStudyNotes",
      JSON.stringify(updatedNotes)
    );
  };

  // ============================================================
  // CLOSE NOTE MODAL
  // ============================================================

  const closeNotesModal = () => {
    setShowNotesModal(false);

    setEditingNoteId(null);

    setNoteTitle("");
    setNoteContent("");
  };

  // ============================================================
  // DELETE ACCOUNT
  // ============================================================

  const handleDeleteAccount = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setDeletingAccount(true);

    setDeleteError("");

    const token =
      localStorage.getItem("studentToken") ||
      localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/students/delete-account`,
        {
          method: "DELETE",

          headers: {
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
          data.message ||
            "Failed to delete account"
        );
      }

      localStorage.clear();

      navigate("/login");
    } catch (err: any) {
      setDeleteError(
        err.message ||
          "Failed to delete account. Check your password."
      );

      setDeletingAccount(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="prof-loading">
        <div className="loading-spinner" />

        <p>Loading your profile...</p>
      </div>
    );
  }

  // ============================================================
  // RETURN
  // ============================================================

  return (
    <div className="prof-page">

      <div className="prof-container">

        {/* ======================================================
            TOP HEADER
        ====================================================== */}

        <div className="prof-top-bar">

          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
            className="prof-back-btn"
          >
            <ArrowLeft size={16} />

            <span>
              Back to Dashboard
            </span>
          </button>

          <div className="prof-heading">

            <span className="prof-heading-label">
              ACCOUNT CENTER
            </span>

            <h1>
              Student Profile & Settings
            </h1>

            <p>
              Manage your account, security and
              personal study notes.
            </p>

          </div>

        </div>

        {/* ======================================================
            MAIN GRID
        ====================================================== */}

        <div className="prof-grid">

          {/* ====================================================
              PROFILE CARD
          ==================================================== */}

          <div className="prof-card profile-main-card">

            <div className="prof-card-header">

              <div className="prof-avatar">
                <User size={30} />
              </div>

              <div className="profile-identity">

                <h2>
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
              >
                {message.type === "success" ? (
                  <CheckCircle2 size={17} />
                ) : (
                  <AlertCircle size={17} />
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

              <div className="prof-input-group">

                <label>
                  Full Name
                </label>

                <div className="prof-input-wrapper">

                  <User size={17} />

                  <input
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="Enter your full name"
                    required
                  />

                </div>

              </div>

              <div className="prof-input-group">

                <label>
                  Email Address
                  <span>
                    Cannot be changed
                  </span>
                </label>

                <div className="prof-input-wrapper disabled">

                  <Mail size={17} />

                  <input
                    type="email"
                    value={email}
                    disabled
                  />

                </div>

              </div>

              <div className="prof-input-group">

                <label>
                  Phone Number
                </label>

                <div className="prof-input-wrapper">

                  <Phone size={17} />

                  <input
                    type="text"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    placeholder="Enter phone number"
                  />

                </div>

              </div>

              <button
                type="submit"
                className="prof-submit-btn"
                disabled={updatingProfile}
              >

                <Save size={17} />

                <span>
                  {updatingProfile
                    ? "Saving..."
                    : "Save Changes"}
                </span>

              </button>

            </form>

          </div>

          {/* ====================================================
              RIGHT COLUMN
          ==================================================== */}

          <div className="prof-right-column">

            {/* ==================================================
                SECURITY
            ================================================== */}

            <div className="prof-card security-card">

              <div className="prof-card-title">

                <div className="section-icon security-icon">
                  <ShieldCheck size={20} />
                </div>

                <div>
                  <h3>
                    Security & Password
                  </h3>

                  <p>
                    Keep your account protected.
                  </p>
                </div>

              </div>

              {pwdMessage.text && (
                <div
                  className={`prof-alert ${pwdMessage.type}`}
                >
                  {pwdMessage.type === "success" ? (
                    <CheckCircle2 size={17} />
                  ) : (
                    <AlertCircle size={17} />
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

                  <label>
                    Current Password
                  </label>

                  <div className="prof-input-wrapper">

                    <Lock size={17} />

                    <input
                      type="password"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) =>
                        setCurrentPassword(
                          e.target.value
                        )
                      }
                      required
                    />

                  </div>

                </div>

                <div className="prof-input-group">

                  <label>
                    New Password
                  </label>

                  <div className="prof-input-wrapper">

                    <Lock size={17} />

                    <input
                      type="password"
                      placeholder="Create a new password"
                      value={newPassword}
                      onChange={(e) =>
                        setNewPassword(
                          e.target.value
                        )
                      }
                      required
                    />

                  </div>

                </div>

                <div className="prof-input-group">

                  <label>
                    Confirm New Password
                  </label>

                  <div className="prof-input-wrapper">

                    <Lock size={17} />

                    <input
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      required
                    />

                  </div>

                </div>

                <button
                  type="submit"
                  className="prof-submit-btn secondary"
                  disabled={updatingPassword}
                >

                  <Lock size={17} />

                  <span>
                    {updatingPassword
                      ? "Updating..."
                      : "Update Password"}
                  </span>

                </button>

              </form>

            </div>

            {/* ==================================================
                DANGER ZONE
            ================================================== */}

            <div className="prof-card danger-zone">

              <div className="danger-heading">

                <div>
                  <span>
                    ACCOUNT SECURITY
                  </span>

                  <h3>
                    Danger Zone
                  </h3>
                </div>

                <div className="danger-icon">
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
                onClick={() =>
                  setShowDeleteModal(true)
                }
                className="prof-delete-btn"
              >

                <Trash2 size={17} />

                <span>
                  Delete Account
                </span>

              </button>

            </div>

          </div>

          {/* ====================================================
              STUDY NOTES
          ==================================================== */}

          <div className="prof-card notes-card">

            <div className="notes-header">

              <div className="notes-heading">

                <div className="notes-icon">
                  <FileText size={21} />
                </div>

                <div>
                  <span>
                    PERSONAL LEARNING
                  </span>

                  <h3>
                    My Study Notes
                  </h3>

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

                <Plus size={17} />

                <span>
                  Add New Note
                </span>

              </button>

            </div>

            {/* NOTES EMPTY STATE */}

            {notes.length === 0 ? (

              <div className="empty-notes">

                <div className="empty-notes-icon">
                  <FileText size={30} />
                </div>

                <h4>
                  No study notes yet
                </h4>

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

                  <Plus size={16} />

                  <span>
                    Create Your First Note
                  </span>

                </button>

              </div>

            ) : (

              <div className="notes-list">

                {notes.map((note) => (

                  <div
                    className="study-note"
                    key={note.id}
                  >

                    <div className="study-note-content">

                      <div className="note-heading">

                        <FileText size={16} />

                        <h4>
                          {note.title}
                        </h4>

                      </div>

                      <p>
                        {note.content}
                      </p>

                      <span className="note-date">
                        Updated{" "}
                        {note.date}
                      </span>

                    </div>

                    <div className="note-actions">

                      <button
                        type="button"
                        onClick={() =>
                          handleEditNote(note)
                        }
                        title="Edit note"
                        aria-label="Edit note"
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteNote(note.id)
                        }
                        title="Delete note"
                        aria-label="Delete note"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>

        {/* ======================================================
            NOTE MODAL
        ====================================================== */}

        {showNotesModal && (

          <div className="prof-modal-overlay">

            <div className="prof-modal notes-modal">

              <div className="prof-modal-header">

                <div>

                  <span className="modal-eyebrow">
                    PERSONAL NOTES
                  </span>

                  <h3>
                    {editingNoteId
                      ? "Edit Study Note"
                      : "Create Study Note"}
                  </h3>

                  <p className="modal-small-text">
                    Keep your important learning
                    points organized.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={closeNotesModal}
                  className="prof-close-btn"
                >
                  <X size={20} />
                </button>

              </div>

              <div className="note-form">

                <div className="prof-input-group">

                  <label>
                    Note Title
                  </label>

                  <div className="prof-input-wrapper">

                    <FileText size={17} />

                    <input
                      type="text"
                      value={noteTitle}
                      onChange={(e) =>
                        setNoteTitle(
                          e.target.value
                        )
                      }
                      placeholder="Example: Kirchhoff's Laws"
                      autoFocus
                    />

                  </div>

                </div>

                <div className="prof-input-group">

                  <label>
                    Your Note
                  </label>

                  <textarea
                    className="note-textarea"
                    value={noteContent}
                    onChange={(e) =>
                      setNoteContent(
                        e.target.value
                      )
                    }
                    placeholder="Write your important concept, formula or revision point..."
                    rows={7}
                  />

                </div>

                <div className="note-modal-actions">

                  <button
                    type="button"
                    className="prof-cancel-btn"
                    onClick={closeNotesModal}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="note-save-btn"
                    onClick={handleSaveNote}
                    disabled={
                      !noteTitle.trim() ||
                      !noteContent.trim()
                    }
                  >

                    <Save size={16} />

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

          <div className="prof-modal-overlay">

            <div className="prof-modal delete-modal">

              <div className="prof-modal-header">

                <div>

                  <span className="modal-eyebrow danger-eyebrow">
                    PERMANENT ACTION
                  </span>

                  <h3>
                    Delete Your Account?
                  </h3>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowDeleteModal(false)
                  }
                  className="prof-close-btn"
                >
                  <X size={20} />
                </button>

              </div>

              <p className="delete-description">
                This action is permanent and cannot
                be undone. Your account data and exam
                history may be permanently removed.
              </p>

              {deleteError && (

                <div className="prof-alert error">

                  <AlertCircle size={17} />

                  <span>
                    {deleteError}
                  </span>

                </div>

              )}

              <form
                onSubmit={handleDeleteAccount}
              >

                <div className="prof-input-group">

                  <label>
                    Enter Your Password
                  </label>

                  <div className="prof-input-wrapper">

                    <Lock size={17} />

                    <input
                      type="password"
                      placeholder="Enter your current password"
                      value={deletePassword}
                      onChange={(e) =>
                        setDeletePassword(
                          e.target.value
                        )
                      }
                      required
                    />

                  </div>

                </div>

                <div className="prof-modal-actions">

                  <button
                    type="button"
                    onClick={() =>
                      setShowDeleteModal(false)
                    }
                    className="prof-cancel-btn"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="prof-confirm-delete-btn"
                    disabled={deletingAccount}
                  >

                    <Trash2 size={16} />

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

      </div>

    </div>
  );
}