const express = require("express");
const router = express.Router();
const AuthService = require("../../auth/auth_service");
const ProcessoExecucaoService = require("../../services/processo_execucao_service.js");

router.post("/save-fields", async (req, res) => {
  const data = req.body;
  const result = await ProcessoExecucaoService.saveFields(data);
  res.status(201).send(result);
});

router.post("/envia-arquivo", async (req, res) => {
  const data = req.body;
  const result = await ProcessoExecucaoService.insertFile(data);
  res.status(201).send(result);
});

router.post("/obtem-atributos", async (req, res) => {
  const data = req.body;
  const result = await ProcessoExecucaoService.getFileAttributes(data);
  res.status(201).send(result);
});

module.exports = router;
