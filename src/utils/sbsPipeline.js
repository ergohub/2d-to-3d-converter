import { dataUrlToImageData } from "./dataUrlToImageData.utils";
import { modelPrediction } from "./prediction.utils";
import { DepthImageProcessor } from "./depthImageProcessor.utils";
import { SBSImageProcessor } from "./SBSImageProcessor";

export const SBSpipeline = async (frame) => {
    // const framesToProcess = [];

    // console.log(frame);

    const OGImage = await dataUrlToImageData(frame);
    // console.log(await OGImage)
    // const frameColor = frameCanvas.getContext("2d");
    // const OGImage = frameColor.getImageData(0, 0, frameCanvas.width, frameCanvas.height);

    const predictionFromModel = await modelPrediction(frame);
    const processedDepthImage = await DepthImageProcessor(predictionFromModel);

    const depthImageData = new ImageData(processedDepthImage, predictionFromModel.width, predictionFromModel.height);
    const sideBySideImage = await SBSImageProcessor(OGImage, depthImageData);
    // framesToProcess.push(sideBySideImage)
    // dispatch(setStereoImage(sideBySideImage));

    return sideBySideImage;
}