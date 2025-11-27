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
  }, [slotId]);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError("");
      const slotRes = await axios.get("/api/instructor/get-user-slots");
      const slot = slotRes?.data?.slots?.find((s) => s.id === slotId);
      if (slot) {
        setAllowedOnly(slot.require_specific_email || false);
      }
    } catch (err) {
      console.error("Failed to fetch status:", err);
      setError(strings.messages.error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (toggling) return;

    setToggling(true);
    setError("");
    try {
      const res = await axios.patch(
        `/api/instructor/allowed-students-status/${slotId}/`
      );

      if (res?.data?.success) {
        // Update local state first for immediate UI feedback
        setAllowedOnly(!allowedOnly);
        // Then notify parent to refresh
        await onStatusUpdated();
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
        <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          <p className="mb-2">{strings.status.description}</p>
          <p className="font-semibold">
            Current Status:{" "}
            <span className={allowedOnly ? (isDark ? "text-amber-400" : "text-amber-600") : (isDark ? "text-emerald-400" : "text-emerald-600")}>
              {allowedOnly ? strings.status.allowedOnly : strings.status.allStudents}
            </span>
          </p>
        </div>

        {/* Current Status */}
        <div className="space-y-3">
          {/* Option 1: Allowed Students Only */}
          <div
            className={`rounded-lg p-4 border-2 transition-all ${
              toggling ? "cursor-wait opacity-50" : "cursor-pointer"
            } ${
              allowedOnly
                ? isDark
                  ? "border-amber-600 bg-amber-900/20"
                  : "border-amber-500 bg-amber-50"
                : isDark
                ? "border-gray-700 hover:border-gray-600"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => !toggling && !allowedOnly && handleToggleStatus()}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  allowedOnly
                    ? isDark
                      ? "border-amber-500 bg-amber-500"
                      : "border-amber-500 bg-amber-500"
                    : isDark
                    ? "border-gray-600"
                    : "border-gray-300"
                }`}
              >
                {allowedOnly && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p
                    className={`font-semibold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {strings.status.allowedOnly}
                  </p>
                  {allowedOnly && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? "bg-amber-700 text-amber-100" : "bg-amber-200 text-amber-800"}`}>
                      Active
                    </span>
                  )}
                </div>
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
            className={`rounded-lg p-4 border-2 transition-all ${
              toggling ? "cursor-wait opacity-50" : "cursor-pointer"
            } ${
              !allowedOnly
                ? isDark
                  ? "border-emerald-600 bg-emerald-900/20"
                  : "border-emerald-500 bg-emerald-50"
                : isDark
                ? "border-gray-700 hover:border-gray-600"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => !toggling && allowedOnly && handleToggleStatus()}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
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
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p
                    className={`font-semibold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {strings.status.allStudents}
                  </p>
                  {!allowedOnly && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? "bg-emerald-700 text-emerald-100" : "bg-emerald-200 text-emerald-800"}`}>
                      Active
                    </span>
                  )}
                </div>
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

        {toggling && (
          <div className={`text-center text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mx-auto mb-2"></div>
            Updating status...
          </div>
        )}
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
