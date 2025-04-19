import React, { useRef, useEffect } from 'react';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-backend-webgl';

const FaceLandmarker = () => {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const setupCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = stream;
    };

    setupCamera();

    const detectFace = async () => {
      const model = await faceLandmarksDetection.load(
        faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
      );

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const renderPrediction = async () => {
        const predictions = await model.estimateFaces({
          input: video,
        });

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (predictions.length > 0) {
          predictions.forEach((prediction) => {
            const keypoints = prediction.scaledMesh;

            // 绘制检测到的人脸特征点
            for (let i = 0; i < keypoints.length; i++) {
              const [x, y] = keypoints[i];
              ctx.beginPath();
              ctx.arc(x, y, 1 /* radius */, 0, 2 * Math.PI);
              ctx.fill();
            }

            // 计算左右眼 EAR
            const rightEAR = computeEAR(keypoints, RIGHT_EYE_INDICES);
            const leftEAR = computeEAR(keypoints, LEFT_EYE_INDICES);
            const EAR_THRESHOLD = 0.20; // 可根据实际情况微调

            // 判断闭眼
            let closedText = '';
            if (rightEAR < EAR_THRESHOLD && leftEAR < EAR_THRESHOLD) {
              closedText = '双眼闭合';
            } else if (rightEAR < EAR_THRESHOLD) {
              closedText = '右眼闭合';
            } else if (leftEAR < EAR_THRESHOLD) {
              closedText = '左眼闭合';
            }

            if (closedText) {
              ctx.font = '24px Arial';
              ctx.fillStyle = 'red';
              ctx.fillText(closedText, 30, 40);
            }
          });
        }

        requestAnimationFrame(renderPrediction);
      };

      renderPrediction();
    };

    detectFace();
  }, []);

  // EAR 计算函数
  function computeEAR(landmarks, eyeIndices) {
    // 选取6个关键点
    const p1 = landmarks[eyeIndices[0]];
    const p2 = landmarks[eyeIndices[1]];
    const p3 = landmarks[eyeIndices[2]];
    const p4 = landmarks[eyeIndices[3]];
    const p5 = landmarks[eyeIndices[4]];
    const p6 = landmarks[eyeIndices[5]];
    // 欧氏距离
    function dist(a, b) {
      return Math.hypot(a.x - b.x, a.y - b.y);
    }
    // EAR 公式
    return (
      (dist(p2, p6) + dist(p3, p5)) /
      (2.0 * dist(p1, p4))
    );
  }

  // 右眼和左眼的6个点索引（MediaPipe 468点模型）
  const RIGHT_EYE_INDICES = [33, 160, 158, 133, 153, 144];
  const LEFT_EYE_INDICES = [362, 385, 387, 263, 373, 380];

  return (
    <div>
      <video ref={videoRef} style={{ display: 'none' }} />
      <canvas ref={canvasRef} width="640" height="480" />
    </div>
  );
};

export default FaceLandmarker;