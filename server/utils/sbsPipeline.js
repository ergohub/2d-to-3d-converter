import { dataUrlToImageData } from "./dataUrlToImageData.utils.js";
import { modelPrediction } from "./prediction.utils.js";
import { DepthImageProcessor } from "./depthImageProcessor.utils.js";
import { SBSImageProcessor } from "./SBSImageProcessor.js";

import { createCanvas } from "canvas";
import fs from "fs";

import path from "path";

export const createImageDataFromArray = (pixelArray, width, height) => {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    const imageData = ctx.createImageData(width, height);
    imageData.data.set(pixelArray);
    return imageData;
}

// Update to take a path and a file name (i.e. new prop and frame respectively)
// Best practice - pass in in directory, file name, out directory
export const SBSpipeline = async (framesDir, inFrame, outDir) => {
    // const framesToProcess = [];

    // console.log(frame);

    // Create the whole path to the file as a single string (string.join)
    const framePath = path.join(framesDir, inFrame);

    const OGImage = await dataUrlToImageData(framePath);

    // const frameColor = frameCanvas.getContext("2d");
    // const OGImage = frameColor.getImageData(0, 0, frameCanvas.width, frameCanvas.height);
    const predictionFromModel = await modelPrediction(framePath);
    const processedDepthImage = await DepthImageProcessor(predictionFromModel);
    const depthImageData = createImageDataFromArray(processedDepthImage, predictionFromModel.width, predictionFromModel.height);
    const sideBySideImage = await SBSImageProcessor(OGImage, depthImageData, OGImage.width, OGImage.height);

    // console.log("processedDepthImage:", depthImageData);
    // console.log("processedDepthImage first 10 values:", depthImageData.slice(0, 10));

    // console.log("Side by Side Image Data:", sideBySideImage)



    //   console.log(stereoBuffer); // Zero byte length

    // // Save to disk
    fs.writeFileSync(path.join(outDir, inFrame), sideBySideImage);

    // return sideBySideImage;
}