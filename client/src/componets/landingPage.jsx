import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./landingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();

  const [spinner, setSpiner] = useState(false);

  const ingresar = () => {
    setSpiner(true);
    setTimeout(() => {
      navigate("/home");
    }, 2000);
  };

  return (
    <div className="LandingPage">
      <h1>
        <img
          className="bienvenido"
          src="https://seeklogo.com/images/P/Pokemon-logo-497D61B223-seeklogo.com.png"
          alt="imagenbienvenido"
        />
      </h1>
      {spinner ? (
        <div class="spinner">
          <div class="bounce1"></div>
          <div class="bounce2"></div>
          <div class="bounce3"></div>
        </div>
      ) : (
        <button onClick={ingresar}>
          <button class="primary-button"> Ingresar</button>
        </button>
      )}
    </div>
  );
}
