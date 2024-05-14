const con = require('../../../data_base');
const sqlUtils = require("../../utils/sqlUtils.js");

class PastaAtributoOpcaoSelect {

    /**
     * @param {string[]} fields[] campos a serem consultados
     * @param {object[]} target[] array de obejetos que conte nome do campo (name) e valor a ser consultado(value)
     * @returns {Promise}  que vai resolver em rows e fields   
     **/
    static select(fields = null, targets = null) {
        const sql = sqlUtils.generate_select_query(targets, fields, "pasta_atributo_opcao_select");
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
        return new Promise(async function (resolve) {

            await PastaAtributoOpcaoSelect.delete(data.atributo_id)
            const map = data.configSelect.map(async (configSelect) => {
                configSelect.atributo_id = data.atributo_id
                configSelect.pasta_id = data.pasta_id
                await PastaAtributoOpcaoSelect.simpleInsert(configSelect)
            })

            await Promise.all(map)
            resolve(true)

        });
    }

    static simpleInsert(data){
        const sql = sqlUtils.generate_insert_query(data, "pasta_atributo_opcao_select");
        
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
        
        const sql = sqlUtils.generate_update_query(data, "pasta_atributo_opcao_select");
        // console.log(sql);
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

    static delete(atributo_id) {
        const sql = "delete from pasta_atributo_opcao_select where atributo_id = "+atributo_id+" and id > 0"
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
module.exports = PastaAtributoOpcaoSelect;