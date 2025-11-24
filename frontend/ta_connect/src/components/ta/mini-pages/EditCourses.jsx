import { useState, useEffect } from "react";
import axios from "axios";
import strings from "../../../strings/manageCoursesPageStrings";

export default function EditCourses({
  isDark,
  slots,
  selectedSlot,
  onSlotUpdated,
  onSelectSlot,
}) {
  const [form, setForm] = useState({
    course_name: "",
    section: "",
    day_of_week: "Mon",
    start_time: "09:00",
    end_time: "10:00",
    start_date: "",
    end_date: "",
    room: "",
    set_student_limit: 1,
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedSlot) {
      setForm({
        course_name: selectedSlot.course_name || "",
        section: selectedSlot.section || "",
        day_of_week: selectedSlot.day_of_week || "Mon",
        start_time: selectedSlot.start_time || "09:00",
        end_time: selectedSlot.end_time || "10:00",
        start_date: selectedSlot.start_date || "",
        end_date: selectedSlot.end_date || "",
        room: selectedSlot.room || "",
        set_student_limit: selectedSlot.set_student_limit || 1,
      });
      setError("");
      setMessage("");
    }
  }, [selectedSlot]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError(strings.edit.errors.noSlotSelected);
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      // Validate required fields
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

      const payload = {
        ...form,
        section: form.section.trim() || " ",
      };

      const res = await axios.patch(
        `/api/instructor/time-slots/${selectedSlot.id}/`,
        payload
      );

      if (res?.data?.success) {
        setMessage(strings.edit.success);
        onSlotUpdated &&
          onSlotUpdated({
            ...selectedSlot,
            ...payload,
          });
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

  if (!selectedSlot) {
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
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
            {strings.edit.selectASlot}
          </h3>
          <p className={`${isDark ? "text-gray-400" : "text-gray-500"} mb-6`}>
            {strings.edit.selectDescription}
          </p>
          {slots.length > 0 && (
            <div className="space-y-2">
              <p className={`text-sm font-medium mb-3 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                {strings.edit.availableSlots}
              </p>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {slots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => onSelectSlot(slot)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      isDark
                        ? "bg-gray-700 hover:bg-emerald-700 text-gray-200"
                        : "bg-gray-100 hover:bg-emerald-100 text-gray-900"
                    }`}
                  >
                    <p className="font-medium">{slot.course_name}</p>
                    <p className="text-sm">
                      {slot.day_of_week} • {slot.start_time} - {slot.end_time}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-6 rounded-lg ${
        isDark ? "bg-gray-800" : "bg-white"
      } shadow-lg h-full overflow-y-auto`}
    >
      <div className="flex items-center justify-between mb-2">
        <h2
          className={`text-2xl font-bold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {strings.edit.title}
        </h2>
        <button
          onClick={() => onSelectSlot(null)}
          className={`p-2 rounded-lg transition-all ${
            isDark
              ? "bg-gray-700 hover:bg-gray-600 text-white"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
          title={strings.edit.deselectSlot}
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
      <p className={`mb-6 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
        {strings.edit.description}
      </p>

      {error && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            isDark
              ? "bg-red-900/30 border border-red-700 text-red-300"
              : "bg-red-100 border border-red-400 text-red-700"
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
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            isDark
              ? "bg-green-900/30 border border-green-700 text-green-300"
              : "bg-green-100 border border-green-400 text-green-700"
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
          <span className="font-semibold">{strings.edit.editing}:</span> {selectedSlot.course_name}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Course Name */}
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

          {/* Section */}
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

          {/* Day of Week */}
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

          {/* Room */}
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

          {/* Start Time */}
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

          {/* End Time */}
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

          {/* Start Date */}
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

          {/* End Date */}
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

          {/* Student Limit */}
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
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-6">
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
        </div>
      </form>
    </div>
  );
}
