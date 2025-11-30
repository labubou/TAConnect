import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Redirect component for handling public booking links
 * If user is not authenticated and has query params (ta_id, slot_id),
 * redirect to public booking page
 */
const PublicBookingRedirect = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const searchParams = new URLSearchParams(location.search);
      const hasBookingParams = searchParams.has('ta_id') || searchParams.has('instructor');
      
      // If not authenticated and has booking params, redirect to public booking page
      if (hasBookingParams) {
        navigate(`/book${location.search}`, { replace: true });
      }
    }
  }, [isAuthenticated, loading, location.search, navigate]);

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

  return <>{children}</>;
};

export default PublicBookingRedirect;
