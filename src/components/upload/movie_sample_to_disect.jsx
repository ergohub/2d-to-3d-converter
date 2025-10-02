import "./styles.css";
import { VideoToFrames, VideoToFramesMethod } from "./VideoToFrame";
import { useState } from "react";
import Loader from "react-loader-spinner";

export default function App() {
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState("IDLE");

  const onInput = async (event) => {
    setImages([]);
    setStatus("LOADING");

    const [file] = event.target.files;
    const fileUrl = URL.createObjectURL(file);
    const frames = await VideoToFrames.getFrames(
      fileUrl,
      30,
      VideoToFramesMethod.totalFrames
    );

    setStatus("IDLE");
    setImages(frames);
  };

  const now = new Date().toDateString();

  return (
    <div className="container">
      <h1>Get frames from video 🎞</h1>
      <p>Upload a video, then click the images you want to download!</p>
      <label>
        {status === "IDLE" ? (
          "Choose file"
        ) : (
          <Loader type="Circles" color="#00BFFF" height={100} width={100} />
        )}
        <input
          type="file"
          className="visually-hidden"
          accept="video/*"
          onChange={onInput}
        />
      </label>

      {images?.length > 0 && (
        <div className="output">
          {images.map((imageUrl, index) => (
            <a
              key={imageUrl}
              href={imageUrl}
              download={`${now}-${index + 1}.png`}
            >
              <span class="visually-hidden">
                Download image number {index + 1}
              </span>
              <img src={imageUrl} alt="" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
