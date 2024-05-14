const ProcessoCadastro = require("./processo_cadastro.js");
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

    ProcessoCadastro.select(fields, target).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 34 processo_cadastro_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.get('/diagrama/:id', function(req,res){
    ProcessoCadastro.getProcesso(req.params.id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch((err) => {
        console.log("ERRO: 45 processo_cadastro_routes " + err);
        res.status(500).send({
            message: "Erro: 34 processo_cadastro_routes "+err
        });
    });
});

router.get('/passosCaminhoPadrao/:id', function(req,res){
    ProcessoCadastro.getPassosCaminhoPadrao(req.params.id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch((err) => {
        console.log("ERRO: 56 processo_cadastro_routes " + err);
        res.status(500).send({
            message: "Erro: "+err
        });
    });
});

//==================================================================================
//  Cadastro 
//==================================================================================
router.post("/", function (req, res) {
    ProcessoCadastro.insert(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: 74 processo_cadastro_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.post("/cadastro", function (req, res) {
    ProcessoCadastro.cadastraProcesso(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: 89 processo_cadastro_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.post("/volta", function (req, res) {
    ProcessoCadastro.voltaProcesso(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: 104 processo_cadastro_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

//==================================================================================
//  Update 
//==================================================================================
router.put("/", function (req, res) {
    ProcessoCadastro.update(req.body).then((rows, fields) => {
        res.json(rows);
        res.status(201);
    }).catch((err) => {
        console.log("ERRO: 119 processo_cadastro_routes " + err);
        res.status(500).send({
            erro: String(err)
        });
    });
});

//==================================================================================
//  Busca  pelo id
//==================================================================================
router.get('/:id', function (req, res) {
    ProcessoCadastro.select(null, [{
        name: 'id',
        value: req.params.id
    }]).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 136 processo_cadastro_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

//==================================================================================
//  Busca  pelo id
//==================================================================================
router.delete('/:id', function (req, res) {
    ProcessoCadastro.delete(req.params.id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 150 processo_cadastro_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

module.exports = router;