import { createSlice } from "@reduxjs/toolkit";

interface UserState {
    email: string
    username: string
    avatarUrl: string
    gender: string
    bio: string
    country: string
    isCompletedOnboarding: boolean
    isAuthenticated: boolean
}

const initialState: UserState = {
    email: '',
    username: '',
    avatarUrl: '',
    gender: '',
    bio: '',
    country: '',
    isAuthenticated: false,
    isCompletedOnboarding: false
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser(state, action: { payload: UserState }) {
            return {
                ...state,
                ...action.payload
            }
        }
    }
});

export const { } = userSlice.actions;
export default userSlice.reducer;
