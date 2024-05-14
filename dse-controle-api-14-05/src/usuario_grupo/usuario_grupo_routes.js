const UsuarioGrupo = require("./usuario_grupo.js");
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

    UsuarioGrupo.select(fields, target).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 34 usuario_grupo_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.get("/selectUsersGrupo/:idGrupo", function (req, res) {
    UsuarioGrupo.selectUsersGrupo(req.params.idGrupo).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch((err) => {
        console.log("ERRO: 45 selectUsersGrupo " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

//==================================================================================
//  Cadastro 
//==================================================================================
router.post("/", function (req, res) {
    UsuarioGrupo.insert(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "Cadastrado com sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: 52 usuario_grupo_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

//==================================================================================
//  Update 
//==================================================================================
router.put("/", function (req, res) {
    UsuarioGrupo.update(req.body).then((rows, fields) => {
        res.json(rows);
        res.status(201);
    }).catch((err) => {
        console.log("ERRO: 67 usuario_grupo_routes " + err);
        res.status(500).send({
            erro: String(err)
        });
    });
});


router.delete("/usuarios/:idGrupo", function (req, res) {
    UsuarioGrupo.delete_usuarios(req.params.idGrupo).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch((err) => {
        res.status(500).send({
            erro: String(err)
        });
    });
});

router.delete("/grupos/:idUsuario", function (req, res) {
    UsuarioGrupo.delete_grupos(req.params.idUsuario).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch((err) => {
        res.status(500).send({
            erro: String(err)
        });
    });
});

module.exports = router;