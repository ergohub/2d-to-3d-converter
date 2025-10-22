import { createSlice } from "@reduxjs/toolkit";

const INITIAL_STATE = {
    progress: null,
}

export const progressSlice = createSlice({
    name: 'progress',
    initialState: INITIAL_STATE,
    reducers: {
        setProgress(state, action) {
            state.progress = action.payload
        }
    }

});

export const { setProgress } = progressSlice.actions;

export const progressReducer = progressSlice.reducer;