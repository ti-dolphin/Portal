const CategoriaAtributo = require("./categoria_atributo.js");
const express = require("express");
const router = express.Router();

//==================================================================================
//  Busca
//==================================================================================
router.get("/", function (req, res) {
  var fields = null;
  var target = null;
  if (req.query.fields) {
    fields = req.query.fields;
  }
  if (req.query.target && req.query.target_value) {
    target = [];
    if (req.query.target.length == req.query.target_value.length) {
      for (var i = 0; i < req.query.target.length; i++) {
        var tmp = {};
        tmp.name = req.query.target[i];
        tmp.value = req.query.target_value[i];
        if (req.query.target_operator) {
          tmp.operator = req.query.target_operator[i];
        } else {
          tmp.operator = "=";
        }
        target.push(tmp);
      }
    }
  }

  CategoriaAtributo.select(fields, target)
    .then((rows, fields) => {
      res.status(200).json(rows);
    })
    .catch((err) => {
      console.log("ERRO: linha 34 categoria_atributo_routes" + err);
      res.status(500).send({
        erro: err,
      });
    });
});

//==================================================================================
//  Cadastro
//==================================================================================
router.post("/", function (req, res) {
  CategoriaAtributo.insert(req.body)
    .then((rows, fields) => {
      res.status(201).json({
        message: "sucesso!",
        rows: rows,
        fields: fields,
      });
    })
    .catch((err) => {
      console.log("ERRO: linha 52 categoria_atributo_routes" + err);
      res.status(500).send({
        message: "Erro!",
      });
    });
});
router.post("/add-responsibles", async function (req, res) {
  const { categoryId, responsibles } = req.body;
  const result = await CategoriaAtributo.addResponsibles(
    categoryId,
    responsibles
  );
  res.status(200).send(result);
});

router.delete("/remove-responsibles", async function (req, res) {
  const { categoryId, responsibles } = req.body;
  const result = await CategoriaAtributo.removeResponsibles(
    categoryId,
    responsibles
  );
  res.status(200).send(result);
});

router.post("/remove-all-responsibles", async function (req, res) {
  const { categorieId } = req.body;
  const result = await CategoriaAtributo.removeAllResponsibles(categorieId);
  res.status(200).send(result);
});

router.post("/catpasta", function (req, res) {
  CategoriaAtributo.consultaCategoriasArquivoPasta(req.body)
    .then((rows, fields) => {
      res.status(201).json({
        message: "sucesso!",
        rows: rows,
        fields: fields,
      });
    })
    .catch((err) => {
      console.log("ERRO: linha 67 categoria_atributo_routes" + err);
      res.status(500).send({
        message: "Erro!",
      });
    });
});

router.post("/atrcatpasta", function (req, res) {
  CategoriaAtributo.consultaAtributosCategoriaPasta(req.body)
    .then((rows, fields) => {
      res.status(201).json({
        message: "sucesso!",
        rows: rows,
        fields: fields,
      });
    })
    .catch((err) => {
      console.log("ERRO: linha 82 categoria_atributo_routes" + err);
      res.status(500).send({
        message: "Erro!",
      });
    });
});

//==================================================================================
//  Update
//==================================================================================
router.put("/", function (req, res) {
  CategoriaAtributo.update(req.body)
    .then((rows, fields) => {
      res.json(rows);
      res.status(201);
    })
    .catch((err) => {
      console.log("ERRO: linha 97 categoria_atributo_routes" + err);
      res.status(500).send({
        erro: String(err),
      });
    });
});

router.get("/categoriasAtributosPasta/:id", function (req, res) {
  CategoriaAtributo.consultaCategoriasAtributosPasta(req.params.id)
    .then((rows, fields) => {
      res.status(200).json(rows);
    })
    .catch((err) => {
      console.log("ERRO: linha 108 categoria_atributo_routes" + err);
      res.status(500).send({
        erro: err,
      });
    });
});

//==================================================================================
//  Busca  pelo id
//==================================================================================
router.get("/:id", function (req, res) {
  CategoriaAtributo.select(null, [
    {
      name: "id",
      value: req.params.id,
    },
  ])
    .then((rows, fields) => {
      res.status(200).json(rows);
    })
    .catch((err) => {
      console.log("ERRO: linha 126 categoria_atributo_routes" + err);
      res.status(500).send({
        erro: err,
      });
    });
});

router.delete("/:id", function (req, res) {
  CategoriaAtributo.delete(req.params.id)
    .then((rows, fields) => {
      res.status(200).json(rows);
    })
    .catch((err) => {
      console.log("ERRO: linha 137 categoria_atributo_routes" + err);
      res.status(500).send({
        erro: err,
      });
    });
});

//   router.post("/notify-responsibles", async function (req, res) {
//     const result = await CategoriaAtributo.notifyResponsibles();
//     res.status(200).send(result);
//   });

module.exports = router;
