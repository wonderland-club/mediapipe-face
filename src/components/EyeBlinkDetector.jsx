// 眼睛闭合检测组件 - 用于检测眼睛是否闭合

/**
 * 检测眼睛是否闭合并在canvas上绘制结果
 * @param {Array} landmarks - 人脸特征点数组
 * @param {number} videoWidth - 视频宽度
 * @param {number} videoHeight - 视频高度
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D上下文
 */
const detectEyeBlink = (landmarks, videoWidth, videoHeight, ctx) => {
  // 如果没有检测到人脸特征点或上下文，则不执行任何操作
  if (!landmarks || !ctx) return;

  // 左眼上下眼睑关键点
  const leftEyeTop = landmarks[386]; // 左眼上眼睑
  const leftEyeBottom = landmarks[374]; // 左眼下眼睑

  // 右眼上下眼睑关键点
  const rightEyeTop = landmarks[159]; // 右眼上眼睑
  const rightEyeBottom = landmarks[145]; // 右眼下眼睑

  // 计算眼睛开合度（上下眼睑之间的距离）
  const leftEyeOpenness = leftEyeTop && leftEyeBottom ? 
    Math.abs(leftEyeTop.y - leftEyeBottom.y) : 0;
  const rightEyeOpenness = rightEyeTop && rightEyeBottom ? 
    Math.abs(rightEyeTop.y - rightEyeBottom.y) : 0;

  // 平均眼睛开合度
  const avgEyeOpenness = (leftEyeOpenness + rightEyeOpenness) / 2;

  // 设置眼睛闭合的阈值（可以根据实际情况调整）
  const blinkThreshold = 0.02;
  
  // 判断眼睛是否闭合
  const isLeftEyeClosed = leftEyeOpenness < blinkThreshold;
  const isRightEyeClosed = rightEyeOpenness < blinkThreshold;
  const areBothEyesClosed = isLeftEyeClosed && isRightEyeClosed;

  // 在画布上绘制眼睛状态信息
  // 设置文本样式
  ctx.font = "18px Arial";
  ctx.fillStyle = "#00FFFF"; // 青色
  
  // 绘制眼睛状态
  ctx.fillText(`左眼: ${isLeftEyeClosed ? "闭合" : "睁开"}`, 10, 230);
  ctx.fillText(`右眼: ${isRightEyeClosed ? "闭合" : "睁开"}`, 10, 260);
  
  // 如果两只眼睛都闭合，显示特殊提示
  if (areBothEyesClosed) {
    ctx.font = "22px Arial";
    ctx.fillStyle = "#FF9900"; // 橙色
    ctx.fillText("检测到眨眼！", 10, 300);
  }

  // 绘制眼睛区域
  // 左眼
  if (leftEyeTop && leftEyeBottom) {
    // 绘制左眼区域
    ctx.strokeStyle = isLeftEyeClosed ? "rgba(255,0,0,0.7)" : "rgba(0,255,0,0.7)";
    ctx.lineWidth = 2;
    
    // 简化的眼睛轮廓
    const leftEyeCenter = {
      x: (landmarks[386].x + landmarks[374].x) / 2,
      y: (landmarks[386].y + landmarks[374].y) / 2
    };
    
    const leftEyeWidth = Math.abs(landmarks[263].x - landmarks[362].x) * videoWidth;
    const leftEyeHeight = Math.abs(landmarks[386].y - landmarks[374].y) * videoHeight;
    
    ctx.beginPath();
    ctx.ellipse(
      leftEyeCenter.x * videoWidth,
      leftEyeCenter.y * videoHeight,
      leftEyeWidth / 2,
      leftEyeHeight / 2 + 5,
      0,
      0,
      2 * Math.PI
    );
    ctx.stroke();
  }
  
  // 右眼
  if (rightEyeTop && rightEyeBottom) {
    // 绘制右眼区域
    ctx.strokeStyle = isRightEyeClosed ? "rgba(255,0,0,0.7)" : "rgba(0,255,0,0.7)";
    ctx.lineWidth = 2;
    
    // 简化的眼睛轮廓
    const rightEyeCenter = {
      x: (landmarks[159].x + landmarks[145].x) / 2,
      y: (landmarks[159].y + landmarks[145].y) / 2
    };
    
    const rightEyeWidth = Math.abs(landmarks[133].x - landmarks[33].x) * videoWidth;
    const rightEyeHeight = Math.abs(landmarks[159].y - landmarks[145].y) * videoHeight;
    
    ctx.beginPath();
    ctx.ellipse(
      rightEyeCenter.x * videoWidth,
      rightEyeCenter.y * videoHeight,
      rightEyeWidth / 2,
      rightEyeHeight / 2 + 5,
      0,
      0,
      2 * Math.PI
    );
    ctx.stroke();
  }
};

export { detectEyeBlink };