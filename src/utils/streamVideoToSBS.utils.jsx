import { FFmpeg } from "@ffmpeg/ffmpeg";
// import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

// import { fetchFile } from "@ffmpeg/util";
import { fetchFile } from "@ffmpeg/util";
import { SBSpipeline } from "./sbsPipeline";
import { setStereoImage } from "../reducers/stereoImage/stereoImage.reducer";

// Helper: convert Blob → base64
const blobToBase64 = (blob) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });

/**
 * Stream frames one by one from a video, process them,
 * and push processed SBS images directly to Redux.
 */
export const StreamVideoToSBS = async (file, fps, dispatch) => {

    // const ffmpeg = createFFmpeg({ log: true });
    // await ffmpeg.load();

    const ffmpeg = new FFmpeg();
    await ffmpeg.load();

    // Write video to FFmpeg FS
    await ffmpeg.writeFile("input.mp4", await fetchFile(file));

    // Get metadata (duration) with a hidden <video>
    const videoEl = document.createElement("video");
    const fileUrl = URL.createObjectURL(file);
    const metadata = await new Promise((resolve) => {
        videoEl.addEventListener("loadedmetadata", () => {
            resolve({
                duration: videoEl.duration,
                width: videoEl.videoWidth,
                height: videoEl.videoHeight,
            });
        });
        videoEl.src = fileUrl;
    });

    const totalFrames = Math.ceil(metadata.duration * fps);

    for (let i = 0; i < totalFrames; i++) {
        const frameName = `frame${String(i).padStart(4, "0")}.png`;

        // Extract just one frame
        await ffmpeg.exec([
            "-i", "input.mp4",
            "-vf", `select=eq(n\\,${i})`,
            "-vsync", "0",
            frameName
        ]);

        // Read the frame
        const data = await ffmpeg.readFile(frameName); // NEW API
        const blob = new Blob([data.buffer], { type: "image/png" });
        const frameBase64 = await blobToBase64(blob);

        // Process with your ONNX/SBS pipeline
        const sbs = await SBSpipeline(frameBase64);

        // Push result directly to Redux
        dispatch(setStereoImage(sbs));

        // Free memory (delete frame from FFmpeg FS)
        ffmpeg.deleteFile(frameName); // NEW API
    }

};
