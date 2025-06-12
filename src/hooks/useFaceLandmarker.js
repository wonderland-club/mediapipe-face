import { useRef, useEffect } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

const useFaceLandmarker = () => {
  const faceLandmarkerRef = useRef(null);

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

  return faceLandmarkerRef;
};

export default useFaceLandmarker;
