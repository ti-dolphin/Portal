const con = require('../../data_base');
const sqlUtils = require("../utils/sqlUtils.js");
const GoogleCloudStorage = require('../../google-cloud-storage')
const moment = require('moment-business-time')
const https = require('https');
const usuarioModel = require('./usuario_model.js');
const UsuarioGrupo = require("../usuario_grupo/usuario_grupo.js")
const Grupo = require("../grupo/grupo.js");

module.exports = class Usuario {

    static select(fields = null, targets = null) {
        return new Promise((resolve, reject) => {
            const sql = sqlUtils.generate_select_query(targets, fields, "usuario");
            con.query(sql, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static selectByIds(ids = null) {
        return new Promise((resolve, reject) => {
            const sql = sqlUtils.generateSelectByIdsQuery(ids, "usuario");
            con.query(sql, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static infoRedeSocialByIds(ids) {
        return new Promise(async (resolve, reject) => {
            try {
                var resultArray = [];

                const url_avatars = await usuarioModel.selectAvatars(ids);
                const avatarPromises = url_avatars.map(async (url_avatar) => {
                    let avatar = null;
                    if (await GoogleCloudStorage.verificaArquivo(url_avatar)) {
                        avatar = await GoogleCloudStorage.getURLArquivo(url_avatar);
                    }
                    return { avatar };
                });

                // Executa todas as verificações em paralelo
                const avatars = await Promise.all(avatarPromises);

                const posts = await usuarioModel.getPostsUsers(ids);
                const comments = await usuarioModel.getPostsCommentsUsers(ids);
                const likes = await usuarioModel.getPostsLikesUsuarios(ids);


                posts.forEach(post => post.latest_post_date = moment(post.latest_post_date).format("YYYY/MM/DD HH:mm:ss"));
                comments.forEach(comment => comment.latest_comment_date = moment(comment.latest_comment_date).format("YYYY/MM/DD HH:mm:ss"));
                likes.forEach(like => like.latest_like_date = moment(like.latest_like_date).format("YYYY/MM/DD HH:mm:ss"));

                resultArray.push({
                    ids,
                    avatars,
                    posts: posts,
                    comments: comments,
                    likes: likes,
                });

                resolve(resultArray);

            } catch (error) {
                reject(error);
            }
        });
    }

    static infoRedeSocial(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const usuario = await Usuario.selectId(id)
                const posts = await Usuario.getPostsUsuario(id)
                const comentarios = await Usuario.getPostsComentarioUsuario(id)
                const likes = await Usuario.getPostsLikeUsuario(id)

                let ultima_interacao = null
                const datas = [
                    posts.length > 0 ? moment(posts[0].data).format("YYYY/MM/DD HH:mm:ss") : null,
                    comentarios.length > 0 ? moment(comentarios[0].data).format("YYYY/MM/DD HH:mm:ss") : null,
                    likes.length > 0 ? moment(likes[0].data).format("YYYY/MM/DD HH:mm:ss") : null
                ]

                const sortedArray = datas.sort((a, b) => new Date(a) - new Date(b)).reverse()

                if (sortedArray[0]) {
                    ultima_interacao = sortedArray[0]
                }

                let avatar = null

                if (usuario.url_avatar) {
                    if (await GoogleCloudStorage.verificaArquivo(usuario.url_avatar)) {
                        avatar = await GoogleCloudStorage.getURLArquivo(usuario.url_avatar)
                    }
                }

                resolve({
                    posts: posts.length,
                    comentarios: comentarios.length,
                    likes: likes.length,
                    ultima_interacao,
                    avatar,
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    static async selectId(id) {
        try {
            const result = await sqlUtils.executeQuery(`select * from usuario where id = ${id}`);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            throw error;
        }
    }

    static selectUsuariosOrdenados() {
        return new Promise((resolve, reject) => {
            const sql = 'select * from usuario where status = "Ativo" order by nome asc';
            con.query(sql, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static insert(data) {
        return new Promise((resolve, reject) => {
            const sql = sqlUtils.generate_insert_query(data, "usuario");
            con.query(sql, async (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static insereEmpresaUsuario(empresa_id, usuario_id) {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO usuario_empresa (empresa_id, usuario_id) VALUES (' + empresa_id + ', ' + usuario_id + ')'
            con.query(sql, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });

        });
    }

    static insereGruposUsuario(grupos, usuario_id, empresa_id) {
        return new Promise(async (resolve, reject) => {
            const map = grupos.map(async (grupo) => {
                await Usuario.insereGrupoUsuario(grupo.id, usuario_id, empresa_id)
            })
            await Promise.all(map)
            resolve()
        });
    }

    static insereGrupoUsuario(grupo_id, usuario_id, empresa_id) {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO usuario_grupo (usuario_id, grupo_id, empresa_id) VALUES (' + usuario_id + ', ' + grupo_id + ', ' + empresa_id + ')'
            con.query(sql, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });

        });
    }

    static getGrupos() {
        return new Promise(async (resolve, reject) => {
            try {
                let usuarios = [];
                let dados = [];
                let users = await UsuarioGrupo.select()
                let grupos = await Grupo.select()
                
                const map = grupos.map(async (grupo) => {
                    let group_users = [];
                    let usuarios_do_grupo = await UsuarioGrupo.selectGroup(grupo.id)

                    const map2 = usuarios_do_grupo.map(async (usuario) => {
                        let user = await Usuario.selectId(usuario.usuario_id)
                        group_users.push({id: user.id, nome: user.nome })
                    })
                    
                    await Promise.all(map2);
                    dados.push({
                        id: grupo.id,
                        nome: grupo.nome,
                        descricao: grupo.descricao,
                        status: grupo.status,
                        usuarios: group_users,
                    })
                })

                const map3 = users.map( async (user) =>{
                    let us = await Usuario.selectId(user.usuario_id)
                    usuarios.push({id: us.id, nome: us.nome})
                })

                await Promise.all(map3)
                await Promise.all(map)
        
                resolve({
                    dados, 
                    usuarios
                })
            } catch (error) {
                reject(error)
            }
        });
    }

    static deleteGruposUsuario(usuario_id) {
        return new Promise((resolve, reject) => {
            const sql = "delete from usuario_grupo WHERE `usuario_id`='" + usuario_id + "';";
            con.query(sql, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static updateProfile(data) {
        return new Promise(async (resolve, reject) => {
            try {
                var caminho
                if (data.avatar && data.avatar.base64) {
                    caminho = "usuarios/" + data.id + "/" + data.avatar.path
                    if (data.url_avatar && data.url_avatar !== '') {
                        if (await GoogleCloudStorage.verificaArquivo(data.url_avatar)) {
                            await GoogleCloudStorage.delete(data.url_avatar)
                        }
                    }
                    await GoogleCloudStorage.upload(data.avatar.base64, caminho)
                } else {
                    caminho = data.url_avatar
                }

                const sql = sqlUtils.generate_update_query({
                    id: data.id,
                    nome: data.nome,
                    email: data.email,
                    data_nascimento: data.data_nascimento,
                    celular: data.celular,
                    url_avatar: caminho
                }, "usuario");

                con.query(sql, async (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        const usuario = await Usuario.userForSession(data.id)
                        resolve(usuario);
                    }
                });

            } catch (error) {
                reject(error)
            }

        })
    }

    static updatePassword(data) {
        return new Promise((resolve, reject) => {
            const sql = sqlUtils.generate_update_query(data, "usuario");
            con.query(sql, async (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static getPostsUsuario(usuario_id) {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM post where usuario_id = " + usuario_id + " order by data desc"
            con.query(sql, async (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static getPostsComentarioUsuario(usuario_id) {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM post_comentario where usuario_id = " + usuario_id + " order by data desc"
            con.query(sql, async (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static getPostsLikeUsuario(usuario_id) {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM post_like where usuario_id = " + usuario_id + " order by data desc"
            con.query(sql, async (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static async userForSession(userId) {
        try {
            const usuario = await Usuario.selectId(userId)
            const papeis = await Usuario.getPapeisUser(userId)
            const grupos = await Usuario.getGruposUser(userId)
            usuario.papeis = papeis.map((papel) => papel.papel_id)
            usuario.grupos = grupos.map((grupo) => grupo.grupo_id)
            usuario.empresa_id = 1
            if (usuario.url_avatar) {
                if (await GoogleCloudStorage.verificaArquivo(usuario.url_avatar)) {
                    usuario.avatar = await GoogleCloudStorage.getURLArquivo(usuario.url_avatar)
                }
            }
            return usuario;
        } catch (error) {
            throw error;
        }
    }

    static getPapeisUser(usuario_id) {
        return new Promise((resolve, reject) => {
            const sql = "select papel_id from usuario_papel where usuario_id = " + usuario_id + " group by papel_id"
            con.query(sql, async (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static getGruposUser(usuario_id) {
        return new Promise((resolve, reject) => {
            const sql = "select grupo_id from usuario_grupo where usuario_id = " + usuario_id + " group by grupo_id"
            con.query(sql, async (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static simpleUpdate(data) {
        return new Promise((resolve, reject) => {
            if (data.senha === '') {
                delete data.senha
            }
            const sql = sqlUtils.generate_update_query(data, "usuario");
            con.query(sql, async (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static update(data) {
        return new Promise((resolve, reject) => {
            var grupos = data.grupos
            delete data.grupos
            if (data.senha === '') {
                delete data.senha
            }
            const sql = sqlUtils.generate_update_query(data, "usuario");

            con.query(sql, async (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    await Usuario.deleteGruposUsuario(data.id)
                    await Usuario.insereGruposUsuario(grupos, data.id, 1)
                    resolve(rows);
                }
            });
        });
    }

    static async getByLogin(login) {
        try {
            const result = await sqlUtils.executeQuery(`select * from usuario where login = '${login}' and status = 'Ativo'`);
            return result[0] ?? null;
        } catch (error) {
            throw error;
        }
    }

    static async getUserByEmail(email) {
        try {
            const result = await sqlUtils.executeQuery(`SELECT * FROM usuario where email = '${email}'`);
            return result[0] ?? null;
        } catch (error) {
            throw error;
        }
    }

    static testip() {
        return new Promise((resolve, reject) => {
            try {
                https.get('https://test.api.scn.roxcode.io/stores/all', (resp) => {

                    // Um bloco de dados foi recebido.
                    resp.on('data', (chunk) => {
                        resolve(chunk)
                    });

                    // // Toda a resposta foi recebida. Exibir o resultado.
                    // resp.on('end', () => {
                    //     console.log(JSON.parse(data).explanation);
                    // });

                }).on("error", (err) => {
                    console.log("Error: " + err.message);
                    reject(error)
                });
            } catch (error) {
                reject(error)
            }
        })
    }
}