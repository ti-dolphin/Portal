const con = require('../../data_base');
const sqlUtils = require("../utils/sqlUtils.js");
const Papel = require("../papel/papel/papel");

class DefinePrazoProcesso {

    /**
     * @param {string[]} fields[] campos a serem consultados
     * @param {object[]} target[] array de obejetos que conte nome do campo (name) e valor a ser consultado(value)
     * @returns {Promise}  que vai resolver em rows e fields   
     **/
    static select(fields = null, targets = null) {
        const sql = sqlUtils.generate_select_query(targets, fields, "define_prazo_processo");
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
        const sql = sqlUtils.generate_insert_query(data, "define_prazo_processo");
        
        return new Promise(function (resolve, reject) {
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

    static selectPorProcesso(processo_cadastro_id){
        const sql = "SELECT p.id, p.nome FROM define_prazo_processo d join papel p on d.papel_id = p.id where d.processo_cadastro_id = "+processo_cadastro_id
        
        return new Promise(function (resolve, reject) {
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
        
        const sql = sqlUtils.generate_update_query(data, "define_prazo_processo");
        // console.log(sql);
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

    static delete(id) {
        const sql = "delete from define_prazo_processo where id = "+id;
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

    static deletePorProcesso(processo_cadastro_id) {
        const sql = "delete from define_prazo_processo where id > 0 and processo_cadastro_id = "+processo_cadastro_id;
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

    static movePrazo(processo_anterior, processo_novo){
        return new Promise(async function (resolve, reject) {
            try {
                const prazoAnterior = await DefinePrazoProcesso.selectPorProcesso(processo_anterior);
                const papeisAtuais = await Papel.getPapeisProcesso(processo_novo)

                if(prazoAnterior.length > 0 && papeisAtuais.length > 0){
                    const papeisAtuaisArray = papeisAtuais.map(p => p.id)
    
                    const map = prazoAnterior.map(async (p) => {
                        if(papeisAtuaisArray.indexOf(p.id) !== -1){
                            await DefinePrazoProcesso.insert({
                                papel_id: p.id,
                                processo_cadastro_id: processo_novo
                            })
                        }
                    })
    
                    await Promise.all(map)
    
                    resolve(true)
                } else{
                    resolve(true)
                }
            } catch (error) {
                reject(error)
            }
        })
    }
    
}
module.exports = DefinePrazoProcesso;