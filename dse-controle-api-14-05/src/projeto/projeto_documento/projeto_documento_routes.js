const ProjetoDocumento = require("./projeto_documento.js");
const express = require('express');
const router = express.Router();
// const multer = require('multer')

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

    ProjetoDocumento.select(fields, target).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 35 projeto_documento_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.get('/expiring-documents', async function (req, res) {
    const result = await ProjetoDocumento.notifyExpiringDocuments();
    res.status(200).send(result);
});


router.get("/idPastaArquivo/:id", function (req, res) {
    ProjetoDocumento.selectIdPastaArquivo(req.params.id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 46 projeto_documento_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.post("/selectlike", function (req, res) {
    ProjetoDocumento.selectLike(req.body).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: selectlike projeto_documento_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.post("/urlArquivo", function (req, res) {
    ProjetoDocumento.getURLArquivo(req.body).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        res.status(500).send({
            erro: err
        });
    });
});

router.get("/expiringDocumentsReports/:userId", function (req, res) {
    const userId = req.params.userId
    ProjetoDocumento.expiringDocumentsReports(userId).then((rows, field) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: expiringDocumentsReports projeto_documento_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

// const upload = multer({dest:"static/documentos/"})
//==================================================================================
//  Cadastro 
//==================================================================================
router.post("/", function (req, res) {
    ProjetoDocumento.insert(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: 87 projeto_documento_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.post("/renomeia", function (req, res) {

    ProjetoDocumento.renomeia(req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: 103 projeto_documento_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.post("/rnarqs/:id", function (req, res) {
    ProjetoDocumento.renomeiaArquivos(req.params.id,req.body).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: renomeiaArquivos projeto_documento_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

router.post("/rnarq/:id/:substitui_arquivo", function (req, res) {

    ProjetoDocumento.renomeiaArquivo(req.params.id, req.params.substitui_arquivo).then((rows, fields) => {
        res.status(201).json({
            message: "sucesso!",
            rows: rows,
            fields: fields
        });
    }).catch((err) => {
        console.log("ERRO: 135 projeto_documento_routes " + err);
        res.status(500).send({
            message: "Erro!"
        });
    });
});

//==================================================================================
//  Update 
//==================================================================================
router.put("/", function (req, res) {
    ProjetoDocumento.update(req.body).then((rows, fields) => {
        res.json(rows);
        res.status(201);
    }).catch((err) => {
        console.log("ERRO: 150 projeto_documento_routes " + err);
        res.status(500).send({
            erro: String(err)
        });
    });
});

router.put("/query", function (req, res) {
    ProjetoDocumento.updateQuery(req.body).then((rows, fields) => {
        res.json(rows);
        res.status(201);
    }).catch((err) => {
        console.log("ERRO: 162 projeto_documento_routes " + err);
        res.status(500).send({
            erro: String(err)
        });
    });
});

//==================================================================================
//  Busca  pelo id
//==================================================================================
router.get('/:id', function (req, res) {
    ProjetoDocumento.select(null, [{
        name: 'id',
        value: req.params.id
    }]).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 179 projeto_documento_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.delete('/:id', function (req, res) {
    ProjetoDocumento.delete(req.params.id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 190 projeto_documento_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});
router.delete('/permanente/:id', function (req, res) {
    ProjetoDocumento.deletePermanente(req.params.id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 200 projeto_documento_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.post('/banco/:id', function (req, res) {
    ProjetoDocumento.removeDocumentoBanco(req.params.id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 211 projeto_documento_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

router.post("/verificaArquivos", function (req, res) {
    ProjetoDocumento.verificaArquivos().then((rows, fields) => {
        res.status(200).json(rows);
    }).catch(err => {
        console.log("ERRO: 222 projeto_documento_routes " + err);
        res.status(500).send({
            erro: err
        });
    });
});

module.exports = router;