import { useEffect, useCallback } from 'react';
import { socketService } from '@/services/socketService';

export interface AdminDataUpdate {
  type: string;
  data: any;
  timestamp: string;
  source: string;
}

export const useAdminSync = (onDataUpdate?: (update: AdminDataUpdate) => void) => {
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    // Join admin room when component mounts
    socket.emit('join-admin-room');
    console.log('[AdminSync] Joined admin room');

    // Listen for admin data updates
    const handleAdminDataUpdate = (update: AdminDataUpdate) => {
      console.log('[AdminSync] Received update:', update.type, update);
      
      if (onDataUpdate) {
        onDataUpdate(update);
      }

      // Dispatch custom event for global listeners
      window.dispatchEvent(
        new CustomEvent('admin-data-updated', { detail: update })
      );
    };

    socket.on('admin-data-updated', handleAdminDataUpdate);

    return () => {
      socket.off('admin-data-updated', handleAdminDataUpdate);
    };
  }, [onDataUpdate]);

  return socketService.getSocket();
};

/**
 * Hook to listen for specific admin data update types
 */
export const useAdminDataListener = (
  eventType: string,
  callback: (data: any) => void
) => {
  useEffect(() => {
    const handleUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<AdminDataUpdate>;
      if (customEvent.detail.type === eventType) {
        callback(customEvent.detail.data);
      }
    };

    window.addEventListener('admin-data-updated', handleUpdate);

    return () => {
      window.removeEventListener('admin-data-updated', handleUpdate);
    };
  }, [eventType, callback]);
};
