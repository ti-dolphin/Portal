const con = require('../../../data_base');
const sqlUtils = require("../../utils/sqlUtils.js");

class ProjetoDocumentoAtributo {

    /**
     * @param {string[]} fields[] campos a serem consultados
     * @param {object[]} target[] array de obejetos que conte nome do campo (name) e valor a ser consultado(value)
     * @returns {Promise}  que vai resolver em rows e fields   
     **/
    static select(fields = null, targets = null) {
        const sql = sqlUtils.generate_select_query(targets, fields, "projeto_documento_atributo");
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
    static insert(data) {
        const sql = sqlUtils.generate_insert_query(data, "projeto_documento_atributo");
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
    static update(data) {
        const sql = sqlUtils.generate_update_query(data, "projeto_documento_atributo");
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
        const sql = "delete from projeto_documento_atributo where id > 0 and projeto_documento_id = "+id;
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
module.exports = ProjetoDocumentoAtributo;