import { createSlice } from "@reduxjs/toolkit";

const INITIAL_STATE = {
    fileUrl: null,
}

export const fileSlice = createSlice({
    name: 'files',
    initialState: INITIAL_STATE,
    reducers: {
        setFileUrl(state, action) {
            state.fileUrl = action.payload
        }
    }
})

export const { setFileUrl } = fileSlice.actions;

export const fileReducer = fileSlice.reducer;