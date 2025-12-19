/**
 * StudentRoute - Protected route component for Student-only pages
 * 
 * This component ensures that:
 * 1. User is authenticated
 * 2. User has the 'student' user_type
 * 
 * If not authenticated, redirects to login
 * If authenticated but not a student, redirects to appropriate dashboard
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const StudentRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <div className="h-8 w-8 rounded-full border-2 border-gray-300 border-t-[#366c6b] dark:border-gray-600 dark:border-t-[#4ade80] animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated but not a student - redirect to appropriate page
  if (user?.user_type !== 'student') {
    if (user?.user_type === 'instructor') {
      return <Navigate to="/ta" replace />;
    }
    // Fallback for unknown user types
    return <Navigate to="/" replace />;
  }

  // User is authenticated and is a student
  return <>{children}</>;
};

export default StudentRoute;
