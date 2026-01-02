import React, { useState, useMemo, useCallback } from 'react';
import { useDailyAttendanceQuery, useImportAttendance } from './queries';
import { useClassesQuery } from '../classes/queries';
import { useMachinesQuery } from '../machines/queries';
import { Calendar, Download, Filter, CheckCircle, XCircle, Clock, FileText, Upload, X, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { notify } from '@/lib/notifications';

export const AttendancePage = (): React.ReactElement => {
  // Get current month in YYYY-MM format
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [classFilter, setClassFilter] = useState<string | undefined>();

  // Import modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<string>('');

  // Import result modal state
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  const { data: attendance = [], isLoading } = useDailyAttendanceQuery({
    month: selectedMonth,
    class_id: classFilter,
  });

  const { data: classesData } = useClassesQuery();
  const { data: machinesData } = useMachinesQuery();
  const importAttendance = useImportAttendance();

  // Safe date formatter
  const formatDate = useCallback((dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr; // Return original if invalid
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
      // Handle both full datetime and time-only strings
      if (timeStr.includes('T') || timeStr.includes(' ')) {
        const date = new Date(timeStr);
        if (isNaN(date.getTime())) return timeStr;
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      }
      // Already a time string like "07:30"
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

      // Map to expected format: { id, name } using class_id and class_name
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

  const handleExport = () => {
    if (!attendance || attendance.length === 0) {
      notify.warning('No data to export');
      return;
    }

    // Create CSV content
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

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_${selectedMonth}.csv`);
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

  const handleImport = async () => {
    if (!selectedFile) {
      notify.warning('Please select a file to import');
      return;
    }

    if (!selectedMachine) {
      notify.warning('Please select a machine');
      return;
    }

    try {
      const response = await importAttendance.mutateAsync({
        file: selectedFile,
        machine_code: selectedMachine,
      });

      // Store result and show result modal
      setImportResult(response);
      setIsImportModalOpen(false);
      setIsResultModalOpen(true);

      // Clear form
      setSelectedFile(null);
      setSelectedMachine('');

      // Show appropriate notification based on errors
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

  // Format selected month for display
  const formatMonthDisplay = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
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
          <h1 className="text-2xl font-bold text-gray-900">Monthly Attendance</h1>
          <p className="text-gray-500 mt-1">
            Viewing attendance for <span className="font-semibold text-gray-700">{formatMonthDisplay(selectedMonth)}</span>
          </p>
        </div>
        <div className="flex gap-3">
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={classFilter || ''}
              onChange={(e) => setClassFilter(e.target.value || undefined)}
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
      </div>

      {/* Stats */}
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendance.map((record) => (
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
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {record.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(!attendance || attendance.length === 0) && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No attendance records for this month</p>
            <p className="text-sm text-gray-400 mt-1">Try selecting a different month or class</p>
          </div>
        )}
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-green-600" />
                Import Attendance
              </h3>
              <button
                onClick={closeImportModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Machine Selection */}
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

              {/* File Upload */}
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
                          <>
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">CSV, XLSX, or XLS</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Note:</span> Make sure the file format matches the expected template for attendance data.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 bg-gray-50 rounded-b-xl">
              <button
                onClick={closeImportModal}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
                disabled={importAttendance.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!selectedFile || !selectedMachine || importAttendance.isPending}
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
                    Import
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
            {/* Modal Header */}
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
              <button
                onClick={() => setIsResultModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <p className="text-xs font-semibold text-green-700 uppercase">Imported</p>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    {importResult?.data?.logs_imported || 0}
                  </p>
                  <p className="text-xs text-green-600 mt-1">Total logs</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <p className="text-xs font-semibold text-blue-700 uppercase">Created</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">
                    {importResult?.data?.daily_records_created || 0}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">Attendance records</p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <p className="text-xs font-semibold text-amber-700 uppercase">Errors</p>
                  </div>
                  <p className="text-2xl font-bold text-amber-700">
                    {importResult?.data?.errors?.length || 0}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">Records skipped</p>
                </div>
              </div>

              {/* Batch Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Batch ID</p>
                    <p className="text-lg font-bold text-gray-900">#{importResult?.data?.batch_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-700">Status</p>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      importResult?.data?.errors?.length > 0 
                        ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                        : 'bg-green-100 text-green-700 border border-green-200'
                    }`}>
                      {importResult?.data?.errors?.length > 0 ? 'Partial Success' : 'Complete'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Details */}
              {importResult?.data?.errors && importResult.data.errors.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <h4 className="font-bold text-gray-900">
                      Error Details ({importResult.data.errors.length} issues)
                    </h4>
                  </div>

                  {/* Info Box */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-amber-900 mb-1">
                          Missing Student Mappings
                        </p>
                        <p className="text-sm text-amber-800">
                          The following machine users are not mapped to any student. Please map them in the
                          <a href="/mapping" className="font-semibold underline ml-1 hover:text-amber-900">Mapping page</a>
                          {' '}to include their attendance data.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Error List */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                              #
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                              Machine User
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                              Name
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {importResult.data.errors.map((error: string, index: number) => {
                            // Parse error: "No student mapping for machine user ID 55 (Graciela) on 2025-12-01"
                            const match = error.match(/machine user ID (\d+) \(([^)]+)\) on (\d{4}-\d{2}-\d{2})/);
                            const userId = match ? match[1] : '-';
                            const userName = match ? match[2] : '-';
                            const date = match ? match[3] : '-';

                            return (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-gray-500 font-medium">
                                  {index + 1}
                                </td>
                                <td className="px-4 py-3 text-gray-900 font-mono">
                                  ID {userId}
                                </td>
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

                  {/* Action Suggestion */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-900 mb-1">
                          Next Steps
                        </p>
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

              {/* Success Message (no errors) */}
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

            {/* Modal Footer */}
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
                className={`${
                  importResult?.data?.errors && importResult.data.errors.length > 0 
                    ? 'flex-1' 
                    : 'w-full'
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

