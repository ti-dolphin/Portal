const con = require('../../../data_base');
const sqlUtils = require("../../utils/sqlUtils.js");

class PastaAtributo {

    /**
     * @param {string[]} fields[] campos a serem consultados
     * @param {object[]} target[] array de obejetos que conte nome do campo (name) e valor a ser consultado(value)
     * @returns {Promise}  que vai resolver em rows e fields   
     **/
    static select(fields = null, targets = null) {
        const sql = sqlUtils.generate_select_query(targets, fields, "pasta_atributo");
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

    static selectCategoria(pasta_id) {
        const sql = `SELECT *, 
        (SELECT ca.id FROM categoria_tem_atributo c  
        join categoria_atributo ca on c.categoria_id = ca.id
        where c.atributo_id = pasta_atributo.id) as categoria_id,

        (SELECT ca.categoria FROM categoria_tem_atributo c  
        join categoria_atributo ca on c.categoria_id = ca.id
        where c.atributo_id = pasta_atributo.id) as categoria 

        from pasta_atributo WHERE status = 'Ativo' AND  alvo = 'projeto_pasta' AND  alvo_id =  '`+pasta_id+`' order by atributo`
        
        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    const map = rows.map(async (r) => {
                        if(r.mask === 'Seleção'){
                            r.configSelect = await PastaAtributo.getPastaAtributoOpcaoSelect(r.id)
                        }
                    })

                    await Promise.all(map)
                    resolve(rows, fields);
                }
            });
        });
    }

    static getPastaAtributoOpcaoSelect(atributo_id){
        var sql = 'SELECT * FROM pasta_atributo_opcao_select where atributo_id = '+atributo_id

        return new Promise(function (resolve, reject) {
            try {
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
        });
    }

    static selectAtributosSemCategoria(data){
        var sql = `SELECT * FROM pasta_atributo where alvo = 'projeto_pasta' and alvo_id = `+data.pasta_id+` and 
        id not in (SELECT atributo_id FROM categoria_tem_atributo where pasta_id = `+data.pasta_id+`)`

        if(data.flag_filha){
            sql += ' and flag_filha = 1'
        }

        sql += ' order by atributo'

        return new Promise(function (resolve, reject) {
            try {
                con.query(sql, async function (err, rows, fields) {
                    if (err) {
                        reject(err);
                    } else {
                        const map = rows.map(async (r) => {
                            if(r.mask === 'Seleção'){
                                r.configSelect = await PastaAtributo.getPastaAtributoOpcaoSelect(r.id)
                            }
                        })
    
                        await Promise.all(map)
                        resolve(rows, fields);
                    }
                });
            } catch (error) {
                reject(error)
            }
        });
    }

    static selectAtributosComCategoria(data){
        var sql = `SELECT * FROM pasta_atributo pa join categoria_tem_atributo ca on pa.id = ca.atributo_id
        where alvo = 'projeto_pasta' and alvo_id = `+data.pasta_id+` and ca.categoria_id = `+data.categoria_id

        if(data.flag_filha){
            sql += ' and flag_filha = 1'
        }

        sql += ' order by atributo'

        return new Promise(function (resolve, reject) {
            try {
                con.query(sql, async function (err, rows, fields) {
                    if (err) {
                        reject(err);
                    } else {
                        const map = rows.map(async (r) => {
                            if(r.mask === 'Seleção'){
                                r.configSelect = await PastaAtributo.getPastaAtributoOpcaoSelect(r.atributo_id)
                            }
                        })
    
                        await Promise.all(map)
                        resolve(rows, fields);
                    }
                });
            } catch (error) {
                reject(error)
            }
        });
    }

    static selectAtributosCategoria(data){

        // const sql = `SELECT * FROM pasta_atributo 
        // where alvo = 'projeto_pasta' and alvo_id = `+data.pasta_id+` 
        // and (id IN (SELECT atributo_id FROM categoria_tem_atributo where pasta_id = `+data.pasta_id+`  and categoria_id = `+data.categoria_id+` ) 
        // or id NOT IN(SELECT atributo_id FROM categoria_tem_atributo where pasta_id = `+data.pasta_id+` ))`

        const sql = `select *, (select categoria_id from categoria_tem_atributo c where c.atributo_id = p.id) as categoria_id from pasta_atributo p 
        where (not EXISTS (select * from categoria_tem_atributo c where c.atributo_id = p.id) or 
        EXISTS (select * from categoria_tem_atributo c where c.atributo_id = p.id and c.categoria_id = `+data.categoria_id+`))
        and p.alvo = 'projeto_pasta' and p.alvo_id = `+data.pasta_id+` order by categoria_id`

        // console.log("sql gerado:", sql)
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

    static selectAtributosCategoriaFast(data){

        return new Promise(async function (resolve, reject) {
            try {
                var semCategoria = await PastaAtributo.selectAtributosSemCategoria(data)
                var comCategoria = await PastaAtributo.selectAtributosComCategoria(data)
                var atributos = [...semCategoria, ...comCategoria]
    
                const map = atributos.map(async (a) => {
                    if(data.arquivo_id && data.pasta_id){
                        var valor = await PastaAtributo.getValorAtributo({
                            projeto_documento_id: data.arquivo_id,
                            projeto_diretorio_id: data.pasta_id,
                            pasta_atributo_id: a.atributo_id ? a.atributo_id : a.id 
                        })
                        
                        if(valor){
                            a.valor = valor
                        }
                    }
                })
    
                await Promise.all(map)
    
                resolve(atributos)
                
            } catch (error) {
                reject(error)
            }
        })

    }

    static async selectAtributosComValor(data) {
        try {
            var semCategoria = await PastaAtributo.selectAtributosSemCategoria(data);
            var comCategoria = await PastaAtributo.selectAtributosComCategoria(data);
            var atributos = [...semCategoria, ...comCategoria];
    
            for (let i = 0; i < atributos.length; i++) {
                var valor = await PastaAtributo.getValorAtributo({
                    projeto_documento_id: data.arquivo_id,
                    projeto_diretorio_id: data.pasta_id,
                    pasta_atributo_id: atributos[i].atributo_id ? atributos[i].atributo_id : atributos[i].id
                });
    
                if (valor) {
                    atributos[i].valor = valor;
                }
            }
    
            const atributosComValor = atributos.filter((a) => a.valor !== undefined);
    
            return atributosComValor;
        } catch (error) {
            throw error;
        }
    }
    

    static getValorAtributo(data){
        const sql = `SELECT valor FROM projeto_documento_atributo 
        where projeto_documento_id = `+data.projeto_documento_id+` and projeto_diretorio_id = `+data.projeto_diretorio_id+` 
        and pasta_atributo_id = `+data.pasta_atributo_id

        return new Promise(function (resolve, reject) {
            try {
                con.query(sql, function (err, rows, fields) {
                    if (err) {
                        reject(err);
                    } else {
                        if(rows.length > 0){
                            resolve(rows[0].valor);
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

    static selectAtributosPastaPai(data){
        const sql = `SELECT *, (select categoria_id from categoria_tem_atributo where atributo_id = p.id) as categoria_id from pasta_atributo p
        WHERE  alvo = 'projeto_pasta' AND  flag_filha =  '1' AND  alvo_id = `+data.pasta_id 

        return new Promise(function (resolve, reject) {
            try {
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
        });
    }

    static selectAtributoFilho(data){
        
        var sql

        if(data.categoria_id){
            sql = `select p.* from pasta_atributo p join categoria_tem_atributo c on p.id = c.atributo_id
            where alvo_id = `+data.pasta_id+` and atributo like(SELECT atributo FROM pasta_atributo where id = `+data.atributo_id+`)
            AND c.categoria_id = (select categoria_id from categoria_tem_atributo where atributo_id = `+data.atributo_id+`) order by p.id desc limit 1`
        } else{
            sql = `select * from pasta_atributo
            where alvo_id = `+data.pasta_id+` and atributo like(SELECT atributo FROM pasta_atributo where id = `+data.atributo_id+`)
            order by id desc limit 1`
        }

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
        const sql = sqlUtils.generate_insert_query(data, "pasta_atributo");
        //console.log("sql gerado:", sql)
        
        return new Promise(function (resolve, reject) {
            try {
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
        });
    }

    /**
     * 
     * @param {object} data contem os pares de campo e valor 
     * @returns {Promise}  que vai resolver em rows e fields
     */
    static update(data) {
        
        const sql = sqlUtils.generate_update_query(data, "pasta_atributo");
        // console.log(sql);
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

    static delete(id) {
        const sql = "delete from pasta_atributo where id = "+id;
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
module.exports = PastaAtributo;