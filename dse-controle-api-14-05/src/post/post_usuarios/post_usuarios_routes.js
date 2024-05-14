const PostUsuarios = require("./post_usuarios.js");
const express = require('express');
const router = express.Router();

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

    PostUsuarios.select(fields, target).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 31 post_usuarios_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.post("/", function (req, res) {
    PostUsuarios.insert(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: linha post_usuarios_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});


router.put("/", function (req, res) {
    PostUsuarios.update(req.body).then((rows, fields) => {
        res.json(rows);
        res.status(201);
    }).catch((err) => {
        console.log("ERRO: linha 59 post_usuarios_routes " + err);
        res.status(500).send({
            erro: String(err)
        });
    });
});


router.get('/:id', function (req, res) {
    PostUsuarios.select(null, [{
        name: 'id',
        value: req.params.id
    }]).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 74 post_usuarios_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

module.exports = router;