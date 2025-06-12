import React, { useRef } from "react";
import Webcam from "react-webcam";
import useFaceLandmarker from "../hooks/useFaceLandmarker";
import useVideoProcessor from "../hooks/useVideoProcessor";

const FaceLandmarkerComponent = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const faceLandmarkerRef = useFaceLandmarker();

  useVideoProcessor(webcamRef, canvasRef, faceLandmarkerRef);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "640px",
        height: "480px",
        margin: "0 auto",
        border: "2px solid #ccc",
        overflow: "hidden",
      }}
    >
      <Webcam
        audio={false}
        ref={webcamRef}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          zIndex: 1,
          width: "100%",
          height: "auto",
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          zIndex: 3,
          width: "100%",
          height: "auto",
          backgroundColor: "transparent",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export default FaceLandmarkerComponent;
