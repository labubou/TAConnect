import { useEffect, useState, useRef } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useLanguage } from "../../contexts/LanguageContext";
import TAnavbar from "../../components/ta/TAnavbar";
import CreateCourse from "../../components/ta/mini-pages/CreateCourse";
import ViewCourses from "../../components/ta/mini-pages/ViewCourses";
import EditCourses from "../../components/ta/mini-pages/EditCourses";
import DeleteCourses from "../../components/ta/mini-pages/DeleteCourses";
import ManageAllowedStudentsModal from "../../components/ta/mini-pages/ManageAllowedStudentsModal";
import ShareSlotModal from "../../components/ta/mini-pages/ShareSlotModal";
import { SkeletonLoader } from "../../components/General/SkeletonLoader";
import allStrings from "../../strings/manageCoursesPageStrings";
import { useInstructorSlots } from "../../hooks/useApi";
import { exportTimeSlotsAsCSV } from "../../services/exportService";

const Modal = ({ title, onClose, isDark, children, isOpen }) => {
  const { language } = useLanguage();
  const strings = allStrings[language];
  const modalRef = useRef(null);
  
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      // Focus trap
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements?.[0];
      const lastElement = focusableElements?.[focusableElements.length - 1];
      
      const handleTabKey = (e) => {
        if (e.key !== 'Tab') return;
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            e.preventDefault();
          }
        }
      };
      
      modalRef.current?.addEventListener('keydown', handleTabKey);
      firstElement?.focus();
      
      return () => {
        document.body.style.overflow = 'unset';
        modalRef.current?.removeEventListener('keydown', handleTabKey);
      };
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div
        ref={modalRef}
        className={`relative w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl transform transition-all duration-300 animate-zoomIn ${
          isDark
            ? "bg-gray-900 border border-gray-800"
            : "bg-white border border-gray-100"
        }`}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 gap-4">
          <h3 
            id="modal-title"
            className={`text-lg sm:text-xl font-semibold flex-1 truncate ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 ${
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
        <div className="overflow-y-auto max-h-[75vh] px-4 sm:px-6 py-4 scroll-smooth">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function ManageCourses() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme === "dark";
  const strings = allStrings[language];
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);
  const [modalState, setModalState] = useState({ type: null, slot: null });
  const [infoBanner, setInfoBanner] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");

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

  useEffect(() => {
    if (!exportError) return;
    const timer = setTimeout(() => setExportError(""), 5000);
    return () => clearTimeout(timer);
  }, [exportError]);

  const handleExportTimeSlots = async () => {
    setIsExporting(true);
    setExportError("");
    
    try {
      // TODO: Get username from user context if available, otherwise use 'ta'
      await exportTimeSlotsAsCSV();
      setInfoBanner(strings.view.export.success);
    } catch (error) {
      console.error('Export failed:', error);
      setExportError(error.message || strings.view.export.error);
    } finally {
      setIsExporting(false);
    }
  };

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
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-gray-950" : "bg-gray-50"}`}>
      <TAnavbar onToggle={setIsNavbarOpen} />

      <main
        className={`transition-all duration-300 ease-in-out ${
          isNavbarOpen ? "ml-0 sm:ml-64" : "ml-0"
        } pt-20 min-h-screen`}
      >
        <div className="px-3 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* Loading skeleton while fetching data */}
          {isLoading && (
            <div className="space-y-4 animate-fadeIn">
              <SkeletonLoader isDark={isDark} count={5} height="h-20" />
            </div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <div 
              className={`rounded-2xl px-4 py-3 border text-sm animate-slideUp shadow-lg ${
                isDark
                  ? "bg-red-900/20 border-red-700 text-red-200"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              <p className="font-medium">{error.message || strings.view.loading}</p>
            </div>
          )}

          {infoBanner && (
            <div
              className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-3 border flex items-center justify-between gap-2 sm:gap-4 text-sm animate-slideUp shadow-lg ${
                isDark
                  ? "bg-emerald-900/20 border-emerald-700 text-emerald-200"
                  : "bg-emerald-50 border-emerald-200 text-emerald-800"
              }`}
            >
              <p className="text-xs sm:text-sm font-medium">{infoBanner}</p>
              <button
                onClick={() => setInfoBanner("")}
                className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 ${
                  isDark
                    ? "hover:bg-emerald-900/40 text-emerald-100"
                    : "hover:bg-emerald-100 text-emerald-900"
                }`}
                aria-label={strings.modals.close}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {exportError && (
            <div
              className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-3 border flex items-center justify-between gap-2 sm:gap-4 text-sm animate-slideUp shadow-lg ${
                isDark
                  ? "bg-red-900/20 border-red-700 text-red-200"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              <p className="text-xs sm:text-sm font-medium">{exportError}</p>
              <button
                onClick={() => setExportError("")}
                className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 ${
                  isDark
                    ? "hover:bg-red-900/40 text-red-100"
                    : "hover:bg-red-100 text-red-900"
                }`}
                aria-label={strings.modals.close}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Main content - only show when not loading */}
          {!isLoading && (
            <section className="animate-slideInFromBottom">
              <ViewCourses
                isDark={isDark}
                slots={slots}
                loading={isLoading}
                onRefresh={refetch}
                onAddCourse={() => openModal("create")}
                onEditSlot={(slot) => openModal("edit", slot)}
                onDeleteSlot={(slot) => openModal("delete", slot)}
                onManageStudents={handleManageStudents}
                onExportSlots={handleExportTimeSlots}
                isExporting={isExporting}
                onShareSlot={(slot) => openModal("share", slot)}
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
          isOpen={modalState.type === "create"}
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
          isOpen={modalState.type === "edit"}
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
          isOpen={modalState.type === "delete"}
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
          isOpen={modalState.type === "manageStudents"}
        >
          <ManageAllowedStudentsModal
            isDark={isDark}
            slot={modalState.slot}
            onClose={closeModal}
          />
        </Modal>
      )}

      {modalState.type === "share" && modalState.slot && (
        <Modal
          title={strings.modals.shareTitle}
          onClose={closeModal}
          isDark={isDark}
          isOpen={modalState.type === "share"}
        >
          <ShareSlotModal
            isDark={isDark}
            slot={modalState.slot}
            onClose={closeModal}
          />
        </Modal>
      )}
    </div>
  );
}
