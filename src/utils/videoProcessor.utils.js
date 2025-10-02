import { VideoToFrames, VideoToFramesMethod } from "../utils/videoToFrams";
const videoFrameProcessor = async (file) => {

    const fileUrl = URL.createObjectURL(file);
    const frames = await VideoToFrames.getFrames(
        fileUrl,
        5, // number of frames to extract
        VideoToFramesMethod.totalFrames
    );

    // setStatus("IDLE");
    return frames;
}

export default videoFrameProcessor;

