import React, { useState, useEffect } from 'react';
import { X, Search, User } from 'lucide-react';
import type { MappingSuggestion, Student } from '@/types/api';

interface ManualMappingModalProps {
    isOpen: boolean;
    onClose: () => void;
    machineUser: MappingSuggestion | null;
    students: Student[];
    onSubmit: (machineUserId: number, studentNis: string) => void;
    isProcessing?: boolean;
}

export const ManualMappingModal: React.FC<ManualMappingModalProps> = ({
    isOpen,
    onClose,
    machineUser,
    students,
    onSubmit,
    isProcessing = false,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

    // Auto-select suggested student when modal opens
    useEffect(() => {
        if (isOpen && machineUser?.suggested_student) {
            setSelectedStudent(machineUser.suggested_student.nis);
        }
    }, [isOpen, machineUser]);

    if (!isOpen || !machineUser) return null;

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.nis.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = () => {
        if (selectedStudent) {
            onSubmit(machineUser.id, selectedStudent);
        }
    };

    const handleClose = () => {
        setSearchTerm('');
        setSelectedStudent(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">Manual Mapping</h3>
                    <button
                        onClick={handleClose}
                        className="p-1 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Machine User Info */}
                <div className="p-4 bg-gray-50 border-b">
                    <p className="text-sm text-gray-600 mb-1">Machine User:</p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">{machineUser.machine_user.machine_user_name}</p>
                            <p className="text-sm text-gray-500">ID: {machineUser.machine_user.machine_user_id}</p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search student by name or NIS..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                    </div>
                </div>

                {/* Student List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {filteredStudents.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No students found</p>
                    ) : (
                        <div className="space-y-2">
                            {filteredStudents.map((student) => (
                                <button
                                    key={student.nis}
                                    onClick={() => setSelectedStudent(student.nis)}
                                    className={`w-full p-3 border rounded-lg text-left transition flex items-center gap-3 ${selectedStudent === student.nis
                                            ? 'border-primary bg-primary/5 ring-2 ring-primary'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <User className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{student.name}</p>
                                        <p className="text-sm text-gray-500">NIS: {student.nis} • {student.class_name || student.class_id}</p>
                                    </div>
                                    {selectedStudent === student.nis && (
                                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-4 border-t">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                        disabled={isProcessing}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedStudent || isProcessing}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium disabled:opacity-50"
                    >
                        {isProcessing ? 'Saving...' : 'Confirm Mapping'}
                    </button>
                </div>
            </div>
        </div>
    );
};
