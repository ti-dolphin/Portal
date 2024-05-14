const ErrorModel = require("./error_model.js");
const { LogModel } = require("rox-lib");

module.exports = function handleExpressError(err, req, res, next) {
  try {
    if (err instanceof ErrorModel) {
      res.status(err.code).send({
        message: err.message,
        erro: err.message,
      });
    } else {
      logger.log(
        new LogModel(
          "error",
          "Erro em requisição http",
          err.message,
          "REQUEST_ERROR",
          { error: err }
        )
      );
      res.status(500).send({
        message: err.message,
        erro: err,
      });
    }
  } catch (error) {
    logger.log(
      new LogModel(
        "error",
        "Erro em requisição http",
        err.message,
        "REQUEST_ERROR",
        { error: error }
      )
    );
    res.status(500).send({
      message: error.message,
      erro: error,
    });
  }
};
