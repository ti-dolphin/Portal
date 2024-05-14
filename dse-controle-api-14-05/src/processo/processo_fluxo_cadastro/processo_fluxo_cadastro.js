const con = require('../../../data_base');
const sqlUtils = require("../../utils/sqlUtils.js");
const processoObservadores = require("../processo_observadores/processo_observadores.js")
const processoTitulo = require("../processo_titulo/processo_titulo")
const DefinePrazoProcesso = require('../../define_prazo_processo/define_prazo_processo')
const processoArquivo = require('../processo_arquivo/processo_arquivo')
const processoPasso = require('../processo_passo/processo_passo')
const Processo = require('../processo/processo')
const ProjetoCadastro = require('../../projeto/projeto_cadastro/projeto_cadastro.js')
const MomentFunctions = require('../../../momentFunctions')
const processoFluxoCadastroModel = require('./processo_fluxo_cadastro_model.js')
class processoFluxoCadastro {

    /**
     * @param {string[]} fields[] campos a serem consultados
     * @param {object[]} target[] array de obejetos que conte nome do campo (name) e valor a ser consultado(value)
     * @returns {Promise}  que vai resolver em rows e fields   
     **/
    static select(fields = null, targets = null) {
        const sql = sqlUtils.generate_select_query(targets, fields, "processo_fluxo_cadastro");

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
     * Cadastra o fluxo anterior no novo processo, movendo observadores e mapeando o fluxo.
     * 
     * @param {Object} data - Objeto com id do processo_anterior e processo_novo.
     * @returns {Promise} - Uma promessa que, quando resolvida, indica a conclusão do cadastro do fluxo anterior no novo processo.
     */
    static cadastraFluxoAnterior(data) {
        return new Promise(async function (resolve, reject) {
            try {
                // Move os observadores do processo anterior para o novo
                await processoObservadores.moveObservadores(data.processo_anterior, data.processo_novo);

                // Obtém o fluxo do processo anterior
                var fluxo_anterior = await processoFluxoCadastro.getFluxo(data.processo_anterior);

                // Converte o fluxo do processo anterior para o novo
                var fluxo_convertido = await processoFluxoCadastro.converteFluxo(data.processo_novo, fluxo_anterior);

                // Obtém o fluxo do novo processo
                var fluxo_novo = await processoFluxoCadastro.getFluxo(data.processo_novo);

                // Remove o fluxo anterior do novo processo
                await processoFluxoCadastro.removeFluxoAnterior(fluxo_convertido, fluxo_novo);

                // Mapeia o novo fluxo, adicionando ao fluxo convertido apenas os itens que ainda não existem
                await processoFluxoCadastro.mapeiaFluxoNovo(fluxo_convertido, fluxo_novo);

                resolve(); // Resolva a promessa indicando a conclusão bem-sucedida do processo

            } catch (error) {
                reject(error); // Rejeita a promessa em caso de erro durante o processo
            }
            // TODO: processo_anterior e processo_novo estão com tipos diferentes, padronizar
            // TODO: fazer uma função de salvamento de observadores em massa
            // TODO: renomear função getFluxo
        });
    }


    /**
     * O QUE A FUNCAO FAZ?
     * @param {String} processo_anterior 
     * @param {number} processo_novo 
     * @returns {String} "Sucesso" || Log de erro
     */
    static cadastraValores(data) {
        return new Promise(async function (resolve, reject) {
            try {
                await processoFluxoCadastro.atualizaCampoArquivo(data.processo_novo)
                await processoFluxoCadastro.atualizaCampoCopia(data.processo_novo)
                await processoTitulo.moveTitulo(data.processo_anterior, data.processo_novo)
                await DefinePrazoProcesso.movePrazo(data.processo_anterior, data.processo_novo)
                resolve('Sucesso')
            } catch (error) {
                reject(error)
            }
        });
    }

    static removeFluxoProcesso(processo_cadastro_id) {
        const sql = 'delete from processo_fluxo_cadastro where id > 0 and condicao = "nao" and processo_cadastro_id = ' + processo_cadastro_id

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

    static atualizaCampoArquivo(processo_novo) {
        const sql = `SELECT * FROM processo_campo_arquivo WHERE processo_id = ${processo_novo}`;

        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    try {
                        const promises = [];

                        rows.forEach((r) => {
                            // Só adicionamos a promessa se entrar na condição
                            if (r.cadastro_nova_pasta_campo_id != 0 && r.cadastro_nova_pasta_campo_id != -1) {
                                promises.push((async () => {
                                    const campo_novo = await processoFluxoCadastro.consultaCampoNovo(r.cadastro_nova_pasta_campo_id, processo_novo);
                                    if (campo_novo) {
                                        await processoFluxoCadastro.editaCampoArquivo(r.id, campo_novo.id);
                                    }
                                })());
                            }
                        });

                        // Executar todas as promessas em paralelo
                        Promise.all(promises).then(() => {
                            console.log('Todas as operações foram concluídas.');
                            resolve()
                        }).catch(error => {
                            reject(error)
                        });

                    } catch (error) {
                        reject(error)
                    }
                }
            });

        });
    }

    static editaCampoArquivo(id, cadastro_nova_pasta_campo_id) {
        const sql = `update processo_campo_arquivo set cadastro_nova_pasta_campo_id = ` + cadastro_nova_pasta_campo_id + ` WHERE id = ` + id

        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows[0]);
                }
            });

        });
    }

    static atualizaCampoCopia(processo_novo) {
        const sql = `SELECT * FROM processo_campo_copia where processo_cadastro_id = ` + processo_novo

        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {

                    try {
                        const map = rows.map(async (r) => {
                            if (r.processo_campo_copia_id != 0 && r.processo_campo_copia_id != -1) {
                                var campo_novo = await processoFluxoCadastro.consultaCampoNovo(r.processo_campo_copia_id, processo_novo)
                                if (campo_novo) {
                                    await processoFluxoCadastro.editaCampoCopia(r.id, campo_novo.id)
                                }
                            }
                        })

                        await Promise.all(map)
                        resolve()
                    } catch (error) {
                        reject(error)
                    }
                }
            });

        });
    }

    static editaCampoCopia(id, processo_campo_copia_id) {
        const sql = `update processo_campo_copia set processo_campo_copia_id = ` + processo_campo_copia_id + ` WHERE id = ` + id

        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows[0]);
                }
            });

        });
    }

    /**
     * Mapeia o novo fluxo, adicionando ao fluxo convertido apenas os itens que ainda não existem.
     * 
     * @param {Array} fluxo_convertido - Array contendo informações do fluxo anterior convertido.
     * @param {Array} fluxo_novo - Array contendo informações do novo fluxo.
     * @returns {Promise} - Uma promessa que, quando resolvida, indica a conclusão do mapeamento do novo fluxo.
     */
    static mapeiaFluxoNovo(fluxo_convertido, fluxo_novo) {
        return new Promise(async function (resolve, reject) {
            try {
                const map = fluxo_novo.map(async (fn) => {
                    fluxo_convertido.map(async (fc) => {
                        // Se o passo seguinte do novo fluxo coincide com o fluxo convertido, verifica e adiciona ao fluxo convertido se ainda não existir
                        if (fn.passo_seguinte == fc.passo_seguinte) {
                            const fluxo = {
                                condicao: fc.condicao,
                                valor_condicao: fc.valor_condicao,
                                status: fc.status,
                                passo_atual: fc.passo_atual,
                                passo_seguinte: fc.passo_seguinte,
                                passo_decisao: fc.passo_decisao,
                                processo_campo_cadastro_id: fc.processo_campo_cadastro_id,
                                processo_cadastro_id: fc.processo_cadastro_id
                            };

                            // Verifica se o fluxo já existe e, se não existir, o adiciona
                            if (await processoFluxoCadastro.verificaFluxoExistente(fluxo)) {
                                await processoFluxoCadastro.insert(fluxo);
                            }
                        }
                    });
                });

                // Aguarda o término de todas as operações assíncronas antes de resolver a promessa
                await Promise.all(map);
                resolve();

            } catch (error) {
                reject(error); // Rejeita a promessa em caso de erro durante o mapeamento
            }
        });
    }


    /**
     * Remove o fluxo anterior, que foi convertido e corresponde ao novo fluxo.
     * 
     * @param {Array} fluxo_convertido - Array contendo informações do fluxo anterior convertido.
     * @param {Array} fluxo_novo - Array contendo informações do novo fluxo.
     * @returns {Promise} - Uma promessa que, quando resolvida, indica a conclusão da remoção do fluxo anterior correspondente.                 
     */
    static removeFluxoAnterior(fluxo_convertido, fluxo_novo) {
        return new Promise(async function (resolve, reject) {
            try {
                const map2 = fluxo_novo.map(async (fn) => {
                    const map = fluxo_convertido.map(async (fc) => {
                        // Se os passos atual e seguinte do novo fluxo coincidem com o fluxo convertido, remove o fluxo anterior
                        if (fn.passo_atual == fc.passo_atual && fn.passo_seguinte == fc.passo_seguinte) {
                            await processoFluxoCadastro.removeFluxo(fn.id);
                        }
                    });
                    await Promise.all(map);
                });
                await Promise.all(map2);
                resolve();

            } catch (error) {
                reject(error);
            }
        });
    }


    static removeFluxo(id) {
        const sql = 'delete from processo_fluxo_cadastro where id = ' + id

        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows[0]);
                }
            });

        });
    }

    static editaFluxoNovo(id, valor_condicao, processo_campo_cadastro_id) {
        const sql = `update processo_fluxo_cadastro set valor_condicao = '` + valor_condicao + `',
        processo_campo_cadastro_id = `+ processo_campo_cadastro_id + ` WHERE id = ` + id

        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if (rows.length > 0) {
                        resolve(rows[0]);
                    } else {
                        resolve(false)
                    }
                }
            });

        });
    }

    static consultaCampoNovo(campo_id, processo_novo) {
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
                                    WHERE id = ` + campo_id + `
                                )
                        )
                        AND processo_cadastro_id = ` + processo_novo + `
                )
                AND ordem = (
                    SELECT ordem
                    FROM processo_campo_cadastro
                    WHERE id = ` + campo_id + `
                ) `
        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if (rows.length > 0) {
                        resolve(rows[0]);
                    } else {
                        resolve(false)
                    }
                }
            });

        });
    }

    /**
     * Converte o fluxo de um processo anterior para um novo processo, mapeando os passos, condições e campos associados.
     * 
     * @param {number} processo_novo - O ID do novo processo para o qual o fluxo está sendo convertido.
     * @param {Array} fluxo_anterior - Um array representando o fluxo do processo anterior, contendo informações sobre passos, condições e campos.
     * @returns {Promise} - Uma promessa que, quando resolvida, fornece um array contendo as informações convertidas do novo fluxo.           
     */
    static converteFluxo(processo_novo, fluxo_anterior) {
        return new Promise(async function (resolve, reject) {
            try {
                var arr = [];

                const map = fluxo_anterior.map(async (f) => {
                    // Para cada entrada no fluxo anterior, busca os novos IDs associados no novo processo
                    var novo_passo_atual = await processoFluxoCadastro.achaPassoNovo(f.passo_atual, processo_novo);
                    var novo_passo_seguinte = await processoFluxoCadastro.achaPassoNovo(f.passo_seguinte, processo_novo);
                    var novo_passo_decisao = await processoFluxoCadastro.achaPassoNovo(f.passo_decisao, processo_novo);
                    var campo_novo = await processoFluxoCadastro.consultaCampoNovo(f.processo_campo_cadastro_id, processo_novo);

                    // Se todos os novos IDs forem encontrados, adiciona as informações convertidas ao array
                    if (novo_passo_atual && novo_passo_seguinte && novo_passo_decisao && campo_novo) {
                        arr.push({
                            condicao: 'sim',
                            valor_condicao: f.valor_condicao,
                            status: 'Ativo',
                            passo_atual: novo_passo_atual.id,
                            passo_seguinte: novo_passo_seguinte.id,
                            passo_decisao: novo_passo_decisao.id ? novo_passo_decisao.id : 0,
                            processo_campo_cadastro_id: campo_novo.id,
                            processo_cadastro_id: processo_novo
                        });
                    }
                });

                // Aguarda o término de todas as operações assíncronas antes de resolver a promessa
                await Promise.all(map);
                resolve(arr);

            } catch (error) {
                reject(error); // Rejeita a promessa em caso de erro durante a conversão
            }
        });
    }


    static achaPassoNovo(passo_antigo_id, processo_novo) {
        const sql = `select id from processo_passo_cadastro 
        where id_diagrama = (select id_diagrama from processo_passo_cadastro where id = `+ passo_antigo_id + `)
        and processo_cadastro_id = `+ processo_novo

        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if (rows.length > 0) {
                        resolve(rows[0]);
                    } else {
                        if (passo_antigo_id === 0) { // emerim acredita que esse eh o tal do fim, pode ta errado mas dificil
                            resolve({ id: 0 })
                        } else {
                            resolve(false)
                        }
                    }
                }
            });

        });
    }

    /**
     * Retorna todas as decisões do fluxo antigo
     * @param {String} processo_id id do processo antigo
     */
    static getFluxo(processo_id) {
        const sql = `select * from processo_fluxo_cadastro where condicao = 'sim' and processo_cadastro_id =` + processo_id

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

    static consultaPassosIguais(processo_anterior, processo_novo) { // consulta os passos que existem em ambos processos
        const sql = `select id,processo_cadastro_id,id_diagrama from processo_passo_cadastro where id_diagrama  
        IN (select id_diagrama from processo_passo_cadastro where processo_cadastro_id IN (`+ processo_anterior + `,` + processo_novo + `) 
        group by id_diagrama)`

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

    static verificaCondicaoPassoAtual(processo_id, responsavel_id) {
        const sql = `select * from processo_fluxo_cadastro where passo_decisao = 
        (select id from processo_passo_cadastro WHERE ID = (select processo_passo_cadastro_id from processo where id = `+ processo_id + `))`

        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if (rows.length > 0) {
                        var cond = true
                        const map = rows.map(async (f) => {
                            if (await processoFluxoCadastro.getValoresCampos(processo_id, f.processo_campo_cadastro_id, f.valor_condicao)) { // verifica se a condição atual do fluxo foi cumprida
                                await processoFluxoCadastro.avancaProcesso(processo_id, f.passo_seguinte, responsavel_id) // condição atual cumprida avança o processo
                                await processoFluxoCadastro.insertNovoPassoAtual(processo_id, responsavel_id, f.passo_seguinte)
                                cond = false
                            }
                        })
                        await Promise.all(map)

                        if (cond) {
                            await processoFluxoCadastro.avancaProcesso(processo_id, 0, responsavel_id)
                            resolve('Nenhuma condição foi cumprida')
                        } else {
                            resolve(true)
                        }
                    } else {
                        resolve(false);
                    }
                }
            });

        });
    }

    static getValoresCampos(processo_id, campo_id, valor) {
        const sql = `select * from processo_campos 
        where processo_passo_id IN (select id from processo_passo where processo_id = `+ processo_id + `) 
        and processo_campo_cadastro_id = `+ campo_id + ` and valor = '` + valor + `'`

        return new Promise(function (resolve, reject) {

            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if (rows.length > 0) {
                        resolve(true);
                    } else {
                        resolve(false)
                    }
                }
            });

        });
    }

    static getValoresCamposDecisao(processo_id, campo_id, valor, passo_id) {
        const sql = `select id, valor from processo_campos 
        where processo_passo_id IN (select id from processo_passo where processo_id = `+ processo_id + `) 
        and processo_campo_cadastro_id = `+ campo_id + ` and valor = '` + valor + `'`

        return new Promise(function (resolve, reject) {

            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if (rows.length > 0) {
                        resolve(rows);
                    } else {
                        resolve(false)
                    }
                }
            });

        });
    }

    static avancaProcesso(processo_id, processo_passo_cadastro_id, responsavel_id) {
        const sql = 'update processo set processo_passo_cadastro_id = ' + processo_passo_cadastro_id + ' where id = ' + processo_id

        return new Promise(function (resolve, reject) {

            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if (processo_id != 0) {
                        processoFluxoCadastro.verificaCondicaoPassoAtual(processo_id, responsavel_id).then(() => {
                            resolve(rows);
                        })
                    } else {
                        resolve(rows);
                    }
                }
            });

        });
    }

    static avancaProcessoPasso(processo_id, processo_passo_id) {
        const sql = 'update processo set processo_passo_id = ' + processo_passo_id + ' where id = ' + processo_id

        return new Promise(function (resolve, reject) {

            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });

        });
    }

    static getPassoSubProcesso(subprocesso_id) {
        const sql = "SELECT * FROM processo_passo where subprocesso_id = " + subprocesso_id
        return new Promise(function (resolve, reject) {
            con.query(sql, async function (err, rows) {
                if (err) {
                    reject(err);
                } else {
                    if (rows.length > 0) {
                        resolve(rows[0])
                    } else {
                        resolve(false)
                    }
                }
            });
        });
    }

    static acabaSubProcesso(processo_id) {
        return new Promise(async function (resolve, reject) {
            try {
                const passo = await processoFluxoCadastro.getPassoSubProcesso(processo_id)
                if (passo) {
                    await processoFluxoCadastro.avancaProcessoExecucaoRefatorado(passo.processo_id)
                    await processoPasso.update({
                        id: passo.id,
                        status_id: 1,
                        data_conclusao: MomentFunctions.dateTimeAtual(),
                        data_modificacao: MomentFunctions.dateTimeAtual()
                    })
                    resolve(true)
                } else {
                    resolve(false)
                }
            } catch (error) {
                reject(error)
            }
        })
    }

    static verificaTerminoSubProcesso(processo_passo_id, processo_id) {
        return new Promise(function (resolve, reject) {
            try {
                const sql = "select data_fim from processo where id = (SELECT subprocesso_id FROM processo_passo where processo_passo_cadastro_id = " + processo_passo_id + " and processo_id = " + processo_id + ")"
                con.query(sql, async function (err, rows) {
                    if (err) {
                        reject(err);
                    } else {
                        if (rows.length > 0) {
                            if (rows[0].data_fim) {
                                resolve(true)
                            } else {
                                resolve(false)
                            }
                        } else {
                            resolve(false)
                        }
                    }
                });
            } catch (error) {
                reject(error)
            }
        });
    }

    static avancaProcessoExecucaoRefatorado(processo_id, chamada_recursiva = false) {
        return new Promise(async function (resolve, reject) {
            try {
                var processo = await processoFluxoCadastro.getProcesso(processo_id)

                const usuario_id = processo.usuario_id
                const passo_atual = processo.processo_passo_id
                const passo_cadastro_atual = await processoFluxoCadastro.getPassoCadastro(processo.processo_passo_cadastro_id)
                const campos_cadastro_atual = await processoFluxoCadastro.getCamposPassoCadastro(processo.processo_passo_cadastro_id)
                const processo_cadastro = processo.processo_cadastro_id
                const fluxo = await processoFluxoCadastro.getFluxoPassoAtual(processo_cadastro, passo_cadastro_atual.id)

                if (passo_cadastro_atual && passo_cadastro_atual.decisao === 'nao') {
                    if (!chamada_recursiva) {
                        const preenchido = await processoFluxoCadastro.verificaPreenchimentoPassoProcesso(processo_id, passo_atual, campos_cadastro_atual)


                        if (preenchido) {
                            if (fluxo) {
                                const retorno = await processoFluxoCadastro.mapeiaFluxoProcesso(processo_id, usuario_id, fluxo)
                                // await processoArquivo.ajustaUrl()
                                resolve(retorno)
                            } else { // veririca se passo atual é o final
                                if (passo_cadastro_atual.estagio === 'final') {
                                    if (passo_cadastro_atual.subprocesso == 1) {
                                        if (await processoFluxoCadastro.verificaTerminoSubProcesso(passo_atual, processo_id)) {
                                            await Processo.update({ id: processo_id, data_fim: MomentFunctions.dateTimeAtual() })
                                        }
                                    } else {
                                        await Processo.update({ id: processo_id, data_fim: MomentFunctions.dateTimeAtual() })
                                    }
                                    await processoFluxoCadastro.acabaSubProcesso(processo_id)
                                    // await processoArquivo.ajustaUrl()
                                    resolve('fim')
                                } else {
                                    await Processo.update({ id: processo_id, condition_error: '1' })
                                    // await processoArquivo.ajustaUrl()
                                    resolve()
                                }
                            }
                        } else { // passo atual não é condição e não foi preenchido, termina a função
                            // await processoArquivo.ajustaUrl()
                            resolve()
                        }
                    } else {
                        // await processoArquivo.ajustaUrl()
                        resolve()
                    }

                } else { // o passo atual é uma condição
                    const retorno = await processoFluxoCadastro.verificaCondicaoPassoAtualRefatorado(processo_id, usuario_id, passo_cadastro_atual.id)
                    // await processoArquivo.ajustaUrl()
                    resolve(retorno)
                }

            } catch (error) {
                // await processoArquivo.ajustaUrl()
                reject(error)
            }
        })
    }

    static avancaPassoProcesso(processo_id, usuario_id, passo_seguinte, passo_atual) {
        return new Promise(async function (resolve, reject) {
            try {

                if (passo_seguinte === 0 && passo_atual) {
                    const passo_cadastro_atual = await processoFluxoCadastro.getPassoCadastro(passo_atual)
                    if (passo_cadastro_atual.subprocesso == 1) {
                        if (await processoFluxoCadastro.verificaTerminoSubProcesso(passo_atual, processo_id)) {
                            await Processo.update({ id: processo_id, data_fim: MomentFunctions.dateTimeAtual() })
                        }
                    } else {
                        await Processo.update({ id: processo_id, condition_error: 0, data_fim: MomentFunctions.dateTimeAtual() })
                    }
                    await processoFluxoCadastro.acabaSubProcesso(processo_id)
                    resolve('fim')
                } else {
                    const novo_passo_atual = await processoFluxoCadastro.insertNovoPassoAtualRefatorado(processo_id, usuario_id, passo_seguinte)

                    await processoFluxoCadastro.atualizaProcesso(novo_passo_atual.processo_passo_id, novo_passo_atual.id, processo_id)
                    if (novo_passo_atual.subprocesso && !novo_passo_atual.bloqueante) {
                        await processoFluxoCadastro.avancaProcessoExecucaoRefatorado(processo_id)
                    }
                    resolve(novo_passo_atual)
                }

            } catch (error) {
                reject(error)
            }
        })
    }

    static verificaPreenchimentoPassoProcesso(processo_id, processo_passo_id, campos_cadastro) {

        return new Promise(async function (resolve, reject) {

            try {
                const verifyArray = []
                const map = campos_cadastro.map(async (c) => {
                    if (c.obrigatoriedade === 1) {
                        if (c.tipo === 'Campo Cópia') {
                            const verifica = await processoFluxoCadastro.verificaSeProcessoPassouPorPasso(processo_id, c.processo_passo_cadastro_id)
                            if (verifica) {
                                verifyArray.push(await processoFluxoCadastro.verificaPreenchimentoCampo(processo_passo_id, c.id))
                            } else {
                                verifyArray.push(true)
                            }
                        } else {
                            verifyArray.push(await processoFluxoCadastro.verificaPreenchimentoCampo(processo_passo_id, c.id))
                        }

                    } else {
                        verifyArray.push(true)
                    }
                })

                await Promise.all(map)
                if (verifyArray.indexOf(false) === -1) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            } catch (error) {
                reject(error)
            }
        });
    }

    static verificaSeProcessoPassouPorPasso(processoId, processo_passo_cadastro_id) {
        const sql = "SELECT * FROM processo_passo where id = " + processoId + " and processo_passo_cadastro_id = " + processo_passo_cadastro_id
        //console.log("sql gerado:", sql)

        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if (rows.length > 0) {
                        resolve(true)
                    } else {
                        resolve(false)
                    }
                }
            });

        });
    }

    static verificaPreenchimentoCampo(processo_passo_id, processo_campo_cadastro_id) {
        const sql = "SELECT * FROM processo_campos where processo_passo_id = " + processo_passo_id + " and processo_campo_cadastro_id = " + processo_campo_cadastro_id

        return new Promise(function (resolve, reject) {

            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if (rows.length > 0) {
                        resolve(true)
                    } else {
                        resolve(false)
                    }
                }
            });

        });
    }

    static insertNovoPassoAtualRefatorado(processo_id, responsavel_id, processo_passo_cadastro_id) {
        return new Promise(async function (resolve, reject) {
            try {
                let usuario_id = responsavel_id
                var novoPassoAtual = await processoFluxoCadastro.getPassoCadastro(processo_passo_cadastro_id)
                if (novoPassoAtual.papel_id === 5) {
                    const processo = await Processo.select(null, [{ name: 'id', value: processo_id }]);
                    const projeto = await ProjetoCadastro.select(null, [{ name: 'id', value: processo[0].projeto_id }])
                    responsavel_id = projeto[0].responsavel_id
                } else {
                    responsavel_id = novoPassoAtual.papel_id === 0 ? responsavel_id : null
                }
                if (novoPassoAtual) {
                    const obj = {
                        data_inicio: MomentFunctions.dateTimeAtual(),
                        data_modificacao: MomentFunctions.dateTimeAtual(),
                        processo_id: processo_id,
                        processo_passo_cadastro_id: novoPassoAtual.id,
                        responsavel_id: responsavel_id,
                        estimativa: novoPassoAtual.estimativa ? MomentFunctions.getPrazo(novoPassoAtual.estimativa) : null,
                        papel_id: novoPassoAtual.papel_id,
                        status_id: novoPassoAtual.decisao === 'sim' ? 1 : novoPassoAtual.subprocesso && !novoPassoAtual.bloqueante ? 2 : 5
                    }

                    if (novoPassoAtual.subprocesso == 1) {
                        const subProcessoIniciado = await Processo.iniciaSubProcesso(processo_id, novoPassoAtual.subprocesso_cadastro_id, usuario_id)
                        if (subProcessoIniciado) {
                            obj.subprocesso_id = subProcessoIniciado.insertId
                        }
                    }

                    var result = await processoFluxoCadastro.insertProcessoPasso(obj)
                    novoPassoAtual.processo_passo_id = result.insertId
                    resolve(novoPassoAtual)
                } else {
                    resolve(false)
                }

            } catch (error) {
                reject(error)
            }
        })
    }

    static atualizaProcesso(processo_passo_id, processo_passo_cadastro_id, processo_id) {
        const sql = "UPDATE processo SET processo_passo_id = " + processo_passo_id + ", processo_passo_cadastro_id = " + processo_passo_cadastro_id + ", condition_error = 0 where id = " + processo_id
        return new Promise(function (resolve, reject) {

            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows)
                }
            });

        });
    }

    static verificaCondicaoProcesso(valor, processo_passo_id, processo_campo_cadastro_id) {
        const sql = "SELECT * FROM processo_campos where valor = '" + valor + "' and processo_passo_id = " + processo_passo_id + " and processo_campo_cadastro_id = " + processo_campo_cadastro_id
        return new Promise(function (resolve, reject) {

            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if (rows.length > 0) {
                        resolve(true)
                    } else {
                        resolve(false)
                    }
                }
            });

        });
    }

    static verificaCondicaoProcessoCondicional(processo_id, valor, processo_campo_cadastro_id) {

        const sql = `select * from processo_campos 
        where processo_passo_id IN (select id from processo_passo where processo_id = `+ processo_id + `) 
        and processo_campo_cadastro_id = `+ processo_campo_cadastro_id + ` and valor = '` + valor + `'`

        return new Promise(function (resolve, reject) {
            try {
                con.query(sql, async function (err, rows, fields) {
                    if (err) {
                        reject(err);
                    } else {
                        if (rows.length > 0) {
                            resolve(true)
                        } else {
                            resolve(false)
                        }
                    }
                });           
            } catch (error) {
                reject(error)
            }

        });
    }

    static mapeiaFluxoProcesso(processo_id, usuario_id, fluxo) {
        return new Promise(async function (resolve, reject) {

            try {
                let retorno

                for (const f of fluxo) {
                    const passo_atual = f.passo_atual
                    const passo_seguinte = f.passo_seguinte
                    const valor_condicao = f.valor_condicao
                    const campo_cadastro_id = f.processo_campo_cadastro_id

                    if (f.condicao === 'sim') {
                        const processo_passo = await processoFluxoCadastro.getProcessoPasso(processo_id, f.passo_campo)
                        if (processo_passo) {
                            const condicao = await processoFluxoCadastro.verificaCondicaoProcesso(valor_condicao, processo_passo.id, campo_cadastro_id);
                            if (condicao) {
                                retorno = await processoFluxoCadastro.avancaPassoProcesso(processo_id, usuario_id, passo_seguinte, passo_atual)
                                break;
                            }
                        }
                    } else {
                        retorno = await processoFluxoCadastro.avancaPassoProcesso(processo_id, usuario_id, passo_seguinte, passo_atual)
                        break;
                    }

                }

                if (retorno) {
                    resolve(retorno)
                    await processoFluxoCadastro.avancaProcessoExecucaoRefatorado(processo_id, true)
                } else {
                    await Processo.update({ id: processo_id, condition_error: '1' })
                    resolve('Nenhuma condição foi cumprida')
                }

            } catch (error) {
                reject(error)
            }

        })
    }

    static getProcessoPasso(processo_id, processo_passo_cadastro_id) {
        const sql = "SELECT * FROM processo_passo where processo_id = " + processo_id + " and processo_passo_cadastro_id = " + processo_passo_cadastro_id + " order by id desc limit 1"

        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if (rows.length > 0) {
                        resolve(rows[0])
                    } else {
                        resolve(false)
                    }
                }
            });

        });
    }

    static verificaCondicaoPassoAtualRefatorado(processo_id, usuario_id, passo_decisao) {
        const sql = `select * from processo_fluxo_cadastro where passo_decisao = ` + passo_decisao

        return new Promise(function (resolve, reject) {
            try {
                con.query(sql, async function (err, rows, fields) {
                    if (err) {
                        reject(err);
                    } else {
                        if (rows.length > 0) {

                            let retorno

                            for (const f of rows) {
                                const passo_atual = f.passo_atual
                                const passo_seguinte = f.passo_seguinte
                                const valor_condicao = f.valor_condicao
                                const campo_cadastro_id = f.processo_campo_cadastro_id

                                if (f.condicao === 'sim') {
                                    const condicao = await processoFluxoCadastro.verificaCondicaoProcessoCondicional(processo_id, valor_condicao, campo_cadastro_id);
                                    if (condicao) {
                                        retorno = await processoFluxoCadastro.avancaPassoProcesso(processo_id, usuario_id, passo_seguinte, passo_atual)
                                        break;
                                    }
                                } else {
                                    retorno = await processoFluxoCadastro.avancaPassoProcesso(processo_id, usuario_id, passo_seguinte, passo_atual)
                                    break;
                                }

                            }

                            if (retorno) {
                                resolve(retorno)
                                await processoFluxoCadastro.avancaProcessoExecucaoRefatorado(processo_id, true)
                            } else {
                                await Processo.update({ id: processo_id, condition_error: '1' })
                                resolve('Nenhuma condição foi cumprida')
                            }

                        } else {
                            resolve(false);
                        }
                    }
                });
            } catch (error) {
                reject(error)
            }

        });
    }

    static avancaProcessoExecucao(processo_id) {
        return new Promise(async function (resolve, reject) {
            var processo = await processoFluxoCadastro.getProcesso(processo_id)
            var fluxo = await processoFluxoCadastro.getFluxoPassoAtual(processo.processo_cadastro_id, processo.processo_passo_cadastro_id)

            if (fluxo) {
                if (fluxo[0].condicao === 'sim') {
                    if (fluxo.length > 1) { // é uma condição, vai verificar qual delas foi cumprida
                        var retorno = false
                        var aux = []
                        const map = fluxo.map(async (f) => {
                            var decisao = await processoFluxoCadastro.getValoresCamposDecisao(processo_id, f.processo_campo_cadastro_id, f.valor_condicao);
                            if (decisao) {
                                decisao.forEach((dec) => {
                                    aux.push(dec) // verifica se a condição atual do fluxo foi cumprida
                                })
                            }
                        })
                        await Promise.all(map)
                        aux.sort((a, b) => b.id - a.id)
                        var teste = true
                        const map2 = fluxo.map(async (f) => {
                            if (f.valor_condicao === aux[0]?.valor) {
                                if (teste) {
                                    retorno = await processoFluxoCadastro.insertNovoPassoAtual(processo_id, processo.usuario_id, f.passo_seguinte)
                                    await processoFluxoCadastro.avancaProcesso(processo_id, f.passo_seguinte, processo.usuario_id) // condição atual cumprida avança o processo
                                    teste = false
                                }
                            }
                        })
                        await Promise.all(map2)
                        resolve(retorno)
                    } else { // somente um fluxo cadastrado
                        if (await processoFluxoCadastro.getValoresCamposDecisao(processo_id, fluxo[0].processo_campo_cadastro_id, fluxo[0].valor_condicao)) {
                            retorno = await processoFluxoCadastro.insertNovoPassoAtual(processo_id, processo.usuario_id, fluxo[0].passo_seguinte)
                            await processoFluxoCadastro.avancaProcesso(processo_id, fluxo[0].passo_seguinte, processo.usuario_id) // condição atual cumprida avança o processo
                            resolve(retorno)
                        } else {
                            var teste_passo_final = await processoFluxoCadastro.verificaUltimoPasso(processo.processo_cadastro_id, fluxo[0].passo_decisao)
                            if (teste_passo_final) {
                                resolve('fim')
                            } else {
                                resolve(teste_passo_final)
                            }
                        }
                    }
                } else {  // nao é uma condição, avança para o proximo passo
                    retorno = await processoFluxoCadastro.insertNovoPassoAtual(processo_id, processo.usuario_id, fluxo[0].passo_seguinte)
                    await processoFluxoCadastro.avancaProcesso(processo_id, fluxo[0].passo_seguinte, processo.usuario_id)
                    resolve(retorno)
                }
            } else {
                var teste_passo_final = await processoFluxoCadastro.verificaUltimoPasso(processo.processo_cadastro_id, processo.processo_passo_cadastro_id)
                if (teste_passo_final) {
                    resolve('fim')
                } else {
                    resolve(teste_passo_final)
                }
            }
        });
    }

    static verificaUltimoPasso(processo_cadastro_id, processo_passo_cadastro_id) {
        const sql = "select if(estagio = 'final',1,0) as teste_final from processo_passo_cadastro where processo_cadastro_id = " + processo_cadastro_id + " and id = " + processo_passo_cadastro_id

        return new Promise(function (resolve, reject) {

            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if (rows.length > 0) {
                        if (rows[0].teste_final === 1) {
                            resolve(true)
                        } else {
                            resolve(false)
                        }
                    } else {
                        resolve(false)
                    }
                }
            });

        });
    }

    static insertNovoPassoAtual(processo_id, responsavel_id, processo_passo_cadastro_id) {
        return new Promise(async function (resolve, reject) {
            var novoPassoAtual = await processoFluxoCadastro.getPassoCadastro(processo_passo_cadastro_id)
            if (novoPassoAtual) {
                var result = await processoFluxoCadastro.insertProcessoPasso({
                    data_inicio: MomentFunctions.dateTimeAtual(),
                    data_modificacao: MomentFunctions.dateTimeAtual(),
                    processo_id: processo_id,
                    processo_passo_cadastro_id: novoPassoAtual.id,
                    responsavel_id: novoPassoAtual.papel_id === 0 ? responsavel_id : null,
                    estimativa: novoPassoAtual.estimativa ? MomentFunctions.getPrazo(novoPassoAtual.estimativa) : null,
                    papel_id: novoPassoAtual.papel_id,
                    status_id: 5
                })
                await processoFluxoCadastro.avancaProcessoPasso(processo_id, result.insertId)
                novoPassoAtual.newTarefa = result.insertId
                resolve(novoPassoAtual)
            } else {
                resolve(false)
            }

        })
    }

    static insertProcessoPasso(data) {
        const sql = sqlUtils.generate_insert_query(data, "processo_passo");

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

    static getPassoCadastro(processo_passo_cadastro_id) {
        const sql = "select * from processo_passo_cadastro where id = " + processo_passo_cadastro_id

        return new Promise(function (resolve, reject) {
            try {
                con.query(sql, async function (err, rows, fields) {
                    if (err) {
                        reject(err);
                    } else {
                        if (rows.length > 0) {
                            resolve(rows[0])
                        } else {
                            resolve(false)
                        }
                    }
                });
            } catch (error) {
                reject(error)
            }
        });
    }

    static getCamposPassoCadastro(processo_passo_cadastro_id) {
        const sql = "SELECT * FROM processo_campo_cadastro where processo_passo_cadastro_id = " + processo_passo_cadastro_id

        return new Promise(function (resolve, reject) {
            try {
                con.query(sql, async function (err, rows, fields) {
                    if (err) {
                        reject(err);
                    } else {

                        const retorno = []

                        const map = rows.map(async (r) => {
                            if (r.tipo === "Campo Cópia") {
                                const campoCopia = await processoFluxoCadastro.getCampoCopia(r.id)
                                if (campoCopia) {
                                    const campoCadastro = await processoFluxoCadastro.getCampoCadastro(campoCopia.processo_campo_copia_id)
                                    if (campoCadastro && campoCadastro.tipo !== "Arquivo") {
                                        retorno.push(r)
                                    }
                                }
                            } else {
                                retorno.push(r)
                            }
                        })

                        await Promise.all(map)

                        resolve(retorno)
                    }
                });
            } catch (error) {
                reject(error)
            }
        });
    }

    static getCampoCopia(processo_campo_cadastro_id) {
        const sql = "SELECT * FROM processo_campo_copia where processo_campo_cadastro_id = " + processo_campo_cadastro_id

        return new Promise(function (resolve, reject) {
            try {
                con.query(sql, async function (err, rows, fields) {
                    if (err) {
                        reject(err);
                    } else {
                        if (rows.length > 0) {
                            resolve(rows[0])
                        } else {
                            resolve(false)
                        }
                    }
                });

            } catch (error) {
                reject(error)
            }
        });
    }

    static getCampoCadastro(id) {
        const sql = "SELECT * FROM processo_campo_cadastro where id = " + id

        return new Promise(function (resolve, reject) {

            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if (rows.length > 0) {
                        resolve(rows[0])
                    } else {
                        resolve(false)
                    }
                }
            });

        });
    }

    static getFluxoPassoAtual(processo_cadastro_id, passo_atual) {
        const sql = "SELECT *, (select processo_passo_cadastro_id from processo_campo_cadastro where id = processo_campo_cadastro_id) as passo_campo FROM processo_fluxo_cadastro where processo_cadastro_id = " + processo_cadastro_id + " and passo_atual = " + passo_atual

        return new Promise(function (resolve, reject) {
            try {
                con.query(sql, async function (err, rows, fields) {
                    if (err) {
                        reject(err);
                    } else {
                        if (rows.length > 0) {
                            resolve(rows)
                        } else {
                            resolve(false)
                        }
                    }
                });
            } catch (error) {
                reject(error)
            }
        });
    }

    static getProcesso(id) {
        const sql = "SELECT * FROM processo where id = " + id

        return new Promise(function (resolve, reject) {
            try {
                con.query(sql, async function (err, rows, fields) {
                    if (err) {
                        reject(err);
                    } else {
                        if (rows.length > 0) {
                            resolve(rows[0])
                        } else {
                            resolve(false)
                        }
                    }
                });
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
    static insert(data) {
        return new Promise(async function (resolve, reject) {

            try {
                const sql = sqlUtils.generate_insert_query(data, "processo_fluxo_cadastro");
                // Do async job

                con.getConnection(function (err, connection) {
                    if (err) {
                        console.error("Erro ao obter conexão:", err);
                        return;
                    }
                    // Execute sua consulta aqui
                    connection.query(sql, function (err, rows, fields) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(rows, fields);
                        }
                    });
                    // Importante: Libere a conexão após o uso
                    connection.release();
                });

            } catch (error) {
                reject(error)
            }

        });
    }

    static verificaFluxoExistente(data) {

        try {
            let sql = "select * from processo_fluxo_cadastro where id > 0 "

            Object.keys(data).map((key) => {
                sql = sql + " and " + key + " = " + con.escape(data[key])
            })

            return new Promise(function (resolve, reject) {
                // Do async job
                con.query(sql, function (err, rows, fields) {
                    if (err) {
                        reject(err);
                    } else {
                        // resolve(rows, fields);
                        if (rows.length > 0) {
                            resolve(false)
                        } else {
                            resolve(true)
                        }
                    }
                });

            });

        } catch (error) {
            resolve(true)
        }

    }

    /**
     * 
     * @param {object} data contem os pares de campo e valor 
     * @returns {Promise}  que vai resolver em rows e fields
     */
    static update(data) {
        const sql = sqlUtils.generate_update_query(data, "processo_fluxo_cadastro");

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
        const sql = "delete from processo_fluxo_cadastro where processo_cadastro_id = " + id;
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

}
module.exports = processoFluxoCadastro;