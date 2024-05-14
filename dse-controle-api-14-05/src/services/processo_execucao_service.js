const pool = require("../../data_base.js");
const GoogleCloudStorage = require("../../google-cloud-storage.js");
const ProjetoExecucaoFormatters = require("../formatters/projeto_execucao_formatters.js");
const ProjetoPasta = require("../projeto/projeto_pasta/projeto_pasta.js");
const pastaAtributo = require('../pasta/pasta_atributo/pasta_atributo.js');
const ProcessoRepository = require("../repositories/processo_repository.js");
const ProjetoRepository = require("../repositories/projeto_repository.js");
const ProjetoPastaRepository = require("../repositories/projeto_pasta_repository.js");
const ProcessoCampoRepository = require("../repositories/processo_campo_repository.js");
const ProjetoDocumento = require("../projeto/projeto_documento/projeto_documento.js");
const PastaAtributo = require("../pasta/pasta_atributo/pasta_atributo.js");
const ProjetoCadastro = require("../projeto/projeto_cadastro/projeto_cadastro.js");
const ProcessoCampos = require("../processo/processo_campos/processo_campos.js");
const ProcessoArquivo = require("../processo/processo_arquivo/processo_arquivo.js");
const ProjetoDocumentoAtributo = require('../projeto/projeto_documento_atributo/projeto_documento_atributo.js')
const Processo = require('../processo/processo/processo.js')
const ProcessoFluxoCadastro = require('../processo/processo_fluxo_cadastro/processo_fluxo_cadastro.js')
const ProcessoPasso = require('../processo/processo_passo/processo_passo.js')
module.exports = class ProcessoExecucaoService {

  static async insertFile(data) {
    return new Promise((resolve, reject) => {
      try {
        pool.getConnection(async (err, con) => {
          if (err) {
            reject(err);
          }
          try {
            const { arquivo, values, valuesForm, campos, params, base64, fileName, process, formAttributes } = data

            if (arquivo.caminho.categoria_id && arquivo.caminho.categoria_id != 0) {
              values.categoria_id = arquivo.caminho.categoria_id
            }

            if (values.archive[0]?.ged && arquivo.caminho.selecao_filha === 0 && arquivo.caminho.cadastro_nova_pasta_campo_id === 0) { //  se cair aqui o arquivo foi selecionado do ged e nenhuma outra opção no cadastro foi selecionada
              await this.#insertCampoArquivo(values.archive[0].id, { // insere na tabela processo-campos e processo-arquivo como selecionado do ged
                valor: 'Arquivo',
                processo_passo_id: arquivo.passo_id,
                processo_campo_cadastro_id: arquivo.caminho.processo_campo_cadastro_id,
              }, 1)
              resolve(true)

            } else if (values.archive.length > 0) {
              if (!values.archive[0].ged && values.archive[0].url) { //  se cair aqui o usuário nao modificou o arquivo que já existia, então edita somente os atributos
                await this.#editAttributesArchive(arquivo.arquivos.id_arquivo, arquivo.caminho.projeto_pasta_id, values)
                resolve(true)
              } else { // inserção de arquivo propriamente
                if (arquivo.arquivos) { // exclui o arquivo anteriormente inserido se existe
                  await this.#deleteArchiveProcess(arquivo.arquivos.id_arquivo, arquivo.caminho.processo_campo_cadastro_id)
                }

                if (arquivo.caminho.selecao_filha === 1) { // insere na pasta filha selecionada
                  var arquivo_id = await this.#insertArchivePaste(
                    base64,
                    fileName,
                    values.pastaFilha,
                    arquivo.caminho.projeto_cadastro_id,
                    values,
                    null,
                    false,
                    false,
                    arquivo.caminho.converte_imagem == 1,
                    arquivo.caminho.substitui_arquivo == 1
                  ) // insere o arquivo na pasta e cadastra os atributos
                  if (arquivo_id) {
                    await this.#insertCampoArquivo(arquivo_id, { // insere na tabela processo-campos e processo-arquivo
                      valor: 'Arquivo',
                      processo_passo_id: arquivo.passo_id,
                      processo_campo_cadastro_id: arquivo.caminho.processo_campo_cadastro_id,
                    })
                    resolve(true)
                  } else {
                    resolve(false)
                  }
                } else if (arquivo.caminho.cadastro_nova_pasta_campo_id && arquivo.caminho.cadastro_nova_pasta_campo_id !== 0) { // criação de pasta com base em campo anterior

                  var verificaPasta = await this.#getPastaTemplate({
                    "projeto_processo": process.projeto_id,
                    "projeto_id": arquivo.caminho.projeto_cadastro_id,
                    "projeto_pasta_id": arquivo.caminho.projeto_pasta_id
                  })

                  if (verificaPasta) {
                    var pasta_id = await this.#newFolderByField(valuesForm, campos, verificaPasta, process.projeto_id, arquivo.caminho.projeto_pasta_categoria_id, arquivo.caminho.cadastro_nova_pasta_campo_id, params.id)
                  } else {
                    var pasta_id = await this.#newFolderByField(valuesForm, campos, arquivo.caminho.projeto_pasta_id, arquivo.caminho.projeto_cadastro_id, arquivo.caminho.projeto_pasta_categoria_id, arquivo.caminho.cadastro_nova_pasta_campo_id, params.id)
                  }

                  var atributes = []
                  if (pasta_id[1]) {
                    atributes = await this.#getPasteAttributesWithCategory(pasta_id[0], arquivo.caminho.categoria_id, null)
                  } else {
                    atributes = await this.#getPasteAttributesWithCategory(pasta_id[0], arquivo.caminho.categoria_id, null, true)
                  }
                  var arquivo_id = await this.#insertArchivePaste(
                    base64,
                    fileName,
                    pasta_id[0],
                    arquivo.caminho.projeto_cadastro_id,
                    values,
                    null,
                    false,
                    atributes,
                    arquivo.caminho.converte_imagem == 1,
                    arquivo.caminho.substitui_arquivo == 1
                  )

                  if (arquivo_id) {
                    await this.#insertCampoArquivo(arquivo_id, { // insere na tabela processo-campos e processo-arquivo
                      valor: 'Arquivo',
                      processo_passo_id: arquivo.passo_id,
                      processo_campo_cadastro_id: arquivo.caminho.processo_campo_cadastro_id,
                    })
                    resolve(true)
                  } else {
                    resolve(false)
                  }

                } else { // insere na pasta padrão

                  var verificaPasta = await this.#getPastaTemplate({
                    "projeto_processo": process.projeto_id,
                    "projeto_id": arquivo.caminho.projeto_cadastro_id,
                    "projeto_pasta_id": arquivo.caminho.projeto_pasta_id
                  })

                  if (verificaPasta) {
                    var atributes = await this.#getPasteAttributesWithCategory(verificaPasta, arquivo.caminho.categoria_id, null)
                    var newValues = {}
                    if (arquivo.caminho.categoria_id && arquivo.caminho.categoria_id != 0) {
                      newValues.categoria_id = arquivo.caminho.categoria_id
                    }
                    formAttributes.forEach(element => {
                      Object.keys(values).forEach(e => {
                        if (element.atributo_id) {
                          if (parseInt(e) === parseInt(element.atributo_id)) {
                            atributes.forEach(atr => {
                              if (atr.atributo === element.atributo) {
                                newValues[atr.atributo] = values[e]
                              }
                            })
                          }
                        } else {
                          if (parseInt(e) === parseInt(element.id)) {
                            atributes.forEach(atr => {
                              if (atr.atributo === element.atributo) {
                                newValues[atr.atributo] = values[e]
                              }
                            })
                          }
                        }
                      })
                    });
                    newValues.archive = values.archive
                    var arquivo_id = await this.#insertArchivePaste(
                      base64,
                      fileName,
                      verificaPasta,
                      arquivo.caminho.projeto_cadastro_id,
                      newValues,
                      null,
                      false,
                      atributes,
                      arquivo.caminho.converte_imagem == 1,
                      arquivo.caminho.substitui_arquivo == 1
                    )

                    if (arquivo_id) {
                      await this.#insertCampoArquivo(arquivo_id, { // insere na tabela processo-campos e processo-arquivo
                        valor: 'Arquivo',
                        processo_passo_id: arquivo.passo_id,
                        processo_campo_cadastro_id: arquivo.caminho.processo_campo_cadastro_id,
                      })
                      resolve(true)
                    } else {
                      resolve(false)
                    }
                  } else {
                    var arquivo_id = await this.#insertArchivePaste(
                      base64,
                      fileName,
                      arquivo.caminho.projeto_pasta_id,
                      arquivo.caminho.projeto_cadastro_id,
                      values,
                      null,
                      false,
                      false,
                      arquivo.caminho.converte_imagem == 1,
                      arquivo.caminho.substitui_arquivo == 1
                    ) // insere o arquivo na pasta e cadastra os atributos

                    if (arquivo_id) {
                      await this.#insertCampoArquivo(arquivo_id, { // insere na tabela processo-campos e processo-arquivo
                        valor: 'Arquivo',
                        processo_passo_id: arquivo.passo_id,
                        processo_campo_cadastro_id: arquivo.caminho.processo_campo_cadastro_id,
                      })
                      resolve(true)
                    } else {
                      resolve(false)
                    }
                  }
                }


              }
            } else {
              if (arquivo.arquivos) { // exclui o arquivo anteriormente inserido se existe
                await this.#deleteArchiveProcess(arquivo.arquivos.id_arquivo, arquivo.caminho.processo_campo_cadastro_id)
              }
              resolve(true)
            }
          } catch (error) {
            reject(error);
          }
        });

      } catch (error) {
        reject(error)
      }
    });
  }

  static async #createNewFolder(
    parentFolderId,
    folderName,
    projectId,
    category,
    herda_conf_nome,
    projetoPastaRepository
  ) {
    // Verifica nome
    const folder = await projetoPastaRepository.getFolderByNameAndParent(
      folderName,
      parentFolderId,
      projectId
    );

    if (folder.length > 0) {
      throw new Error("Pasta já existe");
    }
    // get pasta pai e atributos
    const [parentFolder, parentAttributes] = await Promise.all([
      projetoPastaRepository.getFolderById(parentFolderId),
      projetoPastaRepository.getAttributes(parentFolderId, category),
    ]);

    // cria pasta
    const newFolder = await projetoPastaRepository.insertFolder({
      nome: folderName,
      pai_id: parentFolderId,
      timeline: "nao",
      status: "Ativo",
      projeto_id: projectId,
      categoria_id: category,
      herda_conf_nome: herda_conf_nome,
    });

    // cria novos atributos
    const insertAttributesResult =
      await projetoPastaRepository.insertManyFolderAttributes(
        parentAttributes.map((e) => {
          return { ...e, alvo_id: newFolder.insertId };
        })
      );
    const insertedAttributes =
      await projetoPastaRepository.getManyAttributesStartingFromId(
        insertAttributesResult.insertId,
        parentAttributes.length
      );

    const attributeCategoryToInsert = parentAttributes.reduce(
      (acc, attribute) => {
        if (attribute.categoria_id && attribute.categoria_id != "null") {
          acc.push({
            categoria_id: attribute.categoria_id,
            atributo_id: insertedAttributes.find(
              (e) =>
                e.atributo === attribute.atributo && e.tipo === attribute.tipo
            ).id,
            pasta_id: newFolder.insertId,
            projeto_id: projectId,
          });
        }
        return acc;
      },
      []
    );

    const insertCategoryAttributesResult =
      await projetoPastaRepository.insertManyCategoryAttributes(
        attributeCategoryToInsert
      );

    if (herda_conf_nome === 1) {
      const documentNames = await projetoPastaRepository.getFolderDocumentName(
        parentFolderId
      );
      const newDocumentNamePatterns = documentNames.map((e) => {
        const oldAttribute = parentAttributes.find(
          (a) => a.id === e.atributo_id
        );
        const newAttribute = insertedAttributes.find(
          (e) =>
            e.atributo === oldAttribute.atributo && e.tipo === oldAttribute.tipo
        );
        return {
          projeto_id: e.projeto_id,
          pasta_id: newFolder.insertId,
          pasta_documento_nome_tipo_id: e.pasta_documento_nome_tipo_id,
          atributo_id: newAttribute ? newAttribute.id : null,
          valor: e.valor,
          ordem: e.ordem,
        };
      });

      if (newDocumentNamePatterns.length > 0) {
        await projetoPastaRepository.insertManyFolderDocumentNames(
          newDocumentNamePatterns
        );
      }
    }

    return newFolder.insertId;
  }

  static #insertCampoArquivo(arquivo_id, campo, ged) {
    return new Promise(async (resolve, reject) => {
      try {
        let arquivo = await ProjetoDocumento.select(null, [{
          name: 'id',
          value: arquivo_id,
          operator: "="
        }])
        const response = await ProcessoCampos.insert(campo);
        if (arquivo.length > 0) {
          await ProcessoArquivo.insert({
            id_arquivo: arquivo[0].id,
            campo_id: response.insertId,
            url_arquivo: arquivo[0].url,
            ged,
          })
        }
        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  }

  static #editAttributesArchive(projeto_documento_id, pasta_id, values) {
    return new Promise(async (resolve, reject) => {
      try {
        await ProjetoDocumentoAtributo.delete(projeto_documento_id)

        const map = Object.keys(values).map(async (id) => {
          if (id !== 'archive' && id !== 'categories' && id !== "categoria_id" && values[id] !== '') {
            await ProjetoDocumentoAtributo.insert({
              projeto_documento_id: projeto_documento_id,
              projeto_diretorio_id: pasta_id,
              valor: values[id] ? values[id] : '',
              pasta_atributo_id: id
            })
          }
        })

        await Promise.all(map)

        let response = await ProjetoDocumento.renomeiaArquivo(projeto_documento_id)

        resolve(response)

      } catch (error) {
        reject(error);
      }
    })
  }

  static #deleteArchiveProcess(id_arquivo, processo_campo_cadastro_id) {
    return new Promise(async (resolve, reject) => {
      try {
        await ProjetoDocumento.deletePermanente(id_arquivo)
        let result = await ProcessoCampos.deleteArquive(processo_campo_cadastro_id)
        resolve(result);
      } catch (error) {
        reject(error);
      }
    })
  }

  static #insertArchivePaste(base64Param, nomeParam, pasta_id, projeto_id, values, status = null, not = true, atributes = null, imgToPdf = null, substituiArquivo = false) {
    return new Promise(async (resolve, reject) => {
      try {
        let base64 = base64Param
        var nome = nomeParam
        let map

        let resultArchive = await ProjetoDocumento.insert({
          projeto_diretorio_id: pasta_id,
          projeto_id: projeto_id,
          titulo: nome,
          doc: base64, // base64 do arquivo
          template: "Sim",
          status: status ? 'Inativo' : 'Ativo',
          categoria_id: values.categoria_id ? values.categoria_id : null
        })

        if (atributes) {
          map = Object.keys(values).map(async (id, index) => {
            if (id !== 'archive' && id !== 'categories' && id !== "categoria_id" && id !== 'pastaFilha' && values[id] !== '') {
              const mapAtributes = atributes.map(async (atr) => {
                if (atr.atributo == id || atr?.atributo_id == id) {
                  await ProjetoDocumentoAtributo.insert({
                    projeto_documento_id: resultArchive.insertId,
                    projeto_diretorio_id: pasta_id,
                    valor: values[id] ? values[id] : '',
                    pasta_atributo_id: atr.atributo_id ? atr.atributo_id : atr.id
                  });
                }
              })

              await Promise.all(mapAtributes)
            }
          })

        } else {
          map = Object.keys(values).map(async (id) => {
            if (id !== 'archive' && id !== 'categories' && id !== "categoria_id" && id !== 'pastaFilha' && values[id] !== '') {
              await ProjetoDocumentoAtributo.insert({
                projeto_documento_id: resultArchive.insertId,
                projeto_diretorio_id: pasta_id,
                valor: values[id] ? values[id] : '',
                pasta_atributo_id: id
              })
            }
          })
        }

        await Promise.all(map)
        await ProjetoDocumento.renomeiaArquivo(resultArchive.insertId, substituiArquivo)
        resolve(resultArchive.insertId)
      } catch (error) {
        reject(error)
      }
    })
  }

  static #getPastaTemplate(data) {
    return new Promise(async function (resolve, reject) {
      try {
        var response = await ProjetoCadastro.projetoTemplate({
          "projeto_processo": data.projeto_processo,
          "projeto_id": data.projeto_id,
          "projeto_pasta_id": data.projeto_pasta_id
        })
        if (response) {
          resolve(response)
        } else {
          resolve(false)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  static #newFolderByField(valores, campos, pai_id, projeto_id, categoria_id, field_id, processo_id) {
    return new Promise(async function (resolve, reject) {
      try {

        let nome = await ProcessoCampos.getValorCampo(field_id, processo_id)

        let nomePasta = "";

        if (nome) {
          nomePasta = nome[0].valor.toUpperCase()
        } else {
          campos.map((c) => {
            if (c.id_cadastro == field_id) {
              if (c.campo_copia) {
                nomePasta = c.nome
              } else {
                nomePasta = valores[field_id] ?? ''
              }
            }
          })

        }

        let response = await ProjetoPasta.cadastraPasta({
          pai_id,
          nome: nomePasta,
          projeto_id,
          categoria_id,
          herda_conf_nome: 1
        })

        if (response?.message === 'Nome de pasta já existente neste diretório, favor tente novamente.') {
          response = await ProjetoPasta.selectIdByNome({ nome: nomePasta.toUpperCase(), pai_id })
          if (response.length > 0) {
            resolve([response[0].id, true])
          } else {
            reject(error)
          }
        } else {
          resolve([response.insertId, false])
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  static #getPasteAttributesWithCategory(pasta_id, categoria_id, arquivo_id = null, flag_filha = false) {
    return new Promise(async function (resolve, reject) {
      try {
        let response = await PastaAtributo.selectAtributosComCategoria({
          pasta_id, categoria_id, arquivo_id, flag_filha
        })
        if (response.length > 0) {
          resolve(response)
        } else {
          resolve([])
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  static mapValuesToNewAttributes(oldAttributes, attributes) {
    // Se o arquivo for salvo em pasta baseada em campo, as chaves dos atributso são os NOMES dos campos
    // Seria bom se isso fosse mudado, para vir os ids dos campos
    return Object.keys(oldAttributes).reduce((acc, key) => {
      const attribute = attributes.find((e) => e.atributo == key);
      if (attribute) {
        acc[attribute.id] = oldAttributes[key];
      }
      return acc;
    }, {});
  }

  static getFileAttributes(data) {
    // Função que obtem os atributos da pasta onde o arquivo será inserido 
    return new Promise(async (resolve, reject) => {
      try {
        try {
          const arquivo = data.arquivo
          const process = data.process
          if (arquivo.arquivos && arquivo.arquivos.arquivo) {

            if (arquivo.caminho.selecao_filha === 1 || (arquivo.caminho.cadastro_nova_pasta_campo_id && arquivo.caminho.cadastro_nova_pasta_campo_id !== 0)) {
              var response = await ProjetoDocumento.selectIdPastaArquivo(arquivo.arquivos.id_arquivo)
              const data = {
                pasta_id: response[0].pasta_id,
                categoria_id: arquivo.caminho.categoria_id,
                arquivo_id: arquivo.arquivos.id_arquivo
              }
              if (arquivo.caminho.cadastro_nova_pasta_campo_id && arquivo.caminho.cadastro_nova_pasta_campo_id !== 0) {
                var retorno = await PastaAtributo.selectAtributosCategoriaFast(data)
              } else {
                var retorno = await PastaAtributo.selectAtributosCategoriaFast(data)
              }
            } else {
              var verificaPasta = await ProjetoCadastro.projetoTemplate({
                "projeto_processo": process.projeto_id,
                "projeto_id": arquivo.caminho.projeto_cadastro_id,
                "projeto_pasta_id": arquivo.caminho.projeto_pasta_id
              })
              if (verificaPasta) {
                const data = {
                  pasta_id: verificaPasta,
                  categoria_id: arquivo.caminho.categoria_id,
                  arquivo_id: arquivo.arquivos.id_arquivo
                }
                var retorno = await PastaAtributo.selectAtributosCategoriaFast(data)
              } else {
                const data = {
                  pasta_id: arquivo.caminho.projeto_pasta_id,
                  categoria_id: arquivo.caminho.categoria_id,
                  arquivo_id: arquivo.arquivos.id_arquivo
                }
                var retorno = await PastaAtributo.selectAtributosCategoriaFast(data)
              }
            }
            resolve(retorno)

          } else {

            if (arquivo.caminho.selecao_filha === 1) {
              var pastas = [];
              var response = await ProjetoPasta.selectFilhosPasta(arquivo.caminho.projeto_pasta_id)

              response.map((pasta) => {
                pastas.push({ label: pasta.nome, value: pasta.id })
              })

              if (pastas.length === 0) {
                const data = {
                  pasta_id: arquivo.caminho.projeto_pasta_id,
                  categoria_id: arquivo.caminho.categoria_id
                }
                var retorno = await PastaAtributo.selectAtributosCategoriaFast(data)
              } else {
                var retorno = pastas
              }
            } else if (arquivo.caminho.cadastro_nova_pasta_campo_id && arquivo.caminho.cadastro_nova_pasta_campo_id !== 0) {
              const data = {
                pasta_id: arquivo.caminho.projeto_pasta_id,
                categoria_id: arquivo.caminho.categoria_id,
                arquivo_id: null,
                flag_filha: true
              }
              var retorno = await PastaAtributo.selectAtributosCategoriaFast(data)
            } else {
              const data = {
                pasta_id: arquivo.caminho.projeto_pasta_id,
                categoria_id: arquivo.caminho.categoria_id
              }
              var retorno = await PastaAtributo.selectAtributosCategoriaFast(data)
            }
            resolve(retorno)
          }

        } catch (error) {
          reject(error)
        }


      } catch (error) {
        reject(error)
      }
    });
  }

  static saveFields(data) {
    return new Promise(async (resolve, reject) => {
      try {
        try {
          const { campos, id, processo_id } = data

          await ProcessoCampos.delete(id)

          const map = Object.keys(campos).map(async (chave) => {
            if (campos[chave] && campos[chave] !== '') {
              return await ProcessoCampos.insert({
                valor: campos[chave],
                processo_passo_id: id,
                processo_campo_cadastro_id: parseInt(chave)
              })
            }
            return null;
          })

          await Promise.all(map)

          await Processo.setaTituloProcesso({
            id: processo_id
          })

          let result = await this.advancesProcess(data)
          resolve(result)

        } catch (error) {
          reject(error);
        }
      } catch (error) {
        reject(error)
      }
    });
  }

  static advancesProcess(data) {
    return new Promise(async function (resolve, reject) {

      try {
        const { processo_id, tarefa_id } = data

        let processo = await Processo.select(null, [{
          name: 'id',
          value: processo_id,
          operator: "="
        }])

        if (processo.length > 0) {
          if (processo[0].processo_passo_id === tarefa_id) { // somente avança o processo se a tarefa preenchida for a tarefa atual
            let result = await ProcessoFluxoCadastro.avancaProcessoExecucaoRefatorado(processo_id)

            if (result) {
              if (result === 'fim') {
                resolve('fim')
              } else {
                let r = await ProcessoPasso.getPassoAtualProcesso(processo_id)
                if (r) {
                  resolve(r)
                } else {
                  await Processo.verificaProcessos()
                  resolve(null)
                }
              }
            } else {
              await Processo.verificaProcessos()
              resolve(null)
            }
          } else {
            resolve(true)
          }
        } else {
          resolve(null)
        }

      } catch (error) {
        reject(error);
      }

    });
  }

}