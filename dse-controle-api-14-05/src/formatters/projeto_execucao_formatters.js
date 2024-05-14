
module.exports = class ProjetoExecucaoFormatters {
    static formatDocumentRow(data, documentDirectoryId, projectId){
        return {
            titulo: data.fileName,
            complemento: null,
            url: data.url ?? null,
            template: data.template,
            projeto_diretorio_id: documentDirectoryId,
            projeto_id: projectId,
            status: data.status,
            categoria_id: data.categoria_id
        }
    }
}