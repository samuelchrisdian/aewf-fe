import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStudentsQuery, useDeleteStudent, useCreateStudent, useUpdateStudent, usePredictStudent } from './queries';
import { useClassesQuery } from '../classes/queries';
import { usePredictAllStudents, PredictErrorModal, type PredictError } from '@/features/ml';
import { Search, Plus, Edit2, Trash2, Eye, X, RefreshCw, Zap } from 'lucide-react';
import { notify } from '@/lib/notifications.tsx';
import type { StudentsListParams } from '@/types/api';

export const StudentsPage = (): React.ReactElement => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState<string | undefined>();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [formData, setFormData] = useState({
    nis: '',
    name: '',
    class_id: '',
    parent_phone: '',
    is_active: true,
  });

  // Predict modal state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [predictErrors, setPredictErrors] = useState<PredictError[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);

  const queryParams: StudentsListParams = {
    page,
    per_page: 20,
    search,
    ...(classFilter && { class_id: classFilter })
  };

  const { data, isLoading, error } = useStudentsQuery(queryParams);

  const { data: classesData, isLoading: classesLoading, error: classesError } = useClassesQuery();

  // Get unique classes from students data or use classes API
  const uniqueClasses = useMemo(() => {
    // Try to get classes from API first
    if (classesData && !classesLoading) {
      const classes = Array.isArray(classesData)
        ? classesData
        : (classesData?.data && Array.isArray(classesData.data))
        ? classesData.data
        : [];

      // Map to expected format: { id, name }
      return classes.map((cls: any) => ({
        id: cls.class_id,
        name: cls.class_name,
      }));
    }

    // Fallback: Extract unique classes from students list
    if (!data?.students) {
      return [];
    }

    const classMap = new Map();
    data.students.forEach(student => {
      if (student.class_id && student.class_name) {
        classMap.set(student.class_id, student.class_name);
      }
    });

    return Array.from(classMap.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, [data?.students, classesData, classesLoading]);

  const deleteStudent = useDeleteStudent();
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const predictStudent = usePredictStudent();
  const { mutate: predictAll, isPending: isPredictingAll } = usePredictAllStudents();

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        nis: formData.nis,
        name: formData.name,
        class_id: formData.class_id,
        is_active: formData.is_active,
      };

      if (formData.parent_phone) {
        payload.parent_phone = formData.parent_phone;
      }

      await createStudent.mutateAsync(payload);
      notify.success('Student created successfully!');
      setIsCreateModalOpen(false);
      setFormData({ nis: '', name: '', class_id: '', parent_phone: '', is_active: true });
    } catch (error: any) {
      notify.error(error.message || 'Failed to create student');
    }
  };

  const handleEdit = (student: any) => {
    setEditingStudent(student);
    setFormData({
      nis: student.nis,
      name: student.name,
      class_id: student.class_id,
      parent_phone: student.parent_phone || '',
      is_active: student.is_active ?? true,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateStudent.mutateAsync({
        nis: formData.nis,
        data: {
          name: formData.name,
          class_id: formData.class_id,
          parent_phone: formData.parent_phone || undefined,
          is_active: formData.is_active,
        }
      });
      notify.success('Student updated successfully!');
      setIsEditModalOpen(false);
      setEditingStudent(null);
      setFormData({ nis: '', name: '', class_id: '', parent_phone: '', is_active: true });
    } catch (error: any) {
      notify.error(error.message || 'Failed to update student');
    }
  };

  const handleDelete = async (nis: string, name: string) => {
    const confirmed = await notify.confirm(
      `Are you sure you want to delete student ${name}?`,
      {
        title: 'Delete Student',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    );

    if (confirmed) {
      try {
        await deleteStudent.mutateAsync(nis);
        notify.success('Student deleted successfully');
      } catch (error) {
        notify.error('Failed to delete student');
      }
    }
  };

  const handlePredictStudent = async (nis: string, name: string) => {
    const confirmed = await notify.confirm(
      `Predict risk for student ${name}?`,
      {
        title: 'Predict Student Risk',
        confirmText: 'Predict',
        cancelText: 'Cancel',
        type: 'info'
      }
    );

    if (confirmed) {
      try {
        const result = await predictStudent.mutateAsync(nis);
        if (result.success) {
          notify.success(`Risk prediction completed for ${name}!`);
        } else {
          notify.error('Prediction failed');
        }
      } catch (error: any) {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to predict risk';
        notify.error(errorMsg);
      }
    }
  };

  const handlePredictAll = async () => {
    const confirmed = await notify.confirm(
      'This will predict risk for all students. This may take a few minutes.',
      {
        title: 'Predict All Students',
        confirmText: 'Start Prediction',
        cancelText: 'Cancel',
        type: 'info'
      }
    );

    if (confirmed) {
      notify.info('Starting risk prediction for all students...');

      predictAll(undefined, {
        onSuccess: (data) => {
          if (data.success) {
            notify.success(`Success! All ${data.totalStudents} students have been predicted.`);
          } else {
            // Some predictions failed - show modal with details
            setPredictErrors(data.failed);
            setTotalStudents(data.totalStudents);
            setShowErrorModal(true);

            notify.error(
              `Prediction failed! ${data.errorCount} of ${data.totalStudents} students failed.`
            );
          }
        },
        onError: (error: any) => {
          notify.error(
            `Prediction failed: ${error.message || 'Unknown error'}`
          );
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Students</h3>
          <p className="text-sm text-red-600 mb-4">
            Failed to fetch student data. Please check your connection and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students Management</h1>
          <p className="text-gray-500 mt-1">Manage student data and information</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePredictAll}
            disabled={isPredictingAll}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isPredictingAll ? 'animate-spin' : ''}`} />
            {isPredictingAll ? 'Predicting...' : 'Predict All'}
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or NIS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={classFilter || ''}
            onChange={(e) => setClassFilter(e.target.value || undefined)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Students</p>
          <p className="text-2xl font-bold text-gray-900">{data?.total || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Current Page</p>
          <p className="text-2xl font-bold text-gray-900">{page}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Pages</p>
          <p className="text-2xl font-bold text-gray-900">{data?.total_pages || 0}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NIS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parent Phone
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.students?.map((student) => (
                <tr key={student.nis} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.nis}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                        {student.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.class_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.parent_phone || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handlePredictStudent(student.nis, student.name)}
                        disabled={predictStudent.isPending}
                        className="text-purple-600 hover:text-purple-900 disabled:opacity-50"
                        title="Predict Risk"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/alerts/${student.nis}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleEdit(student)}
                        className="text-green-600 hover:text-green-900"
                        title="Edit Student"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.nis, student.name)}
                        className="text-red-600 hover:text-red-900"
                        disabled={deleteStudent.isPending}
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{((page - 1) * 20) + 1}</span> to{' '}
            <span className="font-medium">{Math.min(page * 20, data?.total || 0)}</span> of{' '}
            <span className="font-medium">{data?.total || 0}</span> results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= (data?.total_pages || 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Create Student Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Add New Student</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">NIS *</label>
                <input
                  type="text"
                  value={formData.nis}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                    setFormData({ ...formData, nis: value });
                  }}
                  placeholder="e.g., 12345"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Numbers only</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., John Doe"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class *</label>
                <select
                  value={formData.class_id}
                  onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Select Class --</option>
                  {uniqueClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Phone
                </label>
                <input
                  type="text"
                  value={formData.parent_phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                    setFormData({ ...formData, parent_phone: value });
                  }}
                  placeholder="e.g., 08123456789"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Numbers only</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active_create"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active_create" className="text-sm font-medium text-gray-700">
                  Active Student
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createStudent.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {createStudent.isPending ? 'Creating...' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Edit Student</h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingStudent(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">NIS *</label>
                <input
                  type="text"
                  value={formData.nis}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">NIS cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., John Doe"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class *</label>
                <select
                  value={formData.class_id}
                  onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Select Class --</option>
                  {uniqueClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Phone
                </label>
                <input
                  type="text"
                  value={formData.parent_phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                    setFormData({ ...formData, parent_phone: value });
                  }}
                  placeholder="e.g., 08123456789"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Numbers only</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active_edit"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active_edit" className="text-sm font-medium text-gray-700">
                  Active Student
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingStudent(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  Update Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Predict Error Modal */}
      <PredictErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        errors={predictErrors}
        totalStudents={totalStudents}
      />
    </div>
  );
};

