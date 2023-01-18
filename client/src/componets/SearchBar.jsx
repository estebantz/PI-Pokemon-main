import React from "react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { getNamePokemons } from "../actions";

export default function SearchBar({ setCurrentPage }) {
  const dispatch = useDispatch();
  const [name, setName] = useState("");

  function handleInputChange(e) {
    e.preventDefault();
    setName(e.target.value);
    console.log(name);
  }

  function handleSubmit(e) {
    setCurrentPage(1);
    e.preventDefault();
    if (name !== "") {
      dispatch(getNamePokemons(name.toLowerCase()));
      setName("");
    } else {
      alert("Ingrese un nombre válido");
    }
  }

  return (
    <div>
      <input
        className="input1"
        value={name}
        type="text"
        placeholder="Nombre del pokemon"
        onChange={(e) => handleInputChange(e)}
      />
      <button
        className="button5"
        type="submit"
        onClick={(e) => handleSubmit(e)}
      >
        Buscar
      </button>
    </div>
  );
}
