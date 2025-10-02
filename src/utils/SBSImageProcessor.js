export const SBSImageProcessor = async (originalImage, depthImage) => {

    const leftArray = new Uint8ClampedArray(await originalImage.data.length);
    const rightArray = new Uint8ClampedArray(await originalImage.data.length);

    const maxShift = 10

    for (let y = 0; y < depthImage.height; y++) {
        for (let x = 0; x < depthImage.width; x++) {
            const idx = (y * depthImage.width + x) * 4;
            const depthValue = depthImage.data[idx];
            const shift = ((255 - depthValue) / 255) * maxShift;

            // Left-eye: shift pixels right for nearer objects
            const leftEyeShift = Math.min(depthImage.width - 1, Math.max(0, Math.round(x + shift / 2)));

            // Right-eye: shift pixels left for nearer objects
            const rightEyeShift = Math.min(depthImage.width - 1, Math.max(0, Math.round(x - shift / 2)));

            // Copy pixel from original into shifted positions
            for (let c = 0; c < 4; c++) {
                leftArray[idx + c] = originalImage.data[(y * originalImage.width + leftEyeShift) * 4 + c];
                rightArray[idx + c] = originalImage.data[(y * originalImage.width + rightEyeShift) * 4 + c];
            }

        }

    }

    const leftImageData = new ImageData(leftArray, depthImage.width, depthImage.height);
    const rightImageData = new ImageData(rightArray, depthImage.width, depthImage.height);

    const stereoCanvas = document.createElement("canvas");
    stereoCanvas.width = leftImageData.width * 2;
    stereoCanvas.height = leftImageData.height;
    const steroCtx = stereoCanvas.getContext("2d");
    steroCtx.putImageData(leftImageData, 0, 0);
    steroCtx.putImageData(rightImageData, stereoCanvas.width / 2, 0);
    const stereoImageCanvas = stereoCanvas.toDataURL("image/png")

    return stereoImageCanvas;

}