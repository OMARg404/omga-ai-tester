import React, { useState, useRef, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import "animate.css";
import TrackVisibility from "react-on-screen";
import { FaPaperPlane, FaCamera, FaImage, FaTimesCircle } from "react-icons/fa";

const ChatMessage = ({ sender, text, image, isTyping }) => (
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
          <strong>{sender === "user" ? "You" : "Bot"}:</strong>{" "}
          {text && <span>{text}</span>}
          {image && (
            <div className="chat-image mt-2">
              <img
                src={image}
                alt="uploaded"
                style={{
                  maxWidth: "200px",
                  borderRadius: "10px",
                  boxShadow: "0 0 10px rgba(0,0,0,0.2)",
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  </div>
);

function ChatBot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Hello! I'm Omga-Chat 🤖 — Ask me anything!" },
  ]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const chatBoxRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    if (!messagesEndRef.current) return;
    const chat = messagesEndRef.current.parentElement;
    const targetScroll = messagesEndRef.current.offsetTop;
    const startScroll = chat.scrollTop;
    const distance = targetScroll - startScroll;
    const duration = 800;
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      chat.scrollTop = startScroll + distance * progress;
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() && !image) return;

    const newMessages = [
      ...messages,
      { sender: "user", text: input || "", image: image || null },
    ];
    setMessages(newMessages);
    setInput("");
    setImage(null);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: image
            ? "🖼️ I received your image! It looks great. Want me to analyze it?"
            : `🤖 AI Response: ${input}`,
        },
      ]);
    }, 2000);
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
                    🤖
                  </p>

                  <div className="chat-box" ref={chatBoxRef}>
                    <div className="chat-messages">
                      {messages.map((msg, idx) => (
                        <ChatMessage key={idx} {...msg} />
                      ))}
                      {isTyping && (
                        <ChatMessage sender="bot" isTyping={true} text="" />
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* ✅ معاينة الصورة قبل الإرسال */}
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
