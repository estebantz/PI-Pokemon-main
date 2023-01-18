import React from "react";
import "./card.css";

export default function Card({ name, image, tipos }) {
  console.log(tipos);
  return (
    <div className="card">
      <h1 className="colorName">{name}</h1>
      <div className="tiposespaciado">
        <p className="tittleSub">Tipos : </p>
        {tipos.map((tipo) => (
          <p className="tipos">{tipo}</p>
        ))}
      </div>
      <img src={image} alt="img not found" width="170px" height="220px" />
    </div>
  );
}
