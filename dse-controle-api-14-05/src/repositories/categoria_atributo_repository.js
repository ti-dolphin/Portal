
const con = require('../../data_base');

module.exports = class CategoriaAtributoRepository {

    static async getCategory(id){
        const sql = 'SELECT * FROM categoria_atributo WHERE id = ?'
        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, 
                [id],
                function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows, fields);
                }
            });
        });
    }
}