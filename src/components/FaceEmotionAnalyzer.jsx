// 表情分析工具函数 - 用于在FaceLandmarkerComponent中分析和绘制表情

/**
 * 分析人脸表情并在canvas上绘制结果
 * @param {Array} landmarks - 人脸特征点数组
 * @param {number} videoWidth - 视频宽度
 * @param {number} videoHeight - 视频高度
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D上下文
 */
const analyzeAndDrawEmotion = (landmarks, videoWidth, videoHeight, ctx) => {
  // 如果没有检测到人脸特征点或上下文，则不执行任何操作
  if (!landmarks || !ctx) return;

  // 分析表情
  // 简单的表情分析逻辑 - 基于嘴巴和眉毛的位置
  // 嘴巴中心点
  const mouthTop = landmarks[13]; // 上唇中心
  const mouthBottom = landmarks[14]; // 下唇中心
  
  // 眉毛位置
  const leftEyebrowOuter = landmarks[282];
  const rightEyebrowOuter = landmarks[52];
  
  // 计算嘴巴开合度
  const mouthOpenness = mouthTop && mouthBottom ? 
    Math.abs(mouthTop.y - mouthBottom.y) : 0;
  
  // 根据特征判断表情
  let emotion = "中性";
  let confidence = 0.5;
  
  // 简单的表情判断逻辑
  if (mouthOpenness > 0.05) {
    emotion = "惊讶";
    confidence = Math.min(mouthOpenness * 5, 0.9);
  } else if (mouthOpenness < 0.02) {
    if (leftEyebrowOuter && rightEyebrowOuter) {
      // 眉毛位置判断
      const eyebrowHeight = (leftEyebrowOuter.y + rightEyebrowOuter.y) / 2;
      if (eyebrowHeight < 0.3) {
        emotion = "生气";
        confidence = 0.7;
      } else {
        emotion = "平静";
        confidence = 0.6;
      }
    }
  }

  // 在画布上绘制表情分析结果
  // 设置文本样式
  ctx.font = "18px Arial";
  ctx.fillStyle = "#FFD700"; // 金色
  
  // 绘制表情分析结果
  ctx.fillText(`表情: ${emotion}`, 10, 120);
  ctx.fillText(`置信度: ${(confidence * 100).toFixed(0)}%`, 10, 150);
  
  // 绘制表情图标 (简单的表情符号)
  ctx.font = "30px Arial";
  let emoticon = "😐"; // 默认表情
  
  switch (emotion) {
    case "惊讶":
      emoticon = "😮";
      break;
    case "生气":
      emoticon = "😠";
      break;
    case "平静":
      emoticon = "😌";
      break;
    default:
      emoticon = "😐";
  }
  
  ctx.fillText(emoticon, 10, 190);
};

export { analyzeAndDrawEmotion };