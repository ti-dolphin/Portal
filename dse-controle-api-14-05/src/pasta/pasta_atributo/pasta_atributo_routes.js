const PastaAtributo = require("./pasta_atributo.js");
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

    PastaAtributo.select(fields, target).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: linha 34 pasta_atributo_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.get("/categoria/:pasta_id", function (req, res) {
    PastaAtributo.selectCategoria(req.params.pasta_id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: linha 45 pasta_atributo_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

//==================================================================================
//  Cadastro 
//==================================================================================
router.post("/", function (req, res) {
    PastaAtributo.insert(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: linha 63 pasta_atributo_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

//==================================================================================
//  Update 
//==================================================================================
router.put("/", function (req, res) {
    PastaAtributo.update(req.body).then((rows, fields) => {
        res.json(rows);
        res.status(201);
    }).catch((err) => {
        console.log("ERRO: linha 78 pasta_atributo_routes " + err);
        res.status(500).send({
            erro: String(err)
        });
    });
});

//==================================================================================
//  Busca  pelo id
//==================================================================================
router.get('/:id', function (req, res) {
    PastaAtributo.select(null, [{
        name: 'id',
        value: req.params.id
    }]).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: linha 95 pasta_atributo_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.post('/atrpasta', function (req, res) {
    PastaAtributo.selectAtributosSemCategoria(req.body).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: linha 106 pasta_atributo_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.post('/atrpastafilhatotal', function (req, res) {
    PastaAtributo.selectAtributosPastaPai(req.body).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: linha 117 pasta_atributo_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.post('/atrcategoria', function (req, res) {
    PastaAtributo.selectAtributosCategoria(req.body).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: linha 128 pasta_atributo_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.post('/atributosComCategoria', function (req, res) {
    PastaAtributo.selectAtributosCategoriaFast(req.body).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: linha 139 pasta_atributo_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.post('/atributosComValores', function (req, res) {
    PastaAtributo.selectAtributosComValor(req.body).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: rota atrubutosComValores "+err)
    })
})


router.post('/atrfilho', function (req, res) {
    PastaAtributo.selectAtributoFilho(req.body).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: linha 151 pasta_atributo_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

//==================================================================================
//  Busca  pelo id
//==================================================================================
router.delete('/:id', function (req, res) {
    PastaAtributo.delete(req.params.id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: linha 165 pasta_atributo_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

module.exports = router;