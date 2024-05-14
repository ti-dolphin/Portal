const con = require("../../../data_base");
const sqlUtils = require("../../utils/sqlUtils.js");
const fs = require("fs");
const GoogleCloudStorage = require("../../../google-cloud-storage");
const ProcessoArquivo = require("../../processo/processo_arquivo/processo_arquivo.js");
const ProjetoDocumentoRepository = require("./projeto_documento_repository.js");
const Comunicacao = require("../../comunicacao/comunicacao.js");

class ProjetoDocumento {
  /**
   * @param {string[]} fields[] campos a serem consultados
   * @param {object[]} target[] array de obejetos que conte nome do campo (name) e valor a ser consultado(value)
   * @returns {Promise}  que vai resolver em rows e fields
   **/
  static select(fields = null, targets = null) {
    const sql = sqlUtils.generate_select_query(
      targets,
      fields,
      "projeto_documento"
    );
    const sql2 = sql + " order by titulo";
    return new Promise(function (resolve, reject) {
      // Do async job
      con.query(sql2, function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          resolve(rows, fields);
        }
      });
    });
  }

  static selectLike(data) {
    const sql =
      "SELECT * FROM projeto_documento where projeto_diretorio_id = " +
      data.pasta_id +
      ' and titulo like "%' +
      data.nome +
      '%"';
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

  static getURLArquivo(caminhoArquivo) {
    return new Promise(async function (resolve, reject) {
      if (caminhoArquivo.id) {
        GoogleCloudStorage.getFilesDirectory(
          "documentos/" + caminhoArquivo.id + "/"
        )
          .then((arquivo) => {
            resolve(arquivo.url);
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        reject("Objeto sem urlArquivo ou não existe no GCS");
      }
    });
  }

  static verificaArquivos() {
    return new Promise(async function (resolve, reject) {
      try {
        const arquivos = await ProjetoDocumento.getAtivos();
        var array = [];

        for (const a of arquivos) {
          var caminho = "documentos/" + a.id + "/" + a.titulo;
          if (!(await GoogleCloudStorage.verificaArquivo(caminho))) {
            array.push(a);
          }
        }

        resolve(array);
      } catch (error) {
        reject(error);
      }
    });
  }

  static getUser(userId) {

    const sql = "select * from usuario where id = "+userId

    return new Promise(function (resolve, reject) {
      // Do async job
      con.query(sql, function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          if(rows.length > 0){
            resolve(rows[0]);
          } else{
            resolve(false)
          }
        }
      });
    });
  }

  static async expiringDocumentsReports(userId) {
    const user = await this.getUser(userId)
    const endDate = new Date(new Date().setDate(new Date().getDate() + 15));
    let result

    if(user && user.tipo === "Administrador"){
      result = await ProjetoDocumentoRepository.getDocumentsExpiringReportsAdmin(endDate);
    } else{
      result = await ProjetoDocumentoRepository.getDocumentsExpiringReports(userId, endDate);
    }

    if (result.length == 0) return [];

    const expiringDocuments = [];

    result.forEach((row) => {
      const now = new Date();
      const nowPlus15 = new Date(new Date().setDate(new Date().getDate() + 15));
      const nowPlus10 = new Date(new Date().setDate(new Date().getDate() + 10));
      const nowPlus5 = new Date(new Date().setDate(new Date().getDate() + 5));
      const nowPlus1 = new Date(new Date().setDate(new Date().getDate() + 1));

      const expiringIn =
        row.parsed_date < now
          ? 0
          : row.parsed_date < nowPlus1
            ? 1
            : row.parsed_date < nowPlus5
              ? 5
              : row.parsed_date < nowPlus10
                ? 10
                : row.parsed_date < nowPlus15
                  ? 15
                  : null;

      if (expiringIn != null) {
        expiringDocuments.push({
          document: row,
          daysToExpire: expiringIn,
        });
      }
    });

    return result


  }


  static getAtivos() {
    const sql =
      "SELECT * FROM projeto_documento where status = 'Ativo' order by id desc";
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
    var doc = data.doc;
    delete data.doc;

    const sql = sqlUtils.generate_insert_query(data, "projeto_documento");
    // console.log(sql)
    return new Promise(function (resolve, reject) {
      con.query(sql, function (err, rows, fields) {
        if (err) {
          console.log("erro aqui");
          reject(err);
        } else {
          var caminho = "documentos/" + rows.insertId + "/" + data.titulo;

          GoogleCloudStorage.upload(doc, caminho)
            .then(async () => {
              data.id = rows.insertId;
              data.url = rows.insertId + "/" + data.titulo;
              await ProjetoDocumento.simpleUpdate(data);
              resolve(rows, fields);
            })
            .catch((err) => {
              reject(err);
            });
        }
      });
    });
  }

  static simpleUpdate(data) {
    const sql = sqlUtils.generate_update_query(data, "projeto_documento");
    return new Promise(function (resolve, reject) {
      con.query(sql, function (err, rows, fields) {
        if (err) {
          console.log("erro aqui e epa");
          reject(err);
        } else {
          resolve(rows, fields);
        }
      });
    });
  }

  static selectIdPastaArquivo(id) {
    return new Promise(function (resolve, reject) {
      try {
        if (id) {
          const sql =
            "SELECT projeto_diretorio_id as pasta_id from projeto_documento where id =" +
            id;
          con.query(sql, function (err, rows, fields) {
            if (err) {
              reject(err);
            } else {
              resolve(rows, fields);
            }
          });
        } else {
          resolve([]);
        }
      } catch (error) {
        reject(error)
      }
    });
    }

  /**
   *
   * @param {object} data contem os pares de campo e valor
   * @returns {Promise}  que vai resolver em rows e fields
   */
  static update(data) {
    var doc = data.doc;
    delete data.doc;

    const sql = sqlUtils.generate_update_query(data, "projeto_documento");

    return new Promise(function (resolve, reject) {
      con.query(sql, function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          if (doc) {
            const sql2 =
              "select titulo,url from projeto_documento where id = " + data.id;

            con.query(sql2, function (err, rows, fields) {
              if (err) {
                reject(err);
              } else {
                var caminhoVelho = "documentos/" + rows[0].url;
                GoogleCloudStorage.verificaArquivo(caminhoVelho).then((r) => {
                  if (r) {
                    GoogleCloudStorage.delete(caminhoVelho)
                      .then(() => {
                        // delete arquivo antigo

                        var caminhoNovo =
                          "documentos/" + data.id + "/" + data.titulo;

                        GoogleCloudStorage.upload(doc, caminhoNovo)
                          .then(() => {
                            // cadastra arquivo novo
                            const sql3 =
                              "update projeto_documento set url = '" +
                              data.id +
                              "/" +
                              rows[0].titulo.replaceAll("'", "") +
                              "' where id = " +
                              data.id;

                            con.query(sql3, function (err) {
                              //atualiza a URL com o titulo do novo documento
                              if (err) {
                                reject(err);
                              } else {
                                resolve(rows, fields);
                              }
                            });
                          })
                          .catch((err) => {
                            reject(err);
                          });
                      })
                      .catch((err) => {
                        reject(err);
                      });
                  }
                });
              }
            });
          } else {
            resolve(rows, fields);
          }
        }
      });
    });
  }

  static updateQuery(data) {
    const sql = sqlUtils.generate_update_query(data, "projeto_documento");
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

  static renomeia(body) {
    const sql = "SELECT titulo,url FROM projeto_documento where id =" + body.id;
    return new Promise(function (resolve, reject) {
      con.query(sql, function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          var extensao =
            rows[0].titulo.split(".")[rows[0].titulo.split(".").length - 1];
          var url = body.id + "/" + body.nome + "." + extensao;

          try {
            if (typeof url === "string") {
              url = url.replaceAll("'", "");
            }
          } catch (error) {
            console.log(url);
            console.log("erro ao retirar aspas simples da url");
          }

          var caminhoOrigem = "documentos/" + rows[0].url;
          var caminhoDestino =
            "documentos/" + body.id + "/" + body.nome + "." + extensao;

          GoogleCloudStorage.renomeia(caminhoOrigem, caminhoDestino)
            .then(() => {
              var sql2 = "";
              if (body.complemento && body.complemento !== "undefined") {
                sql2 =
                  "update projeto_documento set url = '" +
                  url +
                  "', complemento = '" +
                  body.complemento.replaceAll("'", "") +
                  "' , titulo = '" +
                  body.nome.replaceAll("'", "") +
                  "." +
                  extensao +
                  "' where id =" +
                  body.id;
              } else {
                sql2 =
                  "update projeto_documento set url = '" +
                  url +
                  "', titulo = '" +
                  body.nome.replaceAll("'", "") +
                  "." +
                  extensao +
                  "' where id =" +
                  body.id;
              }
              con.query(sql2, async function (err, linhas, fields) {
                if (err) {
                  console.log("Erro ao atualizar URL no banco");
                  console.log(err);
                  reject(err);
                } else {
                  try {
                    // await ProcessoArquivo.ajustaUrl()
                  } catch (error) {
                    console.log("renomeia AtualizaProcesso_arquivo: " + error);
                  } finally {
                    resolve(rows, fields);
                  }
                }
              });
            })
            .catch((err) => {
              reject(err);
            });
        }
      });
    });
  }

  static AtualizaProcesso_arquivo(projeto_documento_id, nova_url) {
    // var sql = "UPDATE processo_arquivo SET url_arquivo = '"+nova_url+"' where id > 0 and id_arquivo = "+projeto_documento_id
    // return new Promise(function (resolve, reject) {
    //     con.query(sql, async function (err, rows, fields) {
    //         if(err){
    //             console.log("ERRO AtualizaProcesso_arquivo: "+ err)
    //             reject(err);
    //         }else{
    //             resolve(true)
    //         }
    //     })
    // });
    return false;
  }

  static consultaAtributo(documento_id) {
    var sql =
      "SELECT * FROM projeto_documento_atributo where projeto_documento_id =" +
      documento_id;
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

  static async consultaCategoriaDocumento(documento_id) {
    const sql =
      `SELECT ca.* FROM categoria_tem_atributo c
        join categoria_atributo ca on c.categoria_id = ca.id
        where atributo_id IN(SELECT pasta_atributo_id FROM projeto_documento_atributo where projeto_documento_id = ` +
      documento_id +
      `)`;

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

  static async consultadocumentosAtributos(pasta_id) {
    const sql =
      `SELECT * FROM projeto_documento p 
        where status = 'Ativo' and p.projeto_diretorio_id = ` + pasta_id;
    return new Promise(function (resolve, reject) {
      con.query(sql, async function (err, rows, fields) {
        if (err) {
          reject(err);
          console.log("err");
        } else {
          const map = rows.map(async (doc) => {
            doc.atr = await ProjetoDocumento.consultaAtributo(doc.id);
            doc.categoria = await ProjetoDocumento.consultaCategoriaDocumento(
              doc.id
            );
          });
          await Promise.all(map);
          resolve(rows);
        }
      });
    });
  }

  static consultadocumentoAtributos(projeto_documento_id) {
    const sql =
      `SELECT * FROM projeto_documento p 
        where p.id = ` + projeto_documento_id;

    return new Promise(function (resolve, reject) {
      con.query(sql, async function (err, rows, fields) {
        if (err) {
          reject(err);
          console.log("err");
        } else {
          if (rows.length > 0) {
            var doc = rows[0];
            doc.atr = await ProjetoDocumento.consultaAtributo(doc.id);
            doc.categoria = await ProjetoDocumento.consultaCategoriaDocumento(
              doc.id
            );
            resolve(doc);
          } else {
            resolve(false);
          }
        }
      });
    });
  }

  static consultaPastaDocumentoNome(pasta_id) {
    const sql =
      "select * from pasta_documento_nome where pasta_id = " +
      pasta_id +
      " order by ordem asc";
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

  static geraNome(docs_nome, doc, pasta) {
    var nome = "";
    docs_nome.map((i) => {
      switch (i.pasta_documento_nome_tipo_id) {
        case 1:
          nome += i.valor;
          break;

        case 2:
          doc.atr.map((a) => {
            if (a.pasta_atributo_id == parseInt(i.atributo_id)) {
              nome += a.valor;
            }
          });
          break;

        case 3:
          nome += i.valor;
          break;

        case 4:
          nome += pasta[0].nome;
          break;

        case 5:
          nome += doc.categoria[0] ? doc.categoria[0].categoria : "";
          break;

        default:
          break;
      }
    });

    return nome;
  }

  static consultaPasta(pasta_id) {
    const sql = "select * from projeto_pasta where id=" + pasta_id;
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

  static renomeiaArquivos(pasta_id) {
    return new Promise(async function (resolve, reject) {
      try {
        var pasta = await ProjetoDocumento.consultaPasta(pasta_id);
        var docs_nome = await ProjetoDocumento.consultaPastaDocumentoNome(
          pasta_id
        );
        var docs = await ProjetoDocumento.consultadocumentosAtributos(pasta_id);
        var nomes = [];
        if (docs_nome.length > 0 && docs.length > 0) {
          docs.map(async (doc, index) => {
            var nome = ProjetoDocumento.geraNome(docs_nome, doc, pasta);
            var teste = true;
            nomes.map((n) => {
              if (n.nome == nome) {
                n.qtd++;
                nome += " (" + n.qtd + ")";
                teste = false;
              }
            });
            if (teste) {
              nomes.push({ nome: nome, qtd: 0 });
            }
            await ProjetoDocumento.renomeia({ id: doc.id, nome: nome });
            if (docs.length == index + 1) {
              resolve();
            }
          });
        } else {
          resolve();
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  static renomeiaArquivo(projeto_documento_id, substitui_arquivo) {
    return new Promise(async function (resolve, reject) {
      try {
        var doc = await ProjetoDocumento.consultadocumentoAtributos(
          projeto_documento_id
        );
        if (doc) {
          var pasta = await ProjetoDocumento.consultaPasta(
            doc.projeto_diretorio_id
          );
          var docs_nome = await ProjetoDocumento.consultaPastaDocumentoNome(
            doc.projeto_diretorio_id
          );
          if (docs_nome.length > 0) {
            var nome = await ProjetoDocumento.geraNome(docs_nome, doc, pasta);
            var extensao =
              doc.titulo.split(".")[doc.titulo.split(".").length - 1];
            var nome_igual =
              await ProjetoDocumento.verificaNomeIgualRetonaArquivo(
                nome + "." + extensao
              );
            if (nome_igual) {
              // if (substitui_arquivo) {
              //   await ProjetoDocumento.simpleUpdate({
              //     id: nome_igual.id,
              //     status: "Inativo",
              //   });
              // } else {
              // }
              if (!(nome_igual == 1 && doc.titulo == nome + "." + extensao)) {
                var n = parseInt(nome_igual) + 1;
                nome += " (" + n + ")";
              }
            }
            await ProjetoDocumento.renomeia({ id: doc.id, nome: nome });
            resolve(true);
          } else {
            resolve(true);
          }
        } else {
          resolve(true);
        }
      } catch (error) {
        console.log("erro renomeiaArquivo");
        console.log(error);
        reject(error);
      }
    });
  }

  static verificaNomeIgual(nome) {
    const sql =
      "select * from projeto_documento where status = 'Ativo' and titulo = " +
      con.escape(nome) +
      "";
    return new Promise(function (resolve, reject) {
      con.query(sql, function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          if (rows.length > 0) {
            resolve(rows.length);
          } else {
            resolve(false);
          }
        }
      });
    });
  }

  static verificaNomeIgualRetonaArquivo(nome) {
    const sql =
      "select * from projeto_documento where status = 'Ativo' and titulo = " +
      con.escape(nome) +
      "";
    return new Promise(function (resolve, reject) {
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

  static delete(id) {
    const sql =
      "update projeto_documento set status = 'Inativo' where id = " + id;
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

  static deletePermanente(id) {
    const sql2 = "select titulo,url from projeto_documento where id = " + id;
    return new Promise(function (resolve, reject) {
      try {
        con.query(sql2, async function (err, rows, fields) {
          if (err) {
            reject(err);
          } else {
            if (rows.length > 0) {
              if (
                await GoogleCloudStorage.verificaArquivo(
                  "documentos/" + rows[0].url
                )
              ) {
                GoogleCloudStorage.delete("documentos/" + rows[0].url)
                  .then(async () => {
                    await ProjetoDocumento.removeDocumentoBanco(id);
                    console.log(
                      "Arquivo " + id + " deleteao de forma permanente"
                    );
                    resolve(rows, fields);
                  })
                  .catch((err) => {
                    reject(err);
                  });
              } else {
                await ProjetoDocumento.removeDocumentoBanco(id);
                resolve("Arquivo " + id + " não existia e foi excluido do banco");
              }
            } else {
              resolve("Arquivo nao existe no banco " + id);
            }
          }
        });
      } catch (error) {
        reject(error)
      }
    });
  }

  static removeDocumentoBanco(id) {
    const sql = "delete from projeto_documento where id = " + id;
    return new Promise(function (resolve, reject) {
      try {
        con.query(sql, function (err, rows, fields) {
          if (err) {
            reject(err);
          } else {
            resolve(rows, fields);
            console.log("Arquivo de ID: " + id + " excluido do banco de dados");
          }
        });
      } catch (error) {
        reject(error)
      }
    });
  }

  static async notifyExpiringDocuments() {
    const endDate = new Date(new Date().setDate(new Date().getDate() + 15));
    const result = await ProjetoDocumentoRepository.getDocumentsExpiringBetween(endDate);

    if (result.length == 0) return [];

    const expiringDocuments = [];

    result.forEach((row) => {
      const now = new Date();
      const nowPlus15 = new Date(new Date().setDate(new Date().getDate() + 15));
      const nowPlus10 = new Date(new Date().setDate(new Date().getDate() + 10));
      const nowPlus5 = new Date(new Date().setDate(new Date().getDate() + 5));
      const nowPlus1 = new Date(new Date().setDate(new Date().getDate() + 1));

      const expiringIn =
        row.parsed_date < now
          ? 0
          : row.parsed_date < nowPlus1
            ? 1
            : row.parsed_date < nowPlus5
              ? 5
              : row.parsed_date < nowPlus10
                ? 10
                : row.parsed_date < nowPlus15
                  ? 15
                  : null;

      if (expiringIn != null) {
        expiringDocuments.push({
          document: row,
          daysToExpire: expiringIn,
        });
      }
    });

    const unique = {};
    try {
      expiringDocuments.forEach((doc) => {
        const id =
          doc.document.projeto_document_id.toString() +
          "-" +
          doc.document.user_id.toString();
        if (!unique[id]) {
          unique[id] = doc;
        }
      });
    } catch (error) {
      console.log(error);
    }

    // const sentNotifications = await ProjetoDocumentoRepository.getSentNotifications(Object.keys(unique))
    // const sendNotificationsIndexed = sentNotifications.reduce((acc, cur) => {
    //   acc[cur.virtual_id] = cur;
    //   return acc;
    // }, {});

    // const uniqueNotSentBefore = Object.keys(unique).filter((doc) => {
    //   return (sendNotificationsIndexed[doc] == null || sendNotificationsIndexed[doc].days_to_expire != unique[doc].daysToExpire);
    // }).reduce((acc, cur) => {
    //   acc[cur] = unique[cur];
    //   return acc;
    // }, {});

    if (Object.keys(unique).length == 0) return;

    const messages = Object.keys(unique).map((doc) => {
      let text = `O documento ${unique[doc].document.titulo}`;
      if (unique[doc].daysToExpire == 0) {
        text += ` expirou.`;
      } else {
        text += ` vai expirar em ${unique[doc].daysToExpire} dias.`;
      }

    
      return {
        title: "Documento expirando",
        body: text,
        id: unique[doc].document.user_id.toString(),
      };
    });

    const results = await Comunicacao.manyPush(messages);

    ProjetoDocumentoRepository.saveSentNotifications(
      Object.keys(unique).map((doc) => {
        return [
          unique[doc].document.user_id,
          unique[doc].document.projeto_document_id,
          unique[doc].daysToExpire,
        ];
      })
    );
  }
}
module.exports = ProjetoDocumento;
