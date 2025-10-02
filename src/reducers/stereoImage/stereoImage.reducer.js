import { createSlice } from "@reduxjs/toolkit";

const INITIAL_STATE = {
    stereoImage: [],
}

export const stereoImageImageSlice = createSlice({
    name: 'stereo',
    initialState: INITIAL_STATE,
    reducers: {
        setStereoImage(state, action) {
            state.stereoImage.push(action.payload)
        },
        clearStereoImages(state) {
            state.stereoImage = []
        }
    }
})

export const { setStereoImage, clearStereoImages } = stereoImageImageSlice.actions;

export const steroImageImageReducer = stereoImageImageSlice.reducer;