import React, { useState } from 'react';
import { useClassesQuery, useCreateClass, useUpdateClass, useDeleteClass, useTeachersQuery } from './queries';
import { Plus, Edit2, Trash2, Users, BookOpen, X } from 'lucide-react';
import { notify } from '@/lib/notifications';

export const ClassesPage = (): React.ReactElement => {
  const { data: classesData, isLoading } = useClassesQuery();
  const { data: teachers, isLoading: isLoadingTeachers } = useTeachersQuery();
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const deleteClass = useDeleteClass();

  // Ensure classes is always an array
  const classes = Array.isArray(classesData)
    ? classesData
    : (classesData?.data && Array.isArray(classesData.data))
    ? classesData.data
    : [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [formData, setFormData] = useState({
    grade: '',
    section: '',
    wali_kelas_id: '',
  });

  // Auto-generate class_name when grade or section changes
  const generatedClassName = formData.grade && formData.section
    ? `${formData.grade}${formData.section}`
    : '';

  const generatedClassId = formData.grade && formData.section
    ? `CLASS_${formData.grade}${formData.section}`
    : '';

  const handleOpenModal = (cls?: any) => {
    if (cls) {
      setEditingClass(cls);
      // Extract grade and section from class_name (e.g., "9A" -> grade: "9", section: "A")
      const match = cls.class_name?.match(/^(\d+)([A-Z])$/);
      setFormData({
        grade: match ? match[1] : '',
        section: match ? match[2] : '',
        wali_kelas_id: cls.wali_kelas_id || '',
      });
    } else {
      setEditingClass(null);
      setFormData({ grade: '', section: '', wali_kelas_id: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClass(null);
    setFormData({ grade: '', section: '', wali_kelas_id: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.grade || !formData.section || !formData.wali_kelas_id) {
      notify.warning('Please fill all required fields');
      return;
    }

    try {
      if (editingClass) {
        // For update, only send wali_kelas_id
        await updateClass.mutateAsync({
          class_id: editingClass.class_id,
          data: { wali_kelas_id: formData.wali_kelas_id }
        });
        notify.success('Class updated successfully!');
      } else {
        // For create, send full payload
        const payload = {
          class_id: generatedClassId,
          class_name: generatedClassName,
          wali_kelas_id: formData.wali_kelas_id,
        };
        await createClass.mutateAsync(payload);
        notify.success('Class created successfully!');
      }
      handleCloseModal();
    } catch (error: any) {
      notify.error(error.message || 'Failed to save class');
    }
  };

  const handleDelete = async (class_id: string, class_name: string) => {
    const confirmed = await notify.confirm(
      `Are you sure you want to delete class ${class_name}?`,
      {
        title: 'Delete Class',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    );

    if (confirmed) {
      try {
        await deleteClass.mutateAsync(class_id);
        notify.success('Class deleted successfully!');
      } catch (error) {
        notify.error('Failed to delete class');
      }
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Classes Management</h1>
          <p className="text-gray-500 mt-1">Manage school classes and their details</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Add Class
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Classes</p>
          <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Students</p>
          <p className="text-2xl font-bold text-gray-900">
            {classes.reduce((sum, c) => sum + (c.student_count || 0), 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Avg Students/Class</p>
          <p className="text-2xl font-bold text-gray-900">
            {classes.length > 0
              ? Math.round(classes.reduce((sum, c) => sum + (c.student_count || 0), 0) / classes.length)
              : 0}
          </p>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <div
            key={cls.class_id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{cls.class_name}</h3>
                  <p className="text-sm text-gray-500">{cls.class_id}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(cls)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cls.class_id, cls.class_name)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                  disabled={deleteClass.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{cls.student_count || 0} Students</span>
              </div>

              {cls.wali_kelas_name && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Wali Kelas:</span> {cls.wali_kelas_name}
                </div>
              )}
            </div>
          </div>
        ))}

        {(!classes || classes.length === 0) && (
          <div className="col-span-full text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No classes found. Create your first class!</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingClass ? 'Edit Class' : 'Create New Class'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade *
                  </label>
                  <input
                    type="number"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    placeholder="9"
                    min="7"
                    max="12"
                    required
                    disabled={!!editingClass}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section *
                  </label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value.toUpperCase() })}
                    placeholder="A"
                    maxLength={1}
                    required
                    disabled={!!editingClass}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              {/* Auto-generated class name display */}
              {generatedClassName && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Class Name:</p>
                  <p className="text-lg font-bold text-blue-600">{generatedClassName}</p>
                  <p className="text-xs text-gray-500 mt-1">Class ID: {generatedClassId}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wali Kelas *
                </label>
                <select
                  value={formData.wali_kelas_id}
                  onChange={(e) => setFormData({ ...formData, wali_kelas_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoadingTeachers}
                >
                  <option value="">Select Wali Kelas</option>
                  {teachers?.map((teacher) => (
                    <option key={teacher.teacher_id} value={teacher.teacher_id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
                {isLoadingTeachers && (
                  <p className="text-xs text-gray-500 mt-1">Loading teachers...</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createClass.isPending || updateClass.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {createClass.isPending || updateClass.isPending
                    ? 'Saving...'
                    : editingClass
                    ? 'Update'
                    : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

