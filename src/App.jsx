import React from "react";
import Banner from "./components/Banner";
import ChatBot from "./components/ChatBot";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import OMRGrader from "./components/OMRGrader"; // ضيفنا الـ component الجديد

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  return (
    <>
      <Banner />
      <ChatBot />
      <OMRGrader /> {/* هنا تحت الشات بوت */}
      <Contact />
      <Footer />
    </>
  );
}

export default App;
