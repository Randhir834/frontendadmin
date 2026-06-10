import { useEffect, useCallback } from 'react';
import { socketService } from '@/services/socketService';

interface UseRealTimeUpdatesProps {
  userId?: number;
  isAdmin?: boolean;
  onProfileUpdate?: (data: any) => void;
  onUserUpdate?: (data: any) => void;
}

export const useRealTimeUpdates = ({
  userId,
  isAdmin = false,
  onProfileUpdate,
  onUserUpdate
}: UseRealTimeUpdatesProps) => {
  
  const handleProfileUpdate = useCallback((data: any) => {
    console.log('[RealTime] Profile update received:', data);
    if (onProfileUpdate) {
      onProfileUpdate(data);
    }
  }, [onProfileUpdate]);

  const handleUserUpdate = useCallback((data: any) => {
    console.log('[RealTime] User update received:', data);
    if (onUserUpdate) {
      onUserUpdate(data);
    }
  }, [onUserUpdate]);

  useEffect(() => {
    // Connect to socket
    socketService.connect(userId);
    
    if (isAdmin) {
      socketService.joinAdminRoom();
    }

    // Set up listeners
    if (onProfileUpdate) {
      socketService.onProfileUpdate(handleProfileUpdate);
    }
    
    if (onUserUpdate) {
      socketService.onUserUpdate(handleUserUpdate);
    }

    // Cleanup on unmount
    return () => {
      socketService.offProfileUpdate();
      socketService.offUserUpdate();
    };
  }, [userId, isAdmin, handleProfileUpdate, handleUserUpdate]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Don't disconnect socket here as other components might be using it
      // socketService.disconnect();
    };
  }, []);

  return {
    isConnected: socketService.isSocketConnected(),
    socket: socketService.getSocket()
  };
};