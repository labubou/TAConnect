import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useTheme } from "../../contexts/ThemeContext";
import TAnavbar from "../../components/ta/TAnavbar";
import CreateCourse from "../../components/ta/mini-pages/CreateCourse";
import ViewCourses from "../../components/ta/mini-pages/ViewCourses";
import EditCourses from "../../components/ta/mini-pages/EditCourses";
import DeleteCourses from "../../components/ta/mini-pages/DeleteCourses";
import strings from "../../strings/manageCoursesPageStrings";

export default function ManageCourses() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const scrollContainerRef = useRef(null);
  const isScrollingRef = useRef(false);

  // Fetch TA slots
  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const res = await axios.get("/api/instructor/get-user-slots");
      setSlots(res?.data?.slots || []);
    } catch (err) {
      console.error("Failed to fetch slots:", err);
    } finally {
      setLoading(false);
    }
  };

  const pages = [
    { title: strings.pages.create, key: "create" },
    { title: strings.pages.view, key: "view" },
    { title: strings.pages.edit, key: "edit" },
    { title: strings.pages.delete, key: "delete" },
  ];

  const handlePageChange = (index) => {
    if (scrollContainerRef.current) {
      isScrollingRef.current = true;
      setCurrentPage(index);
      
      const scrollTop = index * window.innerHeight;
      scrollContainerRef.current.scrollTo({
        top: scrollTop,
        behavior: 'smooth',
        block: 'start'
      });

      setTimeout(() => {
        isScrollingRef.current = false;
      }, 600);
    }
  };

  const handleScroll = () => {
    if (isScrollingRef.current || !scrollContainerRef.current) return;

    const scrollTop = scrollContainerRef.current.scrollTop;
    const viewportHeight = scrollContainerRef.current.clientHeight;
    const newPageIndex = Math.round(scrollTop / viewportHeight);

    if (newPageIndex !== currentPage && newPageIndex < pages.length) {
      setCurrentPage(newPageIndex);
    }
  };

  const handleSlotCreated = (newSlot) => {
    setSlots((prev) => [...prev, newSlot]);
    handlePageChange(1); // Go to view page
  };

  const handleSlotDeleted = (id) => {
    setSlots((prev) => prev.filter((slot) => slot.id !== id));
  };

  const handleSlotUpdated = (updatedSlot) => {
    setSlots((prev) =>
      prev.map((slot) => (slot.id === updatedSlot.id ? updatedSlot : slot))
    );
  };

  const handleSelectSlot = (slot, pageKey) => {
    setSelectedSlot(slot);
    if (pageKey === "edit") {
      handlePageChange(2);
    } else if (pageKey === "delete") {
      handlePageChange(3);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <TAnavbar onToggle={setIsNavbarOpen} />

      <main
        className={`transition-all duration-300 ${
          isNavbarOpen ? "ml-64" : "ml-0"
        } pt-20`}
      >
        {/* Page Navigation Tabs */}
        <div
          className={`sticky top-20 z-40 mb-0 rounded-none shadow-md overflow-hidden ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex overflow-x-auto">
            {/* Create Course Button */}
            <button
              onClick={() => handlePageChange(0)}
              className={`flex-1 py-4 px-4 flex items-center justify-center gap-2 font-semibold transition-all duration-300 ${
                currentPage === 0
                  ? isDark
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-500 text-white"
                  : isDark
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-white text-gray-700 hover:bg-gray-100"
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
              <span>{pages[0].title}</span>
            </button>

            {/* View Courses Button */}
            <button
              onClick={() => handlePageChange(1)}
              className={`flex-1 py-4 px-4 flex items-center justify-center gap-2 font-semibold transition-all duration-300 ${
                currentPage === 1
                  ? isDark
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-500 text-white"
                  : isDark
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-white text-gray-700 hover:bg-gray-100"
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
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span>{pages[1].title}</span>
            </button>

            {/* Edit Courses Button */}
            <button
              onClick={() => handlePageChange(2)}
              className={`flex-1 py-4 px-4 flex items-center justify-center gap-2 font-semibold transition-all duration-300 ${
                currentPage === 2
                  ? isDark
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-500 text-white"
                  : isDark
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-white text-gray-700 hover:bg-gray-100"
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span>{pages[2].title}</span>
            </button>

            {/* Delete Courses Button */}
            <button
              onClick={() => handlePageChange(3)}
              className={`flex-1 py-4 px-4 flex items-center justify-center gap-2 font-semibold transition-all duration-300 ${
                currentPage === 3
                  ? isDark
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-500 text-white"
                  : isDark
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-white text-gray-700 hover:bg-gray-100"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span>{pages[3].title}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Mini-Pages Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth"
          style={{ scrollBehavior: 'smooth' }}
        >
          {/* Create Course Page */}
          <div className="h-screen w-full flex-shrink-0 snap-start p-6">
            <CreateCourse
              isDark={isDark}
              onSlotCreated={handleSlotCreated}
              slots={slots}
            />
          </div>

          {/* View Courses Page */}
          <div className="h-screen w-full flex-shrink-0 snap-start p-6">
            <ViewCourses
              isDark={isDark}
              slots={slots}
              loading={loading}
              onSelectSlot={handleSelectSlot}
              onRefresh={fetchSlots}
            />
          </div>

          {/* Edit Courses Page */}
          <div className="h-screen w-full flex-shrink-0 snap-start p-6">
            <EditCourses
              isDark={isDark}
              slots={slots}
              selectedSlot={selectedSlot}
              onSlotUpdated={handleSlotUpdated}
              onSelectSlot={(slot) => handleSelectSlot(slot, "edit")}
            />
          </div>

          {/* Delete Courses Page */}
          <div className="h-screen w-full flex-shrink-0 snap-start p-6">
            <DeleteCourses
              isDark={isDark}
              slots={slots}
              selectedSlot={selectedSlot}
              onSlotDeleted={handleSlotDeleted}
              onSelectSlot={(slot) => handleSelectSlot(slot, "delete")}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
