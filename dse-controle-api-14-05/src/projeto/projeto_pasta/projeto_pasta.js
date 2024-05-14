const con = require('../../../data_base');
const sqlUtils = require("../../utils/sqlUtils.js");
const GoogleCloudStorage = require('../../../google-cloud-storage')
const ProjetoDocumento = require('../projeto_documento/projeto_documento')
const PastaAtributo = require('../../pasta/pasta_atributo/pasta_atributo')
const CategoriaTemAtributo = require('../../categoria_atributo/categoria_tem_atributo/categoria_tem_atributo')
const PastaDocumentoNome = require('../../pasta/pasta_documento_nome/pasta_documento_nome')
class ProjetoPasta {

    /**
     * @param {string[]} fields[] campos a serem consultados
     * @param {object[]} target[] array de obejetos que conte nome do campo (name) e valor a ser consultado(value)
     * @returns {Promise}  que vai resolver em rows e fields   
     **/
    static select(fields = null, targets = null) {
        const sql = sqlUtils.generate_select_query(targets, fields, "projeto_pasta");
        const sql2 = sql + ' order by nome';
        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql2, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows, fields);
                }
            });
        });
    }

    static selectById(pasta_id) {
        const sql = "select * from projeto_pasta where id=" + pasta_id

        return new Promise(function (resolve, reject) {
            try {
                con.query(sql, function (err, rows, fields) {
                    if (err) {
                        reject(err);
                    } else {
                        if (rows.length > 0) {
                            resolve(rows[0]);
                        } else {
                            resolve(false)
                        }
                    }
                });

            } catch (error) {
                reject(error)
            }
        });
    }

    static selectPaisProjeto(id) {
        const sql = 'SELECT * FROM projeto_pasta where projeto_id = ' + id + ' and id = pai_id and status = "Ativo" order by nome'

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

    static selectCaminhoPasta(pastaID) {
        return new Promise(async function (resolve, reject) {
            try {
                var caminho = []
                var paiID = pastaID
                do {
                    var pasta = await ProjetoPasta.getProjeto_pasta(paiID)
                    caminho.push(pasta)
                    paiID = pasta.pai_id
                } while (pasta.id != pasta.pai_id);

                resolve(caminho.reverse())

            } catch (error) {
                reject(error)
            }

        });
    }

    static getProjeto_pasta(pastaID) {
        const sql = 'SELECT * FROM projeto_pasta where id =' + pastaID

        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if (rows.length > 0) {
                        resolve(rows[0], fields);
                    } else {
                        resolve({}, fields);
                    }
                }
            });

        });
    }

    static selectPastaNomeProcesso(data) {

        const sql = `SELECT * FROM projeto_pasta where 
        pai_id = `+ data.projeto_pasta_id + ` and nome like (SELECT campos.valor FROM processo p 
        join processo_passo passo on p.id = passo.processo_id
        join processo_campos campos on campos.processo_campo_cadastro_id = `+ data.cadastro_nova_pasta_campo_id + ` and p.id = ` + data.processo_id + `
        and campos.processo_passo_id IN (select id from processo_passo where processo_id = `+ data.processo_id + `) and campos.processo_passo_id = 
        (select processo_passo_id from processo_campos where processo_campo_cadastro_id = `+ data.cadastro_nova_pasta_campo_id + ` order by id desc limit 1) limit 1)`

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

    static selectverificapasta(data) {
        const sql = `SELECT * FROM projeto_pasta where projeto_id = ` + data.projeto_id + ` and nome like '%` + data.nome + `%' and pai_id = ` + data.pai_id + ``

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

    static selectFilhosPasta(id) {
        const sql = 'SELECT * FROM projeto_pasta where pai_id = ' + id + ' and id != ' + id + ' and status = "Ativo"'
        return new Promise(function (resolve, reject) {
            try {
                con.query(sql, function (err, rows, fields) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows, fields);
                    }
                });              
            } catch (error) {
                reject(error)
            }
        });
    }

    static selectPastaProjetoTemplate(projeto_id, pasta_id) {
        const sql = 'select * from projeto_pasta where projeto_id = ' + projeto_id + ' and nome = (SELECT nome FROM pasta_cadastro where id = ' + pasta_id + ')'

        return new Promise(function (resolve, reject) {
            try {
                con.query(sql, function (err, rows, fields) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows, fields);
                    }
                });          
            } catch (error) {
                reject(error)
            }
        });
    }

    /**
     * 
     * @param {object} data contem os pares de campo e valor 
     * @returns {Promise}  que vai resolver em rows e fields
     */
    static insert(data) {
        const sql = sqlUtils.generate_insert_query(data, "projeto_pasta");

        return new Promise(function (resolve, reject) {
            try {
                con.query(sql, function (err, rows, fields) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows, fields);
                    }
                });
                
            } catch (error) {
                reject(error)
            }

        });
    }

    static cadastraPasta(data) {

        return new Promise(async function (resolve, reject) {
            if (data.pai_id && data.pai_id != 0) {

                if (await ProjetoPasta.verificaNomePasta(data.nome, 1, data.pai_id, data.projeto_id)) {
                    var pasta_pai = await ProjetoPasta.getProjeto_pasta(data.pai_id)

                    var result = await ProjetoPasta.insert({
                        nome: data.nome,
                        pai_id: data.pai_id,
                        timeline: 'nao',
                        status: 'Ativo',
                        projeto_id: data.projeto_id,
                        categoria_id: data.categoria_id,
                        herda_conf_nome: data.herda_conf_nome
                    })

                    var atributos = await PastaAtributo.selectAtributosPastaPai({
                        pasta_id: data.pai_id
                    })

                    const map = atributos.map(async (a) => {
                        var categoria_id = a.categoria_id
                        a.alvo_id = result.insertId
                        delete a.id
                        delete a.categoria_id
                        var patributo = await PastaAtributo.insert(a)

                        if (categoria_id && categoria_id != 'null') {

                            await CategoriaTemAtributo.insert({
                                categoria_id: categoria_id,
                                atributo_id: patributo.insertId,
                                pasta_id: result.insertId,
                                projeto_id: data.projeto_id
                            })

                        }
                    })

                    await Promise.all(map)

                    if (pasta_pai.herda_conf_nome === 1) {
                        var docNome = await PastaDocumentoNome.getPastaId(data.pai_id)


                        const map2 = docNome.map(async (nome) => {
                            delete nome.id
                            nome.pasta_id = result.insertId

                            if (nome.atributo_id && nome.atributo_id != 'null') {
                                var categoria = await ProjetoPasta.getCategoriaTemAtributo(nome.atributo_id)
                                var atrfilho = await PastaAtributo.selectAtributoFilho({
                                    pasta_id: result.insertId,
                                    atributo_id: nome.atributo_id,
                                    categoria_id: categoria ? categoria.categoria_id : null
                                })
                                if (atrfilho.length > 0) {
                                    nome.atributo_id = atrfilho[0].id
                                } else {
                                    delete nome.atributo_id
                                }
                            } else {
                                delete nome.atributo_id
                            }
                            await PastaDocumentoNome.insert(nome)
                        })

                        await Promise.all(map2)
                    }

                    resolve({ message: true, insertId: result.insertId })

                } else {
                    resolve({ message: 'Nome de pasta já existente neste diretório, favor tente novamente.' })
                }

            } else {

                if (await ProjetoPasta.verificaNomePasta(data.nome, 0, null, data.projeto_id)) {
                    var result = await ProjetoPasta.insert({
                        nome: data.nome,
                        timeline: 'nao',
                        status: 'Ativo',
                        projeto_id: data.projeto_id,
                        categoria_id: data.categoria_id,
                        herda_conf_nome: data.herda_conf_nome
                    })
                    await ProjetoPasta.update({
                        id: result.insertId,
                        pai_id: result.insertId
                    })
                    resolve({ message: true, insertId: result.insertId })
                } else {
                    resolve({ message: 'Nome de pasta já existente neste diretório, favor tente novamente.' })
                }

            }

        });
    }

    static verificaNomePasta(nome_pasta, nivel, pai_id, projeto_id) {
        var sql = ''
        if (nivel === 0) {
            sql = "SELECT * FROM projeto_pasta where nome = " + con.escape(nome_pasta) + " and id = pai_id and projeto_id = " + projeto_id;
        } else {
            sql = "SELECT * FROM projeto_pasta where nome = " + con.escape(nome_pasta) + " and id != pai_id and pai_id = " + pai_id + " and projeto_id = " + projeto_id;
        }

        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if (rows.length > 0) {
                        resolve(false)
                    } else {
                        resolve(true)
                    }
                }
            });

        });
    }

    static selectIdByNome(data) {
        const sql = "SELECT id FROM projeto_pasta where nome = " + con.escape(data.nome) + " and id != pai_id and pai_id = " + data.pai_id;

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
    static update(data) {
        const sql = sqlUtils.generate_update_query(data, "projeto_pasta");
        return new Promise(function (resolve, reject) {
            try {
                con.query(sql, async function (err, rows, fields) {
                    if (err) {
                        reject(err);
                    } else {
                        if(data.status === "Inativo"){
                            await ProjetoPasta.desativaDocumentosPasta(data.id)
                        }
                        resolve(rows, fields);
                    }
                });
            } catch (error) {
                reject(error)
            }
        });
    }

    static desativaDocumentosPasta(pastaId){
        return new Promise(async function (resolve, reject) {
            try {
                const documentos = await ProjetoPasta.getDocumentosPasta(pastaId)

                const map = documentos.map(async  (doc) => {
                    await ProjetoPasta.updateProjetoDocumento({
                        id: doc.id,
                        status: "Inativo"
                    })
                })

                await Promise.all(map)
                resolve(true)
            } catch (error) {
                reject(error)
            }
        });
    }

    static getDocumentosPasta(pastaId){
        const sql = "SELECT * FROM projeto_documento where projeto_diretorio_id = "+pastaId
        return new Promise(function (resolve, reject) {
            try {
                con.query(sql, async function (err, rows, fields) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows)
                    }
                });
            } catch (error) {
                reject(error)
            }
        });
    }

    static simpleSelectProjeto(id) {
        const sql = "select * from projeto_cadastro where id = " + id
        return new Promise(function (resolve, reject) {
            try {
                con.query(sql, async function (err, rows, fields) {
                    if (err) {
                        reject(err);
                    } else {
    
                        if (rows.length > 0) {
                            resolve(rows[0]);
                        } else {
                            resolve(false)
                        }
    
                    }
                });
            } catch (error) {
                reject(error)
            }
        });
    }

    static getArvoreFilhosEArquivos(data) {
        return new Promise(async function (resolve, reject) {
            const projeto = await ProjetoPasta.simpleSelectProjeto(data.id_projeto)
            const projetoProcesso = await ProjetoPasta.simpleSelectProjeto(data.id_projeto_processo)
            var pasta = await ProjetoPasta.selectById(data.id_folder)

            if (projeto && projeto.template == 1) {

                var pastaVerifica = await ProjetoPasta.verificaPastaByNomeEprojeto(pasta.nome, data.id_projeto_processo)

                if (pastaVerifica) {
                    var filhos = await ProjetoPasta.getArvoreFilhosEArquivosRecursivo(pastaVerifica.id)

                    pastaVerifica.nome_projeto = projetoProcesso.nome
                    pastaVerifica.arquivos = await ProjetoPasta.getArquivosPasta(pastaVerifica.id)
                    pastaVerifica.filhos = filhos
                    resolve([pastaVerifica])
                } else {
                    var filhos = [{ nome_projeto: projetoProcesso.nome }]
                    resolve(filhos)
                }
            } else {
                pasta.nome_projeto = projetoProcesso.nome
                pasta.arquivos = await ProjetoPasta.getArquivosPasta(pasta.id)
                pasta.filhos = await ProjetoPasta.getArvoreFilhosEArquivosRecursivo(data.id_folder)
                resolve([pasta])
            }
        })
    }

    static getArvoreFilhosEArquivosRecursivo(id_folder) {
        return new Promise(async function (resolve, reject) {
            var filhos = await ProjetoPasta.selectFilhosPasta(id_folder)

            const map = filhos.map(async (filho) => {
                filho.arquivos = await ProjetoPasta.getArquivosPasta(filho.id)
                var result = await ProjetoPasta.getArvoreFilhosEArquivosRecursivo(filho.id)
                if (result.length > 0) {
                    filho.filhos = result
                }
            })

            await Promise.all(map)

            resolve(filhos)
        })
    }

    static getArquivosPasta(pasta_id) {
        const sql = "SELECT * FROM projeto_documento where projeto_diretorio_id = " + pasta_id + " and status = 'Ativo'"

        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static getArvoreDeFilhosRecursiva(id) {
        return new Promise(async function (resolve, reject) {
            var filhos = await ProjetoPasta.selectFilhosPasta(id)

            const map = filhos.map(async (filho) => {
                var result = await ProjetoPasta.getArvoreDeFilhosRecursiva(filho.id)
                if (result.length > 0) {
                    filhos = filhos.concat(result)
                }
            })

            await Promise.all(map)

            resolve(filhos)

        });
    }

    static cadastraProjetoComBaseEmTemplate(data) {
        return new Promise(async function (resolve, reject) {
            try {
                var pastas = await ProjetoPasta.getPastas(data.template_id);

                const map = pastas.map(async (p) => {
                    var id_antigo = p.id;
                    delete p.id
                    p.projeto_id = data.projeto_id
                    var r = await ProjetoPasta.insert(p)
                    p.id = r.insertId
                    p.id_antigo = id_antigo
                    return p
                })

                await Promise.all(map)
                await ProjetoPasta.setaAtributosPasta(pastas)
                await ProjetoPasta.setaPastaDocumentoNome(pastas)
                await ProjetoPasta.setaPermissoes(pastas)
                await ProjetoPasta.copiaDocumentos(pastas)
                await ProjetoPasta.editaPastas(pastas)

                resolve()

            } catch (error) {
                reject(error)
            }
        })
    }

    static getPastas(id) {
        const sql = "SELECT * FROM projeto_pasta where projeto_id = " + id
        return new Promise(function (resolve, reject) {
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows, fields);
                }
            });
        });
    }

    static verificaNumero(n) {
        const numero = parseInt(n)
        if (numero < 10) {
            return "0" + n
        } else {
            return n
        }
    }

    static copiaDocumentos(pastas) {
        return new Promise(async function (resolve, reject) {
            try {
                const map = pastas.map(async (p) => {
                    var documentos = await ProjetoPasta.getProjetoDocumento(p.id_antigo)
                    const map2 = documentos.map(async (d) => {
                        try {
                            delete d.id
                            d.projeto_diretorio_id = p.id
                            d.projeto_id = p.projeto_id
                            var novo_doc = await ProjetoPasta.insertProjetoDocumento(d)
                            var url_antiga = d.url
                            var array = d.url.split('/')
                            array.splice(0, 1);
                            d.url = novo_doc.insertId + "/" + array.join("");
                            d.id = novo_doc.insertId
                            var novaData = new Date(d.data);
                            d.data = novaData.getFullYear() + "-" + ProjetoPasta.verificaNumero(novaData.getMonth()) + "-" + ProjetoPasta.verificaNumero(novaData.getDay())
                            await ProjetoPasta.updateProjetoDocumento(d)
                            var caminhoOrigem = 'documentos/' + url_antiga
                            var caminhoDestino = 'documentos/' + d.url
                            await GoogleCloudStorage.copia(caminhoOrigem, caminhoDestino)
                        } catch (error) {
                            console.log("Erro ao copiar arquivo para novo projeto")
                        }
                    })
                    await Promise.all(map2)
                    await ProjetoDocumento.renomeiaArquivos(p.id)
                })
                await Promise.all(map)
                resolve()
            } catch (error) {
                reject(error)
            }
        })
    }

    static updateProjetoDocumento(data) {
        const sql = sqlUtils.generate_update_query(data, "projeto_documento");
        return new Promise(function (resolve, reject) {

            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows, fields);
                }
            });
        });
    }

    static insertProjetoDocumento(data) {
        const sql = sqlUtils.generate_insert_query(data, "projeto_documento");

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

    static getProjetoDocumento(pasta_id) {
        const sql = "SELECT * FROM projeto_documento where projeto_diretorio_id = " + pasta_id + " and status = 'Ativo'"
        return new Promise(function (resolve, reject) {
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows)
                }
            });
        });
    }

    static setaPermissoes(pastas) {
        return new Promise(async function (resolve, reject) {
            const map = pastas.map(async (p) => {
                var permissao = await ProjetoPasta.getPermissao(p.id_antigo)
                const map2 = permissao.map(async (per) => {
                    delete per.id
                    per.area_id = p.id
                    per.pai_id = p.projeto_id
                    await ProjetoPasta.insertPermissao(per)
                })

                await Promise.all(map2)
            })

            await Promise.all(map)
            resolve()
        })
    }

    static insertPermissao(data) {
        const sql = sqlUtils.generate_insert_query(data, "permissao");

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

    static getPermissao(pasta_id) {
        const sql = "select * from permissao where area = 'projeto_pasta' and status='Ativo' and area_id = " + pasta_id
        return new Promise(function (resolve, reject) {
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows)
                }
            });
        });
    }

    static setaPastaDocumentoNome(pastas) {
        return new Promise(async function (resolve, reject) {
            const map = pastas.map(async (p) => {
                var nomes = await ProjetoPasta.getPastaDocumentoNome(p.id_antigo)
                const map2 = nomes.map(async (n) => {
                    delete n.id
                    n.pasta_id = p.id
                    n.projeto_id = p.projeto_id
                    if (n.atributo_id && n.atributo_id != 'null') {
                        n.atributo_id = await ProjetoPasta.getNovoAtributoId(n.atributo_id, p.id)
                    } else {
                        delete n.atributo_id
                    }
                    if (n.pasta_documento_nome_tipo_id == 1) {
                        n.valor = await ProjetoPasta.getPrefixoProjeto(p.projeto_id)
                    }
                    await ProjetoPasta.insertPastaDocumentoNome(n)
                })
                await Promise.all(map2)
            })
            await Promise.all(map)
            resolve()
        })
    }

    static getPrefixoProjeto(projeto_id) {
        const sql = "SELECT * FROM projeto_cadastro where id = " + projeto_id
        return new Promise(function (resolve, reject) {
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if (rows.length > 0) {
                        resolve(rows[0].prefixo)
                    } else {
                        resolve(null)
                    }
                }
            });
        });
    }

    static getNovoAtributoId(atributo_id, pasta_id) {
        const sql = "SELECT * FROM pasta_atributo where atributo = (SELECT atributo FROM pasta_atributo where id = " + atributo_id + ") and alvo_id = " + pasta_id
        return new Promise(function (resolve, reject) {
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if (rows.length > 0) {
                        resolve(rows[0].id)
                    } else {
                        resolve(null)
                    }
                }
            });
        });
    }

    static getPastaDocumentoNome(pasta_id) {
        const sql = "SELECT * FROM pasta_documento_nome where pasta_id = " + pasta_id
        return new Promise(function (resolve, reject) {
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows, fields);
                }
            });
        });
    }

    static insertPastaDocumentoNome(data) {
        const sql = sqlUtils.generate_insert_query(data, "pasta_documento_nome");

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

    static setaAtributosPasta(pastas) {
        return new Promise(async function (resolve, reject) {
            const map = pastas.map(async (p) => {
                var atributos = await ProjetoPasta.getPastaAtributos(p.id_antigo)
                const map2 = atributos.map(async (a) => {
                    var id_antigo = a.id
                    a.alvo_id = p.id
                    delete a.id
                    var c = await ProjetoPasta.insertAtributo(a)
                    var cat = await ProjetoPasta.getCategoriaTemAtributo(id_antigo)
                    if (cat) {
                        delete cat.id
                        cat.atributo_id = c.insertId
                        cat.pasta_id = p.id
                        cat.projeto_id = p.projeto_id
                        await ProjetoPasta.insertCategoriaTemAtributo(cat)
                    }
                })
                await Promise.all(map2)
            })

            await Promise.all(map)
            resolve()
        })
    }

    static insertCategoriaTemAtributo(data) {
        const sql = sqlUtils.generate_insert_query(data, "categoria_tem_atributo");

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

    static getCategoriaTemAtributo(atributo_id) {
        const sql = "SELECT * FROM categoria_tem_atributo where atributo_id = " + atributo_id
        return new Promise(function (resolve, reject) {
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if (rows.length > 0) {
                        resolve(rows[0])
                    } else {
                        resolve(false)
                    }
                }
            });
        });
    }

    static getPastaAtributos(pasta_id) {
        const sql = "SELECT * FROM pasta_atributo where alvo = 'projeto_pasta' and alvo_id = " + pasta_id
        return new Promise(function (resolve, reject) {
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows, fields);
                }
            });
        });
    }

    static insertAtributo(data) {
        const sql = sqlUtils.generate_insert_query(data, "pasta_atributo");

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

    static editaPastas(pastas) {
        return new Promise(async function (resolve, reject) {
            const map = pastas.map(async (p) => {
                p.pai_id = await ProjetoPasta.achaIdAntigoPastas(pastas, p.pai_id)
                delete p.id_antigo;
                await ProjetoPasta.update(p)
            })

            await Promise.all(map)
            resolve()
        })
    }

    static achaIdAntigoPastas(pastas, pai_id) {
        return new Promise(async function (resolve, reject) {
            pastas.map((p) => {
                if (p.id_antigo == pai_id) {
                    resolve(p.id)
                }
            })
        })
    }

    static getPastasGed(data) {

        var where = "";

        if (data.categoria_id) {
            where += " and categoria_id = " + data.categoria_id
        }

        if (data.status) {
            where += " and status = '" + data.status + "' "
        } else {
            where += " and status IN ('Ativo', 'Inativo') "
        }

        if (data.pai_id) {
            where += " and pai_id = " + data.pai_id + " and id != pai_id"
        } else {
            where += " and pai_id = id "
        }

        const sql = "SELECT * FROM projeto_pasta where projeto_id = " + data.projeto_id + " " + where + " order by nome"

        return new Promise(function (resolve, reject) {
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    const map = rows.map(async (r) => {
                        r.permissao = await ProjetoPasta.getPastaPermissoes(r.id)
                    })

                    await Promise.all(map)
                    resolve(rows, fields);
                }
            });
        });
    }

    static movePasta(data) {

        return new Promise(async function (resolve, reject) {
            var pasta = await ProjetoPasta.selectById(data.pasta_id)
            if (pasta && pasta.categoria_id != data.categoria_id) {

                if (pasta.id !== pasta.pai_id) {
                    await ProjetoPasta.update({
                        id: data.pasta_id,
                        pai_id: data.pasta_id,
                        categoria_id: data.categoria_id
                    })
                } else {
                    await ProjetoPasta.update({
                        id: data.pasta_id,
                        categoria_id: data.categoria_id
                    })
                }

                var filhas = await ProjetoPasta.getArvoreDeFilhosRecursiva(data.pasta_id)

                filhas.map(async (filha) => {
                    await ProjetoPasta.update({
                        id: filha.id,
                        categoria_id: data.categoria_id
                    })
                })

                resolve(true)
            } else {
                resolve(false)
            }

        });
    }

    static getPastaPermissoes(pasta_id) {
        const sql = "SELECT * FROM permissao where area = 'projeto_pasta' and area_id = " + pasta_id
        return new Promise(function (resolve, reject) {
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows, fields);
                }
            });
        });
    }

    static verificaeCriaPastaByNome(projeto_final, pasta_id) {
        return new Promise(async function (resolve, reject) {
            try {
                const pasta = await ProjetoPasta.selectById(pasta_id)

                const pastaVerifica = await ProjetoPasta.verificaPastaByNomeEprojeto(pasta.nome, projeto_final)
                if (pastaVerifica) {
                    resolve(pastaVerifica.id)
                } else {
                    var result = await ProjetoPasta.insert({ // insere a pasta
                        nome: pasta.nome,
                        timeline: 'nao',
                        status: 'Ativo',
                        projeto_id: projeto_final,
                        categoria_id: pasta.categoria_id,
                        herda_conf_nome: pasta.herda_conf_nome
                    })
                    await ProjetoPasta.update({
                        id: result.insertId,
                        pai_id: result.insertId
                    })
                    var atributos = await PastaAtributo.selectAtributosPastaPai({
                        pasta_id: pasta_id
                    })

                    const map = atributos.map(async (a) => { // insere os atributos com base na pasta do template
                        var categoria_id = a.categoria_id
                        a.alvo_id = result.insertId
                        delete a.id
                        delete a.categoria_id
                        var patributo = await PastaAtributo.insert(a)

                        if (categoria_id && categoria_id != 'null') {
                            await CategoriaTemAtributo.insert({
                                categoria_id: categoria_id,
                                atributo_id: patributo.insertId,
                                pasta_id: result.insertId,
                                projeto_id: projeto_final
                            })
                        }
                    })

                    await Promise.all(map)
                    resolve(result.insertId)
                }

            } catch (error) {
                reject(error)
            }



        })
    }

    static verificaPastaByNomeEprojeto(nome, projeto_id) {
        const sql = "SELECT * FROM projeto_pasta where nome = '" + nome + "' and projeto_id = " + projeto_id + " and status = 'Ativo' limit 1"
        return new Promise(function (resolve, reject) {
            try {
                con.query(sql, function (err, rows, fields) {
                    if (err) {
                        reject(err);
                    } else {
                        if (rows.length > 0) {
                            resolve(rows[0])
                        } else {
                            resolve(false)
                        }
                    }
                });

            } catch (error) {
                reject(error)
            }
        });
    }

}
module.exports = ProjetoPasta;