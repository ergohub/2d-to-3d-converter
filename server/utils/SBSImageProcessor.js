// server/utils/SBSImageProcessor.js
import { createCanvas } from "canvas";

import { createImageDataFromArray } from "./sbsPipeline.js";

/**
 * Create a side-by-side stereoscopic image in Node.js
 * @param {object} originalImage - { data: Uint8ClampedArray, width: number, height: number }
 * @param {object} depthImage - { data: Uint8ClampedArray, width: number, height: number }
 * @returns {Buffer} PNG buffer of the stereo SBS image
 */
export const SBSImageProcessor = async (originalImage, depthImage, width, height) => {

    // console.log("Width/Height", width, height);


    // console.log("OGImage in function", originalImage.data)
    // console.log("Depth Image Data in function", depthImage)

    // const { width, height } = depthImage;

    // // Output arrays
    const leftArray = new Uint8ClampedArray(originalImage.data.length); // OG Image data
    const rightArray = new Uint8ClampedArray(originalImage.data.length);
    const maxShift = 5;


    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const depthValue = depthImage.data[idx];
            const shift = ((255 - depthValue) / 255) * maxShift;

            // Shift positions for left and right eyes
            const leftEyeShift = Math.min(width - 1, Math.max(0, Math.round(x + shift / 2)));
            const rightEyeShift = Math.min(width - 1, Math.max(0, Math.round(x - shift / 2)));

            for (let c = 0; c < 4; c++) {
                leftArray[idx + c] = originalImage.data[(y * width + leftEyeShift) * 4 + c];
                rightArray[idx + c] = originalImage.data[(y * width + rightEyeShift) * 4 + c];
            }
        }
    }
    // console.log("Left Array", leftArray)
    // console.log("Right Array", rightArray)


    // Create ImageData-like objects using node-canvas API
    // const leftImageData = ctx.createImageData(width, height);
    // const rightImageData = ctx.createImageData(width, height);
    // leftImageData.data.set(leftArray);
    // rightImageData.data.set(rightArray);

    const leftImageData = createImageDataFromArray(leftArray, width, height)
    const rightImageData = createImageDataFromArray(rightArray, width, height)

    //Create canvases for both eyes
    const stereoCanvas = createCanvas(width * 2, height);
    const stereoCtx = stereoCanvas.getContext("2d");
    // Draw left and right frames side by side
    stereoCtx.putImageData(leftImageData, 0, 0);
    stereoCtx.putImageData(rightImageData, stereoCanvas.width / 2, 0);

    // Return as PNG buffer (instead of DataURL)
    const stereoImageCanvas = stereoCanvas.toBuffer("image/png");

    // console.log("SBS Data from Image Processor:", stereoImageCanvas)
    return stereoImageCanvas;
};
