const ProjetoCadastro = require("./projeto_cadastro.js");
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

    ProjetoCadastro.select(fields, target).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 34 projeto_cadastro_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.get("/templates", function (req, res) {
    ProjetoCadastro.getTemplates().then((rows, fields) => {
        res.status(200).json(rows);
    }).catch((err) => {
        console.log("ERRO: 45 projeto_cadastro_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.get("/projetosOnly", function (req, res) {
    ProjetoCadastro.projetosOnly().then((rows, fields) => {
        res.status(200).json(rows);
    }).catch((err) => {
        console.log("ERRO: 56 projeto_cadastro_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.post("/projetoTemplate", function (req, res) {
    ProjetoCadastro.projetoTemplate(req.body).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch((err) => {
        console.log("ERRO: 67 projeto_cadastro_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

//==================================================================================
//  Cadastro 
//==================================================================================
router.post("/", function (req, res) {
    ProjetoCadastro.insert(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: 85 projeto_cadastro_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.post("/consultaProjetos", function (req, res) {
    ProjetoCadastro.consultaProjetos(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: 100 projeto_cadastro_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.post("/cadastraimagem", function (req, res) {
    ProjetoCadastro.insertImagem(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: 115 projeto_cadastro_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

//==================================================================================
//  Update 
//==================================================================================
router.put("/", function (req, res) {
    ProjetoCadastro.update(req.body).then((rows, fields) => {
        res.json(rows);
        res.status(201);
    }).catch((err) => {
        console.log("ERRO: 130 projeto_cadastro_routes " + err);
        res.status(500).send({
            erro: String(err)
        });
    });
});

router.put("/editaimagem", function (req, res) {
    ProjetoCadastro.updateImagem(req.body).then((rows, fields) => {
        res.json(rows);
        res.status(201);
    }).catch((err) => {
        console.log("ERRO: 142 projeto_cadastro_routes " + err);
        res.status(500).send({
            erro: String(err)
        });
    });
});

//==================================================================================
//  Busca  pelo id
//==================================================================================
router.get('/:id', function (req, res) {
    ProjetoCadastro.select(null, [{
        name: 'id',
        value: req.params.id
    }]).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 159 projeto_cadastro_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

module.exports = router;