const processoObservadores = require("./processo_observadores.js");
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

    processoObservadores.select(fields, target).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 34 processo_observadores_routes " + err);
        res.status(500).send({
            erro: String(err)
        });
    });
});

router.post("/consultaObservadores", function (req, res) {
    processoObservadores.consultaObservadores(req.body).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch((err) => {
        console.log("ERRO: 45 processo_observadores_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});


//==================================================================================
//  Cadastro 
//==================================================================================
router.post("/", function (req, res) {
    processoObservadores.insert(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: 64 processo_observadores_routes " + err);
        res.status(500).send({
            message: String(err)
        });
    });
});

router.post("/deleteObservadores", function (req, res) {
    processoObservadores.delete(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: 79 processo_observadores_routes " + err);
        res.status(500).send({
            message: String(err)
        });
    });
});

router.post("/deleteUserObservador", function (req, res) {
    processoObservadores.deleteUser(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: 94 processo_observadores_routes " + err);
        res.status(500).send({
            message: String(err)
        });
    });
});


//==================================================================================
//  Update 
//==================================================================================
router.put("/", function (req, res) {
    processoObservadores.update(req.body).then((rows, fields) => {
        res.json(rows);
        res.status(201);
    }).catch((err) => {
        console.log("ERRO: 110 processo_observadores_routes " + err);
        res.status(500).send({
            erro: String(err)
        });
    });
});

//==================================================================================
//  Busca  pelo id
//==================================================================================
router.get('/:id', function (req, res) {
    processoObservadores.select(null, [{
        name: 'id',
        value: req.params.id
    }]).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 127 processo_observadores_routes " + err);
        res.status(500).send({
            erro: String(err)
        });
    });
});

//==================================================================================
//  Busca  pelo id
//==================================================================================
router.delete('/:id', function (req, res) {
    processoObservadores.delete(req.params.id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 141 processo_observadores_routes " + err);
        res.status(500).send({
            erro: String(err)
        });
    });
});

module.exports = router;