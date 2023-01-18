import React from "react";
import { Link } from "react-router-dom";
import "./landingPage.css";

export default function LandingPage() {
  return (
    <div className="LandingPage">
      <h1>
        <img
          className="bienvenido"
          src="https://seeklogo.com/images/P/Pokemon-logo-497D61B223-seeklogo.com.png"
          alt="imagenbienvenido"
        />
      </h1>
      <Link to="/home">
        <button class="primary-button"> Ingresar</button>
      </Link>
    </div>
  );
}
