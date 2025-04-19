import React from "react";
import "./App.css";
import FaceLandmarkerComponent from "./components/FaceLandmarkerComponent";

function App() {
  return (
    <div className="App">
      <h1>人脸特征点检测</h1>
      <FaceLandmarkerComponent />
    </div>
  );
}

export default App;
