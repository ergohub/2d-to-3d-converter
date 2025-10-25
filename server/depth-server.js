import express from "express";
import multer from "multer";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";
import fs from "fs";
import path from "path";
import cors from "cors";
import { SBSpipeline } from "./utils/sbsPipeline.js";

ffmpeg.setFfmpegPath(ffmpegInstaller.path)
ffmpeg.setFfprobePath(ffprobeInstaller.path);

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

const FRAMES_DIR = "frames";
const OUTPUT_DIR = "output";
const AUDIO_DIR = "audio";

let jobProgress = {};

// FPS Helper function
const getFPS = (filePath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, data) => {
            if (err) return reject(err);
            const stream = data.streams.find(s => s.codec_type === "video");
            if (!stream) return reject("No vide stream fouund");

            const rate = stream.avg_frame_rate || stream.r_frame_rate;
            const [num, den] = rate.split("/").map(Number);
            const fps = den ? num / den : num;
            resolve(fps);
        })
    })
}

//Progress endpoint
app.get("/progress/:jobId", (req, res) => {
    const { jobId } = req.params;
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const interval = setInterval(() => {
        const progress = jobProgress[jobId] || { percent: 0, status: "pending" };
        res.write(`data: ${JSON.stringify(progress)}\n\n`);
        if (progress.status === "done" || progress.status === "error") {
            clearInterval(interval);
            res.end();
        }
    }, 3000);
})

// Upload endpoint
app.post("/upload-video", upload.single("video"), async (req, res) => {
    const inputPath = req.file.path;
    /*
        getFPS(inputPath) // Get Frames per Second
            .then(fps => console.log("FPS:", fps))
    */
    const jobId = Date.now().toString();
    jobProgress[jobId] = {
        id: jobId,
        percent: 0,
        status: "extracting"
    };
    res.json({ jobId });
    const jobDir = path.join(FRAMES_DIR, jobId);
    fs.mkdirSync(jobDir, { recursive: true });

    // Extract audio
    await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .noVideo()
            .save(`${AUDIO_DIR}/${jobId}.aac`)
            .on("end", resolve)
            .on("error", reject);
    });
    // END

    // Extract frames using native ffmpeg
    await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .output(`${jobDir}/frame_%04d.png`)
            .noAudio()
            .on("progress", (p) => {
                console.log(`⏳ Extracting frames: ${p.frames} processed`);
            })
            .on("end", () => {
                console.log("Video Uploaded:", jobDir);
                resolve();
            })
            .on("error", reject)
            .run();
    });



    // Process each frame (depth estimation, SBS, etc.)
    console.log("* - Reading frames from:", jobDir);
    const frameFiles = fs.readdirSync(jobDir);
    console.log("* - Number of frames:", frameFiles.length);

    const outputDir = path.join(OUTPUT_DIR, jobId);
    fs.mkdirSync(outputDir, { recursive: true });

    for (let i = 0; i < frameFiles.length; i++) {
        await SBSpipeline(jobDir, frameFiles[i], outputDir); // pass both jobDir and file
        jobProgress[jobId] = {
            percent: ((i / frameFiles.length) * 100),
            status: `processing frame ${i + 1}/${frameFiles.length}`,
        };
        console.log(jobProgress);
    }

    // Rebuild video
    const outputPath = path.join(OUTPUT_DIR, `${jobId}.mp4`);
    const fps = await getFPS(inputPath);
    console.log(fps);
    await new Promise((resolve, reject) => {
        ffmpeg(`${outputDir}/frame_%04d.png`)
            .inputFPS(fps)
            .input(`${AUDIO_DIR}/${jobId}.aac`) // 👈 bring back the audio
            .outputOptions([
                "-c:v libx264",
                "-pix_fmt yuv420p",
                "-c:a aac", // encode audio
                // "-shortest" // ensure video stops when the shorter stream ends
            ])
            .save(outputPath)
            .on("end",
                resolve(),
                jobProgress[jobId] = { id: jobId, percent: 100, status: "done", video: `/output/${jobId}.mp4` },
                console.log(jobProgress)
            )
            .on("error",
                reject(),
                jobProgress[jobId] = {
                    id: jobId,
                    percent: 0,
                    status: "error", message: "There was a problem processing the video"
                }
            );
    });
    /*
        res.json({
            jobProgress
        });
    */
});

app.listen(4000, () => console.log("Server running on http://localhost:4000"));
