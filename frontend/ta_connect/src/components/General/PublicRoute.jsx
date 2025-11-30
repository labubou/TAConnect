//The main purpose of this file is to redirect the authorized uses from this route automatically to there dashboard
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="flex items-center gap-2 text-gray-600">
          <div className="h-8 w-8 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Redirect based on user type
    if (user?.user_type === 'instructor') {
      return <Navigate to="/ta" replace />;
    } else if (user?.user_type === 'student') {
      return <Navigate to="/student" replace />;
    }
    // Fallback to landing page if user_type is not set
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
