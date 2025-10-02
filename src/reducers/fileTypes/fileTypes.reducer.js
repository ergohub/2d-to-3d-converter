import { createSlice } from "@reduxjs/toolkit";

const INITIAL_STATE = {
    fileType: null,
}

const fileTypeSlice = createSlice({
    name: 'fileType',
    initialState: INITIAL_STATE,
    reducers: {
        setFileType(state, action) {
            state.fileType = action.payload
        }
    }
})

export const { setFileType } = fileTypeSlice.actions;

export const fileTypeReducer = fileTypeSlice.reducer;