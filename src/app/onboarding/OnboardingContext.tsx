'use client';

import React, { createContext, useContext, useState } from 'react';

const steps = [
    'Create Workspace',
    'Connect Channels',
    'Contact Form',
    'Services',
    'Operating Hours',
    'Activation',
];

interface OnboardingContextType {
    activeStep: number;
    setActiveStep: (step: number) => void;
    steps: string[];
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
    const [activeStep, setActiveStep] = useState(0);

    return (
        <OnboardingContext.Provider value={{ activeStep, setActiveStep, steps }}>
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    const context = useContext(OnboardingContext);
    if (context === undefined) {
        throw new Error('useOnboarding must be used within an OnboardingProvider');
    }
    return context;
}
