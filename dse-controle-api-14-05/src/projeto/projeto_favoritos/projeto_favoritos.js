const con = require('../../../data_base');
const sqlUtils = require("../../utils/sqlUtils.js");
const fs = require("fs");
const GoogleCloudStorage = require('../../../google-cloud-storage')

class ProjetoFavoritos {

    /**
     * @param {string[]} fields[] campos a serem consultados
     * @param {object[]} target[] array de obejetos que conte nome do campo (name) e valor a ser consultado(value)
     * @returns {Promise}  que vai resolver em rows e fields   
     **/
    static select(fields = null, targets = null) {
        const sql = sqlUtils.generate_select_query(targets, fields, "projeto_favoritos");
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

    static selectHome(data) {

        var where_papeis = data.usuario_papel.length > 0 ? " pr.papel_id IN ("+data.usuario_papel+") OR " : ""

        const sql = `SELECT c.*, (
            select count(p.id) as qtd
            FROM processo p 
            join processo_passo_cadastro pr on p.processo_passo_cadastro_id = pr.id
            where p.data_fim IS NULL and ( `+where_papeis+` (pr.papel_id = 0 and p.usuario_id = `+data.usuario_id+`)) and p.projeto_id = c.id
        ) as qtd_processo FROM projeto_favoritos p join projeto_cadastro c on p.projeto_id = c.id where p.usuario_id = `+data.usuario_id+` order by p.data desc`

        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {

                    const map = rows.map(async (p) => { // consulta as imagens dos projetos
                        var caminho = 'projetos/'+p.id+'/'+p.imagem
                        if(await GoogleCloudStorage.verificaArquivo(caminho)){
                            p.imagem = await GoogleCloudStorage.getURLArquivo(caminho)
                        } else{
                            p.imagem = ''
                        }
                    })

                    await Promise.all(map)
                    
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
        const sql = sqlUtils.generate_insert_query(data, "projeto_favoritos");
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
        
        const sql = sqlUtils.generate_update_query(data, "projeto_favoritos");
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

    static delete(params) {
        const sql = "delete from projeto_favoritos where usuario_id = "+params.idusuario+" and projeto_id= "+params.idprojeto
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
module.exports = ProjetoFavoritos;