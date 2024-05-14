const con = require('../../../data_base');
const sqlUtils = require("../../utils/sqlUtils.js");

class Papel {

    /**
     * @param {string[]} fields[] campos a serem consultados
     * @param {object[]} target[] array de obejetos que conte nome do campo (name) e valor a ser consultado(value)
     * @returns {Promise}  que vai resolver em rows e fields   
     **/
    static select(fields = null, targets = null) {
        const sql = sqlUtils.generate_select_query(targets, fields, "papel");
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

        const sql = sqlUtils.generate_insert_query(data, "papel");
        //console.log("sql gerado:", sql)
        
        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    await Papel.insereUsuariosPapel(usuarios,rows.insertId, 1)
                    resolve(rows, fields);
                }
            });

        });
    }

    static insereUsuariosPapel(usuarios,papel_id, empresa_id){

        return new Promise(async function (resolve, reject) {

            try {
                if(Array.isArray(usuarios) && usuarios.length > 0){
                    const map = usuarios.map( async (usuario) => {
                        await Papel.insereUsuarioPapel(usuario.id,papel_id,empresa_id)
                    })
        
                    await Promise.all(map)
                    resolve()
                } else{
                    resolve(false)
                }
                
            } catch (error) {
                reject(error)
            }

        });

    }

    static insereUsuarioPapel(usuario_id,papel_id,empresa_id){

        const sql = 'INSERT INTO usuario_papel(usuario_id, papel_id, empresa_id) VALUES ('+usuario_id+', '+papel_id+', '+empresa_id+')'
        
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

    static deleteUsuariosPapel(papel_id){
        const sql = "delete from usuario_papel WHERE `papel_id`='" + papel_id + "';";
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
        
        const sql = sqlUtils.generate_update_query(data, "papel");
        // console.log(sql);
        return new Promise(function (resolve, reject) {
            
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    await Papel.deleteUsuariosPapel(data.id);
                    await Papel.insereUsuariosPapel(usuarios,data.id, 1)
                    resolve(rows, fields);
                }
            });
        });
    }

    static delete(id) {
        const sql = "delete from papel where id = "+id;
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

    static getPapeisProcesso(processo_cadastro_id){
        return new Promise(async function (resolve, reject) {
            try {
                const sql = "SELECT p.id, p.nome FROM processo_passo_cadastro pa join papel p on pa.papel_id = p.id where processo_cadastro_id = "+processo_cadastro_id+" group by p.id, p.nome";
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
        })
    }
    
}
module.exports = Papel;