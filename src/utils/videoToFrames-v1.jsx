import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

export const videoToFrames = async (file, fps = 24) => {
    const ffmpeg = new FFmpeg();
    await ffmpeg.load();

    // Write the uploaded video file into ffmpeg's FS
    await ffmpeg.writeFile("input.mp4", await fetchFile(file));

    // Extract frames into PNG sequence
    await ffmpeg.exec([
        "-i", "input.mp4",
        "-vf", `fps=${fps}`,   // extract at N frames per second (or omit for full native fps)
        "frame%04d.png"
    ]);

    // Read frames back into base64 strings
    const frames = [];
    let i = 1;
    while (true) {
        const frameName = `frame${String(i).padStart(4, "0")}.png`;
        try {
            const data = await ffmpeg.readFile(frameName);
            const blob = new Blob([data.buffer], { type: "image/png" });
            const base64 = await blobToBase64(blob);
            frames.push(base64);
            i++;
        } catch (e) {
            break; // stop when no more frames
        }
    }

    return frames; // array of base64 PNGs → can put in React state
};

// helper: Blob → base64
const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};
