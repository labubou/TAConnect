import { useState } from "react";
import axios from "axios";
import { useLanguage } from "../../../contexts/LanguageContext";
import allStrings from "../../../strings/allowedStudentsPageStrings";

export default function DeleteAllowedStudent({
  isDark,
  student,
  onStudentDeleted,
  onClose,
}) {
  const { language } = useLanguage();
  const strings = allStrings[language] || allStrings.en;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await axios.delete(
        `/api/instructor/allowed-students-detail/${student.id}/`
      );

      if (res?.data?.success) {
        onStudentDeleted(student.id);
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.error || strings.messages.error;
      setError(typeof errorMessage === "string" ? errorMessage : strings.messages.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div
          className={`rounded-lg p-4 ${
            isDark
              ? "bg-red-900/20 border border-red-700 text-red-200"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex gap-4 items-start">
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
              isDark ? "bg-red-900/20" : "bg-red-100"
            }`}
          >
            <svg
              className={`w-6 h-6 ${isDark ? "text-red-400" : "text-red-600"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4v2m0 0v2m0-2V9m0 0h2m-2 0H9"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3
              className={`text-lg font-semibold mb-2 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {strings.messages.confirmDelete}
            </h3>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              {strings.messages.deleteWarning}
            </p>
          </div>
        </div>

        <div
          className={`rounded-lg p-4 space-y-2 border ${
            isDark
              ? "bg-gray-800/50 border-gray-700"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <div className="flex justify-between">
            <span className={isDark ? "text-gray-400" : "text-gray-600"}>
              {strings.table.headers.firstName}:
            </span>
            <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              {student.first_name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className={isDark ? "text-gray-400" : "text-gray-600"}>
              {strings.table.headers.lastName}:
            </span>
            <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              {student.last_name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className={isDark ? "text-gray-400" : "text-gray-600"}>
              {strings.table.headers.idNumber}:
            </span>
            <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              {student.id_number}
            </span>
          </div>
          <div className="flex justify-between">
            <span className={isDark ? "text-gray-400" : "text-gray-600"}>
              {strings.table.headers.email}:
            </span>
            <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              {student.email}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            isDark
              ? "bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-50"
              : "bg-gray-100 hover:bg-gray-200 text-gray-800 disabled:opacity-50"
          }`}
        >
          {strings.buttons.cancel}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
            loading
              ? isDark
                ? "bg-red-700/50 text-gray-400 cursor-not-allowed"
                : "bg-red-400/50 text-gray-600 cursor-not-allowed"
              : isDark
              ? "bg-red-600 hover:bg-red-500 text-white"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
        >
          {loading && <span className="animate-spin">⏳</span>}
          {loading ? strings.messages.deleting : strings.buttons.delete}
        </button>
      </div>
    </div>
  );
}
