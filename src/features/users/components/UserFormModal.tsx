import React, { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Shield, CheckSquare } from 'lucide-react';
import type { SystemUser, CreateUserRequest, UpdateUserRequest } from '@/types/api';

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateUserRequest | UpdateUserRequest) => void;
    user?: SystemUser | null;
    isProcessing?: boolean;
}

const ROLES = [
    { value: 'admin', label: 'Admin', color: 'red' },
    { value: 'teacher', label: 'Teacher', color: 'blue' },
    { value: 'staff', label: 'Staff', color: 'green' },
] as const;

const PERMISSIONS = [
    { value: 'read', label: 'Read' },
    { value: 'write', label: 'Write' },
    { value: 'delete', label: 'Delete' },
    { value: 'admin', label: 'Admin' },
] as const;

export const UserFormModal: React.FC<UserFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    user,
    isProcessing = false,
}) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'teacher' as 'admin' | 'teacher' | 'staff',
        permissions: [] as string[],
        is_active: true,
    });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                email: user.email,
                password: '',
                role: user.role,
                permissions: user.permissions || [],
                is_active: user.is_active,
            });
        } else {
            setFormData({
                username: '',
                email: '',
                password: '',
                role: 'teacher',
                permissions: ['read'],
                is_active: true,
            });
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (user) {
            // Update user - exclude username and only include password if provided
            const updateData: UpdateUserRequest = {
                email: formData.email,
                role: formData.role,
                permissions: formData.permissions,
                is_active: formData.is_active,
            };
            if (formData.password) {
                updateData.password = formData.password;
            }
            onSubmit(updateData);
        } else {
            // Create user
            const createData: CreateUserRequest = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                permissions: formData.permissions,
                is_active: formData.is_active,
            };
            onSubmit(createData);
        }
    };

    const handlePermissionToggle = (permission: string) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permission)
                ? prev.permissions.filter(p => p !== permission)
                : [...prev.permissions, permission]
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">
                                {user ? 'Edit User' : 'Create New User'}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {user ? 'Update user information' : 'Add a new system user'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/50 rounded-lg transition"
                        disabled={isProcessing}
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-6">
                        {/* Username - only for create */}
                        {!user && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Username *
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter username"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email *
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="user@example.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password {user ? '(leave blank to keep current)' : '*'}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder={user ? 'Enter new password (optional)' : 'Enter password'}
                                    required={!user}
                                />
                            </div>
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Shield className="w-4 h-4 inline mr-1" />
                                Role *
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {ROLES.map((role) => (
                                    <button
                                        key={role.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: role.value })}
                                        className={`p-3 border-2 rounded-lg transition ${
                                            formData.role === role.value
                                                ? `border-${role.color}-500 bg-${role.color}-50 ring-2 ring-${role.color}-200`
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <p className={`text-sm font-semibold ${
                                            formData.role === role.value ? `text-${role.color}-700` : 'text-gray-700'
                                        }`}>
                                            {role.label}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Permissions */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <CheckSquare className="w-4 h-4 inline mr-1" />
                                Permissions
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {PERMISSIONS.map((permission) => (
                                    <label
                                        key={permission.value}
                                        className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.permissions.includes(permission.value)}
                                            onChange={() => handlePermissionToggle(permission.value)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">{permission.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Active Status</p>
                                <p className="text-xs text-gray-600">Enable or disable user access</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                            disabled={isProcessing}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>{user ? 'Update User' : 'Create User'}</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

