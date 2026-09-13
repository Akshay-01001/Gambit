import { createSlice } from "@reduxjs/toolkit";
import type { GameData } from "../types/socketEvents";

const initialState = {
    pages: {} as Record<number, GameData[]>,
    totalPages: 0,
    currentPage: 1,
    loading: false
};

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        setLoading(state, action) {
            state.loading = action.payload;
        },
        setPageData(state, action) {
            const { page, games, totalPages } = action.payload;
            state.pages[page] = games;
            state.totalPages = totalPages;
        },
        setCurrentPage(state, action) {
            state.currentPage = action.payload;
        }
    }
});

export const { setLoading, setPageData, setCurrentPage } = gameSlice.actions;
export default gameSlice.reducer;
