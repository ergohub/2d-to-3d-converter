import express from "express";
import multer from "multer";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import fs from "fs";
import path from "path";
import cors from "cors";

ffmpeg.setFfmpegPath(ffmpegInstaller.path)

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

const FRAMES_DIR = "frames";
const OUTPUT_DIR = "output";

// Ensure dirs exist
[FRAMES_DIR, OUTPUT_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

// 1️⃣ Upload one processed frame
app.post("/upload-frame", upload.single("frame"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: req.file.filename });
    }
    const { index } = req.body;
    const dest = path.join(FRAMES_DIR, `frame${String(index).padStart(4, "0")}.png`);
    fs.renameSync(req.file.path, dest);
    res.json({ status: "ok" });
});

// 2️⃣ Trigger ffmpeg to combine frames into MP4
app.get("/build-video", (req, res) => {
    const outputPath = path.join(OUTPUT_DIR, "stereo-video.mp4");

    ffmpeg()
        .input(path.join(FRAMES_DIR, "frame%04d.png"))
        .inputFPS(24)
        .videoCodec("libx264")
        .outputOptions(["-pix_fmt yuv420p"])
        .save(outputPath)
        .on("end", () => {
            console.log("Video created:", outputPath)
            res.download(outputPath, "stereo-video.mp4", () => {
                // optional: cleanup frames
                fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
                fs.mkdirSync(FRAMES_DIR);
            })
            // .on("error", (err) => {
            //     console.error("ffmpeg error:", err);
            //     res.status(500).send("Video processing failed");
            // });
        });
});

app.listen(4000, () => console.log("Server running on http://localhost:4000"));
