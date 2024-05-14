const conn = require("../../data_base");

module.exports = class CategoriaResponsavelRepository {
  static async getAllByCategory(categoryId) {
    const sql = "SELECT * FROM categoria_responsavel WHERE categoria_id = ?";
    return new Promise(function (resolve, reject) {
      // Do async job
      conn.query(sql, [categoryId], function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          resolve(rows, fields);
        }
      });
    });
  }

  static async getAllByCategoryWithNames(categoryId) {
    
    const sql = `SELECT cr.*, 
      (select nome from usuario where id = cr.usuario) as nomeUsuario,
      (select nome from papel where id = cr.papel) as nomePapel
      FROM categoria_responsavel cr
      WHERE categoria_id = ?  `;

    return new Promise(function (resolve, reject) {
      // Do async job
      conn.query(sql, [categoryId], function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          resolve(rows, fields);
        }
      });
    });
  }

  static async createMany(responsibles) {
    const sql =
      "INSERT IGNORE INTO categoria_responsavel (categoria_id, tipo, usuario, papel) VALUES ?";
    return new Promise(function (resolve, reject) {
      conn.query(sql, [responsibles], function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          resolve(rows, fields);
        }
      });
    });
  }

  static async deleteManyById(responsibleIds) {
    const sql = "DELETE FROM categoria_responsavel WHERE id IN (?)";
    return new Promise(function (resolve, reject) {
      conn.query(sql, [responsibleIds], function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          resolve(rows, fields);
        }
      });
    });
  }

  static async deleteAllByCategory(categorieId) {
    const sql = "DELETE FROM categoria_responsavel WHERE categoria_id = ?";
    return new Promise(function (resolve, reject) {
      conn.query(sql, [categorieId], function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          resolve(rows, fields);
        }
      });
    });
  }
};
