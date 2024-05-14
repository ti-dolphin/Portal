const Processo = require("./processo.js");
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

    Processo.select(fields, target).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: linha 34 processo_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.get("/completo/:id", function (req, res) {
    Processo.getProcessoCompleto(req.params.id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch((err) => {
        console.log("ERRO: linha 45 processo_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.get("/verificaProcessos", function (req, res) {
    Processo.verificaProcessos().then((rows, fields) => {
        res.status(200).json(rows);
    }).catch((err) => {
        console.log("ERRO: linha 56 processo_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});


router.post("/getProcessoExecucao", function (req, res) {
    Processo.getProcessoExecucao(req.body).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch((err) => {
        console.log("ERRO: linha 68 processo_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.post("/setaTituloProcesso", function (req, res) {
    Processo.setaTituloProcesso(req.body).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch((err) => {
        console.log("ERRO: linha 79 setaTituloProcesso processo_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.post("/iniciaSubProcesso", function (req, res) {
    Processo.iniciaSubProcesso(req.body.processo_id, req.body.processo_cadastro_id, req.body.responsavel_id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch((err) => {
        console.log("ERRO: linha 79 setaTituloProcesso processo_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

//==================================================================================
//  Cadastro 
//==================================================================================
router.post("/", function (req, res) {
    Processo.insert(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: linha 86 processo_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.post("/filtro", function (req, res) {
    Processo.filtro(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: linha 101 processo_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.get("/home/:id", function (req, res) {
    Processo.selectProcessosHome(req.params.id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch((err) => {
        console.log("ERRO: linha 112 processo_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.post("/processos", function (req, res) {
    Processo.selectProcessosAbaProcessos(req.body).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch((err) => {
        console.log("ERRO: linha 123 processo_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.post("/ged", function (req, res) {
    Processo.getProcessosGed(req.body).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch((err) => {
        console.log("ERRO: linha 134 processo_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.post("/alteraResponsavel", function (req, res) {
    Processo.alteraResponsavel(req.body).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch((err) => {
        console.log("ERRO: linha 145 processo_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.post("/consultadescricaoprocesso", function (req, res) {
    Processo.consultaDescricaoProcesso(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: linha 160 processo_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.post("/pendentes", function (req, res) {
    Processo.selectPendentes(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: linha 175 processo_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.post("/mostruario", function (req, res) {
    Processo.selectMostruario(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: linha 190 processo_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

//==================================================================================
//  Update 
//==================================================================================
router.put("/", function (req, res) {
    Processo.update(req.body).then((rows, fields) => {
        res.json(rows);
        res.status(201);
    }).catch((err) => {
        console.log("ERRO: linha 205 processo_routes " + err);
        res.status(500).send({
            erro: String(err)
        });
    });
});

//==================================================================================
//  Atualiza o título de todos os processos (utilizar somente rodando api local) 
//==================================================================================
router.get("/atualizaTitulo", function (req, res) {
    Processo.atualizaTitulo().then((result) => {
        // res.json(rows);
        res.json(result);
        res.status(201);
    }).catch((err) => {
        console.log("ERRO: rota atualizaTitulo em processo_routes " + err);
        res.status(500).send({
            erro: String(err)
        });
    });
});

//==================================================================================
//  Busca  pelo id
//==================================================================================
router.get('/:id', function (req, res) {
    Processo.select(null, [{
        name: 'id',
        value: req.params.id
    }]).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: " + err);
        res.status(500).send({
            erro: err
        });
    });
});

//==================================================================================
//  Busca  pelo id
//==================================================================================
router.delete('/:id', function (req, res) {
    Processo.delete(req.params.id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.delete('/execucao/:id', function (req, res) {
    Processo.deleteProcessoExecucao(req.params.id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.post("/continuaProcesso", function (req, res) {
    Processo.continuaProcesso(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: linha continuaProcesso processo_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

module.exports = router;