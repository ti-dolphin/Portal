const connection = require("../../data_base.js");

module.exports = class ProcessoRepository {
  constructor(dependencies) {
    this.connection = dependencies.connection ? dependencies.connection : connection;
  }

  async insertProcessoCampo(data) {
    return new Promise((resolve, reject) => {
      try {
        const query = `INSERT INTO processo_campos(processo_passo_id, processo_campo_cadastro_id, valor) VALUES (?, ?, ?)`;
        this.connection.query(
          query,
          [data.processo_passo_id, data.processo_campo_cadastro_id, data.valor],
          function (err, result) {
            if (err) {
              reject(err);
            }
            resolve(result);
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  async insertProcessoArquivo(data){
    return new Promise((resolve, reject) => {
      try {
        const query = `INSERT INTO processo_arquivo(id_arquivo, campo_id, url_arquivo) VALUES (?, ?, ?)`;
        this.connection.query(
          query,
          [data.id_arquivo, data.campo_id, data.url_arquivo],
          function (err, result) {
            if (err) {
              reject(err);
            }
            resolve(result);
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }
};
