const con = require('../../../data_base');
const sqlUtils = require('../../utils/sqlUtils');
const Usuario = require("../../usuario/usuario");
const GoogleCloudStorage = require('../../../google-cloud-storage')

class Post {

    /**
     * @param {string[]} fields[] campos a serem consultados
     * @param {object[]} target[] array de obejetos que conte nome do campo (name) e valor a ser consultado(value)
     * @returns {Promise}  que vai resolver em rows e fields   
     **/
    static select(fields = null, targets = null) {
        const sql = sqlUtils.generate_select_query(targets, fields, "post");
        // console.log("sql gerado:", sql)
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
    static insert(data) {
        return new Promise(async function (resolve, reject) {
            try {
                const postResult = await Post.simpleInsert({
                    usuario_id : data.usuario_id,
                    mural: data.mural,
                    permitir_comentarios: data.permitir_comentarios,
                    comunidade_id: data.comunidade_id,
                    status: 'Ativo',
                    url_video: data.url_video,
                    data_mural: data.data_mural
                })

                await Post.simpleInsertPostConteudo({
                    post_id: postResult.insertId,
                    conteudo: data.conteudo
                })

                const mapProjetos = data.projetos.map(async (p) => {
                    await Post.simpleInsertPostProjeto({
                        post_id : postResult.insertId,
                        projeto_id: p.value
                    })
                })

                const mapUsuarios = data.usuarios.map(async (u) => {
                    await Post.simpleInsertPostUsuarios({
                        post_id : postResult.insertId,
                        usuario_id: u.value
                    })
                })

                const mapArquivos = data.arquivos.map(async (arquivo) => {
                    const arquivoResult = await Post.simpleInsertPostArquivo({
                        post_id: postResult.insertId,
                        titulo: arquivo.path
                    })
                    const caminho = 'posts/'+postResult.insertId+'/'+arquivoResult.insertId+'/'+arquivo.path
                    GoogleCloudStorage.upload(arquivo.base64, caminho).then(async () => {
                        await Post.simpleUpdatePostArquivo({
                            id: arquivoResult.insertId,
                            url: caminho
                        })
                    })
                })

                await Promise.all(mapProjetos)
                await Promise.all(mapUsuarios)
                await Promise.all(mapArquivos)
                
                resolve(postResult.insertId)
            } catch (error) {
                reject(error)
            }
        })
    }

    static simpleInsert(data) {

        const sql = sqlUtils.generate_insert_query(data, "post");
        
        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows, fields);
                }
            });

        });
    }

    static simpleInsertPostConteudo(data) {

        const sql = sqlUtils.generate_insert_query(data, "post_conteudo");
        
        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows, fields);
                }
            });

        });
    }

    static simpleInsertPostProjeto(data) {

        const sql = sqlUtils.generate_insert_query(data, "post_projeto");
        
        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows, fields);
                }
            });

        });
    }

    static simpleInsertPostUsuarios(data) {

        const sql = sqlUtils.generate_insert_query(data, "post_usuarios");
        
        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows, fields);
                }
            });

        });
    }

    static simpleInsertPostArquivo(data) {

        const sql = sqlUtils.generate_insert_query(data, "post_arquivo");
        
        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows, fields);
                }
            });

        });
    }

    static simpleUpdatePostArquivo(data) {

        const sql = sqlUtils.generate_update_query(data, "post_arquivo");
        
        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, async function (err, rows, fields) {
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

        const sql = sqlUtils.generate_update_query(data, "post");
        return new Promise(function (resolve, reject) {
            
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {                    
                    resolve(rows, fields);
                }
            });
        });
    }

    static getPostsMural() {
        const sql = `SELECT u.nome as usuario_nome, pc.conteudo as conteudo, p.* FROM post p join usuario u on p.usuario_id = u.id join post_conteudo pc on p.id = pc.post_id where p.mural = 1 and p.status = 'Ativo' order by data_mural desc`
        return new Promise(function (resolve, reject) {
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    const map = rows.map(async (post) => {
                        post.arquivos = await Post.getPostArquivos(post.id)
                    })

                    await Promise.all(map)
                    resolve(rows, fields);
                }
            });
        });
    }

    // data:
    // index - numero de vezes que foi escrolada a pagina, cada scroll deve pegar mais 15 post 
    // comunidades = arrays de ids
    // usuarios - pegar todos os post em que os usuários foram marcados, e publicaram
    // projetos - pegar 
    static getPostsFeed(data) {
        var sql;
        if(data.filter && data.filter !== ''){
            sql = `SELECT u.nome as usuario_nome, u.tipo as usuario_tipo, u.url_avatar, pc.conteudo as conteudo, p.* FROM post p 
            join usuario u on p.usuario_id = u.id 
            join post_conteudo pc on p.id = pc.post_id
            where p.status = 'Ativo' and
            (LOWER(pc.conteudo) like LOWER('%${data.filter}%') 
             or LOWER(u.nome) like LOWER('%${data.filter}%') 
             or p.id IN(select p.id from post p join post_usuarios pu on p.id = pu.post_id join usuario u on pu.usuario_id = u.id where LOWER(u.nome) like LOWER('%${data.filter}%'))
             `
            if(data.filter.toLowerCase() === 'geral'){
                sql += `or p.comunidade_id IN (0))`
            }else{
                sql+= `or p.id IN(select p.id from post p join post_projeto pj on p.id = pj.post_id join projeto_cadastro pc on pj.projeto_id = pc.id where LOWER(pc.nome) like LOWER('%${data.filter}%')))`
            }
        }else{
            sql = `SELECT u.nome as usuario_nome, u.tipo as usuario_tipo, u.url_avatar, pc.conteudo as conteudo, p.* FROM post p 
                   join usuario u on p.usuario_id = u.id 
                   join post_conteudo pc on p.id = pc.post_id 
                   where p.status = 'Ativo'`
        }
        if(data.comunidades.length > 0){
            if(data.comunidades !== 'all'){
                sql += `and p.comunidade_id IN (${data.comunidades})`
            }
        }
        sql += `order by p.data desc`
        return new Promise(function (resolve, reject) {
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    sql += ` LIMIT ${data.index*15}`
                    var result = await Post.verifyNext(rows, sql)
                    resolve(result)                                      
                }
            });
        });
    }

    static verifyNext(allPosts, sql){
        return new Promise(function (resolve, reject) {
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    var result = {
                        posts: rows
                    }
                    if(allPosts.length === rows.length){
                        result.next = false
                    }else{
                        result.next = true
                    }
                    const map = result.posts.map(async (post) =>{
                        if(post.url_avatar && post.url_avatar !== ''){
                            if(await GoogleCloudStorage.verificaArquivo(post.url_avatar)){
                                post.avatar = await GoogleCloudStorage.getURLArquivo(post.url_avatar)
                            }
                        }
                        post.comentarios = await Post.getComentarios(post.id)
                        post.likes = await Post.getPostLikes(post.id)
                        post.tags = await Post.getPostTags(post.id);
                        post.comunidade = await Post.getComunidade(post.comunidade_id);
                        post.arquivos = await Post.getPostArquivos(post.id)
                    })
                    await Promise.all(map)                    
                    resolve(result);
                }
            });
        });
    }

    static getPostLikes(post_id){
        const sql = `select u.nome as usuario_nome, u.tipo as usuario_tipo, u.url_avatar, p.* from post_like p join usuario u on p.usuario_id = u.id where p.post_id = ${post_id}`
        return new Promise(function (resolve, reject) {
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {         
                    const map = rows.map(async (r) => {
                        if(r.url_avatar && r.url_avatar !== ''){
                            if(await GoogleCloudStorage.verificaArquivo(r.url_avatar)){
                                r.avatar = await GoogleCloudStorage.getURLArquivo(r.url_avatar)
                            }
                        }
                    })

                    await Promise.all(map)
                    resolve(rows);
                }
            });
        });
    }

    static getPostUsuarios(post_id){
        const sql = `select u.nome as usuario_nome, pu.* from post_usuarios pu join usuario u on u.id = pu.usuario_id where pu.post_id = ${post_id}`
        return new Promise(function (resolve, reject) {
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {                    
                    resolve(rows);
                }
            });
        });
    }

    static getPostArquivos(post_id){
        const sql = `select * from post_arquivo where post_id = ${post_id}`
        return new Promise(function (resolve, reject) {
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {                 
                    const map = rows.map(async (r) => {
                        if(await GoogleCloudStorage.verificaArquivo(r.url)){
                            r.url = await GoogleCloudStorage.getURLArquivo(r.url)
                        } else{
                            r.url = null
                        }
                    })

                    await Promise.all(map)
                    resolve(rows);
                }
            });
        });
    }

    static removeMural(data) {
        const sql = `UPDATE post set mural = '0' where id = ${data.id}`
        return new Promise(function (resolve, reject) {
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {                    
                    resolve(rows, fields);
                }
            });
        });
    }

    static getFiltersByUser(id) {
        return new Promise(async function (resolve, reject) {

            try {
                var usuario = await Usuario.selectId(id)
                if(usuario.tipo === "Administrador"){
                    var grupos = await Post.groupsOptionsAdmin()
                } else{
                    var grupos = await Post.groupsOptions(id);
                }
                var projetos = await Post.projectOptions();
                var usuarios = await Post.userOptions();
                var options = {grupos,projetos,usuarios}
                resolve(options)
            } catch (error) {
                reject(error)
            }

        });
    }

    static groupsOptionsAdmin(){
        const sql = `SELECT id as value, nome as label FROM grupo where status = 'Ativo' order by nome asc`
        return new Promise(function (resolve, reject) {
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {                    
                    resolve(rows, fields);
                }
            });
        });
    }

    static groupsOptions(id){
        const sql = `select g.id as value, g.nome as label from usuario_grupo ug join grupo g on g.id = ug.grupo_id where ug.usuario_id = ${id} and g.status = 'Ativo' order by g.nome asc`
        return new Promise(function (resolve, reject) {
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {                    
                    resolve(rows, fields);
                }
            });
        });
    }

    static projectOptions(){
        const sql = `select pc.id as value, pc.nome as label from projeto_cadastro pc where pc.status = 'Ativo' and pc.template is null order by pc.nome asc`
        return new Promise(function (resolve, reject) {
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {                    
                    resolve(rows, fields);
                }
            });
        });
    }

    static userOptions(){
        const sql = `select u.id as value, u.nome as label from usuario u where u.status = 'Ativo' order by u.nome asc`
        return new Promise(function (resolve, reject) {
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {                    
                    resolve(rows, fields);
                }
            });
        });
    }

    static getPostDetalhes(postId){
        const sql = `SELECT u.nome as usuario_nome, u.tipo as usuario_tipo, u.url_avatar, p.* from post p join usuario u on u.id = p.usuario_id where p.id = ${postId}`;
        return new Promise(function (resolve, reject) {
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    var post = rows[0]
                    if(post.url_avatar && post.url_avatar !== ''){
                        if(await GoogleCloudStorage.verificaArquivo(post.url_avatar)){
                            post.avatar = await GoogleCloudStorage.getURLArquivo(post.url_avatar)
                        }
                    }              
                    post.likes = await Post.getPostLikes(post.id);
                    post.tags = await Post.getPostTags(post.id);
                    post.comunidade = await Post.getComunidade(post.comunidade_id);
                    post.conteudo = await Post.getConteudo(post.id);
                    post.comentarios = await Post.getComentarios(post.id);
                    post.arquivos = await Post.getPostArquivos(post.id)
                    resolve(rows, fields);
                }
            });
        });
    }

    static getPostTags(postId){
        return new Promise(async function (resolve, reject) {
            try {
                var usuarios = await Post.getUsuariosMarcados(postId);
                usuarios.forEach(user => user.tipo = 'user')
                var projetos = await Post.getProjetosMarcados(postId);
                projetos.forEach(project => project.tipo = 'project')
                var tags = [...usuarios, ...projetos]
                resolve(tags)
            }catch (error) {
                reject(error)
            }
        });
    }

    static getUsuariosMarcados(postId){
        const sql = `SELECT u.nome as label, u.id as value from post_usuarios pu join usuario u on u.id = pu.usuario_id where pu.post_id = ${postId}`;
        return new Promise(function (resolve, reject) {
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static getProjetosMarcados(postId){
        const sql = `SELECT pc.nome as label, pc.id as value from post_projeto pp join projeto_cadastro pc on pc.id = pp.projeto_id where pp.post_id = ${postId}`;
        return new Promise(function (resolve, reject) {
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static getComunidade(comunidadeId){
        const sql = `SELECT g.nome as label, g.id as value from grupo g where g.id = ${comunidadeId}`;
        return new Promise(function (resolve, reject) {
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static getConteudo(postId){
        const sql = `SELECT c.conteudo from post_conteudo c where c.post_id = ${postId}`;
        return new Promise(function (resolve, reject) {
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows[0].conteudo);
                }
            });
        });
    }

    static getComentarios(postId){
        const sql = `SELECT u.nome as usuario_nome, u.tipo as usuario_tipo, u.url_avatar, c.* from post_comentario c join usuario u on c.usuario_id = u.id where c.post_id = ${postId} and c.status = 'Ativo' and c.comentario_pai = 0 order by c.data asc`;
        return new Promise(function (resolve, reject) {
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    const map = rows.map( async (comentario) =>{
                        if(comentario.url_avatar && comentario.url_avatar !== ''){
                            if(await GoogleCloudStorage.verificaArquivo(comentario.url_avatar)){
                                comentario.avatar = await GoogleCloudStorage.getURLArquivo(comentario.url_avatar)
                            }
                        }     
                        comentario.respostas = await Post.getRespostasComentario(comentario.id);
                    })
                    await Promise.all(map)
                    resolve(rows);
                }
            });
        });
    }

    static getRespostasComentario(comentarioId){
        const sql = `SELECT u.nome as usuario_nome, u.tipo as usuario_tipo, u.url_avatar, c.* from post_comentario c join usuario u on c.usuario_id = u.id where c.comentario_pai = ${comentarioId} and c.status = 'Ativo' order by c.data asc`;
        return new Promise(function (resolve, reject) {
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    const map = rows.map(async (resposta) => {
                        if(resposta.url_avatar && resposta.url_avatar !== ''){
                            if(await GoogleCloudStorage.verificaArquivo(resposta.url_avatar)){
                                resposta.avatar = await GoogleCloudStorage.getURLArquivo(resposta.url_avatar)
                            }
                        }    
                    })
                    await Promise.all(map)
                    resolve(rows);
                }
            });
        });
    }
}
module.exports = Post;