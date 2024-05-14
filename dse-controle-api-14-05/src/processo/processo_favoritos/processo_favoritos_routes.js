const ProcessoFavoritos = require("./processo_favoritos.js");
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

    ProcessoFavoritos.select(fields, target).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 34 processo_favoritos_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.get("/home/:id", function (req, res) {
    ProcessoFavoritos.selectHome(req.params.id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 45 processo_favoritos_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

//==================================================================================
//  Cadastro 
//==================================================================================
router.post("/", function (req, res) {
    ProcessoFavoritos.insert(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: 63 processo_favoritos_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});


router.post("/atualizafav", function (req, res) {
    ProcessoFavoritos.atualizafav(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: 79 processo_favoritos_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

//==================================================================================
//  Update 
//==================================================================================
router.put("/", function (req, res) {
    ProcessoFavoritos.update(req.body).then((rows, fields) => {
        res.json(rows);
        res.status(201);
    }).catch((err) => {
        console.log("ERRO: 94 processo_favoritos_routes " + err);
        res.status(500).send({
            erro: String(err)
        });
    });
});

//==================================================================================
//  Busca  pelo id
//==================================================================================
router.get('/:id', function (req, res) {
    ProcessoFavoritos.select(null, [{
        name: 'id',
        value: req.params.id
    }]).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 111 processo_favoritos_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.delete('/:idprojeto/:idusuario', function (req, res) {

    ProcessoFavoritos.delete(req.params).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 123 processo_favoritos_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

module.exports = router;