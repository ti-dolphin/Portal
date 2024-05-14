const con = require('../../../data_base');
const sqlUtils = require("../../utils/sqlUtils.js");

class processoTitulo {

    /**
     * @param {string[]} fields[] campos a serem consultados
     * @param {object[]} target[] array de obejetos que conte nome do campo (name) e valor a ser consultado(value)
     * @returns {Promise}  que vai resolver em rows e fields   
     **/
    static select(fields = null, targets = null) {
        var sql = sqlUtils.generate_select_query(targets, fields, "processo_titulo");
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

    static getTituloProcesso(processo_id){
        return new Promise(async function (resolve, reject) {
            const titulo = await processoTitulo.selectTituloProcesso(processo_id)

            let retorno = []

            for (let index = 0; index < titulo.length; index++) {
                const t = titulo[index];  
                const passoSelecionado = t.processo_passo_cadastro_id
                const campoSelecionado = t.processo_campo_cadastro_id

                retorno.push({
                    index: index,
                    campoSelecionado: campoSelecionado,
                    passoSelecionado: passoSelecionado
                })
                
            }

            resolve(retorno)
        })
    }

    static selectTituloProcesso(processo_id){
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

    static insertTituloProcesso({processo_id, campos}){        
        return new Promise(async function (resolve, reject) {
            await processoTitulo.deleteTituloProcesso(processo_id)

            const map = campos.map(async (campo) => {
                await processoTitulo.insert({
                    processo_cadastro_id: parseInt(processo_id),
                    processo_passo_cadastro_id: parseInt(campo.passoSelecionado),
                    processo_campo_cadastro_id: parseInt(campo.campoSelecionado)
                })
            })

            await Promise.all(map)
            resolve(true)
        });
    }

    static deleteTituloProcesso(processo_id){
        const sql = "delete from processo_titulo where id > 0 and processo_cadastro_id = "+processo_id;
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

    static moveTitulo(processo_anterior, processo_novo){
        return new Promise(async function (resolve, reject) {
            try {
                const tituloAnterior = await processoTitulo.selectTituloProcesso(processo_anterior)
                const map = tituloAnterior.map(async (t) => {
                    const passoNovo = await processoTitulo.achaPassoNovo(t.processo_passo_cadastro_id, processo_novo)
                    const campoNovo = await processoTitulo.consultaCampoNovo(t.processo_campo_cadastro_id, processo_novo)
    
                    if(passoNovo && campoNovo){
                        await processoTitulo.insert({
                            processo_cadastro_id: processo_novo,
                            processo_passo_cadastro_id: passoNovo.id,
                            processo_campo_cadastro_id: campoNovo.id
                        })
                    }
                })
    
                await Promise.all(map)
                resolve(true)
                
            } catch (error) {
                reject(error)
            }

        })
    }

    static achaPassoNovo(passo_antigo_id,processo_novo){
        const sql = `select id from processo_passo_cadastro 
        where id_diagrama = (select id_diagrama from processo_passo_cadastro where id = `+passo_antigo_id+` LIMIT 1)
        and processo_cadastro_id = `+processo_novo
        //console.log("sql gerado:", sql)
        
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

    static consultaCampoNovo(campo_id,processo_novo){
        const sql = `select id from processo_campo_cadastro where processo_passo_cadastro_id = 
        (select id from processo_passo_cadastro where id_diagrama = (select id_diagrama from processo_passo_cadastro 
        where id = (select processo_passo_cadastro_id from processo_campo_cadastro where id = `+campo_id+` LIMIT 1) LIMIT 1) 
        and processo_cadastro_id = `+processo_novo+` LIMIT 1) and ordem = (select ordem from processo_campo_cadastro where id = `+campo_id+` LIMIT 1)`
        //console.log("sql gerado:", sql)
        
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

    /**
     * 
     * @param {object} data contem os pares de campo e valor 
     * @returns {Promise}  que vai resolver em rows e fields
     */
    static insert(data) {
        const sql = sqlUtils.generate_insert_query(data, "processo_titulo");
        
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

    static delete(id) {
        const sql = "delete from processo_titulo where id = "+id;
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
module.exports = processoTitulo;