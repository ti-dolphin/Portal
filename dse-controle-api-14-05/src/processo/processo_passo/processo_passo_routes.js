const processoPasso = require("./processo_passo.js");
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

    processoPasso.select(fields, target).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 34 processo_passo_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

//==================================================================================
//  Cadastro 
//==================================================================================
router.post("/", function (req, res) {
    processoPasso.insert(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: 52 processo_passo_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

//==================================================================================
//  Update 
//==================================================================================
router.put("/", function (req, res) {
    processoPasso.update(req.body).then((rows, fields) => {
        res.json(rows);
        res.status(201);
    }).catch((err) => {
        console.log("ERRO: 67 processo_passo_routes " + err);
        res.status(500).send({
            erro: String(err)
        });
    });
});

//==================================================================================
//  Busca  pelo id
//==================================================================================
router.get('/:id', function (req, res) {
    processoPasso.select(null, [{
        name: 'id',
        value: req.params.id
    }]).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 84 processo_passo_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.get('/responsaveis/:id', function (req, res) {
    processoPasso.getResponsaveisTarefasProcessoExecucao(req.params.id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 95 processo_passo_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.get('/passos/:id/:flagPassosAntigos', function (req, res) {
    processoPasso.getListaPassos(req.params.id, req.params.flagPassosAntigos).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 106 processo_passo_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.get('/passo/:id/:processoId', function (req, res) {
    processoPasso.getPassoProcessoExecucao(req.params.id,req.params.processoId).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 117 processo_passo_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.get('/passoExterno/:processoId', function (req, res) {
    processoPasso.getPassoExterno(req.params.processoId).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 128 processo_passo_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.get('/passo_atual/:id', function (req, res) {
    processoPasso.getPassoAtualProcesso(req.params.id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 139 processo_passo_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.get('/errocondicao/:id', function (req, res) {
    processoPasso.getPassosProcesso(req.params.id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: getErroCondicao processo_passo_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

//==================================================================================
//  Busca  pelo id
//==================================================================================
router.delete('/:id', function (req, res) {
    processoPasso.delete(req.params.id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 153 processo_passo_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

module.exports = router;