import React, { useState } from "react";
import formatMessage from "./formatMessage";
import "./ChatMessage.css";
import './chatFormatter.css'
const ChatMessage = ({ sender, text, image, isTyping, isIntro, onEdit }) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");

  // دالة لتنظيف النص من أي HTML خاص باللوغو أو span
  const cleanText = (htmlText) => {
    if (!htmlText) return "";
    let cleaned = htmlText;
    // إزالة أي <span class="chat-logo-container"> وكل اللي جوه
    cleaned = cleaned.replace(/<span class="chat-logo-container">.*?<\/span>/gs, "");
    // إزالة أي HTML tags تانية (اختياري لو تحب)
    cleaned = cleaned.replace(/<\/?[^>]+(>|$)/g, "");
    return cleaned.trim();
  };

  const handleCopy = () => {
    if (!text) return;
    const copyUntil = "**المراجع (الكتب):**";
    let textToCopy = cleanText(text); // نظف النص أول
    const index = textToCopy.indexOf(copyUntil);
    if (index !== -1) textToCopy = textToCopy.slice(0, index);

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const startEdit = () => {
    let initialText = cleanText(text);
    setEditText(initialText);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (onEdit) onEdit(editText);
    setIsEditing(false);
  };

  return (
    <div className={`chat-message ${sender} ${isIntro ? "chat-intro-message" : ""}`}>
      <div className="chat-bubble">
        {isTyping ? (
          <div className="typing-dots">
            <span></span><span></span><span></span>
          </div>
        ) : (
          <>
            {!isIntro && <strong>{sender === "user" ? "Student" : "Abdelgawad AI"}:</strong>}

            {image && (
              <div className="chat-image-container">
                <img className="chat-image" src={image} alt="sent" />
              </div>
            )}

            {!isEditing ? (
              <div className={`chat-text ${isIntro ? "chat-intro-text" : ""}`}>
                <span dangerouslySetInnerHTML={{ __html: formatMessage(text) }} />
                {!isIntro && (
                  <div className="chat-actions">
                    <button className="chat-btn-copy" onClick={handleCopy}>
                      {copied ? "✔" : "📋"}
                    </button>
                    {onEdit && (
                      <button className="chat-btn-edit" onClick={startEdit}>
                        ✏️
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="chat-edit-container">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={3}
                  style={{ width: "100%" }}
                />
                <button onClick={saveEdit} className="chat-btn-edit-save">💾 حفظ</button>
                <button onClick={() => setIsEditing(false)} className="chat-btn-edit-cancel">❌ إلغاء</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
