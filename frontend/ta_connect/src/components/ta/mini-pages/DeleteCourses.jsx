import { useState } from "react";
import axios from "axios";
import strings from "../../../strings/manageCoursesPageStrings";

export default function DeleteCourses({
  isDark,
  slots,
  selectedSlot,
  onSlotDeleted,
  onSelectSlot,
}) {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [sortBy, setSortBy] = useState("course_name");

  const handleDelete = async () => {
    if (!selectedSlot) {
      setError(strings.delete.errors.noSlotSelected);
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.delete(
        `/api/instructor/time-slots/${selectedSlot.id}/`
      );

      if (res?.data?.success) {
        setMessage(strings.delete.success);
        onSlotDeleted && onSlotDeleted(selectedSlot.id);
        setConfirmDelete(false);
        setTimeout(() => {
          onSelectSlot(null);
        }, 1500);
      } else {
        setError(res?.data?.error || strings.delete.errors.failed);
      }
    } catch (err) {
      console.error("Delete slot error:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          strings.delete.errors.failed
      );
    } finally {
      setLoading(false);
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

  if (slots.length === 0) {
    return (
      <div
        className={`p-6 rounded-lg ${
          isDark ? "bg-gray-800" : "bg-white"
        } shadow-lg h-full flex items-center justify-center`}
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
            {strings.delete.selectASlot}
          </h3>
          <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {strings.delete.selectDescription}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 h-full`}>
      {/* List Panel */}
      <div
        className={`lg:col-span-1 p-6 rounded-lg ${isDark ? "bg-gray-800" : "bg-white"} shadow-lg overflow-y-auto`}
      >
        <div className="mb-4">
          <h3 className={`text-lg font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
            {strings.delete.availableSlots}
          </h3>
          <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
            {strings.view.sortBy}
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border transition-all ${
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

        {/* Slots List */}
        <div className="space-y-2">
          {sortedSlots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => {
                onSelectSlot(slot);
                setError("");
                setMessage("");
                setConfirmDelete(false);
              }}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                selectedSlot?.id === slot.id
                  ? isDark
                    ? "border-red-500 bg-red-900/20"
                    : "border-red-500 bg-red-50"
                  : isDark
                  ? "border-gray-600 bg-gray-700 hover:border-red-500"
                  : "border-gray-200 bg-gray-50 hover:border-red-500"
              }`}
            >
              <p className={`font-medium text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                {slot.course_name}
              </p>
              <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {slot.day_of_week} • {slot.start_time}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Panel */}
      <div
        className={`lg:col-span-2 p-6 rounded-lg ${
          isDark ? "bg-gray-800" : "bg-white"
        } shadow-lg overflow-y-auto`}
      >
        {selectedSlot ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                {strings.delete.title}
              </h2>
              <button
                onClick={() => {
                  onSelectSlot(null);
                  setError("");
                  setMessage("");
                  setConfirmDelete(false);
                }}
                className={`p-2 rounded-lg transition-all ${
                  isDark
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                title={strings.delete.deselectSlot}
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

            {error && (
              <div className={`mb-4 p-4 rounded-lg ${isDark ? "bg-red-900/30 border border-red-700 text-red-300" : "bg-red-100 border border-red-400 text-red-700"}`}>
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {message && (
              <div className={`mb-4 p-4 rounded-lg ${isDark ? "bg-green-900/30 border border-green-700 text-green-300" : "bg-green-100 border border-green-400 text-green-700"}`}>
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{message}</span>
                </div>
              </div>
            )}

            {/* Warning Alert */}
            <div
              className={`mb-6 p-4 rounded-lg border ${
                isDark
                  ? "bg-red-900/20 border-red-700/50 text-red-300"
                  : "bg-red-50 border-red-300 text-red-800"
              }`}
            >
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="font-semibold">{strings.delete.warning.title}</p>
                  <p className="text-sm">{strings.delete.warning.message}</p>
                </div>
              </div>
            </div>

            {/* Slot Details */}
            <div
              className={`mb-6 p-4 rounded-lg border-l-4 ${
                isDark
                  ? "bg-gray-700 border-red-600"
                  : "bg-gray-50 border-red-500"
              }`}
            >
              <h3
                className={`font-bold text-lg mb-3 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {selectedSlot.course_name}
              </h3>
              <div className={`space-y-1 text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                <p>
                  <span className="font-medium">{strings.delete.details.section}:</span>{" "}
                  {selectedSlot.section || "N/A"}
                </p>
                <p>
                  <span className="font-medium">{strings.delete.details.day}:</span>{" "}
                  {selectedSlot.day_of_week}
                </p>
                <p>
                  <span className="font-medium">{strings.delete.details.time}:</span>{" "}
                  {selectedSlot.start_time} - {selectedSlot.end_time}
                </p>
                <p>
                  <span className="font-medium">{strings.delete.details.room}:</span>{" "}
                  {selectedSlot.room}
                </p>
                <p>
                  <span className="font-medium">{strings.delete.details.dates}:</span>{" "}
                  {selectedSlot.start_date} {strings.delete.details.to} {selectedSlot.end_date}
                </p>
              </div>
            </div>

            {/* Confirmation Section */}
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                  loading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:shadow-lg hover:scale-105"
                } bg-red-600 hover:bg-red-700 text-white`}
              >
                {strings.delete.buttons.delete}
              </button>
            ) : (
              <div className="space-y-3">
                <p
                  className={`text-center font-semibold ${
                    isDark ? "text-red-300" : "text-red-700"
                  }`}
                >
                  {strings.delete.confirmMessage}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                      isDark
                        ? "bg-gray-700 hover:bg-gray-600 text-white"
                        : "bg-gray-300 hover:bg-gray-400 text-gray-900"
                    }`}
                  >
                    {strings.delete.buttons.cancel}
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                      loading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:shadow-lg hover:scale-105"
                    } bg-red-600 hover:bg-red-700 text-white`}
                  >
                    {loading
                      ? strings.delete.buttons.deleting
                      : strings.delete.buttons.confirmDelete}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <svg
                className={`w-16 h-16 mx-auto mb-4 ${
                  isDark ? "text-gray-600" : "text-gray-300"
                }`}
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
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                {strings.delete.selectASlot}
              </h3>
              <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
                {strings.delete.selectDescription}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
