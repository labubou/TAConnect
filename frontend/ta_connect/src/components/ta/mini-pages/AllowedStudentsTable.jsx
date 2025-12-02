import { useState, useMemo } from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import allStrings from "../../../strings/allowedStudentsPageStrings";

export default function AllowedStudentsTable({
  isDark,
  allowedStudents,
  loading,
  onRefresh,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  selectedSlot,
}) {
  const { language } = useLanguage();
  const strings = allStrings[language] || allStrings.en;
  const [sortBy, setSortBy] = useState("email");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return [...allowedStudents]
      .filter((student) => {
        const matchesSearch =
          student.first_name.toLowerCase().includes(lowerSearch) ||
          student.last_name.toLowerCase().includes(lowerSearch) ||
          student.email.toLowerCase().includes(lowerSearch) ||
          student.id_number.toLowerCase().includes(lowerSearch);
        return matchesSearch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "email":
            return a.email.localeCompare(b.email);
          case "first_name":
            return a.first_name.localeCompare(b.first_name);
          case "id_number":
            return a.id_number.localeCompare(b.id_number);
          default:
            return 0;
        }
      });
  }, [allowedStudents, searchTerm, sortBy]);

  if (loading) {
    return (
      <div
        className={`p-6 rounded-lg ${isDark ? "bg-gray-800" : "bg-white"} shadow-lg h-full flex items-center justify-center`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            {strings.messages.loading}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-0 sm:p-6 rounded-lg ${isDark ? "bg-transparent" : "bg-transparent"} h-full`}
    >
      <div
        className={`rounded-2xl ${isDark ? "bg-gray-900/60" : "bg-white"} shadow-lg border ${isDark ? "border-gray-800" : "border-gray-100"}`}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2
                className={`text-2xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {strings.table.title}
              </h2>
              <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                {allowedStudents.length} {strings.table.studentsFound}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onRefresh}
                className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  isDark
                    ? "bg-gray-800 hover:bg-gray-700 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-800"
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {strings.buttons.refresh}
              </button>
              <button
                onClick={onAddStudent}
                className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  isDark
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                {strings.buttons.add}
              </button>
            </div>
          </div>
        </div>

        {/* Search and Sort Controls */}
        <div className="px-6 py-4 border-b border-white/10 space-y-4 md:flex md:gap-4 md:space-y-0">
          <div className="flex-1">
            <input
              type="text"
              placeholder={strings.search.placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border transition-all ${
                isDark
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500"
                  : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500"
              } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
            />
          </div>
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                isDark
                  ? "bg-gray-800 border-gray-700 text-white focus:border-emerald-500"
                  : "bg-white border-gray-200 text-gray-900 focus:border-emerald-500"
              } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
            >
              <option value="email">{strings.sort.byEmail}</option>
              <option value="first_name">{strings.sort.byName}</option>
              <option value="id_number">{strings.sort.byId}</option>
            </select>
          </div>
        </div>

        {/* Table or Empty State */}
        {filteredStudents.length === 0 ? (
          <div
            className={`p-12 text-center ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            <svg
              className="w-16 h-16 mx-auto mb-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 7a4 4 0 11-8 0 4 4 0 018 0zM6 21h12a2 2 0 002-2V9a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <p className="text-lg font-medium">{strings.table.empty}</p>
            <p className="text-sm mt-2">{strings.table.noResults}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className={`border-b ${
                      isDark ? "border-gray-800" : "border-gray-200"
                    }`}
                  >
                    <th
                      className={`px-6 py-3 text-left text-sm font-semibold ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {strings.table.headers.firstName}
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-sm font-semibold ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {strings.table.headers.lastName}
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-sm font-semibold ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {strings.table.headers.idNumber}
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-sm font-semibold ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {strings.table.headers.email}
                    </th>
                    <th
                      className={`px-6 py-3 text-right text-sm font-semibold ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {strings.table.headers.actions}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, index) => (
                    <tr
                      key={student.id}
                      className={`border-b transition-all ${
                        isDark
                          ? "border-gray-800 hover:bg-gray-800/50"
                          : "border-gray-100 hover:bg-gray-50"
                      }`}
                    >
                      <td className={`px-6 py-4 text-sm ${isDark ? "text-gray-200" : "text-gray-900"}`}>
                        {student.first_name}
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? "text-gray-200" : "text-gray-900"}`}>
                        {student.last_name}
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? "text-gray-200" : "text-gray-900"}`}>
                        {student.id_number}
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                        {student.email}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => onEditStudent(student)}
                            className={`p-2 rounded-lg transition-all ${
                              isDark
                                ? "hover:bg-blue-900/30 text-blue-400"
                                : "hover:bg-blue-100 text-blue-600"
                            }`}
                            title={strings.buttons.edit}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => onDeleteStudent(student)}
                            className={`p-2 rounded-lg transition-all ${
                              isDark
                                ? "hover:bg-red-900/30 text-red-400"
                                : "hover:bg-red-100 text-red-600"
                            }`}
                            title={strings.buttons.delete}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 p-6">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className={`rounded-lg p-4 border ${
                    isDark
                      ? "bg-gray-800/50 border-gray-700"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                          Name
                        </p>
                        <p className={`text-base font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                          {student.first_name} {student.last_name}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEditStudent(student)}
                          className={`p-2 rounded-lg transition-all ${
                            isDark
                              ? "hover:bg-blue-900/30 text-blue-400"
                              : "hover:bg-blue-100 text-blue-600"
                          }`}
                          title={strings.buttons.edit}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDeleteStudent(student)}
                          className={`p-2 rounded-lg transition-all ${
                            isDark
                              ? "hover:bg-red-900/30 text-red-400"
                              : "hover:bg-red-100 text-red-600"
                          }`}
                          title={strings.buttons.delete}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className={`text-xs font-semibold ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          ID Number
                        </p>
                        <p className={isDark ? "text-gray-200" : "text-gray-800"}>
                          {student.id_number}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs font-semibold ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          Email
                        </p>
                        <p className={`${isDark ? "text-gray-300" : "text-gray-700"} truncate`}>
                          {student.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
