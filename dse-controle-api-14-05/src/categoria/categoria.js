const con = require("../../data_base");
const sqlUtils = require("../utils/sqlUtils.js");
const CategoriaRepository = require("../repositories/categoria_repository.js");
// const ErrorModel = require("../../error_handling/error_model");
const ErrorModel = require("../api/error_handler/error_model");
const CategoriaResponsavelRepository = require("../repositories/categoria_responsavel_repository.js");


class Categoria {
  /**
   * @param {string[]} fields[] campos a serem consultados
   * @param {object[]} target[] array de obejetos que conte nome do campo (name) e valor a ser consultado(value)
   * @returns {Promise}  que vai resolver em rows e fields
   **/
  static select(fields = null, targets = null) {
    const sql = sqlUtils.generate_select_query(targets, fields, "categoria");
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

  static simpleGet(){
    const sql = "select * from categoria_atributo order by categoria"
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

  static selectProjeto(idProjeto) {
    const sql =
      "SELECT c.* FROM projeto_cadastro p join projeto_pasta pr on p.id = pr.projeto_id join categoria c on c.id = pr.categoria_id where p.id = " +
      idProjeto +
      " group by c.id";

    return new Promise(function (resolve, reject) {
      // Do async job
      con.query(sql, function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          if (!rows[0]) {
            resolve([{ id: 9, nome: "OUTROS", status: null }], fields);
          } else {
            resolve(rows, fields);
          }
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
    const sql = sqlUtils.generate_insert_query(data, "categoria");
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
    const sql = sqlUtils.generate_update_query(data, "categoria");
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
    const category = (await CategoriaRepository.getCategory(categoryId))[0];

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

  static async getCategoriesWithResponsibles() {
    const result = []
    const categories = await this.simpleGet()

    const map = categories.map(async (c) => {
      const responsibles = await CategoriaResponsavelRepository.getAllByCategoryWithNames(c.id);
      const usuarios = responsibles.filter((r) => r.tipo === 'usuario')
      const papel = responsibles.filter((r) => r.tipo === 'papel')
      result.push({...c, usuarios, papel})
    })

    await Promise.all(map)

    return result

  }

  static async removeResponsibles(categoryId, responsibles) {
    const category = (await CategoriaRepository.getCategory(categoryId))[0];

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

  static async notifyResponsibles() {
    
  }
}
module.exports = Categoria;
