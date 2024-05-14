const con = require("../../../data_base");
const sqlUtils = require("../../utils/sqlUtils.js");
const GoogleCloudStorage = require("../../../google-cloud-storage");
const ErrorModel = require("rox-lib");
const ProcessoPassoCadastroRepository = require("../../repositories/processo_passo_cadastro_repository");

class processoPassoCadastro {
  /**
   * @param {string[]} fields[] campos a serem consultados
   * @param {object[]} target[] array de obejetos que conte nome do campo (name) e valor a ser consultado(value)
   * @returns {Promise}  que vai resolver em rows e fields
   **/
  static select(fields = null, targets = null) {
    const sql = sqlUtils.generate_select_query(
      targets,
      fields,
      "processo_passo_cadastro"
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

  static verificaPasso(id) {
    return new Promise(async function (resolve, reject) {
      var verifica = await processoPassoCadastro.verificaSePassoEultimo(id);

      if (!verifica) {
        var passo = await processoPassoCadastro.getPasso(id);
        var campos = await processoPassoCadastro.getCamposPasso(id, true);
        passo.campos = campos;
        resolve(passo);
      } else {
        resolve(verifica);
      }
    });
  }

  static getPasso(id) {
    const sql = "select * from processo_passo_cadastro where id = " + id;

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

  static verificaSePassoEultimo(id) {
    const sql =
      "SELECT IF(estagio = 'final',true,false) as verifica FROM processo_passo_cadastro where id = " +
      id;

    return new Promise(function (resolve, reject) {
      // Do async job
      con.query(sql, function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          if (rows.length > 0) {
            if (rows[0].verifica || rows[0].verifica == 1) {
              resolve(true);
            } else {
              resolve(false);
            }
          } else {
            resolve(false);
          }
        }
      });
    });
  }

  static getByOrdem(id) {
    const sql =
      `SELECT p.*, pa.nome as papel FROM processo_passo_cadastro p 
        join papel pa on p.papel_id = pa.id where processo_cadastro_id = ` +
      id +
      ` order by p.ordem`;

    return new Promise(function (resolve, reject) {
      // Do async job
      con.query(sql, async function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          const map = rows.map(async (passo) => {
            if (passo.decisao == "nao") {
              passo.campos = await processoPassoCadastro.getCamposPasso(
                passo.id
              );
            } else {
              passo.processo_fluxo_cadastro =
                await processoPassoCadastro.getProcesso_fluxo_cadastro(
                  passo.id
                );
            }
          });

          await Promise.all(map);
          resolve(rows, fields);
        }
      });
    });
  }

  static getPassoUnitario(id) {
    return new Promise(function (resolve, reject) {
      try {
        const sql =
          `SELECT p.*, pa.nome as papel FROM processo_passo_cadastro p 
                join papel pa on p.papel_id = pa.id 
                where p.id = ` + id;

        // Do async job
        con.query(sql, async function (err, rows, fields) {
          if (err) {
            reject(err);
          } else {
            if (rows.length > 0) {
              const passo = rows[0];
              if (passo.decisao == "nao") {
                passo.campos = await processoPassoCadastro.getCamposPasso(
                  passo.id
                );
              } else {
                passo.processo_fluxo_cadastro =
                  await processoPassoCadastro.getProcesso_fluxo_cadastro(
                    passo.id
                  );
              }
              resolve(passo);
            } else {
              resolve(false);
            }
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  static getPassosComCampos(processoCadastroId) {
    return new Promise(async function (resolve, reject) {
      var passos = await processoPassoCadastro.getPassosProcessoCadastro(
        processoCadastroId
      );
      const map = passos.map(async (passo) => {
        passo.campos = await processoPassoCadastro.getCamposPasso(
          passo.id,
          true
        );
        return passo;
      });

      await Promise.all(map);

      resolve(passos);
    });
  }

  static getPassosPreenchidos(processoId) {
    return new Promise(async function (resolve, reject) {
      var processoPasso = await processoPassoCadastro.getProcessoPasso(
        processoId
      );
      var passos = [];
      const map = processoPasso.map(async (p) => {
        var passo = await processoPassoCadastro.getPasso(
          p.processo_passo_cadastro_id
        );
        passo.passo_id = p.id;
        passo.data_cadastro = p.data;
        passo.preenchido = "Sim";
        passo.responsavel = await processoPassoCadastro.getResponsavel(
          p.usuario_id
        );
        passo.campos = await processoPassoCadastro.getCamposPassoComValor(
          p.processo_passo_cadastro_id,
          p.id,
          processoId
        );
        passos.push(passo);
      });

      await Promise.all(map);

      function compare(a, b) {
        return a.data_cadastro.getTime() - b.data_cadastro.getTime();
      }

      passos.sort(compare).reverse();

      resolve(passos);
    });
  }

  static getProcessoPasso(processoId) {
    const sql =
      "select * from processo_passo where processo_id = " + processoId;

    return new Promise(function (resolve, reject) {
      // Do async job
      con.query(sql, function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static getResponsavel(usuarioID) {
    const sql = "select * from usuario where id= " + usuarioID;

    return new Promise(function (resolve, reject) {
      // Do async job
      con.query(sql, function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          if (rows.length > 0) {
            resolve(rows[0], fields);
          } else {
            resolve(false);
          }
        }
      });
    });
  }

  static getPassosProcessoCadastro(processoCadastroId) {
    const sql =
      "select * from processo_passo_cadastro where processo_cadastro_id = " +
      processoCadastroId;

    return new Promise(function (resolve, reject) {
      // Do async job
      con.query(sql, function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static getCamposPasso(passoID, processo = null) {
    const sql =
      "select * from processo_campo_cadastro where processo_passo_cadastro_id = " +
      passoID;

    return new Promise(function (resolve, reject) {
      con.query(sql, async function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          var campoCadastraPasta = [];
          const map = rows.map(async (campo) => {
            campo.id = campo.id.toString();
            switch (campo.tipo) {
              case "Arquivo":
                if (processo) {
                  campo.caminho =
                    await processoPassoCadastro.getProcesso_campo_arquivo(
                      campo.id
                    );
                  if (campo.caminho.cadastro_nova_pasta_campo_id) {
                    campoCadastraPasta.push(campo.caminho);
                  }
                } else {
                  campo.processo_campo_arquivo =
                    await processoPassoCadastro.getProcesso_campo_arquivo(
                      campo.id
                    );
                  delete campo.processo_campo_arquivo
                    .projeto_pasta_categoria_id;
                  if (Object.values(campo.processo_campo_arquivo).length != 0) {
                    campo.caminho =
                      await processoPassoCadastro.getCaminhoArquivo(
                        campo.processo_campo_arquivo
                      );
                  } else {
                    campo.caminho = [];
                  }
                }
                break;

              case "Seleção":
                if (processo) {
                  campo.opcoes =
                    await processoPassoCadastro.getProcesso_campo_opcao_select(
                      campo.id
                    );
                } else {
                  campo.processo_campo_opcao_select =
                    await processoPassoCadastro.getProcesso_campo_opcao_select(
                      campo.id
                    );
                }
                break;

              case "Multi-Seleção":
                if (processo) {
                  campo.opcoes =
                    await processoPassoCadastro.getProcesso_campo_opcao_select(
                      campo.id
                    );
                } else {
                  campo.processo_campo_opcao_select =
                    await processoPassoCadastro.getProcesso_campo_opcao_select(
                      campo.id
                    );
                }
                break;

              case "Texto com máscara personalizada":
                if (processo) {
                  campo.mascara = await processoPassoCadastro.getMascara(
                    campo.id
                  );
                } else {
                  campo.processo_campo_mascara =
                    await processoPassoCadastro.getProcesso_campo_mascara(
                      campo.id
                    );
                }
                break;

              case "Campo Cópia":
                if (processo) {
                  campo.mascara = await processoPassoCadastro.getMascara(
                    campo.id
                  );
                } else {
                  campo.processo_campo_copia =
                    await processoPassoCadastro.getProcesso_campo_copia(
                      campo.id
                    );
                }
                break;

              default:
                break;
            }
          });

          await Promise.all(map);

          if (campoCadastraPasta.length > 0) {
            // atribui as pastas aos campos responsaveis para cadastrar documentos
            rows.map((campo) => {
              campoCadastraPasta.map((campoPasta) => {
                if (campoPasta.cadastro_nova_pasta_campo_id == campo.id) {
                  campo.pastaCadastro = campoPasta;
                }
              });
            });
          }

          function compare(a, b) {
            return parseInt(a.ordem) - parseInt(b.ordem);
          }

          rows.sort(compare);
          resolve(rows, fields);
        }
      });
    });
  }

  static getCamposPassoComValor(passoID, processoPassoId, processoId) {
    const sql =
      "select * from processo_campo_cadastro where processo_passo_cadastro_id = " +
      passoID;

    return new Promise(function (resolve, reject) {
      con.query(sql, async function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          const map = rows.map(async (campo) => {
            campo.id_cadastro = campo.id.toString();
            campo.passo_id = processoPassoId;
            var valor = await processoPassoCadastro.getprocessoCampos(
              processoPassoId,
              campo.id_cadastro
            );
            campo.id = valor.id;
            campo.valor = valor.valor;
            switch (campo.tipo) {
              case "Arquivo":
                campo.caminho =
                  await processoPassoCadastro.getProcesso_campo_arquivo(
                    campo.id_cadastro
                  );
                if (campo.valor == "Arquivo") {
                  campo.arquivos =
                    await processoPassoCadastro.getProcessoArquivo(valor.id);
                }
                // console.log(campo)
                break;

              case "Seleção":
                campo.opcoes =
                  await processoPassoCadastro.getProcesso_campo_opcao_select(
                    campo.id_cadastro
                  );
                break;

              case "Multi-Seleção":
                campo.opcoes =
                  await processoPassoCadastro.getProjetosCampoOpcao();
                break;

              case "Texto com máscara personalizada":
                campo.mascara = await processoPassoCadastro.getMascara(
                  campo.id_cadastro
                );
                break;

              case "Campo Cópia":
                campo.campo_copia = await processoPassoCadastro.getCampoCopia(
                  campo.id_cadastro,
                  processoId
                );
                break;

              default:
                break;
            }
          });

          await Promise.all(map);
          function compare(a, b) {
            return parseInt(a.ordem) - parseInt(b.ordem);
          }
          rows.sort(compare);

          const newRows = rows.filter(
            (campo) =>
              (campo.tipo === "Campo Cópia" && campo.campo_copia) ||
              campo.tipo !== "Campo Cópia"
          );

          resolve(newRows, fields);
        }
      });
    });
  }

  static getCampoCopia(campoID, processoId) {
    const sql =
      "select processo_campo_copia_id, editavel from processo_campo_copia where processo_campo_cadastro_id = " +
      campoID;

    return new Promise(function (resolve, reject) {
      try {
        // Do async job
        con.query(sql, function (err, rows, fields) {
          if (err) {
            reject(err);
          } else {
            if (rows.length > 0) {
              if (rows[0].processo_campo_copia_id) {
                const sqlCampoCopia =
                  "select * from processo_campo_cadastro where id = " +
                  rows[0].processo_campo_copia_id;
                con.query(
                  sqlCampoCopia,
                  async function (err, rowsCampoCopia, fields) {
                    if (err) {
                      reject(err);
                    } else {
                      if (rowsCampoCopia.length > 0) {
                        rowsCampoCopia[0].editavel = rows[0].editavel;
                        const verifica =
                          await processoPassoCadastro.verificaSeProcessoPassouPorPasso(
                            processoId,
                            rowsCampoCopia[0].processo_passo_cadastro_id
                          );
                        if (verifica) {
                          switch (rowsCampoCopia[0].tipo) {
                            case "Seleção":
                              rowsCampoCopia[0].opcoes =
                                await processoPassoCadastro.getProcesso_campo_opcao_select(
                                  rows[0].processo_campo_copia_id
                                );
                              break;

                            case "Multi-Seleção":
                              rowsCampoCopia[0].opcoes =
                                await processoPassoCadastro.getProjetosCampoOpcao();
                              break;

                            case "Texto com máscara personalizada":
                              rowsCampoCopia[0].mascara =
                                await processoPassoCadastro.getMascara(
                                  rows[0].processo_campo_copia_id
                                );
                              break;

                            case "Arquivo":
                              rowsCampoCopia[0].caminho =
                                await processoPassoCadastro.getProcesso_campo_arquivo(
                                  rows[0].processo_campo_copia_id
                                );
                              // console.log(campo)
                              break;
                          }
                          const sqlValor =
                            "SELECT id,valor FROM processo_campos WHERE PROCESSO_PASSO_ID IN (SELECT ID FROM processo_passo WHERE processo_ID = " +
                            processoId +
                            ") AND processo_campo_cadastro_id = " +
                            rows[0].processo_campo_copia_id +
                            " order by id desc";
                          con.query(
                            sqlValor,
                            async function (err, rowsValor, fields) {
                              if (err) {
                                reject(err);
                              } else {
                                if (
                                  rowsValor &&
                                  rowsValor.length > 0 &&
                                  rowsValor[0].valor == "Arquivo"
                                ) {
                                  rowsCampoCopia[0].arquivos =
                                    await processoPassoCadastro.getProcessoArquivo(
                                      rowsValor[0].id
                                    );
                                }
                                resolve(
                                  { ...rowsCampoCopia[0], ...rowsValor[0] },
                                  fields
                                );
                              }
                            }
                          );
                        } else {
                          resolve(false);
                        }
                      } else {
                        resolve(false);
                      }
                    }
                  }
                );
              } else {
                resolve(false);
              }
            } else {
              resolve(false);
            }
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  static verificaSeProcessoPassouPorPasso(
    processoId,
    processo_passo_cadastro_id
  ) {
    const sql =
      "SELECT * FROM processo_passo where processo_id = " +
      processoId +
      " and processo_passo_cadastro_id = " +
      processo_passo_cadastro_id;
    //console.log("sql gerado:", sql)

    return new Promise(function (resolve, reject) {
      // Do async job
      con.query(sql, function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          if (rows.length > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      });
    });
  }

  static getProjetosCampoOpcao() {
    const sql = "SELECT * FROM projeto_cadastro where status = 'Ativo'";
    //console.log("sql gerado:", sql)

    return new Promise(function (resolve, reject) {
      // Do async job
      con.query(sql, function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          var op = [];

          rows.map((p) => {
            op.push({ label: p.nome, value: p.id });
          });

          resolve(op);
        }
      });
    });
  }

  static getProcessoArquivo(campoId) {
    const sql = "select * from processo_arquivo where campo_id = " + campoId;
    //console.log("sql gerado:", sql)

    return new Promise(function (resolve, reject) {
      // Do async job
      con.query(sql, async function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          if (rows.length > 0) {
            if (
              await GoogleCloudStorage.verificaArquivo(
                "documentos/" + rows[0].url_arquivo
              )
            ) {
              rows[0].arquivo =
                await GoogleCloudStorage.getFileArquivoDocumento(
                  "documentos/" + rows[0].url_arquivo
                );
            } else {
              const arquivo = await GoogleCloudStorage.getFilesDirectory(
                "documentos/" + rows[0].id_arquivo + "/"
              );
              if (arquivo) {
                rows[0].arquivo = arquivo;
              } else {
                rows[0].arquivo = false;
              }
            }
            resolve(rows[0]);
          } else {
            resolve(false);
          }
        }
      });
    });
  }

  static getMascara(idCampo) {
    const sql =
      "SELECT p.*, m.mascara, m.descricao FROM processo_campo_mascara p join mascara m on p.mascara_id = m.id where p.processo_campo_cadastro_id = " +
      idCampo;
    //console.log("sql gerado:", sql)

    return new Promise(function (resolve, reject) {
      // Do async job
      con.query(sql, function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          if (rows.length > 0) {
            resolve(rows[0], fields);
          } else {
            resolve(rows, fields);
          }
        }
      });
    });
  }

  static getprocessoCampos(processoPassoId, processoCampoCadastroId) {
    const sql =
      "SELECT * FROM processo_campos where processo_passo_id = " +
      processoPassoId +
      " and processo_campo_cadastro_id = " +
      processoCampoCadastroId +
      " order by id desc limit 1";
    return new Promise(function (resolve, reject) {
      // Do async job
      con.query(sql, function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          if (rows.length > 0) {
            resolve(rows[0], fields);
          } else {
            resolve(false);
          }
        }
      });
    });
  }

  static getProcesso_fluxo_cadastro(passoID) {
    const sql =
      "SELECT passo_atual,passo_seguinte FROM processo_fluxo_cadastro where passo_decisao = " +
      passoID +
      " group by passo_atual,passo_seguinte";

    return new Promise(function (resolve, reject) {
      // Do async job
      con.query(sql, async function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          const map = rows.map(async (r) => {
            r.condicoes = await processoPassoCadastro.getFluxoPasso(
              passoID,
              r.passo_atual,
              r.passo_seguinte
            );
            return r;
          });

          await Promise.all(map);
          resolve(rows, fields);
        }
      });
    });
  }

  static getFluxoPasso(passo_decisao, passo_atual, passo_seguinte) {
    const sql =
      `SELECT * FROM processo_fluxo_cadastro where passo_decisao = ` +
      passo_decisao +
      ` 
        and passo_atual = ` +
      passo_atual +
      ` and passo_seguinte = ` +
      passo_seguinte;

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

  static getProcesso_campo_arquivo(campoID) {
    const sql =
      "select *, (select nome from projeto_cadastro where id = projeto_cadastro_id) as nome_projeto, (select categoria_id from projeto_pasta where id = projeto_pasta_id) as projeto_pasta_categoria_id from processo_campo_arquivo where processo_campo_cadastro_id = " +
      campoID;

    return new Promise(function (resolve, reject) {
      // Do async job
      con.query(sql, function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          if (rows.length > 0) {
            resolve(rows[0], fields);
          } else {
            resolve({}, fields);
          }
        }
      });
    });
  }

  static getCaminhoArquivo(campoArquivo) {
    return new Promise(async function (resolve, reject) {
      var caminho = [];
      var paiID = campoArquivo.projeto_pasta_id;

      if (campoArquivo.projeto_cadastro_id == 0) {
        // seleciona das pastas do template
        do {
          var pasta = await processoPassoCadastro.getPasta_cadastro(paiID);
          caminho.push(pasta.id);
          paiID = pasta.pai_id;
        } while (pasta.id != pasta.pai_id);
      } else {
        // seleciona das pastas do projeto
        do {
          var pasta = await processoPassoCadastro.getProjeto_pasta(paiID);
          caminho.push(pasta.id);
          paiID = pasta.pai_id;
        } while (pasta.id != pasta.pai_id);
      }
      resolve(caminho.reverse());
    });
  }

  static getProjeto_pasta(pastaID) {
    const sql = "SELECT * FROM projeto_pasta where id =" + pastaID;

    return new Promise(function (resolve, reject) {
      // Do async job
      con.query(sql, function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          if (rows.length > 0) {
            resolve(rows[0], fields);
          } else {
            resolve({}, fields);
          }
        }
      });
    });
  }

  static getPasta_cadastro(pastaID) {
    const sql = "SELECT * FROM pasta_cadastro where id =" + pastaID;

    return new Promise(function (resolve, reject) {
      // Do async job
      con.query(sql, function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          if (rows.length > 0) {
            resolve(rows[0], fields);
          } else {
            resolve({}, fields);
          }
        }
      });
    });
  }

  static getProcesso_campo_mascara(campoID) {
    const sql =
      "select * from processo_campo_mascara where processo_campo_cadastro_id = " +
      campoID;

    return new Promise(function (resolve, reject) {
      // Do async job
      con.query(sql, function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          if (rows.length > 0) {
            resolve(rows[0], fields);
          } else {
            resolve({}, fields);
          }
        }
      });
    });
  }

  static getProcesso_campo_copia(campoID) {
    const sql =
      "select * from processo_campo_copia where processo_campo_cadastro_id = " +
      campoID;

    return new Promise(function (resolve, reject) {
      // Do async job
      con.query(sql, function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          if (rows.length > 0) {
            resolve(rows[0], fields);
          } else {
            resolve({}, fields);
          }
        }
      });
    });
  }

  static getProcesso_campo_opcao_select(campoID) {
    const sql =
      "select * from processo_campo_opcao_select where processo_campo_cadastro_id = " +
      campoID +
      " order by label";

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

  static getSubProcessoAtual(subProcessoId) {
    return new Promise(function (resolve, reject) {
      try {
        const sql =
          "select * from processo_cadastro where nome = (select nome from processo_cadastro where id = " +
          subProcessoId +
          ") and status = 'Ativo'";
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
      } catch (error) {
        reject(error);
      }
    });
  }

  static cadastraCamposPassoAntigo(body) {
    const sql =
      "SELECT * FROM processo_passo_cadastro where processo_cadastro_id = " +
      body.processoAntigoID +
      " and id_diagrama = '" +
      body.diagramaID +
      "'";
    return new Promise(function (resolve, reject) {
      // Do async job
      con.query(sql, async function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          if (rows.length > 0) {
            var campos = await processoPassoCadastro.getCamposPasso(rows[0].id);
            const map = campos.map(async (campo) => {
              delete campo.id;
              campo.processo_passo_cadastro_id = body.passoID;
              campo.processo_cadastro_id = body.processoNovoID;
              processoPassoCadastro.cadastraCampoPassoAntigo(campo);
            });

            if (rows[0].dica) {
              await processoPassoCadastro.update({
                id: body.passoID,
                dica: rows[0].dica.replace(/[\\$'"]/g, "\\$&"),
              });
            }

            if (rows[0].estimativa) {
              await processoPassoCadastro.update({
                id: body.passoID,
                estimativa: rows[0].estimativa,
              });
            }

            if (
              rows[0].subprocesso_cadastro_id &&
              rows[0].subprocesso_cadastro_id != 0
            ) {
              const subProcesso =
                await processoPassoCadastro.getSubProcessoAtual(
                  rows[0].subprocesso_cadastro_id
                );
              if (subProcesso) {
                await processoPassoCadastro.update({
                  id: body.passoID,
                  subprocesso_cadastro_id: subProcesso.id,
                  nome: "Sub-Processo: " + subProcesso.nome,
                  descricao: "Sub-Processo: " + subProcesso.nome,
                });
              }
            }

            if (rows[0].bloqueante == 1) {
              await processoPassoCadastro.update({
                id: body.passoID,
                bloqueante: 1,
              });
            }

            await Promise.all(map);
            resolve(rows, fields);
          } else {
            resolve(rows, fields);
          }
        }
      });
    });
  }

  static cadastraCampoPassoAntigo(campo) {
    return new Promise(function (resolve, reject) {
      switch (campo.tipo) {
        case "Seleção":
          var processo_campo_opcao_select = campo.processo_campo_opcao_select;
          delete campo.processo_campo_opcao_select;
          processoPassoCadastro.insertCampo(campo).then(async (result) => {
            const map = processo_campo_opcao_select.map(async (op) => {
              delete op.id;
              op.processo_campo_cadastro_id = result.insertId;
              op.processo_cadastro_id = campo.processo_cadastro_id;
              await processoPassoCadastro.insertOpcaoSelect(op);
            });
            await Promise.all(map);
            resolve();
          });
          break;

        case "Multi-Seleção":
          var processo_campo_opcao_select = campo.processo_campo_opcao_select;
          delete campo.processo_campo_opcao_select;
          processoPassoCadastro.insertCampo(campo).then(async (result) => {
            const map = processo_campo_opcao_select.map(async (op) => {
              delete op.id;
              op.processo_campo_cadastro_id = result.insertId;
              op.processo_cadastro_id = campo.processo_cadastro_id;
              await processoPassoCadastro.insertOpcaoSelect(op);
            });
            await Promise.all(map);
            resolve();
          });
          break;

        case "Texto com máscara personalizada":
          var processo_campo_mascara = campo.processo_campo_mascara;
          delete campo.processo_campo_mascara;
          processoPassoCadastro.insertCampo(campo).then((result) => {
            delete processo_campo_mascara.id;
            processo_campo_mascara.processo_campo_cadastro_id = result.insertId;
            processo_campo_mascara.processo_cadastro_id =
              campo.processo_cadastro_id;
            processoPassoCadastro
              .insertCampoMascara(processo_campo_mascara)
              .then(() => {
                resolve();
              });
          });
          break;

        case "Arquivo":
          var processo_campo_arquivo = campo.processo_campo_arquivo;
          delete campo.processo_campo_arquivo;
          delete campo.caminho;
          processoPassoCadastro.insertCampo(campo).then((result) => {
            delete processo_campo_arquivo.id;
            processo_campo_arquivo.processo_id = campo.processo_cadastro_id;
            processo_campo_arquivo.processo_campo_cadastro_id = result.insertId;
            if (!processo_campo_arquivo.cadastro_nova_pasta_campo_id) {
              delete processo_campo_arquivo.cadastro_nova_pasta_campo_id;
            }
            processoPassoCadastro
              .insertCampoArquivo(processo_campo_arquivo)
              .then(() => {
                resolve();
              });
          });
          break;

        case "Campo Cópia":
          var processo_campo_copia = campo.processo_campo_copia;
          delete campo.processo_campo_copia;
          processoPassoCadastro.insertCampo(campo).then((result) => {
            delete processo_campo_copia.id;
            processo_campo_copia.processo_cadastro_id =
              campo.processo_cadastro_id;
            processo_campo_copia.processo_campo_cadastro_id = result.insertId;
            processoPassoCadastro
              .insertCampoCopia(processo_campo_copia)
              .then(() => {
                resolve();
              });
          });
          break;

        default:
          processoPassoCadastro.insertCampo(campo).then((result) => {
            resolve();
          });
          break;
      }
    });
  }

  // static getCadastroNovaPastaCampoID(campo,body,processo_campo_arquivo){
  //     console.log(campo)
  //     console.log(body)
  //     console.log(processo_campo_arquivo)

  //     return 0
  // }

  static insertCampo(campo) {
    const sql = sqlUtils.generate_insert_query(
      campo,
      "processo_campo_cadastro"
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

  static insertOpcaoSelect(opcao) {
    const sql = sqlUtils.generate_insert_query(
      opcao,
      "processo_campo_opcao_select"
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

  static insertCampoMascara(mascara) {
    const sql = sqlUtils.generate_insert_query(
      mascara,
      "processo_campo_mascara"
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

  static insertCampoCopia(copia) {
    const sql = sqlUtils.generate_insert_query(copia, "processo_campo_copia");

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

  static insertCampoArquivo(campoArquivo) {
    const sql = sqlUtils.generate_insert_query(
      campoArquivo,
      "processo_campo_arquivo"
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

  /**
   *
   * @param {object} data contem os pares de campo e valor
   * @returns {Promise}  que vai resolver em rows e fields
   */
  static insert(data) {
    if (data.caminho_padrao && data.caminho_padrao === "null") {
      data.caminho_padrao = 0;
    }
    const sql = sqlUtils.generate_insert_query(data, "processo_passo_cadastro");

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
    const sql = sqlUtils.generate_update_query(data, "processo_passo_cadastro");
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
    const sql =
      "delete from processo_passo_cadastro where processo_cadastro_id = " + id;
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

  static getPrimeiroPassoProcesso(processo_cadastro_id) {
    return new Promise(function (resolve, reject) {
      try {
        const sql =
          "select * from processo_passo_cadastro where processo_cadastro_id = " +
          processo_cadastro_id +
          " and estagio = 'inicial'";
        con.query(sql, function (err, rows) {
          if (err) {
            reject(err);
          } else {
            if (rows.length > 0) {
              resolve(rows[0]);
            } else {
              const sql2 =
                "select * from processo_passo_cadastro where processo_cadastro_id = " +
                processo_cadastro_id +
                " and estagio = 'final'";
              con.query(sql2, function (err2, rows2) {
                if (err2) {
                  reject(err2);
                } else {
                  if (rows2.length > 0) {
                    resolve(rows2[0]);
                  } else {
                    resolve(false);
                  }
                }
              });
            }
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
module.exports = processoPassoCadastro;