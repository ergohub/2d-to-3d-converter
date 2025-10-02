import { useDispatch, useSelector } from "react-redux";
import { videoFramesSelector } from "../../reducers/video/video.selector";
import { setStereoImage } from "../../reducers/stereoImage/stereoImage.reducer";

import colorImageProcessor from "../../utils/colorImageProcessor.utils";
import { DepthImageProcessor } from "../../utils/depthImageProcessor.utils";
import { SBSImageProcessor } from "../../utils/SBSImageProcessor";
import { modelPrediction } from "../../utils/prediction.uitls";

const ProcessVideoFrames = () => {
    const dispatch = useDispatch();
    const videoFrames = useSelector(videoFramesSelector);

    const handleProcessFrames = async () => {
        if (!videoFrames || videoFrames.length === 0) {
            alert("No frames available in state!");
            return;
        }

        const processedFrames = [];
        for (const frame of videoFrames) {
            // frame is likely ImageData already
            const predictionFromModel = await modelPrediction(frame);
            const processedDepthImage = DepthImageProcessor(predictionFromModel);

            const depthImageData = new ImageData(
                processedDepthImage,
                predictionFromModel.width,
                predictionFromModel.height
            );

            const sideBySideImage = SBSImageProcessor(frame, depthImageData);
            processedFrames.push(sideBySideImage);
        }

        // ✅ Store the SBS frames in redux
        dispatch(setStereoImage(processedFrames));
    };
}

export default ProcessVideoFrames