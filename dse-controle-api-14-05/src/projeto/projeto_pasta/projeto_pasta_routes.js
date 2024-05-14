const ProjetoPasta = require("./projeto_pasta.js");
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

    ProjetoPasta.select(fields, target).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 34 projeto_pasta_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.post("/getPastasGed", function (req, res) {
    ProjetoPasta.getPastasGed(req.body).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch((err) => {
        console.log("ERRO: 45 projeto_pasta_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.post("/movePasta", function (req, res) {
    ProjetoPasta.movePasta(req.body).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch((err) => {
        console.log("ERRO: 56 projeto_pasta_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.get("/arvoreFilhos/:id", function (req, res) {
    ProjetoPasta.getArvoreDeFilhosRecursiva(req.params.id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch((err) => {
        console.log("ERRO: 67 projeto_pasta_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.post("/arvoreFilhosArquivos", function (req, res) {
    ProjetoPasta.getArvoreFilhosEArquivos(req.body).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch((err) => {
        console.log("ERRO: 78 projeto_pasta_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.get("/selectpais/:id", function (req, res) {
    ProjetoPasta.selectPaisProjeto(req.params.id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 89 projeto_pasta_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.get("/caminho/:id", function (req, res) {
    ProjetoPasta.selectCaminhoPasta(req.params.id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 100 projeto_pasta_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.get("/pastaProjetoTemplate/:projeto_id/:pasta_id", function (req, res) {
    ProjetoPasta.selectPastaProjetoTemplate(req.params.projeto_id,req.params.pasta_id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 111 projeto_pasta_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.get("/selectfilhos/:id", function (req, res) {
    ProjetoPasta.selectFilhosPasta(req.params.id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 122 projeto_pasta_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.post("/selectIdByNome", function (req, res) {
    ProjetoPasta.selectIdByNome(req.body).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 133 projeto_pasta_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

//==================================================================================
//  Cadastro 
//==================================================================================
router.post("/", function (req, res) {
    ProjetoPasta.insert(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: 151 projeto_pasta_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.post("/cadastraPasta", function (req, res) {
    ProjetoPasta.cadastraPasta(req.body).then((rows, fields) => {
        res.status(201).json({
            message: rows.message,
            fields: rows.insertId,
        });
    }).catch((err) => {
        console.log("ERRO: 165 projeto_pasta_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.post("/projetoTemplate", function (req, res) {
    ProjetoPasta.cadastraProjetoComBaseEmTemplate(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: cadastraProjetoComBaseEmTemplate projeto_pasta_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});


router.post("/selectpastanomeprocesso", function (req, res) {
    ProjetoPasta.selectPastaNomeProcesso(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: 196 projeto_pasta_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.post("/verificapasta", function (req, res) {
    ProjetoPasta.selectverificapasta(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: 211 projeto_pasta_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});
//==================================================================================
//  Update 
//==================================================================================
router.put("/", function (req, res) {
    ProjetoPasta.update(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: 228 projeto_pasta_routes " + err);
        res.status(500).send({
            erro: String(err)
        });
    });
});

//==================================================================================
//  Busca  pelo id
//==================================================================================
router.get('/:id', function (req, res) {
    ProjetoPasta.select(null, [{
        name: 'id',
        value: req.params.id
    }]).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 245 projeto_pasta_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

module.exports = router;