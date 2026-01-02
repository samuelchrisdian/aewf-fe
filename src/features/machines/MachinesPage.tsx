import React, { useState } from 'react';
import {
  useMachinesQuery,
  useMachineUsersQuery,
  useRegisterMachine,
  useUpdateMachine,
  useDeleteMachine,
} from './queries';
import { Plus, Edit2, Trash2, Server, MapPin, Circle, Users, X } from 'lucide-react';
import { notify } from '@/lib/notifications';

export const MachinesPage = (): React.ReactElement => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedMachine, setSelectedMachine] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<any>(null);
  const [formData, setFormData] = useState({
    machine_code: '',
    location: '',
    status: 'active' as 'active' | 'inactive' | 'maintenance',
  });

  const { data: machines, isLoading } = useMachinesQuery({ status: statusFilter || undefined });
  const { data: machineUsers, isLoading: usersLoading } = useMachineUsersQuery(
    selectedMachine || undefined
  );
  const registerMachine = useRegisterMachine();
  const updateMachine = useUpdateMachine();
  const deleteMachine = useDeleteMachine();

  const handleOpenModal = (machine?: any) => {
    if (machine) {
      setEditingMachine(machine);
      setFormData({
        machine_code: machine.machine_code || '',
        location: machine.location || '',
        status: machine.status || 'active',
      });
    } else {
      setEditingMachine(null);
      setFormData({ machine_code: '', location: '', status: 'active' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMachine(null);
    setFormData({ machine_code: '', location: '', status: 'active' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingMachine) {
        await updateMachine.mutateAsync({
          id: editingMachine.id,
          data: { location: formData.location, status: formData.status },
        });
        notify.success('Machine updated successfully!');
      } else {
        await registerMachine.mutateAsync({
          machine_code: formData.machine_code,
          location: formData.location,
        });
        notify.success('Machine registered successfully!');
      }
      handleCloseModal();
    } catch (error: any) {
      notify.error(error.message || 'Failed to save machine');
    }
  };

  const handleDelete = async (id: number, code: string) => {
    const confirmed = await notify.confirm(
      `Are you sure you want to delete machine ${code}?`,
      {
        title: 'Delete Machine',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    );

    if (confirmed) {
      try {
        await deleteMachine.mutateAsync(id);
        notify.success('Machine deleted successfully!');
      } catch (error) {
        notify.error('Failed to delete machine');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-gray-600 bg-gray-100';
      case 'maintenance':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'inactive':
        return 'text-gray-500';
      case 'maintenance':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
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
          <h1 className="text-2xl font-bold text-gray-900">Fingerprint Machines</h1>
          <p className="text-gray-500 mt-1">Manage attendance machines and device mapping</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Register Machine
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Machines</p>
          <p className="text-2xl font-bold text-gray-900">{machines?.length || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {machines?.filter((m) => m.status === 'active').length || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Inactive</p>
          <p className="text-2xl font-bold text-gray-600">
            {machines?.filter((m) => m.status === 'inactive').length || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Maintenance</p>
          <p className="text-2xl font-bold text-yellow-600">
            {machines?.filter((m) => m.status === 'maintenance').length || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Machines List */}
        <div className="lg:col-span-2 space-y-4">
          {machines?.map((machine) => (
            <div
              key={machine.id}
              className={`bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition cursor-pointer ${
                selectedMachine === machine.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
              }`}
              onClick={() => setSelectedMachine(machine.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Server className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">{machine.machine_code}</h3>
                      <Circle className={`w-2 h-2 fill-current ${getStatusDotColor(machine.status)}`} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{machine.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          machine.status
                        )}`}
                      >
                        {machine.status.toUpperCase()}
                      </span>
                      {machine.last_sync && (
                        <span className="text-xs text-gray-500">
                          Last sync: {new Date(machine.last_sync).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal(machine);
                    }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(machine.id, machine.machine_code);
                    }}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                    disabled={deleteMachine.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {(!machines || machines.length === 0) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No machines registered yet</p>
            </div>
          )}
        </div>

        {/* Machine Users Panel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-bold text-gray-900">Machine Users</h3>
          </div>

          {selectedMachine ? (
            usersLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : machineUsers && machineUsers.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {machineUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">ID: {user.user_id}</p>
                      </div>
                      {user.is_mapped ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          Mapped
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full font-medium">
                          Unmapped
                        </span>
                      )}
                    </div>
                    {user.student_nis && (
                      <p className="text-xs text-gray-500 mt-1">NIS: {user.student_nis}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No users found for this machine</p>
              </div>
            )
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Server className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Select a machine to view users</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingMachine ? 'Edit Machine' : 'Register New Machine'}
              </h2>
              <button onClick={handleCloseModal} className="p-1 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Machine Code *
                </label>
                <input
                  type="text"
                  value={formData.machine_code}
                  onChange={(e) => setFormData({ ...formData, machine_code: e.target.value })}
                  placeholder="e.g., FP-001"
                  required
                  disabled={!!editingMachine}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
                {editingMachine && (
                  <p className="text-xs text-gray-500 mt-1">Machine code cannot be changed</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Main Building - 1st Floor"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {editingMachine && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'active' | 'inactive' | 'maintenance',
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              )}

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
                  disabled={registerMachine.isPending || updateMachine.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {registerMachine.isPending || updateMachine.isPending
                    ? 'Saving...'
                    : editingMachine
                    ? 'Update'
                    : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

