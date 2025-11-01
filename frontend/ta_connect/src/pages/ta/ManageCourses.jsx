import { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "../../contexts/ThemeContext";
import TAnavbar from "../../components/ta/TAnavbar";
import CourseList from "../../components/ta/CourseList";
import strings from "../../strings/manageCoursesPageStrings";


export default function ManageCourses() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch TA slots
  useEffect(() => {
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

    fetchSlots();
  }, []);

  const handleDeleted = (id) => {
    setSlots((prev) => prev.filter((slot) => slot.id !== id));
  };

  const handleToggled = (id, newStatus) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === id ? { ...slot, status: newStatus } : slot
      )
    );
  };

  const handleEdit = () => {
    alert("Edit is only available on the Create Course page for now.");
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <TAnavbar onToggle={setIsNavbarOpen} />

      <main
        className={`transition-all duration-300 ${
          isNavbarOpen ? "ml-64" : "ml-0"
        } pt-20 p-6`}
      >
        <div
          className={`max-w-4xl mx-auto p-6 rounded-xl shadow-lg ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
        <h2 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>{strings.title}</h2>
        <p className={`${isDark ? "text-gray-300" : "text-gray-600"} mb-6`}>{strings.description}</p>

        {loading ? (
            <div className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>
                {strings.loading}
            </div>
            ) : (
            <CourseList
                slots={slots}
                onEdit={handleEdit}
                onDeleted={handleDeleted}
                onToggled={handleToggled}
            />
        )}

        </div>
      </main>
    </div>
  );
}
