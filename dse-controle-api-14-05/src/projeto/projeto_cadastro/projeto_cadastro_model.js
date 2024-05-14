const sqlUtils = require("../../utils/sqlUtils.js")


class ProjetoCadastroModel {
    static async getAllTemplates() {
        const sql = `SELECT id, nome FROM projeto_cadastro where template = 1 and status = "Ativo" order by nome`;

        const result = sqlUtils.executeQuery(sql);

        return result
    }
}

module.exports = ProjetoCadastroModel