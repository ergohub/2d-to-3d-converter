export const uploadVideo = async (file) => {

    const formData = new FormData();
    formData.append("video", file); // “video” must match the multer field name

    const response = await fetch("http://localhost:4000/upload-video", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error("Upload failed");
    }

    const { jobId } = await response.json();
    return jobId;
}
