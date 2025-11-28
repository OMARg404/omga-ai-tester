import React, { useState, useRef, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import "animate.css";
import TrackVisibility from "react-on-screen";
import { FaPaperPlane, FaCamera, FaImage, FaTimesCircle } from "react-icons/fa";

const ChatMessage = ({ sender, text, isTyping }) => (
  <div className={`chat-message ${sender}`}>
    <div className="chat-bubble">
      {isTyping ? (
        <div className="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      ) : (
        <>
          <strong>{sender === "user" ? "Student" : "Omga AI"}:</strong>{" "}
          <div
            className="chat-text"
            style={{ whiteSpace: "pre-line",
  direction: "rtl",
  textAlign: "right",
  unicodeBidi: "plaintext",
  fontFamily: "'Cairo', sans-serif",}}
            dangerouslySetInnerHTML={{ __html: formatMessage(text) }}
          />
        </>
      )}
    </div>
  </div>
);
const formatMessage = (text) => {
  let formatted = text;

  // ** عنوان فرعي **
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<span class="subheading">$1</span>');

  // * نص مائل *
  formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // الخلاصة 💡
  formatted = formatted.replace(/💡\s*(.*)/g, '<div class="highlight">💡 $1</div>');

  // المراجع 📚
  formatted = formatted.replace(/📚\s*(.*)/g, '<div class="references">📚 $1</div>');

  
  // newline -> <br>
  formatted = formatted.replace(/\n/g, "<br>");

  return formatted;
};



function ChatBot() {
  const [messages, setMessages] = useState([
    { sender: "Omga AI", text: "👋 Hello! I'm **Omga-Chat 🤖 — Abdelgawad Edition**  Ask me anything about Chemistry! ⚗️🔥" },
  ]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    if (!messagesEndRef.current) return;
    const chat = messagesEndRef.current.parentElement;
    chat.scrollTop = chat.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

const sendMessage = async () => {
  if (!input.trim() && !image) return;

  const userMessage = { sender: "user", text: input || "" };
  setMessages((prev) => [...prev, userMessage]);
  setInput("");
  setIsTyping(true);

  try {
    let resApi;
    let responseData;

    if (image) {
      const formData = new FormData();
      formData.append("question", input || "جاوب على الصورة");

      const blob = await (await fetch(image)).blob();
      const file = new File([blob], "upload.png", { type: blob.type });
      formData.append("image", file);

      resApi = await fetch("http://localhost:3000/ask", {
        method: "POST",
        body: formData,
      });
    } else {
      resApi = await fetch("http://localhost:3000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });
    }

    const contentType = resApi.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      responseData = await resApi.json();
    } else {
      responseData = { answer: "❌ Unexpected server response." };
    }

    const botText = responseData.response || "🤖 No response from server.";

    setMessages((prev) => [...prev, { sender: "Omga AI", text: botText }]);
  } catch (err) {
    console.error(err);
    setMessages((prev) => [
      ...prev,
      { sender: "Omga AI", text: "❌ Error contacting server." },
    ]);
  } finally {
    setIsTyping(false);
    setImage(null);

    // 🟢 مهم جدًا: إعادة تعيين قيمة input file
    if (fileInputRef.current) fileInputRef.current.value = null;
  }
};

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setImage(imageURL);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      setTimeout(() => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL("image/png");
        setImage(imageData);
        stream.getTracks().forEach((track) => track.stop());
      }, 1500);
    } catch (err) {
      alert("📸 Camera access denied or unavailable.");
    }
  };

  return (
    <section className="project" id="chat">
      <Container>
        <Row>
          <Col size={12}>
            <TrackVisibility>
              {({ isVisible }) => (
                <div
                  className={
                    isVisible ? "animate__animated animate__fadeIn" : ""
                  }
                >
                  <h2>
                    🤖 Chat with{" "}
                    <strong
                      style={{
                        background: "linear-gradient(90deg, #AA367C, #4A2FBD)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontWeight: "900",
                      }}
                    >
                      Omga-Chat
                    </strong>
                  </h2>
                  <p>
                    Ask me anything — powered by{" "}
                    <strong
                      style={{
                        background: "linear-gradient(90deg, #AA367C, #4A2FBD)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontWeight: "900",
                      }}
                    >
                      Omga-Solutions
                    </strong>{" "}
                    🤖 — <em>Abdelgawad-edition</em>
                  </p>

                  <div className="chat-box">
                    <div className="chat-messages">
                      {messages.map((msg, idx) => (
                        <ChatMessage key={idx} {...msg} />
                      ))}
                      {isTyping && <ChatMessage sender="Omga AI" isTyping={true} />}
                      <div ref={messagesEndRef} />
                    </div>

                    {image && (
                      <div
                        className="image-preview"
                        style={{
                          position: "relative",
                          display: "inline-block",
                          marginBottom: "10px",
                          textAlign: "center",
                        }}
                      >
                        <img
                          src={image}
                          alt="preview"
                          style={{
                            maxWidth: "150px",
                            borderRadius: "10px",
                            border: "2px solid #4A2FBD",
                            boxShadow: "0 0 8px rgba(74,47,189,0.6)",
                          }}
                        />
                        <button
                          onClick={() => setImage(null)}
                          title="Remove image"
                          style={{
                            position: "absolute",
                            top: "-8px",
                            right: "-8px",
                            background: "transparent",
                            border: "none",
                            color: "red",
                            fontSize: "22px",
                            cursor: "pointer",
                          }}
                        >
                          <FaTimesCircle />
                        </button>
                      </div>
                    )}

                    <div className="chat-input">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Type a message or attach a photo..."
                      />
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleFileUpload}
                      />
                      <button
                        title="Upload Image"
                        onClick={() => fileInputRef.current.click()}
                      >
                        <FaImage />
                      </button>
                      <button title="Open Camera" onClick={handleCameraCapture}>
                        <FaCamera />
                      </button>
                      <button title="Send" onClick={sendMessage}>
                        <FaPaperPlane />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </TrackVisibility>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

export default ChatBot;
