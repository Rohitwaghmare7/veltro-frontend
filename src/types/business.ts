export interface Service {
    name: string;
    duration: number;
    price: number;
    description?: string;
}

export interface WorkingHours {
    day: string;
    start: string;
    end: string;
    isOpen: boolean;
}

export interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface BusinessData {
    name: string;
    category: string;
    description: string;
    phone: string;
    email: string;
    website: string;
    address: Address;
    emailConnected: boolean;
    contactFormFields: string[];
    workingHours: WorkingHours[];
    services: Service[];
    onboardingStep?: number;
    isSetupComplete?: boolean;
}
