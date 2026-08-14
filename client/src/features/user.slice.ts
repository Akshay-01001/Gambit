import { createSlice } from "@reduxjs/toolkit";

export interface UserState {
    id: string
    email: string
    username: string
    avatarUrl: string
    gender: string
    bio: string
    country: string
    isCompletedOnboarding: boolean
    isVerified: boolean
}

const initialState: UserState = {
    id: '',
    email: '',
    username: '',
    avatarUrl: '',
    gender: '',
    bio: '',
    country: '',
    isCompletedOnboarding: false,
    isVerified: false
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser(state, action: { payload: Partial<UserState> }) {
            return {
                ...state,
                ...action.payload
            }
        }
    }
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;
