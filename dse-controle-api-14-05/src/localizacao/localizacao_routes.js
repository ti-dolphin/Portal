const Cidade = require("./cidade.js");
const express = require('express');
const Estado = require("./estado.js");
const router = express.Router();

//============================================================
//
//============================================================
router.get("/cidade/:id", function(req, res) {
    Cidade.selectWithEstado(req.params.id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: linha 13 localizacao_routes" + err);
        res.status(500).send({
            erro: err
        });
    });
});

//============================================================
// Busca todas as cidades
//============================================================
router.get("/cidade", function(req, res) {
    var fields = null;
    var target = null;
    if (req.query.fields) {
        fields = req.query.fields;
    }
    if (req.query.target && req.query.target_value) {
        target = [];
        var tmp = {};
        if (req.query.target.length == req.query.target_value.length) {
            for (let i = 0; i < (req.query.target).length; i++) {
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
    Cidade.select(fields, target).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: linha 48 localizacao_routes" + err);
        res.status(500).send({
            erro: err
        });
    });
});

//============================================================
// Busca todos os estados
//============================================================
router.get("/estado", function(req, res) {
   
    var fields = null;
    var target = null;
    if (req.query.fields) {
        fields = req.query.fields;
    }
    if (req.query.target && req.query.target_value) {
        target = [];
        var tmp = {};
        if (req.query.target.length == req.query.target_value.length) {
            for (var i = 0; i < (req.query.target).length; i++) {
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
    Estado.select(fields, target).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: linha 84 localizacao_routes" + err);
        res.status(500).send({
            erro: err
        });
    });
});
module.exports = router;