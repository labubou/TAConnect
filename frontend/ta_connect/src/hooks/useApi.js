import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

/**
 * Hook to fetch slots for instructor
 * Caches slots data and supports refetching
 */
export const useInstructorSlots = (options = {}) => {
  return useQuery({
    queryKey: ['instructor', 'slots'],
    queryFn: async () => {
      const res = await axios.get('/api/instructor/get-user-slots');
      return res?.data?.slots || [];
    },
    ...options,
  });
};

/**
 * Hook to fetch bookings for instructor
 * Caches bookings with separate query key
 */
export const useInstructorBookings = (options = {}) => {
  return useQuery({
    queryKey: ['instructor', 'bookings'],
    queryFn: async () => {
      const res = await axios.get('/api/instructor/get-user-bookings');
      return res?.data?.bookings || [];
    },
    ...options,
  });
};

/**
 * Hook for analytics data
 * Supports date range filtering
 */
export const useAnalyticsData = (startDate = null, endDate = null, options = {}) => {
  return useQuery({
    queryKey: ['analytics', startDate, endDate],
    queryFn: async () => {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const [bookingsRes, slotsRes] = await Promise.all([
        axios.get('/api/instructor/get-user-bookings', { params }),
        axios.get('/api/instructor/get-user-slots'),
      ]);

      return {
        bookings: bookingsRes?.data?.bookings || [],
        slots: slotsRes?.data?.slots || [],
      };
    },
    ...options,
  });
};

/**
 * Hook to search instructors
 * Debounced to avoid excessive API calls
 */
export const useSearchInstructors = (searchQuery, options = {}) => {
  return useQuery({
    queryKey: ['instructors', 'search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const response = await axios.get('/api/instructor/search-instructors/', {
        params: { query: searchQuery },
      });
      return (response.data.instructors || []).map(instructor => {
        const nameParts = (instructor.full_name || '').split(' ');
        return {
          ...instructor,
          first_name: nameParts[0] || '',
          last_name: nameParts.slice(1).join(' ') || '',
        };
      });
    },
    enabled: searchQuery.trim().length >= 2,
    staleTime: 10 * 60 * 1000, // Cache search results for 10 minutes
    ...options,
  });
};

/**
 * Hook to fetch available slots for a specific instructor
 */
export const useInstructorAvailableSlots = (instructorId, options = {}) => {
  return useQuery({
    queryKey: ['instructor', 'available-slots', instructorId],
    queryFn: async () => {
      const response = await axios.get(`/api/instructor/${instructorId}/available-slots/`);
      return response?.data?.slots || [];
    },
    enabled: !!instructorId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

/**
 * Hook to prefetch instructor slots
 * Use before navigating to pages that need slots data
 */
export const usePrefetchInstructorSlots = (queryClient) => {
  return () => {
    queryClient.prefetchQuery({
      queryKey: ['instructor', 'slots'],
      queryFn: async () => {
        const res = await axios.get('/api/instructor/get-user-slots');
        return res?.data?.slots || [];
      },
    });
  };
};

/**
 * Hook to create/update a booking
 * Invalidates relevant caches on success
 */
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingData) => {
      const response = await axios.post('/api/student/book-slot/', bookingData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate student bookings cache
      queryClient.invalidateQueries({ queryKey: ['student', 'bookings'] });
      // Invalidate instructor bookings cache if relevant
      queryClient.invalidateQueries({ queryKey: ['instructor', 'bookings'] });
    },
  });
};

/**
 * Hook to create an instructor slot
 * Invalidates slots cache on success
 */
export const useCreateInstructorSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slotData) => {
      const response = await axios.post('/api/instructor/create-slot/', slotData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'slots'] });
    },
  });
};

/**
 * Hook to update an instructor slot
 * Invalidates slots cache on success
 */
export const useUpdateInstructorSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slotId, data }) => {
      const response = await axios.patch(`/api/instructor/update-slot/${slotId}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'slots'] });
    },
  });
};

/**
 * Hook to delete an instructor slot
 * Invalidates slots cache on success
 */
export const useDeleteInstructorSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slotId) => {
      await axios.delete(`/api/instructor/delete-slot/${slotId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'slots'] });
    },
  });
};

/**
 * Hook to fetch user profile
 */
export const useUserProfile = (options = {}) => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const response = await axios.get('/api/user-data/');
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
};

/**
 * Hook to update user profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData) => {
      const response = await axios.patch('/api/update-profile/', profileData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
};

/**
 * Hook to fetch student bookings
 */
export const useStudentBookings = (options = {}) => {
  return useQuery({
    queryKey: ['student', 'bookings'],
    queryFn: async () => {
      const response = await axios.get('/api/student/my-bookings/');
      return response?.data?.bookings || [];
    },
    ...options,
  });
};

/**
 * Hook to fetch email notification preferences
 */
export const useEmailPreferences = (options = {}) => {
  return useQuery({
    queryKey: ['emailPreferences'],
    queryFn: async () => {
      const response = await axios.get('/api/profile/');
      return {
        email_on_booking: response.data.email_on_booking !== false,
        email_on_cancellation: response.data.email_on_cancellation !== false,
      };
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
};

/**
 * Hook to update email notification preferences
 */
export const useUpdateEmailPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences) => {
      const response = await axios.put('/api/profile/update/', {
        email_on_booking: preferences.email_on_booking,
        email_on_cancellation: preferences.email_on_cancellation,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailPreferences'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
};

