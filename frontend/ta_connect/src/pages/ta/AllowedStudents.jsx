import { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "../../contexts/ThemeContext";
import TAnavbar from "../../components/ta/TAnavbar";
import AllowedStudentsTable from "../../components/ta/mini-pages/AllowedStudentsTable";
import AddAllowedStudent from "../../components/ta/mini-pages/AddAllowedStudent";
import EditAllowedStudent from "../../components/ta/mini-pages/EditAllowedStudent";
import DeleteAllowedStudent from "../../components/ta/mini-pages/DeleteAllowedStudent";
import AllowedStudentsStatus from "../../components/ta/mini-pages/AllowedStudentsStatus";
import strings from "../../strings/allowedStudentsPageStrings";

const Modal = ({ title, onClose, isDark, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
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
          {title}
        </h3>
        <button
          onClick={onClose}
          className={`p-2 rounded-lg transition-all ${
            isDark
              ? "bg-gray-800 hover:bg-gray-700 text-white"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
          aria-label={strings.modals.close}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="overflow-y-auto max-h-[75vh] px-4 sm:px-6 py-4">
        {children}
      </div>
    </div>
  </div>
);

export default function AllowedStudents() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [allowedStudents, setAllowedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({ type: null, student: null });
  const [infoBanner, setInfoBanner] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    fetchSlots();
  }, []);

  useEffect(() => {
    if (!infoBanner) return;
    const timer = setTimeout(() => setInfoBanner(""), 5000);
    return () => clearTimeout(timer);
  }, [infoBanner]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/instructor/get-user-slots");
      setSlots(res?.data?.slots || []);
      if (res?.data?.slots?.length > 0) {
        setSelectedSlot(res.data.slots[0]);
        await fetchAllowedStudents(res.data.slots[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch slots:", err);
      setInfoBanner(strings.messages.error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllowedStudents = async (slotId) => {
    try {
      const res = await axios.get(`/api/instructor/allowed-students/${slotId}/`);
      setAllowedStudents(res?.data?.allowed_students || []);
    } catch (err) {
      console.error("Failed to fetch allowed students:", err);
      setAllowedStudents([]);
    }
  };

  const handleSlotChange = async (slot) => {
    setSelectedSlot(slot);
    await fetchAllowedStudents(slot.id);
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
      // Refresh slots to get updated status
      const res = await axios.get("/api/instructor/get-user-slots");
      const updatedSlots = res?.data?.slots || [];
      setSlots(updatedSlots);
      
      // Update the selected slot with the new data
      if (selectedSlot) {
        const updatedSelectedSlot = updatedSlots.find(s => s.id === selectedSlot.id);
        if (updatedSelectedSlot) {
          setSelectedSlot(updatedSelectedSlot);
        }
      }
    } catch (err) {
      console.error("Failed to refresh slots:", err);
    }
    setModalState({ type: null, student: null });
  };

  const openModal = (type, student = null) => {
    setModalState({ type, student });
  };

  const closeModal = () => {
    setModalState({ type: null, student: null });
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-950" : "bg-gray-50"}`}>
      <TAnavbar onToggle={setIsNavbarOpen} />

      <main
        className={`transition-all duration-300 ${
          isNavbarOpen ? "ml-64" : "ml-0"
        } pt-20 min-h-screen`}
      >
        <div className="px-4 sm:px-6 lg:px-10 py-6 space-y-6">
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

          {/* Slot Selection Section */}
          <section
            className={`rounded-2xl ${isDark ? "bg-gray-900/60" : "bg-white"} shadow-lg border ${isDark ? "border-gray-800" : "border-gray-100"} p-6`}
          >
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              {strings.slots.title}
            </h2>
            {slots.length > 0 ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <select
                    value={selectedSlot?.id || ""}
                    onChange={(e) => {
                      const slot = slots.find((s) => s.id === parseInt(e.target.value));
                      if (slot) handleSlotChange(slot);
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-white focus:border-emerald-500"
                        : "bg-white border-gray-200 text-gray-900 focus:border-emerald-500"
                    } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                  >
                    {slots.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {slot.course_name} - {slot.section || "N/A"} ({slot.day_of_week} {slot.start_time})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => openModal("status")}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                      isDark
                        ? "bg-blue-600 hover:bg-blue-500 text-white"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    }`}
                  >
                    {strings.buttons.toggle}
                  </button>
                </div>
                
                {/* Status Badge */}
                {selectedSlot && (
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border w-fit ${
                      selectedSlot.require_specific_email
                        ? isDark
                          ? "bg-amber-900/20 border-amber-700 text-amber-200"
                          : "bg-amber-50 border-amber-200 text-amber-800"
                        : isDark
                        ? "bg-emerald-900/20 border-emerald-700 text-emerald-200"
                        : "bg-emerald-50 border-emerald-200 text-emerald-800"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {selectedSlot.require_specific_email ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      )}
                    </svg>
                    <span className="font-semibold text-sm">
                      {selectedSlot.require_specific_email
                        ? strings.status.allowedOnly
                        : strings.status.allStudents}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className={`text-center py-8 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                <p>{strings.slots.noSlots}</p>
              </div>
            )}
          </section>

          {/* Students Table Section */}
          {selectedSlot && slots.length > 0 && (
            <section>
              <AllowedStudentsTable
                isDark={isDark}
                allowedStudents={allowedStudents}
                loading={loading}
                onRefresh={() => fetchAllowedStudents(selectedSlot.id)}
                onAddStudent={() => openModal("add")}
                onEditStudent={(student) => openModal("edit", student)}
                onDeleteStudent={(student) => openModal("delete", student)}
                selectedSlot={selectedSlot}
              />
            </section>
          )}
        </div>
      </main>

      {/* Modals */}
      {modalState.type === "add" && selectedSlot && (
        <Modal
          title={strings.modals.addTitle}
          onClose={closeModal}
          isDark={isDark}
        >
          <AddAllowedStudent
            isDark={isDark}
            slotId={selectedSlot.id}
            onStudentAdded={handleStudentAdded}
            onClose={closeModal}
          />
        </Modal>
      )}

      {modalState.type === "edit" && modalState.student && (
        <Modal
          title={strings.modals.editTitle}
          onClose={closeModal}
          isDark={isDark}
        >
          <EditAllowedStudent
            isDark={isDark}
            student={modalState.student}
            onStudentUpdated={handleStudentUpdated}
            onClose={closeModal}
          />
        </Modal>
      )}

      {modalState.type === "delete" && modalState.student && (
        <Modal
          title={strings.modals.deleteTitle}
          onClose={closeModal}
          isDark={isDark}
        >
          <DeleteAllowedStudent
            isDark={isDark}
            student={modalState.student}
            onStudentDeleted={handleStudentDeleted}
            onClose={closeModal}
          />
        </Modal>
      )}

      {modalState.type === "status" && selectedSlot && (
        <Modal
          title={strings.modals.statusTitle}
          onClose={closeModal}
          isDark={isDark}
        >
          <AllowedStudentsStatus
            isDark={isDark}
            slotId={selectedSlot.id}
            onStatusUpdated={handleStatusUpdated}
            onClose={closeModal}
          />
        </Modal>
      )}
    </div>
  );
}
