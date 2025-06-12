import { useEffect } from "react";
import {
  FACEMESH_TESSELATION,
  FACEMESH_FACE_OVAL,
  FACEMESH_LEFT_EYE,
  FACEMESH_LEFT_EYEBROW,
  FACEMESH_RIGHT_EYE,
  FACEMESH_RIGHT_EYEBROW,
  FACEMESH_LIPS,
} from "../utils/faceMeshConnections";

const useVideoProcessor = (webcamRef, canvasRef, faceLandmarkerRef) => {
  useEffect(() => {
    let animationFrameId;

    const processVideo = async () => {
      if (
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.readyState === 4 &&
        faceLandmarkerRef.current
      ) {
        const video = webcamRef.current.video;
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        video.width = videoWidth;
        video.height = videoHeight;
        const canvas = canvasRef.current;
        canvas.width = videoWidth;
        canvas.height = videoHeight;
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, videoWidth, videoHeight);

        const nowInMs = Date.now();
        try {
          const results = await faceLandmarkerRef.current.detectForVideo(video, nowInMs);

          if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            results.faceLandmarks.forEach((landmarks) => {
              const drawConnections = (pairs, color, width = 1) => {
                ctx.strokeStyle = color;
                ctx.lineWidth = width;
                pairs.forEach(([i, j]) => {
                  const a = landmarks[i];
                  const b = landmarks[j];
                  if (a && b) {
                    ctx.beginPath();
                    ctx.moveTo(a.x * videoWidth, a.y * videoHeight);
                    ctx.lineTo(b.x * videoWidth, b.y * videoHeight);
                    ctx.stroke();
                  }
                });
              };

              drawConnections(FACEMESH_TESSELATION, "rgba(0,255,0,0.5)");
              drawConnections(FACEMESH_RIGHT_EYE, "rgba(0,255,255,0.8)", 2);
              drawConnections(FACEMESH_RIGHT_EYEBROW, "rgba(0,255,255,0.8)", 2);
              drawConnections(FACEMESH_LEFT_EYE, "rgba(0,255,255,0.8)", 2);
              drawConnections(FACEMESH_LEFT_EYEBROW, "rgba(0,255,255,0.8)", 2);
              drawConnections(FACEMESH_FACE_OVAL, "rgba(255,255,255,0.7)", 2);
              drawConnections(FACEMESH_LIPS, "rgba(255,105,180,0.7)", 2);

              landmarks.forEach((landmark) => {
                const x = landmark.x * videoWidth;
                const y = landmark.y * videoHeight;
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, 2 * Math.PI);
                ctx.fillStyle = "skyblue";
                ctx.fill();
              });
            });
          } else {
            ctx.font = "20px Arial";
            ctx.fillStyle = "yellow";
            ctx.fillText("未检测到人脸", videoWidth / 2 - 80, videoHeight / 2);
          }
        } catch (error) {
          console.error("处理视频帧时出错：", error);
          ctx.font = "16px Arial";
          ctx.fillStyle = "red";
          ctx.fillText(`错误: ${error.message}`, 10, 30);
        }
      }
      animationFrameId = requestAnimationFrame(processVideo);
    };

    animationFrameId = requestAnimationFrame(processVideo);
    return () => cancelAnimationFrame(animationFrameId);
  }, [webcamRef, canvasRef, faceLandmarkerRef]);
};

export default useVideoProcessor;
