import { useState } from "react";
import axios from "axios";
import strings from "../../../strings/manageCoursesPageStrings";

export default function DeleteCourses({ isDark, slot, onSlotDeleted, onClose }) {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    if (!slot) {
      setError(strings.delete.errors.noSlotSelected);
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.delete(
        `/api/instructor/time-slots/${slot.id}/`
      );

      if (res?.data?.success) {
        setMessage(strings.delete.success);
        onSlotDeleted && onSlotDeleted(slot.id);
        if (onClose) {
          onClose();
        }
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

  if (!slot) {
    return (
      <div
        className={`p-6 rounded-lg ${
          isDark ? "bg-gray-800" : "bg-white"
        } shadow-lg`}
      >
        <div className="text-center">
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
    <div
      className={`p-4 sm:p-6 rounded-lg ${
        isDark ? "bg-gray-800" : "bg-white"
      } shadow-lg`}
    >
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex-1 min-w-0">
          <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            {strings.delete.title}
          </h2>
          <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {strings.delete.description}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all ${
              isDark
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
            title={strings.modals.close}
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
        )}
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
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
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

      <div
        className={`mb-6 p-4 rounded-lg border-l-4 ${
          isDark
            ? "bg-gray-700 border-red-600"
            : "bg-gray-50 border-red-500"
        }`}
      >
        <h3 className={`font-bold text-lg mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
          {slot.course_name}
        </h3>
        <div className={`space-y-1 text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
          <p>
            <span className="font-medium">{strings.delete.details.section}:</span> {slot.section || "N/A"}
          </p>
          <p>
            <span className="font-medium">{strings.delete.details.day}:</span> {slot.day_of_week}
          </p>
          <p>
            <span className="font-medium">{strings.delete.details.time}:</span> {slot.start_time} - {slot.end_time}
          </p>
          <p>
            <span className="font-medium">{strings.delete.details.room}:</span> {slot.room}
          </p>
          <p>
            <span className="font-medium">{strings.delete.details.dates}:</span> {slot.start_date} {strings.delete.details.to} {slot.end_date}
          </p>
        </div>
      </div>

      {!confirmDelete ? (
        <button
          onClick={() => setConfirmDelete(true)}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all hover:shadow-lg hover:scale-105 bg-red-600 hover:bg-red-700 text-white`}
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
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setConfirmDelete(false)}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                isDark
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-900"
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
    </div>
  );
}
