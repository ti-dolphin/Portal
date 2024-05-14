const con = require('../../../data_base');
const sqlUtils = require("../../utils/sqlUtils.js");
const processoPassoCadastro = require('../processo_passo_cadastro/processo_passo_cadastro')
const GoogleCloudStorage = require('../../../google-cloud-storage')
const MomentFunctions = require('../../../momentFunctions')

class processoPasso {

    /**
     * @param {string[]} fields[] campos a serem consultados
     * @param {object[]} target[] array de obejetos que conte nome do campo (name) e valor a ser consultado(value)
     * @returns {Promise}  que vai resolver em rows e fields   
     **/
    static select(fields = null, targets = null) {
        var sql = sqlUtils.generate_select_query(targets, fields, "processo_passo");
        sql += ' order by data_modificacao'
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

    static getResponsaveisTarefasProcessoExecucao(processo_id){

        const sql = `select u.id, u.nome, u.url_avatar from processo_passo pp 
        join usuario u on pp.responsavel_id = u.id where processo_id = `+processo_id+` group by u.id, u.nome`
        
        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    const map = rows.map(async (r) => {
                        if(r.url_avatar && r.url_avatar !== ''){
                            if(await GoogleCloudStorage.verificaArquivo(r.url_avatar)){
                                r.avatar = await GoogleCloudStorage.getURLArquivo(r.url_avatar)
                            }
                        } 
                    })

                    await Promise.all(map)

                    var responsavel_processo = await processoPasso.getResponsavelProcessoExecucao(processo_id)

                    if(responsavel_processo){
                        var novo_array = rows.filter((row) => row.id !== responsavel_processo.id)
                        novo_array.unshift(responsavel_processo)
                    }
                    resolve(novo_array, fields);
                }
            });

        });
    }

    static getResponsavelProcessoExecucao(processo_id){
        const sql = `select u.id, u.nome, u.url_avatar from processo p 
        join usuario u on p.usuario_id = u.id where p.id = `+processo_id
        
        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if(rows.length > 0){
                        if(rows[0].url_avatar && rows[0].url_avatar !== ''){
                            if(await GoogleCloudStorage.verificaArquivo(rows[0].url_avatar)){
                                rows[0].avatar = await GoogleCloudStorage.getURLArquivo(rows[0].url_avatar)
                            }
                        } 
                        resolve(rows[0]);
                    } else{
                        resolve(false)
                    }
                }
            });

        });
    }

    static getListaPassos = (processo_id, flagPassosAntigos) => {

        return new Promise(async function (resolve, reject) {

            try {
                var processo = await processoPasso.getProcesso(processo_id)
                var passos_anteriores = await processoPasso.getPassosAnteriores(processo_id, flagPassosAntigos)
                var passo_atual
                passos_anteriores.map((passo, index) => {
    
                    if(passo.processo_passo_cadastro_id === processo.processo_passo_cadastro_id && !passo.data_conclusao){
                        passo_atual = passos_anteriores.splice(index, 1)
                    }
                })
    
                if(passo_atual && passo_atual.length > 0){
                    passos_anteriores.push(passo_atual[0])
                    if(passo_atual[0].caminho_padrao && passo_atual[0].caminho_padrao !== 0){
                        var passos_caminho_padrao = await processoPasso.getPassosCaminhoPadrao(processo.processo_cadastro_id, passo_atual[0].caminho_padrao, processo.usuario_id)
                        passos_anteriores = passos_anteriores.concat(passos_caminho_padrao)
                    }
                }
    
                resolve(passos_anteriores)
                
            } catch (error) {
                reject(error)
            }
        })
    }

    static getPassosAnteriores = (processo_id, flagPassosAntigos) => {
        var sql = `SELECT pp.id, pp.data_inicio, pp.data_conclusao, pp.data_modificacao, pp.processo_id, pp.usuario_id, pp.processo_passo_cadastro_id, pp.responsavel_id, 
        pp.estimativa as prazo, pp.papel_id, pp.status_id, pp.subprocesso_id, pc.nome,
        (select status from processo_passo_status where id = pp.status_id) as status,
        (select nome from papel where id = pp.papel_id) as papel_nome,
        (select nome from usuario where id = pp.responsavel_id) as responsavel_nome,
        (select url_avatar from usuario where id = pp.responsavel_id) as url_avatar,
        pc.estimativa, pc.caminho_padrao
        FROM processo_passo pp 
        join processo_passo_cadastro pc on pp.processo_passo_cadastro_id = pc.id
        where pp.processo_id = `+processo_id+` and pc.decisao = 'nao' `

        let concat = ""
        if(flagPassosAntigos && flagPassosAntigos == 'true'){
            concat = " order by id "
        } else{
            concat =  " and pp.id IN (SELECT max(id) as id FROM processo_passo where processo_id = "+processo_id+" group by processo_passo_cadastro_id) order by id "
        }

        sql = sql + concat;

        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    const map = rows.map(async (r) => {
                        if(r.url_avatar && r.url_avatar !== ''){
                            if(await GoogleCloudStorage.verificaArquivo(r.url_avatar)){
                                r.avatar = await GoogleCloudStorage.getURLArquivo(r.url_avatar)
                            }
                        } 
                    })
                    await Promise.all(map)
                    resolve(rows, fields);
                }
            });
        });
    }

    static getProcesso = (processo_id) => {
        var sql = 'select * from processo where id = '+processo_id

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

    static getPassosCaminhoPadrao = (processo_cadastro_id, caminho_padrao, responsavel_processo_id) => {
        var sql = `select id, nome, papel_id, estimativa, caminho_padrao,
        CASE WHEN papel_id = 0 THEN 
		(select nome from usuario where id = `+responsavel_processo_id+`) 
			ELSE 
		(select nome from papel where id = papel_id) END as papel_nome, 
        CASE WHEN papel_id = 0 THEN
        (select url_avatar from usuario where id = `+responsavel_processo_id+`) END as url_avatar,
        true as inativa
        from processo_passo_cadastro 
        where caminho_padrao is not null and caminho_padrao != 0 and 
        processo_cadastro_id = `+processo_cadastro_id+` and caminho_padrao > `+caminho_padrao+` order by caminho_padrao`

        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    const map = rows.map(async (r) => {
                        if(r.url_avatar && r.url_avatar !== ''){
                            if(await GoogleCloudStorage.verificaArquivo(r.url_avatar)){
                                r.avatar = await GoogleCloudStorage.getURLArquivo(r.url_avatar)
                            }
                        } 
                    })
                    await Promise.all(map)
                    resolve(rows);
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

    /**
     * 
     * @param {object} data contem os pares de campo e valor 
     * @returns {Promise}  que vai resolver em rows e fields
     */
    static update(data) {
        data.data_modificacao = MomentFunctions.dateTimeAtual();
        if(data.data_conclusao){
            data.data_conclusao = MomentFunctions.dateTimeAtual();
        }
        const sql = sqlUtils.generate_update_query(data, "processo_passo");
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
        const sql = "delete from processo_passo where id = "+id;
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

    static getPasso(id){
        
        var sql = `select *,
        (select nome from processo_passo_cadastro where id = processo_passo_cadastro_id) as nome,
        (select dica from processo_passo_cadastro where id = processo_passo_cadastro_id) as dica,
        (select nome from usuario where id = usuario_id) as preenchido_nome,
        (select url_avatar from usuario where id = usuario_id) as url_avatar_preenchido,
        (select nome from usuario where id = responsavel_id) as responsavel_nome,
        (select url_avatar from usuario where id = responsavel_id) as url_avatar_responsavel,
        (select nome from papel where id = papel_id) as papel_nome,
        (select status from processo_passo_status where id = status_id) as status
        from processo_passo where id = `+id

        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if(rows.length > 0){
                        if(rows[0].url_avatar_preenchido){
                            if(await GoogleCloudStorage.verificaArquivo(rows[0].url_avatar_preenchido)){
                                rows[0].avatar_preenchido = await GoogleCloudStorage.getURLArquivo(rows[0].url_avatar_preenchido)
                            }
                        }

                        if(rows[0].url_avatar_responsavel){
                            if(await GoogleCloudStorage.verificaArquivo(rows[0].url_avatar_responsavel)){
                                rows[0].avatar = await GoogleCloudStorage.getURLArquivo(rows[0].url_avatar_responsavel)
                            }
                        }

                        resolve(rows[0]);
                    } else{
                        resolve(false)
                    }
                }
            });
        });
    }

    static getPassoProcessoExecucao(passo_id, processoId){
        return new Promise(async function (resolve, reject) {
            try {
                var passo = await processoPasso.getPasso(passo_id)
                if(passo){
                    passo.campos = await processoPassoCadastro.getCamposPassoComValor(passo.processo_passo_cadastro_id,passo.id, processoId)
                }
                resolve(passo)
            } catch (error) {
                reject(error)
            }
        })
    }

    static getPassoAtualProcesso(processo_id){
        return new Promise(async function (resolve, reject) {
            try {
                const processo = await processoPasso.getProcesso(processo_id)
                const passo = await processoPasso.simpleGet(processo.processo_passo_id)
    
                if(passo){
                    const passo_cadastro = await processoPasso.simpleGetProcessoPasssoCadastro(passo.processo_passo_cadastro_id)
                    if(processo.condition_error !== '1'){
                        if(passo_cadastro){
                            if(passo_cadastro.decisao === 'nao'){
                                resolve({passo, passo_cadastro})
                            } else{
                                resolve(await processoPasso.getPassoAtualProcesso(processo_id))
                            }
                        } else{
                            resolve(false)
                        }
                    } else{
                        resolve('condition_error')
                    }
                } else{
                    resolve(false)
                }
                
            } catch (error) {
                reject(error)
            }
        });
    }

    static getPassoExternoProcesso(processo_id){
        return new Promise(async function (resolve, reject) {
            try {
                const sql = "select * from processo_passo where processo_id = "+processo_id+" and papel_id = 6 and status_id = 5 limit 1"
                con.query(sql, function (err, rows, fields) {
                    if (err) {
                        reject(err);
                    } else {
                        if(rows.length > 0){
                            resolve(rows[0])
                        } else{
                            resolve(false)
                        }
                    }
                });
            } catch (error) {
                reject(error)
            }
        })
    }

    static getPassoExterno(processo_id){
        return new Promise(async function (resolve, reject) {
            try {
                const processo = await processoPasso.getProcesso(processo_id)
                const passo = await processoPasso.getPasso(processo.processo_passo_id)
    
                if(passo){
                    const passo_cadastro = await processoPasso.simpleGetProcessoPasssoCadastro(passo.processo_passo_cadastro_id)
                    if(passo_cadastro){
                        if(passo_cadastro.decisao === 'nao' && passo_cadastro.papel_id === 6){
                            passo.campos = await processoPassoCadastro.getCamposPassoComValor(passo.processo_passo_cadastro_id,passo.id, processo_id)
                            resolve(passo)
                        } else{
                            const passoExternoProcesso = await processoPasso.getPassoExternoProcesso(processo_id)
                            if(passoExternoProcesso){
                                const passoExt = await processoPasso.getPasso(passoExternoProcesso.id)
                                if(passoExt){
                                    const passoExtCadastro = await processoPasso.simpleGetProcessoPasssoCadastro(passoExt.processo_passo_cadastro_id)
                                    if(passoExtCadastro){
                                        passoExt.campos = await processoPassoCadastro.getCamposPassoComValor(passoExt.processo_passo_cadastro_id,passoExt.id, processo_id)
                                        resolve(passoExt)
                                    } else{
                                        resolve(false)
                                    }
                                } else{
                                    resolve(false)
                                }
                            } else{
                                resolve(false)
                            }
                        }
                    } else{
                        resolve(false)
                    }
                } else{
                    resolve(false)
                }
            } catch (error) {
                reject(error)
            }
        })
    }

    static simpleGet(id){
        const sql = "select * from processo_passo where id = "+id;
        return new Promise(function (resolve, reject) {
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if(rows.length > 0){
                        resolve(rows[0])
                    } else{
                        resolve(false)
                    }
                }
            });
        });
    }

    static simpleGetProcessoPasssoCadastro(id){
        const sql = "select * from processo_passo_cadastro where id = "+id;
        return new Promise(function (resolve, reject) {
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if(rows.length > 0){
                        resolve(rows[0])
                    } else{
                        resolve(false)
                    }
                }
            });
        });
    }

    static getErroCondicao(id){

        const sql = `SELECT pc.id, pc.nome, pc.papel_id,
        (SELECT subprocesso_id FROM processo_passo where processo_id = `+id+` order by id desc limit 1) as subprocesso_id
        FROM processo_fluxo_cadastro f 
        join processo_passo_cadastro pc on f.passo_seguinte = pc.id
        where passo_atual = (
            SELECT processo_passo_cadastro_id FROM processo_passo where processo_id = `+id+` order by id desc limit 1
        ) group by pc.id, pc.nome, pc.papel_id`

        return new Promise(function (resolve, reject) {
            con.query(sql, async function (err, rows) {
                if (err) {
                    reject(err);
                } else {
                    if(rows.length > 0){
                        resolve(rows)
                    } else{
                        const result = await processoPasso.getErroCondicaoPassoDecisao(id)
                        resolve(result)
                    }

                }
            });
        });
    }

    static getErroCondicaoPassoDecisao(id){
        const sql = `SELECT pc.id, pc.nome, pc.papel_id,
        (SELECT subprocesso_id FROM processo_passo where processo_id = `+id+` order by id desc limit 1) as subprocesso_id
        FROM processo_fluxo_cadastro f 
        join processo_passo_cadastro pc on f.passo_seguinte = pc.id
        where f.passo_decisao = (
            SELECT processo_passo_cadastro_id FROM processo_passo where processo_id = `+id+` order by id desc limit 1        
        ) group by id, nome, papel_id, subprocesso_id`

        return new Promise(function (resolve, reject) {
            con.query(sql, async function (err, rows) {
                if (err) {
                    reject(err);
                } else {
                    if(rows.length > 0){
                        resolve(rows)
                    } else{
                        const result = await processoPasso.getPassosProcesso(id)
                        resolve(result)
                    }
                }
            });
        });
    }

    static getPassosProcesso(id){
        const sql = `select id, nome, papel_id from processo_passo_cadastro 
        where processo_cadastro_id = (
            select processo_cadastro_id from processo where id = `+id+`
        ) and decisao = 'nao'`

        return new Promise(function (resolve, reject) {
            con.query(sql, function (err, rows) {
                if (err) {
                    reject(err);
                } else {
                    rows.push({
                        id: 0,
                        nome: "Finalizar processo",
                        papel_id: 0
                    })
                    resolve(rows)
                }
            });
        });
    }
    
}
module.exports = processoPasso;