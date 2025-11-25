import { useState } from "react";
import axios from "axios";
import strings from "../../../strings/manageCoursesPageStrings";

export default function ViewCourses({
  isDark,
  slots,
  loading,
  onSelectSlot,
  onRefresh,
}) {
  const [toggleLoading, setToggleLoading] = useState({});
  const [sortBy, setSortBy] = useState("course_name");
  const [selectedSlotDetail, setSelectedSlotDetail] = useState(null);

  const handleToggleStatus = async (slotId, currentStatus) => {
    setToggleLoading((prev) => ({ ...prev, [slotId]: true }));
    try {
      const res = await axios.post(
        `/api/instructor/time-slots/toggle-slot-status/${slotId}/`
      );
      if (res?.data?.success) {
        onRefresh && onRefresh();
        if (selectedSlotDetail?.id === slotId) {
          setSelectedSlotDetail({
            ...selectedSlotDetail,
            status: !selectedSlotDetail.status,
          });
        }
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    } finally {
      setToggleLoading((prev) => ({ ...prev, [slotId]: false }));
    }
  };

  const sortedSlots = [...slots].sort((a, b) => {
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

  if (slots.length === 0) {
    return (
      <div
        className={`p-6 rounded-lg ${isDark ? "bg-gray-800" : "bg-white"} shadow-lg h-full flex items-center justify-center`}
      >
        <div className="text-center">
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
          <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {strings.view.noSlotsDescription}
          </p>
        </div>
      </div>
    );
  }

  // Detail View
  if (selectedSlotDetail) {
    const slot = selectedSlotDetail;
    return (
      <div
        className={`p-6 rounded-lg ${isDark ? "bg-gray-800" : "bg-white"} shadow-lg h-full overflow-y-auto`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2
              className={`text-2xl font-bold mb-1 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {slot.course_name}
            </h2>
            {slot.section && (
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {strings.view.section}: {slot.section}
              </p>
            )}
            <p className={`text-xs mt-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {strings.view.id}: {slot.id}
            </p>
            {slot.created_at && (
              <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {strings.view.createdAt}: {new Date(slot.created_at).toLocaleString()}
              </p>
            )}
          </div>
          <button
            onClick={() => setSelectedSlotDetail(null)}
            className={`p-2 rounded-lg transition-all ${
              isDark
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
            title={strings.view.backToList}
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Status + Policy */}
        <div className="mb-6 flex items-center gap-4 flex-wrap">
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              slot.status
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-300"
            }`}
          >
            {slot.status ? strings.view.active : strings.view.inactive}
          </span>

          <span className={`px-3 py-1 rounded text-sm ${isDark ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-800"}`}>
            {strings.view.duration}: {slot.duration_minutes || "-"}
          </span>

        
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div
            className={`p-4 rounded-lg ${
              isDark ? "bg-gray-700" : "bg-gray-50"
            }`}
          >
            <p className={`text-sm font-medium mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {strings.view.day}
            </p>
            <p className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              {slot.day_of_week}
            </p>
          </div>

          <div
            className={`p-4 rounded-lg ${
              isDark ? "bg-gray-700" : "bg-gray-50"
            }`}
          >
            <p className={`text-sm font-medium mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {strings.view.time}
            </p>
            <p className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              {slot.start_time} - {slot.end_time}
            </p>
          </div>

          <div
            className={`p-4 rounded-lg ${
              isDark ? "bg-gray-700" : "bg-gray-50"
            }`}
          >
            <p className={`text-sm font-medium mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {strings.view.room}
            </p>
            <p className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              {slot.room}
            </p>
          </div>

          <div
            className={`p-4 rounded-lg ${
              isDark ? "bg-gray-700" : "bg-gray-50"
            }`}
          >
            <p className={`text-sm font-medium mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {strings.view.studentLimit}
            </p>
            <p className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              {slot.set_student_limit || 1}
            </p>
          </div>

          <div
            className={`p-4 rounded-lg md:col-span-2 ${
              isDark ? "bg-gray-700" : "bg-gray-50"
            }`}
          >
            <p className={`text-sm font-medium mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {strings.view.dates}
            </p>
            <p className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              {slot.start_date} {strings.view.to} {slot.end_date}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-3">
          <button
            onClick={() => onSelectSlot(slot, "edit")}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              isDark
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {strings.view.buttons.edit}
          </button>
          <button
            onClick={() => onSelectSlot(slot, "delete")}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              isDark
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {strings.view.buttons.delete}
          </button>
          <button
            onClick={() => handleToggleStatus(slot.id, slot.status)}
            disabled={toggleLoading[slot.id]}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              toggleLoading[slot.id] ? "opacity-50 cursor-not-allowed" : ""
            } ${
              slot.status
                ? isDark
                  ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                  : "bg-yellow-500 hover:bg-yellow-600 text-white"
                : isDark
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {toggleLoading[slot.id]
              ? strings.view.buttons.toggling
              : slot.status
              ? strings.view.buttons.deactivate
              : strings.view.buttons.activate}
          </button>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div
      className={`p-6 rounded-lg ${isDark ? "bg-gray-800" : "bg-white"} shadow-lg h-full overflow-y-auto`}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2
            className={`text-2xl font-bold mb-1 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {strings.view.title}
          </h2>
          <p className={isDark ? "text-gray-400" : "text-gray-600"}>
            {slots.length} {strings.view.slotsFound}
          </p>
        </div>
        <button
          onClick={onRefresh}
          className={`p-2 rounded-lg transition-all hover:scale-110 ${
            isDark
              ? "bg-gray-700 hover:bg-gray-600 text-white"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
          title={strings.view.refresh}
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
        </button>
      </div>

      {/* Sort Options */}
      <div className="mb-6">
        <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
          {strings.view.sortBy}
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={`w-full md:w-48 px-4 py-2 rounded-lg border transition-all ${
            isDark
              ? "bg-gray-700 border-gray-600 text-white focus:border-emerald-500"
              : "bg-white border-gray-300 text-gray-900 focus:border-emerald-500"
          } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
        >
          <option value="course_name">{strings.view.sortOptions.courseName}</option>
          <option value="day_of_week">{strings.view.sortOptions.dayOfWeek}</option>
          <option value="start_time">{strings.view.sortOptions.startTime}</option>
        </select>
      </div>

      {/* Courses List */}
      <div className="space-y-3">
        {sortedSlots.map((slot) => (
          <button
            key={slot.id}
            onClick={() => setSelectedSlotDetail(slot)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:border-emerald-500 ${
              isDark
                ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3
                  className={`font-bold text-lg ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {slot.course_name}
                </h3>
                <div
                  className={`text-sm space-y-1 mt-2 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <p>
                    {slot.day_of_week} • {slot.start_time} - {slot.end_time}
                  </p>
                  <p>{slot.room}</p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ml-4 flex-shrink-0 ${
                  slot.status
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                    : "bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-300"
                }`}
              >
                {slot.status ? strings.view.active : strings.view.inactive}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
