// Utility to convert a data URL into ImageData
import { createCanvas, loadImage } from "canvas";

export const dataUrlToImageData = async (dataUrl) => {
    try {
        const img = await loadImage(dataUrl);

        const canvas = createCanvas(img.width, img.height);
        const ctx = canvas.getContext("2d");

        // Draw and extract Image data
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, img.width, img.height)

        return imageData
    } catch (error) {
        console.log("Failed to convert to ImageData:", error);
    }
};