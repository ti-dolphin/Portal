const RequisicaoMaterialItens = require("./requisicao_material_itens.js");
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

    RequisicaoMaterialItens.select(fields, target).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 34 requisicao_meterial_itens_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.get('/itens/:id', function (req, res) {
    RequisicaoMaterialItens.selectItens(req.params.id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 45 requisicao_meterial_itens_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});


//==================================================================================
//  Cadastro 
//==================================================================================
router.post("/", function (req, res) {
    RequisicaoMaterialItens.insert(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "RequisicaoMaterialItens cadastrado com sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: 64 requisicao_meterial_itens_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

//==================================================================================
//  Update 
//==================================================================================
router.put("/", function (req, res) {
    RequisicaoMaterialItens.update(req.body).then((rows, fields) => {
        res.json(rows);
        res.status(201);
    }).catch((err) => {
        console.log("ERRO: 79 requisicao_meterial_itens_routes " + err);
        res.status(500).send({
            erro: String(err)
        });
    });
});

//==================================================================================
//  Busca um RequisicaoMaterialItens pelo id
//==================================================================================
router.get('/:id', function (req, res) {
    RequisicaoMaterialItens.select(null, [{
        name: 'id',
        value: req.params.id
    }]).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 96 requisicao_meterial_itens_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

module.exports = router;