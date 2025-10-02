import { useDispatch, useSelector } from "react-redux";
import { setFileUrl } from "../../reducers/files/files.reducer";
import { fileSelector } from "../../reducers/files/files.selector";

import { setStereoImage } from "../../reducers/stereoImage/stereoImage.reducer";
import { stereoImageSelector } from "../../reducers/stereoImage/stereoImage.selector";

import {
    DPTForDepthEstimation,
    AutoProcessor,
    RawImage,
    interpolate_4d,
} from "@huggingface/transformers";

const DepthEstimator = () => {
    const dispatch = useDispatch()

    const fileUrl = useSelector(fileSelector);
    const SBSImage = useSelector(stereoImageSelector);

    const handleUpload = async () => {

        if (!fileUrl) {
            alert("Please upload a file first!");
            return;
        }

        const model_id = 'Xenova/dpt-hybrid-midas';
        const model = await DPTForDepthEstimation.from_pretrained(model_id);
        const processor = await AutoProcessor.from_pretrained(model_id)

        const image = await RawImage.read(fileUrl);

        // Prep image for model
        const inputs = await processor(image)

        // Run model
        const { predicted_depth } = await model(inputs)

        //Interpolate to original image
        const prediction = (await interpolate_4d(
            predicted_depth.unsqueeze(1),
            {
                size: image.size.reverse(),
                mode: 'bilinear',
            }
        )).squeeze(1);

        // Render original color image
        const imgUrl = URL.createObjectURL(fileUrl);
        const img = new Image();
        img.src = imgUrl;
        await img.decode();

        const colorCanvas = document.createElement("canvas"); // Create canvas object in memory
        colorCanvas.width = img.width;
        colorCanvas.height = img.height;
        colorCanvas.getContext("2d").drawImage(img, 0, 0);

        // Visualise the prediction
        const min = prediction.min().item();
        const max = prediction.max().item();
        const formatted = prediction.sub_(min).div_(max - min).mul_(255).to('uint8');
        const depth = RawImage.fromTensor(formatted);

        // Convert grayscale (1-channel) to RGBA (4-channel)
        const imageDataArray = new Uint8ClampedArray(depth.width * depth.height * 4);
        for (let i = 0; i < depth.data.length; i++) {
            const value = depth.data[i]; // grayscale value
            imageDataArray[i * 4 + 0] = value; // R
            imageDataArray[i * 4 + 1] = value; // G
            imageDataArray[i * 4 + 2] = value; // B
            imageDataArray[i * 4 + 3] = 255;   // A (fully opaque)
        }

        // Set up Left and Right image data arrays
        const ctxColor = colorCanvas.getContext("2d");

        const originalImageData = ctxColor.getImageData(0, 0, colorCanvas.width, colorCanvas.height);
        const depthImageData = new ImageData(imageDataArray, depth.width, depth.height);

        const leftArray = new Uint8ClampedArray(originalImageData.data.length);
        const rightArray = new Uint8ClampedArray(originalImageData.data.length);

        const maxShift = 10

        for (let y = 0; y < depth.height; y++) {
            for (let x = 0; x < depth.width; x++) {
                const idx = (y * depth.width + x) * 4;
                const depthValue = depthImageData.data[idx];
                const shift = ((255 - depthValue) / 255) * maxShift;

                // Left-eye: shift pixels right for nearer objects
                const leftEyeShift = Math.min(depth.width - 1, Math.max(0, Math.round(x + shift / 2)));

                // Right-eye: shift pixels left for nearer objects
                const rightEyeShift = Math.min(depth.width - 1, Math.max(0, Math.round(x - shift / 2)));

                // Copy pixel from original into shifted positions
                for (let c = 0; c < 4; c++) {
                    leftArray[idx + c] = originalImageData.data[(y * depth.width + leftEyeShift) * 4 + c];
                    rightArray[idx + c] = originalImageData.data[(y * depth.width + rightEyeShift) * 4 + c];
                }

            }

        }

        const leftImageData = new ImageData(leftArray, depth.width, depth.height);
        const rightImageData = new ImageData(rightArray, depth.width, depth.height);

        const stereoCanvas = document.createElement("canvas");
        stereoCanvas.width = leftImageData.width * 2;
        stereoCanvas.height = leftImageData.height;
        const steroCtx = stereoCanvas.getContext("2d");
        steroCtx.putImageData(leftImageData, 0, 0);
        steroCtx.putImageData(rightImageData, stereoCanvas.width / 2, 0);
        const stereoImageCanvas = stereoCanvas.toDataURL("image/png")
        dispatch(setStereoImage(stereoImageCanvas));


    };

    return (
        <div>
            <input type='file'
                onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                        dispatch(setFileUrl(file))
                    }
                }
                } />
            <button onClick={handleUpload}>Get Depth Map</button><br />
            {SBSImage && <img src={SBSImage} width="60%" alt="Stereo Image" />}<br />

        </div>
    );
};

export default DepthEstimator;