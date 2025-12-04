import { useState } from "react";
import axios from "axios";
import { useLanguage } from "../../../contexts/LanguageContext";
import allStrings from "../../../strings/allowedStudentsPageStrings";

export default function AddAllowedStudent({
  isDark,
  slotId,
  onStudentAdded,
  onClose,
}) {
  const { language } = useLanguage();
  const strings = allStrings[language] || allStrings.en;

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    id_number: "",
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = strings.forms.validation.required;
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = strings.forms.validation.required;
    }
    if (!formData.id_number.trim()) {
      newErrors.id_number = strings.forms.validation.required;
    }
    if (!formData.email.trim()) {
      newErrors.email = strings.forms.validation.required;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = strings.forms.validation.invalidEmail;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `/api/instructor/allowed-students/${slotId}/`,
        formData
      );

      if (res?.data?.success) {
        // Fetch the created student data
        const getRes = await axios.get(`/api/instructor/allowed-students/${slotId}/`);
        const newStudent = getRes?.data?.allowed_students?.find(
          (s) => s.email === formData.email
        );
        if (newStudent) {
          onStudentAdded(newStudent);
        }
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.error?.email?.[0] ||
        err?.response?.data?.error?.id_number?.[0] ||
        err?.response?.data?.error?.email ||
        err?.response?.data?.error?.id_number ||
        strings.messages.error;
      setErrors({
        submit: typeof errorMessage === "string" ? errorMessage : strings.messages.error,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div
          className={`rounded-lg p-4 ${
            isDark
              ? "bg-red-900/20 border border-red-700 text-red-200"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {errors.submit}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="first_name"
            className={`block text-sm font-semibold mb-2 ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {strings.forms.firstName}
          </label>
          <input
            id="first_name"
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            placeholder={strings.forms.placeholders.firstName}
            className={`w-full px-4 py-2 rounded-lg border transition-all ${
              errors.first_name
                ? isDark
                  ? "border-red-600 bg-red-900/10"
                  : "border-red-500 bg-red-50"
                : isDark
                ? "border-gray-700 bg-gray-800 text-white focus:border-emerald-500"
                : "border-gray-200 bg-white text-gray-900 focus:border-emerald-500"
            } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
          />
          {errors.first_name && (
            <p className={`text-sm mt-1 ${isDark ? "text-red-400" : "text-red-600"}`}>
              {errors.first_name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="last_name"
            className={`block text-sm font-semibold mb-2 ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {strings.forms.lastName}
          </label>
          <input
            id="last_name"
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            placeholder={strings.forms.placeholders.lastName}
            className={`w-full px-4 py-2 rounded-lg border transition-all ${
              errors.last_name
                ? isDark
                  ? "border-red-600 bg-red-900/10"
                  : "border-red-500 bg-red-50"
                : isDark
                ? "border-gray-700 bg-gray-800 text-white focus:border-emerald-500"
                : "border-gray-200 bg-white text-gray-900 focus:border-emerald-500"
            } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
          />
          {errors.last_name && (
            <p className={`text-sm mt-1 ${isDark ? "text-red-400" : "text-red-600"}`}>
              {errors.last_name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="id_number"
            className={`block text-sm font-semibold mb-2 ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {strings.forms.idNumber}
          </label>
          <input
            id="id_number"
            type="text"
            name="id_number"
            value={formData.id_number}
            onChange={handleInputChange}
            placeholder={strings.forms.placeholders.idNumber}
            className={`w-full px-4 py-2 rounded-lg border transition-all ${
              errors.id_number
                ? isDark
                  ? "border-red-600 bg-red-900/10"
                  : "border-red-500 bg-red-50"
                : isDark
                ? "border-gray-700 bg-gray-800 text-white focus:border-emerald-500"
                : "border-gray-200 bg-white text-gray-900 focus:border-emerald-500"
            } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
          />
          {errors.id_number && (
            <p className={`text-sm mt-1 ${isDark ? "text-red-400" : "text-red-600"}`}>
              {errors.id_number}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className={`block text-sm font-semibold mb-2 ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {strings.forms.email}
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder={strings.forms.placeholders.email}
            className={`w-full px-4 py-2 rounded-lg border transition-all ${
              errors.email
                ? isDark
                  ? "border-red-600 bg-red-900/10"
                  : "border-red-500 bg-red-50"
                : isDark
                ? "border-gray-700 bg-gray-800 text-white focus:border-emerald-500"
                : "border-gray-200 bg-white text-gray-900 focus:border-emerald-500"
            } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
          />
          {errors.email && (
            <p className={`text-sm mt-1 ${isDark ? "text-red-400" : "text-red-600"}`}>
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onClose}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            isDark
              ? "bg-gray-800 hover:bg-gray-700 text-white"
              : "bg-gray-100 hover:bg-gray-200 text-gray-800"
          }`}
        >
          {strings.buttons.cancel}
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
            loading
              ? isDark
                ? "bg-emerald-700/50 text-gray-400 cursor-not-allowed"
                : "bg-emerald-400/50 text-gray-600 cursor-not-allowed"
              : isDark
              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
              : "bg-emerald-500 hover:bg-emerald-600 text-white"
          }`}
        >
          {loading && <span className="animate-spin">⏳</span>}
          {loading ? strings.messages.adding : strings.buttons.save}
        </button>
      </div>
    </form>
  );
}
