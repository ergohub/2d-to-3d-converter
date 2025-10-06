// import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

// Utils
import { modelPrediction } from "../../utils/prediction.utils";
// import { dataUrlToImageData } from "../../utils/dataUrlToImageData.utils";
import { framesToVideo } from "../../utils/framesToVideo.utils";
// import { videoToFrames } from "../../utils/videoToFrames";
import colorImageProcessor from "../../utils/colorImageProcessor.utils";
import { DepthImageProcessor } from "../../utils/depthImageProcessor.utils";
import { SBSImageProcessor } from "../../utils/SBSImageProcessor";
import { StreamVideoToSBS } from "../../utils/streamVideoToSBS.utils";


// Reducers
import { setFileUrl } from "../../reducers/files/files.reducer";
import { setFileType } from "../../reducers/fileTypes/fileTypes.reducer";
// import { setVideoFrames } from "../../reducers/videoFrames/videoFrame.reducer";
import { setStereoImage } from "../../reducers/stereoImage/stereoImage.reducer";

// Selectors
import { fileSelector } from "../../reducers/files/files.selector";
import { fileTypeSelector } from "../../reducers/fileTypes/fileTypes.selector";
import { videoFrameSelector } from "../../reducers/videoFrames/videoFrame.selector";
import { stereoImageSelector, frameCountSelector, frameTotalSelector } from "../../reducers/stereoImage/stereoImage.selector";

const DepthEstimator = () => {
    const dispatch = useDispatch()

    const fileUrl = useSelector(fileSelector);
    const SBSImage = useSelector(stereoImageSelector);
    const frameCount = useSelector(frameCountSelector);
    const totalNoFrames = useSelector(frameTotalSelector)
    const fileType = useSelector(fileTypeSelector);

    // useEffect(() => {
    //     if (SBSImage && SBSImage.length > 0) {
    //         exportImage();
    //     }
    // }, [SBSImage]);


    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            dispatch(setFileUrl(file))
            dispatch(setFileType(file.type))
            // console.log(file.type);
        }
    }

    const exportVideo = async () => {
        // if (!SBSImage || SBSImage.length === 0) {
        //     alert("No frames to export!");
        //     return;
        // }

        // const videoUrl = await framesToVideo(SBSImage);
        const response = await fetch("http://localhost:4000/build-video");
        const blob = await response.blob();
        const videoURL = URL.createObjectURL(blob)

        const a = document.createElement("a");
        a.href = videoURL;
        a.download = "stereo-video.mp4";
        a.click();

    };

    const exportImage = async () => {
        const imageData = await SBSImage;

        if (!imageData || imageData.length === 0) {
            console.error("No image data available yet!");
            return;
        }

        const res = await fetch(imageData);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        const imageToDownload = document.createElement('a');
        imageToDownload.download = "SBS-image.png";
        imageToDownload.href = url;
        document.body.appendChild(imageToDownload);
        imageToDownload.click();
        document.body.removeChild(imageToDownload);

        URL.revokeObjectURL(url);
    };



    const processMedia = async () => {
        if (!fileUrl || !fileType) {
            alert("Please upload a file first!");
            return;
        }
        if (fileType.startsWith("image/")) {
            // console.log(fileUrl.name)
            const originalImageData = await colorImageProcessor(fileUrl);
            // console.log("Original Image respone: ", originalImageData)
            const predictionFromModel = await modelPrediction(fileUrl);
            const processedDepthImage = await DepthImageProcessor(predictionFromModel);
            const depthImageData = new ImageData(processedDepthImage, predictionFromModel.width, predictionFromModel.height);
            const sideBySideImage = await SBSImageProcessor(originalImageData, depthImageData);
            // console.log(sideBySideImage);
            dispatch(setStereoImage([sideBySideImage]));


        } else if (fileType.startsWith("video/")) {
            await StreamVideoToSBS(fileUrl, 24, dispatch);
            // dispatch(setVideoFrames(videoFrames));
            // await handleVideoFrames(videoFrames);
        }


    };



    return (
        <div>
            <input type='file' onChange={handleUpload} />
            <button onClick={processMedia}>Process Stereo Image</button><br />
            {/* <div>Processing: {videoFrames.length} frames remaining</div> */}
            <div>Processed: {frameCount.length} / {totalNoFrames} frames</div>

            {/* {SBSImage && <img src={SBSImage} width="60%" alt="Stereo Image" />} */}
            {frameCount.length === totalNoFrames && (
                <button onClick={exportVideo}>Download Stereo Video</button>
            )}

        </div>
    );
};

export default DepthEstimator;