import { combineReducers } from "@reduxjs/toolkit";

import { fileReducer } from "../reducers/files/files.reducer";
import { videoFrameReducer } from "../reducers/videoFrames/videoFrame.reducer";
import { steroImageImageReducer } from "../reducers/stereoImage/stereoImage.reducer";
import { fileTypeReducer } from "../reducers/fileTypes/fileTypes.reducer";
import { progressReducer } from "../reducers/progress/progress.reducer";

export const rootReducer = combineReducers({
    files: fileReducer,
    video: videoFrameReducer,
    stereos: steroImageImageReducer,
    types: fileTypeReducer,
    progress: progressReducer,
})