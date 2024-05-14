const con = require("../../../data_base");
const sqlUtils = require("../../utils/sqlUtils.js");

class processoFluxoCadastroModel {
  static queryReturn(sql) {
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

  static async getObservers(body) {
    const sql = `SELECT u.id, u.nome FROM processo_observadores p JOIN usuario u ON p.usuario_id = u.id WHERE p.area = '${body.area}' AND p.processo_id = ${body.id}`;

    return await this.queryReturn(sql);
  }

  static movesObservers(novos_observadores) {
    const sql = `insert into processo_observadores (processo_id, area, usuario_id) VALUES ?`;

    return new Promise(function (resolve, reject) {
      con.query(sql, [novos_observadores], function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          resolve(rows, fields);
        }
      });
    });
  }
  static async getFlow(processo_anterior) {
    const sql =
      `select * from processo_fluxo_cadastro where condicao = 'sim' and processo_cadastro_id =` +
      processo_anterior;

    return await this.queryReturn(sql);
  }

  static async getSteps(processo_anterior, processo_novo) {
    const sql =
      `select * from processo_passo_cadastro where processo_cadastro_id in (` +
      processo_anterior +
      `,` +
      processo_novo +
      `)`;

    return await this.queryReturn(sql);
  }

  static async getFields(campo_ids, processo_antigo, processo_novo) {
    if (campo_ids.length === 0) {
      return Promise.resolve([]); // Retorna uma Promise resolvida com uma matriz vazia se não houver campos
    }

    const sql = `
        SELECT *
        FROM processo_campo_cadastro
        WHERE processo_passo_cadastro_id IN (
            SELECT id
            FROM processo_passo_cadastro
            WHERE id_diagrama IN (
                SELECT id_diagrama
                FROM processo_passo_cadastro
                WHERE id IN (${campo_ids.join(",")})
            ) AND (processo_cadastro_id = ${processo_antigo} OR processo_cadastro_id = ${processo_novo})
        )`;

    return new Promise(function (resolve, reject) {
      con.query(sql, function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static removeFlow(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return Promise.resolve();
    }

    const idString = ids.join(",");

    const sql =
      "DELETE FROM processo_fluxo_cadastro WHERE id IN (" + idString + ")";

    return new Promise(function (resolve, reject) {
      con.query(sql, function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static verifyExistingFlow(data) {
    try {
      let sql = "select * from processo_fluxo_cadastro where id > 0 ";

      Object.keys(data).map((key) => {
        sql = sql + " and " + key + " = " + con.escape(data[key]);
      });

      return new Promise(function (resolve, reject) {
        con.query(sql, function (err, rows, fields) {
          if (err) {
            reject(err);
          } else {
            if (rows.length > 0) {
              resolve(false);
            } else {
              resolve(true);
            }
          }
        });
      });
    } catch (error) {
      resolve(true);
    }
  }

  static getByProcessoCadastroId(processo_cadastro_id) {
    return new Promise(function (resolve, reject) {
      con.query(
        "select * from processo_fluxo_cadastro where id = ?;",
        processo_cadastro_id,
        function (err, rows, fields) {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  static saveMany(novo_fluxo) {
    return new Promise(function (result, reject) {
      try {
        const lista = novo_fluxo.map((fluxo) => [
          fluxo.condicao,
          fluxo.valor_condicao,
          fluxo.status,
          fluxo.passo_atual,
          fluxo.passo_seguinte,
          fluxo.passo_decisao,
          fluxo.processo_campo_cadastro_id,
          fluxo.processo_cadastro_id,
        ]);
        con.query(
          "INSERT INTO processo_fluxo_cadastro (condicao, valor_condicao, status, passo_atual, passo_seguinte, passo_decisao, processo_campo_cadastro_id, processo_cadastro_id) VALUES ?",
          [lista],
          function (err, rows, fields) {
            if (err) {
              reject(err);
            } else {
              result(rows, fields);
            }
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  static insert(fluxo) {
    return new Promise(async function (resolve, reject) {
      try {
        const sql = sqlUtils.generate_insert_query(
          fluxo,
          "processo_fluxo_cadastro"
        );
        con.query(sql, function (err, rows, fields) {
          if (err) {
            reject(err);
          } else {
            resolve(rows, fields);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  static async updateArchivesFields(processo_novo) {
    const sql = `SELECT * FROM processo_campo_arquivo WHERE processo_id = ${processo_novo}`;
    console.log("sql: ", sql);
    return new Promise(async function (resolve, reject) {
      con.query(sql, async function (err, rows, fields) {
        console.log("fiz a connect");
        if (err) {
          reject(err);
        } else {
          try {
            console.log("entrei no try");
            const map = rows.map(async (r) => {
              if (
                r.cadastro_nova_pasta_campo_id != 0 &&
                r.cadastro_nova_pasta_campo_id != -1
              ) {
                let campo_novo =
                  await processoFluxoCadastroModel.queryNewFields(
                    r.cadastro_nova_pasta_campo_id,
                    processo_novo
                  );
                if (campo_novo) {
                  await processoFluxoCadastroModel.editArchivesFields(
                    r.id,
                    campo_novo.id
                  );
                }
              }
            });
            await Promise.all(map);
            console.log("Todas as operações foram concluídas.");

            resolve();
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  static editArchivesFields(id, novoCampoId) {
    const sql = `UPDATE processo_campo_arquivo SET cadastro_nova_pasta_campo_id = ${novoCampoId} WHERE id = ${id}`;

    return new Promise(function (resolve, reject) {
      con.query(sql, function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          resolve(rows[0]);
        }
      });
    });
  }

  static queryNewFields(campo_id, processo_novo) {
    const sql =
      `SELECT * FROM processo_campo_cadastro
            WHERE processo_passo_cadastro_id = (
                    SELECT id
                    FROM processo_passo_cadastro
                    WHERE id_diagrama = (
                            SELECT id_diagrama
                            FROM processo_passo_cadastro
                            WHERE id = (
                                    SELECT processo_passo_cadastro_id
                                    FROM processo_campo_cadastro
                                    WHERE id = ${campo_id} LIMIT 1
                                ) LIMIT 1
                        )
                        AND processo_cadastro_id = ${processo_novo} LIMIT 1
                )
                AND ordem = (
                    SELECT ordem
                    FROM processo_campo_cadastro
                    WHERE id = ${campo_id} LIMIT 1
                ) `;
    return new Promise(function (resolve, reject) {
      // Do async job
      con.query(sql, function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          if (rows.length > 0) {
            resolve(rows[0]);
          } else {
            resolve(false);
          }
        }
      });
    });
  }

  static updateCopyFields(processo_novo) {
    const sql = `SELECT * FROM processo_campo_copia where processo_cadastro_id = ${processo_novo}`;

    return new Promise(function (resolve, reject) {
      // Do async job
      con.query(sql, async function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          try {
            const map = rows.map(async (r) => {
              if (
                r.processo_campo_copia_id != 0 &&
                r.processo_campo_copia_id != -1
              ) {
                let campo_novo =
                  await processoFluxoCadastroModel.queryNewFields(
                    r.processo_campo_copia_id,
                    processo_novo
                  );
                if (campo_novo) {
                  await processoFluxoCadastroModel.editCopyFields(
                    r.id,
                    campo_novo.id
                  );
                }
              }
            });

            await Promise.all(map);
            resolve();
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  static editCopyFields(id, processo_campo_copia_id) {
    const sql = `update processo_campo_copia set processo_campo_copia_id = ${processo_campo_copia_id} WHERE id = ${id} `;

    return new Promise(function (resolve, reject) {
      con.query(sql, function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          resolve(rows[0]);
        }
      });
    });
  }

  static queryNewFields(campo_id, processo_novo) {
    const sql =
      `SELECT *
            FROM processo_campo_cadastro
            WHERE processo_passo_cadastro_id = (
                    SELECT id
                    FROM processo_passo_cadastro
                    WHERE id_diagrama = (
                            SELECT id_diagrama
                            FROM processo_passo_cadastro
                            WHERE id = (
                                    SELECT processo_passo_cadastro_id
                                    FROM processo_campo_cadastro
                                    WHERE id = ${campo_id} LIMIT 1
                                ) LIMIT 1
                        )
                        AND processo_cadastro_id = ${processo_novo} LIMIT 1
                )
                AND ordem = (
                    SELECT ordem
                    FROM processo_campo_cadastro
                    WHERE id = ${campo_id} LIMIT 1
                ) `;
    return new Promise(function (resolve, reject) {
      // Do async job
      con.query(sql, function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          if (rows.length > 0) {
            resolve(rows[0]);
          } else {
            resolve(false);
          }
        }
      });
    });
  }
}

module.exports = processoFluxoCadastroModel;


// SELECT *
//             FROM processo_campo_cadastro
//             WHERE processo_passo_cadastro_id = (
//                       SELECT id
//                       FROM processo_passo_cadastro
//                       WHERE id_diagrama = (
//                               SELECT id_diagrama
//                               FROM processo_passo_cadastro
//                               WHERE id = (
//                                       SELECT processo_passo_cadastro_id
//                                       FROM processo_campo_cadastro
//                                       WHERE id = 248623
//                                   )
//                         )
//                         AND processo_cadastro_id = 2683
//                 )
//                 AND ordem = (
//                       SELECT ordem
//                       FROM processo_campo_cadastro
//                       WHERE id = 248623
//                   )