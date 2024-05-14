const sqlUtils = require("../utils/sqlUtils.js");
class usuarioModel {
    static async selectAvatars(ids) {
        try {
            const idsString = ids.join(',');

            const query = `SELECT url_avatar FROM usuario WHERE id IN (${idsString})`;
            const result = await sqlUtils.executeQuery(query);

            return result;
        } catch (error) {
            throw error;
        }
    }

    static async getPostsUsers(ids) {
        try {
            const idsString = ids.join(',');
    
            const query = `
                SELECT
                    u.id,
                    u.nome,
                    u.email,
                    COUNT(pc.id) AS 'post_count',
                    MAX(pc.data) AS 'latest_post_date'
                FROM
                    usuario u
                LEFT JOIN
                    post pc ON pc.usuario_id = u.id
                WHERE
                    u.id IN (${idsString})
                GROUP BY
                    u.id, u.nome, u.email
                ORDER BY
                    post_count DESC;`;
    
            const result = await sqlUtils.executeQuery(query);
    
            return result;
        } catch (error) {
            throw error;
        }
    }
    
    

    static async getPostsCommentsUsers(ids) {
        try {
            const idsString = ids.join(',');
    
            const query = `
                SELECT
                    u.id,
                    u.nome,
                    u.email,
                    COUNT(cc.id) AS 'comment_count',
                    MAX(cc.data) AS 'latest_comment_date'
                FROM
                    usuario u
                LEFT JOIN
                    post_comentario cc ON cc.usuario_id = u.id
                WHERE
                    u.id IN (${idsString})
                GROUP BY
                    u.id, u.nome, u.email
                ORDER BY
                    comment_count DESC;`;
    
            const result = await sqlUtils.executeQuery(query);
    
            return result;
        } catch (error) {
            throw error;
        }
    }
    

    static async getPostsLikesUsuarios(ids) {
        try {
            const idsString = ids.join(',');
    
            const query = `
                SELECT
                    u.id,
                    u.nome,
                    u.email,
                    COUNT(pl.id) AS 'like_count',
                    MAX(pl.data) AS 'latest_like_date'
                FROM
                    usuario u
                LEFT JOIN
                    post_like pl ON pl.usuario_id = u.id
                WHERE
                    u.id IN (${idsString})
                GROUP BY
                    u.id, u.nome, u.email
                ORDER BY
                    like_count DESC;`;
    
            const result = await sqlUtils.executeQuery(query);
    
            return result;
        } catch (error) {
            throw error;
        }
    }

    static async getAllUsers() {
        const query = `SELECT id, nome FROM usuario ORDER BY nome`;
    
        const result = await sqlUtils.executeQuery(query);
    
        return result;
    }
    
    
    
    


}

module.exports = usuarioModel;