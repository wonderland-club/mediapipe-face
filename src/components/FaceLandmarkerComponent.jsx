import React, { useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import {
  FACEMESH_TESSELATION,
  FACEMESH_FACE_OVAL,
  FACEMESH_LEFT_EYE,
  FACEMESH_LEFT_EYEBROW,
  FACEMESH_RIGHT_EYE,
  FACEMESH_RIGHT_EYEBROW,
  FACEMESH_LIPS,
} from "../utils/faceMeshConnections";

const FaceLandmarkerComponent = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const faceLandmarkerRef = useRef(null);

  // 初始化模型
  useEffect(() => {
    const initFaceLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
          },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFaceBlendshapes: true,
          outputFaceTransformationMatrixes: true,
        });
        console.log("FaceLandmarker 模型加载完成！");
      } catch (error) {
        console.error("加载 FaceLandmarker 模型时出错：", error);
      }
    };

    initFaceLandmarker();
  }, []);

  // 处理视频流，并绘制特征点和网格
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

        // 设置视频和 canvas 尺寸一致
        video.width = videoWidth;
        video.height = videoHeight;
        const canvas = canvasRef.current;
        canvas.width = videoWidth;
        canvas.height = videoHeight;
        const ctx = canvas.getContext("2d");

        // 清空上一帧绘制内容
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

              // 绘制网格连线
              drawConnections(FACEMESH_TESSELATION, "rgba(0,255,0,0.5)");

              // 其他关键区域
              drawConnections(FACEMESH_RIGHT_EYE, "rgba(0,255,255,0.8)", 2);
              drawConnections(FACEMESH_RIGHT_EYEBROW, "rgba(0,255,255,0.8)", 2);
              drawConnections(FACEMESH_LEFT_EYE, "rgba(0,255,255,0.8)", 2);
              drawConnections(FACEMESH_LEFT_EYEBROW, "rgba(0,255,255,0.8)", 2);
              drawConnections(FACEMESH_FACE_OVAL, "rgba(255,255,255,0.7)", 2);
              drawConnections(FACEMESH_LIPS, "rgba(255,105,180,0.7)", 2);

              // 3. 绘制所有特征点（便于观察）
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
            // 如果没有检测到人脸，显示提示信息
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
  }, []);

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
