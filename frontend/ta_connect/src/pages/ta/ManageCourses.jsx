import { useEffect, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import TAnavbar from "../../components/ta/TAnavbar";
import CreateCourse from "../../components/ta/mini-pages/CreateCourse";
import ViewCourses from "../../components/ta/mini-pages/ViewCourses";
import EditCourses from "../../components/ta/mini-pages/EditCourses";
import DeleteCourses from "../../components/ta/mini-pages/DeleteCourses";
import ManageAllowedStudentsModal from "../../components/ta/mini-pages/ManageAllowedStudentsModal";
import { SkeletonLoader } from "../../components/SkeletonLoader";
import strings from "../../strings/manageCoursesPageStrings";
import { useInstructorSlots } from "../../hooks/useApi";

const Modal = ({ title, onClose, isDark, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    ></div>
    <div
      className={`relative w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl ${
        isDark
          ? "bg-gray-900 border border-gray-800"
          : "bg-white border border-gray-100"
      }`}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 gap-4">
        <h3 className={`text-lg sm:text-xl font-semibold flex-1 truncate ${isDark ? "text-white" : "text-gray-900"}`}>
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

export default function ManageCourses() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);
  const [modalState, setModalState] = useState({ type: null, slot: null });
  const [infoBanner, setInfoBanner] = useState("");

  // Use React Query for efficient data fetching with caching
  const { 
    data: slots = [], 
    isLoading, 
    error, 
    refetch,
    invalidateQueries 
  } = useInstructorSlots();

  useEffect(() => {
    if (!infoBanner) return;
    const timer = setTimeout(() => setInfoBanner(""), 5000);
    return () => clearTimeout(timer);
  }, [infoBanner]);

  const handleSlotCreated = (newSlot) => {
    // Refetch to get updated list from server
    refetch();
    setModalState({ type: null, slot: null });
  };

  const handleSlotDeleted = (id) => {
    // Refetch to get updated list from server
    refetch();
    setModalState({ type: null, slot: null });
  };

  const handleSlotUpdated = (updatedSlot) => {
    // Refetch to get updated list from server
    refetch();
    setModalState({ type: null, slot: null });
  };

  const openModal = (type, slot = null) => {
    setModalState({ type, slot });
  };

  const closeModal = () => {
    setModalState({ type: null, slot: null });
  };

  const handleManageStudents = (slot) => {
    openModal("manageStudents", slot);
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-950" : "bg-gray-50"}`}>
      <TAnavbar onToggle={setIsNavbarOpen} />

      <main
        className={`transition-all duration-300 ${
          isNavbarOpen ? "ml-0 sm:ml-64" : "ml-0"
        } pt-20 min-h-screen`}
      >
        <div className="px-3 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* Loading skeleton while fetching data */}
          {isLoading && (
            <div className="space-y-4">
              <SkeletonLoader isDark={isDark} count={5} height="h-20" />
            </div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <div className={`rounded-2xl px-4 py-3 border text-sm ${
              isDark
                ? "bg-red-900/20 border-red-700 text-red-200"
                : "bg-red-50 border-red-200 text-red-800"
            }`}>
              <p className="font-medium">{error.message || 'Failed to load courses'}</p>
            </div>
          )}

          {infoBanner && (
            <div
              className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-3 border flex items-center justify-between gap-2 sm:gap-4 text-sm ${
                isDark
                  ? "bg-emerald-900/20 border-emerald-700 text-emerald-200"
                  : "bg-emerald-50 border-emerald-200 text-emerald-800"
              }`}
            >
              <p className="text-xs sm:text-sm font-medium">{infoBanner}</p>
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

          {/* Main content - only show when not loading */}
          {!isLoading && (
            <section>
              <ViewCourses
                isDark={isDark}
                slots={slots}
                loading={isLoading}
                onRefresh={refetch}
                onAddCourse={() => openModal("create")}
                onEditSlot={(slot) => openModal("edit", slot)}
                onDeleteSlot={(slot) => openModal("delete", slot)}
                onManageStudents={handleManageStudents}
              />
            </section>
          )}
        </div>
      </main>

      {modalState.type === "create" && (
        <Modal
          title={strings.modals.createTitle}
          onClose={closeModal}
          isDark={isDark}
        >
          <CreateCourse
            isDark={isDark}
            slots={slots}
            onSlotCreated={handleSlotCreated}
            onClose={closeModal}
          />
        </Modal>
      )}

      {modalState.type === "edit" && modalState.slot && (
        <Modal
          title={strings.modals.editTitle}
          onClose={closeModal}
          isDark={isDark}
        >
          <EditCourses
            isDark={isDark}
            slot={modalState.slot}
            onSlotUpdated={handleSlotUpdated}
            onClose={closeModal}
          />
        </Modal>
      )}

      {modalState.type === "delete" && modalState.slot && (
        <Modal
          title={strings.modals.deleteTitle}
          onClose={closeModal}
          isDark={isDark}
        >
          <DeleteCourses
            isDark={isDark}
            slot={modalState.slot}
            onSlotDeleted={handleSlotDeleted}
            onClose={closeModal}
          />
        </Modal>
      )}

      {modalState.type === "manageStudents" && modalState.slot && (
        <Modal
          title={`${strings.modals.manageStudentsTitle}: ${modalState.slot.course_name}`}
          onClose={closeModal}
          isDark={isDark}
        >
          <ManageAllowedStudentsModal
            isDark={isDark}
            slot={modalState.slot}
            onClose={closeModal}
          />
        </Modal>
      )}
    </div>
  );
}
