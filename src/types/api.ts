// API Types and Interfaces

// ============ Auth Types ============
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface User {
  id: number;
  username: string;
  email?: string;
  role: 'admin' | 'teacher' | 'staff';
  name?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// ============ Dashboard Types ============
export interface DashboardStats {
  total_students: number;
  total_classes: number;
  attendance_today: {
    present: number;
    absent: number;
    late: number;
    excused: number;
    total: number;
    percentage: number;
  };
  risk_summary: {
    low: number;
    medium: number;
    high: number;
    critical: number;
    total: number;
  };
  recent_alerts: Alert[];
  attendance_trend: {
    date: string;
    percentage: number;
  }[];
}

// ============ Student Types ============
export interface Student {
  nis: string;
  name: string;
  class_id: string; // Changed from number to string (e.g., "CLASS_9A")
  class_name?: string;
  parent_phone?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface StudentsListParams {
  page?: number;
  per_page?: number;
  class_id?: string; // Changed from number to string
  search?: string;
  sort_by?: string;
}

export interface StudentsListResponse {
  students: Student[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface CreateStudentRequest {
  nis: string;
  name: string;
  class_id: number;
  parent_phone?: string;
  email?: string;
}

export interface UpdateStudentRequest {
  name?: string;
  class_id?: number;
  parent_phone?: string;
  email?: string;
}

// ============ Attendance Types ============
export interface AttendanceRecord {
  id: number;
  student_nis: string;
  student_name?: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  check_in?: string;
  check_out?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DailyAttendanceParams {
  date?: string;
  month?: string; // Format: YYYY-MM
  class_id?: string; // Changed from number to string
  status?: 'present' | 'absent' | 'late' | 'excused';
}

export interface AttendanceSummaryParams {
  period?: 'today' | 'week' | 'month';
  class_id?: string; // Changed from number to string
}

export interface AttendanceSummary {
  period: string;
  total_days: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendance_rate: number;
}

export interface ManualAttendanceRequest {
  student_nis: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  check_in?: string;
  check_out?: string;
}

export interface UpdateAttendanceRequest {
  status?: 'present' | 'absent' | 'late' | 'excused';
  check_in?: string;
  check_out?: string;
  notes?: string;
}

export interface StudentAttendanceParams {
  start_date?: string;
  end_date?: string;
  month?: string;
}

// ============ Risk Management Types ============
export interface RiskStudent {
  nis: string;
  name: string;
  class_id: number;
  class_name?: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;
  probability?: number;
  factors?: string[];
  last_updated?: string;
}

export interface RiskListParams {
  level?: 'low' | 'medium' | 'high' | 'critical';
  class_id?: number;
  page?: number;
  per_page?: number;
}

export interface Alert {
  id: number;
  student_nis: string;
  student_name?: string;
  class_name?: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;
  status: 'open' | 'in_progress' | 'resolved' | 'dismissed';
  message?: string;
  factors?: string[];
  created_at: string;
  updated_at?: string;
  resolved_at?: string;
  resolved_by?: string;
  notes?: string;
}

export interface AlertsParams {
  status?: 'open' | 'in_progress' | 'resolved' | 'dismissed';
  class_id?: number;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  page?: number;
  per_page?: number;
}

export interface AlertActionRequest {
  action: 'acknowledge' | 'in_progress' | 'resolve' | 'dismiss';
  notes?: string;
  status?: 'open' | 'in_progress' | 'resolved' | 'dismissed';
}

export interface RiskHistory {
  date: string;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  factors?: string[];
}

export interface RecalculateRiskRequest {
  class_id?: number;
  student_nis?: string;
}

// ============ Analytics Types ============
export interface AttendanceTrend {
  period: string;
  date: string;
  attendance_rate: number;
  present: number;
  absent: number;
  late: number;
  total: number;
}

export interface ClassComparison {
  class_id: number;
  class_name: string;
  attendance_rate: number;
  risk_students: number;
  total_students: number;
}

export interface StudentPattern {
  nis: string;
  name: string;
  patterns: {
    type: string;
    description: string;
    frequency: number;
  }[];
  attendance_by_day: {
    day: string;
    rate: number;
  }[];
}

// ============ Class Types ============
export interface Class {
  id: number;
  name: string;
  grade?: number;
  section?: string;
  teacher_id?: number;
  teacher_name?: string;
  student_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateClassRequest {
  name: string;
  grade?: number;
  section?: string;
  teacher_id?: number;
}

// ============ Machine Types ============
export interface Machine {
  id: number;
  machine_code: string;
  location: string;
  status: 'active' | 'inactive' | 'maintenance';
  last_sync?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MachineUser {
  id: number;
  machine_id: number;
  user_id: string;
  name: string;
  student_nis?: string;
  is_mapped: boolean;
  created_at?: string;
}

// ============ Report Types ============
export interface ReportParams {
  format?: 'json' | 'excel' | 'pdf';
  start_date?: string;
  end_date?: string;
  class_id?: number;
}

// ============ Import System Types ============
export interface ImportError {
  row?: number;
  field?: string;
  message: string;
}

export interface ImportBatch {
  id: number;
  filename: string;
  file_type: 'master' | 'users' | 'logs';
  status: 'processing' | 'completed' | 'failed' | 'partial';
  records_processed: number;
  error_log: ImportError[];
  created_at: string;
  created_by?: string;
}

export interface ImportResponse {
  success: boolean;
  message: string;
  batch_id?: number;
  records_processed?: number;
  errors?: ImportError[];
}

export interface ImportBatchListParams {
  file_type?: 'master' | 'users' | 'logs';
  status?: 'processing' | 'completed' | 'failed' | 'partial';
  page?: number;
  per_page?: number;
}

// ============ Mapping System Types ============
export interface MachineUserForMapping {
  id: number;
  machine_user_id: string;
  machine_user_name: string;
  department?: string;
}

export interface MappingSuggestion {
  id: number;
  machine_user: MachineUserForMapping;
  suggested_student: {
    nis: string;
    name: string;
  } | null;
  confidence_score: number;
  status: 'pending' | 'verified' | 'rejected';
  verified_at?: string;
  verified_by?: string;
}

export interface MappingStats {
  total_users: number;
  mapped: number;
  pending: number;
  unmapped: number;
}

export interface VerifyMappingRequest {
  mapping_id: number;
  status: 'verified' | 'rejected';
}

export interface BulkVerifyRequest {
  mappings: VerifyMappingRequest[];
}

export interface ProcessMappingResponse {
  success: boolean;
  message: string;
  results?: {
    processed: number;
    matched: number;
    unmatched: number;
  };
}

