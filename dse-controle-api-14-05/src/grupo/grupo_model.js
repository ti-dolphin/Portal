const sqlUtils = require("../utils/sqlUtils.js");

class grupoModel {
    static async getAllGroups() {
        const query = `SELECT id, nome FROM grupo`;

        const result = sqlUtils.executeQuery(query);

        return result

    }
}

module.exports = grupoModel