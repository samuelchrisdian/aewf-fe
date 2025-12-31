import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { ImportStepper, ImportMasterStep, ImportUsersStep, ImportMappingStep, ImportAttendanceStep, ImportBatchHistory } from './components';

const STEPS = [
    { id: 1, title: 'Master Data', description: 'Siswa, Kelas, Guru' },
    { id: 2, title: 'Sync Users', description: 'User Fingerprint' },
    { id: 3, title: 'Mapping', description: 'ID ↔ NIS' },
    { id: 4, title: 'Attendance', description: 'Log Harian' },
];

export const ImportPage: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(1);

    const handleNext = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = () => {
        // Reset to step 1 after completion
        setCurrentStep(1);
    };

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return <ImportMasterStep onNext={handleNext} />;
            case 2:
                return <ImportUsersStep onNext={handleNext} onBack={handleBack} />;
            case 3:
                return <ImportMappingStep onNext={handleNext} onBack={handleBack} />;
            case 4:
                return <ImportAttendanceStep onBack={handleBack} onComplete={handleComplete} />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Upload className="w-5 h-5 text-primary" />
                    </div>
                    Import Data
                </h1>
                <p className="text-gray-600 mt-1">
                    Upload dan kelola data master, user mesin, dan log absensi
                </p>
            </div>

            {/* Wizard Card */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                {/* Stepper */}
                <div className="px-8 py-6 bg-gray-50 border-b">
                    <ImportStepper
                        steps={STEPS}
                        currentStep={currentStep}
                        onStepClick={(step) => setCurrentStep(step)}
                    />
                </div>

                {/* Step Content */}
                <div className="p-6 lg:p-8">
                    {renderCurrentStep()}
                </div>
            </div>

            {/* Batch History */}
            <ImportBatchHistory />
        </div>
    );
};

export default ImportPage;
