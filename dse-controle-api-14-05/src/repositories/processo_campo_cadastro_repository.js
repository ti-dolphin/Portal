const connection = require("../../data_base.js");
const sqlUtils = require("../utils/sqlUtils.js");

module.exports = class ProcessoCampoCadastroRepository {
  static async getCamposByPassos(passosId) {
    const sql = `SELECT * FROM processo_campo_cadastro WHERE processo_passo_cadastro_id IN (${passosId.join(
      ","
    )})`;
    return sqlUtils.executeQuery(sql);
  }

  static async insertManyCampos(campos) {
    const sql = sqlUtils.generate_insert_many_query(
      campos,
      "processo_campo_cadastro"
    );

    return await sqlUtils.executeQuery(sql);
  }

  static async getManyStartingAtId(id, length) {
    const sql = `SELECT * FROM processo_campo_cadastro WHERE id >= ${id} LIMIT ${length}`;
    return sqlUtils.executeQuery(sql);
  }

  static async getOpcaoSelectByCampos(camposId) {
    const sql = `SELECT * FROM processo_campo_opcao_select WHERE processo_campo_cadastro_id IN (${camposId.join(
      ","
    )})`;
    return await sqlUtils.executeQuery(sql);
  }

  static async insertManyOpcoesSelect(dataArray) {
    const sql = sqlUtils.generate_insert_many_query(
      dataArray,
      "processo_campo_opcao_select"
    );

    return await sqlUtils.executeQuery(sql);
  }

  static async getMascaraByCampos(camposId) {
    const sql = `SELECT * FROM processo_campo_mascara WHERE processo_campo_cadastro_id IN (${camposId.join(
      ","
    )})`;
    return sqlUtils.executeQuery(sql);
  }

  static async insertManyMascara(dataArray) {
    const sql = sqlUtils.generate_insert_many_query(
      dataArray,
      "processo_campo_mascara"
    );

    return await sqlUtils.executeQuery(sql);
  }

  static async getCopiaByCampos(camposId) {
    const sql = `SELECT * FROM processo_campo_copia WHERE processo_campo_cadastro_id IN (${camposId.join(
      ","
    )})`;
    return sqlUtils.executeQuery(sql);
  }

  static async insertManyCopia(dataArray) {
    const sql = sqlUtils.generate_insert_many_query(
      dataArray,
      "processo_campo_copia"
    );

    return await sqlUtils.executeQuery(sql);
  }

  static async getArquivoByCampos(camposId) {
    const sql = `SELECT * FROM processo_campo_arquivo WHERE processo_campo_cadastro_id IN (${camposId.join(
      ","
    )})`;
    return sqlUtils.executeQuery(sql);
  }

  static async insertManyArquivoCampo(dataArray) {
    const sql = sqlUtils.generate_insert_many_query(
      dataArray,
      "processo_campo_arquivo"
    );

    return await sqlUtils.executeQuery(sql);
  }
};
