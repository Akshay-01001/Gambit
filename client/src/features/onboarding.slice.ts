import { createSlice } from "@reduxjs/toolkit";

export interface FormState {
    currentStep: number,
    formData: {
        username: string,
        country: string,
        avatar_url: string
        image: File | null
    }
}

const initialState: FormState = {
    currentStep: 1,
    formData: {
        username: '',
        country: '',
        avatar_url: '',
        image: null
    }
}

export const onboardingSlice = createSlice({
    name: 'onboarding',
    initialState,
    reducers: {
        setFormData(state, action: { payload: Partial<FormState["formData"]> }) {
            state.formData = {
                ...state.formData,
                ...action.payload
            }
        },
        setCurrentStep(state, action: { payload: number }) {
            state.currentStep = action.payload;
        }
    }
});

export const { setFormData, setCurrentStep } = onboardingSlice.actions;
export default onboardingSlice.reducer;