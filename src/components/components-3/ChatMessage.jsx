import React from "react";
import formatMessage from "./formatMessage";
import "./ChatMessage.css";

const ChatMessage = ({ sender, text, image, isTyping, isIntro }) => {
  return (
    <div
      className={`chat-message ${sender} ${isIntro ? "chat-intro-message" : ""}`}
    >
      <div className="chat-bubble">
        {isTyping ? (
          <div className="typing-dots">
            <span></span><span></span><span></span>
          </div>
        ) : (
          <>
            {!isIntro && (
              <strong>{sender === "user" ? "Student" : "Abdelgawad AI"}:</strong>
            )}

            {/* عرض الصورة لو موجودة */}
            {image && (
              <div className="chat-image-container">
                <img
                  className="chat-image"
                  src={image}
                  alt="sent"
                />
              </div>
            )}

            {/* عرض النص */}
            {text && (
              <div
                className={`chat-text ${isIntro ? "chat-intro-text" : ""}`}
                dangerouslySetInnerHTML={{ __html: formatMessage(text) }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
