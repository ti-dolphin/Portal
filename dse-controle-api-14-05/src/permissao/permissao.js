const con = require('../../data_base');
const sqlUtils = require("../utils/sqlUtils.js");
const ProjetoPasta = require('../projeto/projeto_pasta/projeto_pasta')
class Permissao {

    /**
     * @param {string[]} fields[] campos a serem consultados
     * @param {object[]} target[] array de obejetos que conte nome do campo (name) e valor a ser consultado(value)
     * @returns {Promise}  que vai resolver em rows e fields   
     **/
    static select(fields = null, targets = null) {
        const sql = sqlUtils.generate_select_query(targets, fields, "permissao");
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

    static insertPermissaoPasta(data){
        
        return new Promise(async function (resolve, reject) {
            var c,r,u,d
      
            data.cadastro === 'Sim' ? c = "1" :  c = "0"
            data.consulta === 'Sim' ? r = "1" :  r = "0"
            data.edicao === 'Sim' ? u = "1" :  u = "0"
            data.remocao === 'Sim' ? d = "1" :  d = "0"
        
            var permissao = c+r+u+d;

            await Permissao.inserPermissaoPorAlvo(permissao,'projeto_pasta', data.pasta_id, data.alvos, data.alvo, data.projeto_id )

            if(data.pasta_filha === 'Sim'){
                var filhos = await ProjetoPasta.getArvoreDeFilhosRecursiva(data.pasta_id)
                const map = filhos.map(async (filho) => {
                    await Permissao.inserPermissaoPorAlvo(permissao,'projeto_pasta', filho.id, data.alvos, data.alvo, data.projeto_id )
                })

                await Promise.all(map)
            }

            resolve(true)
        });
    }

    static inserPermissaoPorAlvo(permissao, area, area_id, alvos, alvo, pai_id ){
        return new Promise(async function (resolve, reject) {
            const map = alvos.map(async (al) => {
                await Permissao.insert({
                    permissao: permissao,
                    area: area,
                    area_id: area_id,
                    alvo: alvo,
                    alvo_id: al.id,
                    status: 'Ativo',
                    pai_id : pai_id
                })
            })
            await Promise.all(map)
            resolve(true)
        });
    }

    /**
     * 
     * @param {object} data contem os pares de campo e valor 
     * @returns {Promise}  que vai resolver em rows e fields
     */
    static insert(data) {
        const sql = sqlUtils.generate_insert_query(data, "permissao");
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
        
        const sql = sqlUtils.generate_update_query(data, "permissao");
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
        const sql = "delete from permissao where id = "+id;
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
module.exports = Permissao;