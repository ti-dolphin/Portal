const con = require('../../../data_base');
const sqlUtils = require("../../utils/sqlUtils.js");

class PastaDocumentoNome {

    /**
     * @param {string[]} fields[] campos a serem consultados
     * @param {object[]} target[] array de obejetos que conte nome do campo (name) e valor a ser consultado(value)
     * @returns {Promise}  que vai resolver em rows e fields   
     **/
    static select(fields = null, targets = null) {
        const sql = sqlUtils.generate_select_query(targets, fields, "pasta_documento_nome");
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

    static getPastaId(pasta_id){
        const sql = "select * from pasta_documento_nome where pasta_id = "+pasta_id
        
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

    static selectItens(pasta_id) {
        const sql = 'SELECT CONVERT(id,char) as id ,projeto_id,pasta_id,pasta_documento_nome_tipo_id,atributo_id,valor  FROM pasta_documento_nome where pasta_id= '+pasta_id+' order by ordem'
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
        const sql = sqlUtils.generate_insert_query(data, "pasta_documento_nome");
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

    static insertCadastro(data) {
        console.log(data)

        return new Promise(function (resolve, reject) {
            const sql2 = "delete from pasta_documento_nome where pasta_id = "+data[0].pasta_id;
            con.query(sql2, async function (err, rows, fields) {
                if (err) {
                    console.log('Erro ao excluir Items na tabela pasta_documento_nome')
                    reject(err);
                } else{
                    var map = data.map(async (item,index) => {
                        delete item.id
                        item.ordem = index + 1
                        if(item.atributo_id == null || item.atributo_id == 'null'){
                            delete item.atributo_id
                        }
                        var sql = sqlUtils.generate_insert_query(item, "pasta_documento_nome");
                        await PastaDocumentoNome.insereNome(sql);
                    })
                    await Promise.all(map)
                    resolve()
                }
            });
        });
    }
    
    static insereNome(sql){
        return new Promise(function (resolve, reject) {
                con.query(sql, function (err, rows, fields) {
                    if (err) {
                        console.log('Erro ao incluir Item na tabela pasta_documento_nome')
                        reject(err);
                    } else{
                        resolve();
                    }
                });     
        });
    }

    static removeBanco(pasta_id){
        const sql = "delete from pasta_documento_nome where pasta_id = "+pasta_id;
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
        
        const sql = sqlUtils.generate_update_query(data, "pasta_documento_nome");
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

    static editaPrefixo(data){
        const sql = "UPDATE pasta_documento_nome SET valor = '"+data.prefixo+"' WHERE projeto_id = "+data.projeto_id+" and pasta_documento_nome_tipo_id = 1 and id > 0" 

        return new Promise(function (resolve, reject) {
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows, fields);
                }
            });
        })
    }
    
}
module.exports = PastaDocumentoNome;