const con = require('../../data_base.js');
const ProcessoCadastro = require('../processo/processo_cadastro/processo_cadastro.js');
const sqlUtils = require('../utils/sqlUtils.js');

module.exports = class ProcessoCadastroRepository {
    static async create(data){
        const sql = sqlUtils.generate_insert_query(data, "processo_cadastro");
        return new Promise(function (resolve, reject) {
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    try {
                        await ProcessoCadastro.salvaDiagramaProcesso(rows.insertId,data.xml)
                    } catch (error) {
                        reject(error);
                    }
                    resolve(rows.insertId);
                }
            });

        });
    }
}