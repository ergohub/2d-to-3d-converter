import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

// Stream frames from video, one at a time
export const videoToFrames = async (file, fps = 24, onFrame = null) => {
    const ffmpeg = new FFmpeg();
    await ffmpeg.load();

    // Write the uploaded video into FFmpeg FS
    await ffmpeg.writeFile("input.mp4", await fetchFile(file));

    // Determine total frames using ffprobe
    // Note: FFmpeg.wasm doesn't expose ffprobe directly, so we can approximate
    // totalFrames = duration * fps
    const video = document.createElement("video");
    const fileUrl = URL.createObjectURL(file);

    const metadata = await new Promise((resolve) => {
        video.addEventListener("loadedmetadata", () => {
            resolve({
                duration: video.duration,
                width: video.videoWidth,
                height: video.videoHeight,
            });
        });
        video.src = fileUrl;
    });

    const totalFrames = Math.ceil(metadata.duration * fps);
    const frames = [];

    for (let i = 0; i < totalFrames; i++) {
        // Extract a single frame using select filter
        await ffmpeg.exec([
            "-i", "input.mp4",
            "-vf", `select=eq(n\\,${i})`,
            "-vsync", "0",
            `frame${String(i).padStart(4, "0")}.png`
        ]);

        // Read frame from FFmpeg FS
        const data = await ffmpeg.readFile(`frame${String(i).padStart(4, "0")}.png`);
        const blob = new Blob([data.buffer], { type: "image/png" });

        // Convert to base64 for React state or further processing
        const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        // Optionally call a callback (stream to UI or process immediately)
        if (onFrame) onFrame(base64, i);

        // Keep in array if desired (for short videos)
        frames.push(base64);

        // Free memory in FFmpeg FS
        try {
            ffmpeg.FS("unlink", `frame${String(i).padStart(4, "0")}.png`);
        } catch (e) {
            console.warn("Failed to delete frame from FS:", e);
        }
    }

    return frames;
};
