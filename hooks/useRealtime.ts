'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// Real-time event types
export const REALTIME_EVENTS = {
  // User events
  USER_CREATED: 'user:created',
  USER_UPDATED: 'user:updated',
  USER_DELETED: 'user:deleted',
  USER_STATUS_CHANGED: 'user:status_changed',

  // Course events
  COURSE_CREATED: 'course:created',
  COURSE_UPDATED: 'course:updated',
  COURSE_DELETED: 'course:deleted',
  COURSE_PUBLISHED: 'course:published',

  // Enrollment events
  ENROLLMENT_CREATED: 'enrollment:created',
  ENROLLMENT_UPDATED: 'enrollment:updated',
  ENROLLMENT_DELETED: 'enrollment:deleted',

  // Assignment events
  ASSIGNMENT_CREATED: 'assignment:created',
  ASSIGNMENT_UPDATED: 'assignment:updated',
  ASSIGNMENT_DELETED: 'assignment:deleted',
  ASSIGNMENT_SUBMITTED: 'assignment:submitted',
  ASSIGNMENT_GRADED: 'assignment:graded',

  // Quiz events
  QUIZ_CREATED: 'quiz:created',
  QUIZ_UPDATED: 'quiz:updated',
  QUIZ_DELETED: 'quiz:deleted',
  QUIZ_SUBMITTED: 'quiz:submitted',
  QUIZ_GRADED: 'quiz:graded',

  // Live class events
  LIVE_CLASS_CREATED: 'live_class:created',
  LIVE_CLASS_UPDATED: 'live_class:updated',
  LIVE_CLASS_DELETED: 'live_class:deleted',
  LIVE_CLASS_STARTED: 'live_class:started',
  LIVE_CLASS_ENDED: 'live_class:ended',

  // Notification events
  NOTIFICATION_CREATED: 'notification:created',
  NOTIFICATION_READ: 'notification:read',
  NOTIFICATION_DELETED: 'notification:deleted',

  // Progress events
  PROGRESS_UPDATED: 'progress:updated',
  LESSON_COMPLETED: 'lesson:completed',

  // Attendance events
  ATTENDANCE_MARKED: 'attendance:marked',
  ATTENDANCE_UPDATED: 'attendance:updated',

  // Payment events
  PAYMENT_CREATED: 'payment:created',
  PAYMENT_UPDATED: 'payment:updated',

  // Certificate events
  CERTIFICATE_GENERATED: 'certificate:generated',

  // Category events
  CATEGORY_CREATED: 'category:created',
  CATEGORY_UPDATED: 'category:updated',
  CATEGORY_DELETED: 'category:deleted',

  // Course material events
  MATERIAL_CREATED: 'material:created',
  MATERIAL_UPDATED: 'material:updated',
  MATERIAL_DELETED: 'material:deleted',

  // Trial request events
  TRIAL_REQUEST_CREATED: 'trial_request:created',
  TRIAL_REQUEST_UPDATED: 'trial_request:updated',

  // Dashboard statistics update
  DASHBOARD_STATS_UPDATED: 'dashboard:stats_updated',
};

type EventCallback = (data: any) => void;

let socketInstance: Socket | null = null;

/**
 * Get or create socket instance
 */
const getSocket = (): Socket => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected to server');
    });

    socketInstance.on('disconnect', () => {
      console.log('[Socket] Disconnected from server');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error);
    });
  }

  return socketInstance;
};

/**
 * Hook to use real-time events
 */
export const useRealtime = () => {
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    socket.current = getSocket();

    return () => {
      // Don't disconnect on unmount to keep connection alive
    };
  }, []);

  const subscribe = useCallback((event: string, callback: EventCallback) => {
    if (socket.current) {
      socket.current.on(event, callback);
      console.log(`[Socket] Subscribed to ${event}`);
    }
  }, []);

  const unsubscribe = useCallback((event: string, callback?: EventCallback) => {
    if (socket.current) {
      if (callback) {
        socket.current.off(event, callback);
      } else {
        socket.current.off(event);
      }
      console.log(`[Socket] Unsubscribed from ${event}`);
    }
  }, []);

  const joinAdminRoom = useCallback(() => {
    if (socket.current) {
      socket.current.emit('join-admin-room');
      console.log('[Socket] Joined admin room');
    }
  }, []);

  const joinUserRoom = useCallback((userId: number) => {
    if (socket.current) {
      socket.current.emit('join-user-room', userId);
      console.log(`[Socket] Joined user room: ${userId}`);
    }
  }, []);

  return {
    subscribe,
    unsubscribe,
    joinAdminRoom,
    joinUserRoom,
    socket: socket.current,
  };
};

/**
 * Hook to subscribe to specific events with automatic cleanup
 */
export const useRealtimeEvent = (event: string, callback: EventCallback) => {
  const { subscribe, unsubscribe } = useRealtime();

  useEffect(() => {
    subscribe(event, callback);

    return () => {
      unsubscribe(event, callback);
    };
  }, [event, callback, subscribe, unsubscribe]);
};

/**
 * Hook to subscribe to multiple events
 */
export const useRealtimeEvents = (events: Record<string, EventCallback>) => {
  const { subscribe, unsubscribe } = useRealtime();

  useEffect(() => {
    Object.entries(events).forEach(([event, callback]) => {
      subscribe(event, callback);
    });

    return () => {
      Object.entries(events).forEach(([event, callback]) => {
        unsubscribe(event, callback);
      });
    };
  }, [events, subscribe, unsubscribe]);
};
