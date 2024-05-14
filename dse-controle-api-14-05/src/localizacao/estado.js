const con = require('../../data_base');
const sqlUtils = require("../utils/sqlUtils.js")

class Estado {

    /**
     * @param {string} fields[] campos a serem consultados
     * @param {object} target[] array de obejetos que conte nome do campo (name) e valor a ser consultado(value)
     * @returns {Promise}  que vai resolver em rows e fields   
     **/
    static select(fields, targets = null) {
        var sql = sqlUtils.generate_select_query(targets, fields, "frigelar.estado")
        
        return new Promise(function (resolve, reject) {
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows, fields);
                }
            })
        })
    }
}
module.exports = Estado;