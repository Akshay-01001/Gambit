import React, { createContext, useState } from "react";

type GENDER = "male" | "female" | "other" | null;

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
	handleChanga: (e: React.ChangeEvent<HTMLInputElement>) => void
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
	setFormData: () => {},
	handleChanga: () => {}
});

const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {
	const [formData, setFormData] = useState<OnboardingFormData>(initialFormData);

	const handleChanga = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;

		setFormData((prev) => {
			return {
				...prev,
				[name]: value
			}
		});
	}

	
	const value = {
		formData,
		setFormData,
		handleChanga
	};

	return (
		<OnboardingContext.Provider value={value}>
			{children}
		</OnboardingContext.Provider>
	);
};

export default OnboardingProvider;
