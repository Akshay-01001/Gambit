import React, { createContext, useState } from "react";

type GENDER = "MALE" | "FEMALE" | "OTHER" | null;
export interface OnboardingFormData {
	username: string;
	country: string;
	gender: GENDER;
	avatar_url: string;
	image: File | null;
}

type OnboardingContextType = {
	formData: OnboardingFormData;
	setFormData: React.Dispatch<React.SetStateAction<OnboardingFormData>>;
	handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string, value: any } }) => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	currentStep: number;
	setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
    errors: Record<string, string>;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    validateStep1: () => boolean;
    validateAll: () => boolean;
};

const initialFormData: OnboardingFormData = {
	username: "",
	country: "",
	gender: null,
	avatar_url: "",
	image: null,
};

const OnboardingContext = createContext<OnboardingContextType>({
	formData: initialFormData,
	setFormData: () => { },
	handleChange: () => { },
    handleFileChange: () => { },
	currentStep: 1,
	setCurrentStep: () => { },
    errors: {},
    setErrors: () => { },
    validateStep1: () => false,
    validateAll: () => false
});

export const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {
	const [formData, setFormData] = useState<OnboardingFormData>(initialFormData);
	const [currentStep, setCurrentStep] = useState<number>(1);
    const [errors, setErrors] = useState<Record<string, string>>({});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string, value: any } }) => {
		const { name, value } = e.target;

        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }

		setFormData((prev) => {
			return {
				...prev,
				[name]: value
			}
		});
	}

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files && files.length > 0) {
            const file = files[0];
            const url = URL.createObjectURL(file);
            
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                delete newErrors['avatar_url'];
                return newErrors;
            });

            setFormData(prev => ({
                ...prev,
                [name]: file,
                avatar_url: url
            }));
        }
    }

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.username) newErrors.username = 'Username is required';
        if (!formData.country) newErrors.country = 'Country is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        setErrors(prev => ({ ...prev, ...newErrors }));
        return Object.keys(newErrors).length === 0;
    }

    const validateAll = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.username) newErrors.username = 'Username is required';
        if (!formData.country) newErrors.country = 'Country is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.avatar_url) newErrors.avatar_url = 'Avatar is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

	const value = {
		formData,
		currentStep,
		setCurrentStep,
		setFormData,
		handleChange,
        handleFileChange,
        errors,
        setErrors,
        validateStep1,
        validateAll
	};

	return (
		<OnboardingContext.Provider value={value}>
			{children}
		</OnboardingContext.Provider>
	);
};

export default OnboardingContext;
