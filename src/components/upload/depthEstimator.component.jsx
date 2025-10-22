import { useEffect } from "react";
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
import { setProgress } from "../../reducers/progress/progress.reducer";

// Selectors
import { fileSelector } from "../../reducers/files/files.selector";
import { fileTypeSelector } from "../../reducers/fileTypes/fileTypes.selector";
import { stereoImageSelector, frameCountSelector, frameTotalSelector } from "../../reducers/stereoImage/stereoImage.selector";
import { uploadVideo } from "../../utils/uploadVideo.utils";
import { progressSelector } from "../../reducers/progress/progress.selector";

const DepthEstimator = () => {
    const dispatch = useDispatch()

    const fileUrl = useSelector(fileSelector);
    const SBSImage = useSelector(stereoImageSelector);
    const frameCount = useSelector(frameCountSelector);
    const totalNoFrames = useSelector(frameTotalSelector)
    const fileType = useSelector(fileTypeSelector);
    const progress = useSelector(progressSelector);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            dispatch(setFileUrl(file))
            dispatch(setFileType(file.type))
            // console.log(file.type);
        }

    }
    /*
        const checkProgress = ((progressURL) => {
    
            useEffect(() => {
                // const currentJob = jobNumber;
    
                const eventSource = new EventSource({ progressURL });
                console.log(eventSource);
    
                eventSource.onmessage = (e) => {
                    const data = JSON.parse(e.data);
                    // dispatch(setProgressURL(data.percent));
                    console.log(data);
    
                    if (data.status === "done") {
                        eventSource.close();
                    }
                }
    
            }, [progressURL])
    
        })
    */
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
            const jobID = await uploadVideo(fileUrl);
            console.log("Job number from upload:", jobID);

            const eventSource = new EventSource(`http://localhost:4000/progress/${jobID}`);
            eventSource.onmessage = (e) => {
                const data = JSON.parse(e.data);
                dispatch(setProgress(data));
                // console.log("Got message:", data);
            };
        }
        /*
        const eventSource = new EventSource(`http://localhost:4000/progress/${jobID}`);
        console.log(eventSource.onmessage);
                    eventSource.onmessage = (e) => {
                        const data = JSON.parse(e)
                        console.log(data);
                    }
                    */

    }




    return (
        <div>
            <input type='file' onChange={handleUpload} />
            <button onClick={processMedia}>Process Video</button><br />
            {progress && <div>Processed: {Math.round(progress.percent)} %</div>}
        </div>
    );
};

export default DepthEstimator;