import { useState } from "react";
import { FaPaperPlane, FaCamera, FaImage, FaTimesCircle } from "react-icons/fa";
import "./ChatInput.css";

const ChatInput = ({
  input,
  setInput,
  sendMessage,
  fileInputRef,
  handleFileUpload,
  handleCameraCapture,
  image,
  onRemoveImage,
}) => {
  const getImageSrc = () => {
    if (!image) return null;
    if (typeof image === "string") return image; // DataURL
    return URL.createObjectURL(image); // File
  };

  return (
    <div className="chat-input-container">
      {/* حقل النص */}
      <input
        type="text"
        className="chat-text-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Type a message or attach a photo..."
      />

      {/* عرض preview للصورة */}
      {image && (
        <div className="chat-input-image-preview mt-2">
          <img src={getImageSrc()} alt="preview" />
          <button onClick={onRemoveImage} title="Remove Image">
            <FaTimesCircle />
          </button>
        </div>
      )}

      {/* ملف رفع الصور */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        hidden
        onChange={handleFileUpload}
      />

      {/* أزرار الرفع والكاميرا والإرسال */}
      <div className="chat-input-buttons mt-2 d-flex gap-2">
        <button
          className="chat-btn-image btn btn-outline-primary"
          title="Upload Image"
          onClick={() => fileInputRef.current.click()}
        >
          <FaImage />
        </button>
        <button
          className="chat-btn-camera btn btn-outline-secondary"
          title="Open Camera"
          onClick={handleCameraCapture}
        >
          <FaCamera />
        </button>
        <button
          className="chat-btn-send btn btn-primary"
          title="Send Message"
          onClick={sendMessage}
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
