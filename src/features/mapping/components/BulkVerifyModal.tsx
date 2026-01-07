import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, User, ArrowRight, CheckCircle } from 'lucide-react';
import type { MappingSuggestion, Student } from '@/types/api';

interface BulkVerifyModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedCount: number;
    selectedItems: MappingSuggestion[]; // Add selected unmapped items
    students: Student[];
    onSubmit: (mappings: Array<{ machineUserId: number; studentNis: string }>) => void;
    isProcessing?: boolean;
}

export const BulkVerifyModal: React.FC<BulkVerifyModalProps> = ({
    isOpen,
    onClose,
    selectedCount,
    selectedItems,
    students,
    onSubmit,
    isProcessing = false,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItemId, setSelectedItemId] = useState<number | null>(
        selectedItems.length > 0 ? selectedItems[0].id : null
    );
    const [mappings, setMappings] = useState<Map<number, string>>(new Map());

    const filteredStudents = useMemo(() =>
        students.filter(student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.nis.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [students, searchTerm]
    );

    const mappedCount = mappings.size;
    const selectedItem = selectedItems.find(item => item.id === selectedItemId);
    const selectedStudentNis = selectedItemId !== null ? mappings.get(selectedItemId) : null;

    // Auto-populate mappings with suggested students when modal opens
    useEffect(() => {
        if (isOpen && selectedItems.length > 0) {
            const initialMappings = new Map<number, string>();
            selectedItems.forEach(item => {
                // If item has suggested student, auto-select it
                if (item.suggested_student && item.suggested_student.nis) {
                    initialMappings.set(item.id, item.suggested_student.nis);
                }
            });
            setMappings(initialMappings);
        }
    }, [isOpen, selectedItems]);

    if (!isOpen) return null;

    const handleStudentSelect = (studentNis: string) => {
        if (selectedItemId !== null) {
            setMappings(prev => {
                const next = new Map(prev);
                next.set(selectedItemId, studentNis);
                return next;
            });

            // Auto-select next unmapped item
            const currentIndex = selectedItems.findIndex(item => item.id === selectedItemId);
            if (currentIndex < selectedItems.length - 1) {
                setSelectedItemId(selectedItems[currentIndex + 1].id);
            }
        }
    };

    const handleSubmit = () => {
        const mappingsArray = Array.from(mappings.entries()).map(([machineUserId, studentNis]) => ({
            machineUserId,
            studentNis,
        }));
        onSubmit(mappingsArray);
    };

    const handleClose = () => {
        setSearchTerm('');
        setSelectedItemId(selectedItems.length > 0 ? selectedItems[0].id : null);
        setMappings(new Map());
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Bulk Manual Mapping</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Map {selectedCount} machine user{selectedCount > 1 ? 's' : ''} to students
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-white/50 rounded-lg transition"
                        disabled={isProcessing}
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="px-6 py-3 bg-gray-50 border-b">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                            Mapping Progress
                        </span>
                        <span className="text-sm font-semibold text-primary">
                            {mappedCount} of {selectedCount} completed
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-primary h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${(mappedCount / selectedCount) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-hidden flex">
                    {/* Left Panel - Unmapped Items */}
                    <div className="w-2/5 border-r flex flex-col">
                        <div className="p-4 border-b bg-gray-50">
                            <h4 className="font-semibold text-gray-900 text-sm">
                                Machine Users ({selectedCount})
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                                Click to select an item to map
                            </p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {selectedItems.map((item) => {
                                const isSelected = item.id === selectedItemId;
                                const isMapped = mappings.has(item.id);
                                const mappedStudent = isMapped ? students.find(s => s.nis === mappings.get(item.id)) : null;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setSelectedItemId(item.id)}
                                        className={`w-full p-3 rounded-lg text-left transition-all ${
                                            isSelected
                                                ? 'bg-primary text-white shadow-md ring-2 ring-primary'
                                                : isMapped
                                                ? 'bg-green-50 border-2 border-green-500'
                                                : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                isSelected ? 'bg-white/20' : isMapped ? 'bg-green-100' : 'bg-gray-100'
                                            }`}>
                                                {isMapped ? (
                                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                                ) : (
                                                    <User className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-medium text-sm truncate ${
                                                    isSelected ? 'text-white' : isMapped ? 'text-green-900' : 'text-gray-900'
                                                }`}>
                                                    {item.machine_user.machine_user_name}
                                                </p>
                                                <p className={`text-xs truncate ${
                                                    isSelected ? 'text-white/80' : isMapped ? 'text-green-700' : 'text-gray-500'
                                                }`}>
                                                    ID: {item.machine_user.machine_user_id}
                                                </p>
                                                {isMapped && mappedStudent && (
                                                    <div className="mt-1.5 flex items-center gap-1">
                                                        <ArrowRight className="w-3 h-3 text-green-600" />
                                                        <p className="text-xs font-medium text-green-800 truncate">
                                                            {mappedStudent.name}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Panel - Student Selection */}
                    <div className="flex-1 flex flex-col">
                        {/* Selected Item Info */}
                        {selectedItem && (
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-b">
                                <p className="text-xs text-gray-600 mb-1">Mapping for:</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">
                                            {selectedItem.machine_user.machine_user_name}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            ID: {selectedItem.machine_user.machine_user_id}
                                        </p>
                                    </div>
                                    {selectedStudentNis && (
                                        <div className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                            ✓ Mapped
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Search */}
                        <div className="p-4 border-b bg-gray-50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search student by name or NIS..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                                />
                            </div>
                        </div>

                        {/* Student List */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {!selectedItem ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <User className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 font-medium">Select a machine user</p>
                                        <p className="text-sm text-gray-400 mt-1">Choose an item from the left to start mapping</p>
                                    </div>
                                </div>
                            ) : filteredStudents.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Search className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 font-medium">No students found</p>
                                        <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                    {filteredStudents.map((student) => {
                                        const isSelected = selectedStudentNis === student.nis;
                                        // Check if this student is already mapped to another machine user
                                        const isAlreadyMapped = Array.from(mappings.entries()).some(
                                            ([machineId, nis]) => nis === student.nis && machineId !== selectedItemId
                                        );
                                        const isDisabled = isAlreadyMapped;

                                        return (
                                            <button
                                                key={student.nis}
                                                onClick={() => !isDisabled && handleStudentSelect(student.nis)}
                                                disabled={isDisabled}
                                                className={`p-3 border-2 rounded-lg text-left transition-all ${
                                                    isSelected
                                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/50 shadow-md'
                                                        : isDisabled
                                                        ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                                                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm cursor-pointer'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                        isSelected ? 'bg-primary/10' : isDisabled ? 'bg-gray-200' : 'bg-gray-100'
                                                    }`}>
                                                        {isDisabled ? (
                                                            <CheckCircle className="w-5 h-5 text-gray-400" />
                                                        ) : (
                                                            <User className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-gray-500'}`} />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`font-medium text-sm truncate ${
                                                            isSelected ? 'text-primary' : isDisabled ? 'text-gray-400' : 'text-gray-900'
                                                        }`}>
                                                            {student.name}
                                                        </p>
                                                        <p className={`text-xs truncate ${
                                                            isDisabled ? 'text-gray-400' : 'text-gray-500'
                                                        }`}>
                                                            NIS: {student.nis} • {student.class_name || student.class_id}
                                                        </p>
                                                        {isDisabled && !isSelected && (
                                                            <p className="text-xs text-gray-400 mt-0.5">
                                                                Already mapped
                                                            </p>
                                                        )}
                                                    </div>
                                                    {isSelected && (
                                                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                                            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-3 p-4 border-t bg-gray-50">
                    <div className="flex items-center gap-2">
                        {mappedCount === selectedCount ? (
                            <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-medium text-sm">All items mapped!</span>
                            </div>
                        ) : (
                            <span className="text-sm text-gray-600">
                                {selectedCount - mappedCount} item{selectedCount - mappedCount > 1 ? 's' : ''} remaining
                            </span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleClose}
                            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                            disabled={isProcessing}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={mappedCount === 0 || isProcessing}
                            className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>Save {mappedCount} Mapping{mappedCount > 1 ? 's' : ''}</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
