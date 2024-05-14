const PastaDocumentoNome = require("./pasta_documento_nome.js");
const express = require('express');
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

    PastaDocumentoNome.select(fields, target).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: linha 34 pasta_documento_nome_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.get("/itens/:id", function (req,res) {

    PastaDocumentoNome.selectItens(req.params.id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: linha 46 pasta_documento_nome_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

//==================================================================================
//  Cadastro 
//==================================================================================
router.post("/", function (req, res) {
    PastaDocumentoNome.insert(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: linha 64 pasta_documento_nome_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.post("/editaPrefixo", function (req, res) {
    PastaDocumentoNome.editaPrefixo(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: linha 79 pasta_documento_nome_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.post("/cadastro", function (req, res) {
    PastaDocumentoNome.insertCadastro(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: linha 94 pasta_documento_nome_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

//==================================================================================
//  Update 
//==================================================================================
router.put("/", function (req, res) {
    PastaDocumentoNome.update(req.body).then((rows, fields) => {
        res.json(rows);
        res.status(201);
    }).catch((err) => {
        console.log("ERRO: linha 109 pasta_documento_nome_routes " + err);
        res.status(500).send({
            erro: String(err)
        });
    });
});

//==================================================================================
//  Busca  pelo id
//==================================================================================
router.get('/:id', function (req, res) {
    PastaDocumentoNome.select(null, [{
        name: 'id',
        value: req.params.id
    }]).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: linha 126 pasta_documento_nome_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

//==================================================================================
//  Busca  pelo id
//==================================================================================
router.delete('/:id', function (req, res) {
    PastaDocumentoNome.delete(req.params.id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: linha 140 pasta_documento_nome_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

module.exports = router;