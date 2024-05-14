const connection = require("../../data_base.js")
const sqlUtils = require("../utils/sqlUtils.js")


module.exports = class ProjetoRepository {

    constructor(dependencies){
        this.connection = dependencies.connection ? dependencies.connection : connection;
    }

    async getProject(projectId) {
        const query = `SELECT * FROM projeto_cadastro WHERE id = ${projectId} LIMIT 1`
        return (await sqlUtils.executeQuery(query))[0]
    }

    async insertProjetoDocumento(data){
        return new Promise((resolve, reject) => {
            try {
                const fields = ["titulo", "complemento", "url", "template", "projeto_diretorio_id", "projeto_id", "status", "categoria_id"];
                const query = `INSERT INTO projeto_documento(titulo, complemento, url, template, projeto_diretorio_id, projeto_id, status, categoria_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                
                this.connection.query(query, [data.titulo, data.complemento, data.url, data.template, data.projeto_diretorio_id, data.projeto_id, data.status, data.categoria_id], function (err, result) {
                    if (err) {
                        reject(err);
                    }
                    resolve(result);
                });
            } catch (error) {
                reject(error)
            }
        });
    }

    async updateProjetoDocumentoUrl(id, url){
        return new Promise((resolve, reject) => {
            try {
                const query = `UPDATE projeto_documento SET url = ? WHERE id = ?`;
                this.connection.query(query, [url, id], function (err, result) {
                    if (err) {
                        reject(err);
                    }
                    resolve(result);
                });
            } catch (error) {
                reject(error)
            }
        });
    }

    async insertManyAttributes(attributes){
        return new Promise((resolve, reject) => {
            try {
                const query = `INSERT INTO projeto_documento_atributo(projeto_documento_id, projeto_diretorio_id, valor, pasta_atributo_id) VALUES ?`;
                const values = attributes.map((attribute, _) => [attribute.projeto_documento_id, attribute.projeto_diretorio_id, attribute.valor, attribute.pasta_atributo_id]);
                this.connection.query(query, [values], function (err, result) {
                    if (err) {
                        reject(err);
                    }
                    resolve(result);
                });
            } catch (error) {
                reject(error)
            }
        });
    }
}