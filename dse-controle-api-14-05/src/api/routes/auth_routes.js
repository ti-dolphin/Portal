const express = require("express");
const router = express.Router();
const ErrorHandler = require("../error_handler/error_handler");
const Auth = require("../middlewares/auth");
const AuthService = require("../../auth/auth_service");

router.get("/getNewToken", Auth.authenticateRefreshToken, async (req, res) => {
  const { refreshToken, user } = req;
  const tokens = await AuthService.getNewToken(user, refreshToken);
  res.status(201).send(tokens);
});

router.get("/login", Auth.getAuthFromHeader, async (req, res) => {
  const { login, password } = req.body;
  const tokens = await AuthService.login(login, password);
  res.status(200).send(tokens);
});

router.get("/recoveryPassword/:email", async (req, res) => {
  const result = await AuthService.recoveryPassword(req.params.email);
  res.status(200).send(result);
});

router.put("/logout", Auth.authenticateRefreshToken, async (req, res) => {
  const { refreshToken } = req;
  const result = await AuthService.logout(refreshToken);
  res.status(200).send(result);
});

module.exports = router;
