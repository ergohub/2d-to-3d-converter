const colorImageProcessor = async (file) => {
    // Render original color image
    const imgUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = imgUrl;
    await img.decode();

    const colorCanvas = document.createElement("canvas"); // Create canvas object in memory
    colorCanvas.width = img.width;
    colorCanvas.height = img.height;
    colorCanvas.getContext("2d").drawImage(img, 0, 0);

    const ctxColor = colorCanvas.getContext("2d");
    const colorOutput = ctxColor.getImageData(0, 0, colorCanvas.width, colorCanvas.height);

    return colorOutput;
}

export default colorImageProcessor;