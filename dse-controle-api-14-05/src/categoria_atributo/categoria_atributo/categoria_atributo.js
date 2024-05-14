const con = require("../../../data_base");
const sqlUtils = require("../../utils/sqlUtils.js");
const CategoriaResponsavelRepository = require("../../repositories/categoria_responsavel_repository.js");
const CategoriaAtributoRepository = require("../../repositories/categoria_atributo_repository.js");
// const ErrorModel = require("../../../error_handling/error_model.js");
const ErrorModel = require("../../api/error_handler/error_model");


class CategoriaAtributo {
  /**
   * @param {string[]} fields[] campos a serem consultados
   * @param {object[]} target[] array de obejetos que conte nome do campo (name) e valor a ser consultado(value)
   * @returns {Promise}  que vai resolver em rows e fields
   **/
  static select(fields = null, targets = null) {
    const sql = sqlUtils.generate_select_query(
      targets,
      fields,
      "categoria_atributo"
    );
    return new Promise(function (resolve, reject) {
      // Do async job
      con.query(sql, function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          resolve(rows, fields);
        }
      });
    });
  }

  static consultaCategoriasArquivoPasta(data) {
    if (data.filha) {
      var sql =
        "SELECT * FROM categoria_atributo where id in (SELECT categoria_id FROM categoria_tem_atributo c join pasta_atributo p on p.id = c.atributo_id where c.pasta_id = " +
        data.pasta_id +
        " and p.flag_filha = 1)";
    } else {
      var sql =
        "SELECT * FROM categoria_atributo where id in (SELECT categoria_id FROM categoria_tem_atributo where pasta_id = " +
        data.pasta_id +
        ")";
    }
    // console.log("sql gerado:", sql)

    return new Promise(function (resolve, reject) {
      // Do async job
      con.query(sql, function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          resolve(rows, fields);
        }
      });
    });
  }

  static consultaCategoriasAtributosPasta(id) {
    const sql =
      `select ca.categoria_id, (select categoria from categoria_atributo where id = ca.categoria_id) as categoria 
        from categoria_tem_atributo ca
        join pasta_atributo pa on ca.atributo_id = pa.id
        where ca.pasta_id = ` +
      id +
      `  and pa.status = "Ativo" group by categoria_id order by categoria`;

    return new Promise(function (resolve, reject) {
      // Do async job
      con.query(sql, function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          resolve(rows, fields);
        }
      });
    });
  }

  static consultaAtributosCategoriaPasta(data) {
    var sql =
      "SELECT * FROM pasta_atributo where id in (SELECT atributo_id FROM categoria_tem_atributo where pasta_id = " +
      data.pasta_id +
      " and categoria_id = " +
      data.atributo_id +
      ")";
    if (data.flag_filha) {
      sql += " and flag_filha = 1";
    }

    return new Promise(function (resolve, reject) {
      // Do async job
      con.query(sql, function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          resolve(rows, fields);
        }
      });
    });
  }

  /**
   *
   * @param {object} data contem os pares de campo e valor
   * @returns {Promise}  que vai resolver em rows e fields
   */
  static insert(data) {
    const sql = sqlUtils.generate_insert_query(data, "categoria_atributo");
    //console.log("sql gerado:", sql)

    return new Promise(function (resolve, reject) {
      // Do async job
      con.query(sql, function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          resolve(rows, fields);
        }
      });
    });
  }

  /**
   *
   * @param {object} data contem os pares de campo e valor
   * @returns {Promise}  que vai resolver em rows e fields
   */
  static update(data) {
    const sql = sqlUtils.generate_update_query(data, "categoria_atributo");
    return new Promise(function (resolve, reject) {
      con.query(sql, function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          resolve(rows, fields);
        }
      });
    });
  }

  static delete(id) {
    const sql = "delete from categoria_atributo where id = " + id;
    return new Promise(function (resolve, reject) {
      con.query(sql, function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          resolve(rows, fields);
        }
      });
    });
  }

  static async addResponsibles(categoryId, responsibles) {
    const category = (await CategoriaAtributoRepository.getCategory(categoryId))[0];

    if (!category) {
      throw new ErrorModel(404, "Categoria não encontrada");
    }

    const users = responsibles
      .filter((r) => r.tipo == "usuario")
      .map((r) => r.usuario);
    const roles = responsibles
      .filter((r) => r.tipo == "papel")
      .map((r) => r.papel);

      if (users.some((u) => u == null))
      throw new ErrorModel(400, "Usuário inválido");
    if (roles.some((r) => r == null))
      throw new ErrorModel(400, "Papel inválido");

    const result = await CategoriaResponsavelRepository.getAllByCategory(
      categoryId
    );

    const newResponsibles = responsibles.filter(
      (r) =>
        !result.some((rr) => rr.usuario == r.usuario && rr.papel == r.papel)
    );

    if (newResponsibles.length > 0) {
      const createdResponsibles =
        await CategoriaResponsavelRepository.createMany(
          responsibles.map((r) => {
            return [categoryId, r.tipo, r.usuario, r.papel];
          })
        );
      return createdResponsibles;
    } else {
      return [];
    }
  }

  static async removeResponsibles(categoryId, responsibles) {
    const category = (await CategoriaAtributoRepository.getCategory(categoryId))[0];

    if (!category) {
      throw new ErrorModel(404, "Categoria não encontrada");
    }

    const users = responsibles
      .filter((r) => r.tipo == "usuario")
      .map((r) => r.usuario);

    const roles = responsibles
      .filter((r) => r.tipo == "papel")
      .map((r) => r.papel);

    if (users.some((u) => u == null))
      throw new ErrorModel(400, "Usuário inválido");
    if (roles.some((r) => r == null))
      throw new ErrorModel(400, "Papel inválido");

    const registeredResponsibles =
      await CategoriaResponsavelRepository.getAllByCategory(categoryId);

    const responsiblesToRemove = registeredResponsibles.filter((r) =>
      responsibles.some((rr) => rr.usuario == r.usuario && rr.papel == r.papel)
    );

    if (responsiblesToRemove.length > 0) {
      const deletedResponsibles =
        await CategoriaResponsavelRepository.deleteManyById(
          responsiblesToRemove.map((r) => r.id)
        );
      return deletedResponsibles;
    } else {
      return [];
    }
  }

  static async removeAllResponsibles(categorieId) {
    return CategoriaResponsavelRepository.deleteAllByCategory(categorieId);
  }

  static async notifyResponsibles() {}
}
module.exports = CategoriaAtributo;
