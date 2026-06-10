export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  avatar_url?: string;
  date_of_birth?: string;
  age?: number;
  school?: string;
  grade?: string;
  parent_guardian_name?: string;
  phone?: string;
  location?: string;
  qualifications?: string;
  specialization?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseInstructor {
  id: number;
  name: string;
  email: string;
  is_primary: boolean;
}

export interface Course {
  id: number;
  title: string;
  description?: string;
  price: number;
  thumbnail_url?: string;
  category_id?: number;
  category_name?: string;
  instructor_id?: number;
  instructor_name?: string;
  instructors?: CourseInstructor[];
  status: 'published' | 'archived';
  duration_value: number;
  duration_unit: 'days' | 'weeks' | 'months';
  level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  what_you_learn?: string;
  requirements?: string;
  enrollment_count?: number;
  rating?: number;
  total_lessons?: number;
  total_sections?: number;
  is_enrolled?: boolean;
  progress?: number;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: number;
  section_id: number;
  title: string;
  description?: string;
  content_type: 'pdf' | 'doc' | 'text' | 'note';
  content_url?: string;
  duration_minutes: number;
  sort_order: number;
  is_free: boolean;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  status: 'active' | 'completed' | 'cancelled';
  progress: number;
  enrolled_at: string;
  completed_at?: string;
  course_title?: string;
  course_description?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  user_id: number;
  enrollment_id: number;
  amount: number;
  payment_method: string;
  transaction_id?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paid_at?: string;
  course_title?: string;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  due_date?: string;
  max_score: number;
  created_at: string;
  updated_at: string;
}

export interface AssignmentSubmission {
  id: number;
  assignment_id: number;
  student_id: number;
  file_url?: string;
  notes?: string;
  score?: number;
  status: 'submitted' | 'graded' | 'late';
  submitted_at: string;
  graded_at?: string;
  student_name?: string;
  student_email?: string;
  assignment_title?: string;
  course_title?: string;
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  time_limit_minutes: number;
  passing_score: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: number;
  quiz_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  marks: number;
  sort_order: number;
  created_at: string;
}

export interface QuizAttempt {
  id: number;
  quiz_id: number;
  student_id: number;
  score: number;
  total_marks: number;
  status: 'in_progress' | 'completed';
  started_at: string;
  completed_at?: string;
  quiz_title?: string;
  course_title?: string;
  created_at: string;
}

export interface QuizAnswer {
  id: number;
  attempt_id: number;
  question_id: number;
  selected_option: string;
  is_correct: boolean;
  question_text?: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_option?: string;
  created_at: string;
}

export interface LiveClass {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  meet_link: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  course_title?: string;
  instructor_name?: string;
  instructor_id?: number;
  thumbnail_url?: string;
  enrolled_count?: number;
  created_at: string;
  updated_at: string;
}

export interface FilterOption {
  id: number;
  name?: string;
  title?: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  is_read: boolean;
  created_at: string;
}

export interface LessonProgress {
  id: number;
  lesson_id: number;
  student_id: number;
  status: 'not_started' | 'in_progress' | 'completed';
  completed_at?: string;
  lesson_title?: string;
  section_title?: string;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: number;
  course_id: number;
  student_id: number;
  instructor_id: number;
  date: string;
  status: 'present' | 'absent' | 'late';
  notes?: string;
  created_at: string;
  updated_at: string;
  course_title?: string;
  student_name?: string;
  student_email?: string;
  instructor_name?: string;
}

export interface CourseProgressSummary {
  total: number;
  completed: number;
  percentage: number;
}

export interface EnrolledStudent {
  id: number;
  user_id: number;
  course_id: number;
  status: 'active' | 'completed' | 'cancelled';
  progress: number;
  enrolled_at: string;
  completed_at?: string;
  student_name: string;
  student_email: string;
  student_phone?: string;
  avatar_url?: string;
  date_of_birth?: string;
  grade?: string;
  completed_lessons: number;
  total_lessons: number;
}

export interface CourseMaterial {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: number;
  uploaded_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface EnrollmentStats {
  total_students: number;
  active_students: number;
  completed_students: number;
  students_completed_course: number;
  average_progress: number;
  new_enrollments_week: number;
  new_enrollments_month: number;
}

export interface DashboardStats {
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
}

export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  updated_at: string;
}

export interface AuthResponse {
  message: string;
  user: Pick<User, 'id' | 'name' | 'email' | 'role'>;
  token: string;
}

export interface ApiError {
  error: string;
}
