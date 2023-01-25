//importo los hooks q voy a usar de react
import React, { useState, useEffect } from "react";
//importo lasa action q voy a usar en este componente
import {
  getPokemons,
  filterPokemonsByTypes,
  getPokemontypes,
  filterCreated,
  orderByname,
  getIdPokemons,
} from "../actions";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Card from "./card";
import Paginado from "./Paginado";
import SearchBar from "./SearchBar";
import "./Home.css";

export default function Home() {
  const dispatch = useDispatch();
  const allPokemons = useSelector((state) => state.pokemons);
  const [orden, setOrden] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pokemonsPerPage, setPokemonsPerPage] = useState(12);
  const indexOfLastPokemons = currentPage * pokemonsPerPage;
  const indexOfFirsttPokemons = indexOfLastPokemons - pokemonsPerPage;
  const currentPokemons = allPokemons.slice(
    indexOfFirsttPokemons,
    indexOfLastPokemons
  );
  const allTypes = useSelector((state) => state.pokemonstypes);

  const settingCurrentPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    dispatch(getPokemons());
    dispatch(getPokemontypes());
    setCurrentPage(1);
  }, []);

  function handleClick(e) {
    e.preventDefault();
    dispatch(getPokemons());
    // var form = document.getElementById("resetearForm");
    // form.reset();
  }

  function handleSort(e) {
    e.preventDefault();
    setCurrentPage(1);
    dispatch(orderByname(e.target.value));
    setOrden(`Ordenado ${e.target.value}`);
  }

  function handleFilterTypes(e) {
    setCurrentPage(1);
    dispatch(filterPokemonsByTypes(e.target.value));
  }

  function handleFilterCreated(e) {
    setCurrentPage(1);
    dispatch(filterCreated(e.target.value));
  }

  return (
    <div className="home-container">
      <Link to="/create" className="crear-pokemon">
        <button className="cta">
          <span className="hover-underline-animation">
            Crea tu pokemon AHORA !!
          </span>
          <svg
            className="svgblanco"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path fill="none" d="M0 0h24v24H0z"></path>
            <path
              fill="currentColor"
              d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z"
            ></path>
          </svg>
        </button>
      </Link>
      <h1 className="pi-pokemon">TU POKEMON </h1>
      <div>
        <button
          type="button"
          class="glow-on-hover"
          onClick={(e) => {
            handleClick(e);
          }}
        >
          RECARGA TU LISTA !
        </button>
      </div>
      <div>
        <select onChange={handleSort}>
          <option value="asc">Ascendete</option>
          <option value="dsc">Descendente</option>
          <option value="az">A - Z</option>
          <option value="za">Z - A</option>
        </select>
        <select onChange={handleFilterTypes}>
          <option value="ALL">Todos</option>
          {allTypes?.map((c) => {
            return <option value={c.name}>{c.name}</option>;
          })}
        </select>

        <select onChange={handleFilterCreated}>
          <option value="All">Todos</option>
          <option value="created">Creados</option>
          <option value="api">Existentes</option>
        </select>
        <SearchBar setCurrentPage={setCurrentPage} />
        <Paginado
          pokemosPerPage={pokemonsPerPage}
          allPokemons={allPokemons.length}
          settingCurrentPage={settingCurrentPage}
          currentPage={currentPage}
        />
        <div className="containerCards">
          {currentPokemons.length > 0 ? (
            currentPokemons?.map((p) => {
              return (
                <Link
                  className="textDecorationNone"
                  key={p.id}
                  to={"/detail/" + p.id}
                >
                  <Card
                    name={p.name}
                    image={p.img}
                    tipos={p.tipos || p.types}
                  />
                </Link>
              );
            })
          ) : (
            <h5>No se encontraron pokemons con esas caracteristicas</h5>
          )}
        </div>
      </div>
    </div>
  );
}
