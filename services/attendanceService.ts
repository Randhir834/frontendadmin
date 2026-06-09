import api from './api';

export interface AttendanceStudent {
  id: number;
  name: string;
  email: string;
  enrolled_at: string;
  progress: number;
}

export interface AttendanceRecord {
  student_id: number;
  status: 'present' | 'absent' | 'late';
  notes?: string;
}

export interface AttendanceSubmission {
  course_id: number;
  date: string;
  students: AttendanceRecord[];
}

export interface AttendanceSummary {
  student_id: number;
  student_name: string;
  student_email: string;
  total_classes: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  attendance_percentage: number;
}

export const attendanceService = {
  getInstructorCourses: async (instructorId?: number) => {
    const endpoint = instructorId 
      ? `/attendance/instructor/${instructorId}/courses`
      : '/attendance/courses';
    const response = await api.get(endpoint);
    return response.data;
  },

  getCourseStudents: async (courseId: number) => {
    const response = await api.get(`/attendance/courses/${courseId}/students`);
    return response.data;
  },

  getAttendanceByDate: async (courseId: number, date: string) => {
    const response = await api.get(`/attendance/courses/${courseId}?date=${date}`);
    return response.data;
  },

  markAttendance: async (attendanceData: AttendanceSubmission) => {
    const response = await api.post('/attendance/mark', attendanceData);
    return response.data;
  },

  getAttendanceReports: async (filters?: {
    course_id?: number;
    instructor_id?: number;
    student_id?: number;
    start_date?: string;
    end_date?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/attendance/reports${query}`);
    return response.data;
  },

  getCourseStats: async (courseId: number, studentId?: number) => {
    const params = studentId ? `?studentId=${studentId}` : '';
    const response = await api.get(`/attendance/courses/${courseId}/stats${params}`);
    return response.data;
  },

  getAttendanceSummary: async (courseId: number) => {
    const response = await api.get(`/attendance/courses/${courseId}/summary`);
    return response.data;
  },

  exportAttendanceCSV: async (filters?: {
    course_id?: number;
    instructor_id?: number;
    student_id?: number;
    start_date?: string;
    end_date?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    
    const response = await api.get(`/export/attendance/csv${query}`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'attendance-report.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  exportCourseSummaryCSV: async (courseId: number) => {
    const response = await api.get(`/export/attendance/courses/${courseId}/summary/csv`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `course-${courseId}-attendance-summary.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};