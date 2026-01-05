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
  class_id: string;
  parent_phone?: string;
  is_active?: boolean;
  email?: string;
}

export interface UpdateStudentRequest {
  name?: string;
  class_id?: string;
  parent_phone?: string;
  is_active?: boolean;
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
  action: 'contacted_parent' | 'scheduled_meeting' | 'home_visit' | 'counseling' | 'other';
  notes?: string;
  follow_up_date?: string;
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
  class_id?: string;
}

export interface AttendanceReportParams {
  start_date: string;
  end_date: string;
  class_id?: string;
  student_nis?: string;
  format?: 'json' | 'excel';
}

export interface AttendanceReportItem {
  student_nis: string;
  student_name: string;
  class_name: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  sick?: number;
  permission?: number;
  total_days: number;
  attendance_rate: number;
  daily_records?: {
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused' | 'sick' | 'permission';
  }[];
}

export interface AttendanceReportResponse {
  period: { start_date: string; end_date: string };
  report_type?: string;
  generated_at?: string;
  filters?: any;
  class_id?: string;
  class_name?: string;
  wali_kelas?: any;
  // Backend uses daily_breakdown, we also support records for flexibility
  daily_breakdown?: AttendanceReportItem[];
  records?: AttendanceReportItem[];
  summary?: {
    total_students: number;
    average_attendance: number;
  };
}

export interface RiskReportParams {
  class_id?: string;
  format?: 'json' | 'excel';
}

export interface RiskReportItem {
  student_nis: string;
  student_name: string;
  class_name: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;
  absent_count: number;
  late_count: number;
  last_calculated: string;
}

export interface RiskReportResponse {
  generated_at?: string;
  report_type?: string;
  filters?: any;
  class_id?: string;
  // Backend uses 'students', we also support at_risk_students for flexibility
  students?: RiskReportItem[];
  at_risk_students?: RiskReportItem[];
  summary?: {
    total_high_risk: number;
    total_medium_risk: number;
    total_low_risk: number;
  };
}

export interface ClassSummaryParams {
  start_date?: string;
  end_date?: string;
  format?: 'json' | 'excel';
}

export interface ClassSummaryItem {
  class_id: string;
  class_name: string;
  wali_kelas?: string;
  total_students: number;
  average_attendance: number;
  high_risk_count: number;
  medium_risk_count: number;
}

export interface ClassSummaryResponse {
  period: { start_date: string; end_date: string };
  classes: ClassSummaryItem[];
}

export interface ExportParams {
  class_id?: string;
  start_date?: string;
  end_date?: string;
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
  is_mapped: boolean;
  verified_at?: string;
  verified_by?: string;
}

export interface MappingStats {
  total_machine_users: number;
  mapped_count: number;
  unmapped_count: number;
  suggested_count: number;
  verified_count: number;
  mapping_rate: number;
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

