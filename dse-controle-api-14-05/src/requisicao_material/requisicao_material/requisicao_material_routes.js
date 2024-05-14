const RequisicaoMaterial = require("./requisicao_material.js");
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

    RequisicaoMaterial.select(fields, target).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 34 requisicao_meterial_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.get('/req/:id', function (req, res) {
    RequisicaoMaterial.selectReq(req.params.id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 45 requisicao_meterial_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

//==================================================================================
//  Cadastro 
//==================================================================================
router.post("/", function (req, res) {
    RequisicaoMaterial.insert(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "RequisicaoMaterial cadastrado com sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: 63 requisicao_meterial_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.post("/documento", function (req, res) {
    RequisicaoMaterial.insertDocumento(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "Documento cadastrado com sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: 78 requisicao_meterial_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

//==================================================================================
//  Update 
//==================================================================================
router.put("/", function (req, res) {
    RequisicaoMaterial.update(req.body).then((rows, fields) => {
        res.json(rows);
        res.status(201);
    }).catch((err) => {
        console.log("ERRO: 93 requisicao_meterial_routes " + err);
        res.status(500).send({
            erro: String(err)
        });
    });
});

//==================================================================================
//  Busca um RequisicaoMaterial pelo id
//==================================================================================
router.get('/:id', function (req, res) {
    RequisicaoMaterial.select(null, [{
        name: 'id',
        value: req.params.id
    }]).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 110 requisicao_meterial_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.get('/pendentes/:id', function (req, res) {
    RequisicaoMaterial.selectPendentes(req.params.id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 121 requisicao_meterial_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.post('/tabela', function (req, res) {
    RequisicaoMaterial.selectTabela(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "ok",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: 136 requisicao_meterial_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.post('/getpermissao', function (req, res) {
    RequisicaoMaterial.selectPermissao(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "ok",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: 151 requisicao_meterial_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.post('/getuserpermissionprogram', function (req, res) {
    RequisicaoMaterial.selectUserGroupPermissionProgram(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "ok",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: 166 requisicao_meterial_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.post('/tabelahome', function (req, res) {
    RequisicaoMaterial.selectTabelaHome(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "ok",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: 181 requisicao_meterial_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

module.exports = router;