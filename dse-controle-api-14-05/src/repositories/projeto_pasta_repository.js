const connection = require("../../data_base.js")

module.exports = class ProjetoPastaRepository {

    constructor(dependencies){
        this.connection = dependencies.connection ? dependencies.connection : connection;
    }
    async getAttributes(pasta_id, categoria_id){
        return new Promise((resolve, reject) => {
            try {
                const sql = `SELECT pa.*, cta.categoria_id FROM pasta_atributo pa
                left join categoria_tem_atributo cta 
                on cta.atributo_id = pa.id
                where pa.alvo='projeto_pasta' and pa.alvo_id=${pasta_id} and ( (cta.categoria_id=${categoria_id} and cta.pasta_id=${pasta_id}) or ISNULL(cta.id));
                `
                
                this.connection.query(sql, (err, rows, fields) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(rows);
                });
            } catch (error) {
                reject(error);                
            }
        });
        // TODO: implement (baseado em PastaAtributo.selectAtributosCategoriaFast)
    }

    async insertManyFolderAttributes(attributes){
        return new Promise((resolve, reject) => {
            try {
                const sql = `INSERT INTO pasta_atributo (alvo, alvo_id, tipo, atributo, status, mask, isnull, flag_filha) 
                    VALUES ?`;
                
                this.connection.query(sql, [attributes.map(e => [e.alvo, e.alvo_id, e.tipo, e.atributo, e.status, e.mask, e.isnull, e.flag_filha])],
                    (err, rows, fields) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(rows);
                });
            } catch (error) {
                reject(error);                
            }
        });
    }

    async getManyAttributesStartingFromId(id, count){
        return new Promise((resolve, reject) => {
            try {
                const sql = `SELECT * FROM pasta_atributo WHERE id >= ? ORDER BY id ASC LIMIT ?`;
                this.connection.query(sql, [id, count],
                    (err, rows, fields) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(rows);
                });
            } catch (error) {
                reject(error);                
            }
        });
    }

    async insertManyCategoryAttributes(categoriesAttributes){
        return new Promise((resolve, reject) => {
            try {
                const sql = `INSERT INTO categoria_tem_atributo (categoria_id, atributo_id, pasta_id, projeto_id) VALUES ?`;
                this.connection.query(sql, [categoriesAttributes.map(e => [e.categoria_id, e.atributo_id, e.pasta_id, e.projeto_id])],
                    (err, rows, fields) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(rows);
                });
            } catch (error) {
                reject(error);                
            }
        });
    }

    async getFolderByNameAndParent(name, parent, projectId){
        return new Promise((resolve, reject) => {
            try {
                const sql = `SELECT * FROM projeto_pasta WHERE nome=? and pai_id=? and projeto_id=?`;
                this.connection.query(sql, [name, parent, projectId], 
                    (err, rows, fields) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(rows);
                });
            } catch (error) {
                reject(error);                
            }
        });
    }

    async getFolderById(id){
        return new Promise((resolve, reject) => {
            try {
                const sql = `SELECT * FROM projeto_pasta WHERE id=?`;
                this.connection.query(sql, [id], 
                    (err, rows, fields) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(rows);
                });
            } catch (error) {
                reject(error);                
            }
        });
    }

    async insertFolder(data){
        return new Promise((resolve, reject) => {
            try {
                const sql = `INSERT INTO projeto_pasta (nome, pai_id, timeline, status, projeto_id, categoria_id, herda_conf_nome) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                this.connection.query(sql, [data.nome, data.pai_id, data.timeline, data.status, data.projeto_id, data.categoria_id, data.herda_conf_nome], 
                    (err, rows, fields) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(rows);
                });
            } catch (error) {
                reject(error);                
            }
        });
    }

    async getFolderDocumentName(folderId){
        return new Promise((resolve, reject) => {
            try {
                const sql = `SELECT * FROM pasta_documento_nome WHERE pasta_id=?`;
                this.connection.query(sql, [folderId], 
                    (err, rows, fields) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(rows);
                });
            } catch (error) {
                reject(error);                
            }
        });
    }

    async insertManyFolderDocumentNames(data){
        return new Promise((resolve, reject) => {
            try {
                const sql = `INSERT INTO pasta_documento_nome (projeto_id, pasta_id, pasta_documento_nome_tipo_id, atributo_id, valor, ordem) VALUES ?`;
                this.connection.query(sql, [data.map(e => [e.projeto_id, e.pasta_id, e.pasta_documento_nome_tipo_id, e.atributo_id, e.valor, e.ordem])], 
                    (err, rows, fields) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(rows);
                });
            } catch (error) {
                reject(error);                
            }
        });
    }
    
}