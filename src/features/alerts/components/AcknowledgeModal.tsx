import React, { useState, useEffect } from 'react';
import { X, Phone, FileText, Calendar, MessageCircle, CheckSquare } from 'lucide-react';

interface AcknowledgeModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: {
        nis: string;
        name: string;
        class_id: number | string;
        parent_phone?: string;
    } | null;
    onSubmit: (data: {
        phone: string;
        action: string;
        notes: string;
        followUpDate?: string;
    }) => void;
    isProcessing?: boolean;
}

export const AcknowledgeModal: React.FC<AcknowledgeModalProps> = ({
    isOpen,
    onClose,
    student,
    onSubmit,
    isProcessing = false,
}) => {
    const [phone, setPhone] = useState('');
    const [action, setAction] = useState('');
    const [notes, setNotes] = useState('');
    const [followUpDate, setFollowUpDate] = useState('');
    const [errors, setErrors] = useState<{ phone?: string; action?: string; notes?: string }>({});

    // Initialize phone from student data
    useEffect(() => {
        if (student?.parent_phone) {
            setPhone(student.parent_phone);
        } else {
            setPhone('');
        }
    }, [student]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setPhone('');
            setAction('');
            setNotes('');
            setFollowUpDate('');
            setErrors({});
        }
    }, [isOpen]);

    if (!isOpen || !student) return null;

    const validateForm = () => {
        const newErrors: { phone?: string; action?: string; notes?: string } = {};

        // Validate phone
        if (!phone.trim()) {
            newErrors.phone = 'Nomor telepon wajib diisi';
        } else {
            // Remove non-numeric characters for validation
            const cleanPhone = phone.replace(/\D/g, '');
            if (cleanPhone.length < 10) {
                newErrors.phone = 'Nomor telepon minimal 10 digit';
            }
        }

        // Validate action
        if (!action) {
            newErrors.action = 'Action wajib dipilih';
        }

        // Validate notes
        if (!notes.trim()) {
            newErrors.notes = 'Catatan wajib diisi';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        onSubmit({
            phone: phone.trim(),
            action: action,
            notes: notes.trim(),
            followUpDate: followUpDate || undefined,
        });
    };

    const handlePhoneChange = (value: string) => {
        setPhone(value);
        if (errors.phone) {
            setErrors({ ...errors, phone: undefined });
        }
    };

    const handleActionChange = (value: string) => {
        setAction(value);
        if (errors.action) {
            setErrors({ ...errors, action: undefined });
        }
    };

    const handleNotesChange = (value: string) => {
        setNotes(value);
        if (errors.notes) {
            setErrors({ ...errors, notes: undefined });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <MessageCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Acknowledge Alert
                            </h2>
                            <p className="text-sm text-gray-600 mt-0.5">
                                {student.name} ({student.nis})
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Phone Input */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Phone className="w-4 h-4" />
                            Nomor Telepon Orang Tua
                        </label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            placeholder="Contoh: 081234567890"
                            disabled={isProcessing}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed ${
                                errors.phone
                                    ? 'border-red-300 focus:ring-red-200'
                                    : 'border-gray-300 focus:ring-green-200'
                            }`}
                        />
                        {errors.phone && (
                            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                <span className="text-xs">⚠</span> {errors.phone}
                            </p>
                        )}
                        <p className="mt-1.5 text-xs text-gray-500">
                            Format: 08xxx atau 62xxx (tanpa tanda +)
                        </p>
                    </div>

                    {/* Action Dropdown */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <CheckSquare className="w-4 h-4" />
                            Action <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={action}
                            onChange={(e) => handleActionChange(e.target.value)}
                            disabled={isProcessing}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed ${
                                errors.action
                                    ? 'border-red-300 focus:ring-red-200'
                                    : 'border-gray-300 focus:ring-green-200'
                            }`}
                        >
                            <option value="">Pilih Action</option>
                            <option value="contacted_parent">Contacted Parent</option>
                            <option value="scheduled_meeting">Scheduled Meeting</option>
                            <option value="home_visit">Home Visit</option>
                            <option value="counseling">Counseling</option>
                            <option value="other">Other</option>
                        </select>
                        {errors.action && (
                            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                <span className="text-xs">⚠</span> {errors.action}
                            </p>
                        )}
                    </div>

                    {/* Notes Input */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <FileText className="w-4 h-4" />
                            Catatan <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => handleNotesChange(e.target.value)}
                            placeholder="Tulis catatan tindak lanjut atau informasi penting..."
                            rows={4}
                            disabled={isProcessing}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none disabled:bg-gray-50 disabled:cursor-not-allowed ${
                                errors.notes
                                    ? 'border-red-300 focus:ring-red-200'
                                    : 'border-gray-300 focus:ring-green-200'
                            }`}
                        />
                        {errors.notes && (
                            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                <span className="text-xs">⚠</span> {errors.notes}
                            </p>
                        )}
                    </div>

                    {/* Follow-up Date Input (Optional) */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="w-4 h-4" />
                            Tanggal Follow-up <span className="text-gray-400 text-xs">(Opsional)</span>
                        </label>
                        <input
                            type="date"
                            value={followUpDate}
                            onChange={(e) => setFollowUpDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            disabled={isProcessing}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                            <MessageCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Setelah acknowledge:</p>
                                <p>Anda akan diarahkan ke WhatsApp untuk menghubungi orang tua siswa.</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isProcessing}
                            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <MessageCircle className="w-4 h-4" />
                                    Submit & Contact
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

