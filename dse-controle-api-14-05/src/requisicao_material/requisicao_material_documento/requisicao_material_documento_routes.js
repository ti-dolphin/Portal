const RequisicaoMaterialDocumento = require("./requisicao_material_documento.js");
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

    RequisicaoMaterialDocumento.select(fields, target).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 34 requisicao_meterial_documento_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

//==================================================================================
//  Cadastro 
//==================================================================================
router.post("/", function (req, res) {
    RequisicaoMaterialDocumento.insert(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "RequisicaoMaterialDocumento cadastrado com sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: 52 requisicao_meterial_documento_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

//==================================================================================
//  Update 
//==================================================================================
router.put("/", function (req, res) {
    RequisicaoMaterialDocumento.update(req.body).then((rows, fields) => {
        res.json(rows);
        res.status(201);
    }).catch((err) => {
        console.log("ERRO: 67 requisicao_meterial_documento_routes " + err);
        res.status(500).send({
            erro: String(err)
        });
    });
});

//==================================================================================
//  Busca um RequisicaoMaterialDocumento pelo id
//==================================================================================
router.get('/:id', function (req, res) {
    RequisicaoMaterialDocumento.select(null, [{
        name: 'id',
        value: req.params.id
    }]).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 84 requisicao_meterial_documento_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

module.exports = router;