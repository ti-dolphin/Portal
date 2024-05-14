const con = require('../../data_base');
const sqlUtils = require("../utils/sqlUtils.js");

class UsuarioGrupo {

    /**
     * @param {string[]} fields[] campos a serem consultados
     * @param {object[]} target[] array de obejetos que conte nome do campo (name) e valor a ser consultado(value)
     * @returns {Promise}  que vai resolver em rows e fields   
     **/
    static select(fields = null, targets = null) {
        const sql = sqlUtils.generate_select_query(targets, fields, "usuario_grupo");
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

    static selectGroup(grupo_id) {
        const sql = `SELECT * FROM usuario_grupo where grupo_id = ${grupo_id}`
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

    static selectUsersGrupo(grupo_id) {
        const sql = `select g.* from usuario_grupo g 
        join usuario u on g.usuario_id = u.id
        where grupo_id = ${grupo_id} and u.status = 'Ativo'`
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
        const sql = sqlUtils.generate_insert_query(data, "usuario_grupo");
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
        
        const sql = sqlUtils.generate_update_query(data, "usuario_grupo");
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

    static delete_grupos(idUsuario) {
        const sql = "delete from usuario_grupo WHERE `usuario_id`='" + idUsuario + "';";
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

    static delete_usuarios(idGrupo) {
        const sql = "delete from usuario_grupo WHERE `grupo_id`='" + idGrupo + "';";
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
module.exports = UsuarioGrupo;