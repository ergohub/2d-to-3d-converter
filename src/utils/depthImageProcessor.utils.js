
export const DepthImageProcessor = async (RawDepthImage) => {
    // console.log(RawDepthImage);
    const imageDataArray = new Uint8ClampedArray(RawDepthImage.width * RawDepthImage.height * 4);

    for (let i = 0; i < RawDepthImage.data.length; i++) {
        const value = RawDepthImage.data[i]; // grayscale value
        imageDataArray[i * 4 + 0] = value; // R
        imageDataArray[i * 4 + 1] = value; // G
        imageDataArray[i * 4 + 2] = value; // B
        imageDataArray[i * 4 + 3] = 255;   // A (fully opaque)
    }

    return imageDataArray;
}