import React, { useEffect, useRef, useState } from "react";
import "./CameraModal.css";

const CameraModal = ({ show, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [facingMode, setFacingMode] = useState("environment");

  /* تشغيل الكاميرا */
  useEffect(() => {
    if (!show) return;

    startCamera();

    return () => stopCamera();
  }, [show, facingMode]);

  const startCamera = async () => {
    try {
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
    } catch (err) {
      alert("❌ Camera access denied");
    }
  };

  /* إيقاف الكاميرا */
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  /* التقاط صورة */
  const capturePhoto = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);

    const imageData = canvas.toDataURL("image/png");
    onCapture(imageData);
    stopCamera();
    onClose();
  };

  /* عكس الكاميرا */
  const switchCamera = () => {
    setFacingMode((prev) =>
      prev === "environment" ? "user" : "environment"
    );
  };

  if (!show) return null;

  return (
    <div className="camera-overlay">
      <div className="camera-box">
        <video ref={videoRef} autoPlay playsInline />

        <div className="camera-controls">
          <button className="close-btn" onClick={onClose}>
            ✖
          </button>

          <button className="capture-btn" onClick={capturePhoto}>
            📸
          </button>

          <button onClick={switchCamera}>
            🔄
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraModal;
