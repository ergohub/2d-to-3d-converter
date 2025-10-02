import { createSlice } from "@reduxjs/toolkit";

const INITIAL_STATE = {
    frames: [],
}

export const videoFrameSlice = createSlice({
    name: 'video-frames',
    initialState: INITIAL_STATE,
    reducers: {
        setVideoFrames(state, action) {
            state.frames = action.payload
        }
    }
})

export const { setVideoFrames } = videoFrameSlice.actions;

export const videoFrameReducer = videoFrameSlice.reducer;
