import { Container, Row, Col } from "react-bootstrap";
import logo from "../assets/Mga__1_-removebg-preview.png";

import "bootstrap/dist/css/bootstrap.min.css";

export const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        {/* First Row: Logo + Dev Text */}
        <Row className="align-items-center mb-3">
          <Col xs={12} md={6} className="text-start">
            <img src={logo} alt="Logo" className="footer-logo" />
          </Col>
          <Col xs={12} md={6} className="text-center text-md-end mt-3 mt-md-0">
            <span style={{ fontSize: "16px", fontWeight: "500" }}>
              Omga-Solutions Dev
            </span>
          </Col>
        </Row>

        {/* Second Row: Social Icons + Copyright */}
        <Row className="align-items-center">
          <Col xs={12} md={6} className="text-center text-md-start mt-3 mt-md-0">
            <p>© 2025. All Rights Reserved. Owned by Omga-Solutions Dev</p>
          </Col>

        
        </Row>
      </Container>
    </footer>
  );
};