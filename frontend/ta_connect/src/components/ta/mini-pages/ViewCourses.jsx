import { useState, useMemo } from "react";
import axios from "axios";
import strings from "../../../strings/manageCoursesPageStrings";
import WarningModal from "../../General/WarningModal";

export default function ViewCourses({
  isDark,
  slots,
  loading,
  onRefresh,
  onAddCourse,
  onEditSlot,
  onDeleteSlot,
  onManageStudents,
  onExportSlots,
  isExporting,
  onShareSlot,
}) {
  const [toggleLoading, setToggleLoading] = useState({});
  const [sortBy, setSortBy] = useState("course_name");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [warningModal, setWarningModal] = useState({ show: false, slotId: null, isDeactivating: false });

  const handleToggleStatus = (slotId, isDeactivating) => {
    // Show warning modal first
    setWarningModal({
      show: true,
      slotId: slotId,
      isDeactivating: isDeactivating,
    });
  };

  const handleConfirmToggleStatus = async () => {
    const { slotId } = warningModal;
    setWarningModal({ show: false, slotId: null, isDeactivating: false });
    setToggleLoading((prev) => ({ ...prev, [slotId]: true }));

    try {
      const res = await axios.post(
        `/api/instructor/time-slots/toggle-slot-status/${slotId}/`
      );
      if (res?.data?.success) {
        onRefresh && onRefresh();
      } else {
        console.error("Failed to toggle status:", res?.data?.error);
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
      // TODO: Add error handling UI to show to user
    } finally {
      setToggleLoading((prev) => ({ ...prev, [slotId]: false }));
    }
  };

  const filteredSlots = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return [...slots]
      .filter((slot) => {
        const sectionValue = slot.section ? slot.section.toLowerCase() : "";
        const roomValue = slot.room ? slot.room.toLowerCase() : "";
        const matchesSearch =
          slot.course_name.toLowerCase().includes(lowerSearch) ||
          sectionValue.includes(lowerSearch) ||
          roomValue.includes(lowerSearch);
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && slot.status) ||
          (statusFilter === "inactive" && !slot.status);
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "course_name":
            return a.course_name.localeCompare(b.course_name);
          case "day_of_week":
            const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
            return days.indexOf(a.day_of_week) - days.indexOf(b.day_of_week);
          case "start_time":
            return a.start_time.localeCompare(b.start_time);
          default:
            return 0;
        }
      });
  }, [slots, searchTerm, sortBy, statusFilter]);

  if (loading) {
    return (
      <div
        className={`p-6 rounded-lg ${isDark ? "bg-gray-800" : "bg-white"} shadow-lg h-full flex items-center justify-center`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            {strings.view.loading}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-0 sm:p-6 rounded-lg ${isDark ? "bg-transparent" : "bg-transparent"} h-full`}
    >
      {warningModal.show && (
        <WarningModal
          isDark={isDark}
          title={
            warningModal.isDeactivating
              ? strings.warningModal.deactivateTitle
              : strings.warningModal.editTitle
          }
          message={
            warningModal.isDeactivating
              ? strings.warningModal.deactivateMessage
              : strings.warningModal.activateMessage
          }
          warningText={
            warningModal.isDeactivating
              ? strings.warningModal.deactivateWarning
              : strings.warningModal.activateWarning
          }
          onConfirm={handleConfirmToggleStatus}
          onCancel={() => setWarningModal({ show: false, slotId: null, isDeactivating: false })}
          confirmText={
            warningModal.isDeactivating
              ? strings.warningModal.deactivateConfirm
              : strings.warningModal.activateConfirm
          }
          cancelText={strings.warningModal.editCancel}
          isLoading={toggleLoading[warningModal.slotId]}
        />
      )}

      <div
        className={`rounded-2xl ${isDark ? "bg-gray-900/60" : "bg-white"} shadow-lg border ${isDark ? "border-gray-800" : "border-gray-100"}`}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2
                className={`text-2xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {strings.view.title}
              </h2>
              <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                {slots.length} {strings.view.slotsFound}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onRefresh}
                className={`w-full sm:w-auto px-4 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                  isDark
                    ? "bg-gray-800 hover:bg-gray-700 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {strings.view.refresh}
              </button>
              {onExportSlots && (
                <button
                  onClick={onExportSlots}
                  disabled={isExporting}
                  className={`w-full sm:w-auto px-4 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                    isDark
                      ? "bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
                      : "bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
                  }`}
                  title="Export time slots as CSV for data analysis"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {isExporting ? 'Exporting...' : 'Export CSV'}
                </button>
              )}
              <button
                onClick={onAddCourse}
                className={`w-full sm:w-auto px-4 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                  isDark
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                {strings.view.buttons.addCourse}
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                {strings.view.search}
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={strings.view.searchPlaceholder}
                className={`w-full px-4 py-2 rounded-lg border transition-all ${
                  isDark
                    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-emerald-500"
                } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                {strings.view.sortBy}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border transition-all ${
                  isDark
                    ? "bg-gray-800 border-gray-700 text-white focus:border-emerald-500"
                    : "bg-white border-gray-300 text-gray-900 focus:border-emerald-500"
                } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
              >
                <option value="course_name">{strings.view.sortOptions.courseName}</option>
                <option value="day_of_week">{strings.view.sortOptions.dayOfWeek}</option>
                <option value="start_time">{strings.view.sortOptions.startTime}</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                {strings.view.statusFilter}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border transition-all ${
                  isDark
                    ? "bg-gray-800 border-gray-700 text-white focus:border-emerald-500"
                    : "bg-white border-gray-300 text-gray-900 focus:border-emerald-500"
                } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
              >
                <option value="all">{strings.view.statusOptions.all}</option>
                <option value="active">{strings.view.statusOptions.active}</option>
                <option value="inactive">{strings.view.statusOptions.inactive}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredSlots.length === 0 ? (
            <div className="text-center py-16">
              <svg
                className={`w-16 h-16 mx-auto mb-4 ${isDark ? "text-gray-600" : "text-gray-300"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m0 0h6m0 0v-6"
                />
              </svg>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                {strings.view.noSlots}
              </h3>
              <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                {strings.view.noSlotsDescription}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`rounded-2xl border transition-all hover:shadow-lg ${
                    isDark
                      ? "bg-gray-900/60 border-gray-800"
                      : "bg-white border-gray-100"
                  }`}
                >
                  <div className="p-5 flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`text-xl font-semibold truncate ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {slot.course_name}
                        </h3>
                        {slot.section && (
                          <p className={`text-sm truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            {strings.view.section}: {slot.section}
                          </p>
                        )}
                        <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                          {strings.view.id}: {slot.id}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          slot.status
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                            : "bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {slot.status ? strings.view.active : strings.view.inactive}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className={isDark ? "text-gray-400" : "text-gray-500"}>{strings.view.day}</span>
                        <span className={isDark ? "text-white" : "text-gray-900"}>{slot.day_of_week}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={isDark ? "text-gray-400" : "text-gray-500"}>{strings.view.time}</span>
                        <span className={isDark ? "text-white" : "text-gray-900"}>
                          {slot.start_time} - {slot.end_time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={isDark ? "text-gray-400" : "text-gray-500"}>{strings.view.room}</span>
                        <span className={isDark ? "text-white" : "text-gray-900"}>{slot.room}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={isDark ? "text-gray-400" : "text-gray-500"}>{strings.view.studentLimit}</span>
                        <span className={isDark ? "text-white" : "text-gray-900"}>{slot.set_student_limit || 1}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={isDark ? "text-gray-400" : "text-gray-500"}>{strings.view.dates}</span>
                        <span className={`text-right ${isDark ? "text-white" : "text-gray-900"}`}>
                          {slot.start_date} {strings.view.to} {slot.end_date}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      {/* First row: Edit, Delete, Share */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEditSlot && onEditSlot(slot)}
                          className={`flex-1 py-2 px-3 rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-1 ${
                            isDark
                              ? "bg-blue-600 hover:bg-blue-500 text-white"
                              : "bg-blue-500 hover:bg-blue-600 text-white"
                          }`}
                        >
                          <svg
                            className="w-4 h-4 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          <span>{strings.view.buttons.edit}</span>
                        </button>
                        <button
                          onClick={() => onDeleteSlot && onDeleteSlot(slot)}
                          className={`flex-1 py-2 px-3 rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-1 ${
                            isDark
                              ? "bg-red-600 hover:bg-red-500 text-white"
                              : "bg-red-500 hover:bg-red-600 text-white"
                          }`}
                        >
                          <svg
                            className="w-4 h-4 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          <span>{strings.view.buttons.delete}</span>
                        </button>
                        <button
                          onClick={() => onShareSlot && onShareSlot(slot)}
                          disabled={!onShareSlot}
                          className={`flex-1 py-2 px-3 rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-1 ${
                            isDark
                              ? "bg-purple-600 hover:bg-purple-500 text-white"
                              : "bg-purple-500 hover:bg-purple-600 text-white"
                          } ${!onShareSlot ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <svg
                            className="w-4 h-4 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-5.368m0 5.368l6.632 3.316m-6.632-8.684a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                            />
                          </svg>
                          <span>{strings.view.buttons.share || "Share"}</span>
                        </button>
                      </div>
                      {/* Second row: Manage Students, Activate/Deactivate */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => onManageStudents && onManageStudents(slot)}
                          disabled={!onManageStudents}
                          className={`flex-1 py-2 px-3 rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-1 border whitespace-nowrap ${
                            isDark
                              ? "border-gray-700 text-gray-200 hover:bg-gray-800"
                              : "border-gray-200 text-gray-700 hover:bg-gray-100"
                          } ${!onManageStudents ? "opacity-50 cursor-not-allowed" : ""}`}
                          title={strings.view.manageStudentsComingSoon}
                        >
                          <span className="hidden md:inline">{strings.view.buttons.manageStudents}</span>
                          <span className="md:hidden text-xs">Students</span>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(slot.id, slot.status)}
                          disabled={toggleLoading[slot.id]}
                          className={`flex-1 py-2 px-3 rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-1 whitespace-nowrap ${
                            toggleLoading[slot.id] ? "opacity-50 cursor-not-allowed" : ""
                          } ${
                            slot.status
                              ? isDark
                                ? "bg-yellow-600 hover:bg-yellow-500 text-white"
                                : "bg-yellow-500 hover:bg-yellow-600 text-white"
                              : isDark
                              ? "bg-green-600 hover:bg-green-500 text-white"
                              : "bg-green-500 hover:bg-green-600 text-white"
                          }`}
                        >
                          {toggleLoading[slot.id]
                            ? strings.view.buttons.toggling
                            : slot.status
                            ? strings.view.buttons.deactivate
                            : strings.view.buttons.activate}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
