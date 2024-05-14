const Unidade = require("./unidade.js");
const bcrypt = require("bcrypt");
const express = require('express');
const router = express.Router();

//==================================================================================
//  Busca os Usuarios
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
            for (var i = 0; i < (req.query.target).length; i++) {
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

    Unidade.select(fields, target).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 34 unidade_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

//==================================================================================
//  Cadastro do Unidade
//==================================================================================
router.post("/", function (req, res) {
    bcrypt.hash(req.body.senha, 10, function (error, hash) {
        if (error) {
            console.log("ERRO: 48 unidade_routes " + error);
            res.status(500).send({
                erro: "falha ao gerar hash"
            });
        } else {
             req.body.senha = hash;
            Unidade.insert(req.body).then((rows, fields) => {
                res.status(201).json({
                    message: "Unidade cadastrado com sucesso!",
                    rows: rows,
                    fields: fields
                });
            }).catch((err) => {
                console.log("ERRO: 61 unidade_routes " + err);
                res.status(500).send({
                    message: "Erro ao cadastrar Unidade!"
                });
            });
        }
    });
});

//==================================================================================
//  Update do Unidade
//==================================================================================
router.put("/", function (req, res) {
    if (req.body.senha) {
        bcrypt.hash(req.body.senha, 10, function (error, hash) {
            console.log("ERRO: 76 unidade_routes " + error);
            req.body.senha = hash;
            Unidade.update(req.body).then((rows, fields) => {
                res.json(rows);
                res.status(201);
            }).catch((err) => {
                console.log("ERRO: 82 unidade_routes " + err);
                res.status(500).send({
                    erro: String(err)
                });
            });
        });
    } else {
        Unidade.update(req.body).then((rows, fields) => {
            res.json(rows);
            res.status(201);
        }).catch((err) => {
            console.log("ERRO: 93 unidade_routes " + err);
            res.status(500).send({
                erro: String(err)
            });
        });
    }
});

//==================================================================================
//  Busca um Unidade pelo id
//==================================================================================
router.get('/:id', function (req, res) {
    Unidade.select(null, [{
        name: 'id',
        value: req.params.id
    }]).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 111 unidade_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

module.exports = router;