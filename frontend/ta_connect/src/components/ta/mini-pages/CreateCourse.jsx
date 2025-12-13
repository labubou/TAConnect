import { useState, useRef } from "react";
import axios from "axios";
import { useLanguage } from "../../../contexts/LanguageContext";
import allStrings from "../../../strings/manageCoursesPageStrings";

export default function CreateCourse({ isDark, onSlotCreated, slots, onClose }) {
  const { language } = useLanguage();
  const strings = allStrings[language];
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
  const [csvStatus, setCsvStatus] = useState(null); // { success: bool, created: number, errors: array }
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const dragCounterRef = useRef(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file && file.name.endsWith('.csv')) {
      setForm((prev) => ({ ...prev, csv_file: file }));
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      setForm((prev) => ({ ...prev, csv_file: file }));
    }
  };

  const removeFile = () => {
    setForm((prev) => ({ ...prev, csv_file: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadCsvFile = async (slotId) => {
    if (!form.csv_file) return null;
    
    try {
      const formData = new FormData();
      formData.append("file", form.csv_file);
      
      const res = await axios.post(`/api/instructor/upload-csv/${slotId}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      // Backend returns: { message, created_users: [], errors: [] }
      const createdCount = res.data.created_users?.length || 0;
      const errors = res.data.errors || [];
      
      return {
        success: true,
        created: createdCount,
        errors: errors,
        message: res.data.message,
      };
    } catch (err) {
      console.error("CSV upload error:", err);
      // Extract error message from backend response
      let errorMessage = strings.create.csv.uploadError;
      if (err.response?.data) {
        if (typeof err.response.data.error === 'string') {
          errorMessage = err.response.data.error;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        }
      }
      return {
        success: false,
        created: 0,
        errors: [{ message: errorMessage }],
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setCsvStatus(null);
    setLoading(true);

    try {
      // Validate required fields
      if (!form.course_name.trim()) {
        setError(strings.create.errors.courseNameRequired);
        setLoading(false);
        return;
      }
      if (!form.day_of_week) {
        setError(strings.create.errors.dayRequired);
        setLoading(false);
        return;
      }
      if (!form.start_time) {
        setError(strings.create.errors.startTimeRequired);
        setLoading(false);
        return;
      }
      if (!form.end_time) {
        setError(strings.create.errors.endTimeRequired);
        setLoading(false);
        return;
      }
      if (!form.start_date) {
        setError(strings.create.errors.startDateRequired);
        setLoading(false);
        return;
      }
      if (!form.end_date) {
        setError(strings.create.errors.endDateRequired);
        setLoading(false);
        return;
      }
      if (!form.room.trim()) {
        setError(strings.create.errors.roomRequired);
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

      // Create the slot first (without CSV)
      const res = await axios.post("/api/instructor/time-slots/", payloadObj);

      if (res?.data?.success && res?.data?.time_slot_id) {
        const slotId = res.data.time_slot_id;
        
        // Upload CSV if provided
        let csvResult = null;
        if (form.csv_file) {
          csvResult = await uploadCsvFile(slotId);
          setCsvStatus(csvResult);
        }

        setMessage(strings.create.success);
        onSlotCreated &&
          onSlotCreated({
            ...payloadObj,
            time_slot_id: slotId,
            id: slotId,
            status: true,
            csvResult: csvResult, // Pass CSV result to parent
          });
        setForm({
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
        
        // Always close modal - parent will handle showing CSV results
        if (onClose) {
          onClose();
        }
      } else {
        setError(res?.data?.error || strings.create.errors.failed);
      }
    } catch (err) {
      console.error("Create slot error:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          strings.create.errors.failed
      );
    } finally {
      setLoading(false);
    }
  };

  const containerClasses = `p-4 sm:p-6 rounded-lg max-h-[90vh] overflow-y-auto ${isDark ? "bg-gray-800" : "bg-white"} shadow-lg`;

  return (
    <div className={containerClasses}>
      <p
        className={`mb-6 text-sm sm:text-base ${isDark ? "text-gray-300" : "text-gray-600"}`}
      >
        {strings.create.description}
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
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{message}</span>
          </div>
        </div>
      )}

      {/* CSV Upload Status */}
      {csvStatus && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            csvStatus.success
              ? isDark
                ? "bg-blue-900/30 border border-blue-700 text-blue-300"
                : "bg-blue-100 border border-blue-400 text-blue-700"
              : isDark
                ? "bg-yellow-900/30 border border-yellow-700 text-yellow-300"
                : "bg-yellow-100 border border-yellow-400 text-yellow-700"
          }`}
        >
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium">
                {csvStatus.success ? strings.create.csv.uploadSuccess : strings.create.csv.uploadError}
              </p>
              {csvStatus.created > 0 && (
                <p className="text-sm mt-1">{csvStatus.created} {strings.create.csv.studentsCreated}</p>
              )}
              {csvStatus.errors.length > 0 && (
                <div className="text-sm mt-1">
                  <p>{csvStatus.errors.length} {strings.create.csv.errors}:</p>
                  <ul className="list-disc list-inside mt-1 max-h-24 overflow-y-auto">
                    {csvStatus.errors.slice(0, 5).map((err, idx) => (
                      <li key={idx} className="truncate">{err}</li>
                    ))}
                    {csvStatus.errors.length > 5 && (
                      <li>...and {csvStatus.errors.length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Course Name */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              {strings.create.fields.courseName}
            </label>
            <input type="text" name="course_name" value={form.course_name} onChange={handleChange} placeholder={strings.create.placeholders.courseName} className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-emerald-500"} focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
          </div>

          {/* Section */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              {strings.create.fields.section}
            </label>
            <input type="text" name="section" value={form.section} onChange={handleChange} placeholder={strings.create.placeholders.section} className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-emerald-500"} focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
          </div>

          {/* Day of Week */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              {strings.create.fields.dayOfWeek}
            </label>
            <select name="day_of_week" value={form.day_of_week} onChange={handleChange} className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? "bg-gray-700 border-gray-600 text-white focus:border-emerald-500" : "bg-white border-gray-300 text-gray-900 focus:border-emerald-500"} focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}>
              {strings.create.dayOptions.map((day) => (<option key={day} value={day}>{day}</option>))}
            </select>
          </div>

          {/* Room */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              {strings.create.fields.room}
            </label>
            <input type="text" name="room" value={form.room} onChange={handleChange} placeholder={strings.create.placeholders.room} className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-emerald-500"} focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
          </div>

          {/* Start Time */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              {strings.create.fields.startTime}
            </label>
            <input type="time" name="start_time" value={form.start_time} onChange={handleChange} className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? "bg-gray-700 border-gray-600 text-white focus:border-emerald-500" : "bg-white border-gray-300 text-gray-900 focus:border-emerald-500"} focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
          </div>

          {/* End Time */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              {strings.create.fields.endTime}
            </label>
            <input type="time" name="end_time" value={form.end_time} onChange={handleChange} className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? "bg-gray-700 border-gray-600 text-white focus:border-emerald-500" : "bg-white border-gray-300 text-gray-900 focus:border-emerald-500"} focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
          </div>

          {/* Start Date */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              {strings.create.fields.startDate}
            </label>
            <input type="date" name="start_date" value={form.start_date} onChange={handleChange} className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? "bg-gray-700 border-gray-600 text-white focus:border-emerald-500" : "bg-white border-gray-300 text-gray-900 focus:border-emerald-500"} focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
          </div>

          {/* End Date */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              {strings.create.fields.endDate}
            </label>
            <input type="date" name="end_date" value={form.end_date} onChange={handleChange} className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? "bg-gray-700 border-gray-600 text-white focus:border-emerald-500" : "bg-white border-gray-300 text-gray-900 focus:border-emerald-500"} focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
          </div>

          {/* Duration */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              {strings.create.fields.duration}
            </label>
            <input type="number" name="duration_minutes" value={form.duration_minutes} onChange={handleChange} placeholder={strings.create.placeholders.duration} min="1" className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-emerald-500"} focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
          </div>

          {/* Student Limit */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              {strings.create.fields.studentLimit}
            </label>
            <input type="number" name="set_student_limit" value={form.set_student_limit} onChange={handleChange} min="1" placeholder={strings.create.placeholders.studentLimit} className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-emerald-500"} focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
            <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              {strings.create.hints.studentLimit}
            </p>
          </div>
        </div>

        {/* CSV Import Section - Full Width */}
        <div className="col-span-full mt-6">
          <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
            {strings.create.csv.label}
            <span className={`ml-2 text-xs font-normal ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              ({strings.create.csv.optional})
            </span>
          </label>
          
          {!form.csv_file ? (
            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer rounded-xl border-2 border-dashed p-6 transition-all ${
                isDragging
                  ? isDark
                    ? "border-emerald-500 bg-emerald-900/20"
                    : "border-emerald-500 bg-emerald-50"
                  : isDark
                    ? "border-gray-600 hover:border-gray-500 bg-gray-700/50 hover:bg-gray-700"
                    : "border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center text-center">
                <svg
                  className={`w-10 h-10 mb-3 ${
                    isDragging
                      ? "text-emerald-500"
                      : isDark
                        ? "text-gray-400"
                        : "text-gray-500"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className={`text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                  {strings.create.csv.dragDrop}
                </p>
                <p className={`text-xs mt-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  {strings.create.csv.hint}
                </p>
              </div>
            </div>
          ) : (
            <div
              className={`rounded-xl border p-4 ${
                isDark
                  ? "border-emerald-700 bg-emerald-900/20"
                  : "border-emerald-200 bg-emerald-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      isDark ? "bg-emerald-800" : "bg-emerald-100"
                    }`}
                  >
                    <svg
                      className={`w-6 h-6 ${
                        isDark ? "text-emerald-300" : "text-emerald-600"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? "text-emerald-200" : "text-emerald-800"}`}>
                      {strings.create.csv.selectedFile}
                    </p>
                    <p className={`text-sm ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>
                      {form.csv_file.name}
                    </p>
                    <p className={`text-xs ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                      {(form.csv_file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className={`p-2 rounded-lg transition-all ${
                    isDark
                      ? "hover:bg-red-900/30 text-red-400 hover:text-red-300"
                      : "hover:bg-red-100 text-red-500 hover:text-red-600"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          )}
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
            {loading ? strings.create.buttons.creating : strings.create.buttons.create}
          </button>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={`w-full mt-4 py-3 px-4 rounded-lg font-semibold transition-all ${
              isDark
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-900"
            }`}
          >
            {strings.modals.close}
          </button>
        )}
      </form>
    </div>
  );
}
