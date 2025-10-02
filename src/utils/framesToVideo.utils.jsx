import { FFmpeg } from "@ffmpeg/ffmpeg";
// import { fetchFile } from "@ffmpeg/util";

// import { createFFmpeg } from "@ffmpeg/ffmpeg";

// Convert array of base64 PNGs into an MP4
export const framesToVideo = async (frames, fps = 24) => {
    const ffmpeg = new FFmpeg();
    await ffmpeg.load();

    // const ffmpeg = createFFmpeg({ log: true });
    // await ffmpeg.load();

    // Write frames into ffmpeg virtual FS
    for (let i = 0; i < frames.length; i++) {
        const base64Data = frames[i].split(",")[1];
        const binary = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
        await ffmpeg.writeFile(`frame${String(i).padStart(4, "0")}.png`, binary);
        // console.log(base64Data);
    }
    // Run ffmpeg to convert PNG sequence → mp4
    await ffmpeg.exec([
        "-framerate", String(fps),
        "-i", "frame%04d.png",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "output.mp4"
    ]);

    // Read back video file
    const data = await ffmpeg.readFile("output.mp4");
    const blob = new Blob([data.buffer], { type: "video/mp4" });
    const videoUrl = URL.createObjectURL(blob);

    return videoUrl; // <–– usable in <video src={videoUrl}/>
};
