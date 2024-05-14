const con = require('../../../data_base');
const sqlUtils = require("../../utils/sqlUtils.js");

class processoCampos {

    /**
     * @param {string[]} fields[] campos a serem consultados
     * @param {object[]} target[] array de obejetos que conte nome do campo (name) e valor a ser consultado(value)
     * @returns {Promise}  que vai resolver em rows e fields   
     **/
    static select(fields = null, targets = null) {
        const sql = sqlUtils.generate_select_query(targets, fields, "processo_campos");
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

    static ultimoPassoIdProcesso(processo_campo_cadastro_id){
        const sql = 'select processo_passo_id from processo_campos where processo_campo_cadastro_id = '+processo_campo_cadastro_id+' order by id desc limit 1'
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
     * 
     * @param {object} data contem os pares de campo e valor 
     * @returns {Promise}  que vai resolver em rows e fields
     */
    static insert(data) {
        const sql = sqlUtils.generate_insert_query(data, "processo_campos");
        
        return new Promise(function (resolve, reject) {
            try {
                con.query(sql, function (err, rows, fields) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows, fields);
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
    static update(data) {
        
        const sql = sqlUtils.generate_update_query(data, "processo_campos");
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

    static getValoresCampos(processo_id, campo_id, valor) {
        const sql = `SELECT * FROM processo_campos 
        WHERE PROCESSO_PASSO_ID IN (SELECT ID FROM processo_passo WHERE PROCESSO_ID = `+processo_id+`) 
        AND processo_campo_cadastro_id = `+campo_id+` and valor = '`+valor+`'`

        return new Promise(function (resolve, reject) {
            
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if(rows.length > 0){
                        resolve(rows, fields);
                    } else{
                        resolve(false)
                    }
                }
            });
        });
    }

    static getValorCampo(campo_id, processo_id) {
        const sql = 'SELECT valor FROM processo_campos WHERE PROCESSO_PASSO_ID IN (SELECT ID FROM processo_passo WHERE processo_ID = '+processo_id+') AND processo_campo_cadastro_id = ' +campo_id+' order by id desc';

        return new Promise(function (resolve, reject) {
            
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if(rows.length > 0){
                        resolve(rows, fields);
                    } else{
                        resolve(false)
                    }
                }
            });
        });
    }

    static delete(id) {
        const sql = "delete from processo_campos where valor != 'Arquivo' and processo_passo_id = "+id+" and id > 0"; 

        return new Promise(function (resolve, reject) {
            try {
                con.query(sql, function (err, rows, fields) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows, fields);
                    }
                });
            } catch (error) {
                reject(error)
            }
        });
    }

    static deleteArquive(processo_campo_cadastro_id){
        const sql = "select * from processo_campos where processo_campo_cadastro_id = "+processo_campo_cadastro_id

        return new Promise(function (resolve, reject) {
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if(rows.length > 0){
                        await processoCampos.deleteProcessoArquivo(rows[0].id)
                        await processoCampos.simpleDelete(rows[0].id)
                        resolve(true)
                    }
                }
            });
        });
    }

    static simpleDelete(id){
        const sql = "delete from processo_campos where id = "+id

        return new Promise(function (resolve, reject) {
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows, fields);
                }
            });
        });
    }

    static deleteProcessoArquivo(campo_id){
        const sql = "delete from processo_arquivo where id > 0 and campo_id = "+campo_id

        return new Promise(function (resolve, reject) {
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows, fields);
                }
            });
        });
    }
    
}
module.exports = processoCampos;