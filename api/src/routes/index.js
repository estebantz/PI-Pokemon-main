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

const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

const getApiInfo = async (link) => {
  const pokemons = { pokes: null, next: "" };
  await fetch(link)
    .then((res) => res.json())
    .then((data) => {
      return {
        urls: data.results.map((u) => u.url),
        next: data.next,
      };
    })
    .then(async (data) => {
      await Promise.all(
        data.urls.map((u) =>
          fetch(u)
            .then((res) => res.json())
            .catch((err) => {
              throw new Error(err.message);
            })
        )
      )
        .then((data) => {
          pokemons.pokes = data.map((p) => {
            return {
              id: p.id,
              name: p.name,
              life_points: p.stats[0].base_stat,
              attack: p.stats[1].base_stat,
              defense: p.stats[2].base_stat,
              speed: p.stats[5].base_stat,
              height: p.height,
              weight: p.weight,
              img: p.sprites.other.dream_world.front_default,
              types: p.types.map((y) => y.type.name),
            };
          });
        })
        .catch((err) => {
          throw new Error(err.message);
        });
      pokemons.next = data.next;
    })
    .catch((err) => {
      throw new Error(err.message);
    });

  return pokemons;
};

const getDbInfo = async () => {
  const pokemon23 = await Pokemon.findAll({
    include: {
      model: Tipo,
      attributes: ["name"],
      through: {
        attributes: [],
      },
    },
  });
  const mp = await pokemon23.map((d) => {
    return {
      ...d.dataValues,
      tipos: d.tipos.map((t) => t.name),
    };
  });
  return mp;
};

const getAllPokemon = async () => {
  const apiInfo = await getApiInfo("https://pokeapi.co/api/v2/pokemon");
  const apiInfo2 = await getApiInfo(apiInfo.next);
  const sumaapi = apiInfo.pokes.concat(apiInfo2.pokes);

  const dbInfo = await getDbInfo();

  const infoTotal = sumaapi.concat(dbInfo);
  return infoTotal;
};

const getapiIdName = async (valor) => {
  let pokemons = null;
  await fetch(valor)
    .then((res) => res.json())
    .then((data) => {
      pokemons = {
        id: data.id,
        name: data.name,
        life_points: data.stats[0].base_stat,
        attack: data.stats[1].base_stat,
        defense: data.stats[2].base_stat,
        speed: data.stats[5].base_stat,
        height: data.height,
        weight: data.weight,
        img: data.sprites.other.dream_world.front_default,
        types: data.types.map((y) => y.type.name),
      };
    })
    .catch((error) => {
      //   console.log(error);
    });
  return pokemons;
};

const getTypes = async () => {
  const types = await Tipo.findAll();
  if (!types.length) {
    let tipoDb = null;
    await fetch("https://pokeapi.co/api/v2/type")
      .then((res) => res.json())
      .then((data) => {
        tipoDb = data.results.map((t) => {
          return { name: t.name };
        });
      });
    await Tipo.bulkCreate(tipoDb, {
      returning: true,
    });

    let typesCreated = await Tipo.findAll();
    return typesCreated;
  } else {
    return types;
  }
};

const getOnePokemon = async (id) => {
  try {
    if (
      /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(
        id
      )
    ) {
      //expresion regular para diferenciar y validar el id q viene es un UUIDv4 valido
      const pokemon = await Pokemon.findOne({
        where: { id },
        include: {
          model: Tipo,
          attributes: ["name"],
        },
      });
      if (pokemon) {
        return {
          ...pokemon.dataValues,
          tipos: pokemon.dataValues.tipos.map((x) => x.name),
        };
      } else {
        return "no se a encontrado ningun pokemon";
      }
    } else {
      const pokemonApi = await getapiIdName(
        `https://pokeapi.co/api/v2/pokemon/${id}`
      );

      if (pokemonApi) {
        return pokemonApi;
      } else {
        return "no se a encontrado ningun pokemon";
      }
    }
  } catch (error) {
    console.log(error);
  }
};

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

const postPokemon = async (
  name,
  life_points,
  attack,
  defense,
  speed,
  height,
  weight,
  img,
  tipo
) => {
  if (name)
    try {
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
      let tipos = await Tipo.findAll({
        where: {
          name: tipo,
        },
      });
      await pokemon.addTipo(tipos);
      return "pokemon creado correctamente";
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError") {
        return "El Nombre del Pokemon ya Existe";
      }
    }
  else {
    return "falta algun dato";
  }
};

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

    console.log(
      name,
      life_points,
      attack,
      defense,
      speed,
      height,
      weight,
      tipo
    );

    const pok = await postPokemon(
      name,
      life_points,
      attack,
      defense,
      speed,
      height,
      weight,
      img,
      tipo
    );
    res.status(200).send(pok);
  } catch (error) {
    //console.log(error)
    res.status(404).send("el pokemon ya existe");
  }
});

router.post("/types", async (req, res) => {
  try {
    const { name } = req.body;

    console.log(name);

    const agregarTipos = await Tipo.create({ name });
    res.status(200).send(agregarTipos);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      res.status(400).send("El Tipo ya Existe");
    }
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

module.exports = router;
