const Categoria = require("./categoria.js");
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

  Categoria.select(fields, target)
    .then((rows, fields) => {
      res.status(200).json(rows);
    })
    .catch((err) => {
      console.log("ERRO: linha 34 categoria_routes " + err);
      res.status(500).send({
        erro: err,
      });
    });
});

router.get("/getCategoriesWithResponsibles", function (req, res) {
  Categoria.getCategoriesWithResponsibles()
    .then((rows, fields) => {
      res.status(200).json(rows);
    })
    .catch((err) => {
      console.log("ERRO: getCategoriesWithResponsibles " + err);
      res.status(500).send({
        erro: err,
      });
    });
});


//==================================================================================
//  Cadastro
//==================================================================================
router.post("/", function (req, res) {
  Categoria.insert(req.body)
    .then((rows, fields) => {
      res.status(201).json({
        message: "sucesso!",
        rows: rows,
        fields: fields,
      });
    })
    .catch((err) => {
      console.log("ERRO: linha 52 categoria_routes" + err);
      res.status(500).send({
        message: "Erro!",
      });
    });
});

//==================================================================================
//  Update
//==================================================================================
router.put("/", function (req, res) {
  Categoria.update(req.body)
    .then((rows, fields) => {
      res.json(rows);
      res.status(201);
    })
    .catch((err) => {
      console.log("ERRO: " + err);
      res.status(500).send({
        erro: String(err),
      });
    });
});

//==================================================================================
//  Busca  pelo id
//==================================================================================
router.get("/:id", function (req, res) {
  Categoria.select(null, [
    {
      name: "id",
      value: req.params.id,
    },
  ])
    .then((rows, fields) => {
      res.status(200).json(rows);
    })
    .catch((err) => {
      console.log("ERRO: linha 84 categoria_routes" + err);
      res.status(500).send({
        erro: err,
      });
    });
});

router.get("/projeto/:id", function (req, res) {
  Categoria.selectProjeto(req.params.id)
    .then((rows, fields) => {
      res.status(200).json(rows);
    })
    .catch((err) => {
      res.status(500).send({
        erro: err,
      });
    });
});

module.exports = router;
