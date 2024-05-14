const con = require('../../data_base');
const sqlUtils = require("../utils/sqlUtils.js");

class Cidade {
    
    /**
     * 
     * @param {string} cidade_id contem a id da cidade a ser consultadada
     */
    static get_lat_lng(cidade_id) {
        const sql = "select lat,lng from frigelar.cidade where id=" + cidade_id
        return new Promise(function (resolve, reject) {
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows[0], fields);
                }
            })
        })
    }

    /**
     * 
     * @param {string} id 
     */    
    static selectWithEstado(id) {
        const sql = `select c.*,e.estado from cidade c join estado e on e.id=c.estado_id where c.id =${id}`
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

    /**
     * @param {string} fields[] campos a serem consultados
     * @param {object} target[] array de obejetos que conte nome do campo (name) e valor a ser consultado(value)
     * @returns {Promise}  que vai resolver em rows e fields   
     **/
    static select(fields, targets = null) {
        var sql = sqlUtils.generate_select_query(targets, fields, "frigelar.cidade")
        sql = (sql.slice(0, sql.indexOf('*'))) + 'c.' + sql.slice(sql.indexOf('*'))
        sql = sql.replace('cidade', 'cidade c')
        
        const corte = sql.indexOf("WHERE")
        sql = sql.slice(0, corte) + " join estado e on e.id=c.estado_id " + sql.slice(corte)
        //console.log("sql gerado:", sql);
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
module.exports = Cidade;