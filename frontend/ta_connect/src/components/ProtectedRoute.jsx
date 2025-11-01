import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

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

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
