import React, { useState, useRef, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import TrackVisibility from "react-on-screen";

import CameraModal from "./components-3/CameraModal";
import ChatMessage from "./components-3/ChatMessage";
import ChatInput from "./components-3/ChatInput";
import ImagePreview from "./components-3/ImagePreview";

const introMessages = [
  "Hi! I'm **Abdelgawad AI**, your Chemistry guide. Ask me anything!",
  "🧪 Curious about atoms, molecules, or reactions? I'm Abdelgawad AI, start here!",
  "🌟 Let's explore the world of Chemistry together with Abdelgawad AI!",
  "⚗️ Have a question about elements or compounds? Abdelgawad AI is here to help!",
  "💥 Want to learn some fun Chemistry facts? Ask Abdelgawad AI!",
  "🔬 Need help with acids, bases, or mixtures? Let's dive in with Abdelgawad AI!",
  "🧫 Chemistry can be simple and fun—just ask Abdelgawad AI!",
  "Wondering how reactions happen? Abdelgawad AI can explain!",
  "🧪 Let's discover the magic of chemical bonds together with Abdelgawad AI!",
  "⚡ Ready to explore molecules, reactions, and more? Abdelgawad AI is ready!"
];

function ChatBot() {
  const [messages, setMessages] = useState([
    {
      sender: "Omga AI",
      text: introMessages[Math.floor(Math.random() * introMessages.length)],
      isIntro: true,
    },
  ]);

  const [input, setInput] = useState("");
  const [image, setImage] = useState(null); // DataURL
  const [isTyping, setIsTyping] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= Upload Image ================= */
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target.result);
    reader.readAsDataURL(file);
  };

  /* ================= Send Message ================= */
  const sendMessage = async () => {
    if (!input.trim() && !image) return;

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: input || "", image },
    ]);

    setInput("");
    setIsTyping(true);

    try {
      if (image) {
        const formData = new FormData();
        formData.append("question", input || "جاوب على الصورة");

        const blob = await (await fetch(image)).blob();
        formData.append(
          "image",
          new File([blob], "upload.png", { type: blob.type })
        );

        const res = await fetch("http://localhost:5000/ask", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { sender: "Omga AI", text: data.response },
        ]);
      } else {
        const res = await fetch("http://localhost:5000/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: input }),
        });

        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { sender: "Omga AI", text: data.response },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "Omga AI", text: "❌ Error" },
      ]);
    } finally {
      setIsTyping(false);
      setImage(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
    }
  };

  return (
    <section id="chat">
      <Container>
        <Row>
          <Col>
            <TrackVisibility>
              {() => (
                <div className="chat-box">
                  <div className="chat-messages">
                    {messages.map((m, i) => (
                      <ChatMessage key={i} {...m} />
                    ))}
                    {isTyping && <ChatMessage sender="Omga AI" isTyping />}
                    <div ref={messagesEndRef} />
                  </div>

                  <ImagePreview
                    image={image}
                    onRemove={() => setImage(null)}
                  />

                  <ChatInput
                    input={input}
                    setInput={setInput}
                    sendMessage={sendMessage}
                    fileInputRef={fileInputRef}
                    handleFileUpload={handleFileUpload}
                    handleCameraCapture={() => setShowCamera(true)}
                    image={image}
                    onRemoveImage={() => setImage(null)}
                  />

                  {/* ========= Camera Modal ========= */}
                  <CameraModal
                    show={showCamera}
                    onClose={() => setShowCamera(false)}
                    onCapture={(img) => {
                      setImage(img);
                      setShowCamera(false);
                    }}
                  />
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
