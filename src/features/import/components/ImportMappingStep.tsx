import React from 'react';
import { Link2, ArrowRight, AlertTriangle, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ImportMappingStepProps {
    onNext: () => void;
    onBack: () => void;
}

export const ImportMappingStep: React.FC<ImportMappingStepProps> = ({ onNext, onBack }) => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900">
                    Langkah 3: Mapping (Pencocokan ID Mesin ↔ NIS Siswa)
                </h3>
                <p className="text-gray-600 mt-1">
                    Sebelum lanjut ke import log absensi, pastikan semua user mesin sudah ter-mapping ke data siswa.
                </p>
            </div>

            {/* Info Card */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-amber-900">Mengapa perlu Mapping?</p>
                        <ul className="text-sm text-amber-800 mt-2 space-y-1 list-disc list-inside">
                            <li>Mesin hanya mencatat ID internal (misal: ID 195)</li>
                            <li>Database siswa menyimpan NIS (misal: NIS 2024099)</li>
                            <li>Mapping menghubungkan ID mesin → NIS siswa</li>
                            <li>Tanpa mapping, log absensi tidak bisa diproses</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Mapping Actions */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white border rounded-lg p-5 hover:shadow-md transition">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Link2 className="w-5 h-5 text-primary" />
                        </div>
                        <h4 className="font-medium text-gray-900">Auto Mapping</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        Sistem akan mencocokkan nama mesin dengan nama siswa menggunakan fuzzy logic.
                    </p>
                    <button
                        onClick={() => navigate('/mapping')}
                        className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition text-sm font-medium flex items-center justify-center gap-2"
                    >
                        Buka Halaman Mapping
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="bg-white border rounded-lg p-5 hover:shadow-md transition">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <h4 className="font-medium text-gray-900">Lihat Status</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        Cek statistik mapping: berapa user yang sudah ter-mapping dan yang masih pending.
                    </p>
                    <button
                        onClick={() => navigate('/mapping')}
                        className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium flex items-center justify-center gap-2"
                    >
                        Lihat Statistik Mapping
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Note */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                <strong>Catatan:</strong> Langkah ini opsional jika Anda sudah melakukan mapping sebelumnya.
                Klik "Lanjut" untuk melanjutkan ke import log absensi.
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t">
                <button
                    onClick={onBack}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                    ← Kembali
                </button>
                <button
                    onClick={onNext}
                    className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium"
                >
                    Lanjut ke Langkah 4
                </button>
            </div>
        </div>
    );
};
