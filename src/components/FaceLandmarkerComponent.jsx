import React, { useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import {
  FACEMESH_FACE_OVAL,
  FACEMESH_LIPS,
} from "../utils/faceMeshConnections";
import { analyzeAndDrawEmotion } from "./FaceEmotionAnalyzer";
import { detectEyeBlink } from "./EyeBlinkDetector";

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
          outputFacialTransformationMatrixes: true,
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
              // 面部轮廓 - 白色
              ctx.strokeStyle = "rgba(255,255,255,0.7)";
              ctx.lineWidth = 2;
              FACEMESH_FACE_OVAL.forEach(([i, j]) => {
                const pointA = landmarks[i];
                const pointB = landmarks[j];
                if (pointA && pointB) {
                  const xA = pointA.x * videoWidth;
                  const yA = pointA.y * videoHeight;
                  const xB = pointB.x * videoWidth;
                  const yB = pointB.y * videoHeight;
                  ctx.beginPath();
                  ctx.moveTo(xA, yA);
                  ctx.lineTo(xB, yB);
                  ctx.stroke();
                }
              });

              // 嘴唇 - 粉色
              ctx.strokeStyle = "rgba(255,105,180,0.7)";
              FACEMESH_LIPS.forEach(([i, j]) => {
                const pointA = landmarks[i];
                const pointB = landmarks[j];
                if (pointA && pointB) {
                  const xA = pointA.x * videoWidth;
                  const yA = pointA.y * videoHeight;
                  const xB = pointB.x * videoWidth;
                  const yB = pointB.y * videoHeight;
                  ctx.beginPath();
                  ctx.moveTo(xA, yA);
                  ctx.lineTo(xB, yB);
                  ctx.stroke();
                }
              });

              // 3. 绘制所有特征点（便于观察）
              landmarks.forEach((landmark) => {
                const x = landmark.x * videoWidth;
                const y = landmark.y * videoHeight;
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, 2 * Math.PI);
                ctx.fillStyle = "skyblue";
                ctx.fill();
              });
              
              // 调用表情分析函数
              analyzeAndDrawEmotion(landmarks, videoWidth, videoHeight, ctx);
              
              // 调用眼睛闭合检测函数
              detectEyeBlink(landmarks, videoWidth, videoHeight, ctx);
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
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 5, backgroundColor: "rgba(0,0,0,0.5)", padding: "5px 10px", borderRadius: "5px", color: "white" }}>
        <h3 style={{ margin: "5px 0" }}>表情分析</h3>
      </div>
      <div style={{ position: "absolute", top: 10, right: 10, zIndex: 5, backgroundColor: "rgba(0,0,0,0.5)", padding: "5px 10px", borderRadius: "5px", color: "white" }}>
        <h3 style={{ margin: "5px 0" }}>眼睛闭合检测</h3>
      </div>
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
