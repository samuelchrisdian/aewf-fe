import React, { useState, useMemo, useCallback } from 'react';
import { useDailyAttendanceQuery, useImportAttendance, useManualAttendance, useUpdateAttendance, usePreviewAttendance } from './queries';
import { useClassesQuery } from '../classes/queries';
import { useMachinesQuery } from '../machines/queries';
import { Calendar, Download, Filter, CheckCircle, XCircle, Clock, FileText, Upload, X, AlertCircle, CheckCircle2, AlertTriangle, Plus, Edit2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { notify } from '@/lib/notifications.tsx';

// Manual Attendance Modal Component
interface ManualAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { student_nis: string; date: string; status: string; notes: string }) => void;
  isLoading: boolean;
}

const ManualAttendanceModal: React.FC<ManualAttendanceModalProps> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    student_nis: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const resetForm = () => {
    setFormData({
      student_nis: '',
      date: new Date().toISOString().split('T')[0],
      status: 'present',
      notes: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Add Manual Attendance</h3>
          <button onClick={() => { onClose(); resetForm(); }} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIS (Student ID)</label>
            <input
              type="text"
              value={formData.student_nis}
              onChange={(e) => setFormData({ ...formData, student_nis: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter student NIS"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="sick">Sick</option>
              <option value="permission">Permission</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional notes..."
              rows={3}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { onClose(); resetForm(); }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Update Attendance Modal Component
interface UpdateAttendanceModalProps {
  isOpen: boolean;
  record: { id: number; status: string; notes?: string } | null;
  onClose: () => void;
  onSubmit: (id: number, data: { status: string; notes: string }) => void;
  isLoading: boolean;
}

const UpdateAttendanceModal: React.FC<UpdateAttendanceModalProps> = ({ isOpen, record, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    status: record?.status || 'present',
    notes: record?.notes || '',
  });

  React.useEffect(() => {
    if (record) {
      setFormData({
        status: record.status,
        notes: record.notes || '',
      });
    }
  }, [record]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (record) {
      onSubmit(record.id, formData);
    }
  };

  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Update Attendance</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="sick">Sick</option>
              <option value="permission">Permission</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional notes..."
              rows={3}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ITEMS_PER_PAGE = 10;

export const AttendancePage = (): React.ReactElement => {
  // Get current date for default date range (current month)
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const formatDateValue = (d: Date) => d.toISOString().split('T')[0];

  // Filter states (for input fields - not applied yet)
  const [inputStartDate, setInputStartDate] = useState(formatDateValue(firstDayOfMonth));
  const [inputEndDate, setInputEndDate] = useState(formatDateValue(today));
  const [inputClassFilter, setInputClassFilter] = useState<string | undefined>();

  // Applied filter states (used for query)
  const [appliedStartDate, setAppliedStartDate] = useState(formatDateValue(firstDayOfMonth));
  const [appliedEndDate, setAppliedEndDate] = useState(formatDateValue(today));
  const [appliedClassFilter, setAppliedClassFilter] = useState<string | undefined>();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<{ id: number; status: string; notes?: string } | null>(null);

  // Import modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<string>('');

  // Preview modal state
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  // Import result modal state
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  // Query with applied filters
  const { data: attendance = [], isLoading } = useDailyAttendanceQuery({
    start_date: appliedStartDate,
    end_date: appliedEndDate,
    class_id: appliedClassFilter,
  });

  const { data: classesData } = useClassesQuery();
  const { data: machinesData } = useMachinesQuery();

  // Mutations
  const manualAttendance = useManualAttendance();
  const updateAttendance = useUpdateAttendance();
  const importAttendance = useImportAttendance();
  const previewAttendance = usePreviewAttendance();

  // Apply filters when button clicked
  const handleApplyFilters = () => {
    setAppliedStartDate(inputStartDate);
    setAppliedEndDate(inputEndDate);
    setAppliedClassFilter(inputClassFilter);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Pagination calculations (frontend pagination on all fetched data)
  const totalItems = attendance.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedAttendance = attendance.slice(startIndex, endIndex);

  // Safe date formatter
  const formatDate = useCallback((dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }, []);

  // Safe time formatter
  const formatTime = useCallback((timeStr?: string) => {
    if (!timeStr) return '-';
    try {
      if (timeStr.includes('T') || timeStr.includes(' ')) {
        const date = new Date(timeStr);
        if (isNaN(date.getTime())) return timeStr;
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      }
      return timeStr;
    } catch {
      return timeStr;
    }
  }, []);

  // Get unique classes from classes API
  const uniqueClasses = useMemo(() => {
    if (classesData) {
      const classes = Array.isArray(classesData)
        ? classesData
        : (classesData?.data && Array.isArray(classesData.data))
          ? classesData.data
          : [];

      return classes.map((cls: any) => ({
        id: cls.class_id,
        name: cls.class_name,
      }));
    }
    return [];
  }, [classesData]);

  // Get machines list for import dropdown
  const machinesList = useMemo(() => {
    if (machinesData) {
      const machines = Array.isArray(machinesData)
        ? machinesData
        : (machinesData?.data && Array.isArray(machinesData.data))
          ? machinesData.data
          : [];

      return machines;
    }
    return [];
  }, [machinesData]);

  // Handle manual attendance submission
  const handleManualSubmit = (data: { student_nis: string; date: string; status: string; notes: string }) => {
    manualAttendance.mutate(
      {
        student_nis: data.student_nis,
        date: data.date,
        status: data.status as 'present' | 'absent' | 'late' | 'excused',
        notes: data.notes || undefined,
      },
      {
        onSuccess: () => {
          setIsAddModalOpen(false);
          notify.success('Attendance added successfully!');
        },
        onError: (error: any) => {
          notify.error(`Failed to add attendance: ${error.message || 'Unknown error'}`);
        },
      }
    );
  };

  // Handle update attendance submission
  const handleUpdateSubmit = (id: number, data: { status: string; notes: string }) => {
    updateAttendance.mutate(
      {
        id,
        data: {
          status: data.status as 'present' | 'absent' | 'late' | 'sick' | 'permission',
          notes: data.notes || undefined,
        },
      },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
          setEditingRecord(null);
          notify.success('Attendance updated successfully!');
        },
        onError: (error: any) => {
          notify.error(`Failed to update attendance: ${error.message || 'Unknown error'}`);
        },
      }
    );
  };

  // Open edit modal
  const openEditModal = (record: { id: number; status: string; notes?: string }) => {
    setEditingRecord(record);
    setIsEditModalOpen(true);
  };

  const handleExport = () => {
    if (!attendance || attendance.length === 0) {
      notify.warning('No data to export');
      return;
    }

    const headers = ['Date', 'NIS', 'Name', 'Status', 'Check In', 'Check Out', 'Notes'];
    const rows = attendance.map(record => [
      record.date,
      record.student_nis,
      record.student_name || 'N/A',
      record.status,
      record.check_in || '-',
      record.check_out || '-',
      record.notes || '-'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_${appliedStartDate}_to_${appliedEndDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    notify.success('Attendance data exported successfully!');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handlePreview = async () => {
    if (!selectedFile) {
      notify.warning('Please select a file to import');
      return;
    }

    if (!selectedMachine) {
      notify.warning('Please select a machine');
      return;
    }

    try {
      const response = await previewAttendance.mutateAsync({
        file: selectedFile,
        machine_code: selectedMachine,
      });

      setPreviewData(response);
      setIsImportModalOpen(false);
      setIsPreviewModalOpen(true);

      notify.success('Preview loaded successfully!');
    } catch (error: any) {
      notify.error(error?.response?.data?.message || 'Failed to preview attendance');
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !selectedMachine) {
      notify.warning('Missing file or machine selection');
      return;
    }

    try {
      const response = await importAttendance.mutateAsync({
        file: selectedFile,
        machine_code: selectedMachine,
      });

      setImportResult(response);
      setIsPreviewModalOpen(false);
      setIsResultModalOpen(true);

      setSelectedFile(null);
      setSelectedMachine('');
      setPreviewData(null);

      const data = response?.data || response;
      const hasErrors = data?.errors && data.errors.length > 0;

      if (hasErrors) {
        notify.warning('Import completed with some errors. Please review the details.');
      } else {
        notify.success('Attendance imported successfully!');
      }
    } catch (error: any) {
      notify.error(error?.response?.data?.message || 'Failed to import attendance');
    }
  };

  const closeImportModal = () => {
    setIsImportModalOpen(false);
    setSelectedFile(null);
    setSelectedMachine('');
    setPreviewData(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'absent':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'late':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'excused':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-4 h-4" />;
      case 'absent':
        return <XCircle className="w-4 h-4" />;
      case 'late':
        return <Clock className="w-4 h-4" />;
      case 'excused':
        return <FileText className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Stats calculated from ALL data (not paginated)
  const stats = attendance.reduce(
    (acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      acc.total++;
      return acc;
    },
    { present: 0, absent: 0, late: 0, excused: 0, total: 0 } as Record<string, number>
  );

  const attendanceRate = stats.total > 0
    ? ((stats.present / stats.total) * 100).toFixed(1)
    : '0';

  // Format date range for display
  const formatDateRangeDisplay = () => {
    const start = new Date(appliedStartDate);
    const end = new Date(appliedEndDate);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Records</h1>
          <p className="text-gray-500 mt-1">
            Viewing attendance for <span className="font-semibold text-gray-700">{formatDateRangeDisplay()}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Manual
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters with Apply Button */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={inputStartDate}
                onChange={(e) => setInputStartDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={inputEndDate}
                onChange={(e) => setInputEndDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={inputClassFilter || ''}
                onChange={(e) => setInputClassFilter(e.target.value || undefined)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Classes</option>
                {uniqueClasses.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleApplyFilters}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
          >
            <Search className="w-4 h-4" />
            Apply
          </button>
        </div>
      </div>

      {/* Stats - shows total from ALL data */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Records</p>
          <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Present</p>
          <p className="text-2xl font-bold text-green-600">{stats?.present || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Absent</p>
          <p className="text-2xl font-bold text-red-600">{stats?.absent || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Late</p>
          <p className="text-2xl font-bold text-yellow-600">{stats?.late || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Attendance Rate</p>
          <p className="text-2xl font-bold text-blue-600">{attendanceRate}%</p>
        </div>
      </div>

      {/* Attendance List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NIS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedAttendance.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                    {formatDate(record.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                        {record.student_name?.substring(0, 2).toUpperCase() || 'NA'}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {record.student_name || 'Unknown'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.student_nis}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                      {getStatusIcon(record.status)}
                      {record.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTime(record.check_in)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTime(record.check_out)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {record.notes || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => openEditModal({ id: record.id, status: record.status, notes: record.notes })}
                      className="text-blue-600 hover:text-blue-800 transition p-1 rounded hover:bg-blue-50"
                      title="Edit attendance"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(!attendance || attendance.length === 0) && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No attendance records for this period</p>
            <p className="text-sm text-gray-400 mt-1">Try selecting a different date range or class</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} records
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 text-sm font-medium text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Attendance Modal */}
      <ManualAttendanceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleManualSubmit}
        isLoading={manualAttendance.isPending}
      />

      {/* Update Attendance Modal */}
      <UpdateAttendanceModal
        isOpen={isEditModalOpen}
        record={editingRecord}
        onClose={() => { setIsEditModalOpen(false); setEditingRecord(null); }}
        onSubmit={handleUpdateSubmit}
        isLoading={updateAttendance.isPending}
      />

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-green-600" />
                Import Attendance
              </h3>
              <button onClick={closeImportModal} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Machine <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedMachine}
                  onChange={(e) => setSelectedMachine(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  required
                >
                  <option value="">-- Select Machine --</option>
                  {machinesList.map((machine: any) => (
                    <option key={machine.id} value={machine.machine_code}>
                      {machine.machine_code}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload File <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition group"
                  >
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 group-hover:text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 group-hover:text-green-700">
                        {selectedFile ? (
                          <span className="font-medium text-green-600">{selectedFile.name}</span>
                        ) : (
                          <><span className="font-semibold">Click to upload</span> or drag and drop</>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">CSV, XLSX, or XLS</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Note:</span> Make sure the file format matches the expected template for attendance data.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-6 bg-gray-50 rounded-b-xl">
              <button
                onClick={closeImportModal}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
                disabled={previewAttendance.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handlePreview}
                disabled={!selectedFile || !selectedMachine || previewAttendance.isPending}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {previewAttendance.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Loading Preview...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Preview
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewModalOpen && previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Preview Import Data
                </h3>
                {previewData?.data?.period && (
                  <p className="text-sm text-gray-600 mt-1">
                    Period: {previewData.data.period.month}/{previewData.data.period.year}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  setIsImportModalOpen(true);
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-600 font-medium">Total Logs</p>
                  <p className="text-2xl font-bold text-blue-900">{previewData?.data?.summary?.total_logs || 0}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-600 font-medium">Total Users</p>
                  <p className="text-2xl font-bold text-green-900">{previewData?.data?.summary?.total_users || 0}</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-600 font-medium">Unmapped Users</p>
                  <p className="text-2xl font-bold text-yellow-900">{previewData?.data?.summary?.unmapped_users || 0}</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600 font-medium">Users Not Found</p>
                  <p className="text-2xl font-bold text-red-900">{previewData?.data?.summary?.users_not_found || 0}</p>
                </div>
              </div>

              {/* Errors */}
              {previewData?.data?.errors && previewData.data.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900 mb-2">Errors:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                        {previewData.data.errors.map((error: string, idx: number) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Users Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-900">Users Preview</h4>
                </div>
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">User ID</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Log Count</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Mapped To (NIS)</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Found in Machine</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {previewData?.data?.users && previewData.data.users.length > 0 ? (
                        previewData.data.users.map((user: any, idx: number) => (
                          <tr
                            key={idx}
                            className={!user.mapped_to ? 'bg-yellow-50' : user.found_in_machine ? '' : 'bg-red-50'}
                          >
                            <td className="px-4 py-3 text-gray-900 font-medium">{user.user_id}</td>
                            <td className="px-4 py-3 text-gray-900">{user.name}</td>
                            <td className="px-4 py-3 text-gray-900 text-center">{user.log_count}</td>
                            <td className="px-4 py-3 text-gray-900">
                              {user.mapped_to ? (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                  {user.mapped_to}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs">Not mapped</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {user.found_in_machine ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-600 mx-auto" />
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {!user.mapped_to ? (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                                  <AlertTriangle className="w-3 h-3" />
                                  Unmapped
                                </span>
                              ) : !user.found_in_machine ? (
                                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                                  <XCircle className="w-3 h-3" />
                                  Not Found
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Ready
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                            No preview data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Info Note */}
              {previewData?.data?.summary?.unmapped_users > 0 && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Note:</span> {previewData.data.summary.unmapped_users} user(s) are not mapped to students.
                    These records will be skipped during import. Please map them in the Mapping menu before importing.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 bg-gray-50 rounded-b-xl border-t border-gray-200">
              <button
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  setIsImportModalOpen(true);
                }}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
                disabled={importAttendance.isPending}
              >
                Back to Edit
              </button>
              <button
                onClick={handleImport}
                disabled={importAttendance.isPending || (previewData?.data?.summary?.total_logs || 0) === 0}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {importAttendance.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Import Data ({previewData?.data?.summary?.total_logs || 0} logs)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Result Modal */}
      {isResultModalOpen && importResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {importResult?.data?.errors?.length > 0 ? (
                  <>
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    Import Completed with Warnings
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Import Successful
                  </>
                )}
              </h3>
              <button onClick={() => setIsResultModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <p className="text-xs font-semibold text-green-700 uppercase">Imported</p>
                  </div>
                  <p className="text-2xl font-bold text-green-700">{importResult?.data?.logs_imported || 0}</p>
                  <p className="text-xs text-green-600 mt-1">Total logs</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <p className="text-xs font-semibold text-blue-700 uppercase">Created</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">{importResult?.data?.daily_records_created || 0}</p>
                  <p className="text-xs text-blue-600 mt-1">Attendance records</p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <p className="text-xs font-semibold text-amber-700 uppercase">Errors</p>
                  </div>
                  <p className="text-2xl font-bold text-amber-700">{importResult?.data?.errors?.length || 0}</p>
                  <p className="text-xs text-amber-600 mt-1">Records skipped</p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Batch ID</p>
                    <p className="text-lg font-bold text-gray-900">#{importResult?.data?.batch_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-700">Status</p>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${importResult?.data?.errors?.length > 0
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : 'bg-green-100 text-green-700 border border-green-200'
                      }`}>
                      {importResult?.data?.errors?.length > 0 ? 'Partial Success' : 'Complete'}
                    </span>
                  </div>
                </div>
              </div>

              {importResult?.data?.errors && importResult.data.errors.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <h4 className="font-bold text-gray-900">
                      Error Details ({importResult.data.errors.length} issues)
                    </h4>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-amber-900 mb-1">Missing Student Mappings</p>
                        <p className="text-sm text-amber-800">
                          The following machine users are not mapped to any student. Please map them in the
                          <a href="/mapping" className="font-semibold underline ml-1 hover:text-amber-900">Mapping page</a>
                          {' '}to include their attendance data.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Machine User</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {importResult.data.errors.map((error: string, index: number) => {
                            const match = error.match(/machine user ID (\d+) \(([^)]+)\) on (\d{4}-\d{2}-\d{2})/);
                            const userId = match ? match[1] : '-';
                            const userName = match ? match[2] : '-';
                            const date = match ? match[3] : '-';

                            return (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-gray-500 font-medium">{index + 1}</td>
                                <td className="px-4 py-3 text-gray-900 font-mono">ID {userId}</td>
                                <td className="px-4 py-3">
                                  <span className="inline-flex items-center gap-1.5 text-gray-700">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                                      {userName.substring(0, 2).toUpperCase()}
                                    </div>
                                    {userName}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-gray-600 font-medium">
                                  {new Date(date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-900 mb-1">Next Steps</p>
                        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                          <li>Go to the <a href="/mapping" className="font-semibold underline hover:text-blue-900">Mapping page</a></li>
                          <li>Find unmapped machine users in the list</li>
                          <li>Map each user to the correct student</li>
                          <li>Re-import this attendance file to process skipped records</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(!importResult?.data?.errors || importResult.data.errors.length === 0) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">Import completed successfully!</p>
                      <p className="text-sm text-green-700 mt-1">
                        All attendance logs have been processed and created as attendance records.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200">
              {importResult?.data?.errors && importResult.data.errors.length > 0 && (
                <a
                  href="/mapping"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-center"
                >
                  Go to Mapping
                </a>
              )}
              <button
                onClick={() => setIsResultModalOpen(false)}
                className={`${importResult?.data?.errors && importResult.data.errors.length > 0 ? 'flex-1' : 'w-full'
                  } px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

