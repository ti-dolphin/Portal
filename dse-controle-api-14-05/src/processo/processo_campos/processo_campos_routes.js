const processoCampos = require("./processo_campos.js");
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

    processoCampos.select(fields, target).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 34 processo_campos_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.get("/valoresCampos/:processo_id/:campo_id/:valor", function (req, res) {
    processoCampos.getValoresCampos(req.params.processo_id,req.params.campo_id,req.params.valor).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch((err) => {
        console.log("ERRO: 45 processo_campos_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.get("/valorCampo/:id/:passoId", function (req, res) {
    processoCampos.getValorCampo(req.params.id, req.params.passoId).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch((err) => {
        console.log("ERRO: 56 processo_campos_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.get("/ultimoPassoIdProcesso/:processo_campo_cadastro_id", function (req, res) {
    processoCampos.ultimoPassoIdProcesso(req.params.processo_campo_cadastro_id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch((err) => {
        console.log("ERRO: 67 processo_campos_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});


//==================================================================================
//  Cadastro 
//==================================================================================
router.post("/", function (req, res) {
    processoCampos.insert(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: 86 processo_campos_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

//==================================================================================
//  Update 
//==================================================================================
router.put("/", function (req, res) {
    processoCampos.update(req.body).then((rows, fields) => {
        res.json(rows);
        res.status(201);
    }).catch((err) => {
        console.log("ERRO: 101 processo_campos_routes " + err);
        res.status(500).send({
            erro: String(err)
        });
    });
});

//==================================================================================
//  Busca  pelo id
//==================================================================================
router.get('/:id', function (req, res) {
    processoCampos.select(null, [{
        name: 'id',
        value: req.params.id
    }]).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 118 processo_campos_routes  " + err);
        res.status(500).send({
            erro: err
        });
    });
});

//==================================================================================
//  Busca  pelo id
//==================================================================================
router.delete('/:id', function (req, res) {
    processoCampos.delete(req.params.id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 132 processo_campos_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.delete('/deleteArquive/:id', function (req, res) {
    processoCampos.deleteArquive(req.params.id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 143 processo_campos_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

module.exports = router;