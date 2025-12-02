import { useState, useEffect } from "react";
import axios from "axios";
import { useLanguage } from "../../../contexts/LanguageContext";
import AllowedStudentsTable from "./AllowedStudentsTable";
import AddAllowedStudent from "./AddAllowedStudent";
import EditAllowedStudent from "./EditAllowedStudent";
import DeleteAllowedStudent from "./DeleteAllowedStudent";
import AllowedStudentsStatus from "./AllowedStudentsStatus";
import allStrings from "../../../strings/allowedStudentsPageStrings";

export default function ManageAllowedStudentsModal({
  isDark,
  slot,
  onClose,
}) {
  const { language } = useLanguage();
  const strings = allStrings[language] || allStrings.en;
  const [allowedStudents, setAllowedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({ type: null, student: null });
  const [infoBanner, setInfoBanner] = useState("");
  const [currentSlot, setCurrentSlot] = useState(slot);

  useEffect(() => {
    if (slot) {
      setCurrentSlot(slot);
      fetchAllowedStudents();
    }
  }, [slot]);

  useEffect(() => {
    if (!infoBanner) return;
    const timer = setTimeout(() => setInfoBanner(""), 5000);
    return () => clearTimeout(timer);
  }, [infoBanner]);

  const fetchAllowedStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/instructor/allowed-students/${slot.id}/`);
      setAllowedStudents(res?.data?.allowed_students || []);
    } catch (err) {
      console.error("Failed to fetch allowed students:", err);
      setAllowedStudents([]);
      setInfoBanner(strings.messages.error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentAdded = (newStudent) => {
    setAllowedStudents((prev) => [...prev, newStudent]);
    setModalState({ type: null, student: null });
    setInfoBanner(strings.messages.addSuccess);
  };

  const handleStudentUpdated = (updatedStudent) => {
    setAllowedStudents((prev) =>
      prev.map((student) => (student.id === updatedStudent.id ? updatedStudent : student))
    );
    setModalState({ type: null, student: null });
    setInfoBanner(strings.messages.editSuccess);
  };

  const handleStudentDeleted = (studentId) => {
    setAllowedStudents((prev) => prev.filter((student) => student.id !== studentId));
    setModalState({ type: null, student: null });
    setInfoBanner(strings.messages.deleteSuccess);
  };

  const handleStatusUpdated = async () => {
    try {
      // Refresh slot data to get updated status
      const res = await axios.get("/api/instructor/get-user-slots");
      const updatedSlot = res?.data?.slots?.find(s => s.id === slot.id);
      if (updatedSlot) {
        setCurrentSlot(updatedSlot);
      }
    } catch (err) {
      console.error("Failed to refresh slot:", err);
    }
    setModalState({ type: null, student: null });
  };

  const openModal = (type, student = null) => {
    setModalState({ type, student });
  };

  const closeNestedModal = () => {
    setModalState({ type: null, student: null });
  };

  if (!slot) return null;

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      {infoBanner && (
        <div
          className={`rounded-2xl px-4 py-3 border flex items-center justify-between gap-4 ${
            isDark
              ? "bg-emerald-900/20 border-emerald-700 text-emerald-200"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          <p className="text-sm font-medium">{infoBanner}</p>
          <button
            onClick={() => setInfoBanner("")}
            className={`p-2 rounded-lg ${
              isDark
                ? "hover:bg-emerald-900/40 text-emerald-100"
                : "hover:bg-emerald-100 text-emerald-900"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Slot Info */}
      <div
        className={`rounded-2xl ${isDark ? "bg-gray-900/60" : "bg-white"} shadow-lg border ${
          isDark ? "border-gray-800" : "border-gray-100"
        } p-6`}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              {currentSlot.course_name}
              {currentSlot.section && ` - ${currentSlot.section}`}
            </h3>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {currentSlot.day_of_week} {currentSlot.start_time} - {currentSlot.end_time} • {currentSlot.room}
            </p>
          </div>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm ${
              currentSlot.require_specific_email
                ? isDark
                  ? "bg-amber-900/20 border-amber-700 text-amber-200"
                  : "bg-amber-50 border-amber-200 text-amber-800"
                : isDark
                ? "bg-emerald-900/20 border-emerald-700 text-emerald-200"
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {currentSlot.require_specific_email ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              )}
            </svg>
            <span className="font-semibold">
              {currentSlot.require_specific_email
                ? strings.status.allowedOnly
                : strings.status.allStudents}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => openModal("status")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              isDark
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {strings.buttons.toggle}
          </button>
        </div>
      </div>

      {/* Students Table */}
      <AllowedStudentsTable
        isDark={isDark}
        allowedStudents={allowedStudents}
        loading={loading}
        onRefresh={fetchAllowedStudents}
        onAddStudent={() => openModal("add")}
        onEditStudent={(student) => openModal("edit", student)}
        onDeleteStudent={(student) => openModal("delete", student)}
        selectedSlot={currentSlot}
      />

      {/* Nested Modals */}
      {modalState.type === "add" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeNestedModal}
          ></div>
          <div
            className={`relative w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl shadow-2xl ${
              isDark
                ? "bg-gray-900 border border-gray-800"
                : "bg-white border border-gray-100"
            }`}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className={`text-xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                {strings.modals.addTitle}
              </h3>
              <button
                onClick={closeNestedModal}
                className={`p-2 rounded-lg transition-all ${
                  isDark
                    ? "bg-gray-800 hover:bg-gray-700 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-[75vh] px-4 sm:px-6 py-4">
              <AddAllowedStudent
                isDark={isDark}
                slotId={slot.id}
                onStudentAdded={handleStudentAdded}
                onClose={closeNestedModal}
              />
            </div>
          </div>
        </div>
      )}

      {modalState.type === "edit" && modalState.student && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeNestedModal}
          ></div>
          <div
            className={`relative w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl shadow-2xl ${
              isDark
                ? "bg-gray-900 border border-gray-800"
                : "bg-white border border-gray-100"
            }`}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className={`text-xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                {strings.modals.editTitle}
              </h3>
              <button
                onClick={closeNestedModal}
                className={`p-2 rounded-lg transition-all ${
                  isDark
                    ? "bg-gray-800 hover:bg-gray-700 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-[75vh] px-4 sm:px-6 py-4">
              <EditAllowedStudent
                isDark={isDark}
                student={modalState.student}
                onStudentUpdated={handleStudentUpdated}
                onClose={closeNestedModal}
              />
            </div>
          </div>
        </div>
      )}

      {modalState.type === "delete" && modalState.student && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeNestedModal}
          ></div>
          <div
            className={`relative w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl shadow-2xl ${
              isDark
                ? "bg-gray-900 border border-gray-800"
                : "bg-white border border-gray-100"
            }`}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className={`text-xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                {strings.modals.deleteTitle}
              </h3>
              <button
                onClick={closeNestedModal}
                className={`p-2 rounded-lg transition-all ${
                  isDark
                    ? "bg-gray-800 hover:bg-gray-700 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-[75vh] px-4 sm:px-6 py-4">
              <DeleteAllowedStudent
                isDark={isDark}
                student={modalState.student}
                onStudentDeleted={handleStudentDeleted}
                onClose={closeNestedModal}
              />
            </div>
          </div>
        </div>
      )}

      {modalState.type === "status" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeNestedModal}
          ></div>
          <div
            className={`relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl shadow-2xl ${
              isDark
                ? "bg-gray-900 border border-gray-800"
                : "bg-white border border-gray-100"
            }`}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className={`text-xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                {strings.modals.statusTitle}
              </h3>
              <button
                onClick={closeNestedModal}
                className={`p-2 rounded-lg transition-all ${
                  isDark
                    ? "bg-gray-800 hover:bg-gray-700 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-[75vh] px-4 sm:px-6 py-4">
              <AllowedStudentsStatus
                isDark={isDark}
                slotId={currentSlot.id}
                onStatusUpdated={handleStatusUpdated}
                onClose={closeNestedModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
