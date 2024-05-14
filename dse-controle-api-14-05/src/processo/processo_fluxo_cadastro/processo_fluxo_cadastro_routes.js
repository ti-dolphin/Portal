const processoFluxoCadastro = require("./processo_fluxo_cadastro.js");
const express = require('express');
const processoFluxoCadastroController = require("./processo_fluxo_cadastro_controller.js");
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

    processoFluxoCadastro.select(fields, target).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 34 processo_fluxo_cadastro_routes " + err);
        res.status(500).send({
            erro: String(err)
        });
    });
});

router.get("/verificaCondicaoPassoAtual/:processo_id", function (req, res) {
    processoFluxoCadastro.verificaCondicaoPassoAtual(req.params.processo_id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch((err) => {
        console.log("ERRO: 45 processo_fluxo_cadastro_routes " + err);
        res.status(500).send({
            message: String(err)
        });
    });
});

//==================================================================================
//  Cadastro 
//==================================================================================
router.post("/", function (req, res) {
    processoFluxoCadastro.insert(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: 63 processo_fluxo_cadastro_routes " + err);
        res.status(500).send({
            message: String(err)
        });
    });
});

router.post("/cadastraFluxoAnterior", function (req, res) {
    processoFluxoCadastroController.editProcessFlow(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    // processoFluxoCadastro.cadastraFluxoAnterior(req.body).then((rows, fields) => {
    //     res.status(201).json({
    //         message: "sucesso!",
    //         rows: rows,
    //         fields: fields
    //     });
    }).catch((err) => {
        console.log("ERRO: cadastraFluxoAnterior processo_fluxo_cadastro_routes " + err);
        res.status(500).send({
            message: String(err)
        });
    });
});

router.post("/cadastraValores", function (req, res) {
    processoFluxoCadastroController.updateFields(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    // processoFluxoCadastro.cadastraValores(req.body).then((rows, fields) => {
    //     res.status(201).json({
    //         message: "sucesso!",
    //         rows: rows,
    //         fields: fields
    //     });
    }).catch((err) => {
        console.log("ERRO: cadastraValores processo_fluxo_cadastro_routes " + err);
        res.status(500).send({
            message: String(err)
        });
    });
});

router.post("/avancaProcessoExecucao", function (req, res) {
    processoFluxoCadastro.avancaProcessoExecucaoRefatorado(req.body.processo_id).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: 93 processo_fluxo_cadastro_routes " + err);
        res.status(500).send({
            message: String(err)
        });
    });
});

//==================================================================================
//  Update 
//==================================================================================
router.put("/", function (req, res) {
    processoFluxoCadastro.update(req.body).then((rows, fields) => {
        res.json(rows);
        res.status(201);
    }).catch((err) => {
        console.log("ERRO: 108 processo_fluxo_cadastro_routes " + err);
        res.status(500).send({
            erro: String(err)
        });
    });
});

//==================================================================================
//  Busca  pelo id
//==================================================================================
router.get('/:id', function (req, res) {
    processoFluxoCadastro.select(null, [{
        name: 'id',
        value: req.params.id
    }]).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 125 processo_fluxo_cadastro_routes " + err);
        res.status(500).send({
            erro: String(err)
        });
    });
});

//==================================================================================
//  Busca  pelo id
//==================================================================================
router.delete('/:id', function (req, res) {
    processoFluxoCadastro.delete(req.params.id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 139 processo_fluxo_cadastro_routes " + err);
        res.status(500).send({
            erro: String(err)
        });
    });
});

module.exports = router;