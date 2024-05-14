const Usuario = require("./usuario.js");
const bcrypt = require("bcrypt");
const express = require('express');
const router = express.Router();
const utils = require("../utils/utils.js");
const Auth = require("../api/middlewares/auth.js");
const usuarioModel = require("./usuario_model.js");
const grupoModel = require("../grupo/grupo_model.js");
const ProjetoCadastro = require("../projeto/projeto_cadastro/projeto_cadastro.js");
const ProjetoCadastroModel = require("../projeto/projeto_cadastro/projeto_cadastro_model.js");

router.get("/", async (req, res) => {
    try {
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

        const result = await Usuario.select(fields, target);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send({ erro: error });
    }
});

router.get("/usuariosOrdenados", async (req, res) => {
    try {
        const result = await Usuario.selectUsuariosOrdenados();
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send({ erro: error });
    }
});

router.get("/testip", async (req, res) => {
    try {
        const result = await Usuario.testip();
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send({ erro: error });
    }
});

router.get("/getUserData", Auth.authenticateToken, async (req, res) => {
    try {
        const { id } = req.user;
        const user = await Usuario.userForSession(id);
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).send({ erro: error });
    }
});

router.get("/optionsForm", async (req, res) => {
    try {
      const usuarios = await usuarioModel.getAllUsers();
      const grupos = await grupoModel.getAllGroups();
      const templates = await ProjetoCadastroModel.getAllTemplates();
      res.status(200).json({ usuarios, grupos, templates });
    } catch (error) {
      console.error(error);
      res.status(500).send({ erro: error.message });
    }
  });
  

router.get("/byIds", async (req, res) => {
    try {
        const ids = req.query.ids.split(',').map(id => parseInt(id, 10));
        const result = await Usuario.selectByIds(ids);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send({ erro: error });
    }
});

router.get("/infoRedeSocial/:id", async (req, res) => {
    try {
        const result = await Usuario.infoRedeSocial(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send({ erro: error });
    }
});

router.get("/infoRedeSocialByIds", async (req, res) => {
    try {
        const ids = req.query.ids.split(',').map(id => parseInt(id, 10));
        const result = await Usuario.infoRedeSocialByIds(ids)
        res.status(200).json(result)
    } catch (error) {
        console.error(error);
        res.status(500).send({ erro: error });
    }
})

router.put("/updateProfile", async (req, res) => {
    try {
        const result = await Usuario.updateProfile(req.body);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send({ erro: error });
    }
});

router.post("/updatePassword", async (req, res) => {
    try {
        const hash = bcrypt.hashSync(req.body.senha, 10);
        req.body.senha = hash;
        const result = await Usuario.updatePassword(req.body);
        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send({ erro: error });
    }
});

router.post("/", async (req, res) => {
    try {
        var grupos = req.body.grupos
        delete req.body.grupos
        delete req.body.id
        const hash = bcrypt.hashSync(req.body.senha, 10);
        req.body.senha = hash;
        const result = await Usuario.insert(req.body);
        await Usuario.insereEmpresaUsuario(1, result.insertId);
        await Usuario.insereGruposUsuario(grupos, result.insertId, 1);
        res.status(201).json({ message: "Usuario cadastrado com sucesso!", result: result });
    } catch (error) {
        console.error(error);
        res.status(500).send({ erro: error });
    }
});

router.put("/", async (req, res) => {
    try {
        if (req.body.senha && req.body.senha !== '') {
            const hash = bcrypt.hashSync(req.body.senha, 10);
            req.body.senha = hash;
        }
        const result = await Usuario.update(req.body);
        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send({ erro: error });
    }
});

router.post("/updateAccess", async (req, res) => {
    try {
        const data = {
            id: req.body.id,
            data_acesso: utils.dateTimeAtual()
        };
        await Usuario.simpleUpdate(data);
        res.status(201).json({ message: "Atualizado" });
    } catch (error) {
        console.error(error);
        res.status(500).send({ erro: error });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const result = await Usuario.select(null, [{ name: 'id', value: req.params.id }]);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send({ erro: error });
    }
});


router.get('/t/:id', async (req, res) => {
    try {
        const result = await Usuario.getGrupos();
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send({ erro: error });
    }
});


module.exports = router;