export const UploadFrame = async (frameBase64, index) => {
    const blob = await (await fetch(frameBase64)).blob();
    const formData = new FormData();
    formData.append("frame", blob, `frames${index}.png`);
    formData.append("index", index);

    await fetch("http://localhost:4000/upload-frame", {
        method: "POST",
        body: formData,
    });
};