const connection = require("../../data_base.js");

module.exports = class ProcessoCampoRepository {
  static async getCampoValor(campoCadastroId, passo_id) {
    return new Promise((resolve, reject) => {
      try {
        const sql = `SELECT valor FROM processo_campos WHERE processo_campo_cadastro_id = ? AND processo_passo_id = ?`;
        connection.query(sql, [campoCadastroId, passo_id], function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    } catch (error) {
        reject(error);
      }
    });
  }
};
