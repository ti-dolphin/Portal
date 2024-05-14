const processoPassoCadastro = require("./processo_passo_cadastro.js");
const express = require("express");
const router = express.Router();
const ProcessoCadastroService = require("../../services/processo_cadastro_service.js");

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

  processoPassoCadastro
    .select(fields, target)
    .then((rows, fields) => {
      res.status(200).json(rows);
    })
    .catch((err) => {
      console.log("ERRO: 34 processo_passo_cadastro_routes " + err);
      res.status(500).send({
        erro: err,
      });
    });
});

router.get("/ordem/:id", function (req, res) {
  processoPassoCadastro
    .getByOrdem(req.params.id)
    .then((rows, fields) => {
      res.status(200).json(rows);
    })
    .catch((err) => {
      console.log("ERRO: 46 processo_passo_cadastro_routes " + err);
      res.status(500).send({
        message: "Erro!",
      });
    });
});

router.get("/passoUnitario/:id", function (req, res) {
  processoPassoCadastro
    .getPassoUnitario(req.params.id)
    .then((rows, fields) => {
      res.status(200).json(rows);
    })
    .catch((err) => {
      console.log("ERRO: 57 processo_passo_cadastro_routes " + err);
      res.status(500).send({
        message: "Erro!",
      });
    });
});

router.get("/verificaPasso/:id", function (req, res) {
  processoPassoCadastro
    .verificaPasso(req.params.id)
    .then((rows, fields) => {
      res.status(200).json(rows);
    })
    .catch((err) => {
      console.log("ERRO: 68 processo_passo_cadastro_routes " + err);
      res.status(500).send({
        message: "Erro!",
      });
    });
});

router.post("/cadastracampospassoantigo", function (req, res) {
  processoPassoCadastro
    .cadastraCamposPassoAntigo(req.body)
    .then((rows, fields) => {
      res.status(201).json({
        message: "sucesso!",
        rows: rows,
        fields: fields,
      });
    })
    .catch((err) => {
      console.log("ERRO: 83 processo_passo_cadastro_routes " + err);
      res.status(500).send({
        message: "Erro!",
      });
    });
});

//==================================================================================
//  Cadastro
//==================================================================================
router.post("/", function (req, res) {
  processoPassoCadastro
    .insert(req.body)
    .then((rows, fields) => {
      res.status(201).json({
        message: "sucesso!",
        rows: rows,
        fields: fields,
      });
    })
    .catch((err) => {
      console.log("ERRO: 101 processo_passo_cadastro_routes " + err);
      res.status(500).send({
        message: "Erro!",
      });
    });
});

router.post("/batch-insert", async function (req, res) {
  const dadosPassos = req.body.dadosPassos;
  const nodes = req.body.nodes;
  const newProcessData = req.body.novoProcesso;
  const processoAnteriorId = req.body.processo_anterior_id;
  const result = await ProcessoCadastroService.insertBatch(dadosPassos, nodes, newProcessData, processoAnteriorId);
  res.status(201).json({
    message: "sucesso!",
    result: result,
  });
});

//==================================================================================
//  Update
//==================================================================================
router.put("/", function (req, res) {
  processoPassoCadastro
    .update(req.body)
    .then((rows, fields) => {
      res.json(rows);
      res.status(201);
    })
    .catch((err) => {
      console.log("ERRO: 116 processo_passo_cadastro_routes " + err);
      res.status(500).send({
        erro: String(err),
      });
    });
});

//==================================================================================
//  Busca  pelo id
//==================================================================================
router.get("/:id", function (req, res) {
  processoPassoCadastro
    .select(null, [
      {
        name: "id",
        value: req.params.id,
      },
    ])
    .then((rows, fields) => {
      res.status(200).json(rows);
    })
    .catch((err) => {
      console.log("ERRO: 133 processo_passo_cadastro_routes " + err);
      res.status(500).send({
        erro: err,
      });
    });
});

//==================================================================================
//  Busca  pelo id
//==================================================================================
router.delete("/:id", function (req, res) {
  processoPassoCadastro
    .delete(req.params.id)
    .then((rows, fields) => {
      res.status(200).json(rows);
    })
    .catch((err) => {
      console.log("ERRO: 147 processo_passo_cadastro_routes " + err);
      res.status(500).send({
        erro: err,
      });
    });
});

module.exports = router;


