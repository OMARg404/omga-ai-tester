import React from "react";
import Banner from "./components/Banner";
import ChatBot from "./components/ChatBot";
import { Contact } from "./components/Contact";

import {Footer} from "./components/Footer";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  return (
    <>
      <Banner />
      <ChatBot />
      <Contact />
      <Footer />
    </>
  );
}

export default App;
