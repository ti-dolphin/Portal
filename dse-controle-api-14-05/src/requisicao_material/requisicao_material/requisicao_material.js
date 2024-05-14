const con = require('../../../data_base');
const sqlUtils = require("../../utils/sqlUtils.js");
const fs = require("fs");
const GoogleCloudStorage = require('../../../google-cloud-storage')

class RequisicaoMaterial {

    /**
     * @param {string[]} fields[] campos a serem consultados
     * @param {object[]} target[] array de obejetos que conte nome do campo (name) e valor a ser consultado(value)
     * @returns {Promise}  que vai resolver em rows e fields   
     **/
    static select(fields = null, targets = null) {
        const sql = sqlUtils.generate_select_query(targets, fields, "requisicao_material");
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

    static selectReq(id) {
        const sql = 'select r.*, p.nome as projeto, (select nome from usuario where id = r.responsavel_id ) as responsavel,(select nome from usuario where id = r.comprador_id) as comprador from requisicao_material r join projeto_cadastro p on r.projeto_cadastro_id = p.id where r.id ='+id

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

    static selectUserGroupPermissionProgram(data){

        const sql= "SELECT u.id, u.nome FROM usuario_grupo ug join usuario u on u.id = ug.usuario_id where ug.grupo_id IN(SELECT alvo_id FROM permissao where area = 'projeto_programa' and area_id = "+data.programa_id+") group by u.id"

        return new Promise(function (resolve, reject) {

            con.query(sql, function (err, rows, fields) {
                if (!err) {
                    resolve(rows, fields);

                } else{
                    reject(err);
                }
            })

        });
    }

    static selectPermissao(data){
        var sql1

        sql1 = "select IF("+data.usuario_id+" IN (SELECT usuario_id FROM usuario_grupo where grupo_id IN(SELECT alvo_id FROM permissao where area = 'projeto_programa' and area_id = "+data.programa_id+") group by usuario_id),true, false) as cond"

        return new Promise(function (resolve, reject) {

            con.query(sql1, function (err, rows, fields) {
                if (!err) {
                    resolve(rows, fields);

                } else{
                    reject(err);
                }
            })

        });

    }

    static selectTabela(data) {

        return new Promise(async function (resolve, reject) {

            if(data.home != 1){
                var sql = 'SELECT r.*, p.nome as projeto, u.nome as responsavel,(select nome from usuario where id = r.comprador_id) as comprador FROM requisicao_material r join projeto_cadastro p on r.projeto_cadastro_id = p.id join usuario u on u.id = r.responsavel_id where situacao = "ativo"'
        
                if(data.home == 0 && data.projeto_id){ // se home for zero então consulta filtrando por um projeto especifico, ou seja, nao é a tabela da home
                    sql += ' and projeto_cadastro_id = '+data.projeto_id+''
                }
        
                if(data.cond == 0){ // se cond for zero o usuario nao tem permissão, então consulta somente as requisições dele
                    sql += ' and r.responsavel_id = '+data.usuario_id+''
                } else if(data.checkbox == 0){
                    sql += ' and r.comprador_id = '+data.usuario_id+''
                }
        
                if(data.data_necessidade){
                    sql += ' and data_necessidade between "'+data.data_necessidade.startDate+'" and "'+data.data_necessidade.endDate+'"'
                }                
                // Do async job
                con.query(sql, function (err, rows, fields) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows, fields);
                    }
                });
            } else{
                var pendentes = await RequisicaoMaterial.selectPendentes(data.usuario_id)
                resolve(pendentes)
            }
        });

    }

    static selectPendentes(id){

        const sql = `SELECT r.*,p.nome as projeto, u.nome as responsavel, (select nome from usuario where id = r.comprador_id) as comprador
        FROM requisicao_material r 
        join projeto_cadastro p on r.projeto_cadastro_id = p.id
        join usuario u on u.id = r.responsavel_id
        where (r.status = 'Aguardando' || r.status = 'Atendida parcial') and r.comprador_id =`+id

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

        const sql = sqlUtils.generate_insert_query(data, "requisicao_material");
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

    static insertDocumento(data){
        var doc = data.base64
        delete data.base64

        const sql = sqlUtils.generate_insert_query(data, "requisicao_material_documento");
        return new Promise(function (resolve, reject) {
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {

                    var caminho = "programas/requisicaomaterial/" + rows.insertId+ "/" + data.titulo

                    GoogleCloudStorage.upload(doc,caminho).then(()=>{

                        data.id = rows.insertId;
                        data.url = rows.insertId +"/" +data.titulo
                        
                        resolve(rows, fields);
                        
                        // atualiza caminho
                        const sql2 = sqlUtils.generate_update_query(data, "requisicao_material_documento");
    
                        return new Promise(function (resolve, reject) { // edita a linha do documento inseridno inserindo a URL
                            con.query(sql2, function (err, rows, fields) {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(rows, fields);
                                }
                            });
                        });
                    }).catch((err) => {
                        reject(err);
                    })

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
        
        const sql = sqlUtils.generate_update_query(data, "requisicao_material");
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
module.exports = RequisicaoMaterial;