const con = require('../../../data_base');
const sqlUtils = require("../../utils/sqlUtils.js");

class processoObservadores {

    /**
     * @param {string[]} fields[] campos a serem consultados
     * @param {object[]} target[] array de obejetos que conte nome do campo (name) e valor a ser consultado(value)
     * @returns {Promise}  que vai resolver em rows e fields   
     **/
    static select(fields = null, targets = null) {
        const sql = sqlUtils.generate_select_query(targets, fields, "processo_observadores");
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
 * Consulta observadores associados a um processo com a condição de que o usuario_id na tabela processo_observadores seja igual ao id na tabela usuarios.
 * 
 * @param {*} body 
 * @returns {Promise} - Uma promessa que, quando resolvida, fornece os resultados da consulta, incluindo os campos 'id' e 'nome' da tabela 'usuario'.
 *              
 */
static consultaObservadores(body) {
    const sql = `SELECT u.id, u.nome FROM processo_observadores p JOIN usuario u ON p.usuario_id = u.id WHERE p.area = '${body.area}' AND p.processo_id = ${body.id}`;

    return new Promise(function (resolve, reject) {
        // Executa a consulta assíncrona
        con.query(sql, function (err, rows, fields) {
            if (err) {
                reject(err);
            } else {
                resolve(rows, fields); 
            }
        });
    });
}


    static moveObservadores(id_anterior, id_novo){
        return new Promise(async function (resolve, reject) {
            try {
                var observadores_anterior = await processoObservadores.consultaObservadores({id: id_anterior, area: 'Cadastro'})
                
                const map = observadores_anterior.map(async (observador) => {
                    var processoObservador = {
                        processo_id: id_novo,
                        area: 'Cadastro',
                        usuario_id: observador.id,
                    };
                    await processoObservadores.simpleInsert(processoObservador)
                })
    
                await Promise.all(map);
                resolve(true)
                
            } catch (error) {
                reject(error)
            }
        });
    }

    static simpleInsert(data){
        return new Promise( async function (resolve, reject) {
            const sql = sqlUtils.generate_insert_query(data, "processo_observadores");
            // Do async job
            con.query(sql, async function (err, rows, fields) {
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

        //console.log("sql gerado:", sql)
        
        return new Promise( async function (resolve, reject) {
            const sql = sqlUtils.generate_insert_query(data, "processo_observadores");
            // Do async job
            con.query(sql, async function (err, rows, fields) {
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
        
        const sql = sqlUtils.generate_update_query(data, "processo_observadores");
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

    static delete(data) {
        const sql = `delete from processo_observadores where id>0 and area = '`+data.area+`' and processo_id = `+data.processo_id;
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

    static deleteUser(data) {
        const sql = `delete from processo_observadores where area = '`+data.area+`' and processo_id = `+data.processo_id+` 
        and usuario_id = `+data.usuario_id

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
module.exports = processoObservadores;