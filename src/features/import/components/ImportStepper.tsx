import React from 'react';
import { Check } from 'lucide-react';

interface Step {
    id: number;
    title: string;
    description?: string;
}

interface ImportStepperProps {
    steps: Step[];
    currentStep: number;
    onStepClick?: (step: number) => void;
}

export const ImportStepper: React.FC<ImportStepperProps> = ({
    steps,
    currentStep,
    onStepClick,
}) => {
    return (
        <div className="w-full">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const isCompleted = step.id < currentStep;
                    const isCurrent = step.id === currentStep;
                    const isClickable = onStepClick && step.id <= currentStep;

                    return (
                        <React.Fragment key={step.id}>
                            {/* Step indicator */}
                            <div className="flex flex-col items-center">
                                <button
                                    onClick={() => isClickable && onStepClick(step.id)}
                                    disabled={!isClickable}
                                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                    transition-all duration-200
                    ${isCompleted
                                            ? 'bg-green-500 text-white'
                                            : isCurrent
                                                ? 'bg-primary text-white ring-4 ring-primary/20'
                                                : 'bg-gray-200 text-gray-500'
                                        }
                    ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                  `}
                                >
                                    {isCompleted ? <Check className="w-5 h-5" /> : step.id}
                                </button>
                                <div className="mt-2 text-center">
                                    <p className={`text-sm font-medium ${isCurrent ? 'text-primary' : 'text-gray-600'}`}>
                                        {step.title}
                                    </p>
                                    {step.description && (
                                        <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>
                                    )}
                                </div>
                            </div>

                            {/* Connector line */}
                            {index < steps.length - 1 && (
                                <div className="flex-1 h-0.5 mx-4 mb-8">
                                    <div
                                        className={`h-full transition-all duration-300 ${step.id < currentStep ? 'bg-green-500' : 'bg-gray-200'
                                            }`}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};
