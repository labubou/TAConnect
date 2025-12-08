import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import allStrings from "../../../strings/manageCoursesPageStrings";

const getBaseUrl = () => {
  if (import.meta.env.MODE === 'production') {
    return 'https://taconnect.netlify.app';
  }
  return 'http://localhost:3000';
};

export default function ShareSlotModal({ isDark, slot, onClose }) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const strings = allStrings[language];
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyError, setCopyError] = useState("");

  // Get TA ID from user object
  const taId = user?.id;

  if (!taId) {
    return (
      <div className={`p-6 rounded-2xl ${isDark ? "bg-red-900/20 border-red-700" : "bg-red-50 border-red-200"} border`}>
        <p className={isDark ? "text-red-200" : "text-red-800"}>
          {strings.share?.errorNoTAId || "Error: Unable to determine TA ID"}
        </p>
      </div>
    );
  }

  const shareUrl = `${getBaseUrl()}/book/?ta_id=${taId}&slot_id=${slot.id}`;

  const handleCopyLink = async () => {
    setCopyError("");
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      setCopyError(strings.share?.copyError || "Failed to copy link. Please try again.");
      setTimeout(() => setCopyError(""), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Slot Information */}
      <div className={`p-4 rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
        <p className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"} font-medium uppercase tracking-wide mb-2`}>
          {strings.share?.slotInfo || "Slot Information"}
        </p>
        <h3 className={`text-lg sm:text-xl font-semibold ${isDark ? "text-white" : "text-gray-900"} mb-3`}>
          {slot.course_name} {slot.section && `(${slot.section})`}
        </h3>
        <div className={`text-sm space-y-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
          <p><span className="font-medium">{strings.view.day}:</span> {slot.day_of_week}</p>
          <p><span className="font-medium">{strings.view.time}:</span> {slot.start_time} - {slot.end_time}</p>
          <p><span className="font-medium">{strings.view.room}:</span> {slot.room}</p>
        </div>
      </div>

      {/* Share Link Section */}
      <div className="space-y-3">
        <label className={`block text-sm font-semibold ${isDark ? "text-gray-200" : "text-gray-700"}`}>
          {strings.share?.shareLink || "Share Link"}
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div
            className={`flex-1 px-4 py-3 rounded-lg border ${
              isDark
                ? "bg-gray-800 border-gray-700 text-white"
                : "bg-gray-50 border-gray-300 text-gray-900"
            } text-xs sm:text-sm break-all`}
          >
            {shareUrl}
          </div>
          <button
            onClick={handleCopyLink}
            className={`w-full sm:w-auto px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 whitespace-nowrap text-sm ${
              copySuccess
                ? isDark
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-500 text-white"
                : isDark
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
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
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            {copySuccess
              ? strings.share?.copiedToClipboard || "Copied!"
              : strings.share?.copyLink || "Copy Link"}
          </button>
        </div>

        {/* Copy Success Message */}
        {copySuccess && (
          <div
            className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
              isDark
                ? "bg-emerald-900/30 border border-emerald-700 text-emerald-300"
                : "bg-emerald-50 border border-emerald-200 text-emerald-800"
            }`}
          >
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p>{strings.share?.linkCopiedMessage || "Link copied to clipboard!"}</p>
          </div>
        )}

        {/* Copy Error Message */}
        {copyError && (
          <div
            className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
              isDark
                ? "bg-red-900/30 border border-red-700 text-red-300"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p>{copyError}</p>
          </div>
        )}
      </div>

      {/* Share Instructions */}
      <div className={`p-4 rounded-xl ${isDark ? "bg-gray-800/50" : "bg-blue-50"}`}>
        <p className={`text-sm font-semibold mb-2 ${isDark ? "text-blue-300" : "text-blue-900"}`}>
          {strings.share?.instructions || "How to share:"}
        </p>
        <ul className={`text-xs sm:text-sm space-y-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
          <li className="flex gap-2">
            <span className="font-semibold">1.</span>
            <span>{strings.share?.instruction1 || "Copy the link above"}</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">2.</span>
            <span>{strings.share?.instruction2 || "Share it with students via email, messaging, or any platform"}</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">3.</span>
            <span>{strings.share?.instruction3 || "Students can click the link to book this office hour slot"}</span>
          </li>
        </ul>
      </div>

      {/* Close Button */}
      <div className="flex gap-3 pt-4 border-t border-white/10">
        <button
          onClick={onClose}
          className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all text-sm ${
            isDark
              ? "bg-gray-800 hover:bg-gray-700 text-white"
              : "bg-gray-100 hover:bg-gray-200 text-gray-900"
          }`}
        >
          {strings.modals.close || "Close"}
        </button>
      </div>
    </div>
  );
}
