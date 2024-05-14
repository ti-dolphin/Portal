const con = require('../../../data_base');
const sqlUtils = require("../../utils/sqlUtils.js");
const fs = require("fs");
const GoogleCloudStorage = require('../../../google-cloud-storage')
const ProjetoPasta = require('../projeto_pasta/projeto_pasta')

class ProjetoCadastro {

    /**
     * @param {string[]} fields[] campos a serem consultados
     * @param {object[]} target[] array de obejetos que conte nome do campo (name) e valor a ser consultado(value)
     * @returns {Promise}  que vai resolver em rows e fields   
     **/
    static select(fields = null, targets = null) {
        const sql = sqlUtils.generate_select_query(targets, fields, "projeto_cadastro");
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

    static getTemplates(){
        // const sql = sqlUtils.generate_insert_query(data, "projeto_cadastro");
        const sql = 'SELECT * FROM projeto_cadastro where template = 1 and status = "Ativo" order by nome';
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

    static projetosOnly(){
        // const sql = sqlUtils.generate_insert_query(data, "projeto_cadastro");
        const sql = 'SELECT * FROM projeto_cadastro where status = "Ativo" and template is null order by nome';
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

    static consultaProjetos(data){

        return new Promise(function (resolve, reject) {

            if(data.status == 'Ativos'){
                var whereStatus = ' and p.status= "Ativo" '
            }else{
                var whereStatus = ' and p.status IN ("Ativo", "Inativo") '
            }

            var whereNome = ''
            if(data.nome && data.nome != ''){
                whereNome = 'and p.nome like "%'+data.nome+'%"'
            }
            var whereModo = ''
            if(data.template == 'Templates'){
                whereModo = ' and p.template = 1';
            } else{
                whereModo = ' and p.template is null';
            }

            var sql = `select p.*,('fas fa-star') as star  from projeto_cadastro p join projeto_favoritos pr on p.id = pr.projeto_id 
            where pr.usuario_id = `+data.usuario_id+` `+whereNome+` and p.empresa_id = `+data.empresa_id+` `+whereStatus+` `+whereModo // consulta os projetos favoritos do usuario
            
            con.query(sql, function (err, fav, fields) {
                if (err) {
                    reject(err);
                } else {

                    if(data.admin == 1){ // é administrador
                        var sql2 = `SELECT p.*, ('far fa-star') as star FROM projeto_cadastro p 
                        where p.empresa_id = `+data.empresa_id+`  `+whereNome+`
                        and p.id NOT IN (select projeto_id from projeto_favoritos where usuario_id = `+data.usuario_id+`) 
                        `+whereStatus + whereModo+` 
                        group by p.id`
                    } else{
                        var sql2 = `SELECT p.*, ('far fa-star') as star FROM projeto_cadastro p 
                        join permissao pe on p.id = pe.area_id
                        where p.empresa_id = `+data.empresa_id+` `+whereNome+`
                        and (pe.alvo_id IN(select grupo_id from usuario_grupo where usuario_id = `+data.usuario_id+`) or pe.alvo_id = `+data.usuario_id+`)
                        and p.id NOT IN (select projeto_id from projeto_favoritos where usuario_id = `+data.usuario_id+`) 
                        `+whereStatus + whereModo +`   
                        group by p.id`  
                    }
                    con.query(sql2, async function (err, rows, fields) {
                        if(err){
                            reject(err)
                        } else{
                            var projetos = fav.concat(rows)

                            const map = projetos.map(async (p) => { // consulta as imagens dos projetos
                                var caminho = 'projetos/'+p.id+'/'+p.imagem
                                if(await GoogleCloudStorage.verificaArquivo(caminho)){
                                    p.imagem = await GoogleCloudStorage.getURLArquivo(caminho)
                                } else{
                                    p.imagem = ''
                                }
                            })

                            await Promise.all(map)

                            resolve(projetos, fields)
                        }
                    });

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
        const sql = sqlUtils.generate_insert_query(data, "projeto_cadastro");
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

    static insertImagem(data) {
        const sql = "update projeto_cadastro set imagem = '"+data.nome+"' where id = "+data.id
        
        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    var caminho = "projetos/" +data.id+ "/" + data.nome
                    GoogleCloudStorage.upload(data.base64.base64,caminho).then(()=>{
                        resolve(rows, fields);
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
        
        const sql = sqlUtils.generate_update_query(data, "projeto_cadastro");
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

    static updateImagem(data) {
        // const sql = sqlUtils.generate_update_query(data, "projeto_cadastro");
        const sql = "update projeto_cadastro set imagem = '"+data.nome+"' where id = "+data.id

        return new Promise(function (resolve, reject) {
            
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {

                    var caminho = 'projetos/' +data.id+ "/" + data.nome

                    if(data.imgantiga){
                        if(await GoogleCloudStorage.verificaArquivo('projetos/'+data.id+'/'+data.imgantiga)){
                            GoogleCloudStorage.delete('projetos/'+data.id+'/'+data.imgantiga)
                        }
                    }

                    GoogleCloudStorage.upload(data.base64.base64,caminho).then(()=>{
                        resolve(rows, fields);
                    }).catch((err) => {
                        reject(err);
                    })

                }
            });
        });
    }

    static simpleSelect(id) {
        const sql = "select * from projeto_cadastro where id = "+id
        return new Promise(function (resolve, reject) {
            try {
                con.query(sql, async function (err, rows, fields) {
                    if (err) {
                        reject(err);
                    } else {
    
                        if(rows.length > 0){
                            resolve(rows[0]);
                        } else{
                            resolve(false)
                        }
                        
                    }
                });             
            } catch (error) {
                reject(error)
            }
        });
    }

    static projetoTemplate(data){
        return new Promise(async function (resolve, reject) {
            try {
                const projeto = await ProjetoCadastro.simpleSelect(data.projeto_id)
    
                if(projeto && projeto.template == 1){
                    const pasta_id = await ProjetoPasta.verificaeCriaPastaByNome(data.projeto_processo, data.projeto_pasta_id)
                    resolve(pasta_id)
                } else{
                    resolve(false)
                }
            } catch (error) {
                reject(error)
            }
        })
    }
}
module.exports = ProjetoCadastro;