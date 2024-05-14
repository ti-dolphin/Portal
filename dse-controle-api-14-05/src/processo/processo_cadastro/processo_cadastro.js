const con = require('../../../data_base');
const sqlUtils = require("../../utils/sqlUtils.js");
const fs = require("fs");
const GoogleCloudStorage = require('../../../google-cloud-storage')
const processoPassoCadastro = require("../processo_passo_cadastro/processo_passo_cadastro");

class ProcessoCadastro {

    /**
     * @param {string[]} fields[] campos a serem consultados
     * @param {object[]} target[] array de obejetos que conte nome do campo (name) e valor a ser consultado(value)
     * @returns {Promise}  que vai resolver em rows e fields   
     **/
    static select(fields = null, targets = null) {
        const sql = sqlUtils.generate_select_query(targets, fields, "processo_cadastro");
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

    static voltaProcesso(processo){
        const sql = 'select * from processo_cadastro WHERE id = '+processo.id
        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if(rows.length > 0){
                        if(rows[0].ref_id){
                            await ProcessoCadastro.mudaStatusProcesso(rows[0].id,'Inativo')
                            await ProcessoCadastro.mudaStatusProcesso(rows[0].ref_id,'Ativo')
                            resolve();
                        } else{
                            reject('Processo nao possui id de referencia');
                        }
                    }else{
                        reject('Processo nao encontrado');
                    }
                }
            });
        });
    }

    static mudaStatusProcesso(id,status){
        const sql = 'UPDATE processo_cadastro SET status = "'+status+'" WHERE id = '+id
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

    static async cadastraProcesso(data){
        return new Promise(async function (resolve, reject) {
            try {
                // const passosValido = await ProcessoCadastro.validaPassos(passos);
                const passosValido = data.passos
                await ProcessoCadastro.deletaCamposProcesso(passosValido[0].processo_cadastro_id)
    
                const map = passosValido.map(async (passo) => {
                    let passoEdita = {id: passo.id}

                    if(passo.dica && passo.dica != ''){
                        passoEdita.dica = passo.dica;
                    }
    
                    if(passo.estimativa && passo.estimativa != ''){
                        passoEdita.estimativa = passo.estimativa;
                    }

                    if(passo.subprocesso_cadastro_id && passo.subprocesso_cadastro_id != '' && passo.subprocesso_cadastro_id != 0){
                        passoEdita.subprocesso_cadastro_id = passo.subprocesso_cadastro_id
                        passoEdita.nome = passo.nome
                    }

                    if(passo.bloqueante){
                        passoEdita.bloqueante = 1
                    } else{
                        passoEdita.bloqueante = null
                    }

                    if(Object.keys(passoEdita).length > 1){
                        await ProcessoCadastro.editaProcessoPassoCadastro(passoEdita)
                    }

                    if(passo.decisao == 'nao'){
                        const map2 = passo.campos.map( async (campo,index) => {
                             var resultCampo = await ProcessoCadastro.insertProcessoCampoCadastro({
                                nome : campo.nome,
                                tipo : campo.tipo,
                                status : campo.status,
                                obrigatoriedade: campo.obrigatoriedade ? 1 : 0,
                                processo_passo_cadastro_id: campo.processo_passo_cadastro_id,
                                processo_cadastro_id : campo.processo_cadastro_id,
                                ordem : index
                            })
                            switch (campo.tipo) {
                                case 'Texto com máscara personalizada':
                                    await ProcessoCadastro.insertProcessoCampoMascara({
                                        processo_campo_cadastro_id : resultCampo.insertId,
                                        mascara_id : campo.processo_campo_mascara.mascara_id,
                                        processo_cadastro_id : campo.processo_cadastro_id
                                    })
                                    break;
    
                                case 'Seleção':
                                    const mapOpcoes = campo.processo_campo_opcao_select.map(async (opcao) => {
                                        await ProcessoCadastro.insertProcessoCampoOpcaoSelect({
                                            label: opcao.label,
                                            value: opcao.value,
                                            processo_campo_cadastro_id: resultCampo.insertId,
                                            processo_cadastro_id : campo.processo_cadastro_id
                                        })
                                    })
    
                                    await Promise.all(mapOpcoes)
                                    break;
    
                                case 'Multi-Seleção':
                                    const mapOpcoesMulti = campo.processo_campo_opcao_select.map(async (opcao) => {
                                        await ProcessoCadastro.insertProcessoCampoOpcaoSelect({
                                            label: opcao.label,
                                            value: opcao.value,
                                            processo_campo_cadastro_id: resultCampo.insertId,
                                            processo_cadastro_id : campo.processo_cadastro_id
                                        })
                                    })
    
                                    await Promise.all(mapOpcoesMulti)
                                    break;
    
                                default:
                                    break;
                            }
                            campo.idBanco = resultCampo.insertId
                            return campo
                        })
    
                        await Promise.all(map2)
                    }
                })
    
                await Promise.all(map)
    
                await ProcessoCadastro.cadastraProcessoCampoCopia(passosValido)
                await ProcessoCadastro.cadastraProcessoCampoArquivo(passosValido)
                await ProcessoCadastro.deletaFluxoAnterior(passosValido[0].processo_cadastro_id)
                await ProcessoCadastro.cadastraFluxoProcesso(passosValido)
                await ProcessoCadastro.cadastraTituloProcesso(passosValido)
                await ProcessoCadastro.update({id: data.processo_anterior, status: 'Inativo'})
                await ProcessoCadastro.update({id: data.processo_atual, status: 'Ativo'})
                resolve()
                
            } catch (error) {
                reject(error)
            }
        })
    }

    static validaPassos(passos){
        return new Promise(async function (resolve, reject) {
            try {
                const result = []
                const map = passos.map(async (p) => {
                    if(p.decisao === "sim"){
                        if(p.processo_fluxo_cadastro.length <= 0){
                          p = await processoPassoCadastro.getPassoUnitario(p.id)
                        }
                    } else{
                        if(p.campos.length <= 0){
                            p = await processoPassoCadastro.getPassoUnitario(p.id)
                        }
                    }
                    
                    result.push(p)
                })

                await Promise.all(map)
                resolve(result)
            } catch (error) {
                reject(error)
            }
        })
    }

    static cadastraTituloProcesso(passos){

        return new Promise(async function (resolve, reject) {
            try {
                const titulo = await ProcessoCadastro.getTituloProcesso(passos[0].processo_cadastro_id)
    
                const map = titulo.map(async (t) => {
                    const processo_campo_cadastro_id = await ProcessoCadastro.achaIdBancoCampo(passos, t.processo_campo_cadastro_id)
                    if(processo_campo_cadastro_id){
                        t.processo_campo_cadastro_id = processo_campo_cadastro_id
                        await ProcessoCadastro.editaTituloProcesso(t)
                    }
                })
    
                await Promise.all(map)
                resolve(true)
                
            } catch (error) {
                reject(error)
            }
        })
        
    }

    static editaTituloProcesso(data){
        const sql = sqlUtils.generate_update_query(data, "processo_titulo");
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

    static getTituloProcesso(processo_id){
        const sql = "SELECT * FROM processo_titulo where processo_cadastro_id ="+processo_id;
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

    static editaProcessoPassoCadastro(passo){
        const sql = sqlUtils.generate_update_query(passo, "processo_passo_cadastro");
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

    static cadastraProcessoCampoArquivo(passos){
        return new Promise(async function (resolve, reject) {

            try {
                const map = passos.map( async (passo) => {
                    if(passo.decisao == 'nao'){
                        const map2 = passo.campos.map( async (campo,index) => {
                             if(campo.tipo == 'Arquivo'){
                                 await ProcessoCadastro.insertProcessoCampoArquivo({
                                     processo_id : campo.processo_cadastro_id,
                                     processo_campo_cadastro_id : campo.idBanco,
                                     projeto_cadastro_id: (!campo.processo_campo_arquivo.projeto_cadastro_id || campo.processo_campo_arquivo.projeto_cadastro_id == -1 || campo.processo_campo_arquivo.projeto_cadastro_id == 'null') ? 0 : campo.processo_campo_arquivo.projeto_cadastro_id,
                                     projeto_pasta_id: (!campo.processo_campo_arquivo.projeto_pasta_id || campo.processo_campo_arquivo.projeto_pasta_id == -1 || campo.processo_campo_arquivo.projeto_pasta_id == 'null') ? 0 : campo.processo_campo_arquivo.projeto_pasta_id,
                                     selecao_filha : (!campo.processo_campo_arquivo.selecao_filha || campo.processo_campo_arquivo.selecao_filha == -1 || campo.processo_campo_arquivo.selecao_filha == 'null') ? 0 : 1,
                                     cadastro_nova_pasta_campo_id: (!campo.processo_campo_arquivo.cadastro_nova_pasta_campo_id || campo.processo_campo_arquivo.cadastro_nova_pasta_campo_id == -1 || campo.processo_campo_arquivo.cadastro_nova_pasta_campo_id == 'null') ? 0 : await ProcessoCadastro.achaIdBancoCampo(passos,campo.processo_campo_arquivo.cadastro_nova_pasta_campo_id),
                                     converte_imagem: (!campo.processo_campo_arquivo.converte_imagem || campo.processo_campo_arquivo.converte_imagem == -1 || campo.processo_campo_arquivo.converte_imagem == 'null') ? 0 : 1,
                                     categoria_id: (!campo.processo_campo_arquivo.categoria_id || campo.processo_campo_arquivo.categoria_id == -1 || campo.processo_campo_arquivo.categoria_id == 'null') ? 0 : campo.processo_campo_arquivo.categoria_id,
                                     selecao_arquivo_ged: (!campo.processo_campo_arquivo.selecao_arquivo_ged || campo.processo_campo_arquivo.selecao_arquivo_ged == -1 || campo.processo_campo_arquivo.selecao_arquivo_ged == 'null') ? 0 : 1,
                                 })
                             }
                         })
         
                         await Promise.all(map2)
                    }
                })
    
                await Promise.all(map)
                resolve()
                
            } catch (error) {
                reject(error)
            }
        })
    }

    static cadastraProcessoCampoCopia(passos){
        return new Promise(async function (resolve, reject) {
            try {
                const map = passos.map( async (passo) => {
                    if(passo.decisao == 'nao'){
                        const map2 = passo.campos.map( async (campo,index) => {
                             if(campo.tipo == 'Campo Cópia'){
                                const processo_campo_copia_id = await ProcessoCadastro.achaIdBancoCampo(passos,campo.processo_campo_copia.processo_campo_copia_id)
                                if(processo_campo_copia_id){
                                    await ProcessoCadastro.insertProcessoCampoCopia({
                                        processo_campo_cadastro_id : campo.idBanco,
                                        processo_cadastro_id : campo.processo_cadastro_id,
                                        processo_campo_copia_id: processo_campo_copia_id,
                                        editavel: campo.processo_campo_copia.editavel
                                    })
                                }
                             }
                         })
         
                         await Promise.all(map2)
                    }
                })
    
                await Promise.all(map)
                resolve()
            } catch (error) {
                reject(error)
            }
        })
    }

    static deletaFluxoAnterior(processo_cadastro_id){
        const sql = 'delete from processo_fluxo_cadastro where condicao = "sim" and id > 0 and processo_cadastro_id = '+processo_cadastro_id
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

    static cadastraFluxoProcesso(passos){
        return new Promise(async function (resolve, reject) {

            try {
                const map = passos.map(async (passo) => {
                    if(passo.decisao == 'sim'){
                        const map2 = passo.processo_fluxo_cadastro.map( async (fluxo) => {
                            const map3 = fluxo.condicoes.map(async (condicao) => {
                                if(condicao){
                                    delete condicao.id
                                    const processo_campo_cadastro_id =  await ProcessoCadastro.achaIdBancoCampo(passos,condicao.processo_campo_cadastro_id)
                                    if(processo_campo_cadastro_id){
                                        condicao.processo_campo_cadastro_id = processo_campo_cadastro_id
                                        await ProcessoCadastro.insertProcessoFluxoCadastro(condicao)
                                    }
                                }
                            })
    
                            await Promise.all(map3)
                        })
    
                        await Promise.all(map2)
                    }
                })
    
                await Promise.all(map)
                resolve()
                
            } catch (error) {
                reject(error)
            }
        })
    }

    static verificaFluxoExistente(data){

        try {
            let sql = "select * from processo_fluxo_cadastro where id > 0 "
    
            Object.keys(data).map((key) => {
                sql = sql + " and "+key+" = "+con.escape(data[key])
            })
            
            return new Promise(function (resolve, reject) {
                // Do async job
                con.query(sql, function (err, rows, fields) {
                    if (err) {
                        reject(err);
                    } else {
                        // resolve(rows, fields);
                        if(rows.length > 0){
                            resolve(false)
                        } else{
                            resolve(true)
                        }
                    }
                });
    
            });
            
        } catch (error) {
            resolve(true)
        }

    }

    static insertProcessoFluxoCadastro(fluxo){

        return new Promise(function (resolve, reject) {
            try {
                const sql = sqlUtils.generate_insert_query(fluxo, "processo_fluxo_cadastro");
                con.query(sql, function (err, rows) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            } catch (error) {
                reject(error)
            }
            
        });
    }

    static updateProcessoFluxoCadastro(fluxo){
        const sql = sqlUtils.generate_update_query(fluxo, "processo_fluxo_cadastro");
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

    static achaIdBancoCampo(passos,campoId){
        return new Promise(function (resolve, reject) {
            try {
                let retorno = undefined
                passos.map((passo) => {
                    if(passo.decisao == 'nao'){
                        passo.campos.map((campo) => {
                            if(campo.id == campoId){
                                retorno = campo.idBanco
                            }
                        })
                    }
                })
                resolve(retorno)
            } catch (error) {
                reject(error)
            }
        })
    }

    static insertProcessoCampoCadastro(campo){
        const sql = sqlUtils.generate_insert_query(campo, "processo_campo_cadastro");
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

    static insertProcessoCampoMascara(campoMascara){
        const sql = sqlUtils.generate_insert_query(campoMascara, "processo_campo_mascara");
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

    static insertProcessoCampoOpcaoSelect(opcao){
        const sql = sqlUtils.generate_insert_query(opcao, "processo_campo_opcao_select");
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

    static insertProcessoCampoArquivo(campoArquivo){
        const sql = sqlUtils.generate_insert_query(campoArquivo, "processo_campo_arquivo");
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

    static insertProcessoCampoCopia(campoCopia){
        const sql = sqlUtils.generate_insert_query(campoCopia, "processo_campo_copia");
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

    static deletaCamposProcesso(processoCadastroId){

        return new Promise(async function (resolve, reject) {
            await ProcessoCadastro.deleteProcessoCampoMascara(processoCadastroId)
            await ProcessoCadastro.deleteProcessoCampoArquivo(processoCadastroId)
            await ProcessoCadastro.deleteProcessoOpcaoSelect(processoCadastroId)
            // await ProcessoCadastro.deleteProcessoFluxoCadastro(processoCadastroId)
            await ProcessoCadastro.deleteProcessoCampoCadastro(processoCadastroId)

            resolve()
        });
    }

    static deleteProcessoCampoMascara(processoCadastroId){
        const sql = 'delete from processo_campo_mascara where id > 0 and processo_cadastro_id = '+processoCadastroId
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

    static deleteProcessoCampoArquivo(processoCadastroId){
        const sql = 'delete from processo_campo_arquivo where id > 0 and processo_id ='+processoCadastroId
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

    static deleteProcessoOpcaoSelect(processoCadastroId){
        const sql = 'delete from processo_campo_opcao_select where id > 0 and processo_cadastro_id = '+processoCadastroId
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

    static deleteProcessoFluxoCadastro(processoCadastroId){
        const sql = 'delete from processo_fluxo_cadastro where id > 0 and condicao = "sim" and processo_cadastro_id = '+processoCadastroId
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

    static deleteProcessoCampoCadastro(processoCadastroId){
        const sql = 'delete from processo_campo_cadastro where id > 0 and processo_cadastro_id = '+processoCadastroId
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
        const sql = sqlUtils.generate_insert_query(data, "processo_cadastro");
        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    ProcessoCadastro.salvaDiagramaProcesso(rows.insertId,data.xml)
                    resolve(rows, fields);
                }
            });

        });
    }

    static salvaDiagramaProcesso(processo_id,xml){
        return new Promise(function (resolve, reject) {
            var caminho = "processos/diagrama_"+processo_id+".xml"
            GoogleCloudStorage.upload(xml,caminho).then(()=>{
                resolve('Upload feito com sucesso.')
            }).catch((err) => {
                reject(err);
            })

        });
    }

    static getProcesso(processo_id){
        const sql = 'select * from processo_cadastro where id = '+processo_id
        return new Promise(function (resolve, reject) {
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if(rows[0]){
                        var caminho_padrao = await ProcessoCadastro.getPassosCaminhoPadrao(processo_id)
                        rows[0].caminho_padrao = []
                        caminho_padrao.map((c) => {
                            rows[0].caminho_padrao.push(c.id_diagrama)
                        })

                        resolve(rows[0]);
                        // ProcessoCadastro.getDiagramaProcessoArquivo(processo_id).then((xmlArquivo) => {
                        //     rows[0].xml = xmlArquivo
                        // }).catch((err) => { // erro ao consultar arquivo, usa o xml que está no banco
                        //     console.log('Erro ao consultar arquivo XML, processo '+processo_id)
                        //     resolve(rows[0]);
                        // })
                    } else{
                        reject('Processo Não encontrado')
                    }
                }
            });

        });
    }

    static getPassosCaminhoPadrao(processo_id){
        const sql = "select id_diagrama from processo_passo_cadastro where processo_cadastro_id = "+processo_id+" and caminho_padrao != 0 order by caminho_padrao"

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

    static getDiagramaProcessoArquivo(processo_id){
        return new Promise(async function (resolve, reject) {
            var caminho = 'processos/diagrama_'+processo_id+'.xml'
            if(await GoogleCloudStorage.verificaArquivo(caminho)){
                GoogleCloudStorage.getArquivo(caminho).then((data) => {
                    resolve(data)
                }).catch((err) => {
                    reject(err);
                })
            } else{
                reject('Arquivo não existe no GCS')
            }
        });
    }

    /**
     * 
     * @param {object} data contem os pares de campo e valor 
     * @returns {Promise}  que vai resolver em rows e fields
     */
    static update(data) {        
        const sql = sqlUtils.generate_update_query(data, "processo_cadastro");
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
        const sql = "delete from processo_cadastro where id = "+id;
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
module.exports = ProcessoCadastro;