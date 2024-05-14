const sqlUtils = require("../utils/sqlUtils.js");
const Utils = require("../utils/utils.js");

module.exports = class ProcessoPassoCadastroRepository {

    static async insertProcessSteps(dataArray, target_table) {
        if (!dataArray || dataArray.length === 0) {
            throw new Error("Nenhum dado fornecido para gerar a consulta de inserção em lote.");
        }
    
        // Mapeie os valores de cada objeto para uma string de valores
        const valoresArray = dataArray.map(data => {
            const decomposed = Utils.objec_decompose(data);
            return sqlUtils.generate_field_list(decomposed.valores, true);
        });
    
        // Obtenha as chaves (campos) de um dos objetos, pois todas devem ser iguais
        const campos = Utils.objec_decompose(dataArray[0]).chaves;
    
        // Combine os valores em uma única string
        const valores = valoresArray.map(valores => `(${valores})`).join(", ");
    
        // Construa a consulta de inserção em lote
        const query = `INSERT INTO ${target_table} (${campos}) VALUES ${valores}`;

        return await sqlUtils.executeQuery(query);
    }

    static async getManyFromId(id, itemsCount){
        const query = `SELECT * FROM processo_passo_cadastro WHERE id >= ${id} ORDER BY ID ASC LIMIT ${itemsCount}`;
        return await sqlUtils.executeQuery(query);
    }

    static async createFlow(data_array){
        if (!data_array || data_array.length === 0) {
            throw new Error("Nenhum dado fornecido para gerar a consulta de inserção em lote.");
        }
 
        const valoresArray = data_array.map(data => {
            const decomposed = Utils.objec_decompose(data);
            return sqlUtils.generate_field_list(decomposed.valores, true);
        });

        const campos = Utils.objec_decompose(data_array[0]).chaves;

        const valores = valoresArray.map(valores => `(${valores})`).join(", ");

        const query = `INSERT INTO processo_fluxo_cadastro (${campos}) VALUES ${valores}`;

        return await sqlUtils.executeQuery(query);
    }

    static async getAllByProcesso(processoId){
        const query = `SELECT * FROM processo_passo_cadastro WHERE processo_cadastro_id = ${processoId}`;
        return await sqlUtils.executeQuery(query);
    }

}