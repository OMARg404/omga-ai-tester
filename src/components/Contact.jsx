import { Container, Row, Col } from "react-bootstrap";
import contactImg from "../assets/contact-img.svg";
import TrackVisibility from "react-on-screen";
import {
  FaDiscord,
  FaWhatsapp,
  FaEnvelope,
  FaCreditCard,
  FaBitcoin,
  FaMoneyBillWave
} from "react-icons/fa";
import { GiFoxHead } from "react-icons/gi";
import { BsPaypal, BsPhone } from "react-icons/bs";


export const Contact = () => {
  return (
    <section className="contact" id="connect">
      <Container>
        <Row className="align-items-center">
          {/* Contact Illustration */}
          <Col size={12} md={6}>
            <TrackVisibility>
              {({ isVisible }) => (
                <img
                  className={
                    isVisible ? "animate__animated animate__zoomIn" : ""
                  }
                  src={contactImg}
                  alt="Contact"
                />
              )}
            </TrackVisibility>
          </Col>

          {/* Contact Information */}
          <Col size={12} md={6}>
            <TrackVisibility>
              {({ isVisible }) => (
                <div
                  className={
                    isVisible ? "animate__animated animate__fadeIn" : ""
                  }
                >
                  <h2>
                    Get In Touch{" "}
                    <span className="sub-text">
                      — Let’s Build Something Great Together
                    </span>
                  </h2>
                  <p>
                    You can reach me anytime through the following platforms for
                    collaborations, business, or support inquiries.
                  </p>

                  {/* Contact Links */}
                  <div className="contact-links mt-4">
                    <h3>Contact Platforms</h3>

                    <a
                      href="mailto:omga1892@outlook.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-icon"
                    >
                      <FaEnvelope size={28} color="#EA4335" /> Email
                    </a>

                    <a
                      href="https://wa.me/201228810429"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-icon"
                    >
                      <FaWhatsapp size={28} color="#25D366" /> WhatsApp
                    </a>

                    <a
                      href="https://discord.com/users/omga_1"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-icon"
                    >
                      <FaDiscord size={28} color="#7289DA" /> Discord
                    </a>
                  </div>

                  {/* Payment Methods */}
                  <div className="buy-section mt-5">
                    <h3>Payment Methods</h3>

                    {/* Inside Egypt */}
                    <div className="payment-category">
                      <h5>🇪🇬 Inside Egypt</h5>
                      <div className="payment-methods">
                        <a
                          href="https://ipn.eg/S/omar.hassaballa/instapay/9oup7A"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="contact-icon"
                        >
                          <BsPhone size={22} color="#00A4E4" /> InstaPay
                        </a>
                      </div>
                    </div>

                    {/* International Transfers */}
                    <div className="payment-category">
                      <h5>🌍 International Transfers</h5>
                      <div className="payment-methods">
                        <a
                          href="https://paypal.me/OmarAbdelrahman194"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="contact-icon"
                        >
                          <BsPaypal size={22} color="#003087" /> PayPal
                        </a>

                       <a
  href="http://airtm.me/omar3xoni0po"
  target="_blank"
  rel="noopener noreferrer"
  className="contact-icon"
>
  <FaMoneyBillWave size={22} color="#01C3A7" /> AirTM
</a>

                      </div>
                    </div>

                    {/* Crypto Payments */}
                    <div className="payment-category">
                      <h5>💠 Crypto Payments</h5>
                     <p style={{ 
  fontSize: "12px", 
  color: "#c9f1acff", 
  marginBottom: "8px", 
  fontStyle: "italic" 
}}>
  We accept transactions using these cryptocurrencies.
</p>

                      <div className="payment-methods">
                        <a href="#connect" className="contact-icon">
                          <FaBitcoin size={22} color="#F7931A" /> Bitcoin
                        </a>
                        <a href="#connect" className="contact-icon">
                          <GiFoxHead size={22} color="#E2761B" /> MetaMask
                        </a>
                        <a href="#connect" className="contact-icon">
                          <FaCreditCard size={22} color="#4A2FBD" /> Binance Pay
                        </a>
                      </div>
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
};