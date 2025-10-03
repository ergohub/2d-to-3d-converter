import { createSlice } from "@reduxjs/toolkit";

const INITIAL_STATE = {
    stereoImage: [],
    frameCount: [],
    frameTotal: [],
}

export const stereoImageImageSlice = createSlice({
    name: 'stereo',
    initialState: INITIAL_STATE,
    reducers: {
        setStereoImage(state, action) {
            state.stereoImage = action.payload
        },
        setFrameCount(state, action) {
            state.frameCount.push(action.payload)
        },
        setFrametotal(state, action) {
            state.frameTotal = action.payload
        },
        clearStereoImages(state) {
            state.stereoImage = []
        }
    }
})

export const {
    setStereoImage,
    clearStereoImages,
    setFrameCount,
    setFrametotal,
} = stereoImageImageSlice.actions;

export const steroImageImageReducer = stereoImageImageSlice.reducer;