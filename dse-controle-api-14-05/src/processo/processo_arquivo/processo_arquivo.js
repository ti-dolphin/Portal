const con = require('../../../data_base');
const sqlUtils = require("../../utils/sqlUtils.js");
const GoogleCloudStorage = require('../../../google-cloud-storage')
const utf8 = require('utf8');

class ProcessoArquivo {

    /**
     * @param {string[]} fields[] campos a serem consultados
     * @param {object[]} target[] array de obejetos que conte nome do campo (name) e valor a ser consultado(value)
     * @returns {Promise}  que vai resolver em rows e fields   
     **/
    static select(fields = null, targets = null) {
        const sql = sqlUtils.generate_select_query(targets, fields, "processo_arquivo");
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

    static getArquivo(url){
        return new Promise(async function (resolve, reject) {
            // Do async job
            var arquivo;
            if(await GoogleCloudStorage.verificaArquivo('documentos/'+url)){
                arquivo = await GoogleCloudStorage.getFileArquivoDocumento('documentos/'+url)
            } else{
                arquivo = false
            }
            resolve(arquivo);
        });
    }

    /**
     * 
     * @param {object} data contem os pares de campo e valor 
     * @returns {Promise}  que vai resolver em rows e fields
     */
    static insert(data) {
        const sql = sqlUtils.generate_insert_query(data, "processo_arquivo");
        
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

    static ajustaUrl(){
        return new Promise(async function (resolve, reject) {
            try {
                const arquivosErrados = await ProcessoArquivo.getArquivosUrlsErradas()

                const map = arquivosErrados.map(async (arquivo) => {
                    await ProcessoArquivo.update({
                        id: arquivo.id,
                        url_arquivo:arquivo.url
                    })
                })

                await Promise.all(map)
                console.log('ajustaUrl')
                resolve(arquivosErrados)

            } catch (error) {
                reject(error)
            }
        })
    }

    static getArquivosUrlsErradas(){
        const sql = "SELECT pa.*, pd.url FROM processo_arquivo pa join projeto_documento pd on pa.id_arquivo = pd.id where pa.url_arquivo != pd.url"
        
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
        
        const sql = sqlUtils.generate_update_query(data, "processo_arquivo");
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
        const sql = "delete from processo_arquivo where processo_id = "+id;
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
module.exports = ProcessoArquivo;