const con = require('../../data_base');
const sqlUtils = require("../utils/sqlUtils.js");

class Grupo {

    /**
     * @param {string[]} fields[] campos a serem consultados
     * @param {object[]} target[] array de obejetos que conte nome do campo (name) e valor a ser consultado(value)
     * @returns {Promise}  que vai resolver em rows e fields   
     **/
    static select(fields = null, targets = null) {
        const sql = sqlUtils.generate_select_query(targets, fields, "grupo");
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
        var usuarios = data.usuarios;
        data.empresa_id= 1;
        delete data.usuarios;
        delete data.id;

        const sql = sqlUtils.generate_insert_query(data, "grupo");
        //console.log("sql gerado:", sql)
        
        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    await Grupo.insereUsuariosGrupo(usuarios,rows.insertId, 1)
                    resolve(rows, fields);
                }
            });

        });
    }

    static insereUsuariosGrupo(usuarios,grupo_id, empresa_id){

        return new Promise(async function (resolve, reject) {

            const map = usuarios.map( async (usuario) => {
                await Grupo.insereUsuarioGrupo(usuario.id,grupo_id,empresa_id)
            })

            await Promise.all(map)
            resolve()
        });

    }

    static insereUsuarioGrupo(usuario_id,grupo_id,empresa_id){

        const sql = 'INSERT INTO usuario_grupo (usuario_id, grupo_id, empresa_id) VALUES ('+usuario_id+', '+grupo_id+', '+empresa_id+')'
        
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

    static deleteUsuariosGrupo(grupo_id){
        const sql = "delete from usuario_grupo WHERE `grupo_id`='" + grupo_id + "';";
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

    /**
     * 
     * @param {object} data contem os pares de campo e valor 
     * @returns {Promise}  que vai resolver em rows e fields
     */
    static update(data) {
        var usuarios = data.usuarios;
        delete data.usuarios;
        
        const sql = sqlUtils.generate_update_query(data, "grupo");
        return new Promise(function (resolve, reject) {
            
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    await Grupo.deleteUsuariosGrupo(data.id)
                    await Grupo.insereUsuariosGrupo(usuarios,data.id, 1)
                    resolve(rows, fields);
                }
            });
        });
    }
    
}
module.exports = Grupo;