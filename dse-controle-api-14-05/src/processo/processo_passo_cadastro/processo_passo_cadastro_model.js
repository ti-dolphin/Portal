const con = require("../../../data_base");
const sqlUtils = require("../../utils/sqlUtils.js");
const Utils = require("../../utils/utils.js");

class processoPassoCadastroModel {
    static insertProcessSteps(dataArray, target_table) {
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
    
        return query;
    }
    
    
}

module.exports = processoPassoCadastroModel