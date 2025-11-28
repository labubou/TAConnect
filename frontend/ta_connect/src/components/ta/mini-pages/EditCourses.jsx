import { useState, useEffect } from "react";
import axios from "axios";
import strings from "../../../strings/manageCoursesPageStrings";
import WarningModal from "../../WarningModal";

export default function EditCourses({ isDark, slot, onSlotUpdated, onClose }) {
  const [form, setForm] = useState({
    course_name: "",
    section: "",
    day_of_week: "Mon",
    start_time: "09:00",
    end_time: "10:00",
    duration_minutes: 10,
    start_date: "",
    end_date: "",
    room: "",
    set_student_limit: 1,
    csv_file: null,
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  useEffect(() => {
    if (slot) {
      setForm({
        course_name: slot.course_name || "",
        section: slot.section || "",
        day_of_week: slot.day_of_week || "Mon",
        start_time: slot.start_time || "09:00",
        end_time: slot.end_time || "10:00",
        duration_minutes: slot.duration_minutes || 10,
        start_date: slot.start_date || "",
        end_date: slot.end_date || "",
        room: slot.room || "",
        set_student_limit: slot.set_student_limit || 1,
        csv_file: null,
      });
      setError("");
      setMessage("");
    }
  }, [slot]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    setForm((prev) => ({ ...prev, csv_file: file || null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!slot) {
      setError(strings.edit.errors.noSlotSelected);
      return;
    }

    // Show warning modal instead of immediately submitting
    setShowWarningModal(true);
  };

  const handleConfirmEdit = async () => {
    if (!slot) {
      setError(strings.edit.errors.noSlotSelected);
      setShowWarningModal(false);
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);
    setShowWarningModal(false);

    try {
      if (!form.course_name.trim()) {
        setError(strings.edit.errors.courseNameRequired);
        setLoading(false);
        return;
      }
      if (!form.day_of_week) {
        setError(strings.edit.errors.dayRequired);
        setLoading(false);
        return;
      }
      if (!form.start_time) {
        setError(strings.edit.errors.startTimeRequired);
        setLoading(false);
        return;
      }
      if (!form.end_time) {
        setError(strings.edit.errors.endTimeRequired);
        setLoading(false);
        return;
      }
      if (!form.start_date) {
        setError(strings.edit.errors.startDateRequired);
        setLoading(false);
        return;
      }
      if (!form.end_date) {
        setError(strings.edit.errors.endDateRequired);
        setLoading(false);
        return;
      }
      if (!form.room.trim()) {
        setError(strings.edit.errors.roomRequired);
        setLoading(false);
        return;
      }

      const payloadObj = {
        course_name: form.course_name,
        section: form.section.trim() || " ",
        day_of_week: form.day_of_week,
        start_time: form.start_time,
        end_time: form.end_time,
        duration_minutes: form.duration_minutes,
        start_date: form.start_date,
        end_date: form.end_date,
        room: form.room,
        set_student_limit: form.set_student_limit,
      };

      let res;
      if (form.csv_file) {
        const formData = new FormData();
        Object.keys(payloadObj).forEach((k) => formData.append(k, payloadObj[k]));
        formData.append("file", form.csv_file);

        res = await axios.patch(
          `/api/instructor/time-slots/${slot.id}/`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        res = await axios.patch(
          `/api/instructor/time-slots/${slot.id}/`,
          payloadObj
        );
      }

      if (res?.data?.success) {
        setMessage(strings.edit.success);
        onSlotUpdated &&
          onSlotUpdated({
            ...slot,
            ...payloadObj,
          });
        if (onClose) {
          onClose();
        }
      } else {
        setError(res?.data?.error || strings.edit.errors.failed);
      }
    } catch (err) {
      console.error("Edit slot error:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          strings.edit.errors.failed
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
            {strings.edit.selectASlot}
          </h3>
          <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {strings.edit.selectDescription}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-6 rounded-lg ${
        isDark ? "bg-gray-800" : "bg-white"
      } shadow-lg`}
    >
      {showWarningModal && (
        <WarningModal
          isDark={isDark}
          title={strings.warningModal.editTitle}
          message={strings.warningModal.editMessage}
          warningText={strings.warningModal.editWarning}
          onConfirm={handleConfirmEdit}
          onCancel={() => setShowWarningModal(false)}
          confirmText={strings.warningModal.editConfirm}
          cancelText={strings.warningModal.editCancel}
          isLoading={loading}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            {strings.edit.title}
          </h2>
          <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {strings.edit.description}
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

      <div
        className={`mb-6 p-4 rounded-lg ${
          isDark ? "bg-gray-700 border border-gray-600" : "bg-blue-50 border border-blue-200"
        }`}
      >
        <p className={isDark ? "text-gray-200" : "text-blue-900"}>
          <span className="font-semibold">{strings.edit.editing}:</span> {slot.course_name}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              {strings.edit.fields.courseName}
            </label>
            <input
              type="text"
              name="course_name"
              value={form.course_name}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border transition-all ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white focus:border-emerald-500"
                  : "bg-white border-gray-300 text-gray-900 focus:border-emerald-500"
              } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              {strings.edit.fields.section}
            </label>
            <input
              type="text"
              name="section"
              value={form.section}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border transition-all ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white focus:border-emerald-500"
                : "bg-white border-gray-300 text-gray-900 focus:border-emerald-500"
              } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              {strings.edit.fields.dayOfWeek}
            </label>
            <select
              name="day_of_week"
              value={form.day_of_week}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border transition-all ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white focus:border-emerald-500"
                  : "bg-white border-gray-300 text-gray-900 focus:border-emerald-500"
              } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
            >
              {strings.edit.dayOptions.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              {strings.edit.fields.room}
            </label>
            <input
              type="text"
              name="room"
              value={form.room}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border transition-all ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white focus:border-emerald-500"
                  : "bg-white border-gray-300 text-gray-900 focus:border-emerald-500"
              } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              {strings.edit.fields.startTime}
            </label>
            <input
              type="time"
              name="start_time"
              value={form.start_time}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border transition-all ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white focus:border-emerald-500"
                  : "bg-white border-gray-300 text-gray-900 focus:border-emerald-500"
              } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              {strings.edit.fields.endTime}
            </label>
            <input
              type="time"
              name="end_time"
              value={form.end_time}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border transition-all ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white focus:border-emerald-500"
                  : "bg-white border-gray-300 text-gray-900 focus:border-emerald-500"
              } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              {strings.edit.fields.startDate}
            </label>
            <input
              type="date"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border transition-all ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white focus:border-emerald-500"
                  : "bg-white border-gray-300 text-gray-900 focus:border-emerald-500"
              } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              {strings.edit.fields.endDate}
            </label>
            <input
              type="date"
              name="end_date"
              value={form.end_date}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border transition-all ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white focus:border-emerald-500"
                  : "bg-white border-gray-300 text-gray-900 focus:border-emerald-500"
              } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              {strings.edit.fields.duration}
            </label>
            <input
              type="number"
              name="duration_minutes"
              value={form.duration_minutes}
              onChange={handleChange}
              placeholder={strings.edit.placeholders.duration}
              min="1"
              className={`w-full px-4 py-2 rounded-lg border transition-all ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-emerald-500"
              } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              {strings.edit.fields.studentLimit}
            </label>
            <input
              type="number"
              name="set_student_limit"
              value={form.set_student_limit}
              onChange={handleChange}
              min="1"
              placeholder={strings.edit.placeholders.studentLimit}
              className={`w-full px-4 py-2 rounded-lg border transition-all ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white focus:border-emerald-500"
                  : "bg-white border-gray-300 text-gray-900 focus:border-emerald-500"
              } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
            />
            <p className={`text-xs mt-1 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}>
              {strings.edit.hints.studentLimit}
            </p>
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Import CSV (optional)
            </label>
            <input
              type="file"
              accept=".csv"
              name="csv"
              onChange={handleFileChange}
              className={`w-full text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
            />
            <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              CSV import is optional. Uploaded file will be sent to the backend.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "hover:shadow-lg hover:scale-105"
            } ${
              isDark
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-emerald-500 hover:bg-emerald-600 text-white"
            }`}
          >
            {loading ? strings.edit.buttons.updating : strings.edit.buttons.update}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                isDark
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-900"
              }`}
            >
              {strings.modals.close}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
