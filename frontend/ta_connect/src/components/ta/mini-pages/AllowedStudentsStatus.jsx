import { useState, useEffect } from "react";
import axios from "axios";
import strings from "../../../strings/allowedStudentsPageStrings";

export default function AllowedStudentsStatus({
  isDark,
  slotId,
  onStatusUpdated,
  onClose,
}) {
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [allowedOnly, setAllowedOnly] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/instructor/allowed-students/${slotId}/`);
      // The status is determined by the policy's require_specific_email field
      // We need to get the slot data to see if require_specific_email is true
      const slotRes = await axios.get("/api/instructor/get-user-slots");
      const slot = slotRes?.data?.slots?.find((s) => s.id === slotId);
      if (slot && slot.policy) {
        setAllowedOnly(slot.policy.require_specific_email || false);
      }
    } catch (err) {
      console.error("Failed to fetch status:", err);
      setError(strings.messages.error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    setToggling(true);
    try {
      const res = await axios.patch(
        `/api/instructor/allowed-students-status/${slotId}/`
      );

      if (res?.data?.success) {
        setAllowedOnly(!allowedOnly);
        onStatusUpdated();
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.error || strings.messages.error;
      setError(typeof errorMessage === "string" ? errorMessage : strings.messages.error);
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className={isDark ? "text-gray-300" : "text-gray-600"}>
              {strings.messages.loading}
            </p>
          </div>
        </div>
      </div>
    );
  }

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
        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          {strings.status.description}
        </p>

        {/* Current Status */}
        <div
          className={`rounded-lg p-6 border ${
            isDark
              ? "bg-gray-800/50 border-gray-700"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <p
            className={`text-sm font-semibold mb-4 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {strings.status.currentStatus}
          </p>

          <div className="space-y-3">
            {/* Option 1: Allowed Students Only */}
            <div
              className={`rounded-lg p-4 border-2 transition-all cursor-pointer ${
                allowedOnly
                  ? isDark
                    ? "border-emerald-600 bg-emerald-900/20"
                    : "border-emerald-500 bg-emerald-50"
                  : isDark
                  ? "border-gray-700 hover:border-gray-600"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={allowedOnly ? null : handleToggleStatus}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    allowedOnly
                      ? isDark
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-emerald-500 bg-emerald-500"
                      : isDark
                      ? "border-gray-600"
                      : "border-gray-300"
                  }`}
                >
                  {allowedOnly && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-semibold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {strings.status.allowedOnly}
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {strings.status.allowedOnlyDesc}
                  </p>
                </div>
              </div>
            </div>

            {/* Option 2: All Students Allowed */}
            <div
              className={`rounded-lg p-4 border-2 transition-all cursor-pointer ${
                !allowedOnly
                  ? isDark
                    ? "border-emerald-600 bg-emerald-900/20"
                    : "border-emerald-500 bg-emerald-50"
                  : isDark
                  ? "border-gray-700 hover:border-gray-600"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={allowedOnly ? handleToggleStatus : null}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    !allowedOnly
                      ? isDark
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-emerald-500 bg-emerald-500"
                      : isDark
                      ? "border-gray-600"
                      : "border-gray-300"
                  }`}
                >
                  {!allowedOnly && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-semibold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {strings.status.allStudents}
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {strings.status.allStudentsDesc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={toggling}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            isDark
              ? "bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-50"
              : "bg-gray-100 hover:bg-gray-200 text-gray-800 disabled:opacity-50"
          }`}
        >
          {strings.buttons.close}
        </button>
      </div>
    </div>
  );
}
