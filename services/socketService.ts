import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(userId?: number) {
    if (this.socket?.connected) {
      return this.socket;
    }

    const backendUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';
    
    this.socket = io(backendUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected to server');
      this.isConnected = true;
      
      // Join user-specific room if userId is provided
      if (userId) {
        this.socket?.emit('join-user-room', userId);
      }
      
      // Join admin room for admin users
      this.socket?.emit('join-admin-room');
    });

    this.socket.on('disconnect', () => {
      console.log('[Socket] Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  // Listen for course material uploads
  onCourseMaterialUploaded(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('course-material-uploaded', callback);
    }
  }

  // Remove course material upload listener
  offCourseMaterialUploaded(callback?: (data: any) => void) {
    if (this.socket) {
      if (callback) {
        this.socket.off('course-material-uploaded', callback);
      } else {
        this.socket.off('course-material-uploaded');
      }
    }
  }

  getSocket() {
    return this.socket;
  }

  // Join user-specific room
  joinUserRoom(userId: number) {
    if (this.socket) {
      this.socket.emit('join-user-room', userId);
    }
  }

  // Join admin room
  joinAdminRoom() {
    if (this.socket) {
      this.socket.emit('join-admin-room');
    }
  }

  // Listen for profile updates
  onProfileUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('profile-updated', callback);
    }
  }

  // Listen for user updates
  onUserUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user-updated', callback);
    }
  }

  // Remove profile update listener
  offProfileUpdate() {
    if (this.socket) {
      this.socket.off('profile-updated');
    }
  }

  // Remove user update listener
  offUserUpdate() {
    if (this.socket) {
      this.socket.off('user-updated');
    }
  }
}

export const socketService = new SocketService();