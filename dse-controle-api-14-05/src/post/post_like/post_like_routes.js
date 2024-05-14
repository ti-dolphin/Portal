const PostLike = require("./post_like.js");
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

    PostLike.select(fields, target).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 31 post_like_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.post("/", function (req, res) {
    PostLike.insert(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: linha post_like_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.put("/", function (req, res) {
    PostLike.update(req.body).then((rows, fields) => {
        res.json(rows);
        res.status(201);
    }).catch((err) => {
        console.log("ERRO: linha 58 post_like_routes " + err);
        res.status(500).send({
            erro: String(err)
        });
    });
});

router.get('/:id', function (req, res) {
    PostLike.select(null, [{
        name: 'id',
        value: req.params.id
    }]).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 72 post_like_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.delete("/:post_id/:usuario_id", function (req, res) {
    PostLike.delete(req.params.post_id,req.params.usuario_id).then((rows, fields) => {
        res.json(rows);
        res.status(201);
    }).catch((err) => {
        console.log("ERRO: linha 84 post_like_routes " + err);
        res.status(500).send({
            erro: String(err)
        });
    });
});

module.exports = router;