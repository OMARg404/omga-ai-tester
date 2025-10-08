import React from "react";
import { Container } from "react-bootstrap";
import logo from "../assets/Mga__1_-removebg-preview.png";
import "../App.css";

function Banner() {
  return (
    <section className="banner-section text-center py-5">
      <Container>
        {/* Title Row with Logo on the Left */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <img
            src={logo}
            alt="Omga AI Logo"
            style={{
              width: "200px",
              height: "200px",
              objectFit: "contain",
            }}
          />
          <h1 className="fw-bold text-gradient" style={{ margin: 0 }}>
            <strong
              style={{
                background: "linear-gradient(90deg, #AA367C, #4A2FBD)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: "900",
              }}
            >
              Omga AI
            </strong>{" "}
            — Model Tester
          </h1>
        </div>

        {/* Subtitle */}
        <p className="lead text-light mt-3">
          Explore and evaluate Omga-Solutions AI models for text, vision, and automation. ⚙️🤖
        </p>

        {/* Description with gradient */}
        <p
          className="text-muted mt-2"
          style={{
            background: "linear-gradient(90deg, #AA367C, #4A2FBD)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: "500",
          }}
        >
          Built for developers and researchers — powered by innovation and precision.
        </p>
      </Container>
    </section>
  );
}

export default Banner;
