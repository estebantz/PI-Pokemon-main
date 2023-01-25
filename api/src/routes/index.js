const { Router } = require("express");
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
const axios = require("axios");
const fetch = require("node-fetch");
//const Pokemon = require('../models/Pokemon');
const { Pokemon, Tipo } = require("../db");
const tipo = require("../models/tipo");
const { get } = require("../app");
//const Pokemon = require('../db');
const {
  getAllPokemon,
  getapiIdName,
  getTypes,
  getOnePokemon,
} = require("../helpers");

const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

router.get("/pokemons", async (req, res) => {
  const { name } = req.query;

  if (name) {
    const pokemon = await Pokemon.findOne({
      where: { name },
      include: {
        model: Tipo,
        attributes: ["name"],
      },
    });
    if (pokemon) {
      res.status(200).json({
        ...pokemon.dataValues,
        tipos: pokemon.tipos.map((x) => x.name),
      });
    } else {
      const pokemonApi = await getapiIdName(
        `https://pokeapi.co/api/v2/pokemon/${name}`
      );

      res.status(200).json(pokemonApi);
    }
  } else {
    let pokemonTotal = await getAllPokemon();

    res.status(200).send(pokemonTotal);
  }
});

router.get("/types", async (req, res) => {
  try {
    let types = await getTypes();
    if (types.length) {
      res.status(200).json(types);
    } else {
      res.status(404).send("No se pudieron cargar los tipos");
    }
  } catch (error) {
    console.log(error);
  }
});

router.get("/pokemons/:id", async (req, res) => {
  const { id } = req.params;
  try {
    let pokemon = await getOnePokemon(id);
    res.status(200).send(pokemon);
  } catch (error) {
    console.log(error);
  }
});

router.post("/pokemons", async (req, res) => {
  try {
    const {
      name,
      life_points,
      attack,
      defense,
      speed,
      height,
      weight,
      img,
      tipo,
    } = req.body;

    let pokemon = await Pokemon.create({
      name,
      life_points,
      attack,
      defense,
      speed,
      height,
      weight,
      img,
    });

    tipo?.forEach(async (tipo) => {
      const found = await Tipo.findAll({
        where: {
          name: tipo,
        },
      });
      await pokemon.addTipo(found);
    });

    res.status(200).send("Pokemon creado correctamente");
  } catch (error) {
    console.log("ERROR EN POST POKEMON");
    console.log(error);
    console.log("ERROR EN POST POKEMON");
    res.status(404).send(error.message);
  }
});

router.delete("/types/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const delTipo = await Tipo.destroy({ where: { id: id } });
    res.status(200).send(`Se elimino el tipo :${delTipo}`);
  } catch (error) {
    console.log(error);
    res.status(404).send("Ocurrio un problema");
  }
});

router.delete("/pokemons/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (
      /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(
        id
      )
    ) {
      const delPokemon = await Pokemon.destroy({
        where: { id: id },
      });
      res
        .status(200)
        .send(`EL pokemnon :${delPokemon} ha sido eliminado correctamente`);
    } else {
      res.status(404).send("El id No tiene el formato correcto");
    }
  } catch (err) {
    res.status(404).send("hubo un error al tratar de eliminar el pokemon");
  }
});

router.put("/types/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const putTipo = await Tipo.update({ name: name }, { where: { id: id } });
    res.status(200).send(`Se cambio al tipo :${putTipo}`);
  } catch (error) {
    console.log(error);
    res.status(400).send("No se pudo realizar el cambio");
  }
});

module.exports = router;
