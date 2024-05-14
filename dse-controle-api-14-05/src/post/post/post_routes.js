const Post = require("./post.js");
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

    Post.select(fields, target).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 31 post_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.get("/mural", function (req, res) {
    Post.getPostsMural().then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 42 post_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.post("/feed", function (req, res) {
    Post.getPostsFeed(req.body).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 42 post_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.get("/detalhes/:id", function (req, res) {
    Post.getPostDetalhes(req.params.id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 42 post_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.get("/filtersByUser/:id", function (req, res) {
    Post.getFiltersByUser(req.params.id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 53 post_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.post("/", function (req, res) {
    Post.insert(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: linha 68 post_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.post("/removeMural", function (req, res) {
    Post.removeMural(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: linha 83 post_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.put("/", function (req, res) {
    Post.update(req.body).then((rows, fields) => {
        res.json(rows);
        res.status(201);
    }).catch((err) => {
        console.log("ERRO: linha 95 post_routes " + err);
        res.status(500).send({
            erro: String(err)
        });
    });
});

router.get('/:id', function (req, res) {
    Post.select(null, [{
        name: 'id',
        value: req.params.id
    }]).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 110 post_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

module.exports = router;